"use client";

import React, { useState } from "react";
import {
  X,
  Receipt,
  Printer,
  CreditCard,
  Send,
  Ban,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Invoice, InvoiceStatus } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface InvoiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onOpenRecordPayment: (invoice: Invoice) => void;
  onSendReminder: (invoiceId: string) => void;
  onUpdateStatus: (invoiceId: string, status: InvoiceStatus) => void;
}

export function InvoiceDetailModal({
  isOpen,
  onClose,
  invoice,
  onOpenRecordPayment,
  onSendReminder,
  onUpdateStatus,
}: InvoiceDetailModalProps) {
  const [reminderSent, setReminderSent] = useState(false);

  if (!isOpen || !invoice) return null;

  const balanceDueCents = Math.max(0, invoice.totalAmountCents - invoice.paidAmountCents);

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case "Paid":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Open":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Partially Paid":
        return "bg-sky-50 text-sky-700 border-sky-200";
      case "Overdue":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Void":
        return "bg-neutral-100 text-neutral-500 border-neutral-200 line-through";
      case "Draft":
        return "bg-neutral-50 text-neutral-600 border-neutral-200";
      case "Refunded":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-neutral-100 text-neutral-700 border-neutral-200";
    }
  };

  const handleSendReminderClick = () => {
    onSendReminder(invoice.id);
    setReminderSent(true);
    setTimeout(() => setReminderSent(false), 3000);
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="invoice-detail-title"
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[92vh]" data-ui="overlay">
        {/* Top Control Bar (Non-Printable) */}
        <div className="px-6 py-3 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/70 print:hidden" data-ui="ui-frame">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${getStatusBadge(
                invoice.status
              )}`}
            >
              {invoice.status}
            </span>
            <span className="text-xs text-neutral-500">
              Issued: {invoice.issueDate}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors flex items-center gap-1 text-xs"
              title="Print Invoice"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            {balanceDueCents > 0 && invoice.status !== "Void" && (
              <button
                onClick={() => onOpenRecordPayment(invoice)}
                className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md text-xs font-medium flex items-center gap-1  transition-colors"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Record Payment</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-600 p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div className="overflow-y-auto p-8 space-y-6 text-xs text-neutral-800">
          {reminderSent && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Payment reminder notice dispatched to {invoice.memberEmail}.</span>
            </div>
          )}

          {/* Invoice Header */}
          <div className="flex items-start justify-between border-b border-neutral-200 pb-6" data-ui="ui-frame">
            <div>
              <div className="flex items-center gap-2 text-[#20382F] font-bold text-lg mb-1">
                <Receipt className="w-5 h-5" />
                <span>WorkNest Coworking</span>
              </div>
              <p className="text-neutral-500 text-[11px] leading-relaxed">
                WorkNest Workspace Technologies India Pvt. Ltd.
                <br />
                {invoice.locationName} · GSTIN: 29AABCU9603R1ZM
                <br />
                support@worknest.co · +91 80 4123 4567
              </p>
            </div>

            <div className="text-right">
              <h1 id="invoice-detail-title" className="text-xl font-bold tracking-tight text-neutral-900">
                TAX INVOICE
              </h1>
              <div className="text-sm font-semibold text-[#20382F] mt-1">
                {invoice.invoiceNumber}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">
                Date: <span className="font-medium text-neutral-700">{invoice.issueDate}</span>
                <br />
                Due:{" "}
                <span
                  className={`font-semibold ${
                    invoice.status === "Overdue" ? "text-amber-700" : "text-neutral-700"
                  }`}
                >
                  {invoice.dueDate}
                </span>
              </div>
            </div>
          </div>

          {/* Billed To / Hub Info */}
          <div className="grid grid-cols-2 gap-6 bg-neutral-50 p-4 rounded-lg border border-neutral-200/80">
            <div>
              <div className="text-[10px] font-semibold text-neutral-400 font-semibold mb-1">
                Billed To
              </div>
              <div className="font-bold text-neutral-900 text-sm">{invoice.memberName}</div>
              {invoice.companyName && (
                <div className="text-xs text-neutral-700 font-medium">{invoice.companyName}</div>
              )}
              <div className="text-[11px] text-neutral-500 mt-0.5">{invoice.memberEmail}</div>
            </div>

            <div>
              <div className="text-[10px] font-semibold text-neutral-400 font-semibold mb-1">
                Servicing Hub
              </div>
              <div className="font-semibold text-neutral-900">{invoice.locationName}</div>
              <div className="text-[11px] text-neutral-500 mt-0.5">
                Currency: <span className="font-medium text-neutral-800">INR (₹)</span>
              </div>
              <div className="text-[11px] text-neutral-500 mt-0.5">
                Payment Status:{" "}
                <span className="font-semibold text-neutral-800">{invoice.status}</span>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-neutral-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-neutral-100/70 border-b border-neutral-200 text-neutral-600 font-semibold" data-ui="ui-frame">
                  <th className="py-2.5 px-4">Item & Description</th>
                  <th className="py-2.5 px-3 text-center w-16">Qty</th>
                  <th className="py-2.5 px-4 text-right w-28">Rate</th>
                  <th className="py-2.5 px-4 text-right w-32">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100" data-ui="ui-list">
                {invoice.lineItems.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td className="py-3 px-4">
                      <div className="font-medium text-neutral-900">{item.description}</div>
                    </td>
                    <td className="py-3 px-3 text-center text-neutral-600 font-medium">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-4 text-right text-neutral-600">
                      {formatCurrency(item.unitPriceCents, "INR")}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-neutral-900">
                      {formatCurrency(item.amountCents, "INR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown */}
          <div className="flex justify-end">
            <div className="w-72 space-y-2 bg-neutral-50 p-4 rounded-lg border border-neutral-200 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal:</span>
                <span className="font-medium text-neutral-900">
                  {formatCurrency(invoice.subtotalCents, "INR")}
                </span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>GST ({invoice.taxRatePercent}%):</span>
                <span className="font-medium text-neutral-900">
                  {formatCurrency(invoice.taxAmountCents, "INR")}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-neutral-900 pt-2 border-t border-neutral-200" data-ui="ui-frame">
                <span>Total Amount:</span>
                <span className="text-[#20382F]">
                  {formatCurrency(invoice.totalAmountCents, "INR")}
                </span>
              </div>
              <div className="flex justify-between text-neutral-600 pt-1">
                <span>Paid to Date:</span>
                <span className="font-semibold text-emerald-700">
                  {formatCurrency(invoice.paidAmountCents, "INR")}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-2 border-t border-neutral-200 text-amber-800" data-ui="ui-frame">
                <span>Balance Due:</span>
                <span>{formatCurrency(balanceDueCents, "INR")}</span>
              </div>
            </div>
          </div>

          {/* Payment History Timeline */}
          {invoice.paymentRecords && invoice.paymentRecords.length > 0 && (
            <div className="space-y-2 border-t border-neutral-200 pt-4" data-ui="ui-frame">
              <div className="text-xs font-semibold text-neutral-800 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-neutral-500" />
                Payment & Reconciliation History
              </div>
              <div className="bg-neutral-50 rounded-lg border border-neutral-200 divide-y divide-neutral-100" data-ui="ui-list">
                {invoice.paymentRecords.map((pay) => (
                  <div
                    key={pay.id}
                    className="p-3 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-neutral-900 flex items-center gap-2">
                        <span>{pay.paymentMethod}</span>
                        <span className="text-[10px] text-neutral-500 tabular-nums bg-white px-1.5 py-0.5 rounded border border-neutral-200">
                          {pay.transactionRef}
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-500 mt-0.5">
                        Recorded on: {new Date(pay.paidAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {pay.notes && ` · ${pay.notes}`}
                      </div>
                    </div>
                    <div className="text-sm font-bold text-emerald-700">
                      +{formatCurrency(pay.amountCents, "INR")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Terms & Notes */}
          {invoice.notes && (
            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-neutral-600 text-[11px] space-y-1">
              <div className="font-semibold text-neutral-700">Terms & Instructions:</div>
              <p>{invoice.notes}</p>
            </div>
          )}
        </div>

        {/* Footer Actions (Non-Printable) */}
        <div className="px-6 py-3 border-t border-neutral-100 bg-neutral-50 flex items-center justify-between text-xs print:hidden" data-ui="ui-frame">
          <div className="flex items-center gap-2">
            {invoice.status !== "Void" && (
              <button
                onClick={() => onUpdateStatus(invoice.id, "Void")}
                className="text-neutral-500 hover:text-red-700 font-medium flex items-center gap-1 transition-colors"
              >
                <Ban className="w-3.5 h-3.5" />
                Void Invoice
              </button>
            )}

            {balanceDueCents > 0 && invoice.status !== "Void" && (
              <button
                onClick={handleSendReminderClick}
                className="text-neutral-600 hover:text-[#20382F] font-medium flex items-center gap-1 transition-colors ml-3"
              >
                <Send className="w-3.5 h-3.5" />
                Send Overdue Reminder
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded-lg transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
