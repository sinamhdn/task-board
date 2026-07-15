from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.users import UserCRUD
from app.schemas.users import Token, UserCreate

from ..schemas.users import UserPrivateResponse
from ..utils.auth import create_access_token
from ..utils.db import get_async_db_session
from ..utils.settings import settings

router = APIRouter(prefix="", tags=["users"])


@router.post("/login", response_model=Token)
async def login_user(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: Annotated[AsyncSession, Depends(get_async_db_session)],
):
    """Login user"""

    # Look up user by email (case-insensitive)
    # Note: OAuth2PasswordRequestForm uses "username" field, but we treat it as email
    user = await UserCRUD.authenticate_user(
        session, form_data.username, form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # Create access token with user id as subject
    access_token_expires = timedelta(minutes=settings.jwt_expire_delta_minutes)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expiration_delta=access_token_expires
    )
    return Token(access_token=access_token, token_type="bearer")


@router.post("/register", response_model=UserPrivateResponse)
async def register_user(
    user_data: UserCreate,
    session: Annotated[AsyncSession, Depends(get_async_db_session)],
):
    """Register a new user"""
    try:
        user = await UserCRUD.create_user(session, user_data)
        return user
        # return UserPrivateResponse(**user.model_dump())
        # return UserPrivateResponse.model_validate(user)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
