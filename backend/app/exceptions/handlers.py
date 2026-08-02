import logging
import os
from typing import TypedDict, cast

from fastapi import Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.templating import Jinja2Templates
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.responses import Response

logger = logging.getLogger(__name__)
templates = Jinja2Templates(
    directory=os.path.join(os.path.dirname(__file__), "../../templates")
)


class ErrorMessage(TypedDict):
    field: str
    msg: str


# fix pydantic error return format to be consistant
# @app.exception_handler(StarletteHTTPException)
def general_http_exception_handler(request: Request, exception: Exception) -> Response:
    exc = cast(StarletteHTTPException, exception)

    detail = exc.detail
    if isinstance(detail, dict):
        message = (
            detail
            if detail
            else {
                "field": "server_error",
                "msg": "An error occurred. Please check your request and try again.",
            }
        )
        message = cast(ErrorMessage, detail)
    else:
        message = {
            "field": "server_error",
            "msg": str(detail),
        }

    if request.url.path.startswith("/api"):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": [{"field": message["field"], "msg": message["msg"]}]},
        )

    return templates.TemplateResponse(
        request,
        "error.html",
        {
            "status_code": exc.status_code,
            "title": exc.status_code,
            "message": message,
        },
        status_code=exc.status_code,
    )


# @app.exception_handler(RequestValidationError)
def validation_exception_handler(request: Request, exception: Exception) -> Response:
    exc = cast(RequestValidationError, exception)
    print("SHOW EXCEPTIONS ", exc.errors())

    request_validation_errors = []
    for error in exc.errors():
        error_item = (
            {"field": error["loc"][-1], "msg": error["msg"]}
            if error["loc"] and error["msg"]
            else {"field": "server_error", "msg": "Unknown Validation Error"}
        )
        request_validation_errors.append(error_item)
    print("request_validation_error", request_validation_errors)
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


# @app.exception_handler(Exception)
def unhandled_exception_handler(request: Request, exc: Exception) -> Response:
    logger.exception("Unhandled exception", exc_info=exc)

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
