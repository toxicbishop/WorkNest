import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional, List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, or_

from app.models.lead import Lead, LeadAuditLog, Activity
from app.models.member import Member, Membership, MembershipPlan
from app.schemas.lead import LeadCreate, LeadUpdate, LeadConvertRequest


class LeadService:
    @staticmethod
    def get_leads(
        db: Session,
        location: Optional[str] = None,
        status_filter: Optional[str] = None,
        search: Optional[str] = None,
    ) -> List[Lead]:
        query = select(Lead)
        if location and location != "All Locations":
            query = query.where(Lead.preferred_location == location)
        if status_filter and status_filter != "All":
            query = query.where(Lead.status == status_filter)
        if search:
            search_term = f"%{search.strip()}%"
            query = query.where(
                or_(
                    Lead.name.ilike(search_term),
                    Lead.email.ilike(search_term),
                    Lead.company.ilike(search_term),
                    Lead.phone.ilike(search_term),
                )
            )
        query = query.order_by(Lead.created_at.desc())
        return list(db.execute(query).scalars().all())

    @staticmethod
    def get_lead_by_id(db: Session, lead_id: str) -> Optional[Lead]:
        return db.get(Lead, lead_id)

    @staticmethod
    def create_lead(db: Session, lead_in: LeadCreate) -> Lead:
        # Check duplicate candidates
        existing = db.execute(
            select(Lead).where(
                or_(Lead.email == lead_in.email, Lead.phone == lead_in.phone)
            )
        ).scalar_one_or_none()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"A lead with email '{lead_in.email}' or phone '{lead_in.phone}' already exists (Lead ID: {existing.id})",
            )

        lead_id = lead_in.id or f"lead-{uuid.uuid4().hex[:8]}"
        now_iso = datetime.now(timezone.utc).isoformat()
        
        # Default next follow-up 24 hours from now if not provided
        follow_up_date = lead_in.next_follow_up_date or (datetime.now(timezone.utc) + timedelta(days=1)).strftime("%Y-%m-%d")

        db_lead = Lead(
            id=lead_id,
            name=lead_in.name,
            email=lead_in.email,
            phone=lead_in.phone,
            company=lead_in.company,
            interested_plan=lead_in.interested_plan,
            preferred_location=lead_in.preferred_location,
            team_size=lead_in.team_size,
            source=lead_in.source,
            status=lead_in.status or "New",
            assigned_to=lead_in.assigned_to or "Unassigned",
            next_follow_up_date=follow_up_date,
            notes=lead_in.notes,
            lost_reason=lead_in.lost_reason,
        )
        db.add(db_lead)

        # Record initial audit entry
        audit_log = LeadAuditLog(
            id=f"audit-{uuid.uuid4().hex[:8]}",
            lead_id=lead_id,
            from_status=None,
            to_status=db_lead.status,
            changed_by=lead_in.assigned_to or "System",
            reason="Initial lead intake created",
            created_at=now_iso,
        )
        db.add(audit_log)

        # Create automatic follow-up activity
        activity = Activity(
            id=f"act-{uuid.uuid4().hex[:8]}",
            lead_id=lead_id,
            lead_name=lead_in.name,
            type="call",
            title=f"Initial discovery call with {lead_in.name}",
            description=f"Qualify space requirements for {lead_in.interested_plan} at {lead_in.preferred_location}.",
            due_date=follow_up_date,
            completed=False,
            staff_name=lead_in.assigned_to or "Community Team",
        )
        db.add(activity)

        db.commit()
        db.refresh(db_lead)
        return db_lead

    @staticmethod
    def update_lead(db: Session, lead_id: str, lead_in: LeadUpdate) -> Lead:
        lead = db.get(Lead, lead_id)
        if not lead:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")

        update_data = lead_in.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(lead, key, value)

        db.commit()
        db.refresh(lead)
        return lead

    @staticmethod
    def update_lead_status(
        db: Session,
        lead_id: str,
        new_status: str,
        reason: Optional[str] = None,
        changed_by: str = "Staff",
    ) -> Lead:
        lead = db.get(Lead, lead_id)
        if not lead:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")

        valid_statuses = ["New", "Contacted", "Tour Booked", "Converted", "Lost"]
        if new_status not in valid_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid lead status '{new_status}'. Allowed: {valid_statuses}",
            )

        # Enforce PRD Section 6.2 requirement: mandatory reason when marked Lost
        if new_status == "Lost" and (not reason or not reason.strip()):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A valid explanation reason is mandatory when marking a lead as Lost (PRD 6.2)",
            )

        old_status = lead.status
        lead.status = new_status
        if new_status == "Lost":
            lead.lost_reason = reason

        now_iso = datetime.now(timezone.utc).isoformat()
        audit_log = LeadAuditLog(
            id=f"audit-{uuid.uuid4().hex[:8]}",
            lead_id=lead.id,
            from_status=old_status,
            to_status=new_status,
            changed_by=changed_by,
            reason=reason or f"Status transitioned from {old_status} to {new_status}",
            created_at=now_iso,
        )
        db.add(audit_log)

        db.commit()
        db.refresh(lead)
        return lead

    @staticmethod
    def convert_to_member(
        db: Session,
        lead_id: str,
        convert_data: LeadConvertRequest,
        changed_by: str = "Staff",
    ) -> Member:
        lead = db.get(Lead, lead_id)
        if not lead:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")

        if lead.status == "Converted" and lead.converted_member_id:
            existing_member = db.get(Member, lead.converted_member_id)
            if existing_member:
                return existing_member

        # Check plan
        plan_stmt = select(MembershipPlan).where(
            or_(
                MembershipPlan.code == convert_data.plan,
                MembershipPlan.name == convert_data.plan,
            )
        )
        plan = db.execute(plan_stmt).scalar_one_or_none()
        if not plan:
            # Fallback to first active plan if specific plan not found
            plan = db.execute(select(MembershipPlan).where(MembershipPlan.is_active == True)).scalar_one_or_none()
            if not plan:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Membership plan '{convert_data.plan}' not found in active plans catalogue",
                )

        now_iso = datetime.now(timezone.utc).isoformat()

        # Find existing member by email/phone or create new
        existing_member = db.execute(
            select(Member).where(or_(Member.email == lead.email, Member.phone == lead.phone))
        ).scalar_one_or_none()

        if existing_member:
            member = existing_member
            member.company = lead.company or member.company
            member.home_location = lead.preferred_location or member.home_location
            member.status = "Active"
        else:
            member_id = f"mem-{uuid.uuid4().hex[:8]}"
            member = Member(
                id=member_id,
                lead_id=lead.id,
                name=lead.name,
                email=lead.email,
                phone=lead.phone,
                company=lead.company,
                home_location=lead.preferred_location,
                status="Active",
                joined_date=convert_data.start_date or datetime.now(timezone.utc).strftime("%Y-%m-%d"),
                notes=lead.notes,
            )
            db.add(member)
            db.flush()

        # Calculate renewal date based on billing interval
        start_dt = datetime.fromisoformat(convert_data.start_date) if "T" in convert_data.start_date else datetime.strptime(convert_data.start_date, "%Y-%m-%d")
        if convert_data.billing_interval == "Annual":
            renewal_dt = start_dt + timedelta(days=365)
        elif convert_data.billing_interval == "Quarterly":
            renewal_dt = start_dt + timedelta(days=90)
        else:
            renewal_dt = start_dt + timedelta(days=30)
        renewal_date_str = renewal_dt.strftime("%Y-%m-%d")

        # Create Membership contract
        membership_id = f"mship-{uuid.uuid4().hex[:8]}"
        membership = Membership(
            id=membership_id,
            member_id=member.id,
            plan_id=plan.id,
            plan_name=plan.name,
            plan_code=plan.code,
            monthly_rate_cents=plan.monthly_rate_cents,
            currency=plan.currency,
            billing_interval=convert_data.billing_interval,
            status="Active",
            start_date=convert_data.start_date,
            renewal_date=renewal_date_str,
            desk_or_office_number=convert_data.desk_or_office_number,
            assigned_location=lead.preferred_location,
            auto_renew=True,
            notes=f"Converted from Lead {lead.id} on {now_iso[:10]}",
        )
        db.add(membership)
        member.current_membership_id = membership_id

        # Update Lead
        lead.status = "Converted"
        lead.converted_member_id = member.id

        # Audit log
        audit_log = LeadAuditLog(
            id=f"audit-{uuid.uuid4().hex[:8]}",
            lead_id=lead.id,
            from_status="Tour Booked" if lead.status != "Converted" else lead.status,
            to_status="Converted",
            changed_by=changed_by,
            reason=f"Converted to member {member.name} under plan {plan.name}",
            created_at=now_iso,
        )
        db.add(audit_log)

        db.commit()
        db.refresh(member)
        return member

    @staticmethod
    def delete_lead(db: Session, lead_id: str) -> bool:
        lead = db.get(Lead, lead_id)
        if not lead:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")
        db.delete(lead)
        db.commit()
        return True
