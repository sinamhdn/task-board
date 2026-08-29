import re
from typing import Annotated, Literal, Union

from pydantic import BaseModel, Field, TypeAdapter, ValidationError, field_validator
from pydantic_core.core_schema import FieldValidationInfo

# Allowed channel prefixes or a set of valid names
ALLOWED_CHANNELS = {"boards:", "users:"}  # prefix whitelist


class WebSocketMessage(BaseModel):
    action: str = Field(
        ..., description="Action to perform: subscribe, unsubscribe, broadcast"
    )
    channel: str = Field(..., min_length=3, max_length=50)
    message: str | None = Field(
        None, description="Optional message for broadcast action"
    )

    @field_validator("channel")
    def validate_channel(cls, v):
        # Allow only channels that start with one of the allowed prefixes
        if not any(v.startswith(prefix) for prefix in ALLOWED_CHANNELS):
            raise ValueError(f"Channel name must start with one of {ALLOWED_CHANNELS}")
        # You can also use a regex pattern, e.g., r'^[a-zA-Z0-9_\-]+$'
        return v

    @field_validator("action")
    def validate_action(cls, v):
        allowed_actions = {
            "subscribe",
            "unsubscribe",
            "broadcast_channel",
            "broadcast_global",
        }
        if v not in allowed_actions:
            raise ValueError(f"Action must be one of {allowed_actions}")
        return v


class Subscribe(WebSocketMessage):
    action: Literal["subscribe"]
    channel: str


class Unsubscribe(WebSocketMessage):
    action: Literal["unsubscribe"]
    channel: str


class BroadcastChannel(WebSocketMessage):
    action: Literal["broadcast_channel"]
    channel: str
    message: str


class BroadcastGlobal(WebSocketMessage):
    action: Literal["broadcast_global"]
    channel: str
    message: str


Message = Annotated[
    Union[Subscribe, Unsubscribe, BroadcastGlobal, BroadcastChannel],
    Field(discriminator="action"),
]

adapter = TypeAdapter(Message)
