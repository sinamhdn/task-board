from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from .api.v1.endpoints.auth import router as auth_router
from .api.v1.endpoints.users import router as users_router
from .utils.db import create_tables, create_tables_async, dispose_engine

load_dotenv()
create_tables()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Startup
    await create_tables_async()
    yield
    # Shutdown
    await dispose_engine()


app = FastAPI(
    title="Trello Clone API",
    description="An API for a simple Trello Clone in React.",
    version="1.0.0",
    lifespan=lifespan,
)

app.mount("/static", StaticFiles(directory="static", name="static"))
app.mount("/media", StaticFiles(directory="media", name="media"))

app.include_router(auth_router, prefix="/api/auth", tag=["auth"])
app.include_router(users_router, prefix="/api/user", tags=["users"])
