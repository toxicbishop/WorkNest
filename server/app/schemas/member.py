from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr


class MembershipPlanBase(BaseModel):
    name: str
    code: str
    monthly_rate_cents: int
    currency: str = "INR"
    meeting_room_credits_hours: int = 0
    printing_credits_pages: int = 0
    included_locations: List[str] = ["All"]
    description: str
    is_active: bool = True


class MembershipPlanCreate(MembershipPlanBase):
    id: Optional[str] = None


class MembershipPlanUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    monthly_rate_cents: Optional[int] = None
    currency: Optional[str] = None
    meeting_room_credits_hours: Optional[int] = None
    printing_credits_pages: Optional[int] = None
    included_locations: Optional[List[str]] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class MembershipPlanResponse(MembershipPlanBase):
    id: str
    org_id: str

    model_config = {"from_attributes": True}


class MembershipBase(BaseModel):
    plan_id: str
    plan_name: str
    plan_code: str
    monthly_rate_cents: int
    currency: str = "INR"
    billing_interval: str = "Monthly"
    status: str = "Active"
    start_date: str
    renewal_date: str
    end_date: Optional[str] = None
    desk_or_office_number: Optional[str] = None
    assigned_location: str
    auto_renew: bool = True
    notes: Optional[str] = None


class MembershipCreate(MembershipBase):
    id: Optional[str] = None
    member_id: Optional[str] = None


class MembershipUpdate(BaseModel):
    status: Optional[str] = None
    renewal_date: Optional[str] = None
    end_date: Optional[str] = None
    auto_renew: Optional[bool] = None
    desk_or_office_number: Optional[str] = None
    notes: Optional[str] = None


class MembershipRenewalRequest(BaseModel):
    next_renewal_date: str


class MembershipResponse(MembershipBase):
    id: str
    member_id: str

    model_config = {"from_attributes": True}


class MemberBase(BaseModel):
    name: str
    email: EmailStr
    phone: str
    company: Optional[str] = None
    title: Optional[str] = None
    home_location: str
    status: str = "Active"
    avatar_url: Optional[str] = None
    emergency_contact: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None


class MemberCreate(MemberBase):
    id: Optional[str] = None
    lead_id: Optional[str] = None
    joined_date: Optional[str] = None
    initial_membership: Optional[MembershipCreate] = None


class MemberUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    title: Optional[str] = None
    home_location: Optional[str] = None
    status: Optional[str] = None
    avatar_url: Optional[str] = None
    emergency_contact: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None


class MemberResponse(MemberBase):
    id: str
    lead_id: Optional[str] = None
    joined_date: str
    current_membership_id: Optional[str] = None
    memberships: List[MembershipResponse] = []

    model_config = {"from_attributes": True}
