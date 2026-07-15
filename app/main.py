import mimetypes
import os
from contextlib import asynccontextmanager
from pathlib import Path

# from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, status
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from .routers.auth import router as auth_router
from .routers.users import router as users_router
from .utils.db import create_tables_async, dispose_engine
from .utils.settings import settings

# from pathlib import Path


static_dir = os.path.join(os.path.dirname(__file__), "../static")
media_dir = os.path.join(os.path.dirname(__file__), "../media")

# load_dotenv(Path(os.path.join(os.path.dirname(os.path.abspath(__file__))), "../.env"))


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

app.mount("/static", StaticFiles(directory=static_dir), name="static")
app.mount("/media", StaticFiles(directory=media_dir), name="media")

app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(users_router, prefix="/api/users", tags=["users"])

""" Static Assets Frontend Serving"""
"""
# Determine the path to the built frontend
frontend_dir = f"../ui/dist"
if os.getenv("IS_LOCAL_STATIC_DIR") == "true":
    static_dir = f"../ui/dist"
# Mount the directory.
# html=False means it won't automatically search for index.html; we handle that manually.
app.mount("/frontend", StaticFiles(directory=frontend_dir, html=False), name="frontend")
"""
""" Static Assets Frontend Serving"""

""" SPA Routing Frontend Serving"""

PROJECT_BASE = Path(__file__).resolve().parent.parent


@app.get("/{full_path:path}")
def frontend(full_path: str):
    frontend_dir = PROJECT_BASE / "ui/dist"

    # Handle local dev paths
    if settings.is_local_static_dir == "true":
        frontend_dir = PROJECT_BASE / "ui/dist"

    return get_file_response_or_404(
        os.path.join(frontend_dir, full_path),  # Try to serve the specific file
        os.path.join(frontend_dir, "index.html"),  # Fallback to index.html
    )


def get_file_response_or_404(
    file_path: str, fallback_file_path: str, error_message: str = "File not found"
):
    """
    Helper function to return a FileResponse if a file exists,
    or fall back to a default file. Raises HTTP 404 if neither is found.

    Args:
        file_path (str): Path to the requested file.
        fallback_file_path (str): Path to the fallback file.
        error_message (str): Optional error message for the 404 exception.

    Returns:
        FileResponse: File response for the requested or fallback file.

    Raises:
        HTTPException: If neither the requested nor fallback file exists.
    """

    if os.path.exists(file_path) and os.path.isfile(file_path):
        mime_type, _ = mimetypes.guess_type(file_path)
        return FileResponse(file_path, media_type=mime_type)

    if os.path.exists(fallback_file_path):
        mime_type, _ = mimetypes.guess_type(fallback_file_path)
        return FileResponse(fallback_file_path, media_type=mime_type)

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=error_message)


""" SPA Routing Frontend Serving"""
