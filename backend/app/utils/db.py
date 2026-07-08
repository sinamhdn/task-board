from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
import os

# Sync database
DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://postgres:password@localhost:5432/test_db"
)
engine = create_engine(
    DATABASE_URL, echo=True, connect_args={"check_same_thread": False}
)

# Async database
ASYNC_DATABASE_URL = os.getenv(
    "ASYNC_DATABASE_URL",
    "postgresql+asyncpg://postgres:password@localhost:5432/test_db",
)
async_engine = create_async_engine(
    ASYNC_DATABASE_URL, echo=True, connect_args={"check_same_thread": False}
)
AsyncSessionLocal = sessionmaker(
    async_engine, class_=AsyncSession, expire_on_commit=False
)


class Base(DeclarativeBase):
    pass


def create_tables():
    """Create all tables"""
    SQLModel.metadata.create_all(engine)


def get_session():
    """Get database session"""
    with Session(engine) as session:
        yield session


async def get_async_session():
    """Get async database session"""
    async with AsyncSessionLocal() as session:
        yield session
