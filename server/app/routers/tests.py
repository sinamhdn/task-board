from fastapi import APIRouter
from fastapi.exceptions import HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="", tags=["tests"])


class ItemCreate(BaseModel):
    name: str
    quantity: int


@router.get("/test-http-error")
def test_http_error():
    raise HTTPException(status_code=404, detail="This is a test http error")


@router.post("/test-validation-error")
def test_validation_error(item: ItemCreate):
    return item


@router.get("/test-query-validation")
def test_query_validation(page: int):
    return {"page": page}
