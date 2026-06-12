from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy import case, func, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.budget import Budget
from app.models.goal import Goal
from app.models.transaction import Transaction
from app.schemas.dashboard import DashboardSummaryRead


router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])
DbSession = Annotated[Session, Depends(get_db)]
ZERO_MONEY = Decimal("0.00")


def get_transaction_totals(db: Session) -> tuple[Decimal, Decimal, int]:
    statement = select(
        func.coalesce(
            func.sum(
                case(
                    (Transaction.type == "income", Transaction.amount),
                    else_=ZERO_MONEY,
                )
            ),
            ZERO_MONEY,
        ),
        func.coalesce(
            func.sum(
                case(
                    (Transaction.type == "expense", Transaction.amount),
                    else_=ZERO_MONEY,
                )
            ),
            ZERO_MONEY,
        ),
        func.count(Transaction.id),
    )
    total_income, total_expenses, transaction_count = db.execute(statement).one()

    return total_income, total_expenses, transaction_count


def get_table_count(db: Session, model: type[Budget] | type[Goal]) -> int:
    return db.scalar(select(func.count(model.id))) or 0


@router.get(
    "/summary",
    response_model=DashboardSummaryRead,
    status_code=status.HTTP_200_OK,
)
def get_dashboard_summary(db: DbSession) -> DashboardSummaryRead:
    total_income, total_expenses, transaction_count = get_transaction_totals(db)
    budget_count = get_table_count(db, Budget)
    goal_count = get_table_count(db, Goal)

    return DashboardSummaryRead(
        total_income=total_income,
        total_expenses=total_expenses,
        balance=total_income - total_expenses,
        transaction_count=transaction_count,
        budget_count=budget_count,
        goal_count=goal_count,
    )
