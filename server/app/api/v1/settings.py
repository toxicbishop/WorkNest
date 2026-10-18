import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.db.session import get_db
from app.models.organization import Organization, Location, StaffMember
from app.models.member import MembershipPlan
from app.schemas.organization import (
    OrganizationUpdate,
    OrganizationResponse,
    LocationCreate,
    LocationUpdate,
    LocationResponse,
    StaffMemberCreate,
    StaffMemberUpdate,
    StaffMemberResponse,
)
from app.schemas.member import (
    MembershipPlanCreate,
    MembershipPlanUpdate,
    MembershipPlanResponse,
)
from app.core.dependencies import get_current_user_optional
from app.core.security import get_password_hash

router = APIRouter(prefix="/settings", tags=["Settings & Administration"])


# Organization
@router.get("/organization", response_model=OrganizationResponse)
def get_organization(
    db: Session = Depends(get_db),
    current_user: Optional[StaffMember] = Depends(get_current_user_optional),
):
    org = db.execute(select(Organization)).scalar_one_or_none()
    if not org:
        org = Organization(
            id="org-default",
            name="WorkNest Spaces Pvt. Ltd.",
            support_email="support@worknest.space",
            default_currency="INR",
            primary_timezone="Asia/Kolkata",
            tax_id="GSTIN29ABCDE1234F1Z5",
            website_url="https://worknest.space",
            auto_assign_leads=True,
            lead_response_goal_hours=2,
        )
        db.add(org)
        db.commit()
        db.refresh(org)
    return org


@router.patch("/organization", response_model=OrganizationResponse)
def update_organization(
    org_in: OrganizationUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[StaffMember] = Depends(get_current_user_optional),
):
    org = db.execute(select(Organization)).scalar_one_or_none()
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")

    update_data = org_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(org, key, value)

    db.commit()
    db.refresh(org)
    return org


# Locations
@router.get("/locations", response_model=List[LocationResponse])
def get_locations(
    db: Session = Depends(get_db),
    current_user: Optional[StaffMember] = Depends(get_current_user_optional),
):
    return list(db.execute(select(Location).order_by(Location.name.asc())).scalars().all())


@router.post("/locations", response_model=LocationResponse, status_code=status.HTTP_201_CREATED)
def create_location(
    loc_in: LocationCreate,
    db: Session = Depends(get_db),
    current_user: Optional[StaffMember] = Depends(get_current_user_optional),
):
    loc_id = loc_in.id or f"loc-{uuid.uuid4().hex[:8]}"
    location = Location(
        id=loc_id,
        org_id="org-default",
        name=loc_in.name,
        address=loc_in.address,
        city=loc_in.city,
        state=loc_in.state,
        zip=loc_in.zip,
        timezone=loc_in.timezone,
        operating_hours=loc_in.operating_hours,
        total_capacity=loc_in.total_capacity,
        current_occupancy_rate=loc_in.current_occupancy_rate,
        phone=loc_in.phone,
        manager_name=loc_in.manager_name,
        status=loc_in.status,
    )
    db.add(location)
    db.commit()
    db.refresh(location)
    return location


@router.put("/locations/{location_id}", response_model=LocationResponse)
def update_location(
    location_id: str,
    loc_in: LocationUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[StaffMember] = Depends(get_current_user_optional),
):
    loc = db.get(Location, location_id)
    if not loc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Location not found")

    update_data = loc_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(loc, key, value)

    db.commit()
    db.refresh(loc)
    return loc


@router.delete("/locations/{location_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_location(
    location_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[StaffMember] = Depends(get_current_user_optional),
):
    loc = db.get(Location, location_id)
    if not loc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Location not found")
    db.delete(loc)
    db.commit()
    return None


# Plans
@router.get("/plans", response_model=List[MembershipPlanResponse])
def get_plans(
    db: Session = Depends(get_db),
    current_user: Optional[StaffMember] = Depends(get_current_user_optional),
):
    return list(db.execute(select(MembershipPlan).order_by(MembershipPlan.monthly_rate_cents.asc())).scalars().all())


@router.post("/plans", response_model=MembershipPlanResponse, status_code=status.HTTP_201_CREATED)
def create_plan(
    plan_in: MembershipPlanCreate,
    db: Session = Depends(get_db),
    current_user: Optional[StaffMember] = Depends(get_current_user_optional),
):
    plan_id = plan_in.id or f"plan-{uuid.uuid4().hex[:8]}"
    plan = MembershipPlan(
        id=plan_id,
        org_id="org-default",
        name=plan_in.name,
        code=plan_in.code,
        monthly_rate_cents=plan_in.monthly_rate_cents,
        currency=plan_in.currency,
        meeting_room_credits_hours=plan_in.meeting_room_credits_hours,
        printing_credits_pages=plan_in.printing_credits_pages,
        included_locations=plan_in.included_locations,
        description=plan_in.description,
        is_active=plan_in.is_active,
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return plan


@router.put("/plans/{plan_id}", response_model=MembershipPlanResponse)
def update_plan(
    plan_id: str,
    plan_in: MembershipPlanUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[StaffMember] = Depends(get_current_user_optional),
):
    plan = db.get(MembershipPlan, plan_id)
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")

    update_data = plan_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(plan, key, value)

    db.commit()
    db.refresh(plan)
    return plan


@router.patch("/plans/{plan_id}/toggle-active", response_model=MembershipPlanResponse)
def toggle_plan_active(
    plan_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[StaffMember] = Depends(get_current_user_optional),
):
    plan = db.get(MembershipPlan, plan_id)
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")

    plan.is_active = not plan.is_active
    db.commit()
    db.refresh(plan)
    return plan


# Staff
@router.get("/staff", response_model=List[StaffMemberResponse])
def get_staff(
    db: Session = Depends(get_db),
    current_user: Optional[StaffMember] = Depends(get_current_user_optional),
):
    return list(db.execute(select(StaffMember).order_by(StaffMember.name.asc())).scalars().all())


@router.post("/staff", response_model=StaffMemberResponse, status_code=status.HTTP_201_CREATED)
def create_staff(
    staff_in: StaffMemberCreate,
    db: Session = Depends(get_db),
    current_user: Optional[StaffMember] = Depends(get_current_user_optional),
):
    existing = db.execute(select(StaffMember).where(StaffMember.email == staff_in.email)).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"Staff with email '{staff_in.email}' already exists")

    staff_id = staff_in.id or f"staff-{uuid.uuid4().hex[:8]}"
    hashed_pwd = get_password_hash(staff_in.password) if staff_in.password else None

    staff = StaffMember(
        id=staff_id,
        org_id="org-default",
        name=staff_in.name,
        email=staff_in.email,
        hashed_password=hashed_pwd,
        role=staff_in.role,
        assigned_locations=staff_in.assigned_locations,
        status=staff_in.status,
    )
    db.add(staff)
    db.commit()
    db.refresh(staff)
    return staff


@router.put("/staff/{staff_id}", response_model=StaffMemberResponse)
def update_staff(
    staff_id: str,
    staff_in: StaffMemberUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[StaffMember] = Depends(get_current_user_optional),
):
    staff = db.get(StaffMember, staff_id)
    if not staff:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Staff member not found")

    update_data = staff_in.model_dump(exclude_unset=True, exclude={"password"})
    for key, value in update_data.items():
        setattr(staff, key, value)

    if staff_in.password:
        staff.hashed_password = get_password_hash(staff_in.password)

    db.commit()
    db.refresh(staff)
    return staff


@router.delete("/staff/{staff_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_staff(
    staff_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[StaffMember] = Depends(get_current_user_optional),
):
    staff = db.get(StaffMember, staff_id)
    if not staff:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Staff member not found")
    db.delete(staff)
    db.commit()
    return None
