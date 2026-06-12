from decimal import Decimal

from pydantic import BaseModel, Field


class SpendingByCategoryRead(BaseModel):
    category_id: int
    category_name: str
    amount: Decimal = Field(max_digits=12, decimal_places=2)


class MonthlySummaryRead(BaseModel):
    month: str
    income: Decimal = Field(max_digits=12, decimal_places=2)
    expenses: Decimal = Field(max_digits=12, decimal_places=2)
    balance: Decimal = Field(max_digits=12, decimal_places=2)


class BudgetProgressRead(BaseModel):
    budget_id: int
    category_name: str
    budget_amount: Decimal = Field(max_digits=12, decimal_places=2)
    spent_amount: Decimal = Field(max_digits=12, decimal_places=2)
    remaining_amount: Decimal = Field(max_digits=12, decimal_places=2)
    percentage_used: Decimal = Field(max_digits=12, decimal_places=2)


class FinancialInsightsRead(BaseModel):
    highest_expense_category: str | None
    highest_expense_amount: Decimal = Field(max_digits=12, decimal_places=2)
    average_monthly_expenses: Decimal = Field(max_digits=12, decimal_places=2)
    average_monthly_income: Decimal = Field(max_digits=12, decimal_places=2)
    savings_rate: Decimal = Field(max_digits=12, decimal_places=2)
