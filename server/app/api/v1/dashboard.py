from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.dashboard import (
    DashboardMetricsResponse,
    NotificationsSummaryResponse,
    AnalyticsReportResponse,
)
from app.services.dashboard_service import DashboardService
from app.core.dependencies import get_current_user_optional
from app.models.organization import StaffMember

router = APIRouter(prefix="/dashboard", tags=["Dashboard & Operations"])


@router.get("/metrics", response_model=DashboardMetricsResponse)
def get_dashboard_metrics(
    location: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: Optional[StaffMember] = Depends(get_current_user_optional),
):
    return DashboardService.get_metrics(db, location=location)


@router.get("/notifications", response_model=NotificationsSummaryResponse)
def get_notifications(
    location: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: Optional[StaffMember] = Depends(get_current_user_optional),
):
    return DashboardService.get_notifications(db, location=location)


@router.get("/analytics", response_model=AnalyticsReportResponse)
def get_analytics_report(
    location: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: Optional[StaffMember] = Depends(get_current_user_optional),
):
    return DashboardService.get_analytics(db, location=location)
