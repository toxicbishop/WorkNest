from typing import List, Optional
from sqlalchemy import String, Integer, Boolean, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin


class Organization(Base, TimestampMixin):
    __tablename__ = "organizations"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    support_email: Mapped[str] = mapped_column(String(255), nullable=False)
    default_currency: Mapped[str] = mapped_column(String(10), default="INR", nullable=False)
    primary_timezone: Mapped[str] = mapped_column(String(64), default="Asia/Kolkata", nullable=False)
    tax_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    website_url: Mapped[str] = mapped_column(String(255), default="https://worknest.space")
    auto_assign_leads: Mapped[bool] = mapped_column(Boolean, default=True)
    lead_response_goal_hours: Mapped[int] = mapped_column(Integer, default=2)

    locations: Mapped[List["Location"]] = relationship("Location", back_populates="organization", cascade="all, delete-orphan")
    staff_members: Mapped[List["StaffMember"]] = relationship("StaffMember", back_populates="organization", cascade="all, delete-orphan")


class Location(Base, TimestampMixin):
    __tablename__ = "locations"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    org_id: Mapped[str] = mapped_column(String(64), ForeignKey("organizations.id"), nullable=False, default="org-default")
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    address: Mapped[str] = mapped_column(String(255), nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    state: Mapped[str] = mapped_column(String(100), nullable=False)
    zip: Mapped[str] = mapped_column(String(20), nullable=False)
    timezone: Mapped[str] = mapped_column(String(64), default="Asia/Kolkata", nullable=False)
    operating_hours: Mapped[str] = mapped_column(String(100), default="24/7 Access for Members", nullable=False)
    total_capacity: Mapped[int] = mapped_column(Integer, default=100, nullable=False)
    current_occupancy_rate: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    phone: Mapped[str] = mapped_column(String(50), nullable=False)
    manager_name: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="Active", nullable=False)  # Active, Maintenance, Coming Soon

    organization: Mapped["Organization"] = relationship("Organization", back_populates="locations")


class StaffMember(Base, TimestampMixin):
    __tablename__ = "staff_members"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    org_id: Mapped[str] = mapped_column(String(64), ForeignKey("organizations.id"), nullable=False, default="org-default")
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    role: Mapped[str] = mapped_column(String(50), default="Community Manager", nullable=False)  # Workspace Owner, Community Manager, Sales Lead, Front Desk
    assigned_locations: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="Active", nullable=False)  # Active, Invited, Inactive

    organization: Mapped["Organization"] = relationship("Organization", back_populates="staff_members")
