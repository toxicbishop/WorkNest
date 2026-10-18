from typing import Optional, List
from pydantic import BaseModel, EmailStr


class OrganizationBase(BaseModel):
    name: str
    support_email: EmailStr
    default_currency: str = "INR"
    primary_timezone: str = "Asia/Kolkata"
    tax_id: Optional[str] = None
    website_url: str = "https://worknest.space"
    auto_assign_leads: bool = True
    lead_response_goal_hours: int = 2


class OrganizationUpdate(BaseModel):
    name: Optional[str] = None
    support_email: Optional[EmailStr] = None
    default_currency: Optional[str] = None
    primary_timezone: Optional[str] = None
    tax_id: Optional[str] = None
    website_url: Optional[str] = None
    auto_assign_leads: Optional[bool] = None
    lead_response_goal_hours: Optional[int] = None


class OrganizationResponse(OrganizationBase):
    id: str

    model_config = {"from_attributes": True}


class LocationBase(BaseModel):
    name: str
    address: str
    city: str
    state: str
    zip: str
    timezone: str = "Asia/Kolkata"
    operating_hours: str = "24/7 Access for Members"
    total_capacity: int = 100
    current_occupancy_rate: int = 0
    phone: str
    manager_name: str
    status: str = "Active"  # Active, Maintenance, Coming Soon


class LocationCreate(LocationBase):
    id: Optional[str] = None


class LocationUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip: Optional[str] = None
    timezone: Optional[str] = None
    operating_hours: Optional[str] = None
    total_capacity: Optional[int] = None
    current_occupancy_rate: Optional[int] = None
    phone: Optional[str] = None
    manager_name: Optional[str] = None
    status: Optional[str] = None


class LocationResponse(LocationBase):
    id: str
    org_id: str

    model_config = {"from_attributes": True}


class StaffMemberBase(BaseModel):
    name: str
    email: EmailStr
    role: str = "Community Manager"
    assigned_locations: List[str] = []
    status: str = "Active"


class StaffMemberCreate(StaffMemberBase):
    id: Optional[str] = None
    password: Optional[str] = "WorkNest123!"


class StaffMemberUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    assigned_locations: Optional[List[str]] = None
    status: Optional[str] = None
    password: Optional[str] = None


class StaffMemberResponse(StaffMemberBase):
    id: str
    org_id: str

    model_config = {"from_attributes": True}
