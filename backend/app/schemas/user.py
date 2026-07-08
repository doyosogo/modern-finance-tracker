from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.core.security import MAX_BCRYPT_PASSWORD_BYTES


def normalize_email(value: EmailStr | str) -> str:
    normalized_value = value.strip().lower()

    if not normalized_value:
        raise ValueError("Email cannot be blank.")

    return normalized_value


def normalize_full_name(value: str) -> str:
    normalized_value = value.strip()

    if not normalized_value:
        raise ValueError("Full name cannot be blank.")

    return normalized_value


def normalize_password(value: str) -> str:
    normalized_value = value.strip()

    if not normalized_value:
        raise ValueError("Password cannot be blank.")

    if len(normalized_value) < 8:
        raise ValueError("Password must be at least 8 characters.")

    if len(normalized_value.encode("utf-8")) > MAX_BCRYPT_PASSWORD_BYTES:
        raise ValueError("Password cannot exceed 72 bytes.")

    return normalized_value


class UserCreate(BaseModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=72)
    full_name: str = Field(min_length=1, max_length=120)

    @field_validator("email", mode="before")
    @classmethod
    def validate_email(cls, value: str) -> str:
        return normalize_email(value)

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        return normalize_password(value)

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, value: str) -> str:
        return normalize_full_name(value)


class UserLogin(BaseModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=72)

    @field_validator("email", mode="before")
    @classmethod
    def validate_email(cls, value: str) -> str:
        return normalize_email(value)

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        return normalize_password(value)


class UserUpdate(BaseModel):
    email: EmailStr | None = Field(default=None, max_length=255)
    password: str | None = Field(default=None, min_length=8, max_length=72)
    full_name: str | None = Field(default=None, min_length=1, max_length=120)

    @field_validator("email", mode="before")
    @classmethod
    def validate_email(cls, value: str | None) -> str | None:
        if value is None:
            return value

        return normalize_email(value)

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str | None) -> str | None:
        if value is None:
            return value

        return normalize_password(value)

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, value: str | None) -> str | None:
        if value is None:
            return value

        return normalize_full_name(value)


class UserRead(BaseModel):
    id: int
    email: str
    full_name: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TokenRead(BaseModel):
    access_token: str
    token_type: str = "bearer"
