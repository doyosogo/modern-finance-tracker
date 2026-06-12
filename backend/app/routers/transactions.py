from datetime import date as Date
from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import Select, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from app.core.database import get_db
from app.models.category import Category
from app.models.transaction import Transaction
from app.schemas.common import RecurringFrequency, TransactionType
from app.schemas.transaction import TransactionCreate, TransactionRead, TransactionUpdate


router = APIRouter(prefix="/api/transactions", tags=["transactions"])
DbSession = Annotated[Session, Depends(get_db)]
TransactionTypeFilter = Annotated[TransactionType | None, Query(alias="type")]
MonthFilter = Annotated[
    str | None,
    Query(
        pattern=r"^\d{4}-(0[1-9]|1[0-2])$",
        description="Filter transactions by month using YYYY-MM format.",
    ),
]


def get_transaction_or_404(db: Session, transaction_id: int) -> Transaction:
    statement = (
        select(Transaction)
        .options(selectinload(Transaction.category))
        .where(Transaction.id == transaction_id)
    )
    transaction = db.scalar(statement)

    if transaction is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found.",
        )

    return transaction


def get_category_or_404(db: Session, category_id: int) -> Category:
    category = db.get(Category, category_id)

    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found.",
        )

    return category


def get_transaction_for_response(db: Session, transaction_id: int) -> Transaction:
    return get_transaction_or_404(db, transaction_id)


def parse_month_range(month: str) -> tuple[Date, Date]:
    try:
        start = datetime.strptime(month, "%Y-%m").date()
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="month must use YYYY-MM format.",
        ) from exc

    if start.month == 12:
        end = Date(start.year + 1, 1, 1)
    else:
        end = Date(start.year, start.month + 1, 1)

    return start, end


def validate_recurring_state(
    is_recurring: bool,
    recurring_frequency: RecurringFrequency | str | None,
) -> None:
    if is_recurring and recurring_frequency is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="recurring_frequency is required for recurring transactions.",
        )

    if not is_recurring and recurring_frequency is not None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="recurring_frequency must be null for non-recurring transactions.",
        )


def apply_transaction_filters(
    statement: Select[tuple[Transaction]],
    search: str | None,
    transaction_type: TransactionType | None,
    category_id: int | None,
    month: str | None,
) -> Select[tuple[Transaction]]:
    if search:
        normalized_search = search.strip()

        if normalized_search:
            statement = statement.where(
                Transaction.description.ilike(f"%{normalized_search}%")
            )

    if transaction_type is not None:
        statement = statement.where(Transaction.type == transaction_type.value)

    if category_id is not None:
        statement = statement.where(Transaction.category_id == category_id)

    if month is not None:
        month_start, month_end = parse_month_range(month)
        statement = statement.where(
            Transaction.date >= month_start,
            Transaction.date < month_end,
        )

    return statement


@router.get("", response_model=list[TransactionRead], status_code=status.HTTP_200_OK)
def list_transactions(
    db: DbSession,
    search: str | None = None,
    transaction_type: TransactionTypeFilter = None,
    category_id: int | None = Query(default=None, gt=0),
    month: MonthFilter = None,
) -> list[Transaction]:
    statement = select(Transaction).options(selectinload(Transaction.category))
    statement = apply_transaction_filters(
        statement,
        search,
        transaction_type,
        category_id,
        month,
    )
    statement = statement.order_by(Transaction.date.desc(), Transaction.id.desc())

    return list(db.scalars(statement).all())


@router.get(
    "/{transaction_id}",
    response_model=TransactionRead,
    status_code=status.HTTP_200_OK,
)
def get_transaction(transaction_id: int, db: DbSession) -> Transaction:
    return get_transaction_or_404(db, transaction_id)


@router.post("", response_model=TransactionRead, status_code=status.HTTP_201_CREATED)
def create_transaction(
    transaction_in: TransactionCreate,
    db: DbSession,
) -> Transaction:
    get_category_or_404(db, transaction_in.category_id)

    transaction = Transaction(
        type=transaction_in.type.value,
        description=transaction_in.description,
        amount=transaction_in.amount,
        category_id=transaction_in.category_id,
        date=transaction_in.date,
        is_recurring=transaction_in.is_recurring,
        recurring_frequency=(
            transaction_in.recurring_frequency.value
            if transaction_in.recurring_frequency is not None
            else None
        ),
    )
    db.add(transaction)

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found.",
        ) from exc

    return get_transaction_for_response(db, transaction.id)


@router.patch(
    "/{transaction_id}",
    response_model=TransactionRead,
    status_code=status.HTTP_200_OK,
)
def update_transaction(
    transaction_id: int,
    transaction_in: TransactionUpdate,
    db: DbSession,
) -> Transaction:
    transaction = get_transaction_or_404(db, transaction_id)
    update_data = transaction_in.model_dump(exclude_unset=True)

    if "category_id" in update_data:
        get_category_or_404(db, update_data["category_id"])

    final_is_recurring = update_data.get("is_recurring", transaction.is_recurring)
    final_recurring_frequency = update_data.get(
        "recurring_frequency",
        transaction.recurring_frequency,
    )
    validate_recurring_state(final_is_recurring, final_recurring_frequency)

    for field, value in update_data.items():
        if isinstance(value, TransactionType):
            value = value.value
        elif isinstance(value, RecurringFrequency):
            value = value.value

        setattr(transaction, field, value)

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found.",
        ) from exc

    return get_transaction_for_response(db, transaction.id)


@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(transaction_id: int, db: DbSession) -> Response:
    transaction = get_transaction_or_404(db, transaction_id)
    db.delete(transaction)
    db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)
