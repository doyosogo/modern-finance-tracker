from datetime import date as Date
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.schemas.category import CategoryRead
from app.schemas.common import RecurringFrequency, TransactionType


class TransactionBase(BaseModel):
    type: TransactionType
    description: str = Field(min_length=1, max_length=255)
    amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    category_id: int = Field(gt=0)
    date: Date
    is_recurring: bool = False
    recurring_frequency: RecurringFrequency | None = None

    @model_validator(mode="after")
    def validate_recurring_frequency(self):
        if self.is_recurring and self.recurring_frequency is None:
            raise ValueError("recurring_frequency is required for recurring transactions")

        if not self.is_recurring and self.recurring_frequency is not None:
            raise ValueError("recurring_frequency must be null for non-recurring transactions")

        return self


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    type: TransactionType | None = None
    description: str | None = Field(default=None, min_length=1, max_length=255)
    amount: Decimal | None = Field(default=None, gt=0, max_digits=12, decimal_places=2)
    category_id: int | None = Field(default=None, gt=0)
    date: Date | None = None
    is_recurring: bool | None = None
    recurring_frequency: RecurringFrequency | None = None

    @model_validator(mode="after")
    def validate_recurring_frequency_patch(self):
        if self.is_recurring is False and self.recurring_frequency is not None:
            raise ValueError("recurring_frequency must be null for non-recurring transactions")

        return self


class TransactionRead(TransactionBase):
    id: int
    category: CategoryRead
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
