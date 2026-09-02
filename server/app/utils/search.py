from typing import List, Union

from sqlalchemy import or_, select

from ..models.boards import Board
from ..models.users import User
from ..schemas.boards import BoardResponse
from ..schemas.users import UserPublicResponse
from ..utils.db import AsyncSession


# for search you can use like or ilike but ilike is for case insensitive seach that only postgresql supports
class SearchService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def search_users(
        self, query: str, limit: int = 20
    ) -> List[UserPublicResponse]:
        stmt = (
            select(User)
            .where(
                or_(
                    User.email.like(f"%{query.lower()}%"),
                    User.first_name.like(f"%{query.lower()}%"),
                    User.last_name.like(f"%{query.lower()}%"),
                )
            )
            .limit(limit)
        )

        result = await self.db.execute(stmt)
        users = result.scalars().all()
        return [
            UserPublicResponse.model_validate(user, from_attributes=True)
            for user in users
        ]

    async def search_boards(self, query: str, limit: int = 20) -> List[BoardResponse]:
        stmt = (
            select(Board)
            .where(
                or_(
                    Board.name.like(f"%{query.lower()}%"),
                    Board.owner.like(f"%{query.lower()}%"),
                )
            )
            .limit(limit)
        )

        result = await self.db.execute(stmt)
        boards = result.scalars().all()
        return [
            BoardResponse.model_validate(board, from_attributes=True)
            for board in boards
        ]

    async def search_all(
        self, search_type: str, query: str, limit: int = 20
    ) -> Union[List[UserPublicResponse], List[BoardResponse]]:
        if search_type == "user":
            print("SEARCH SEARCH SEARCH")
            return await self.search_users(query=query, limit=limit)
        elif search_type == "board":
            return await self.search_boards(query=query, limit=limit)
        else:
            print("ERR ERR ERR")
            raise ValueError("search_type must be user or board.")
