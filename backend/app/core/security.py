from passlib.context import CryptContext


MAX_BCRYPT_PASSWORD_BYTES = 72

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def validate_bcrypt_password_length(password: str) -> None:
    if len(password.encode("utf-8")) > MAX_BCRYPT_PASSWORD_BYTES:
        raise ValueError("Password cannot exceed 72 bytes.")


def hash_password(password: str) -> str:
    validate_bcrypt_password_length(password)
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    validate_bcrypt_password_length(password)
    return pwd_context.verify(password, password_hash)
