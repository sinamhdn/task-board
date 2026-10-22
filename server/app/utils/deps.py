from typing import Annotated, TypedDict

from fastapi import Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from ..models.boards import Board
from ..models.cards import Card
from ..models.lists import List
from ..schemas.card import CardCreateRequest
from ..schemas.list import ListCreateRequest, ListUpdateRequest
from .auth import AnnotatedCurrentUser
from .db import AnnotatedAsyncDBSession


# board_id comes from query params of get request after "?"
# db has no paramete and only returns db session object
async def get_board_or_404_for_list_query(
    board_id: int, db: AnnotatedAsyncDBSession
) -> Board:
    result = await db.execute(
        select(Board).options(selectinload(Board.members)).where(Board.id == board_id)
    )
    board = result.scalars().first()
    if board is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"field": "server_error", "msg": "Board not found."},
        )
    return board


async def get_authorized_board_for_list_query(
    board: Annotated[Board, Depends(get_board_or_404_for_list_query)],
    current_user: AnnotatedCurrentUser,
):
    if current_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"field": "server_error", "msg": "Not authorized please login."},
        )
    is_owner = current_user.id == board.user_id
    is_member = any(m.id == current_user.id for m in board.members)
    if not (is_owner or is_member):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"field": "server_error", "msg": "Not authorized please login."},
        )
    return board


class BoardListContext(TypedDict):
    board: Board
    list_data: ListCreateRequest | ListUpdateRequest


# board_id comes from the body of post/patch/delete request
async def get_board_or_404_for_list_body(
    list_data: ListCreateRequest | ListUpdateRequest, db: AnnotatedAsyncDBSession
) -> BoardListContext:
    result = await db.execute(
        select(Board)
        .options(selectinload(Board.members))
        .where(Board.id == list_data.board_id)
    )
    board = result.scalars().first()
    if board is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"field": "server_error", "msg": "Board not found."},
        )
    return {"board": board, "list_data": list_data}


async def get_authorized_board_for_list_body(
    data: Annotated[BoardListContext, Depends(get_board_or_404_for_list_body)],
    current_user: AnnotatedCurrentUser,
):
    if current_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"field": "server_error", "msg": "Not authorized please login."},
        )
    is_owner = current_user.id == data["board"].user_id
    is_member = any(m.id == current_user.id for m in data["board"].members)
    if not (is_owner or is_member):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"field": "server_error", "msg": "Not authorized please login."},
        )
    return data["list_data"]


async def get_list_or_404_for_card_query(
    list_id: int,
    board: AnnotatedAuthorizedBoardForListQuery,
    db: AnnotatedAsyncDBSession,
) -> List:
    if board is None:
        return
    result = await db.execute(
        select(List).options(selectinload(List.owned_cards)).where(List.id == list_id)
    )
    list_in_board = result.scalars().first()
    if not list_in_board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"field": "server_error", "msg": "Board not found."},
        )
    return list_in_board


class BoardCardContext(TypedDict):
    list_of_board: List
    card_data: CardCreateRequest


async def get_list_or_404_for_card_body(
    card_data: CardCreateRequest,
    board: AnnotatedAuthorizedBoardForListBody,
    db: AnnotatedAsyncDBSession,
) -> CardCreateRequest:
    if board is None:
        return
    result = await db.execute(
        select(List)
        .options(selectinload(List.owned_cards))
        .where(List.id == card_data.list_id)
    )
    list_in_board = result.scalars().first()
    if not list_in_board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"field": "server_error", "msg": "List not found."},
        )
    return card_data


AnnotatedBoardForListQuery = Annotated[Board, Depends(get_board_or_404_for_list_query)]
AnnotatedAuthorizedBoardForListQuery = Annotated[
    Board, Depends(get_authorized_board_for_list_query)
]
AnnotatedBoardForListBody = Annotated[
    BoardListContext, Depends(get_board_or_404_for_list_body)
]
AnnotatedAuthorizedBoardForListBody = Annotated[
    BoardListContext, Depends(get_authorized_board_for_list_body)
]
AnnotatedListForCardQuery = Annotated[List, Depends(get_list_or_404_for_card_query)]
AnnotatedListForCardBody = Annotated[
    BoardCardContext, Depends(get_list_or_404_for_card_body)
]
