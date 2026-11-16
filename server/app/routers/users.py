import logging
from typing import Annotated, List

from app.crud.users import UserCRUD
from app.schemas.users import (
    UserPrivateResponse,
    UserPublicResponse,
    UserUpdateRequest,
)
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response
from sqlalchemy import select

from ..models.users import User
from ..utils.auth import (
    AnnotatedCurrentUser,
    AnnotatedOauth2Scheme,
    add_token_to_blacklist,
    oath2_scheme,
)
from ..utils.db import AnnotatedAsyncDBSession

router = APIRouter(prefix="", tags=["users"])
logger = logging.getLogger(f"users utilities logger: filename -> {__name__}")


@router.get("/me", response_model=UserPrivateResponse)
async def get_current_user(current_user: AnnotatedCurrentUser):
    return current_user


@router.patch("/me", response_model=UserPrivateResponse)
async def update_current_user(
    user_data: UserUpdateRequest,
    current_user: AnnotatedCurrentUser,
    db: AnnotatedAsyncDBSession,
):
    """Update user"""
    user = UserCRUD.get_user_by_id(db, current_user.id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"field": "server_error", "msg": "User not found."},
        )
    user = await UserCRUD.update_user(db, current_user, user_data)
    return user


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_current_user(
    token: AnnotatedOauth2Scheme,
    current_user: AnnotatedCurrentUser,
    db: AnnotatedAsyncDBSession,
):
    """Delete user"""
    user = await UserCRUD.get_user_by_id(db, current_user.id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"field": "server_error", "msg": "User not found."},
        )
    await UserCRUD.delete_user(db, current_user)
    add_token_to_blacklist(token)
    return Response(
        status_code=status.HTTP_204_NO_CONTENT,
        headers={
            "X-Logout-Required": "true",
            "X-Message": "User deleted successfully. Please log in again.",
        },
    )


@router.get("", response_model=List[UserPublicResponse])
async def get_all_users(
    db: AnnotatedAsyncDBSession,
    skip: int = 0,
    limit: int = 100,
    order: str = "updated_at",
):
    """Get all users (admin only)"""
    users = await UserCRUD.get_users(db, skip=skip, limit=limit, order=order)
    return users


@router.get("/{user_id}", response_model=UserPublicResponse)
async def get_user(user_id: int, db: AnnotatedAsyncDBSession):
    result = await db.execute(select(User).where(User.id == user_id))
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
    user_update: UserUpdateRequest,
    current_user: AnnotatedCurrentUser,
    db: AnnotatedAsyncDBSession,
):

    # Log the incoming data for debugging
    logger.info(f"received update for user {user_id}: {user_update}")
    logger.info("update data type: ", type(user_update))

    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "field": "server_error",
                "msg": "Not authorized to update this user.",
            },
        )
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"field": "server_error", "msg": "User not found."},
        )
    user = await UserCRUD.update_user(db, user, user_update)
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    current_user: AnnotatedCurrentUser,
    token: AnnotatedOauth2Scheme,  # Add this line
    db: AnnotatedAsyncDBSession,
):
    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "field": "server_error",
                "msg": "Not authorized to delete this user.",
            },
        )
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"field": "server_error", "msg": "User not found."},
        )
    await UserCRUD.delete_user(db, user)

    # Blacklist the current token
    add_token_to_blacklist(token)

    # Return 204 No Content with a header that tells the client to logout
    # Note: You can't return a body with 204, but you can add headers
    return Response(
        status_code=status.HTTP_204_NO_CONTENT,
        headers={
            "X-Logout-Required": "true",
            "X-Message": "User deleted successfully. Please log in again.",
        },
    )
