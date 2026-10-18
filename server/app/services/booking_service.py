import uuid
from typing import Optional, List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, and_, or_

from app.models.space import Space, Booking
from app.schemas.space import BookingCreate, BookingUpdate


class BookingService:
    @staticmethod
    def check_conflict(
        db: Session,
        space_id: str,
        date: str,
        start_time: str,
        end_time: str,
        exclude_booking_id: Optional[str] = None,
    ) -> Optional[Booking]:
        """
        Detects overlapping confirmed or checked-in bookings for the same space and date.
        Overlaps condition:
        (existing.start_time < new_end_time) AND (existing.end_time > new_start_time)
        """
        query = select(Booking).where(
            and_(
                Booking.space_id == space_id,
                Booking.date == date,
                Booking.status.in_(["Confirmed", "Checked In"]),
                Booking.start_time < end_time,
                Booking.end_time > start_time,
            )
        )
        if exclude_booking_id:
            query = query.where(Booking.id != exclude_booking_id)

        return db.execute(query).scalars().first()

    @staticmethod
    def get_bookings(
        db: Session,
        location: Optional[str] = None,
        date: Optional[str] = None,
        status_filter: Optional[str] = None,
    ) -> List[Booking]:
        query = select(Booking)
        if location and location != "All Locations":
            query = query.where(Booking.location_name == location)
        if date:
            query = query.where(Booking.date == date)
        if status_filter and status_filter != "All":
            query = query.where(Booking.status == status_filter)
        query = query.order_by(Booking.date.asc(), Booking.start_time.asc())
        return list(db.execute(query).scalars().all())

    @staticmethod
    def create_booking(db: Session, booking_in: BookingCreate) -> Booking:
        space = db.get(Space, booking_in.space_id)
        if not space:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Space not found")
        if not space.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Space '{space.name}' is currently inactive or under maintenance",
            )

        if booking_in.start_time >= booking_in.end_time:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Start time ({booking_in.start_time}) must be earlier than end time ({booking_in.end_time})",
            )

        # Check for scheduling conflict
        conflict = BookingService.check_conflict(
            db,
            space_id=booking_in.space_id,
            date=booking_in.date,
            start_time=booking_in.start_time,
            end_time=booking_in.end_time,
        )
        if conflict:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    f"Time slot collision: Space '{space.name}' is already reserved by "
                    f"'{conflict.booked_by_name}' from {conflict.start_time} to {conflict.end_time} on {conflict.date}"
                ),
            )

        # Calculate duration in hours and total cost
        def parse_minutes(time_str: str) -> int:
            parts = time_str.split(":")
            return int(parts[0]) * 60 + int(parts[1])

        duration_hours = max(0.5, (parse_minutes(booking_in.end_time) - parse_minutes(booking_in.start_time)) / 60.0)
        total_cost_cents = booking_in.total_cost_cents or int(duration_hours * space.hourly_rate_cents)

        booking_id = booking_in.id or f"book-{uuid.uuid4().hex[:8]}"
        db_booking = Booking(
            id=booking_id,
            space_id=booking_in.space_id,
            space_name=space.name,
            location_name=space.location_name,
            title=booking_in.title,
            booking_type=booking_in.booking_type,
            booked_by_name=booking_in.booked_by_name,
            booked_by_email=booking_in.booked_by_email,
            member_id=booking_in.member_id,
            lead_id=booking_in.lead_id,
            date=booking_in.date,
            start_time=booking_in.start_time,
            end_time=booking_in.end_time,
            attendees_count=booking_in.attendees_count,
            status=booking_in.status or "Confirmed",
            total_cost_cents=total_cost_cents,
            credits_used_hours=booking_in.credits_used_hours or 0,
            notes=booking_in.notes,
        )

        db.add(db_booking)
        db.commit()
        db.refresh(db_booking)
        return db_booking

    @staticmethod
    def update_booking_status(db: Session, booking_id: str, new_status: str) -> Booking:
        booking = db.get(Booking, booking_id)
        if not booking:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

        valid_statuses = ["Confirmed", "Checked In", "Completed", "Cancelled", "No Show"]
        if new_status not in valid_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid booking status '{new_status}'. Allowed: {valid_statuses}",
            )

        booking.status = new_status
        db.commit()
        db.refresh(booking)
        return booking

    @staticmethod
    def cancel_booking(db: Session, booking_id: str) -> Booking:
        return BookingService.update_booking_status(db, booking_id, "Cancelled")

    @staticmethod
    def delete_booking(db: Session, booking_id: str) -> bool:
        booking = db.get(Booking, booking_id)
        if not booking:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
        db.delete(booking)
        db.commit()
        return True
