import logging
from typing import Annotated, List

from app.crud.users import UserCRUD
from app.schemas.users import (
    UserPrivateResponse,
    UserPublicResponse,
    UserUpdate,
)
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.users import User
from ..utils.auth import CurrentUser, oath2_scheme
from ..utils.db import get_async_db_session
from ..utils.utilities import add_to_blacklist

router = APIRouter(prefix="", tags=["users"])
logger = logging.getLogger(__name__)


@router.get("/me", response_model=UserPrivateResponse)
async def get_current_user(current_user: CurrentUser):
    return current_user


@router.patch("/me", response_model=UserPrivateResponse)
async def update_current_user(
    current_user: CurrentUser,
    user_data: UserUpdate,
    session: Annotated[AsyncSession, Depends(get_async_db_session)],
):
    """Update user"""
    user = UserCRUD.get_user_by_id(session, current_user.id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"field": "server_error", "msg": "User not found."},
        )
    user = await UserCRUD.update_user(
        session=session, user=current_user, user_data=user_data
    )
    return user


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_current_user(
    current_user: CurrentUser,
    token: Annotated[str, Depends(oath2_scheme)],
    session: Annotated[AsyncSession, Depends(get_async_db_session)],
):
    """Delete user"""
    user = await UserCRUD.get_user_by_id(session, current_user.id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"field": "server_error", "msg": "User not found."},
        )
    await UserCRUD.delete_user(session=session, user=current_user)
    add_to_blacklist(token)
    return Response(
        status_code=status.HTTP_204_NO_CONTENT,
        headers={
            "X-Logout-Required": "true",
            "X-Message": "User deleted successfully. Please log in again.",
        },
    )


@router.get("", response_model=List[UserPublicResponse])
async def get_all_users(
    session: Annotated[AsyncSession, Depends(get_async_db_session)],
    skip: int = 0,
    limit: int = 100,
    order: str = "updated_at",
):
    """Get all users (admin only)"""
    users = await UserCRUD.get_users(session, skip=skip, limit=limit, order=order)
    return users


@router.get("/{user_id}", response_model=UserPublicResponse)
async def get_user(
    user_id: int, session: Annotated[AsyncSession, Depends(get_async_db_session)]
):
    result = await session.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if user:
        return user
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail={"field": "server_error", "msg": "User not found."},
    )


@router.patch("/{user_id}", response_model=UserPublicResponse)
async def update_user(
    user_id: int,
    user_update: UserUpdate,
    current_user: CurrentUser,
    session: Annotated[AsyncSession, Depends(get_async_db_session)],
):

    # Log the incoming data for debugging
    logger.info(f"Received update for user {user_id}: {user_update}")
    logger.info(f"Update data type: {type(user_update)}")

    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "field": "server_error",
                "msg": "Not authorized to update this user.",
            },
        )
    result = await session.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"field": "server_error", "msg": "User not found."},
        )
    user = await UserCRUD.update_user(session=session, user=user, user_data=user_update)
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    current_user: CurrentUser,
    token: Annotated[str, Depends(oath2_scheme)],  # Add this line
    session: Annotated[AsyncSession, Depends(get_async_db_session)],
):
    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "field": "server_error",
                "msg": "Not authorized to delete this user.",
            },
        )
    result = await session.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"field": "server_error", "msg": "User not found."},
        )
    await UserCRUD.delete_user(session=session, user=user)

    # Blacklist the current token
    add_to_blacklist(token)

    # Return 204 No Content with a header that tells the client to logout
    # Note: You can't return a body with 204, but you can add headers
    return Response(
        status_code=status.HTTP_204_NO_CONTENT,
        headers={
            "X-Logout-Required": "true",
            "X-Message": "User deleted successfully. Please log in again.",
        },
    )
