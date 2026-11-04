import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from ..schemas.card import CardResponse


class ListCreateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    list_name: str = Field(min_length=3)
    board_id: int


class ListUpdateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    list_name: str = Field(min_length=3)
    board_id: int


class ListResponse(BaseModel):
    id: int
    uid: uuid.UUID
    board_id: int
    name: str
    created_at: datetime
    updated_at: Optional[datetime]
    # owned_cards: list[CardResponse] = []
    model_config = ConfigDict(from_attributes=True)
