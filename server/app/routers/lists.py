import logging

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import and_, select
from sqlalchemy.orm import selectinload

from ..models.lists import List
from ..schemas.list import ListResponse
from ..utils.db import (
    AnnotatedAsyncDBSession,
    get_order_column,
)
from ..utils.deps import (
    AnnotatedAuthorizedBoardForListBodyCreate,
    AnnotatedAuthorizedBoardForListBodyUpdate,
    AnnotatedAuthorizedBoardForListQuery,
)
from ..utils.ws import manager

logger = logging.getLogger(f"List router logger: Filename->{__name__}")

router = APIRouter(prefix="", tags=["lists"])


@router.get("", response_model=list[ListResponse])
async def get_all_lists(
    db: AnnotatedAsyncDBSession,
    board: AnnotatedAuthorizedBoardForListQuery,
    order: str = "updated_at",
    skip: int = 0,
    limit: int = 100,
):
    list_query = await db.execute(
        select(List)
        .options(selectinload(List.owned_cards))
        .order_by(get_order_column(List, order))
        .offset(skip)
        .limit(limit)
        .where(List.board_id == board.id)
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
    db: AnnotatedAsyncDBSession,
    board: AnnotatedAuthorizedBoardForListQuery,
    list_id: int,
):
    list_by_id_query = await db.execute(
        select(List).where(and_(List.id == list_id, List.board_id == board.id))
    )
    list_by_id = list_by_id_query.scalars().first()
    if not list_by_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "field": "server_error",
                "msg": "List not found.",
            },
        )
    return list_by_id


@router.post("", response_model=ListResponse, status_code=status.HTTP_201_CREATED)
async def create_new_list(
    db: AnnotatedAsyncDBSession,
    data: AnnotatedAuthorizedBoardForListBodyCreate,
):
    if not hasattr(data["list_data"], "list_name"):
        raise HTTPException(
            status_code=status.HTTP_405_METHOD_NOT_ALLOWED,
            detail={
                "field": "server_error",
                "msg": "Pass the correct list data to create a new list.",
            },
        )
    new_list = List(
        name=data["list_data"].list_name, board_id=data["list_data"].board_id
    )
    db.add(new_list)
    await db.commit()
    await db.refresh(new_list, attribute_names=["owner_board", "owned_cards"])
    channel_name = f"boards:{data['list_data'].board_id}"
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
    data: AnnotatedAuthorizedBoardForListBodyUpdate,
    db: AnnotatedAsyncDBSession,
):
    logger.info(f"data recieved in list update : {data}")
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
    update_list = data["list_data"].model_dump(exclude_unset=True)
    for field, value in update_list.items():
        if field == "list_name":
            field = "name"
        setattr(list_in_board, field, value)
    await db.commit()
    await db.refresh(list_in_board, attribute_names=["owner_board"])
    channel_name = f"boards:{data['list_data'].board_id}"
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
async def delete_list(
    list_id: int,
    board: AnnotatedAuthorizedBoardForListQuery,
    db: AnnotatedAsyncDBSession,
):
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
    channel_name = f"boards:{board.id}"
    list_data_validate = ListResponse.model_validate(list_in_board).model_dump(
        mode="json"
    )
    if channel_name in manager.channels:
        for websocket in manager.channels[channel_name]:
            await manager.send_personal_message(
                websocket=websocket,
                message={
                    "event": "list_removed",
                    "data": list_data_validate,
                },
            )
    await db.commit()
