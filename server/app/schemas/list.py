import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from .users import UserPublicResponse


class ListResponse(BaseModel):
    id: int
    uid: uuid.UUID
    board_id: int
    name: str
    created_at: datetime
    updated_at: Optional[datetime]
    owned_cards: list[UserPublicResponse] = []
    model_config = ConfigDict(from_attributes=True)