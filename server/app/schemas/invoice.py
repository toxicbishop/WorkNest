from typing import Optional, List
from pydantic import BaseModel, EmailStr


class InvoiceLineItemBase(BaseModel):
    description: str
    quantity: int = 1
    unit_price_cents: int
    amount_cents: int


class InvoiceLineItemCreate(InvoiceLineItemBase):
    id: Optional[str] = None


class InvoiceLineItemResponse(InvoiceLineItemBase):
    id: str

    model_config = {"from_attributes": True}


class PaymentRecordBase(BaseModel):
    amount_cents: int
    payment_method: str  # UPI / NetBanking, Credit Card, Debit Card, Bank Transfer, Cash, Cheque
    transaction_ref: str
    paid_at: str
    notes: Optional[str] = None


class PaymentRecordCreate(PaymentRecordBase):
    id: Optional[str] = None


class PaymentRecordResponse(PaymentRecordBase):
    id: str
    invoice_id: str

    model_config = {"from_attributes": True}


class InvoiceBase(BaseModel):
    invoice_number: str
    member_id: str
    member_name: str
    member_email: EmailStr
    company_name: Optional[str] = None
    location_name: str
    membership_id: Optional[str] = None
    booking_id: Optional[str] = None
    issue_date: str
    due_date: str
    status: str = "Draft"
    currency: str = "INR"
    subtotal_cents: int
    tax_rate_percent: int = 18
    tax_amount_cents: int
    total_amount_cents: int
    notes: Optional[str] = None


class InvoiceCreate(InvoiceBase):
    id: Optional[str] = None
    line_items: List[InvoiceLineItemCreate] = []


class InvoiceUpdate(BaseModel):
    status: Optional[str] = None
    due_date: Optional[str] = None
    notes: Optional[str] = None


class InvoiceReminderResponse(BaseModel):
    success: bool
    invoice_id: str
    message: str


class InvoiceResponse(InvoiceBase):
    id: str
    paid_amount_cents: int = 0
    line_items: List[InvoiceLineItemResponse] = []
    payment_records: List[PaymentRecordResponse] = []

    model_config = {"from_attributes": True}
