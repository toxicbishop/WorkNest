import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import select, or_

from app.db.session import get_db
from app.models.member import Member, Membership, MembershipPlan
from app.schemas.member import (
    MemberCreate,
    MemberUpdate,
    MemberResponse,
    MembershipResponse,
    MembershipUpdate,
    MembershipRenewalRequest,
)
from app.core.dependencies import get_current_user_optional
from app.models.organization import StaffMember

router = APIRouter(prefix="/members", tags=["Members & Memberships"])


@router.get("", response_model=List[MemberResponse])
def get_members(
    location: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: Optional[StaffMember] = Depends(get_current_user_optional),
):
    query = select(Member)
    if location and location != "All Locations":
        query = query.where(Member.home_location == location)
    if status and status != "All":
        query = query.where(Member.status == status)
    if search:
        search_term = f"%{search.strip()}%"
        query = query.where(
            or_(
                Member.name.ilike(search_term),
                Member.email.ilike(search_term),
                Member.company.ilike(search_term),
            )
        )
    query = query.order_by(Member.created_at.desc())
    return list(db.execute(query).scalars().all())


@router.post("", response_model=MemberResponse, status_code=status.HTTP_201_CREATED)
def create_member(
    member_in: MemberCreate,
    db: Session = Depends(get_db),
    current_user: Optional[StaffMember] = Depends(get_current_user_optional),
):
    # Check duplicate
    existing = db.execute(
        select(Member).where(or_(Member.email == member_in.email, Member.phone == member_in.phone))
    ).scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A member with email '{member_in.email}' or phone '{member_in.phone}' already exists",
        )

    member_id = member_in.id or f"mem-{uuid.uuid4().hex[:8]}"
    joined_date = member_in.joined_date or datetime.now(timezone.utc).strftime("%Y-%m-%d")

    member = Member(
        id=member_id,
        lead_id=member_in.lead_id,
        name=member_in.name,
        email=member_in.email,
        phone=member_in.phone,
        company=member_in.company,
        title=member_in.title,
        home_location=member_in.home_location,
        status=member_in.status or "Active",
        joined_date=joined_date,
        avatar_url=member_in.avatar_url,
        emergency_contact=member_in.emergency_contact,
        notes=member_in.notes,
    )
    db.add(member)
    db.flush()

    # Optional initial membership contract
    if member_in.initial_membership:
        init_m = member_in.initial_membership
        membership_id = init_m.id or f"mship-{uuid.uuid4().hex[:8]}"
        mship = Membership(
            id=membership_id,
            member_id=member.id,
            plan_id=init_m.plan_id,
            plan_name=init_m.plan_name,
            plan_code=init_m.plan_code,
            monthly_rate_cents=init_m.monthly_rate_cents,
            currency=init_m.currency,
            billing_interval=init_m.billing_interval,
            status=init_m.status or "Active",
            start_date=init_m.start_date,
            renewal_date=init_m.renewal_date,
            end_date=init_m.end_date,
            desk_or_office_number=init_m.desk_or_office_number,
            assigned_location=init_m.assigned_location,
            auto_renew=init_m.auto_renew,
            notes=init_m.notes,
        )
        db.add(mship)
        member.current_membership_id = membership_id

    db.commit()
    db.refresh(member)
    return member


@router.get("/{member_id}", response_model=MemberResponse)
def get_member(
    member_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[StaffMember] = Depends(get_current_user_optional),
):
    member = db.get(Member, member_id)
    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found")
    return member


@router.put("/{member_id}", response_model=MemberResponse)
def update_member(
    member_id: str,
    member_in: MemberUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[StaffMember] = Depends(get_current_user_optional),
):
    member = db.get(Member, member_id)
    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found")

    update_data = member_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(member, key, value)

    db.commit()
    db.refresh(member)
    return member


@router.delete("/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_member(
    member_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[StaffMember] = Depends(get_current_user_optional),
):
    member = db.get(Member, member_id)
    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found")
    db.delete(member)
    db.commit()
    return None


# Membership endpoints
@router.patch("/memberships/{membership_id}/status", response_model=MembershipResponse)
def update_membership_status(
    membership_id: str,
    update_in: MembershipUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[StaffMember] = Depends(get_current_user_optional),
):
    mship = db.get(Membership, membership_id)
    if not mship:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Membership contract not found")

    if update_in.status:
        mship.status = update_in.status
        if update_in.status == "Cancelled":
            mship.auto_renew = False
            mship.end_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    if update_in.renewal_date:
        mship.renewal_date = update_in.renewal_date
    if update_in.auto_renew is not None:
        mship.auto_renew = update_in.auto_renew
    if update_in.desk_or_office_number is not None:
        mship.desk_or_office_number = update_in.desk_or_office_number
    if update_in.notes is not None:
        mship.notes = update_in.notes

    db.commit()
    db.refresh(mship)
    return mship


@router.post("/memberships/{membership_id}/renew", response_model=MembershipResponse)
def renew_membership(
    membership_id: str,
    renewal_in: MembershipRenewalRequest,
    db: Session = Depends(get_db),
    current_user: Optional[StaffMember] = Depends(get_current_user_optional),
):
    mship = db.get(Membership, membership_id)
    if not mship:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Membership contract not found")

    mship.status = "Active"
    mship.renewal_date = renewal_in.next_renewal_date
    db.commit()
    db.refresh(mship)
    return mship
