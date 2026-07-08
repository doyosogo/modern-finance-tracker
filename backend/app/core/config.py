from pathlib import Path

from pydantic import AnyUrl
from pydantic import ValidationError
from pydantic import computed_field
from pydantic import Field
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

ENV_FILE = Path(__file__).resolve().parents[2] / ".env"


class Settings(BaseSettings):
    app_name: str = "Finance Tracker API"
    debug: bool = False
    database_url: str = Field(min_length=1, validation_alias="DATABASE_URL")
    secret_key: str = Field(min_length=32, validation_alias="SECRET_KEY")
    algorithm: str = Field(validation_alias="ALGORITHM")
    access_token_expire_minutes: int = Field(
        gt=0,
        validation_alias="ACCESS_TOKEN_EXPIRE_MINUTES",
    )
    cors_origins_raw: str = Field(
        default="http://localhost:5173",
        validation_alias="CORS_ORIGINS",
    )

    model_config = SettingsConfigDict(
        env_file=ENV_FILE,
        env_file_encoding="utf-8",
        extra="ignore",
        env_prefix="",
    )

    @field_validator("database_url")
    @classmethod
    def validate_database_url(cls, value: str) -> str:
        try:
            parsed_url = AnyUrl(value)
        except ValueError as exc:
            raise ValueError("DATABASE_URL must be a valid database URL.") from exc

        if parsed_url.scheme not in {"postgresql", "postgresql+psycopg"}:
            raise ValueError(
                "DATABASE_URL must use postgresql:// or postgresql+psycopg://."
            )

        return value

    @field_validator("cors_origins_raw")
    @classmethod
    def validate_cors_origins(cls, value: str) -> str:
        origins = [origin.strip() for origin in value.split(",") if origin.strip()]

        if not origins:
            raise ValueError("CORS_ORIGINS must include at least one origin.")

        return value

    @field_validator("secret_key")
    @classmethod
    def validate_secret_key(cls, value: str) -> str:
        normalized_value = value.strip()

        if not normalized_value:
            raise ValueError("SECRET_KEY cannot be blank.")

        return normalized_value

    @field_validator("algorithm")
    @classmethod
    def validate_algorithm(cls, value: str) -> str:
        normalized_value = value.strip()

        if normalized_value != "HS256":
            raise ValueError("ALGORITHM must be HS256.")

        return normalized_value

    @computed_field
    @property
    def cors_origins(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.cors_origins_raw.split(",")
            if origin.strip()
        ]


try:
    settings = Settings()
except ValidationError as exc:
    errors = "; ".join(
        f"{'.'.join(str(part) for part in error['loc'])}: {error['msg']}"
        for error in exc.errors()
    )
    raise RuntimeError(f"Invalid application configuration: {errors}") from exc
