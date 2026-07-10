import os

from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

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
    Base.metadata.create_all(engine)


async def create_tables_async():
    """Create all tables"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def dispose_engine():
    """Dispose engine"""
    await engine.dispose()


def get_db_session():
    """Get database session"""
    with Session(engine) as session:
        yield session


async def get_async_db_session():
    """Get async database session"""
    async with AsyncSessionLocal() as session:
        yield session
