from typing import Annotated, Any

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.auth import decode_access_token
from app.core.database import get_db
from app.models.user import User


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")
DbSession = Annotated[Session, Depends(get_db)]
Token = Annotated[str, Depends(oauth2_scheme)]


def raise_authentication_error() -> None:
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated.",
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_user_id_from_payload(payload: dict[str, Any]) -> int:
    subject = payload.get("sub")

    if subject is None:
        raise_authentication_error()

    try:
        return int(subject)
    except (TypeError, ValueError):
        raise_authentication_error()


def get_current_user(token: Token, db: DbSession) -> User:
    try:
        payload = decode_access_token(token)
    except ValueError:
        raise_authentication_error()

    user_id = get_user_id_from_payload(payload)
    user = db.get(User, user_id)

    if user is None:
        raise_authentication_error()

    return user


CurrentUser = Annotated[User, Depends(get_current_user)]
