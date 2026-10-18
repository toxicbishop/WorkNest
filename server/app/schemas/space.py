from typing import Optional, List
from pydantic import BaseModel, EmailStr


class SpaceBase(BaseModel):
    location_id: str
    location_name: str
    name: str
    type: str  # Meeting Room, Conference Hall, Podcast Studio, Event Space, etc.
    capacity: int
    hourly_rate_cents: int = 0
    amenities: List[str] = []
    floor_or_zone: str
    is_active: bool = True
    notes: Optional[str] = None


class SpaceCreate(SpaceBase):
    id: Optional[str] = None


class SpaceUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    capacity: Optional[int] = None
    hourly_rate_cents: Optional[int] = None
    amenities: Optional[List[str]] = None
    floor_or_zone: Optional[str] = None
    is_active: Optional[bool] = None
    notes: Optional[str] = None


class SpaceResponse(SpaceBase):
    id: str

    model_config = {"from_attributes": True}


class BookingBase(BaseModel):
    space_id: str
    space_name: str
    location_name: str
    title: str
    booking_type: str = "Meeting Room"
    booked_by_name: str
    booked_by_email: EmailStr
    member_id: Optional[str] = None
    lead_id: Optional[str] = None
    date: str  # YYYY-MM-DD
    start_time: str  # HH:MM
    end_time: str  # HH:MM
    attendees_count: int = 1
    status: str = "Confirmed"
    total_cost_cents: int = 0
    credits_used_hours: int = 0
    notes: Optional[str] = None


class BookingCreate(BookingBase):
    id: Optional[str] = None


class BookingUpdate(BaseModel):
    title: Optional[str] = None
    booking_type: Optional[str] = None
    date: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    attendees_count: Optional[int] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class BookingStatusUpdate(BaseModel):
    status: str


class BookingResponse(BookingBase):
    id: str

    model_config = {"from_attributes": True}


class BookingConflictCheckRequest(BaseModel):
    space_id: str
    date: str
    start_time: str
    end_time: str
    exclude_booking_id: Optional[str] = None


class BookingConflictCheckResponse(BaseModel):
    has_conflict: bool
    conflicting_booking: Optional[BookingResponse] = None
