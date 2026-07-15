# In-memory token blacklist with expiration
import asyncio
import logging
from datetime import UTC, datetime, timedelta
from typing import Dict

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


# Start the background task when the app starts
# @router.on_event("startup")
# async def startup_event():
#     pass
