from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.lead import (
    LeadCreate,
    LeadUpdate,
    LeadStatusUpdate,
    LeadConvertRequest,
    LeadResponse,
)
from app.schemas.member import MemberResponse
from app.services.lead_service import LeadService
from app.core.dependencies import get_current_user_optional
from app.models.organization import StaffMember

router = APIRouter(prefix="/leads", tags=["Leads"])


@router.get("", response_model=List[LeadResponse])
def get_leads(
    location: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: Optional[StaffMember] = Depends(get_current_user_optional),
):
    return LeadService.get_leads(db, location=location, status_filter=status, search=search)


@router.post("", response_model=LeadResponse, status_code=status.HTTP_201_CREATED)
def create_lead(
    lead_in: LeadCreate,
    db: Session = Depends(get_db),
    current_user: Optional[StaffMember] = Depends(get_current_user_optional),
):
    return LeadService.create_lead(db, lead_in)


@router.get("/{lead_id}", response_model=LeadResponse)
def get_lead(
    lead_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[StaffMember] = Depends(get_current_user_optional),
):
    lead = LeadService.get_lead_by_id(db, lead_id)
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")
    return lead


@router.put("/{lead_id}", response_model=LeadResponse)
def update_lead(
    lead_id: str,
    lead_in: LeadUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[StaffMember] = Depends(get_current_user_optional),
):
    return LeadService.update_lead(db, lead_id, lead_in)


@router.patch("/{lead_id}/status", response_model=LeadResponse)
def update_lead_status(
    lead_id: str,
    status_update: LeadStatusUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[StaffMember] = Depends(get_current_user_optional),
):
    changed_by = status_update.changed_by or (current_user.name if current_user else "Staff")
    return LeadService.update_lead_status(
        db,
        lead_id=lead_id,
        new_status=status_update.status,
        reason=status_update.reason,
        changed_by=changed_by,
    )


@router.post("/{lead_id}/convert", response_model=MemberResponse)
def convert_lead(
    lead_id: str,
    convert_in: LeadConvertRequest,
    db: Session = Depends(get_db),
    current_user: Optional[StaffMember] = Depends(get_current_user_optional),
):
    changed_by = current_user.name if current_user else "Staff"
    return LeadService.convert_to_member(db, lead_id, convert_in, changed_by=changed_by)


@router.delete("/{lead_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_lead(
    lead_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[StaffMember] = Depends(get_current_user_optional),
):
    LeadService.delete_lead(db, lead_id)
    return None
