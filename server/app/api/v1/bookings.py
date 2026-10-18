from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.space import (
    BookingCreate,
    BookingResponse,
    BookingStatusUpdate,
    BookingConflictCheckRequest,
    BookingConflictCheckResponse,
)
from app.services.booking_service import BookingService
from app.core.dependencies import get_current_user_optional
from app.models.organization import StaffMember

router = APIRouter(prefix="/bookings", tags=["Bookings & Tours"])


@router.get("", response_model=List[BookingResponse])
def get_bookings(
    location: Optional[str] = Query(None),
    date: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: Optional[StaffMember] = Depends(get_current_user_optional),
):
    return BookingService.get_bookings(db, location=location, date=date, status_filter=status)


@router.post("/check-conflict", response_model=BookingConflictCheckResponse)
def check_booking_conflict(
    check_req: BookingConflictCheckRequest,
    db: Session = Depends(get_db),
    current_user: Optional[StaffMember] = Depends(get_current_user_optional),
):
    conflict = BookingService.check_conflict(
        db,
        space_id=check_req.space_id,
        date=check_req.date,
        start_time=check_req.start_time,
        end_time=check_req.end_time,
        exclude_booking_id=check_req.exclude_booking_id,
    )
    if conflict:
        return BookingConflictCheckResponse(
            has_conflict=True,
            conflicting_booking=BookingResponse.model_validate(conflict),
        )
    return BookingConflictCheckResponse(has_conflict=False, conflicting_booking=None)


@router.post("", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
def create_booking(
    booking_in: BookingCreate,
    db: Session = Depends(get_db),
    current_user: Optional[StaffMember] = Depends(get_current_user_optional),
):
    return BookingService.create_booking(db, booking_in)


@router.patch("/{booking_id}/status", response_model=BookingResponse)
def update_booking_status(
    booking_id: str,
    status_in: BookingStatusUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[StaffMember] = Depends(get_current_user_optional),
):
    return BookingService.update_booking_status(db, booking_id, status_in.status)


@router.post("/{booking_id}/cancel", response_model=BookingResponse)
def cancel_booking(
    booking_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[StaffMember] = Depends(get_current_user_optional),
):
    return BookingService.cancel_booking(db, booking_id)


@router.delete("/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_booking(
    booking_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[StaffMember] = Depends(get_current_user_optional),
):
    BookingService.delete_booking(db, booking_id)
    return None
