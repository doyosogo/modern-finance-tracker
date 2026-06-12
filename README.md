# FinanceTracker

FinanceTracker is a full-stack personal finance management application. It uses React for the frontend, FastAPI for the backend, PostgreSQL for persistence, SQLAlchemy for ORM models, Alembic for migrations, and Pydantic for request and response validation.

The app allows users to track income and expenses, manage database-backed categories, monitor budgets, create savings goals, analyse spending habits, and view dashboard/reporting data through a clean interface.

## Features

- Add, edit, and delete transactions
- Track income and expenses
- Search and filter transaction history
- Create recurring transactions
- Set category budgets
- Monitor budget progress
- Create savings goals
- Financial insights and spending analysis
- Interactive charts and reports
- Database-backed persistence
- REST API integration

## Technologies Used

- FastAPI
- PostgreSQL
- SQLAlchemy
- Alembic
- Pydantic
- React
- Vite
- JavaScript (ES6+)
- Tailwind CSS
- Recharts

## Screenshots

### Home

![Home](./screenshots/01.Home.png)

### Dashboard

![Dashboard](./screenshots/02.Dashboard.png)

### Transactions

![Transactions](./screenshots/03.Transactions.png)

### Reports

![Reports](./screenshots/04.Reports.png)

### Budgets

![Budgets](./screenshots/05.Budgets.png)

### Savings Goals

![Goals](./screenshots/06.Goals.png)

## Local Development

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/finance-tracker.git
```

Navigate into the project:

```bash
cd modern-finance-tracker
```

Install frontend dependencies:

```bash
npm install
```

Create the frontend environment file:

```bash
cp .env.example .env
```

Install backend dependencies:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Create a local PostgreSQL database and user that match `backend/.env`, then run migrations and seed categories:

```bash
psql postgres -c "CREATE USER finance_tracker WITH PASSWORD 'finance_tracker';"
psql postgres -c "CREATE DATABASE finance_tracker OWNER finance_tracker;"
alembic upgrade head
PYTHONPATH=. python scripts/seed_categories.py
```

Run the backend:

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload
```

Run the frontend from the project root:

```bash
npm run dev
```

## Environment Variables

Frontend:

- `VITE_API_BASE_URL`: Backend API base URL. Local default is `http://localhost:8000/api`. In production, set this to the deployed backend API URL, such as `https://api.example.com/api`.

Backend:

- `DATABASE_URL`: PostgreSQL SQLAlchemy URL, for example `postgresql+psycopg://USER:PASSWORD@HOST:5432/DB_NAME`.
- `APP_NAME`: FastAPI application name.
- `DEBUG`: Set to `false` in production.
- `CORS_ORIGINS`: Comma-separated list of allowed frontend origins. In production, set this to the deployed frontend URL.

## Production Build

Build the frontend:

```bash
npm run build
```

Run backend migrations before starting the API:

```bash
cd backend
alembic upgrade head
PYTHONPATH=. python scripts/seed_categories.py
```

Start the backend in production with a process manager or platform command similar to:

```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

## Health Check

The backend exposes a lightweight health endpoint:

```bash
GET /health
```

Expected response:

```json
{
  "status": "ok"
}
```

Use this endpoint for deployment platform health checks and uptime monitoring.

## Docker

Build the frontend image from the project root:

```bash
docker build \
  --build-arg VITE_API_BASE_URL=https://api.example.com/api \
  -t finance-tracker-frontend .
```

Run the frontend container:

```bash
docker run --rm -p 8080:80 finance-tracker-frontend
```

Build the backend image:

```bash
docker build -t finance-tracker-backend ./backend
```

Run the backend container:

```bash
docker run --rm -p 8000:8000 \
  -e DATABASE_URL=postgresql+psycopg://USER:PASSWORD@HOST:5432/DB_NAME \
  -e DEBUG=false \
  -e CORS_ORIGINS=https://your-frontend-domain.com \
  finance-tracker-backend
```

Run migrations from the backend image before starting or as part of a release step:

```bash
docker run --rm \
  -e DATABASE_URL=postgresql+psycopg://USER:PASSWORD@HOST:5432/DB_NAME \
  -e DEBUG=false \
  -e CORS_ORIGINS=https://your-frontend-domain.com \
  finance-tracker-backend \
  alembic upgrade head
```

Seed default categories after migrations:

```bash
docker run --rm \
  -e DATABASE_URL=postgresql+psycopg://USER:PASSWORD@HOST:5432/DB_NAME \
  -e DEBUG=false \
  -e CORS_ORIGINS=https://your-frontend-domain.com \
  finance-tracker-backend \
  python scripts/seed_categories.py
```

## Deployment Notes

- Deploy the frontend as a static Vite build from `dist`.
- Deploy the backend as an ASGI application from `backend/app/main.py`.
- Provision PostgreSQL separately and set `DATABASE_URL` from the provider connection string.
- Set `DEBUG=false` for the backend.
- Set `CORS_ORIGINS` to the exact deployed frontend origin.
- Set `VITE_API_BASE_URL` to the deployed backend `/api` URL before building the frontend.
- Run Alembic migrations during release or before starting the backend.
- Run the category seed script once after migrations, or during release if the script is part of the deployment workflow.
- Configure the platform health check to call `/health`.

## Deployment Workflow

1. Provision PostgreSQL.
2. Set backend environment variables.
3. Deploy or build the backend image.
4. Run `alembic upgrade head`.
5. Run `PYTHONPATH=. python scripts/seed_categories.py`.
6. Start the backend.
7. Set `VITE_API_BASE_URL` to the backend `/api` URL.
8. Build and deploy the frontend.
9. Verify `/health`, `/api/categories`, and the frontend pages.

## Future Improvements

Planned future improvements include:

- User authentication
- Automated tests

## Author

João Victor de Souza

Built as part of my software development portfolio and learning journey.
