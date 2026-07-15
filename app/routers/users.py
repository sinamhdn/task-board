import asyncio
import logging
import uuid
from datetime import datetime, timedelta
from typing import Annotated, Dict, List

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.users import UserCRUD
from app.schemas.users import (
    UserPrivateResponse,
    UserPublicResponse,
    UserUpdate,
)

from ..models.users import User
from ..utils.auth import CurrentUser, oath2_scheme
from ..utils.db import get_async_db_session

router = APIRouter(prefix="", tags=["users"])
logger = logging.getLogger(__name__)


# In-memory token blacklist with expiration
TOKEN_BLACKLIST: Dict[str, datetime] = {}  # token -> expiration_time


def add_to_blacklist(token: str, expires_in: int = 3600) -> None:
    """Add token to blacklist with expiration time"""
    expiration_time = datetime.utcnow() + timedelta(seconds=expires_in)
    TOKEN_BLACKLIST[token] = expiration_time


def is_token_blacklisted(token: str) -> bool:
    """Check if token is blacklisted and not expired"""
    if token not in TOKEN_BLACKLIST:
        return False

    expiration_time = TOKEN_BLACKLIST[token]
    if datetime.utcnow() > expiration_time:
        # Token expired, remove from blacklist
        del TOKEN_BLACKLIST[token]
        return False

    return True


def cleanup_expired_tokens() -> None:
    """Remove expired tokens from blacklist"""
    current_time = datetime.utcnow()
    expired_tokens = [
        token for token, exp_time in TOKEN_BLACKLIST.items() if current_time > exp_time
    ]
    for token in expired_tokens:
        del TOKEN_BLACKLIST[token]

    if expired_tokens:
        logger.info(f"Cleaned up {len(expired_tokens)} expired tokens from blacklist")


# Background task to periodically clean up expired tokens
async def periodic_cleanup(interval_minutes: int = 60):
    """Run cleanup every specified minutes"""
    while True:
        await asyncio.sleep(interval_minutes * 60)
        cleanup_expired_tokens()


# Start the background task when the app starts
@router.on_event("startup")
async def startup_event():
    asyncio.create_task(periodic_cleanup(interval_minutes=30))


@router.get("/me", response_model=UserPrivateResponse)
async def get_current_user(current_user: CurrentUser):
    return current_user


@router.get("", response_model=List[UserPublicResponse])
async def get_all_users(
    session: Annotated[AsyncSession, Depends(get_async_db_session)],
    skip: int = 0,
    limit: int = 100,
):
    """Get all users (admin only)"""
    users = await UserCRUD.get_users(session, skip=skip, limit=limit)
    return users


@router.get("/{user_id}", response_model=UserPublicResponse)
async def get_user(
    user_id: int, session: Annotated[AsyncSession, Depends(get_async_db_session)]
):
    result = await session.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if user:
        return user
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")


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
            detail="Not authorized to update this user.",
        )
    result = await session.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found."
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
            detail="Not authorized to delete this user.",
        )
    result = await session.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found."
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


# @router.put("/me", response_model=UserPrivateResponse)
# def update_user(
#     user_data: UserUpdate, user_id: uuid.UUID, session: Session = Depends(get_session)
# ):
#     """Update user"""
#     user = UserCRUD.get_user_by_id(session, user_id)
#     if not user:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
#         )
#     user = UserCRUD.update_user(session, user, user_data)
#     return UserResponse(**user.dict())


# @router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
# def delete_user(user_id: uuid.UUID, session: Session = Depends(get_session)):
#     """Delete user"""
#     user = UserCRUD.get_user_by_id(session, user_id)
#     if not user:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
#         )
#     UserCRUD.delete_user(session, user)
