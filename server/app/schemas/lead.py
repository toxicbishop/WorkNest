from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field


class LeadBase(BaseModel):
    name: str
    email: EmailStr
    phone: str
    company: Optional[str] = None
    interested_plan: str  # Hot Desk, Dedicated Desk, Private Office, Virtual Office, Enterprise Suite
    preferred_location: str
    team_size: Optional[int] = None
    source: str = "Website Form"
    status: str = "New"
    assigned_to: str = "Unassigned"
    next_follow_up_date: Optional[str] = None
    notes: Optional[str] = None
    lost_reason: Optional[str] = None


class LeadCreate(LeadBase):
    id: Optional[str] = None


class LeadUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    interested_plan: Optional[str] = None
    preferred_location: Optional[str] = None
    team_size: Optional[int] = None
    source: Optional[str] = None
    status: Optional[str] = None
    assigned_to: Optional[str] = None
    next_follow_up_date: Optional[str] = None
    notes: Optional[str] = None
    lost_reason: Optional[str] = None


class LeadStatusUpdate(BaseModel):
    status: str
    reason: Optional[str] = None
    changed_by: Optional[str] = "Staff"


class LeadConvertRequest(BaseModel):
    plan: str
    start_date: str
    billing_interval: str = "Monthly"
    desk_or_office_number: Optional[str] = None


class LeadAuditLogResponse(BaseModel):
    id: str
    lead_id: str
    from_status: Optional[str] = None
    to_status: str
    changed_by: str
    reason: Optional[str] = None
    created_at: str

    model_config = {"from_attributes": True}


class ActivityBase(BaseModel):
    lead_id: Optional[str] = None
    lead_name: Optional[str] = None
    member_id: Optional[str] = None
    type: str  # call, email, tour, meeting, note, task
    title: str
    description: Optional[str] = None
    due_date: str
    completed: bool = False
    outcome: Optional[str] = None
    staff_name: str


class ActivityCreate(ActivityBase):
    id: Optional[str] = None


class ActivityUpdate(BaseModel):
    type: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[str] = None
    completed: Optional[bool] = None
    outcome: Optional[str] = None
    staff_name: Optional[str] = None


class ActivityResponse(ActivityBase):
    id: str

    model_config = {"from_attributes": True}


class LeadResponse(LeadBase):
    id: str
    org_id: str
    converted_member_id: Optional[str] = None
    activities: List[ActivityResponse] = []
    audit_logs: List[LeadAuditLogResponse] = []

    model_config = {"from_attributes": True}
