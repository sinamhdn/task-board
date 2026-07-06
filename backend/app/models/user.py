from typing import Optional
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field
from pydantic import EmailStr, field_validator
from passlib.context import CryptContext
import uuid

pwd_context = CryptContext(schemas=["bcrypt"], deprecated="auto")


class UserBase(SQLModel):
    first_name = Optional[str] = Field(default=None, max_length=50)
    last_name = Optional[str] = Field(default=None, max_length=50)
    email: EmailStr = Field(unique=True, index=True, max_length=25)

    @field_validator("first_name", "last_name")
    @classmethod
    def validate_name(cls, v):
        if v is not None and len(v.strip()) == 0:
            return None


class User(UserBase, table=True):
    __tablename__ = "users"

    id: uuid.UUID = Field(default=uuid.uuid4, primary_key=True, index=True)
    hashed_password: str = Field(nullable=False, max_length=255)
    is_active: bool = Field(default=True)
    is_verified: bool = Field(default=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime] = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column_kwargs={"onupdate": lambda: datetime.now(timezone.utc)},
    )

    def set_password(self, password: str) -> None:
        """hash and set the password"""
        self.hashed_password = pwd_context.hash(password)

    def verify_password(self, passwprd: str) -> None:
        """verify password againt saved password in database"""
        pwd_context.verify(passwprd, self.hashed_password)

    @property
    def full_name(self) -> str:
        """return the users fullname (property allows function call without paranthesis)"""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        elif self.first_name:
            return f"{self.first_name}"
        elif self.last_name:
            return f"{self.last_name}"
        else:
            return "Anonymous"
