from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class BoardResponse(BaseModel):
    id: int
    uid: str
    user_id: int
    name: str
    created_at: datetime
    updated_at: Optional[datetime]


class BoardCreate(BaseModel):
    name: str
