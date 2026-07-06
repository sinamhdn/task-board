from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session
from typing import List
import uuid
from utils.db import get_session
from schemas.user import UserResponse, UserCreate, UserUpdate
from crud.user import UserCRUD

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
def get_current_user(user_id: uuid.UUID, session: Session = Depends(get_session)):
    """Get current user"""
    user = UserCRUD.get_user_by_id(session, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    return UserResponse(**user.dict())


@router.get("", response_model=List[UserResponse])
def get_all_users(
    skip: int = 0, limit: int = 100, session: Session = Depends(get_session)
):
    """Get all users (admin only)"""
    users = UserCRUD.get_users(session, skip, limit)
    return [UserResponse(**user.dict()) for user in users]


@router.put("/me", response_model=UserResponse)
def update_user(
    user_data: UserUpdate, user_id: uuid.UUID, session: Session = Depends(get_session)
):
    """Update user"""
    user = UserCRUD.get_user_by_id(session, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    user = UserCRUD.update_user(session, user, user_data)
    return UserResponse(**user.dict())


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: uuid.UUID, session: Session = Depends(get_session)):
    """Delete user"""
    user = UserCRUD.get_user_by_id(session, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    UserCRUD.delete_user(session, user)
