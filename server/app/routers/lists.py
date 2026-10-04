import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import exists, select
from sqlalchemy.orm import selectinload

from ..models.boards import Board
from ..models.lists import List
from ..schemas.list import ListCreate, ListResponse
from ..utils.auth import CurrentUser
from ..utils.db import AsyncSession, get_async_db_session, get_order_column
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
    board_query = await db.execute(
        select(Board).options(selectinload(Board.members)).where(Board.id == board_id)
    )
    board = board_query.scalars().first()
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "field": "server_error",
                "msg": "Board not found.",
            },
        )
    if not current_user and (
        current_user not in board.members or current_user != board.user_id
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
    board_id: int,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_async_db_session)],
):
    board_query = await db.execute(
        select(Board).options(selectinload(Board.members)).where(Board.id == board_id)
    )
    board = board_query.scalars().first()
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "field": "server_error",
                "msg": "Board not found.",
            },
        )
    if not current_user and (
        current_user not in board.members or current_user != board.user_id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "field": "server_error",
                "msg": "Not authorized please login.",
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
    board_exists_query = select(exists().select_from(Board).where(Board.id == board_id))
    board_exists = await db.scalar(board_exists_query)
    if not board_exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "field": "server_error",
                "msg": "Board not found.",
            },
        )
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
    channel_name = f"boards:{board_id}"
    list_data_validate = ListResponse.model_validate(new_list).model_dump(mode="json")
    if channel_name in manager.channels:
        for websocket in manager.channels[channel_name]:
            await manager.send_personal_message(
                websocket=websocket,
                message={
                    "event": "list_added",
                    "data": list_data_validate,
                },
            )
    return new_list


@router.patch("/{list_id}", response_model=ListResponse)
async def update_list(
    list_id: int,
    board_id: int,
    list_data: ListCreate,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_async_db_session)],
):
    board_query = await db.execute(
        select(Board).options(selectinload(Board.members)).where(Board.id == board_id)
    )
    board = board_query.scalars().first()
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "field": "server_error",
                "msg": "Board not found.",
            },
        )
    if not current_user and (
        current_user not in board.members or current_user != board.user_id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "field": "server_error",
                "msg": "Not authorized please login.",
            },
        )
    list_query = await db.execute(
        select(List).options(selectinload(List.owned_cards)).where(List.id == list_id)
    )
    list_in_board = list_query.scalars().first()
    if not list_in_board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "field": "server_error",
                "msg": "List not found.",
            },
        )
    update_list = list_data.model_dump(exclude_unset=True)
    for field, value in update_list.items():
        if field == "list_name":
            field = "name"
        setattr(list_in_board, field, value)
    await db.commit()
    await db.refresh(list_in_board, attribute_names=["owner"])
    channel_name = f"boards:{board_id}"
    list_data_validate = ListResponse.model_validate(list_in_board).model_dump(
        mode="json"
    )
    if channel_name in manager.channels:
        for websocket in manager.channels[channel_name]:
            await manager.send_personal_message(
                websocket=websocket,
                message={
                    "event": "list_updated",
                    "data": list_data_validate,
                },
            )
    return list_in_board


@router.delete("/{list_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_board(
    list_id: int,
    board_id: int,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_async_db_session)],
):
    board_query = await db.execute(
        select(Board).options(selectinload(Board.members)).where(Board.id == board_id)
    )
    board = board_query.scalars().first()
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "field": "server_error",
                "msg": "Board not found.",
            },
        )
    if not current_user and (
        current_user not in board.members or current_user != board.user_id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "field": "server_error",
                "msg": "Not authorized please login.",
            },
        )
    list_query = await db.execute(
        select(List).options(selectinload(List.owned_cards)).where(List.id == list_id)
    )
    list_in_board = list_query.scalars().first()
    if not list_in_board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "field": "server_error",
                "msg": "List not found.",
            },
        )
    await db.delete(list_in_board)
    await db.commit()
    channel_name = f"boards:{board_id}"
    list_data_validate = ListResponse.model_validate(list_in_board).model_dump(
        mode="json"
    )
    if channel_name in manager.channels:
        for websocket in manager.channels[channel_name]:
            await manager.send_personal_message(
                websocket=websocket,
                message={
                    "event": "list_deleted",
                    "data": list_data_validate,
                },
            )
