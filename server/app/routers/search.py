# import email
import logging
from typing import Annotated, Union

from fastapi import APIRouter, Depends, HTTPException, status

# from fastapi.responses import Response
# from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

# from ..crud.users import UserCRUD
# from ..models.boards import Board
# from ..models.users import User
from ..schemas.boards import BoardResponse
from ..schemas.users import (
    UserPublicResponse,
)

# from ..utils.auth import CurrentUser, add_token_to_blacklist, oath2_scheme
from ..utils.db import AnnotatedAsyncDBSession, get_async_db_session
from ..utils.search import SearchService

# , List


router = APIRouter(prefix="", tags=["users"])
logger = logging.getLogger(f"search router logger: filename -> {__name__}")


@router.get("", response_model=Union[list[UserPublicResponse], list[BoardResponse]])
async def search_all(
    search_type: str,
    query: str,
    db: AnnotatedAsyncDBSession,
    limit: int = 20,
):
    try:
        search_service = SearchService(db)
        results = await search_service.search_all(
            search_type=search_type, query=query, limit=limit
        )
        return results
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"field": "server_error", "msg": str(e)},
        )
    except Exception as e:
        logger.error("Search error: ", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"field": "server_error", "msg": "An error occurred during search"},
        )
