from sqlalchemy import select

from app.core.database import SessionLocal
from app.models.category import Category


DEFAULT_CATEGORIES = [
    "Salary",
    "Food",
    "Rent",
    "Transport",
    "Subscriptions",
    "Shopping",
    "Health",
    "Entertainment",
    "Education",
    "Other",
]


def seed_categories() -> None:
    with SessionLocal() as db:
        existing_names = set(
            db.scalars(
                select(Category.name).where(Category.name.in_(DEFAULT_CATEGORIES))
            ).all()
        )

        missing_categories = [
            Category(name=name)
            for name in DEFAULT_CATEGORIES
            if name not in existing_names
        ]

        if not missing_categories:
            print("Default categories already exist.")
            return

        db.add_all(missing_categories)
        db.commit()
        print(f"Seeded {len(missing_categories)} default categories.")


if __name__ == "__main__":
    seed_categories()
