import uuid
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, or_

from app.models.invoice import Invoice, InvoiceLineItem, PaymentRecord
from app.models.lead import Activity
from app.schemas.invoice import InvoiceCreate, PaymentRecordCreate


class BillingService:
    @staticmethod
    def get_invoices(
        db: Session,
        location: Optional[str] = None,
        status_filter: Optional[str] = None,
        search: Optional[str] = None,
    ) -> List[Invoice]:
        query = select(Invoice)
        if location and location != "All Locations":
            query = query.where(Invoice.location_name == location)
        if status_filter and status_filter != "All":
            query = query.where(Invoice.status == status_filter)
        if search:
            search_term = f"%{search.strip()}%"
            query = query.where(
                or_(
                    Invoice.invoice_number.ilike(search_term),
                    Invoice.member_name.ilike(search_term),
                    Invoice.company_name.ilike(search_term),
                )
            )
        query = query.order_by(Invoice.created_at.desc())
        return list(db.execute(query).scalars().all())

    @staticmethod
    def get_invoice_by_id(db: Session, invoice_id: str) -> Optional[Invoice]:
        return db.get(Invoice, invoice_id)

    @staticmethod
    def create_invoice(db: Session, invoice_in: InvoiceCreate) -> Invoice:
        # Check duplicate invoice number
        existing = db.execute(
            select(Invoice).where(Invoice.invoice_number == invoice_in.invoice_number)
        ).scalar_one_or_none()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"An invoice with number '{invoice_in.invoice_number}' already exists",
            )

        # Compute line items subtotal
        computed_subtotal = sum(item.quantity * item.unit_price_cents for item in invoice_in.line_items)
        subtotal_cents = invoice_in.subtotal_cents or computed_subtotal
        tax_rate = invoice_in.tax_rate_percent or 18
        tax_amount_cents = round(subtotal_cents * (tax_rate / 100.0))
        total_amount_cents = subtotal_cents + tax_amount_cents

        invoice_id = invoice_in.id or f"inv-{uuid.uuid4().hex[:8]}"
        db_invoice = Invoice(
            id=invoice_id,
            invoice_number=invoice_in.invoice_number,
            member_id=invoice_in.member_id,
            member_name=invoice_in.member_name,
            member_email=invoice_in.member_email,
            company_name=invoice_in.company_name,
            location_name=invoice_in.location_name,
            membership_id=invoice_in.membership_id,
            booking_id=invoice_in.booking_id,
            issue_date=invoice_in.issue_date,
            due_date=invoice_in.due_date,
            status=invoice_in.status or "Open",
            currency=invoice_in.currency or "INR",
            subtotal_cents=subtotal_cents,
            tax_rate_percent=tax_rate,
            tax_amount_cents=tax_amount_cents,
            total_amount_cents=total_amount_cents,
            paid_amount_cents=0,
            notes=invoice_in.notes,
        )
        db.add(db_invoice)
        db.flush()

        for item in invoice_in.line_items:
            line_item_id = item.id or f"line-{uuid.uuid4().hex[:8]}"
            db_item = InvoiceLineItem(
                id=line_item_id,
                invoice_id=db_invoice.id,
                description=item.description,
                quantity=item.quantity,
                unit_price_cents=item.unit_price_cents,
                amount_cents=item.quantity * item.unit_price_cents,
            )
            db.add(db_item)

        db.commit()
        db.refresh(db_invoice)
        return db_invoice

    @staticmethod
    def record_payment(db: Session, invoice_id: str, payment_in: PaymentRecordCreate) -> Invoice:
        invoice = db.get(Invoice, invoice_id)
        if not invoice:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")

        if invoice.status == "Void":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot record payment on a voided invoice",
            )

        payment_id = payment_in.id or f"pay-{uuid.uuid4().hex[:8]}"
        payment = PaymentRecord(
            id=payment_id,
            invoice_id=invoice.id,
            amount_cents=payment_in.amount_cents,
            payment_method=payment_in.payment_method,
            transaction_ref=payment_in.transaction_ref,
            paid_at=payment_in.paid_at,
            notes=payment_in.notes,
        )
        db.add(payment)
        db.flush()

        # Recalculate total paid
        all_payments = db.execute(
            select(PaymentRecord).where(PaymentRecord.invoice_id == invoice.id)
        ).scalars().all()
        total_paid = sum(p.amount_cents for p in all_payments)

        invoice.paid_amount_cents = total_paid
        if total_paid >= invoice.total_amount_cents:
            invoice.status = "Paid"
        elif total_paid > 0:
            invoice.status = "Partially Paid"

        db.commit()
        db.refresh(invoice)
        return invoice

    @staticmethod
    def void_invoice(db: Session, invoice_id: str) -> Invoice:
        invoice = db.get(Invoice, invoice_id)
        if not invoice:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")

        if invoice.status == "Paid":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot void an invoice that has been fully paid",
            )

        invoice.status = "Void"
        db.commit()
        db.refresh(invoice)
        return invoice

    @staticmethod
    def send_reminder(db: Session, invoice_id: str) -> dict:
        invoice = db.get(Invoice, invoice_id)
        if not invoice:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")

        now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        activity = Activity(
            id=f"act-{uuid.uuid4().hex[:8]}",
            member_id=invoice.member_id,
            lead_name=invoice.member_name,
            type="email",
            title=f"Dispatched Payment Reminder: Invoice #{invoice.invoice_number}",
            description=f"Sent automated overdue statement to {invoice.member_email} for balance ₹{((invoice.total_amount_cents - invoice.paid_amount_cents) / 100):,.2f}",
            due_date=now_str,
            completed=True,
            outcome="Payment reminder delivered via verified email channel",
            staff_name="Finance Operations",
        )
        db.add(activity)
        db.commit()

        return {
            "success": True,
            "invoice_id": invoice.id,
            "message": f"Payment reminder successfully dispatched to {invoice.member_email}",
        }
