from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.invoice import (
    InvoiceCreate,
    InvoiceResponse,
    PaymentRecordCreate,
    InvoiceReminderResponse,
)
from app.services.billing_service import BillingService
from app.core.dependencies import get_current_user_optional
from app.models.organization import StaffMember

router = APIRouter(prefix="/invoices", tags=["Invoices & Billing"])


@router.get("", response_model=List[InvoiceResponse])
def get_invoices(
    location: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: Optional[StaffMember] = Depends(get_current_user_optional),
):
    return BillingService.get_invoices(db, location=location, status_filter=status, search=search)


@router.post("", response_model=InvoiceResponse, status_code=status.HTTP_201_CREATED)
def create_invoice(
    invoice_in: InvoiceCreate,
    db: Session = Depends(get_db),
    current_user: Optional[StaffMember] = Depends(get_current_user_optional),
):
    return BillingService.create_invoice(db, invoice_in)


@router.get("/{invoice_id}", response_model=InvoiceResponse)
def get_invoice(
    invoice_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[StaffMember] = Depends(get_current_user_optional),
):
    invoice = BillingService.get_invoice_by_id(db, invoice_id)
    if not invoice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")
    return invoice


@router.post("/{invoice_id}/payments", response_model=InvoiceResponse)
def record_payment(
    invoice_id: str,
    payment_in: PaymentRecordCreate,
    db: Session = Depends(get_db),
    current_user: Optional[StaffMember] = Depends(get_current_user_optional),
):
    return BillingService.record_payment(db, invoice_id, payment_in)


@router.post("/{invoice_id}/void", response_model=InvoiceResponse)
def void_invoice(
    invoice_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[StaffMember] = Depends(get_current_user_optional),
):
    return BillingService.void_invoice(db, invoice_id)


@router.post("/{invoice_id}/send-reminder", response_model=InvoiceReminderResponse)
def send_invoice_reminder(
    invoice_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[StaffMember] = Depends(get_current_user_optional),
):
    return BillingService.send_reminder(db, invoice_id)
