from typing import Optional, List
from sqlalchemy import String, Integer, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin


class Invoice(Base, TimestampMixin):
    __tablename__ = "invoices"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    invoice_number: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    member_id: Mapped[str] = mapped_column(String(64), ForeignKey("members.id"), nullable=False, index=True)
    member_name: Mapped[str] = mapped_column(String(150), nullable=False)
    member_email: Mapped[str] = mapped_column(String(255), nullable=False)
    company_name: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    location_name: Mapped[str] = mapped_column(String(150), nullable=False)
    membership_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    booking_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    issue_date: Mapped[str] = mapped_column(String(50), nullable=False)
    due_date: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="Draft", nullable=False, index=True)  # Draft, Open, Paid, Partially Paid, Overdue, Void, Refunded
    currency: Mapped[str] = mapped_column(String(10), default="INR", nullable=False)
    subtotal_cents: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    tax_rate_percent: Mapped[int] = mapped_column(Integer, default=18, nullable=False)
    tax_amount_cents: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_amount_cents: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    paid_amount_cents: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    line_items: Mapped[List["InvoiceLineItem"]] = relationship("InvoiceLineItem", back_populates="invoice", cascade="all, delete-orphan")
    payment_records: Mapped[List["PaymentRecord"]] = relationship("PaymentRecord", back_populates="invoice", cascade="all, delete-orphan")


class InvoiceLineItem(Base):
    __tablename__ = "invoice_line_items"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    invoice_id: Mapped[str] = mapped_column(String(64), ForeignKey("invoices.id", ondelete="CASCADE"), nullable=False, index=True)
    description: Mapped[str] = mapped_column(String(255), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    unit_price_cents: Mapped[int] = mapped_column(Integer, nullable=False)
    amount_cents: Mapped[int] = mapped_column(Integer, nullable=False)

    invoice: Mapped["Invoice"] = relationship("Invoice", back_populates="line_items")


class PaymentRecord(Base):
    __tablename__ = "payment_records"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    invoice_id: Mapped[str] = mapped_column(String(64), ForeignKey("invoices.id", ondelete="CASCADE"), nullable=False, index=True)
    amount_cents: Mapped[int] = mapped_column(Integer, nullable=False)
    payment_method: Mapped[str] = mapped_column(String(50), nullable=False)  # UPI / NetBanking, Credit Card, Debit Card, Bank Transfer, Cash, Cheque
    transaction_ref: Mapped[str] = mapped_column(String(100), nullable=False)
    paid_at: Mapped[str] = mapped_column(String(50), nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    invoice: Mapped["Invoice"] = relationship("Invoice", back_populates="payment_records")
