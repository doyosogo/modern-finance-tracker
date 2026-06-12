from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.budget import Budget
from app.models.category import Category
from app.models.transaction import Transaction
from app.schemas.category import CategoryCreate, CategoryRead, CategoryUpdate


router = APIRouter(prefix="/api/categories", tags=["categories"])
DbSession = Annotated[Session, Depends(get_db)]


def get_category_or_404(db: Session, category_id: int) -> Category:
    category = db.get(Category, category_id)

    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found.",
        )

    return category


def raise_if_duplicate_name(
    db: Session,
    name: str,
    category_id: int | None = None,
) -> None:
    normalized_name = name.lower()
    statement = select(Category).where(func.lower(Category.name) == normalized_name)

    if category_id is not None:
        statement = statement.where(Category.id != category_id)

    existing_category = db.scalar(statement)

    if existing_category is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A category with this name already exists.",
        )


@router.get("", response_model=list[CategoryRead], status_code=status.HTTP_200_OK)
def list_categories(db: DbSession) -> list[Category]:
    statement = select(Category).order_by(func.lower(Category.name), Category.id)
    return list(db.scalars(statement).all())


@router.post("", response_model=CategoryRead, status_code=status.HTTP_201_CREATED)
def create_category(category_in: CategoryCreate, db: DbSession) -> Category:
    raise_if_duplicate_name(db, category_in.name)

    category = Category(name=category_in.name)
    db.add(category)

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A category with this name already exists.",
        ) from exc

    db.refresh(category)
    return category


@router.patch(
    "/{category_id}",
    response_model=CategoryRead,
    status_code=status.HTTP_200_OK,
)
def update_category(
    category_id: int,
    category_in: CategoryUpdate,
    db: DbSession,
) -> Category:
    category = get_category_or_404(db, category_id)
    update_data = category_in.model_dump(exclude_unset=True)

    if "name" in update_data and update_data["name"] != category.name:
        raise_if_duplicate_name(db, update_data["name"], category_id=category.id)
        category.name = update_data["name"]

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A category with this name already exists.",
        ) from exc

    db.refresh(category)
    return category


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(category_id: int, db: DbSession) -> Response:
    category = get_category_or_404(db, category_id)

    referenced_transaction_id = db.scalar(
        select(Transaction.id).where(Transaction.category_id == category.id).limit(1)
    )

    if referenced_transaction_id is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete a category that is used by transactions.",
        )

    referenced_budget_id = db.scalar(
        select(Budget.id).where(Budget.category_id == category.id).limit(1)
    )

    if referenced_budget_id is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete a category that is used by budgets.",
        )

    db.delete(category)

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete a category that is used by transactions.",
        ) from exc

    return Response(status_code=status.HTTP_204_NO_CONTENT)
