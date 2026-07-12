import uuid
from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.users import UserCRUD
from app.schemas.users import (
    UserCreate,
    UserPrivateResponse,
    UserPublicResponse,
    UserUpdate,
)

from ..models.users import User
from ..utils.auth import CurrentUser
from ..utils.db import get_async_db_session

router = APIRouter(prefix="/users", tags=["users"])


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
    if user_id != current_user:
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
    user = UserCRUD.update_user(session=session, user=user, user_data=user_update)
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    current_user: CurrentUser,
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
