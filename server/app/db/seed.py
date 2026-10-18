"""Initial database seeder with realistic co-working fixtures."""
from sqlalchemy.orm import Session
from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.core.security import get_password_hash
from app.models.organization import Organization, Location, StaffMember
from app.models.lead import Lead, LeadAuditLog, Activity
from app.models.member import Member, MembershipPlan, Membership
from app.models.space import Space, Booking
from app.models.invoice import Invoice, InvoiceLineItem, PaymentRecord


def seed_database(db: Session):
    # Ensure tables
    Base.metadata.create_all(bind=engine)

    # 1. Organization
    if not db.get(Organization, "org-default"):
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

    # 2. Locations
    locations_data = [
        {
            "id": "loc-downtown",
            "name": "Downtown Hub",
            "address": "100 MG Road, 4th Floor",
            "city": "Bengaluru",
            "state": "Karnataka",
            "zip": "560001",
            "timezone": "Asia/Kolkata",
            "operating_hours": "24/7 Access for Members",
            "total_capacity": 180,
            "current_occupancy_rate": 84,
            "phone": "+91 80 4123 4567",
            "manager_name": "Marcus Vance",
            "status": "Active",
        },
        {
            "id": "loc-westside",
            "name": "Westside Commons",
            "address": "45 Indiranagar 100ft Road",
            "city": "Bengaluru",
            "state": "Karnataka",
            "zip": "560038",
            "timezone": "Asia/Kolkata",
            "operating_hours": "Mon-Sat: 07:00 - 23:00",
            "total_capacity": 120,
            "current_occupancy_rate": 72,
            "phone": "+91 80 4987 6543",
            "manager_name": "Sarah Jenkins",
            "status": "Active",
        },
        {
            "id": "loc-tech",
            "name": "Tech District",
            "address": "Outer Ring Road, Bellandur",
            "city": "Bengaluru",
            "state": "Karnataka",
            "zip": "560103",
            "timezone": "Asia/Kolkata",
            "operating_hours": "24/7 Access for Members",
            "total_capacity": 300,
            "current_occupancy_rate": 91,
            "phone": "+91 80 4555 0199",
            "manager_name": "Priya Nair",
            "status": "Active",
        },
    ]
    for loc in locations_data:
        if not db.get(Location, loc["id"]):
            db.add(Location(org_id="org-default", **loc))

    # 3. Membership Plans
    plans_data = [
        {
            "id": "plan-hotdesk",
            "name": "Hot Desk",
            "code": "Hot Desk",
            "monthly_rate_cents": 850000,  # ₹8,500/mo
            "currency": "INR",
            "meeting_room_credits_hours": 2,
            "printing_credits_pages": 50,
            "included_locations": ["All"],
            "description": "Flexible open desk access in community zones across any WorkNest location.",
            "is_active": True,
        },
        {
            "id": "plan-dedicated",
            "name": "Dedicated Desk",
            "code": "Dedicated Desk",
            "monthly_rate_cents": 1400000,  # ₹14,000/mo
            "currency": "INR",
            "meeting_room_credits_hours": 5,
            "printing_credits_pages": 150,
            "included_locations": ["All"],
            "description": "Your own permanent desk, ergonomic chair, locking pedestal, and 24/7 building access.",
            "is_active": True,
        },
        {
            "id": "plan-private",
            "name": "Private Office",
            "code": "Private Office",
            "monthly_rate_cents": 3500000,  # ₹35,000/mo
            "currency": "INR",
            "meeting_room_credits_hours": 12,
            "printing_credits_pages": 500,
            "included_locations": ["All"],
            "description": "Lockable, fully furnished private office suite for teams of 2 to 20.",
            "is_active": True,
        },
        {
            "id": "plan-virtual",
            "name": "Virtual Office",
            "code": "Virtual Office",
            "monthly_rate_cents": 300000,  # ₹3,000/mo
            "currency": "INR",
            "meeting_room_credits_hours": 1,
            "printing_credits_pages": 0,
            "included_locations": ["All"],
            "description": "Prestigious commercial business address, GST registration support, and mail handling.",
            "is_active": True,
        },
        {
            "id": "plan-enterprise",
            "name": "Enterprise Suite",
            "code": "Enterprise Suite",
            "monthly_rate_cents": 12000000,  # ₹1,20,000/mo
            "currency": "INR",
            "meeting_room_credits_hours": 30,
            "printing_credits_pages": 2000,
            "included_locations": ["All"],
            "description": "Customizable floor wing with dedicated meeting rooms, executive cabins, and branding.",
            "is_active": True,
        },
    ]
    for plan in plans_data:
        if not db.get(MembershipPlan, plan["id"]):
            db.add(MembershipPlan(org_id="org-default", **plan))

    # 4. Staff Members
    staff_pwd = get_password_hash("WorkNest123!")
    staff_data = [
        {
            "id": "staff-01",
            "name": "Marcus Vance",
            "email": "marcus@worknest.space",
            "role": "Workspace Owner",
            "assigned_locations": ["Downtown Hub", "Tech District"],
            "status": "Active",
            "hashed_password": staff_pwd,
        },
        {
            "id": "staff-02",
            "name": "Sarah Jenkins",
            "email": "sarah@worknest.space",
            "role": "Community Manager",
            "assigned_locations": ["Westside Commons"],
            "status": "Active",
            "hashed_password": staff_pwd,
        },
        {
            "id": "staff-03",
            "name": "Priya Nair",
            "email": "priya@worknest.space",
            "role": "Sales Lead",
            "assigned_locations": ["Downtown Hub", "Westside Commons", "Tech District"],
            "status": "Active",
            "hashed_password": staff_pwd,
        },
        {
            "id": "staff-04",
            "name": "Devon Miller",
            "email": "devon@worknest.space",
            "role": "Front Desk",
            "assigned_locations": ["Downtown Hub"],
            "status": "Active",
            "hashed_password": staff_pwd,
        },
    ]
    for s in staff_data:
        if not db.get(StaffMember, s["id"]):
            db.add(StaffMember(org_id="org-default", **s))

    # 5. Members & Memberships
    members_data = [
        {
            "id": "mem-201",
            "lead_id": "lead-104",
            "name": "Maya Patel",
            "email": "maya.patel@nexuslegal.com",
            "phone": "+91 98456 78901",
            "company": "Nexus Legal Partners",
            "title": "Managing Partner",
            "home_location": "Downtown Hub",
            "status": "Active",
            "joined_date": "2026-10-03",
            "current_membership_id": "mship-301",
            "notes": "Converted from website lead. 4-person cabin on 4th floor.",
        },
        {
            "id": "mem-202",
            "name": "Rahul Deshmukh",
            "email": "rahul@apexcloud.io",
            "phone": "+91 98111 22334",
            "company": "Apex Cloud Systems",
            "title": "CTO",
            "home_location": "Tech District",
            "status": "Active",
            "joined_date": "2026-08-15",
            "current_membership_id": "mship-302",
            "notes": "Dedicated desk bay A3. Enterprise client.",
        },
    ]
    for m in members_data:
        if not db.get(Member, m["id"]):
            db.add(Member(**m))

    memberships_data = [
        {
            "id": "mship-301",
            "member_id": "mem-201",
            "plan_id": "plan-private",
            "plan_name": "Private Office",
            "plan_code": "Private Office",
            "monthly_rate_cents": 3500000,
            "currency": "INR",
            "billing_interval": "Monthly",
            "status": "Active",
            "start_date": "2026-10-03",
            "renewal_date": "2026-11-03",
            "desk_or_office_number": "Office 402",
            "assigned_location": "Downtown Hub",
            "auto_renew": True,
        },
        {
            "id": "mship-302",
            "member_id": "mem-202",
            "plan_id": "plan-dedicated",
            "plan_name": "Dedicated Desk",
            "plan_code": "Dedicated Desk",
            "monthly_rate_cents": 1400000,
            "currency": "INR",
            "billing_interval": "Quarterly",
            "status": "Active",
            "start_date": "2026-08-15",
            "renewal_date": "2026-11-15",
            "desk_or_office_number": "Desk Bay A3",
            "assigned_location": "Tech District",
            "auto_renew": True,
        },
    ]
    for ms in memberships_data:
        if not db.get(Membership, ms["id"]):
            db.add(Membership(**ms))

    # 6. Leads
    leads_data = [
        {
            "id": "lead-101",
            "name": "Elena Rostova",
            "email": "elena@lumina-ai.dev",
            "phone": "+91 98201 23456",
            "company": "Lumina Intelligence",
            "interested_plan": "Private Office",
            "preferred_location": "Downtown Hub",
            "team_size": 8,
            "source": "Website Form",
            "status": "Tour Booked",
            "assigned_to": "Marcus Vance",
            "next_follow_up_date": "2026-10-20",
            "notes": "Requires private fiber line and 8 desks.",
        },
        {
            "id": "lead-102",
            "name": "Jordan Hayes",
            "email": "jordan@hayescreative.co",
            "phone": "+91 97112 34567",
            "company": "Hayes Creative Studio",
            "interested_plan": "Dedicated Desk",
            "preferred_location": "Westside Commons",
            "team_size": 2,
            "source": "Referral",
            "status": "Contacted",
            "assigned_to": "Sarah Jenkins",
            "next_follow_up_date": "2026-10-19",
            "notes": "Spoke via phone. Interested in 24/7 access and podcast booth.",
        },
        {
            "id": "lead-103",
            "name": "Dr. Aris Thorne",
            "email": "aris@synthbio.io",
            "phone": "+91 99345 67890",
            "company": "SynthBio Labs",
            "interested_plan": "Enterprise Suite",
            "preferred_location": "Tech District",
            "team_size": 18,
            "source": "Partner",
            "status": "New",
            "assigned_to": "Marcus Vance",
            "next_follow_up_date": "2026-10-18",
            "notes": "Inquiry received for custom multi-room suite.",
        },
        {
            "id": "lead-104",
            "name": "Maya Patel",
            "email": "maya.patel@nexuslegal.com",
            "phone": "+91 98456 78901",
            "company": "Nexus Legal Partners",
            "interested_plan": "Private Office",
            "preferred_location": "Downtown Hub",
            "team_size": 4,
            "source": "Walk-in",
            "status": "Converted",
            "assigned_to": "Sarah Jenkins",
            "converted_member_id": "mem-201",
        },
        {
            "id": "lead-105",
            "name": "Karthik Verma",
            "email": "karthik@zenithlogistics.in",
            "phone": "+91 98765 43210",
            "company": "Zenith Logistics",
            "interested_plan": "Hot Desk",
            "preferred_location": "Westside Commons",
            "team_size": 1,
            "source": "Social Media",
            "status": "Lost",
            "assigned_to": "Priya Nair",
            "lost_reason": "Signed closer to their residential area; budget was below threshold.",
        },
    ]
    for l in leads_data:
        if not db.get(Lead, l["id"]):
            db.add(Lead(org_id="org-default", **l))

    # 7. Activities
    activities_data = [
        {
            "id": "act-501",
            "lead_id": "lead-101",
            "lead_name": "Elena Rostova",
            "type": "tour",
            "title": "Facility Tour - Private Suite 402",
            "description": "Show Elena the 8-person corner suite and executive boardroom.",
            "due_date": "2026-10-20",
            "completed": False,
            "staff_name": "Marcus Vance",
        },
        {
            "id": "act-502",
            "lead_id": "lead-102",
            "lead_name": "Jordan Hayes",
            "type": "call",
            "title": "Send Dedicated Desk Pricing Proposal",
            "description": "Share brochure and pricing for 2 desks in Westside Commons.",
            "due_date": "2026-10-15",  # Overdue activity!
            "completed": False,
            "staff_name": "Sarah Jenkins",
        },
        {
            "id": "act-503",
            "lead_id": "lead-103",
            "lead_name": "Dr. Aris Thorne",
            "type": "email",
            "title": "Discovery Questionnaire Dispatch",
            "description": "Inquire regarding electrical load and server requirements.",
            "due_date": "2026-10-18",
            "completed": True,
            "outcome": "Questionnaire sent to CTO.",
            "staff_name": "Marcus Vance",
        },
    ]
    for act in activities_data:
        if not db.get(Activity, act["id"]):
            db.add(Activity(**act))

    # 8. Spaces
    spaces_data = [
        {
            "id": "space-401",
            "location_id": "loc-downtown",
            "location_name": "Downtown Hub",
            "name": "Oak Boardroom",
            "type": "Meeting Room",
            "capacity": 12,
            "hourly_rate_cents": 120000,  # ₹1,200/hr
            "amenities": ["4K Screen", "Polycom AV", "Whiteboard", "High-speed Fiber"],
            "floor_or_zone": "Floor 4 - Executive Wing",
            "is_active": True,
        },
        {
            "id": "space-402",
            "location_id": "loc-downtown",
            "location_name": "Downtown Hub",
            "name": "Cedar Huddle",
            "type": "Meeting Room",
            "capacity": 4,
            "hourly_rate_cents": 50000,  # ₹500/hr
            "amenities": ["55-inch Display", "Acoustic Insulation"],
            "floor_or_zone": "Floor 4 - Creative Zone",
            "is_active": True,
        },
        {
            "id": "space-403",
            "location_id": "loc-westside",
            "location_name": "Westside Commons",
            "name": "Echo Podcast Studio",
            "type": "Podcast Studio",
            "capacity": 4,
            "hourly_rate_cents": 150000,  # ₹1,500/hr
            "amenities": ["Shure SM7B Mics", "Rodecaster Pro", "Acoustic Foam", "Video Ring Lights"],
            "floor_or_zone": "Floor 2 - Media Hub",
            "is_active": True,
        },
        {
            "id": "space-404",
            "location_id": "loc-tech",
            "location_name": "Tech District",
            "name": "Horizon Auditorium",
            "type": "Conference Hall",
            "capacity": 75,
            "hourly_rate_cents": 600000,  # ₹6,000/hr
            "amenities": ["Dual 4K Projectors", "Surround PA", "Wireless Lavalier Mics", "Livestream Deck"],
            "floor_or_zone": "Ground Floor",
            "is_active": True,
        },
    ]
    for sp in spaces_data:
        if not db.get(Space, sp["id"]):
            db.add(Space(**sp))

    # 9. Bookings
    bookings_data = [
        {
            "id": "book-601",
            "space_id": "space-401",
            "space_name": "Oak Boardroom",
            "location_name": "Downtown Hub",
            "title": "Quarterly Strategy Review",
            "booking_type": "Meeting Room",
            "booked_by_name": "Maya Patel",
            "booked_by_email": "maya.patel@nexuslegal.com",
            "member_id": "mem-201",
            "date": "2026-10-20",
            "start_time": "14:00",
            "end_time": "16:00",
            "attendees_count": 8,
            "status": "Confirmed",
            "total_cost_cents": 240000,
            "credits_used_hours": 2,
        },
        {
            "id": "book-602",
            "space_id": "space-401",
            "space_name": "Oak Boardroom",
            "location_name": "Downtown Hub",
            "title": "Prospective Team Tour - Elena Rostova",
            "booking_type": "Prospect Tour",
            "booked_by_name": "Elena Rostova",
            "booked_by_email": "elena@lumina-ai.dev",
            "lead_id": "lead-101",
            "date": "2026-10-20",
            "start_time": "10:00",
            "end_time": "11:00",
            "attendees_count": 2,
            "status": "Confirmed",
            "total_cost_cents": 0,
            "credits_used_hours": 0,
        },
    ]
    for b in bookings_data:
        if not db.get(Booking, b["id"]):
            db.add(Booking(**b))

    # 10. Invoices & Payments
    if not db.get(Invoice, "inv-701"):
        inv1 = Invoice(
            id="inv-701",
            invoice_number="INV-2026-0042",
            member_id="mem-201",
            member_name="Maya Patel",
            member_email="maya.patel@nexuslegal.com",
            company_name="Nexus Legal Partners",
            location_name="Downtown Hub",
            membership_id="mship-301",
            issue_date="2026-10-03",
            due_date="2026-10-10",
            status="Paid",
            currency="INR",
            subtotal_cents=3500000,
            tax_rate_percent=18,
            tax_amount_cents=630000,
            total_amount_cents=4130000,
            paid_amount_cents=4130000,
        )
        db.add(inv1)
        db.flush()

        db.add(InvoiceLineItem(
            id="item-701-1",
            invoice_id=inv1.id,
            description="Private Office Monthly Retainer (Suite 402 - Oct 2026)",
            quantity=1,
            unit_price_cents=3500000,
            amount_cents=3500000,
        ))
        db.add(PaymentRecord(
            id="pay-701-1",
            invoice_id=inv1.id,
            amount_cents=4130000,
            payment_method="UPI / NetBanking",
            transaction_ref="UPI-HDFC-9988221100",
            paid_at="2026-10-04",
            notes="Paid via razorpay online payment gateway",
        ))

    if not db.get(Invoice, "inv-702"):
        inv2 = Invoice(
            id="inv-702",
            invoice_number="INV-2026-0043",
            member_id="mem-202",
            member_name="Rahul Deshmukh",
            member_email="rahul@apexcloud.io",
            company_name="Apex Cloud Systems",
            location_name="Tech District",
            membership_id="mship-302",
            issue_date="2026-10-01",
            due_date="2026-10-15",  # Overdue invoice!
            status="Overdue",
            currency="INR",
            subtotal_cents=1400000,
            tax_rate_percent=18,
            tax_amount_cents=252000,
            total_amount_cents=1652000,
            paid_amount_cents=0,
            notes="Quarterly dedicated desk seat subscription.",
        )
        db.add(inv2)
        db.flush()

        db.add(InvoiceLineItem(
            id="item-702-1",
            invoice_id=inv2.id,
            description="Dedicated Desk Bay A3 (Quarterly Subscription)",
            quantity=1,
            unit_price_cents=1400000,
            amount_cents=1400000,
        ))

    db.commit()


if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_database(db)
        print("Database successfully seeded with realistic WorkNest CRM fixtures!")
    finally:
        db.close()
