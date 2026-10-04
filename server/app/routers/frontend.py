import mimetypes
import os
from pathlib import Path

from fastapi import (
    APIRouter,
    HTTPException,
    status,
)
from fastapi.responses import FileResponse
from fastapi.templating import Jinja2Templates

from ..settings import settings

router = APIRouter(prefix="", tags=["ws"])
templates = Jinja2Templates(directory="templates")

PROJECT_BASE = Path(__file__).resolve().parent.parent

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


@router.get("/{full_path:path}")
def frontend(full_path: str):
    frontend_dir = PROJECT_BASE / "../templates"

    # Handle local dev paths
    if settings.is_local_static_dir == "true":
        frontend_dir = PROJECT_BASE / "../templates"

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

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail={"field": "server_error", "msg": error_message},
    )


""" SPA Routing Frontend Serving"""
