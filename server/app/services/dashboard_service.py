from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict
from sqlalchemy.orm import Session
from sqlalchemy import select, func, and_

from app.models.member import Member, Membership
from app.models.lead import Lead, Activity
from app.models.space import Booking
from app.models.invoice import Invoice
from app.schemas.dashboard import DashboardMetricsResponse, DefinitionNotes, NotificationItem, NotificationsSummaryResponse


class DashboardService:
    @staticmethod
    def get_metrics(db: Session, location: Optional[str] = None) -> DashboardMetricsResponse:
        # Active Members
        member_query = select(func.count(Member.id)).where(Member.status == "Active")
        if location and location != "All Locations":
            member_query = member_query.where(Member.home_location == location)
        active_members = db.execute(member_query).scalar_one() or 0

        # Open Leads
        lead_query = select(func.count(Lead.id)).where(Lead.status.in_(["New", "Contacted", "Tour Booked"]))
        if location and location != "All Locations":
            lead_query = lead_query.where(Lead.preferred_location == location)
        open_leads = db.execute(lead_query).scalar_one() or 0

        # Tours Scheduled This Week
        today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        week_ahead_str = (datetime.now(timezone.utc) + timedelta(days=7)).strftime("%Y-%m-%d")
        tours_query = select(func.count(Booking.id)).where(
            and_(
                Booking.booking_type == "Prospect Tour",
                Booking.status.in_(["Confirmed", "Checked In"]),
                Booking.date >= today_str,
                Booking.date <= week_ahead_str,
            )
        )
        if location and location != "All Locations":
            tours_query = tours_query.where(Booking.location_name == location)
        tours_scheduled = db.execute(tours_query).scalar_one() or 0

        # MRR in Cents
        mrr_query = select(func.sum(Membership.monthly_rate_cents)).where(Membership.status == "Active")
        if location and location != "All Locations":
            mrr_query = mrr_query.where(Membership.assigned_location == location)
        mrr_cents = db.execute(mrr_query).scalar_one() or 0

        # Pipeline breakdown counts
        pipeline_counts: Dict[str, int] = {
            "New": 0,
            "Contacted": 0,
            "Tour Booked": 0,
            "Converted": 0,
            "Lost": 0,
        }
        for st in pipeline_counts.keys():
            st_query = select(func.count(Lead.id)).where(Lead.status == st)
            if location and location != "All Locations":
                st_query = st_query.where(Lead.preferred_location == location)
            pipeline_counts[st] = db.execute(st_query).scalar_one() or 0

        definition_notes = DefinitionNotes(
            activeMembers="Total individuals with an Active status and valid membership contract across selected locations.",
            openLeads="Inquiries currently in New, Contacted, or Tour Booked stages requiring operational follow-up.",
            toursScheduled="Total confirmed prospective member facility walkthroughs scheduled in the next 7 days.",
            mrr="Monthly Recurring Revenue recognized from active contracted membership plans, excluding ad-hoc room bookings.",
        )

        return DashboardMetricsResponse(
            activeMembers=active_members,
            openLeads=open_leads,
            toursScheduledThisWeek=tours_scheduled,
            mrrCents=mrr_cents,
            pipelineCounts=pipeline_counts,
            isDemoData=False,
            definitionNotes=definition_notes,
        )

    @staticmethod
    def get_notifications(db: Session, location: Optional[str] = None) -> NotificationsSummaryResponse:
        items: List[NotificationItem] = []
        today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")

        # 1. Overdue activities
        act_query = select(Activity).where(
            and_(
                Activity.completed == False,
                Activity.due_date < today_str,
            )
        ).order_by(Activity.due_date.asc()).limit(5)
        overdue_acts = db.execute(act_query).scalars().all()
        for act in overdue_acts:
            items.append(
                NotificationItem(
                    id=f"notif-act-{act.id}",
                    type="task",
                    title=f"Overdue Task: {act.title}",
                    description=f"Assigned to {act.staff_name}. Was due on {act.due_date}.",
                    timestamp=act.due_date,
                    read=False,
                    urgency="high",
                    link="/leads",
                )
            )

        # 2. Overdue invoices
        inv_query = select(Invoice).where(
            and_(
                Invoice.status.in_(["Open", "Partially Paid", "Overdue"]),
                Invoice.due_date < today_str,
            )
        ).order_by(Invoice.due_date.asc()).limit(5)
        if location and location != "All Locations":
            inv_query = inv_query.where(Invoice.location_name == location)
        overdue_invs = db.execute(inv_query).scalars().all()
        for inv in overdue_invs:
            outstanding_cents = inv.total_amount_cents - inv.paid_amount_cents
            items.append(
                NotificationItem(
                    id=f"notif-inv-{inv.id}",
                    type="invoice",
                    title=f"Invoice #{inv.invoice_number} is Overdue",
                    description=f"{inv.member_name} has outstanding ₹{outstanding_cents / 100:,.2f} since {inv.due_date}.",
                    timestamp=inv.due_date,
                    read=False,
                    urgency="high",
                    link="/billing",
                )
            )

        # 3. Upcoming tours today
        tomorrow_str = (datetime.now(timezone.utc) + timedelta(days=1)).strftime("%Y-%m-%d")
        tours_query = select(Booking).where(
            and_(
                Booking.booking_type == "Prospect Tour",
                Booking.status == "Confirmed",
                Booking.date.in_([today_str, tomorrow_str]),
            )
        ).order_by(Booking.date.asc(), Booking.start_time.asc()).limit(5)
        if location and location != "All Locations":
            tours_query = tours_query.where(Booking.location_name == location)
        upcoming_tours = db.execute(tours_query).scalars().all()
        for tour in upcoming_tours:
            items.append(
                NotificationItem(
                    id=f"notif-tour-{tour.id}",
                    type="tour",
                    title=f"Tour Today/Tomorrow: {tour.booked_by_name}",
                    description=f"Scheduled at {tour.space_name} ({tour.start_time} - {tour.end_time}) on {tour.date}.",
                    timestamp=f"{tour.date} {tour.start_time}",
                    read=False,
                    urgency="medium",
                    link="/bookings",
                )
            )

        unread_count = len(items)
        return NotificationsSummaryResponse(items=items, unread_count=unread_count)
