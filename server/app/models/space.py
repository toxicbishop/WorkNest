from typing import Optional, List
from sqlalchemy import String, Integer, Boolean, ForeignKey, Text, JSON, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin


class Space(Base, TimestampMixin):
    __tablename__ = "spaces"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    location_id: Mapped[str] = mapped_column(String(64), ForeignKey("locations.id"), nullable=False, index=True)
    location_name: Mapped[str] = mapped_column(String(150), nullable=False)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    type: Mapped[str] = mapped_column(String(100), nullable=False)  # Meeting Room, Conference Hall, Podcast Studio, Event Space, Phone Booth, Hot Desk Zone, Dedicated Desk Bay, Private Office Suite
    capacity: Mapped[int] = mapped_column(Integer, nullable=False)
    hourly_rate_cents: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    amenities: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    floor_or_zone: Mapped[str] = mapped_column(String(100), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    bookings: Mapped[List["Booking"]] = relationship("Booking", back_populates="space", cascade="all, delete-orphan")


class Booking(Base, TimestampMixin):
    __tablename__ = "bookings"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    space_id: Mapped[str] = mapped_column(String(64), ForeignKey("spaces.id"), nullable=False, index=True)
    space_name: Mapped[str] = mapped_column(String(150), nullable=False)
    location_name: Mapped[str] = mapped_column(String(150), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    booking_type: Mapped[str] = mapped_column(String(50), default="Meeting Room", nullable=False)  # Meeting Room, Prospect Tour, Event, Desk
    booked_by_name: Mapped[str] = mapped_column(String(150), nullable=False)
    booked_by_email: Mapped[str] = mapped_column(String(255), nullable=False)
    member_id: Mapped[Optional[str]] = mapped_column(String(64), ForeignKey("members.id", ondelete="SET NULL"), nullable=True)
    lead_id: Mapped[Optional[str]] = mapped_column(String(64), ForeignKey("leads.id", ondelete="SET NULL"), nullable=True)
    date: Mapped[str] = mapped_column(String(20), nullable=False, index=True)  # YYYY-MM-DD
    start_time: Mapped[str] = mapped_column(String(10), nullable=False)  # HH:MM (24h)
    end_time: Mapped[str] = mapped_column(String(10), nullable=False)  # HH:MM (24h)
    attendees_count: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="Confirmed", nullable=False, index=True)  # Confirmed, Checked In, Completed, Cancelled, No Show
    total_cost_cents: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    credits_used_hours: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    space: Mapped["Space"] = relationship("Space", back_populates="bookings")

    __table_args__ = (
        Index("ix_bookings_space_date", "space_id", "date"),
    )
