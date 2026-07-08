"""Scope category and budget uniqueness by user.

Revision ID: 20260708_0003
Revises: 20260703_0002
Create Date: 2026-07-08
"""

from typing import Sequence
from typing import Union

from alembic import op
import sqlalchemy as sa


revision: str = "20260708_0003"
down_revision: Union[str, None] = "20260703_0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_index("ix_categories_lower_name", table_name="categories")
    op.create_index(
        "ix_categories_user_id_lower_name",
        "categories",
        ["user_id", sa.text("lower(name)")],
        unique=True,
    )

    op.drop_constraint(
        op.f("uq_budgets_category_id"),
        "budgets",
        type_="unique",
    )
    op.create_unique_constraint(
        op.f("uq_budgets_user_id_category_id"),
        "budgets",
        ["user_id", "category_id"],
    )


def downgrade() -> None:
    op.drop_constraint(
        op.f("uq_budgets_user_id_category_id"),
        "budgets",
        type_="unique",
    )
    op.create_unique_constraint(
        op.f("uq_budgets_category_id"),
        "budgets",
        ["category_id"],
    )

    op.drop_index("ix_categories_user_id_lower_name", table_name="categories")
    op.create_index(
        "ix_categories_lower_name",
        "categories",
        [sa.text("lower(name)")],
        unique=True,
    )
