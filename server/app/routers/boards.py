import logging
from dataclasses import field
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.orm import selectinload

# from ..models import boards, members
from ..models.boards import Board
from ..models.users import User
from ..schemas.boards import BoardCreateRequest, BoardMemberAddRequest, BoardResponse
from ..schemas.users import UserPublicResponse
from ..utils.auth import AnnotatedCurrentUser
from ..utils.db import (
    AnnotatedAsyncDBSession,
    AsyncSession,
    get_async_db_session,
    get_order_column,
)
from ..utils.ws import manager

logger = logging.getLogger(f"Board router logger: Filename->{__name__}")

router = APIRouter(prefix="", tags=["boards"])


@router.get("", response_model=list[BoardResponse])
async def get_all_owned_boards(
    current_user: AnnotatedCurrentUser,
    db: AnnotatedAsyncDBSession,
    order: str = "updated_at",
    skip: int = 0,
    limit: int = 100,
):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "field": "server_error",
                "msg": "Not authorized to see these boards please login.",
            },
        )
    boards_query = await db.execute(
        select(Board)
        .options(selectinload(Board.members))
        .order_by(get_order_column(Board, order))
        .offset(skip)
        .limit(limit)
        .where(or_(Board.id == current_user.id, Board.members.any(id=current_user.id)))
    )
    boards = boards_query.scalars().all()
    return list(boards)


@router.get("/{board_id}", response_model=BoardResponse)
async def get_board_by_id(
    board_id: int,
    current_user: AnnotatedCurrentUser,
    db: AnnotatedAsyncDBSession,
):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "field": "server_error",
                "msg": "Not authorized to see this board please login.",
            },
        )
    board_query = await db.execute(
        select(Board)
        .options(selectinload(Board.owner), selectinload(Board.members))
        .where(Board.id == board_id)
    )
    board = board_query.scalars().first()
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"field": "server_error", "msg": "Board not found."},
        )
    return board


@router.post("", response_model=BoardResponse, status_code=status.HTTP_201_CREATED)
async def create_owned_board(
    current_user: AnnotatedCurrentUser,
    db: AnnotatedAsyncDBSession,
    board_data: BoardCreateRequest,
):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "field": "server_error",
                "msg": "Not authorized to see these boards please login.",
            },
        )
    if not board_data or not hasattr(board_data, "board_name"):
        raise HTTPException(
            status_code=status.HTTP_405_METHOD_NOT_ALLOWED,
            detail={
                "field": "server_error",
                "msg": "Pass the correct board data to create a new board.",
            },
        )
    new_board = Board(name=board_data.board_name, user_id=current_user.id)
    new_board.members.append(current_user)
    db.add(new_board)
    await db.commit()
    await db.refresh(new_board, attribute_names=["owner"])
    return new_board


@router.patch("/{board_id}", response_model=BoardResponse)
async def update_owned_board(
    board_id: int,
    board_update_data: BoardCreateRequest,
    current_user: AnnotatedCurrentUser,
    db: AnnotatedAsyncDBSession,
):
    query_db = await db.execute(
        select(Board).options(selectinload(Board.members)).where(Board.id == board_id)
    )
    board = query_db.scalars().first()
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "field": "server_error",
                "msg": "Board not found.",
            },
        )
    if board.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "field": "server_error",
                "msg": "Not authorized to update this board.",
            },
        )
    update_board = board_update_data.model_dump(exclude_unset=True)
    for field, value in update_board.items():
        if field == "board_name":
            field = "name"
        setattr(board, field, value)
    await db.commit()
    await db.refresh(board, attribute_names=["owner"])
    board_data = BoardResponse.model_validate(board).model_dump(mode="json")
    channel_name = f"boards:{board.id}"
    if channel_name in manager.channels:
        for websocket in manager.channels[channel_name]:
            await manager.send_personal_message(
                websocket=websocket,
                message={
                    "event": "board_updated",
                    "data": board_data,
                },
            )
    return board


@router.delete("/{board_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_board(
    board_id: int,
    current_user: AnnotatedCurrentUser,
    db: AnnotatedAsyncDBSession,
):
    query_db = await db.execute(select(Board).where(Board.id == board_id))
    board = query_db.scalars().first()
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "field": "server_error",
                "msg": "Board not found",
            },
        )
    if board.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "field": "server_error",
                "msg": "Not authorized to delete this post",
            },
        )
    await db.delete(board)
    await db.commit()
    board_data = BoardResponse.model_validate(board).model_dump(mode="json")
    channel_name = f"boards:{board.id}"
    for member in board.members:
        if member.id in manager.active_connections and channel_name in manager.channels:
            for websocket in manager.channels[channel_name]:
                # member_data = UserPublicResponse.model_validate(member).model_dump(
                #     mode="json"
                # )
                await manager.send_personal_message(
                    websocket=websocket,
                    message={
                        "event": "board_removed",
                        "data": board_data,
                    },
                )
            for connection in manager.active_connections[member.id]:
                if channel_name in manager.channels:
                    manager.channels[channel_name].discard(connection)
                    if not manager.channels[channel_name]:
                        manager.channels.pop(channel_name)


@router.get(
    "/{board_id}/members",
    response_model=list[UserPublicResponse],
    status_code=status.HTTP_200_OK,
)
async def get_all_board_members(
    board_id: int,
    current_user: AnnotatedCurrentUser,
    db: AnnotatedAsyncDBSession,
):
    board_db_query = await db.execute(
        select(Board).options(selectinload(Board.members)).where(Board.id == board_id)
    )
    board = board_db_query.scalars().first()
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "field": "server_error",
                "msg": "Board not found",
            },
        )
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "field": "server_error",
                "msg": "Not authorized to get board members please login.",
            },
        )
    if current_user not in board.members or current_user.id != board.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "field": "server_error",
                "msg": "Not authorized to get board members.",
            },
        )
    return board.members


@router.get(
    "/{board_id}/members/{member_id}",
    response_model=UserPublicResponse,
    status_code=status.HTTP_200_OK,
)
async def get_board_member_by_id(
    board_id: int,
    member_id: int,
    current_user: AnnotatedCurrentUser,
    db: AnnotatedAsyncDBSession,
):
    board_db_query = await db.execute(
        select(Board).options(selectinload(Board.members)).where(Board.id == board_id)
    )
    board = board_db_query.scalars().first()
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "field": "server_error",
                "msg": "Board not found",
            },
        )
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "field": "server_error",
                "msg": "Not authorized to get this board member please login.",
            },
        )
    if current_user not in board.members or current_user.id != board.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "field": "server_error",
                "msg": "Not authorized to get this board member.",
            },
        )
    for member in board.members:
        if member.id == member_id:
            return member
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail={
            "field": "server_error",
            "msg": "No member found with this id.",
        },
    )


@router.post(
    "/{board_id}/add-member",
    response_model=UserPublicResponse,
    status_code=status.HTTP_200_OK,
)
async def add_new_board_member(
    board_id: int,
    board_member_data: BoardMemberAddRequest,
    current_user: AnnotatedCurrentUser,
    db: AnnotatedAsyncDBSession,
):
    board_db_query = await db.execute(
        select(Board).options(selectinload(Board.members)).where(Board.id == board_id)
    )
    board = board_db_query.scalars().first()
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "field": "server_error",
                "msg": "Board not found",
            },
        )
    if board_member_data.board_member_email == current_user.email:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "field": "server_error",
                "msg": "You can't add current user to members.",
            },
        )
    user_db_query = await db.execute(
        select(User).where(User.email == board_member_data.board_member_email)
    )
    user = user_db_query.scalars().first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"field": "server_error", "msg": "User not found."},
        )
    board_members_email_list = [x.email for x in board.members]
    if board_member_data.board_member_email in board_members_email_list:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "field": "server_error",
                "msg": "Board member already exists.",
            },
        )
    if len(board_members_email_list) > 4:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "field": "server_error",
                "msg": "You can't add more than 4 members to a board.",
            },
        )
    board.members.append(user)
    await db.commit()
    await db.refresh(board, attribute_names=["owner"])
    # add new added member to board channel if they are online
    # user_data = {
    #     field: getattr(user, field) for field in UserPublicResponse.model_fields.keys()
    # }
    # board_data = {
    #     field: getattr(board, field) for field in BoardResponse.model_fields.keys()
    # }
    # fix serlization problem
    # user_data = UserPublicResponse.model_validate(user).model_dump(mode="json")
    board_data = BoardResponse.model_validate(board).model_dump(mode="json")
    channel_name = f"boards:{board.id}"
    if user.id in manager.active_connections:
        for connection in manager.active_connections[user.id]:
            if channel_name in manager.channels:
                manager.channels[channel_name].add(connection)
            else:
                manager.channels[channel_name] = set()
                manager.channels[channel_name].add(connection)
        for websocket in manager.channels[channel_name]:
            await manager.send_personal_message(
                websocket=websocket,
                message={
                    "event": "member_added",
                    "data": board_data,
                },
            )
    else:
        logger.info("Member is not online.")
    return user


@router.delete(
    "/{board_id}/delete-member",
    response_model=UserPublicResponse,
    status_code=status.HTTP_200_OK,
)
async def delete_board_member(
    board_id: int,
    member_id: int,
    current_user: AnnotatedCurrentUser,
    db: AnnotatedAsyncDBSession,
):
    board_db_query = await db.execute(
        select(Board).options(selectinload(Board.members)).where(Board.id == board_id)
    )
    board = board_db_query.scalars().first()
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "field": "server_error",
                "msg": "Board not found.",
            },
        )
    if member_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "field": "server_error",
                "msg": "You cannot remove yourself from the board.",
            },
        )
    user_db_query = await db.execute(select(User).where(User.id == member_id))
    user = user_db_query.scalars().first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"field": "server_error", "msg": "User not found."},
        )
    board_members_id_list = [x.id for x in board.members]
    if member_id not in board_members_id_list:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "field": "server_error",
                "msg": "Board member does not exist.",
            },
        )
    board.members.remove(user)
    await db.commit()
    # user_data = UserPublicResponse.model_validate(user).model_dump(mode="json")
    board_data = BoardResponse.model_validate(board).model_dump(mode="json")
    channel_name = f"users:{user.id}"
    if user.id in manager.active_connections and channel_name in manager.channels:
        for websocket in manager.channels[channel_name]:
            await manager.send_personal_message(
                websocket=websocket,
                message={
                    "event": "member_removed",
                    "data": board_data,
                },
            )
        for connection in manager.active_connections[user.id]:
            if channel_name in manager.channels:
                manager.channels[channel_name].discard(connection)
                if not manager.channels[channel_name]:
                    manager.channels.pop(channel_name)
    await db.refresh(board, attribute_names=["owner"])
    return user
