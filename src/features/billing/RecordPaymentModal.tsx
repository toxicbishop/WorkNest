"use client";

import React, { useState } from "react";
import { X, CreditCard, Check, AlertCircle } from "lucide-react";
import { Invoice, PaymentMethod } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onRecordPayment: (
    invoiceId: string,
    amountCents: number,
    paymentMethod: PaymentMethod,
    transactionRef: string,
    notes?: string
  ) => void;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  "UPI / NetBanking",
  "Credit Card",
  "Debit Card",
  "Bank Transfer",
  "Cash",
  "Cheque",
];

function RecordPaymentInner({
  onClose,
  invoice,
  onRecordPayment,
}: {
  onClose: () => void;
  invoice: Invoice;
  onRecordPayment: (
    invoiceId: string,
    amountCents: number,
    paymentMethod: PaymentMethod,
    transactionRef: string,
    notes?: string
  ) => void;
}) {
  const balanceRemainingCents = invoice.totalAmountCents - invoice.paidAmountCents;
  const [amountRupees, setAmountRupees] = useState<number>(balanceRemainingCents / 100);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("UPI / NetBanking");
  const [transactionRef, setTransactionRef] = useState(`TXN-${invoice.invoiceNumber.replace("INV-", "")}`);
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amountRupees <= 0) {
      setFormError("Payment amount must be greater than zero.");
      return;
    }

    const amountCents = Math.round(amountRupees * 100);
    if (amountCents > balanceRemainingCents) {
      setFormError("Payment amount cannot exceed the remaining balance due.");
      return;
    }

    if (!transactionRef.trim()) {
      setFormError("Transaction or receipt reference is required for audit trail.");
      return;
    }

    onRecordPayment(
      invoice.id,
      amountCents,
      paymentMethod,
      transactionRef.trim(),
      notes.trim() || undefined
    );
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="record-payment-title"
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-neutral-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h2 id="record-payment-title" className="text-base font-semibold text-[#1E2922]">
                Record Payment
              </h2>
              <p className="text-xs text-neutral-500">
                {invoice.invoiceNumber} · {invoice.memberName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 p-1 rounded-lg hover:bg-neutral-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Balance Summary Box */}
          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 flex items-center justify-between">
            <div>
              <div className="text-neutral-500 text-[11px]">Total Invoice</div>
              <div className="font-semibold text-neutral-800">
                {formatCurrency(invoice.totalAmountCents, "INR")}
              </div>
            </div>
            <div className="text-right">
              <div className="text-neutral-500 text-[11px]">Balance Due</div>
              <div className="font-bold text-amber-700 text-sm">
                {formatCurrency(balanceRemainingCents, "INR")}
              </div>
            </div>
          </div>

          {/* Amount Paid */}
          <div>
            <label className="block font-medium text-neutral-700 mb-1">
              Payment Amount (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              step="any"
              required
              value={amountRupees}
              onChange={(e) => {
                setAmountRupees(parseFloat(e.target.value) || 0);
                setFormError("");
              }}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#20382F]/20 focus:border-[#20382F]"
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block font-medium text-neutral-700 mb-1">
              Payment Method <span className="text-red-500">*</span>
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#20382F]/20 focus:border-[#20382F] bg-white"
            >
              {PAYMENT_METHODS.map((pm) => (
                <option key={pm} value={pm}>
                  {pm}
                </option>
              ))}
            </select>
          </div>

          {/* Transaction Ref */}
          <div>
            <label className="block font-medium text-neutral-700 mb-1">
              Transaction / UTR Reference <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. UPI-984021948 or NEFT-88392"
              value={transactionRef}
              onChange={(e) => {
                setTransactionRef(e.target.value);
                setFormError("");
              }}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#20382F]/20 focus:border-[#20382F]"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block font-medium text-neutral-700 mb-1">
              Audit Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Scanned QR code at front desk, bank statement verified..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#20382F]/20 focus:border-[#20382F]"
            />
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-neutral-200 rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition-colors font-medium flex items-center gap-1.5 shadow-sm"
            >
              <Check className="w-4 h-4" />
              Confirm Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function RecordPaymentModal({
  isOpen,
  onClose,
  invoice,
  onRecordPayment,
}: RecordPaymentModalProps) {
  if (!isOpen || !invoice) return null;

  return (
    <RecordPaymentInner
      key={invoice.id}
      onClose={onClose}
      invoice={invoice}
      onRecordPayment={onRecordPayment}
    />
  );
}
