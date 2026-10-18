from typing import Optional, List
from sqlalchemy import String, Integer, Boolean, ForeignKey, Text, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin


class Lead(Base, TimestampMixin):
    __tablename__ = "leads"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    org_id: Mapped[str] = mapped_column(String(64), ForeignKey("organizations.id"), default="org-default", nullable=False)
    name: Mapped[str] = mapped_column(String(150), nullable=False, index=True)
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    phone: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    company: Mapped[Optional[str]] = mapped_column(String(150), nullable=True, index=True)
    interested_plan: Mapped[str] = mapped_column(String(50), nullable=False)  # Hot Desk, Dedicated Desk, Private Office, Virtual Office, Enterprise Suite
    preferred_location: Mapped[str] = mapped_column(String(150), nullable=False, index=True)
    team_size: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    source: Mapped[str] = mapped_column(String(50), default="Website Form", nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="New", nullable=False, index=True)  # New, Contacted, Tour Booked, Converted, Lost
    assigned_to: Mapped[str] = mapped_column(String(100), default="Unassigned", nullable=False)
    next_follow_up_date: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    lost_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    converted_member_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)

    activities: Mapped[List["Activity"]] = relationship("Activity", back_populates="lead", cascade="all, delete-orphan")
    audit_logs: Mapped[List["LeadAuditLog"]] = relationship("LeadAuditLog", back_populates="lead", cascade="all, delete-orphan")


class LeadAuditLog(Base):
    __tablename__ = "lead_audit_logs"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    lead_id: Mapped[str] = mapped_column(String(64), ForeignKey("leads.id"), nullable=False, index=True)
    from_status: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    to_status: Mapped[str] = mapped_column(String(50), nullable=False)
    changed_by: Mapped[str] = mapped_column(String(100), nullable=False)
    reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[str] = mapped_column(String(50), nullable=False)

    lead: Mapped["Lead"] = relationship("Lead", back_populates="audit_logs")


class Activity(Base, TimestampMixin):
    __tablename__ = "activities"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    lead_id: Mapped[Optional[str]] = mapped_column(String(64), ForeignKey("leads.id", ondelete="SET NULL"), nullable=True, index=True)
    lead_name: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    member_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True, index=True)
    type: Mapped[str] = mapped_column(String(50), nullable=False)  # call, email, tour, meeting, note, task
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    due_date: Mapped[str] = mapped_column(String(50), nullable=False)  # ISO or YYYY-MM-DD
    completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    outcome: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    staff_name: Mapped[str] = mapped_column(String(100), nullable=False)

    lead: Mapped[Optional["Lead"]] = relationship("Lead", back_populates="activities")
