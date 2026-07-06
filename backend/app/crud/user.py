from sqlmodel import Session, select
from typing import Optional, List
import uuid
from ..models.user import User
from ..schemas.user import UserCreate, UserUpdate


class UserCRUD:
    @staticmethod
    def create_user(session: Session, user_data: UserCreate) -> User:
        """Create a new user with hashed password"""
        # Check if email exists
        existing = session.exec(
            select(User).where(User.email == user_data.email)
        ).first()
        if existing:
            raise ValueError("Email already registered")

        # Create user
        db_user = User(
            email=user_data.email,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
        )
        db_user.set_password(user_data.password)

        session.add(db_user)
        session.commit()
        session.refresh(db_user)
        return db_user

    @staticmethod
    def get_user_by_email(session: Session, email: str) -> Optional[User]:
        """Get user by email"""
        return session.exec(select(User).where(User.email == email)).first()

    @staticmethod
    def get_user_by_id(session: Session, user_id: uuid.UUID) -> Optional[User]:
        """Get user by ID"""
        return session.get(User, user_id)

    @staticmethod
    def get_users(session: Session, skip: int = 0, limit: int = 100) -> List[User]:
        """Get all users with pagination"""
        return session.exec(select(User).offset(skip).limit(limit)).all()

    @staticmethod
    def update_user(session: Session, user: User, user_data: UserUpdate) -> User:
        """Update user information"""
        update_data = user_data.dict(exclude_unset=True)

        # Handle password separately
        if "password" in update_data and update_data["password"]:
            user.set_password(update_data.pop("password"))

        # Update other fields
        for field, value in update_data.items():
            setattr(user, field, value)

        session.add(user)
        session.commit()
        session.refresh(user)
        return user

    @staticmethod
    def authenticate_user(
        session: Session, email: str, password: str
    ) -> Optional[User]:
        """Authenticate user with email and password"""
        user = UserCRUD.get_user_by_email(session, email)
        if not user or not user.verify_password(password):
            return None
        if not user.is_active:
            return None
        return user

    @staticmethod
    def delete_user(session: Session, user: User) -> None:
        """Delete user (soft delete by setting inactive)"""
        user.is_active = False
        session.add(user)
        session.commit()
