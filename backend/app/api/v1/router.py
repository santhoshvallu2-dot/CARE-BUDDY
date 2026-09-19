from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.health import HealthCheckResponse
from app.core.config import settings
from app.api.documents import router as documents_router
from app.api.reminders import router as reminders_router
from app.api.questions import router as questions_router
from app.services.insight_service import evaluate_backend_insights

api_router = APIRouter()

@api_router.get("/health", response_model=HealthCheckResponse, tags=["Health"])
async def health_check():
    return HealthCheckResponse(
        status="ok",
        project=settings.PROJECT_NAME,
        environment=settings.ENVIRONMENT,
        version="0.1.0"
    )

@api_router.get("/insights", response_model=List[Dict[str, Any]], tags=["Insights"])
def get_insights(db: Session = Depends(get_db)):
    """Retrieve prioritized smart care insights evaluated from verified database records."""
    return evaluate_backend_insights(db)

api_router.include_router(documents_router)
api_router.include_router(reminders_router)
api_router.include_router(questions_router)
