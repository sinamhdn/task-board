from typing import Annotated, Literal, Union

from pydantic import BaseModel, Field, TypeAdapter, field_validator

# Allowed channel prefixes
ALLOWED_CHANNELS = {"boards:", "users:"}


# === Base Classes ===


class BaseMessage(BaseModel):
    """Base class for all WebSocket messages."""

    action: str

    @field_validator("action")
    def validate_action(cls, v: str) -> str:
        allowed_actions = {
            "subscribe",
            "unsubscribe",
            "broadcast_channel",
            "broadcast_global",
        }
        if v not in allowed_actions:
            raise ValueError(f"Action must be one of {allowed_actions}")
        return v


class ChannelMessage(BaseMessage):
    """Base class for messages that require a channel."""

    channel: str = Field(..., min_length=3, max_length=50)

    @field_validator("channel")
    def validate_channel(cls, v: str) -> str:
        if not any(v.startswith(prefix) for prefix in ALLOWED_CHANNELS):
            raise ValueError(
                f"Channel must start with one of: {', '.join(ALLOWED_CHANNELS)}"
            )
        return v


class MessageWithContent(BaseMessage):
    """Base class for messages that contain content."""

    message: str = Field(..., min_length=1, description="Message content")


# === Concrete Message Types ===


class Subscribe(ChannelMessage):
    """Subscribe to a channel."""

    action: Literal["subscribe"]


class Unsubscribe(ChannelMessage):
    """Unsubscribe from a channel."""

    action: Literal["unsubscribe"]


class BroadcastChannel(ChannelMessage, MessageWithContent):
    """Broadcast a message to a specific channel."""

    action: Literal["broadcast_channel"]


class BroadcastGlobal(MessageWithContent):
    """Broadcast a message to all connected clients."""

    action: Literal["broadcast_global"]
    # No channel field - intentionally omitted


# === Type Adapter ===

Message = Annotated[
    Union[Subscribe, Unsubscribe, BroadcastGlobal, BroadcastChannel],
    Field(discriminator="action"),
]

adapter = TypeAdapter(Message)
