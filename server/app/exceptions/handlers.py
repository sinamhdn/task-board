import logging
import os
from dataclasses import field
from typing import Any, TypedDict, cast

from fastapi import Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.templating import Jinja2Templates
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.responses import Response

logger = logging.getLogger(f"handlers logger: filename -> {__name__}")
templates = Jinja2Templates(
    directory=os.path.join(os.path.dirname(__file__), "../../templates")
)


class ErrorMessage(TypedDict):
    field: str
    msg: str


form_fields = [
    "email",
    "password",
    "confirm",
    "first_name",
    "last_name",
    "board_member_email",
    "board_name",
    "list_name",
    "card_name",
]


def _with_period(msg: str) -> str:
    return msg.rstrip(".") + "."


# fix pydantic error return format to be consistant
# @app.exception_handler(StarletteHTTPException)
def general_http_exception_handler(request: Request, exception: Exception) -> Response:
    exc = cast(StarletteHTTPException, exception)
    detail: Any = cast(dict[str, Any], exc.detail)

    if isinstance(detail, dict) and detail.get("field") and detail.get("msg"):
        field, msg = str(detail["field"]), str(detail["msg"])
    else:
        field, msg = "server_error", (
            str(detail)
            if detail
            else ("An error occurred. Please check your request and try again.")
        )

    if field not in form_fields:
        field = "server_error"

    if request.url.path.startswith("/api"):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": [{"field": field, "msg": _with_period(msg)}]},
        )

    return templates.TemplateResponse(
        request,
        "error.html",
        {
            "status_code": exc.status_code,
            "title": exc.status_code,
            "message": {"field": field, "msg": msg},
        },
        status_code=exc.status_code,
    )


# @app.exception_handler(RequestValidationError)
def validation_exception_handler(request: Request, exception: Exception) -> Response:
    exc = cast(RequestValidationError, exception)
    logger.error("what does validation_exception_handler recieve: ", exc)

    errors: list[ErrorMessage] = []
    for error in exc.errors():
        loc = error.get("loc") or ()
        raw_fields = loc[-1] if loc else None
        msg = str(error.get("msg") or "Unknown validation error")
        if isinstance(raw_fields, str) and raw_fields in form_fields:
            errors.append({"field": raw_fields, "msg": msg})
        else:
            errors.append({"field": "server_error", "msg": _with_period(msg)})

    if request.url.path.startswith("/api"):
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            content={"detail": errors},
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
    logger.exception("unhandled exception", exc_info=exc)

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
