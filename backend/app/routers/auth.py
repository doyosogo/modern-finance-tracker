from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.auth import create_access_token
from app.core.database import get_db
from app.core.security import hash_password, verify_password
from app.models.user import User
from app.schemas.user import TokenRead, UserCreate, UserLogin, UserRead


router = APIRouter(prefix="/api/auth", tags=["auth"])
DbSession = Annotated[Session, Depends(get_db)]
INVALID_LOGIN_DETAIL = "Invalid email or password."


def raise_if_duplicate_email(db: Session, email: str) -> None:
    existing_user_id = db.scalar(select(User.id).where(User.email == email).limit(1))

    if existing_user_id is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered.",
        )


def authenticate_user(db: Session, user_in: UserLogin) -> User:
    user = db.scalar(select(User).where(User.email == user_in.email).limit(1))

    if user is None or not verify_password(user_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=INVALID_LOGIN_DETAIL,
        )

    return user


@router.post(
    "/register",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
)
def register_user(user_in: UserCreate, db: DbSession) -> User:
    raise_if_duplicate_email(db, user_in.email)

    user = User(
        email=user_in.email,
        password_hash=hash_password(user_in.password),
        full_name=user_in.full_name,
    )
    db.add(user)

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered.",
        ) from exc

    db.refresh(user)
    return user


@router.post(
    "/login",
    response_model=TokenRead,
    status_code=status.HTTP_200_OK,
)
def login_user(user_in: UserLogin, db: DbSession) -> TokenRead:
    user = authenticate_user(db, user_in)
    access_token = create_access_token(subject=str(user.id), email=user.email)

    return TokenRead(access_token=access_token)
