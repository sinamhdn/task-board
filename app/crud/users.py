import uuid
from typing import List, Optional

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import Session, select

from ..models.users import User
from ..schemas.users import UserCreate, UserUpdate
from ..utils.auth import set_password, verify_password


class UserCRUD:
    @staticmethod
    async def get_user_by_email(session: AsyncSession, email: str) -> Optional[User]:
        """Get user by email"""
        result = await session.execute(
            select(User).where(func.lower(User.email) == email.lower())
        )
        return result.scalars().first()

    @staticmethod
    async def get_user_by_id(session: AsyncSession, user_id: int) -> Optional[User]:
        """Get user by ID"""
        return await session.get(User, user_id)

    @staticmethod
    async def get_users(
        session: AsyncSession,
        order: str = "updated_at",
        skip: int = 0,
        limit: int = 100,
    ) -> List[User]:
        """Get all users with pagination"""

        def get_order_column(model, order_by: str = "updated_at"):
            # Handle optional descending prefix (e.g., "-created_at")
            if order_by.startswith("-"):
                col_name = order_by[1:]
                descending = True
            else:
                col_name = order_by
                descending = False

            if not hasattr(model, col_name):
                raise ValueError(f"Invalid column: {col_name}")

            column = getattr(model, col_name)
            return column.desc() if descending else column

        result = await session.execute(
            select(User)
            .order_by(get_order_column(User, order))
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    @staticmethod
    async def create_user(session: AsyncSession, user_data: UserCreate) -> User:
        """Create a new user with hashed password"""
        #     result = await db.execute(select(models.User).where(
        #         func.lower(models.User.username) == user.username.lower(),
        #     ),
        # )
        # existing_user = result.scalars().first()
        # if existing_user:
        #     raise HTTPException(
        #         status_code=status.HTTP_400_BAD_REQUEST,
        #         detail="Username already exists",
        #     )
        # Check if email exists
        existing = await session.execute(
            select(User).where(func.lower(User.email) == user_data.email.lower())
        )
        if existing.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )

        # Create user
        new_user = User(
            email=user_data.email,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
        )
        set_password(new_user, user_data.password)

        session.add(new_user)
        await session.commit()
        await session.refresh(new_user)
        return new_user

    @staticmethod
    async def update_user(
        session: AsyncSession, user: User, user_data: UserUpdate
    ) -> User:
        """Update user information"""
        if (
            user_data.email is not None
            and user_data.email.lower() != user.email.lower()
        ):
            result = await session.execute(
                select(User).where(func.lower(User.email) == user_data.email.lower())
            )
            existing_user = result.scalars().first()
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already exists.",
                )

        if user_data.email is not None:
            user.email = user_data.email
        if user_data.image_file is not None:
            user.image_file = user_data.image_file
        if user_data.first_name is not None:
            user.first_name = user_data.first_name
        if user_data.last_name is not None:
            user.last_name = user_data.last_name

        await session.commit()
        await session.refresh(user)
        return user

    @staticmethod
    async def authenticate_user(
        session: AsyncSession, email: str, password: str
    ) -> Optional[User]:
        """Authenticate user with email and password"""
        user = await UserCRUD.get_user_by_email(session, email)
        if not user or not verify_password(user, password):
            return None
        if not user.is_active:
            return None
        return user

    @staticmethod
    async def delete_user(session: AsyncSession, user: User) -> None:
        """Delete user (soft delete by setting inactive)"""
        user.is_active = False
        await session.delete(user)
        await session.commit()


#  @staticmethod
#     async def update_user(
#         session: AsyncSession, user: User, user_data: UserUpdate
#     ) -> User:
"""Update user information"""
# update_data = user_data.model_dump(exclude_unset=True)

# # Handle password separately
# if "password" in update_data and update_data["password"]:
#     set_password(user, update_data.pop("password"))

# # Update other fields
# for field, value in update_data.items():
#     setattr(user, field, value)

# session.add(user)
# await session.commit()
# await session.refresh(user)
# if (
#     user_update.username is not None
#     and user_update.username.lower() != user.username.lower()
# ):
#     result = await db.execute(
#         select(models.User).where(
#             func.lower(models.User.username) == user_update.username.lower(),
#         ),
#     )
#     existing_user = result.scalars().first()
#     if existing_user:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="Username already exists",
#         )
