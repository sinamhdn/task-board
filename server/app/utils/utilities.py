# In-memory token blacklist with expiration
import asyncio
import logging
from datetime import UTC, datetime, timedelta
from typing import Dict

from sqlalchemy import asc, desc

from ..models.users import User

TOKEN_BLACKLIST: Dict[str, datetime] = {}  # token -> expiration_time
logger = logging.getLogger(__name__)


def add_to_blacklist(token: str, expires_in: int = 3600) -> None:
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
async def periodic_cleanup(interval_minutes: int = 60):
    """Run cleanup every specified minutes"""
    while True:
        await asyncio.sleep(interval_minutes * 60)
        cleanup_expired_tokens()


def get_order_column(model, order_by: str = "updated_at"):
    # Handle optional descending prefix (e.g., "-created_at")

    order_by = order_by.strip()

    descending = order_by.startswith("-")
    col_name = order_by[1:] if descending else order_by

    column = getattr(model, col_name, None)

    if column is None:
        raise ValueError(f"Invalid column: {col_name}")

    return desc(column) if descending else asc(column)
    # if order_by.startswith("-"):
    #     col_name = order_by[1:]
    #     descending = True
    # else:
    #     col_name = order_by
    #     descending = False

    # if not hasattr(model, col_name):
    #     raise ValueError(f"Invalid column: {col_name}")

    # column = getattr(model, col_name)
    # return desc(column) if descending else asc(column)


# Start the background task when the app starts
# @router.on_event("startup")
# async def startup_event():
#     pass
