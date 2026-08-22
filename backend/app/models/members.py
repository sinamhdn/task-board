from sqlalchemy import Column, ForeignKey, Table

from ..utils.db import Base

members_table = Table(
    "members",
    Base.metadata,
    Column("user_id", ForeignKey("users.id"), primary_key=True),
    Column("board_id", ForeignKey("boards.id"), primary_key=True),
)
