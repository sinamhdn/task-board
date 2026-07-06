from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session
from utils.db import get_session
from schemas.user import UserResponse, UserCreate
from crud.user import UserCRUD

router = APIRouter(prefix="/authentication", tags=["users"])


@router.post("/register", response_model=UserResponse)
def register_user(user_data: UserCreate, session: Session = Depends(get_session)):
    """Register a new user"""
    try:
        user = UserCRUD.create_user(session, user_data)
        return UserResponse(**user.model_dump())
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/login")
def login_user(email: str, password: str, session: Session = Depends(get_session)):
    """Login user"""
    user = UserCRUD.authenticate_user(session, email, password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials"
        )
    # Return JWT token here
    return {"message": "Login successful"}
