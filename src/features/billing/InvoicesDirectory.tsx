"use client";

import React, { useState, useMemo } from "react";
import {
  Receipt,
  Plus,
  Search,
  Filter,
  CreditCard,
  Send,
  Eye,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
} from "lucide-react";
import { useWorkNest } from "@/context/WorkNestContext";
import { Invoice, InvoiceStatus, PaymentMethod } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { InvoiceModal } from "./InvoiceModal";
import { RecordPaymentModal } from "./RecordPaymentModal";
import { InvoiceDetailModal } from "./InvoiceDetailModal";

export function InvoicesDirectory() {
  const {
    invoices,
    members,
    locations,
    selectedLocation,
    setSelectedLocation,
    createInvoice,
    recordPayment,
    updateInvoiceStatus,
    sendInvoiceReminder,
    deleteInvoice,
  } = useWorkNest();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [periodFilter, setPeriodFilter] = useState<"All" | "Due Soon" | "Overdue" | "Paid">("All");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedInvoiceForDetail, setSelectedInvoiceForDetail] = useState<Invoice | null>(null);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | null>(null);

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      // Location filter
      if (selectedLocation !== "All" && inv.locationName !== selectedLocation) {
        return false;
      }

      // Status filter
      if (selectedStatus !== "All" && inv.status !== selectedStatus) {
        return false;
      }

      // Period filter
      if (periodFilter === "Paid" && inv.status !== "Paid") {
        return false;
      }
      if (periodFilter === "Overdue" && inv.status !== "Overdue" && !(inv.dueDate < todayStr && inv.paidAmountCents < inv.totalAmountCents)) {
        return false;
      }
      if (periodFilter === "Due Soon") {
        const isUpcoming = inv.dueDate >= todayStr && inv.paidAmountCents < inv.totalAmountCents;
        if (!isUpcoming) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesNum = inv.invoiceNumber.toLowerCase().includes(q);
        const matchesName = inv.memberName.toLowerCase().includes(q);
        const matchesEmail = inv.memberEmail.toLowerCase().includes(q);
        const matchesCompany = inv.companyName?.toLowerCase().includes(q);
        const matchesLocation = inv.locationName.toLowerCase().includes(q);

        if (!matchesNum && !matchesName && !matchesEmail && !matchesCompany && !matchesLocation) {
          return false;
        }
      }

      return true;
    });
  }, [invoices, selectedLocation, selectedStatus, periodFilter, searchQuery, todayStr]);

  // Financial KPIs
  const totalBilledCents = useMemo(() => {
    return invoices
      .filter((inv) => inv.status !== "Void")
      .reduce((sum, inv) => sum + inv.totalAmountCents, 0);
  }, [invoices]);

  const totalCollectedCents = useMemo(() => {
    return invoices
      .filter((inv) => inv.status !== "Void")
      .reduce((sum, inv) => sum + inv.paidAmountCents, 0);
  }, [invoices]);

  const totalOutstandingCents = useMemo(() => {
    return Math.max(0, totalBilledCents - totalCollectedCents);
  }, [totalBilledCents, totalCollectedCents]);

  const overdueInvoicesCount = useMemo(() => {
    return invoices.filter(
      (inv) =>
        inv.status !== "Void" &&
        (inv.status === "Overdue" || (inv.dueDate < todayStr && inv.paidAmountCents < inv.totalAmountCents))
    ).length;
  }, [invoices, todayStr]);

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case "Paid":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Open":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Partially Paid":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "Overdue":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Void":
        return "bg-neutral-100 text-neutral-500 border-neutral-200 line-through";
      case "Draft":
        return "bg-neutral-50 text-neutral-600 border-neutral-200";
      case "Refunded":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-neutral-100 text-neutral-700 border-neutral-200";
    }
  };

  const handleOpenPayment = (inv: Invoice) => {
    setSelectedInvoiceForPayment(inv);
  };

  const handleRecordPayment = (
    invoiceId: string,
    amountCents: number,
    paymentMethod: PaymentMethod,
    transactionRef: string,
    notes?: string
  ) => {
    recordPayment(invoiceId, amountCents, paymentMethod, transactionRef, notes);
    // Refresh selected invoice if detail modal is open
    if (selectedInvoiceForDetail && selectedInvoiceForDetail.id === invoiceId) {
      const refreshed = invoices.find((x) => x.id === invoiceId);
      if (refreshed) setSelectedInvoiceForDetail(refreshed);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Financial Operations KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-neutral-200">
          <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
            <Receipt className="w-4 h-4 text-[#20382F]" />
            <span>Total Invoiced</span>
          </div>
          <div className="text-2xl font-bold text-[#1E2922]">
            {formatCurrency(totalBilledCents, "INR")}
          </div>
          <div className="text-[11px] text-neutral-500 mt-0.5">Recognized billings</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200">
          <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Collected Revenue</span>
          </div>
          <div className="text-2xl font-bold text-emerald-700">
            {formatCurrency(totalCollectedCents, "INR")}
          </div>
          <div className="text-[11px] text-neutral-500 mt-0.5">Settled via UPI / Bank</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200">
          <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Outstanding Balance</span>
          </div>
          <div className="text-2xl font-bold text-blue-700">
            {formatCurrency(totalOutstandingCents, "INR")}
          </div>
          <div className="text-[11px] text-neutral-500 mt-0.5">Pending collection</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200">
          <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Overdue Invoices</span>
          </div>
          <div className="text-2xl font-bold text-amber-700">
            {overdueInvoicesCount}
          </div>
          <div className="text-[11px] text-neutral-500 mt-0.5">Requires reminder notice</div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex flex-1 flex-col sm:flex-row gap-3 items-stretch sm:items-center flex-wrap">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search invoice #, member, company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#20382F]/20 focus:border-[#20382F]"
            />
          </div>

          {/* Location Select */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#20382F]/20 focus:border-[#20382F] bg-white text-neutral-700"
              aria-label="Filter by Hub Location"
            >
              <option value="All">All Coworking Hubs</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.name}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Select */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#20382F]/20 focus:border-[#20382F] bg-white text-neutral-700"
              aria-label="Filter by Invoice Status"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Paid">Paid</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Overdue">Overdue</option>
              <option value="Draft">Draft</option>
              <option value="Void">Void</option>
            </select>
          </div>

          {/* Period Filter Pills */}
          <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg text-xs">
            {(["All", "Due Soon", "Overdue", "Paid"] as const).map((period) => (
              <button
                key={period}
                onClick={() => setPeriodFilter(period)}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  periodFilter === period
                    ? "bg-white text-[#20382F] shadow-xs"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-[#20382F] hover:bg-[#162720] text-white text-xs font-medium rounded-lg transition-colors shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          Create Invoice
        </button>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        {filteredInvoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-50/75 border-b border-neutral-200 text-neutral-500 font-medium">
                  <th className="py-3 px-4">Invoice # & Date</th>
                  <th className="py-3 px-4">Billed Member / Client</th>
                  <th className="py-3 px-4">Servicing Hub</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4 text-right">Amount & Paid</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredInvoices.map((inv) => {
                  const balanceRemaining = Math.max(0, inv.totalAmountCents - inv.paidAmountCents);
                  const isOverdue =
                    inv.status === "Overdue" ||
                    (inv.dueDate < todayStr && balanceRemaining > 0 && inv.status !== "Void");

                  return (
                    <tr
                      key={inv.id}
                      className="hover:bg-neutral-50/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedInvoiceForDetail(inv)}
                    >
                      {/* Invoice # & Issue Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-neutral-900 font-mono">
                          {inv.invoiceNumber}
                        </div>
                        <div className="text-[11px] text-neutral-500 mt-0.5">
                          Issued: {inv.issueDate}
                        </div>
                      </td>

                      {/* Member & Company */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-neutral-900">{inv.memberName}</div>
                        {inv.companyName && (
                          <div className="text-[11px] text-neutral-600">{inv.companyName}</div>
                        )}
                        <div className="text-[10px] text-neutral-400">{inv.memberEmail}</div>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[11px] text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded-md">
                          <Building2 className="w-3 h-3 text-neutral-400" />
                          {inv.locationName}
                        </span>
                      </td>

                      {/* Due Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div
                          className={`font-medium ${
                            isOverdue ? "text-amber-700 font-bold" : "text-neutral-700"
                          }`}
                        >
                          {inv.dueDate}
                        </div>
                        {isOverdue && (
                          <div className="text-[10px] text-amber-700 font-semibold flex items-center gap-0.5 mt-0.5">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            Overdue
                          </div>
                        )}
                      </td>

                      {/* Total & Paid */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="font-bold text-neutral-900">
                          {formatCurrency(inv.totalAmountCents, "INR")}
                        </div>
                        <div className="text-[11px] text-neutral-500 mt-0.5">
                          {inv.paidAmountCents > 0 ? (
                            <span className="text-emerald-700 font-medium">
                              Paid: {formatCurrency(inv.paidAmountCents, "INR")}
                            </span>
                          ) : (
                            <span className="text-neutral-400">Unpaid</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full font-semibold border ${getStatusBadge(
                            inv.status
                          )}`}
                        >
                          {inv.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td
                        className="py-3.5 px-4 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedInvoiceForDetail(inv)}
                            className="p-1.5 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-md transition-colors"
                            title="View Receipt"
                            aria-label={`View ${inv.invoiceNumber}`}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {balanceRemaining > 0 && inv.status !== "Void" && (
                            <button
                              onClick={() => handleOpenPayment(inv)}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded font-medium text-[11px] transition-colors flex items-center gap-1 shadow-xs"
                              title="Record Payment"
                            >
                              <CreditCard className="w-3 h-3" />
                              Pay
                            </button>
                          )}

                          {isOverdue && (
                            <button
                              onClick={() => sendInvoiceReminder(inv.id)}
                              className="p-1.5 text-amber-700 hover:bg-amber-50 rounded-md transition-colors"
                              title="Send Reminder Notice"
                              aria-label={`Send reminder for ${inv.invoiceNumber}`}
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {(inv.status === "Void" || inv.status === "Draft") && (
                            <button
                              onClick={() => deleteInvoice(inv.id)}
                              className="p-1.5 text-neutral-400 hover:text-red-600 rounded-md transition-colors"
                              title="Delete Invoice"
                              aria-label={`Delete ${inv.invoiceNumber}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Receipt className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-neutral-800 mb-1">
              No invoices match your search
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-4">
              Try adjusting your search criteria or create a new invoice for a member.
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedStatus("All");
                  setPeriodFilter("All");
                  setSelectedLocation("All");
                }}
                className="px-3 py-1.5 border border-neutral-200 text-neutral-600 rounded-lg text-xs hover:bg-neutral-50"
              >
                Reset Filters
              </button>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-3 py-1.5 bg-[#20382F] text-white rounded-lg text-xs font-medium hover:bg-[#162720]"
              >
                Create Invoice
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Invoice Modal */}
      <InvoiceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={createInvoice}
        members={members}
        locations={locations}
        existingInvoicesCount={invoices.length}
      />

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={!!selectedInvoiceForPayment}
        onClose={() => setSelectedInvoiceForPayment(null)}
        invoice={selectedInvoiceForPayment}
        onRecordPayment={handleRecordPayment}
      />

      {/* Invoice Detail / Receipt Modal */}
      <InvoiceDetailModal
        isOpen={!!selectedInvoiceForDetail}
        onClose={() => setSelectedInvoiceForDetail(null)}
        invoice={selectedInvoiceForDetail}
        onOpenRecordPayment={handleOpenPayment}
        onSendReminder={sendInvoiceReminder}
        onUpdateStatus={updateInvoiceStatus}
      />
    </div>
  );
}
