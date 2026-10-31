from typing import Annotated, TypedDict

from fastapi import Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from ..models.boards import Board
from ..models.cards import Card
from ..models.lists import List
from ..schemas.card import CardCreateRequest, CardUpdateRequest
from ..schemas.list import ListCreateRequest, ListUpdateRequest
from .auth import AnnotatedCurrentUser
from .db import AnnotatedAsyncDBSession


def _authorize_board_access(board: Board, current_user: AnnotatedCurrentUser):
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


async def _get_board_with_members_or_404(
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


async def _get_list_with_card_or_404(list_id: int, db: AnnotatedAsyncDBSession) -> List:
    result = await db.execute(
        select(List).options(selectinload(List.owned_cards)).where(List.id == list_id)
    )
    list_in_board = result.scalars().first()
    if list_in_board is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"field": "server_error", "msg": "List not found."},
        )
    return list_in_board


async def get_authorized_board_for_list_query(
    board_id: int,
    current_user: AnnotatedCurrentUser,
    db: AnnotatedAsyncDBSession,
):
    board = await _get_board_with_members_or_404(board_id=board_id, db=db)
    _authorize_board_access(board=board, current_user=current_user)
    return board


AnnotatedAuthorizedBoardForListQuery = Annotated[
    Board, Depends(get_authorized_board_for_list_query)
]


class BoardListCreateContext(TypedDict):
    board: Board
    list_data: ListCreateRequest


async def get_authorized_board_for_list_body_create(
    list_data: ListCreateRequest,
    current_user: AnnotatedCurrentUser,
    db: AnnotatedAsyncDBSession,
) -> BoardListCreateContext:
    board = await _get_board_with_members_or_404(board_id=list_data.board_id, db=db)
    _authorize_board_access(board=board, current_user=current_user)
    return {"board": board, "list_data": list_data}


AnnotatedAuthorizedBoardForListBodyCreate = Annotated[
    BoardListCreateContext, Depends(get_authorized_board_for_list_body_create)
]


class BoardListUpdateContext(TypedDict):
    board: Board
    list_data: ListUpdateRequest


async def get_authorized_board_for_list_body_update(
    list_data: ListUpdateRequest,
    current_user: AnnotatedCurrentUser,
    db: AnnotatedAsyncDBSession,
) -> BoardListUpdateContext:
    board = await _get_board_with_members_or_404(board_id=list_data.board_id, db=db)
    _authorize_board_access(board=board, current_user=current_user)
    return {"board": board, "list_data": list_data}


AnnotatedAuthorizedBoardForListBodyUpdate = Annotated[
    BoardListUpdateContext, Depends(get_authorized_board_for_list_body_update)
]


async def get_authorized_list_for_card_query(
    list_id: int,
    board_id: int,
    current_user: AnnotatedCurrentUser,
    db: AnnotatedAsyncDBSession,
):
    board = await _get_board_with_members_or_404(board_id=board_id, db=db)
    _authorize_board_access(board=board, current_user=current_user)
    list_in_board = await _get_list_with_card_or_404(list_id=list_id, db=db)
    return list_in_board


AnnotatedAuthorizedListForCardQuery = Annotated[
    Board, Depends(get_authorized_list_for_card_query)
]


class BoardCardCreateContext(TypedDict):
    board_list: List
    card_data: CardCreateRequest


async def get_authorized_list_for_card_body_create(
    card_data: CardCreateRequest,
    current_user: AnnotatedCurrentUser,
    db: AnnotatedAsyncDBSession,
) -> BoardCardCreateContext:
    board = await _get_board_with_members_or_404(board_id=card_data.board_id, db=db)
    _authorize_board_access(board=board, current_user=current_user)
    list_in_board = await _get_list_with_card_or_404(list_id=card_data.list_id, db=db)
    return {"board_list": list_in_board, "card_data": card_data}


AnnotatedAuthorizedListForCardBodyCreate = Annotated[
    BoardCardCreateContext, Depends(get_authorized_list_for_card_body_create)
]


class BoardCardUpdateContext(TypedDict):
    board_list: List
    card_data: CardUpdateRequest


async def get_authorized_list_for_card_body_update(
    card_data: CardUpdateRequest,
    current_user: AnnotatedCurrentUser,
    db: AnnotatedAsyncDBSession,
) -> BoardCardUpdateContext:
    board = await _get_board_with_members_or_404(board_id=card_data.board_id, db=db)
    _authorize_board_access(board=board, current_user=current_user)
    list_in_board = await _get_list_with_card_or_404(list_id=card_data.list_id, db=db)
    return {"board_list": list_in_board, "card_data": card_data}


AnnotatedAuthorizedListForCardBodyUpdate = Annotated[
    BoardCardUpdateContext, Depends(get_authorized_list_for_card_body_update)
]


"""
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
"""
