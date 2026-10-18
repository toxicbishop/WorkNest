import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.db.session import get_db
from app.models.lead import Activity
from app.schemas.lead import ActivityCreate, ActivityUpdate, ActivityResponse
from app.core.dependencies import get_current_user_optional
from app.models.organization import StaffMember

router = APIRouter(prefix="/activities", tags=["Activities"])


@router.get("", response_model=List[ActivityResponse])
def get_activities(
    completed: Optional[bool] = None,
    lead_id: Optional[str] = None,
    member_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[StaffMember] = Depends(get_current_user_optional),
):
    query = select(Activity)
    if completed is not None:
        query = query.where(Activity.completed == completed)
    if lead_id:
        query = query.where(Activity.lead_id == lead_id)
    if member_id:
        query = query.where(Activity.member_id == member_id)
    query = query.order_by(Activity.due_date.asc())
    return list(db.execute(query).scalars().all())


@router.post("", response_model=ActivityResponse, status_code=status.HTTP_201_CREATED)
def create_activity(
    activity_in: ActivityCreate,
    db: Session = Depends(get_db),
    current_user: Optional[StaffMember] = Depends(get_current_user_optional),
):
    activity_id = activity_in.id or f"act-{uuid.uuid4().hex[:8]}"
    activity = Activity(
        id=activity_id,
        lead_id=activity_in.lead_id,
        lead_name=activity_in.lead_name,
        member_id=activity_in.member_id,
        type=activity_in.type,
        title=activity_in.title,
        description=activity_in.description,
        due_date=activity_in.due_date,
        completed=activity_in.completed,
        outcome=activity_in.outcome,
        staff_name=activity_in.staff_name or (current_user.name if current_user else "Staff"),
    )
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity


@router.patch("/{activity_id}/toggle", response_model=ActivityResponse)
def toggle_activity_complete(
    activity_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[StaffMember] = Depends(get_current_user_optional),
):
    activity = db.get(Activity, activity_id)
    if not activity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found")

    activity.completed = not activity.completed
    db.commit()
    db.refresh(activity)
    return activity


@router.delete("/{activity_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_activity(
    activity_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[StaffMember] = Depends(get_current_user_optional),
):
    activity = db.get(Activity, activity_id)
    if not activity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found")
    db.delete(activity)
    db.commit()
    return None
