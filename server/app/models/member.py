from typing import Optional, List
from sqlalchemy import String, Integer, Boolean, ForeignKey, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin


class MembershipPlan(Base, TimestampMixin):
    __tablename__ = "membership_plans"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    org_id: Mapped[str] = mapped_column(String(64), ForeignKey("organizations.id"), default="org-default", nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    code: Mapped[str] = mapped_column(String(50), nullable=False)  # Hot Desk, Dedicated Desk, Private Office, Virtual Office, Enterprise Suite
    monthly_rate_cents: Mapped[int] = mapped_column(Integer, nullable=False)
    currency: Mapped[str] = mapped_column(String(10), default="INR", nullable=False)
    meeting_room_credits_hours: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    printing_credits_pages: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    included_locations: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    memberships: Mapped[List["Membership"]] = relationship("Membership", back_populates="plan")


class Member(Base, TimestampMixin):
    __tablename__ = "members"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    lead_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True, index=True)
    name: Mapped[str] = mapped_column(String(150), nullable=False, index=True)
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    phone: Mapped[str] = mapped_column(String(50), nullable=False)
    company: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    title: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    home_location: Mapped[str] = mapped_column(String(150), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(50), default="Active", nullable=False, index=True)  # Active, Past Due, Suspended, Former
    joined_date: Mapped[str] = mapped_column(String(50), nullable=False)
    current_membership_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    emergency_contact: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    memberships: Mapped[List["Membership"]] = relationship("Membership", back_populates="member", cascade="all, delete-orphan")


class Membership(Base, TimestampMixin):
    __tablename__ = "memberships"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    member_id: Mapped[str] = mapped_column(String(64), ForeignKey("members.id", ondelete="CASCADE"), nullable=False, index=True)
    plan_id: Mapped[str] = mapped_column(String(64), ForeignKey("membership_plans.id"), nullable=False)
    plan_name: Mapped[str] = mapped_column(String(100), nullable=False)
    plan_code: Mapped[str] = mapped_column(String(50), nullable=False)
    monthly_rate_cents: Mapped[int] = mapped_column(Integer, nullable=False)
    currency: Mapped[str] = mapped_column(String(10), default="INR", nullable=False)
    billing_interval: Mapped[str] = mapped_column(String(50), default="Monthly", nullable=False)  # Monthly, Quarterly, Annual
    status: Mapped[str] = mapped_column(String(50), default="Active", nullable=False, index=True)  # Trial, Active, Past Due, Expiring, Cancelled, Expired
    start_date: Mapped[str] = mapped_column(String(50), nullable=False)
    renewal_date: Mapped[str] = mapped_column(String(50), nullable=False)
    end_date: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    desk_or_office_number: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    assigned_location: Mapped[str] = mapped_column(String(150), nullable=False)
    auto_renew: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    member: Mapped["Member"] = relationship("Member", back_populates="memberships")
    plan: Mapped["MembershipPlan"] = relationship("MembershipPlan", back_populates="memberships")
