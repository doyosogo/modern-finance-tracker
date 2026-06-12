from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers.budgets import router as budgets_router
from app.routers.categories import router as categories_router
from app.routers.dashboard import router as dashboard_router
from app.routers.goals import router as goals_router
from app.routers.reports import router as reports_router
from app.routers.transactions import router as transactions_router


app = FastAPI(
    title=settings.app_name,
    debug=settings.debug,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(categories_router)
app.include_router(transactions_router)
app.include_router(goals_router)
app.include_router(budgets_router)
app.include_router(dashboard_router)
app.include_router(reports_router)


@app.get("/health", tags=["health"])
def health_check() -> dict[str, str]:
    return {"status": "ok"}
