import asyncio
import logging
import mimetypes
import os
from contextlib import asynccontextmanager
from pathlib import Path

# from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from starlette.exceptions import HTTPException as StarletteHTTPException

from .routers.auth import router as auth_router
from .routers.users import router as users_router
from .tests.exceptions import router as test_router
from .utils.db import create_tables_async, dispose_engine
from .utils.settings import settings
from .utils.utilities import periodic_cleanup

# from pathlib import Path

templates = Jinja2Templates(directory="templates")

static_dir = os.path.join(os.path.dirname(__file__), "../static")
media_dir = os.path.join(os.path.dirname(__file__), "../media")
os.makedirs(static_dir, exist_ok=True)
os.makedirs(media_dir, exist_ok=True)

# load_dotenv(Path(os.path.join(os.path.dirname(os.path.abspath(__file__))), "../.env"))

logger = logging.getLogger(__name__)


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

origins = ["http://localhost:5173", "http://127.0.0.1:5173"]

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
app.include_router(test_router, prefix="/api/test", tags=["users"])

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


# @app.get("/{full_path:path}")
# def frontend(full_path: str):
#     frontend_dir = PROJECT_BASE / "templates"

#     # Handle local dev paths
#     if settings.is_local_static_dir == "true":
#         frontend_dir = PROJECT_BASE / "templates"

#     return get_file_response_or_404(
#         os.path.join(frontend_dir, full_path),  # Try to serve the specific file
#         os.path.join(frontend_dir, "index.html"),  # Fallback to index.html
#     )


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


# fix pydantic error return format to be consistant
@app.exception_handler(StarletteHTTPException)
def general_http_exception_handler(request: Request, exception: StarletteHTTPException):
    message = (
        exception.detail
        if exception.detail
        else "An error occurred. Please check your request and try again."
    )

    print(
        JSONResponse(
            status_code=exception.status_code,
            content={"detail": [{"field": "server_error", "msg": message}]},
        )
    )

    if request.url.path.startswith("/api"):
        return JSONResponse(
            status_code=exception.status_code,
            content={"detail": [{"field": "server_error", "msg": message}]},
        )

    return templates.TemplateResponse(
        request,
        "error.html",
        {
            "status_code": exception.status_code,
            "title": exception.status_code,
            "message": message,
        },
        status_code=exception.status_code,
    )


@app.exception_handler(RequestValidationError)
def validation_exception_handler(request: Request, exception: RequestValidationError):
    print("SHOW EXCEPTIONS ", exception.errors())

    request_validation_errors = []
    for error in exception.errors():
        error_item = (
            {"field": error["loc"][-1], "msg": error["msg"]}
            if error["loc"] and error["msg"]
            else {"field": "server_error", "msg": "Unknown Validation Error"}
        )
        request_validation_errors.append(error_item)

    if request.url.path.startswith("/api"):
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            content={"detail": request_validation_errors},
        )

    return templates.TemplateResponse(
        request,
        "error.html",
        {
            "status_code": status.HTTP_422_UNPROCESSABLE_CONTENT,
            "title": status.HTTP_422_UNPROCESSABLE_CONTENT,
            "message": "Invalid request. Please check your input and try again.",
        },
        status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
    )


@app.exception_handler(Exception)
def unhandled_exception_handler(request: Request, exception: Exception):
    logger.exception("Unhandled exception", exc_info=exception)

    if request.url.path.startswith("/api"):
        return JSONResponse(
            status_code=500,
            content={
                "detail": [{"field": "server_error", "msg": "Internal server error"}]
            },
        )

    return templates.TemplateResponse(
        request,
        "error.html",
        {
            "status_code": 500,
            "title": 500,
            "message": "Something went wrong. Please try again later.",
        },
        status_code=500,
    )
