from enum import StrEnum


class TransactionType(StrEnum):
    income = "income"
    expense = "expense"


class RecurringFrequency(StrEnum):
    weekly = "weekly"
    monthly = "monthly"
    yearly = "yearly"
