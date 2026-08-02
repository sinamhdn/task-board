# from dotenv import load_dotenv
import asyncio
import json
import os
from contextlib import asynccontextmanager

import socketio
import uvicorn
from fastapi import (
    FastAPI,
)
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from socketio import events
from socketio.server import sio
from starlette.exceptions import HTTPException as StarletteHTTPException

from .exceptions.handlers import (
    general_http_exception_handler,
    unhandled_exception_handler,
    validation_exception_handler,
)
from .routers.auth import router as auth_router
from .routers.boards import router as boards_router
from .routers.frontend import router as frontend_router
from .routers.tests import router as tests_router
from .routers.users import router as users_router
from .routers.ws import router as websocket_router
from .utils.db import create_tables_async, dispose_engine
from .utils.utilities import periodic_cleanup

# from pathlib import Path
# load_dotenv(Path(os.path.join(os.path.dirname(os.path.abspath(__file__))), "../.env"))


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Startup
    await create_tables_async()
    cleanup_task = asyncio.create_task(periodic_cleanup(interval_minutes=30))
    yield
    # Shutdown
    await dispose_engine()
    cleanup_task.cancel()


app = FastAPI(
    title="Trello Clone API",
    description="An API for a simple Trello Clone in React.",
    version="1.0.0",
    lifespan=lifespan,
)


origins = json.loads(os.getenv("FRONT_END_ORIGINS", "[]"))
static_dir = os.path.join(os.path.dirname(__file__), "../static")
media_dir = os.path.join(os.path.dirname(__file__), "../media")
os.makedirs(static_dir, exist_ok=True)
os.makedirs(media_dir, exist_ok=True)


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.mount("/static", StaticFiles(directory=static_dir), name="static")
app.mount("/media", StaticFiles(directory=media_dir), name="media")
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(users_router, prefix="/api/users", tags=["users"])
app.include_router(boards_router, prefix="/api/boards", tags=["boards"])
app.include_router(tests_router, prefix="/api/tests", tags=["tests"])
app.include_router(websocket_router, prefix="/api/ws", tags=["ws"])
app.include_router(frontend_router, prefix="", tags=["frontend"])
app.add_exception_handler(StarletteHTTPException, general_http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, unhandled_exception_handler)

socket_app = socketio.ASGIApp(sio, other_asgi_app=app)


if __name__ == "__main__":
    uvicorn.run("main:socket_app", host="127.0.0.1", port=8000, reload=True)
