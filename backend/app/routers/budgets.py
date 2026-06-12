from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from app.core.database import get_db
from app.models.budget import Budget
from app.models.category import Category
from app.schemas.budget import BudgetCreate, BudgetRead, BudgetUpdate


router = APIRouter(prefix="/api/budgets", tags=["budgets"])
DbSession = Annotated[Session, Depends(get_db)]


def get_budget_or_404(db: Session, budget_id: int) -> Budget:
    statement = (
        select(Budget)
        .options(selectinload(Budget.category))
        .where(Budget.id == budget_id)
    )
    budget = db.scalar(statement)

    if budget is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found.",
        )

    return budget


def get_category_or_404(db: Session, category_id: int) -> Category:
    category = db.get(Category, category_id)

    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found.",
        )

    return category


def raise_if_duplicate_category_budget(
    db: Session,
    category_id: int,
    budget_id: int | None = None,
) -> None:
    statement = select(Budget).where(Budget.category_id == category_id)

    if budget_id is not None:
        statement = statement.where(Budget.id != budget_id)

    existing_budget = db.scalar(statement)

    if existing_budget is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A budget already exists for this category.",
        )


def get_budget_for_response(db: Session, budget_id: int) -> Budget:
    return get_budget_or_404(db, budget_id)


@router.get("", response_model=list[BudgetRead], status_code=status.HTTP_200_OK)
def list_budgets(db: DbSession) -> list[Budget]:
    statement = (
        select(Budget)
        .options(selectinload(Budget.category))
        .join(Budget.category)
        .order_by(Category.name, Budget.id)
    )
    return list(db.scalars(statement).all())


@router.get("/{budget_id}", response_model=BudgetRead, status_code=status.HTTP_200_OK)
def get_budget(budget_id: int, db: DbSession) -> Budget:
    return get_budget_or_404(db, budget_id)


@router.post("", response_model=BudgetRead, status_code=status.HTTP_201_CREATED)
def create_budget(budget_in: BudgetCreate, db: DbSession) -> Budget:
    get_category_or_404(db, budget_in.category_id)
    raise_if_duplicate_category_budget(db, budget_in.category_id)

    budget = Budget(category_id=budget_in.category_id, amount=budget_in.amount)
    db.add(budget)

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A budget already exists for this category.",
        ) from exc

    return get_budget_for_response(db, budget.id)


@router.patch("/{budget_id}", response_model=BudgetRead, status_code=status.HTTP_200_OK)
def update_budget(
    budget_id: int,
    budget_in: BudgetUpdate,
    db: DbSession,
) -> Budget:
    budget = get_budget_or_404(db, budget_id)
    update_data = budget_in.model_dump(exclude_unset=True)

    if "category_id" in update_data:
        get_category_or_404(db, update_data["category_id"])
        raise_if_duplicate_category_budget(
            db,
            update_data["category_id"],
            budget_id=budget.id,
        )

    for field, value in update_data.items():
        setattr(budget, field, value)

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A budget already exists for this category.",
        ) from exc

    return get_budget_for_response(db, budget.id)


@router.delete("/{budget_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_budget(budget_id: int, db: DbSession) -> Response:
    budget = get_budget_or_404(db, budget_id)
    db.delete(budget)
    db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)
