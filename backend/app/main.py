from fastapi import FastAPI
from fastapi.security import OAuth2PasswordBearer
from dotenv import load_dotenv
from utils.db import create_tables
from api.v1.endpoints.auth import router as auth_router
from api.v1.endpoints.users import router as users_router

load_dotenv()
create_tables()

app = FastAPI(
    title="Trello Clone API",
    description="An API for a simple Trello Clone in React.",
    version="1.0.0",
)

app.include_router(auth_router)
app.include_router(users_router)
