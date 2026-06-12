from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.goal import Goal
from app.schemas.goal import GoalCreate, GoalRead, GoalUpdate


router = APIRouter(prefix="/api/goals", tags=["goals"])
DbSession = Annotated[Session, Depends(get_db)]


def get_goal_or_404(db: Session, goal_id: int) -> Goal:
    goal = db.get(Goal, goal_id)

    if goal is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found.",
        )

    return goal


def validate_goal_amounts(current_amount: Decimal, target_amount: Decimal) -> None:
    if current_amount > target_amount:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="current_amount cannot exceed target_amount.",
        )


@router.get("", response_model=list[GoalRead], status_code=status.HTTP_200_OK)
def list_goals(db: DbSession) -> list[Goal]:
    statement = select(Goal).order_by(Goal.created_at.desc(), Goal.id.desc())
    return list(db.scalars(statement).all())


@router.get("/{goal_id}", response_model=GoalRead, status_code=status.HTTP_200_OK)
def get_goal(goal_id: int, db: DbSession) -> Goal:
    return get_goal_or_404(db, goal_id)


@router.post("", response_model=GoalRead, status_code=status.HTTP_201_CREATED)
def create_goal(goal_in: GoalCreate, db: DbSession) -> Goal:
    validate_goal_amounts(goal_in.current_amount, goal_in.target_amount)

    goal = Goal(
        name=goal_in.name,
        target_amount=goal_in.target_amount,
        current_amount=goal_in.current_amount,
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)

    return goal


@router.patch("/{goal_id}", response_model=GoalRead, status_code=status.HTTP_200_OK)
def update_goal(goal_id: int, goal_in: GoalUpdate, db: DbSession) -> Goal:
    goal = get_goal_or_404(db, goal_id)
    update_data = goal_in.model_dump(exclude_unset=True)

    final_target_amount = update_data.get("target_amount", goal.target_amount)
    final_current_amount = update_data.get("current_amount", goal.current_amount)
    validate_goal_amounts(final_current_amount, final_target_amount)

    for field, value in update_data.items():
        setattr(goal, field, value)

    db.commit()
    db.refresh(goal)

    return goal


@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_goal(goal_id: int, db: DbSession) -> Response:
    goal = get_goal_or_404(db, goal_id)
    db.delete(goal)
    db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)
