from decimal import Decimal, ROUND_HALF_UP
from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy import and_, case, extract, func, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.budget import Budget
from app.models.category import Category
from app.models.transaction import Transaction
from app.schemas.reports import (
    BudgetProgressRead,
    FinancialInsightsRead,
    MonthlySummaryRead,
    SpendingByCategoryRead,
)


router = APIRouter(prefix="/api/reports", tags=["reports"])
DbSession = Annotated[Session, Depends(get_db)]
ZERO_MONEY = Decimal("0.00")
ONE_HUNDRED = Decimal("100.00")


def money(value: Decimal | int | float | None) -> Decimal:
    if value is None:
        return ZERO_MONEY

    return Decimal(str(value)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def format_month(year: int, month: int) -> str:
    return f"{year:04d}-{month:02d}"


def get_spending_by_category_rows(db: Session) -> list[SpendingByCategoryRead]:
    total_amount = func.coalesce(func.sum(Transaction.amount), ZERO_MONEY).label(
        "amount"
    )
    statement = (
        select(Category.id, Category.name, total_amount)
        .join(Transaction, Transaction.category_id == Category.id)
        .where(Transaction.type == "expense")
        .group_by(Category.id, Category.name)
        .order_by(total_amount.desc(), Category.name)
    )

    return [
        SpendingByCategoryRead(
            category_id=category_id,
            category_name=category_name,
            amount=money(amount),
        )
        for category_id, category_name, amount in db.execute(statement).all()
    ]


def get_monthly_summary_rows(db: Session) -> list[MonthlySummaryRead]:
    year_part = extract("year", Transaction.date)
    month_part = extract("month", Transaction.date)
    income_total = func.coalesce(
        func.sum(
            case(
                (Transaction.type == "income", Transaction.amount),
                else_=ZERO_MONEY,
            )
        ),
        ZERO_MONEY,
    )
    expense_total = func.coalesce(
        func.sum(
            case(
                (Transaction.type == "expense", Transaction.amount),
                else_=ZERO_MONEY,
            )
        ),
        ZERO_MONEY,
    )
    statement = (
        select(year_part, month_part, income_total, expense_total)
        .group_by(year_part, month_part)
        .order_by(year_part, month_part)
    )

    rows: list[MonthlySummaryRead] = []

    for year, month, income, expenses in db.execute(statement).all():
        monthly_income = money(income)
        monthly_expenses = money(expenses)
        rows.append(
            MonthlySummaryRead(
                month=format_month(int(year), int(month)),
                income=monthly_income,
                expenses=monthly_expenses,
                balance=money(monthly_income - monthly_expenses),
            )
        )

    return rows


@router.get(
    "/spending-by-category",
    response_model=list[SpendingByCategoryRead],
    status_code=status.HTTP_200_OK,
)
def get_spending_by_category(db: DbSession) -> list[SpendingByCategoryRead]:
    return get_spending_by_category_rows(db)


@router.get(
    "/monthly-summary",
    response_model=list[MonthlySummaryRead],
    status_code=status.HTTP_200_OK,
)
def get_monthly_summary(db: DbSession) -> list[MonthlySummaryRead]:
    return get_monthly_summary_rows(db)


@router.get(
    "/budget-progress",
    response_model=list[BudgetProgressRead],
    status_code=status.HTTP_200_OK,
)
def get_budget_progress(db: DbSession) -> list[BudgetProgressRead]:
    spent_total = func.coalesce(func.sum(Transaction.amount), ZERO_MONEY).label(
        "spent_amount"
    )
    statement = (
        select(Budget.id, Category.name, Budget.amount, spent_total)
        .join(Category, Budget.category_id == Category.id)
        .outerjoin(
            Transaction,
            and_(
                Transaction.category_id == Budget.category_id,
                Transaction.type == "expense",
            ),
        )
        .group_by(Budget.id, Category.name, Budget.amount)
        .order_by(Category.name, Budget.id)
    )

    rows: list[BudgetProgressRead] = []

    for budget_id, category_name, budget_amount, spent_amount in db.execute(statement).all():
        budget_total = money(budget_amount)
        spent_total_value = money(spent_amount)
        percentage_used = (
            money((spent_total_value / budget_total) * ONE_HUNDRED)
            if budget_total > ZERO_MONEY
            else ZERO_MONEY
        )
        rows.append(
            BudgetProgressRead(
                budget_id=budget_id,
                category_name=category_name,
                budget_amount=budget_total,
                spent_amount=spent_total_value,
                remaining_amount=money(budget_total - spent_total_value),
                percentage_used=percentage_used,
            )
        )

    return rows


@router.get(
    "/financial-insights",
    response_model=FinancialInsightsRead,
    status_code=status.HTTP_200_OK,
)
def get_financial_insights(db: DbSession) -> FinancialInsightsRead:
    expense_amount = func.coalesce(func.sum(Transaction.amount), ZERO_MONEY).label(
        "amount"
    )
    highest_expense_statement = (
        select(Category.name, expense_amount)
        .join(Transaction, Transaction.category_id == Category.id)
        .where(Transaction.type == "expense")
        .group_by(Category.id, Category.name)
        .order_by(expense_amount.desc(), Category.name)
        .limit(1)
    )
    highest_expense = db.execute(highest_expense_statement).one_or_none()

    monthly_summary = get_monthly_summary_rows(db)

    month_count = len(monthly_summary)

    if month_count == 0:
        return FinancialInsightsRead(
            highest_expense_category=None,
            highest_expense_amount=ZERO_MONEY,
            average_monthly_expenses=ZERO_MONEY,
            average_monthly_income=ZERO_MONEY,
            savings_rate=ZERO_MONEY,
        )

    total_income = sum((row.income for row in monthly_summary), ZERO_MONEY)
    total_expenses = sum((row.expenses for row in monthly_summary), ZERO_MONEY)
    average_income = money(total_income / month_count)
    average_expenses = money(total_expenses / month_count)
    savings_rate = (
        money(((average_income - average_expenses) / average_income) * ONE_HUNDRED)
        if average_income > ZERO_MONEY
        else ZERO_MONEY
    )

    return FinancialInsightsRead(
        highest_expense_category=(
            highest_expense[0] if highest_expense is not None else None
        ),
        highest_expense_amount=(
            money(highest_expense[1]) if highest_expense is not None else ZERO_MONEY
        ),
        average_monthly_expenses=average_expenses,
        average_monthly_income=average_income,
        savings_rate=savings_rate,
    )
