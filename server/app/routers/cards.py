import logging

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from ..models.cards import Card
from ..models.lists import List
from ..schemas.card import CardResponse
from ..schemas.list import ListResponse
from ..utils.db import (
    AnnotatedAsyncDBSession,
    get_order_column,
)
from ..utils.deps import (
    AnnotatedAuthorizedListForCardBodyCreate,
    AnnotatedAuthorizedListForCardBodyUpdate,
    AnnotatedAuthorizedListForCardQuery,
)
from ..utils.ws import manager

logger = logging.getLogger(f"card router logger: filename -> {__name__}")

router = APIRouter(prefix="", tags=["cards"])


@router.get("", response_model=list[CardResponse])
async def get_all_cards(
    db: AnnotatedAsyncDBSession,
    available_list: AnnotatedAuthorizedListForCardQuery,
    order: str = "updated_at",
    skip: int = 0,
    limit: int = 100,
):
    if available_list is None:
        return
    card_query = await db.execute(
        select(Card)
        .options(selectinload(Card.owner_board), selectinload(Card.owner_list))
        .order_by(get_order_column(Card, order))
        .offset(skip)
        .limit(limit)
        .where(Card.list_id == available_list.id)
    )
    cards = card_query.scalars().all()
    if cards is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "field": "server_error",
                "msg": "no card item found.",
            },
        )
    return list(cards)


@router.get("/{card_id}", response_model=CardResponse)
async def get_card_by_id(
    db: AnnotatedAsyncDBSession,
    available_list: AnnotatedAuthorizedListForCardQuery,
    card_id: int,
):
    if available_list is None:
        return
    card_by_id_query = await db.execute(select(Card).where(Card.id == card_id))
    card_by_id = card_by_id_query.scalars().first()
    if not card_by_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "field": "server_error",
                "msg": "Card not found.",
            },
        )
    return card_by_id


@router.post("", response_model=CardResponse, status_code=status.HTTP_201_CREATED)
async def create_new_card(
    db: AnnotatedAsyncDBSession,
    data: AnnotatedAuthorizedListForCardBodyCreate,
):
    if not hasattr(data["card_data"], "card_name"):
        raise HTTPException(
            status_code=status.HTTP_405_METHOD_NOT_ALLOWED,
            detail={
                "field": "server_error",
                "msg": "Pass the correct card data to create a new card.",
            },
        )
    new_card = Card(
        name=data["card_data"].card_name,
        list_id=data["card_data"].list_id,
        board_id=data["card_data"].board_id,
    )
    db.add(new_card)
    await db.commit()
    await db.refresh(new_card, attribute_names=["owner_board", "owner_list"])
    channel_name = f"boards:{data["card_data"].board_id}"
    card_data_validate = CardResponse.model_validate(new_card).model_dump(mode="json")
    if channel_name in manager.channels:
        for websocket in manager.channels[channel_name]:
            await manager.send_personal_message(
                websocket=websocket,
                message={
                    "event": "card_added",
                    "card_data": card_data_validate,
                },
            )
    return new_card


@router.patch("/{card_id}", response_model=CardResponse)
async def update_card(
    card_id: int,
    db: AnnotatedAsyncDBSession,
    data: AnnotatedAuthorizedListForCardBodyUpdate,
):
    card_query = await db.execute(
        select(Card)
        .options(selectinload(Card.owner_list), selectinload(Card.owner_board))
        .where(Card.id == card_id)
    )
    card = card_query.scalars().first()
    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "field": "server_error",
                "msg": "Card not found.",
            },
        )
    update_card = data["card_data"].model_dump(exclude_unset=True)
    for field, value in update_card.items():
        if field == "card_name":
            field = "name"
        setattr(card, field, value)
    await db.commit()
    await db.refresh(card, attribute_names=["owner_board", "owner_list"])
    channel_name = f"boards:{data["card_data"].board_id}"
    card_data_validate = ListResponse.model_validate(card).model_dump(mode="json")
    if channel_name in manager.channels:
        for websocket in manager.channels[channel_name]:
            await manager.send_personal_message(
                websocket=websocket,
                message={
                    "event": "card_updated",
                    "card_data": card_data_validate,
                },
            )
    return card


@router.delete("/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_board(
    card_id: int,
    db: AnnotatedAsyncDBSession,
    blist: AnnotatedAuthorizedListForCardQuery,
):
    card_query = await db.execute(
        select(Card)
        .options(selectinload(Card.owner_board), selectinload(Card.owner_list))
        .where(Card.id == card_id)
    )
    card = card_query.scalars().first()
    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "field": "server_error",
                "msg": "Card not found.",
            },
        )
    await db.delete(card)
    channel_name = f"boards:{blist.board_id}"
    card_data_validate = ListResponse.model_validate(card).model_dump(mode="json")
    if channel_name in manager.channels:
        for websocket in manager.channels[channel_name]:
            await manager.send_personal_message(
                websocket=websocket,
                message={
                    "event": "card_removed",
                    "card_id": card.id,
                    "list_id": card.list_id,
                },
            )
    await db.commit()
