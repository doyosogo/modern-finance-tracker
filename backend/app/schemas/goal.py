from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, computed_field, field_validator


class GoalBase(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    target_amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    current_amount: Decimal = Field(default=Decimal("0"), ge=0, max_digits=12, decimal_places=2)

    @field_validator("name")
    @classmethod
    def normalize_name(cls, value: str) -> str:
        normalized_value = value.strip()

        if not normalized_value:
            raise ValueError("Goal name cannot be blank.")

        return normalized_value


class GoalCreate(GoalBase):
    pass


class GoalUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    target_amount: Decimal | None = Field(default=None, gt=0, max_digits=12, decimal_places=2)
    current_amount: Decimal | None = Field(default=None, ge=0, max_digits=12, decimal_places=2)

    @field_validator("name")
    @classmethod
    def normalize_name(cls, value: str | None) -> str | None:
        if value is None:
            return value

        normalized_value = value.strip()

        if not normalized_value:
            raise ValueError("Goal name cannot be blank.")

        return normalized_value


class GoalRead(GoalBase):
    id: int
    created_at: datetime
    updated_at: datetime

    @computed_field
    @property
    def progress_percentage(self) -> Decimal:
        progress = (self.current_amount / self.target_amount) * 100
        return min(progress, Decimal("100"))

    model_config = ConfigDict(from_attributes=True)
