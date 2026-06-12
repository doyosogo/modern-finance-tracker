from decimal import Decimal

from pydantic import BaseModel, Field


class DashboardSummaryRead(BaseModel):
    total_income: Decimal = Field(max_digits=12, decimal_places=2)
    total_expenses: Decimal = Field(max_digits=12, decimal_places=2)
    balance: Decimal = Field(max_digits=12, decimal_places=2)
    transaction_count: int
    budget_count: int
    goal_count: int
