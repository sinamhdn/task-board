from datetime import UTC, datetime, timedelta
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pwdlib import PasswordHash
from sqlalchemy import select

from ..models.users import User
from .db import AsyncSession, get_async_db_session
from .settings import settings

pwd_hash = PasswordHash.recommended()
oath2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")


def set_password(user: User, password: str) -> None:
    user.hashed_password = pwd_hash.hash(password)


def verify_password(user: User, password: str) -> bool:

    return pwd_hash.verify(password, user.hashed_password)


def create_access_token(data: dict, expiration_delta: timedelta | None = None):
    data_clone = data.copy()
    if expiration_delta:
        expires_in = datetime.now(UTC) + expiration_delta
    else:
        expires_in = datetime.now(UTC) + timedelta(
            minutes=settings.jwt_expire_delta_minutes
        )
    data_clone.update({"exp": expires_in})
    encoded_data = jwt.encode(
        data_clone,
        settings.jwt_secret_key.get_secret_value(),
        algorithm=settings.jwt_algorithm,
    )
    return encoded_data


def verify_access_token(token: str) -> str | None:
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key.get_secret_value(),
            algorithms=[settings.jwt_algorithm],
            options={"require": ["exp", "sub"]},
        )
    except jwt.InvalidTokenError:
        return None
    else:
        return payload.get("sub")


async def get_current_user(
    token: Annotated[str, Depends(oath2_scheme)],
    db: Annotated[AsyncSession, Depends(get_async_db_session)],
) -> User:
    user_id_str = verify_access_token(token)
    if user_id_str is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=[
                {"field": "server_error", "msg": "Invalid or expired access token."}
            ],
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        user_id = int(user_id_str)
    except TypeError, ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=[
                {"field": "server_error", "msg": "Invalid or expired access token."}
            ],
            headers={"WWW-Authenticate": "Bearer"},
        )

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=[{"field": "server_error", "msg": "User not found."}],
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


# type alias for current user type hint
CurrentUser = Annotated[User, Depends(get_current_user)]
