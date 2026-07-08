# Project Feature Summary

## 1. Project Overview

This project is a full-stack personal finance tracking application named **FinanceTracker**. It provides a React frontend and a FastAPI backend for recording financial activity, organizing transactions by category, setting category budgets, tracking savings goals, and viewing dashboard/reporting summaries.

The app is currently designed as a single-user finance tracker. There is no authentication, user table, multi-tenant account ownership, or authorization layer yet. All persisted records are global to the configured database.

Core application capabilities include:

- Creating, editing, deleting, listing, searching, and filtering transactions.
- Storing income and expense transactions with category, date, amount, and optional recurring metadata.
- Managing database-backed categories.
- Creating one budget per category.
- Comparing category spending against budget amounts.
- Creating savings goals and updating saved progress.
- Viewing aggregate dashboard metrics.
- Viewing reports for spending by category, monthly income/expense summaries, budget progress, and financial insights.
- Persisting data in PostgreSQL through SQLAlchemy ORM models and Alembic migrations.

The repository contains both frontend and backend deployment artifacts:

- Root `Dockerfile` builds the frontend with Vite and serves the static app through Nginx.
- `backend/Dockerfile` builds and runs the FastAPI backend with Uvicorn.
- `nginx.conf` supports SPA fallback routing for React Router.
- Alembic is configured for database migrations.
- Seed script exists for default categories.

## 2. Current Tech Stack

### Frontend

- React `^19.2.6`
- React DOM `^19.2.6`
- React Router DOM `^7.16.0`
- Vite `^8.0.12`
- JavaScript ES modules
- Tailwind CSS `^4.3.0`
- `@tailwindcss/vite` `^4.3.0`
- Recharts `^3.8.1`
- Framer Motion `^12.40.0` is installed but not currently used in inspected source files.
- Lucide React `^1.17.0` is installed but not currently used in inspected source files.
- ESLint `^10.3.0` with React Hooks and React Refresh plugins.

### Backend

- Python `3.12` in Docker image.
- FastAPI.
- Uvicorn with standard extras.
- SQLAlchemy ORM.
- PostgreSQL.
- Psycopg 3 binary package.
- Pydantic Settings.
- Alembic migrations.
- Synchronous SQLAlchemy sessions and synchronous FastAPI route handlers.

### Database

- PostgreSQL is the intended database.
- SQLAlchemy supports URLs using `postgresql://` or `postgresql+psycopg://`.
- Alembic manages schema migrations.

### Build and Runtime

- Frontend local dev command: `npm run dev`.
- Frontend production build command: `npm run build`.
- Frontend preview command: `npm run preview`.
- Frontend lint command: `npm run lint`.
- Backend local command documented in README: `uvicorn app.main:app --reload` from `backend`.
- Backend container command: `uvicorn app.main:app --host 0.0.0.0 --port 8000`.

## 3. Frontend Pages

The frontend is a Vite React SPA mounted from `src/main.jsx`. It uses `BrowserRouter` and routes declared in `src/App.jsx`. The top-level layout includes a sticky `Navbar` and a centered `main` container.

### Navigation

File: `src/components/Navbar.jsx`

Navigation links:

- `/` - Home
- `/dashboard` - Dashboard
- `/transactions` - Transactions
- `/reports` - Reports
- `/budgets` - Budgets
- `/goals` - Goals

Active routes are styled with a blue background and white text.

### Home Page

File: `src/pages/Home.jsx`

Route: `/`

Purpose:

- Marketing/overview page for the application.
- Explains that the app tracks income, expenses, budgets, savings goals, recurring transactions, spending reports, and insights.
- Includes call-to-action links to `/transactions` and `/dashboard`.

Important note:

- The balance/income/expense/savings values displayed in the hero panel are hardcoded static example values, not loaded from the backend.

### Dashboard Page

File: `src/pages/Dashboard.jsx`

Route: `/dashboard`

Backend API used:

- `GET /api/dashboard/summary`

Displayed metrics:

- Total income.
- Total expenses.
- Balance.
- Transaction count.
- Budget count.
- Goal count.

Behavior:

- Loads once on mount.
- Shows loading state while fetching.
- Shows an error panel if the request fails.
- Uses an empty summary fallback with zero values before data loads.

### Transactions Page

File: `src/pages/Transactions.jsx`

Route: `/transactions`

Backend APIs used:

- `GET /api/transactions`
- `POST /api/transactions`
- `PATCH /api/transactions/{transaction_id}`
- `DELETE /api/transactions/{transaction_id}`
- `GET /api/categories`

Features:

- Loads transactions and categories on mount.
- Creates transactions.
- Edits transactions inline by loading a selected transaction into the form.
- Deletes transactions.
- Supports transaction type: `income` or `expense`.
- Supports description, amount, category, date, recurring flag, and recurring frequency.
- Recurring frequency options in UI: weekly, monthly, yearly.
- Filters displayed transactions client-side by:
  - Description search.
  - Type.
  - Category.
- Shows recurring badge for recurring transactions.

Important implementation notes:

- The backend supports query filters on `GET /api/transactions`, including search, type, category, and month. The current UI fetches all transactions and applies search/type/category filtering client-side.
- Month filtering exists in the backend but is not exposed in the UI.
- The list is sorted client-side by descending `id`, even though the backend returns transactions ordered by date descending and id descending.
- Form validation is basic on the frontend; backend/Pydantic/database constraints provide stronger validation.
- Browser `alert()` is used for some validation failures.

### Reports Page

File: `src/pages/Reports.jsx`

Route: `/reports`

Backend APIs used:

- `GET /api/reports/spending-by-category`
- `GET /api/reports/monthly-summary`
- `GET /api/reports/budget-progress`
- `GET /api/reports/financial-insights`

Features:

- Loads all report datasets in parallel on mount.
- Displays financial insight cards:
  - Highest expense category.
  - Average monthly income.
  - Average monthly expenses.
  - Savings rate.
- Displays spending by category with a Recharts pie chart and category legend.
- Displays monthly summaries with income, expenses, and balance.
- Displays budget progress with progress bars and remaining amounts.

Important implementation notes:

- Reports are all-time reports. There is no date range picker or period filter in the current UI.
- Pie chart colors are hardcoded in the component.
- Formatting uses JavaScript `Number(value).toFixed(2)`.

### Budgets Page

File: `src/pages/Budgets.jsx`

Route: `/budgets`

Backend APIs used:

- `GET /api/categories`
- `GET /api/budgets`
- `POST /api/budgets`
- `PATCH /api/budgets/{budget_id}`
- `DELETE /api/budgets/{budget_id}`
- `GET /api/reports/budget-progress`

Features:

- Loads categories, budgets, and budget progress.
- Displays every category with a budget input.
- Creates a budget if a category has none.
- Updates the existing budget if one already exists.
- Deletes existing budgets.
- Shows spent amount, budget amount, over-budget warnings, approaching-limit warnings, and progress bars.

Important implementation notes:

- The backend enforces one budget per category with a unique constraint.
- The UI describes budgets as monthly, but the backend budget-progress calculation currently compares budget amount against all-time expense spending for that category. There is no month field on `Budget` and no date filter in the budget-progress endpoint.
- Inputs save on blur, Enter key, and Save button.

### Goals Page

File: `src/pages/Goals.jsx`

Route: `/goals`

Backend APIs used:

- `GET /api/goals`
- `POST /api/goals`
- `PATCH /api/goals/{goal_id}`
- `DELETE /api/goals/{goal_id}`

Features:

- Creates savings goals with name, target amount, and current saved amount.
- Lists existing goals.
- Shows current amount, target amount, remaining amount, progress bar, and percent complete.
- Updates current saved amount directly from an input.
- Deletes goals.

Important implementation notes:

- The backend supports updating goal name and target amount, but the UI only exposes updating `current_amount` after creation.
- The UI sends an update request on every input change for goal current amount, which can create many API calls while typing.
- Backend enforces `current_amount <= target_amount`.

## 4. Backend Architecture

Backend entrypoint:

- `backend/app/main.py`

The backend is a FastAPI application configured with:

- App title from `settings.app_name`.
- Debug flag from `settings.debug`.
- CORS middleware using `settings.cors_origins`.
- Routers for categories, transactions, goals, budgets, dashboard, and reports.
- Health check endpoint at `GET /health`.

### Configuration

File: `backend/app/core/config.py`

Configuration uses `pydantic-settings`.

Settings:

- `app_name`, default: `Finance Tracker API`.
- `debug`, default: `False`.
- `database_url`, required through `DATABASE_URL`.
- `cors_origins_raw`, read from `CORS_ORIGINS`, default: `http://localhost:5173`.
- Computed `cors_origins` list from comma-separated `CORS_ORIGINS`.

Validation:

- `DATABASE_URL` must be a valid URL.
- `DATABASE_URL` scheme must be `postgresql` or `postgresql+psycopg`.
- `CORS_ORIGINS` must include at least one non-empty origin.

Environment loading:

- Backend `.env` file path is resolved as `backend/.env`.
- Extra environment variables are ignored.
- Invalid settings raise a runtime error with validation details.

### Database Session and ORM Base

File: `backend/app/core/database.py`

Database setup:

- Uses SQLAlchemy `create_engine(settings.database_url, pool_pre_ping=True)`.
- Uses `SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)`.
- Provides `get_db()` dependency that yields a synchronous SQLAlchemy session and closes it in `finally`.
- Defines a declarative `Base` with naming conventions for indexes, unique constraints, check constraints, foreign keys, and primary keys.

### Routers

Routers are grouped by resource:

- `backend/app/routers/categories.py`
- `backend/app/routers/transactions.py`
- `backend/app/routers/budgets.py`
- `backend/app/routers/goals.py`
- `backend/app/routers/dashboard.py`
- `backend/app/routers/reports.py`

Each router uses `APIRouter` with an `/api/...` prefix except `/health`, which is declared directly in `main.py`.

### Migrations

Alembic files:

- `backend/alembic.ini`
- `backend/alembic/env.py`
- `backend/alembic/versions/20260610_0001_initial_schema.py`

Alembic `env.py`:

- Reads the SQLAlchemy URL from backend settings.
- Imports `app.models` so model metadata is registered.
- Uses `Base.metadata` as migration target metadata.
- Enables type and server-default comparison.

Current migration:

- Revision `20260610_0001`.
- Creates initial `categories`, `goals`, `budgets`, and `transactions` tables.

### Seeding

File: `backend/scripts/seed_categories.py`

Default categories:

- Salary
- Food
- Rent
- Transport
- Subscriptions
- Shopping
- Health
- Entertainment
- Education
- Other

The script inserts missing default categories by exact name. It does not normalize case when checking existing names, though the database has a case-insensitive unique index on lower-case category name.

## 5. Database Models

### Category

File: `backend/app/models/category.py`

Table: `categories`

Columns:

- `id`: integer primary key.
- `name`: string, max length 80, required.
- `created_at`: timezone-aware datetime, server default `now()`.
- `updated_at`: timezone-aware datetime, server default `now()`, ORM `onupdate=func.now()`.

Indexes/constraints:

- Unique index `ix_categories_lower_name` on `lower(name)`, making category names case-insensitively unique.

Relationships:

- `transactions`: one-to-many with `Transaction`, passive deletes enabled.
- `budgets`: one-to-many with `Budget`, cascade all/delete-orphan, passive deletes enabled.

Deletion behavior:

- Transactions reference categories with `ON DELETE RESTRICT`.
- Budgets reference categories with `ON DELETE CASCADE`.
- The category delete router also manually blocks deletion when the category is referenced by either transactions or budgets.

### Transaction

File: `backend/app/models/transaction.py`

Table: `transactions`

Columns:

- `id`: integer primary key.
- `type`: string, max length 20, indexed, required.
- `description`: string, max length 255, required.
- `amount`: numeric `(12, 2)`, required.
- `category_id`: foreign key to `categories.id`, required, indexed, `ON DELETE RESTRICT`.
- `date`: date, required, indexed.
- `is_recurring`: boolean, required, default false, server default false.
- `recurring_frequency`: nullable string, max length 20.
- `created_at`: timezone-aware datetime, server default `now()`.
- `updated_at`: timezone-aware datetime, server default `now()`, ORM `onupdate=func.now()`.

Constraints:

- `amount > 0`.
- `type IN ('income', 'expense')`.
- Recurring state must be consistent:
  - Non-recurring transactions require `recurring_frequency IS NULL`.
  - Recurring transactions require `recurring_frequency IN ('weekly', 'monthly', 'yearly')`.

Indexes:

- Index on `type`.
- Index on `category_id`.
- Index on `date`.
- Composite index on `date`, `type`, `category_id`.

Relationships:

- `category`: many-to-one with `Category`.

### Budget

File: `backend/app/models/budget.py`

Table: `budgets`

Columns:

- `id`: integer primary key.
- `category_id`: foreign key to `categories.id`, required, indexed, `ON DELETE CASCADE`.
- `amount`: numeric `(12, 2)`, required.
- `created_at`: timezone-aware datetime, server default `now()`.
- `updated_at`: timezone-aware datetime, server default `now()`, ORM `onupdate=func.now()`.

Constraints:

- `amount >= 0`.
- Unique constraint on `category_id`, enforcing one budget per category.

Relationships:

- `category`: many-to-one with `Category`.

Important note:

- There is no month, period, start date, end date, recurrence, or user ownership column on budgets.

### Goal

File: `backend/app/models/goal.py`

Table: `goals`

Columns:

- `id`: integer primary key.
- `name`: string, max length 120, required.
- `target_amount`: numeric `(12, 2)`, required.
- `current_amount`: numeric `(12, 2)`, required, default 0, server default 0.
- `created_at`: timezone-aware datetime, server default `now()`.
- `updated_at`: timezone-aware datetime, server default `now()`, ORM `onupdate=func.now()`.

Constraints:

- `target_amount > 0`.
- `current_amount >= 0`.
- `current_amount <= target_amount`.

Important note:

- Goals are not linked to users or transactions.
- Goals do not have target dates or completion status fields.

## 6. API Endpoints

Base API prefix for resource endpoints: `/api`

Health endpoint has no `/api` prefix.

### Health

`GET /health`

Response:

- `{ "status": "ok" }`

Purpose:

- Lightweight deployment health check.

### Categories

Router: `backend/app/routers/categories.py`

`GET /api/categories`

- Lists categories ordered case-insensitively by name and then id.
- Response: list of `CategoryRead`.

`POST /api/categories`

- Creates a category.
- Request body: `CategoryCreate`.
- Trims category name.
- Rejects blank names.
- Rejects duplicate names case-insensitively with `409`.
- Response: created `CategoryRead`.

`PATCH /api/categories/{category_id}`

- Updates a category name.
- Request body: `CategoryUpdate`.
- Returns `404` if not found.
- Rejects duplicate names case-insensitively with `409`.
- Response: updated `CategoryRead`.

`DELETE /api/categories/{category_id}`

- Deletes a category.
- Returns `404` if not found.
- Returns `409` if used by transactions.
- Returns `409` if used by budgets.
- Response: `204 No Content`.

Important note:

- Model-level budget relationship uses cascade delete, but the route intentionally blocks deleting a category with budgets.

### Transactions

Router: `backend/app/routers/transactions.py`

`GET /api/transactions`

- Lists transactions with related category loaded.
- Response: list of `TransactionRead`.
- Ordered by `date DESC`, then `id DESC`.

Supported query parameters:

- `search`: optional description substring search, using case-insensitive `ilike`.
- `type`: optional transaction type enum, `income` or `expense`.
- `category_id`: optional positive integer.
- `month`: optional `YYYY-MM` string.

Month filter behavior:

- Converts `YYYY-MM` to `[month_start, next_month_start)`.
- December rolls over to January of the following year.

`GET /api/transactions/{transaction_id}`

- Retrieves one transaction with category.
- Returns `404` if not found.

`POST /api/transactions`

- Creates a transaction.
- Request body: `TransactionCreate`.
- Verifies category exists before insert.
- Enforces recurring consistency.
- Returns `404` if category does not exist.
- Response: created `TransactionRead`.

`PATCH /api/transactions/{transaction_id}`

- Partially updates a transaction.
- Request body: `TransactionUpdate`.
- Verifies transaction exists.
- Verifies new category exists if `category_id` is provided.
- Validates final recurring state across existing and new values.
- Converts enum values to strings before assigning to ORM model.
- Returns `404` for missing transaction or category.
- Response: updated `TransactionRead`.

`DELETE /api/transactions/{transaction_id}`

- Deletes a transaction.
- Returns `404` if not found.
- Response: `204 No Content`.

### Budgets

Router: `backend/app/routers/budgets.py`

`GET /api/budgets`

- Lists budgets with related category loaded.
- Joins category and orders by category name and budget id.
- Response: list of `BudgetRead`.

`GET /api/budgets/{budget_id}`

- Retrieves one budget with related category.
- Returns `404` if not found.

`POST /api/budgets`

- Creates a budget.
- Request body: `BudgetCreate`.
- Verifies category exists.
- Rejects duplicate category budget with `409`.
- Response: created `BudgetRead`.

`PATCH /api/budgets/{budget_id}`

- Partially updates a budget.
- Request body: `BudgetUpdate`.
- Verifies budget exists.
- If category changes, verifies category exists and rejects duplicate category budget.
- Response: updated `BudgetRead`.

`DELETE /api/budgets/{budget_id}`

- Deletes a budget.
- Returns `404` if not found.
- Response: `204 No Content`.

### Goals

Router: `backend/app/routers/goals.py`

`GET /api/goals`

- Lists goals ordered by `created_at DESC`, then `id DESC`.
- Response: list of `GoalRead`.

`GET /api/goals/{goal_id}`

- Retrieves one goal.
- Returns `404` if not found.

`POST /api/goals`

- Creates a goal.
- Request body: `GoalCreate`.
- Validates `current_amount <= target_amount`.
- Response: created `GoalRead`.

`PATCH /api/goals/{goal_id}`

- Partially updates a goal.
- Request body: `GoalUpdate`.
- Validates final `current_amount <= target_amount`.
- Response: updated `GoalRead`.

`DELETE /api/goals/{goal_id}`

- Deletes a goal.
- Returns `404` if not found.
- Response: `204 No Content`.

### Dashboard

Router: `backend/app/routers/dashboard.py`

`GET /api/dashboard/summary`

Returns:

- `total_income`: sum of income transaction amounts.
- `total_expenses`: sum of expense transaction amounts.
- `balance`: income minus expenses.
- `transaction_count`: total number of transactions.
- `budget_count`: total number of budgets.
- `goal_count`: total number of goals.

Implementation:

- Uses SQL aggregate functions with `CASE` expressions.
- Uses zero-money fallback for empty datasets.

### Reports

Router: `backend/app/routers/reports.py`

`GET /api/reports/spending-by-category`

Returns:

- Expense totals grouped by category.
- Fields: `category_id`, `category_name`, `amount`.
- Ordered by amount descending, then category name.

`GET /api/reports/monthly-summary`

Returns:

- Monthly income, expenses, and balance grouped by year/month extracted from transaction date.
- Fields: `month`, `income`, `expenses`, `balance`.
- Month format: `YYYY-MM`.
- Ordered by year and month ascending.

`GET /api/reports/budget-progress`

Returns:

- Budget amount, spent amount, remaining amount, and percentage used for each budget.
- Joins budgets to categories and left joins expense transactions by category.
- Fields: `budget_id`, `category_name`, `budget_amount`, `spent_amount`, `remaining_amount`, `percentage_used`.

Important note:

- Spending used for budget progress is all-time category expense spending. There is no monthly filter despite the UI text saying monthly budget.

`GET /api/reports/financial-insights`

Returns:

- `highest_expense_category`
- `highest_expense_amount`
- `average_monthly_expenses`
- `average_monthly_income`
- `savings_rate`

Implementation:

- Highest expense category is calculated from all expense transactions grouped by category.
- Average monthly income/expenses are calculated from the monthly summary rows.
- Savings rate is calculated as `(average_income - average_expenses) / average_income * 100`.
- If no monthly transaction data exists, returns zero monetary values and `highest_expense_category: null`.

## 7. Current Features

### Data Persistence

- PostgreSQL-backed persistence for categories, transactions, budgets, and goals.
- Alembic migration creates all current tables and constraints.
- Seed script inserts default finance categories.

### Category Management

- Full CRUD API for categories.
- Case-insensitive duplicate protection.
- UI currently consumes categories for transactions and budgets.
- There is no dedicated category management page in the frontend.

### Transaction Management

- Full CRUD API for transactions.
- Frontend page supports create, edit, delete, list, and client-side filtering.
- Transactions include:
  - Type.
  - Description.
  - Amount.
  - Category.
  - Date.
  - Recurring flag.
  - Recurring frequency.
- Backend supports server-side filters for search, type, category, and month.

### Budgets

- Full CRUD API for budgets.
- One budget per category.
- UI lets users set or remove a budget amount for each category.
- Budget progress report compares spending against budget amount.
- UI warns when spending is over budget or above 80% of the budget.

### Savings Goals

- Full CRUD API for goals.
- UI supports creating and deleting goals.
- UI supports updating current saved amount.
- Progress percentage is available from the backend response and also calculated in the UI.

### Dashboard

- Backend summary endpoint aggregates key metrics.
- UI displays income, expenses, balance, transaction count, budget count, and goal count.

### Reports

- Spending by category report.
- Monthly summary report.
- Budget progress report.
- Financial insights report.
- Recharts pie chart for category spending.

### Error and Loading States

- Pages show loading messages while data is being fetched.
- Pages show error panels/messages when API requests fail.
- API client extracts FastAPI `detail` errors from JSON responses.

## 8. User Flows

### First-Time Local Setup Flow

1. Install frontend dependencies with `npm install`.
2. Create frontend `.env` from root `.env.example`.
3. Create backend virtual environment.
4. Install backend dependencies from `backend/requirements.txt`.
5. Create backend `.env` from `backend/.env.example`.
6. Create PostgreSQL database/user.
7. Run Alembic migrations from `backend`.
8. Run `PYTHONPATH=. python scripts/seed_categories.py`.
9. Start backend with Uvicorn.
10. Start frontend with Vite.
11. Visit the frontend and interact with the app.

### Add Transaction Flow

1. User opens `/transactions`.
2. Frontend loads categories and existing transactions.
3. User selects type, category, description, amount, date, and optional recurring fields.
4. Frontend sends `POST /api/transactions`.
5. Backend validates category existence and transaction payload.
6. Backend stores transaction.
7. Frontend reloads transactions and resets form.

### Edit Transaction Flow

1. User clicks Edit on an existing transaction.
2. UI populates the form from the selected transaction.
3. User changes values and submits.
4. Frontend sends `PATCH /api/transactions/{id}`.
5. Backend validates the final recurring state and category.
6. Frontend reloads transactions and resets form.

### Delete Transaction Flow

1. User clicks Delete on a transaction.
2. Frontend sends `DELETE /api/transactions/{id}`.
3. Backend deletes the row.
4. Frontend removes the transaction from local state.

Important note:

- There is no delete confirmation prompt in the current UI.

### Set Budget Flow

1. User opens `/budgets`.
2. Frontend loads categories, budgets, and budget progress.
3. User enters an amount for a category.
4. If a budget exists, frontend sends `PATCH /api/budgets/{id}`.
5. If no budget exists, frontend sends `POST /api/budgets`.
6. Frontend reloads budgets and progress data.

### Remove Budget Flow

1. User clicks Delete for a category budget.
2. Frontend sends `DELETE /api/budgets/{id}`.
3. Frontend reloads budgets and progress data.

### Create Goal Flow

1. User opens `/goals`.
2. User enters goal name, target amount, and optional current saved amount.
3. Frontend sends `POST /api/goals`.
4. Backend validates amounts.
5. Frontend reloads goals and clears the form.

### Update Goal Progress Flow

1. User edits the current saved amount input on a goal.
2. Frontend sends `PATCH /api/goals/{id}` with `current_amount`.
3. Backend validates that current amount is not greater than target amount.
4. Frontend replaces the updated goal in local state.

Important note:

- This happens on every input change rather than on blur/save.

### View Dashboard Flow

1. User opens `/dashboard`.
2. Frontend calls `GET /api/dashboard/summary`.
3. Backend aggregates all transaction, budget, and goal data.
4. Frontend displays metric cards.

### View Reports Flow

1. User opens `/reports`.
2. Frontend calls all report endpoints in parallel.
3. Backend returns all-time aggregate report data.
4. Frontend renders insight cards, pie chart, monthly summaries, and budget progress.

## 9. Environment Variables

### Frontend

Root `.env.example`:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

Production example:

```env
VITE_API_BASE_URL=https://api.example.com/api
```

Used in:

- `src/api/client.js`
- Root `Dockerfile` build argument and environment variable.

Behavior:

- If `VITE_API_BASE_URL` is not set, frontend defaults to `http://localhost:8000/api`.
- The value must include the `/api` suffix because frontend API wrappers call paths like `/transactions` and `/reports/...`.
- In Vite, this value is embedded at build time for production builds.

### Backend

Backend `.env.example`:

```env
APP_NAME=Finance Tracker API
DEBUG=false
DATABASE_URL=postgresql+psycopg://finance_tracker:finance_tracker@localhost:5432/finance_tracker
CORS_ORIGINS=http://localhost:5173
```

Production examples:

```env
DATABASE_URL=postgresql+psycopg://USER:PASSWORD@HOST:5432/DB_NAME
CORS_ORIGINS=https://your-frontend-domain.com
```

Variables:

- `APP_NAME`: FastAPI app title. Default in code is `Finance Tracker API`.
- `DEBUG`: FastAPI debug flag. Default in code is false.
- `DATABASE_URL`: required. Must be PostgreSQL URL using `postgresql://` or `postgresql+psycopg://`.
- `CORS_ORIGINS`: comma-separated allowed origins. Default in code is `http://localhost:5173`.

Important notes:

- Backend config reads `backend/.env`.
- Production `CORS_ORIGINS` should be exact frontend origins, not wildcard, unless intentionally changed.
- Backend startup will fail fast if required settings are invalid.

## 10. Docker and Deployment Setup

### Frontend Dockerfile

File: root `Dockerfile`

Build stage:

- Uses `node:22-alpine`.
- Sets `WORKDIR /app`.
- Copies `package*.json`.
- Runs `npm ci`.
- Copies the repository.
- Accepts build arg `VITE_API_BASE_URL`, defaulting to `http://localhost:8000/api`.
- Runs `npm run build`.

Runtime stage:

- Uses `nginx:1.27-alpine`.
- Copies root `nginx.conf` to `/etc/nginx/conf.d/default.conf`.
- Copies Vite `dist` output to `/usr/share/nginx/html`.
- Exposes port `80`.
- Starts Nginx in foreground.

### Frontend Nginx Config

File: `nginx.conf`

Behavior:

- Listens on port `80`.
- Serves static files from `/usr/share/nginx/html`.
- Uses `try_files $uri $uri/ /index.html;` to support React Router SPA fallback.

### Frontend Docker Ignore

File: `.dockerignore`

Excludes:

- `node_modules`
- `dist`
- `.git`
- `.github`
- `.env`
- `.env.local`
- `npm-debug.log`
- `backend`
- `screenshots`
- `README.md`

Important note:

- Excluding `backend` is appropriate for the frontend image because the root Dockerfile only builds the frontend.

### Backend Dockerfile

File: `backend/Dockerfile`

Behavior:

- Uses `python:3.12-slim`.
- Sets `PYTHONDONTWRITEBYTECODE=1`.
- Sets `PYTHONUNBUFFERED=1`.
- Sets `WORKDIR /app`.
- Copies `requirements.txt`.
- Installs backend dependencies.
- Copies backend source.
- Exposes port `8000`.
- Starts Uvicorn with `app.main:app` on `0.0.0.0:8000`.

Important deployment note:

- Backend container does not automatically run migrations or seed categories on startup.
- Migrations and seeding are documented as separate release/setup commands.

### Alembic Deployment Flow

Before starting or promoting the backend, run:

```bash
alembic upgrade head
```

Then seed categories if needed:

```bash
PYTHONPATH=. python scripts/seed_categories.py
```

In Docker, README documents running those commands with the backend image and the same database environment variables.

### Deployment Model

Recommended current deployment shape:

- Deploy frontend as a static Vite build served by Nginx or a static hosting platform.
- Deploy backend as an ASGI service.
- Provision PostgreSQL separately.
- Set backend `DATABASE_URL`, `DEBUG=false`, and production `CORS_ORIGINS`.
- Set frontend `VITE_API_BASE_URL` to the backend `/api` URL before building.
- Run migrations before backend starts handling traffic.
- Run seed script once after migrations, or idempotently as part of release.
- Configure platform health check to call `GET /health`.

### Missing Deployment Pieces

- No `docker-compose.yml` exists.
- No CI/CD workflow files were found under `.github`.
- No production process manager config exists outside Dockerfiles.
- No automated migration-on-deploy script exists.
- No backend `.dockerignore` file was found.

## 11. Remaining Limitations or Future Improvements

### Authentication and Multi-User Support

- No authentication exists.
- No user model exists.
- No authorization exists.
- All data is global.
- Future backend/deployment planning should likely add:
  - Users table.
  - Auth provider or local auth.
  - Ownership columns on categories, transactions, budgets, and goals.
  - Query scoping by authenticated user.
  - Migration strategy for existing global data.

### Budget Period Semantics

- UI text says monthly budgets.
- Backend budget-progress currently compares each budget to all-time expense spending in that category.
- There is no budget period/month field.
- Future improvement: add budget period model or calculate progress for current month only.

### Recurring Transactions

- Transactions can be marked recurring with weekly/monthly/yearly frequency.
- There is no scheduler or recurrence expansion logic.
- Recurring transactions are stored only as metadata on a transaction.
- Future improvement: generate future transactions, track next run date, or model recurring rules separately.

### Category Management UI

- Backend has full category CRUD.
- Frontend does not have a dedicated category management page.
- Categories are currently seeded and then used in transaction/budget forms.

### Reporting Filters

- Reports are all-time.
- No date range, current month, year, or category filters are exposed on reports.
- Transaction API supports month filtering, but the frontend does not expose it.

### Goal Editing

- Backend supports updating name, target amount, and current amount.
- UI only exposes current amount updates after goal creation.
- Goal update input fires requests on every keystroke.

### Testing

- No automated frontend or backend tests were found.
- README lists automated tests as a planned future improvement.
- Suggested future test coverage:
  - Backend unit/integration tests for CRUD and validation.
  - Migration smoke tests.
  - API contract tests.
  - Frontend component and flow tests.
  - End-to-end tests for main user flows.

### API Robustness

- No pagination on transactions or list endpoints.
- No rate limiting.
- No request IDs or structured logging.
- No OpenAPI customization beyond FastAPI defaults.
- Error responses are simple FastAPI `HTTPException` details.

### Data Model Completeness

Potential future fields:

- Transaction merchant/payee.
- Transaction notes.
- Transaction attachment/receipt.
- Transaction tags.
- Transfer transaction type.
- Account/wallet model.
- Budget periods.
- Goal target dates.
- Goal completion status.
- Audit timestamps with database triggers or explicit update handling.

### Deployment and Operations

Potential future improvements:

- Docker Compose for local full-stack development.
- CI workflow for lint/build/test.
- Automated database migration release step.
- Backend health check that optionally validates database connectivity.
- Observability/logging configuration.
- Secrets management guidance.
- Static frontend hosting configuration for common providers.
- Backend deployment docs for target platform.

## 12. Important Implementation Notes

### API Client Behavior

File: `src/api/client.js`

- `API_BASE_URL` is read from `import.meta.env.VITE_API_BASE_URL`.
- Default is `http://localhost:8000/api`.
- `buildUrl()` trims trailing slash from base URL and ensures request path starts with `/`.
- Query params are skipped if value is `undefined`, `null`, or empty string.
- JSON `Content-Type` is added only when a request body exists.
- Non-OK responses are converted to `Error` with parsed FastAPI `detail` when possible.
- `204` responses return `null`.
- Non-JSON successful responses return `null`.

### Money Handling

- Backend models use `Numeric(12, 2)`.
- Pydantic schemas use `Decimal` with `max_digits=12` and `decimal_places=2`.
- Report helper function quantizes values to two decimals with `ROUND_HALF_UP`.
- Frontend converts many received decimal strings to `Number` for display and payloads.

### Validation Layers

Validation exists at several levels:

- Frontend basic required/positive checks.
- Pydantic request schema validation.
- Router-level existence and cross-field validation.
- Database check constraints and unique constraints.

### CORS

- CORS is configured globally in FastAPI.
- `allow_credentials=True`.
- `allow_methods=["*"]`.
- `allow_headers=["*"]`.
- Allowed origins come from `CORS_ORIGINS`.

### Date and Time

- Transaction `date` is a date-only field.
- Created/updated timestamps are timezone-aware database datetimes.
- Frontend transaction form defaults date to the browser's current date via `new Date().toISOString().split('T')[0]`.

### Static Assets

- `public/favicon.svg` exists.
- `public/icons.svg` contains social/documentation symbols that do not appear to be used by the current React pages.
- `src/assets/vite.svg` exists and does not appear to be used by current pages.

### Styling

- Tailwind is imported through `src/index.css`.
- Most styling is inline Tailwind utility classes in JSX.
- `src/index.css` sets a dark gradient body background and white text, but the app root in `App.jsx` applies `min-h-screen bg-slate-50 text-slate-900`, so the visible app mostly uses the light slate UI.

### Current Git/Repo State During Inspection

- Worktree was clean before creating this summary.
- No existing app files were modified for this summary.
- This file is the only intended new file.
