import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.orm import selectinload

from ..models.boards import Board
from ..models.lists import List
from ..models.users import User
from ..schemas.boards import BoardCreate, BoardMemberAdd, BoardResponse
from ..schemas.list import ListCreate, ListResponse
from ..schemas.users import UserPublicResponse
from ..utils.auth import CurrentUser
from ..utils.db import AsyncSession, get_async_db_session
from ..utils.utilities import get_order_column
from ..utils.ws import manager

logger = logging.getLogger(f"List router logger: Filename->{__name__}")

router = APIRouter(prefix="", tags=["lists"])


@router.get("", response_model=list[ListResponse])
async def get_all_lists(
    current_user: CurrentUser,
    board_id: int,
    db: Annotated[AsyncSession, Depends(get_async_db_session)],
    order: str = "updated_at",
    skip: int = 0,
    limit: int = 100,
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
    if not current_user and (
        not current_user in board.members or current_user != board.user_id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "field": "server_error",
                "msg": "Not authorized please login.",
            },
        )
    list_query = await db.execute(
        select(List)
        .options(selectinload(List.owned_cards))
        .order_by(get_order_column(List, order))
        .offset(skip)
        .limit(limit)
        .where(List.board_id == board_id)
    )
    lists_inside_board = list_query.scalars().all()
    if not lists_inside_board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "field": "server_error",
                "msg": "no list item found.",
            },
        )
    return list(lists_inside_board)


@router.get("/{list_id}", response_model=ListResponse)
async def get_list_by_id(
    list_id: int,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_async_db_session)],
):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "field": "server_error",
                "msg": "Not authorized to see this list please login.",
            },
        )
    list_query = await db.execute(
        select(List).options(selectinload(List.owned_cards)).where(List.id == list_id)
    )
    list_in_board = list_query.scalars().first()
    if not list_in_board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"field": "server_error", "msg": "List not found."},
        )
    return list


@router.post("", response_model=ListResponse, status_code=status.HTTP_201_CREATED)
async def create_new_list(
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_async_db_session)],
    board_id: int,
    list_data: ListCreate,
):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "field": "server_error",
                "msg": "Not authorized to see these boards please login.",
            },
        )
    if not hasattr(list_data, "list_name"):
        raise HTTPException(
            status_code=status.HTTP_405_METHOD_NOT_ALLOWED,
            detail={
                "field": "server_error",
                "msg": "Pass the correct board data to create a new board.",
            },
        )
    new_list = List(name=list_data.list_name, board_id=board_id)
    db.add(new_list)
    await db.commit()
    await db.refresh(new_list, attribute_names=["owner", "owned_cards"])
    return new_list


@router.patch("/{list_id}", response_model=ListResponse)
async def update_owned_board(
    board_id: int,
    list_data: BoardCreate,
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
