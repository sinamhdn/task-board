import asyncio
import logging
from datetime import UTC, datetime, timedelta
from typing import Annotated, Dict

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pwdlib import PasswordHash
from sqlalchemy import select

from ..models.users import User
from .db import AsyncSession, get_async_db_session
from ..settings import settings

logger = logging.getLogger(f"Auth utilities logger: Filename->{__name__}")
pwd_hash = PasswordHash.recommended()
oath2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")


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
    except jwt.ExpiredSignatureError:
        logger.warning("Token expired")
        return None
    except jwt.InvalidSignatureError:
        logger.warning("Invalid signature")
        return None
    except jwt.InvalidTokenError as e:
        logger.warning(f"Other JWT error: {e}")
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
            detail={"field": "server_error", "msg": "Invalid or expired access token."},
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        user_id = int(user_id_str)
    except TypeError, ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"field": "server_error", "msg": "Invalid or expired access token."},
            headers={"WWW-Authenticate": "Bearer"},
        )

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"field": "server_error", "msg": "User not found."},
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


# In-memory token blacklist with expiration
TOKEN_BLACKLIST: Dict[str, datetime] = {}  # token -> expiration_time
logger = logging.getLogger(f"General utilities logger: Filename->{__name__}")


def add_token_to_blacklist(token: str, expires_in: int = 3600) -> None:
    """Add token to blacklist with expiration time"""
    expiration_time = datetime.now(UTC) + timedelta(seconds=expires_in)
    TOKEN_BLACKLIST[token] = expiration_time


def is_token_blacklisted(token: str) -> bool:
    """Check if token is blacklisted and not expired"""
    if token not in TOKEN_BLACKLIST:
        return False

    expiration_time = TOKEN_BLACKLIST[token]
    if datetime.now(UTC) > expiration_time:
        # Token expired, remove from blacklist
        del TOKEN_BLACKLIST[token]
        return False

    return True


def cleanup_expired_tokens() -> None:
    """Remove expired tokens from blacklist"""
    current_time = datetime.now(UTC)
    expired_tokens = [
        token for token, exp_time in TOKEN_BLACKLIST.items() if current_time > exp_time
    ]

    for token in expired_tokens:
        del TOKEN_BLACKLIST[token]

    if expired_tokens:
        logger.info(f"Cleaned up {len(expired_tokens)} expired tokens from blacklist")


# Background task to periodically clean up expired tokens
async def periodic_token_cleanup(interval_minutes: int = 60):
    """Run cleanup every specified minutes"""
    while True:
        await asyncio.sleep(interval_minutes * 60)
        cleanup_expired_tokens()


# Start the background task when the app starts
# @router.on_event("startup")
# async def startup_event():
#     pass


# type alias for current user type hint
CurrentUser = Annotated[User, Depends(get_current_user)]
