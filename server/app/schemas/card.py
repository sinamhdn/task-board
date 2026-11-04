import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class CardCreateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    card_name: str = Field(min_length=3)
    list_id: int
    board_id: int


class CardUpdateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    card_name: str = Field(min_length=3)
    list_id: int
    board_id: int


class CardResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    uid: uuid.UUID
    list_id: int
    board_id: int
    name: str
    created_at: datetime
    updated_at: Optional[datetime]
