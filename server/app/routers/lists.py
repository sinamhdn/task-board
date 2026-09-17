import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.orm import selectinload

from ..models.boards import Board
from ..models.lists import List
from ..models.users import User
from ..schemas.boards import BoardCreate, BoardMemberAdd, BoardResponse
from ..schemas.list import ListResponse
from ..schemas.users import UserPublicResponse
from ..utils.auth import CurrentUser
from ..utils.db import AsyncSession, get_async_db_session
from ..utils.utilities import get_order_column
from ..utils.ws import manager

logger = logging.getLogger(f"List router logger: Filename->{__name__}")

router = APIRouter(prefix="", tags=["lists"])


@router.get("", response_model=list[ListResponse])
async def get_all_owned_lists(
    current_user: CurrentUser,
    board_id:int,
    db: Annotated[AsyncSession, Depends(get_async_db_session)],
    order: str = "updated_at",
    skip: int = 0,
    limit: int = 100,
):
    board_query = await db.execute(select(Board).options(selectinload(Board.owner), selectinload(Board.members)).where(Board.id == board_id))
    board = board_query.scalars().first()
    if not board:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "field": "server_error",
                    "msg": "Board not found.",
                },
            )
    if not current_user and not current_user in board.members:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "field": "server_error",
                "msg": "Not authorized to see these boards please login.",
            },
        )
    db_query = await db.execute(
        select(List)
        .options(selectinload(List.owned_cards))
        .order_by(get_order_column(List, order))
        .offset(skip)
        .limit(limit)
        .where(List.board_id == board_id)
    )
    return list(db_query.scalars().all())


@router.get("/{board_id}", response_model=BoardResponse)
async def get_board_by_id(
    board_id: int,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_async_db_session)],
):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "field": "server_error",
                "msg": "Not authorized to see this board please login.",
            },
        )

    query_db = await db.execute(
        select(Board)
        .options(selectinload(Board.owner), selectinload(Board.members))
        .where(Board.id == board_id)
    )
    board = query_db.scalars().first()
    if board:
        return board
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail={"field": "server_error", "msg": "Board not found."},
    )


@router.post("", response_model=BoardResponse, status_code=status.HTTP_201_CREATED)
async def create_owned_board(
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_async_db_session)],
    board: BoardCreate,
):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "field": "server_error",
                "msg": "Not authorized to see these boards please login.",
            },
        )

    new_board = Board(name=board.board_name, user_id=current_user.id)
    new_board.members.append(current_user)
    db.add(new_board)
    await db.commit()
    await db.refresh(new_board, attribute_names=["owner"])
    return new_board


@router.patch("/{board_id}", response_model=BoardResponse)
async def update_owned_board(
    board_id: int,
    board_data: BoardCreate,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_async_db_session)],
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
    update_board = board_data.model_dump(exclude_unset=True)
    for field, value in update_board.items():
        if field == "board_name":
            field = "name"
        setattr(board, field, value)
    await db.commit()
    await db.refresh(board, attribute_names=["owner"])
    return board


@router.delete("/{board_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_board(
    board_id: int,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_async_db_session)],
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
        if member.id in manager.active_connections:
            for websocket in manager.channels[channel_name]:
                member_data = UserPublicResponse.model_validate(member).model_dump(
                    mode="json"
                )
                await manager.broadcast_channel(
                    channel=channel_name,
                    websocket=websocket,
                    message={
                        "event": "board_removed",
                        "member_data": member_data,
                        "board_data": board_data,
                    },
                    user_id=member.id,
                )
            for connection in manager.active_connections[member.id]:
                if channel_name in manager.channels:
                    manager.channels[channel_name].discard(connection)
                if not manager.channels[channel_name]:
                    manager.channels.pop(channel_name)


@router.post(
    "/{board_id}/add-member",
    response_model=UserPublicResponse,
    status_code=status.HTTP_200_OK,
)
async def add_new_board_member(
    board_id: int,
    board_member_data: BoardMemberAdd,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_async_db_session)],
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
    user_data = UserPublicResponse.model_validate(user).model_dump(mode="json")
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
            await manager.broadcast_channel(
                channel=channel_name,
                websocket=websocket,
                message={
                    "event": "member_added",
                    "member_data": user_data,
                    "board_data": board_data,
                },
                user_id=user.id,
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
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_async_db_session)],
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
                "msg": "Board member not exists.",
            },
        )

    user_data = UserPublicResponse.model_validate(user).model_dump(mode="json")
    board_data = BoardResponse.model_validate(board).model_dump(mode="json")
    channel_name = f"users:{user.id}"
    if user.id in manager.active_connections:
        for websocket in manager.channels[channel_name]:
            await manager.broadcast_channel(
                channel=channel_name,
                websocket=websocket,
                message={
                    "event": "member_removed",
                    "member_data": user_data,
                    "board_data": board_data,
                },
                user_id=user.id,
            )
        for connection in manager.active_connections[user.id]:
            if channel_name in manager.channels:
                manager.channels[channel_name].discard(connection)
            if not manager.channels[channel_name]:
                manager.channels.pop(channel_name)

    board.members.remove(user)
    await db.commit()
    await db.refresh(board, attribute_names=["owner"])

    return user
