"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  Receipt,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  User,
} from "lucide-react";
import { Invoice, InvoiceLineItem, Member, Location } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    invoice: Omit<Invoice, "id" | "createdAt" | "paidAmountCents" | "paymentRecords">
  ) => void;
  members: Member[];
  locations: Location[];
  existingInvoicesCount: number;
}

interface EditableLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPriceRupees: number;
}

function InvoiceFormInner({
  onClose,
  onSave,
  members,
  locations,
  existingInvoicesCount,
}: {
  onClose: () => void;
  onSave: (
    invoice: Omit<Invoice, "id" | "createdAt" | "paidAmountCents" | "paymentRecords">
  ) => void;
  members: Member[];
  locations: Location[];
  existingInvoicesCount: number;
} & { key?: string }) {
  const [selectedMemberId, setSelectedMemberId] = useState<string>(members[0]?.id || "");
  const [customName, setCustomName] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [customCompany, setCustomCompany] = useState("");
  const [isLinkedMember, setIsLinkedMember] = useState(true);

  const selectedMember = useMemo(
    () => members.find((m) => m.id === selectedMemberId),
    [members, selectedMemberId]
  );

  const [locationName, setLocationName] = useState(
    selectedMember?.homeLocation || locations[0]?.name || "Downtown Hub"
  );

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const defaultDueStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split("T")[0];
  }, []);

  const [issueDate, setIssueDate] = useState(todayStr);
  const [dueDate, setDueDate] = useState(defaultDueStr);
  const [taxRatePercent, setTaxRatePercent] = useState(18); // 18% GST standard in India
  const [notes, setNotes] = useState("Payment due within 14 days of issue. Bank & UPI details included.");
  const [formError, setFormError] = useState("");

  const [lineItems, setLineItems] = useState<EditableLineItem[]>([
    {
      id: "li-1",
      description: "Coworking Space Recurring Membership",
      quantity: 1,
      unitPriceRupees: 6500,
    },
  ]);

  const handleAddLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      {
        id: `li-${Date.now()}`,
        description: "",
        quantity: 1,
        unitPriceRupees: 1000,
      },
    ]);
  };

  const handleRemoveLineItem = (id: string) => {
    if (lineItems.length === 1) return;
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateLineItem = (
    id: string,
    field: keyof EditableLineItem,
    val: string | number
  ) => {
    setLineItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: val } : item))
    );
  };

  // Calculations
  const subtotalCents = useMemo(() => {
    return lineItems.reduce((sum, item) => {
      const itemCents = Math.round(Number(item.quantity || 0) * Number(item.unitPriceRupees || 0) * 100);
      return sum + itemCents;
    }, 0);
  }, [lineItems]);

  const taxAmountCents = useMemo(() => {
    return Math.round((subtotalCents * Number(taxRatePercent || 0)) / 100);
  }, [subtotalCents, taxRatePercent]);

  const totalAmountCents = useMemo(() => {
    return subtotalCents + taxAmountCents;
  }, [subtotalCents, taxAmountCents]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let memberId = "";
    let memberName = "";
    let memberEmail = "";
    let companyName: string | undefined = undefined;

    if (isLinkedMember) {
      if (!selectedMember) {
        setFormError("Please select a registered member.");
        return;
      }
      memberId = selectedMember.id;
      memberName = selectedMember.name;
      memberEmail = selectedMember.email;
      companyName = selectedMember.company;
    } else {
      if (!customName.trim() || !customEmail.trim()) {
        setFormError("Client name and email address are required.");
        return;
      }
      memberId = `client-${Date.now()}`;
      memberName = customName.trim();
      memberEmail = customEmail.trim();
      companyName = customCompany.trim() || undefined;
    }

    if (lineItems.length === 0 || subtotalCents <= 0) {
      setFormError("Invoice must have at least one valid line item with a positive price.");
      return;
    }

    for (const item of lineItems) {
      if (!item.description.trim()) {
        setFormError("All line items must have a description.");
        return;
      }
    }

    const compiledLineItems: InvoiceLineItem[] = lineItems.map((item) => ({
      id: item.id,
      description: item.description.trim(),
      quantity: Number(item.quantity),
      unitPriceCents: Math.round(Number(item.unitPriceRupees) * 100),
      amountCents: Math.round(Number(item.quantity) * Number(item.unitPriceRupees) * 100),
    }));

    const invoiceNumber = `INV-2026-${String(existingInvoicesCount + 1).padStart(3, "0")}`;

    onSave({
      invoiceNumber,
      memberId,
      memberName,
      memberEmail,
      companyName,
      locationName,
      membershipId: selectedMember?.currentMembershipId,
      issueDate,
      dueDate,
      status: "Open",
      currency: "INR",
      lineItems: compiledLineItems,
      subtotalCents,
      taxRatePercent: Number(taxRatePercent),
      taxAmountCents,
      totalAmountCents,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="invoice-modal-title"
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#20382F]/10 flex items-center justify-center text-[#20382F]">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h2 id="invoice-modal-title" className="text-base font-semibold text-[#1E2922]">
                Generate New Invoice
              </h2>
              <p className="text-xs text-neutral-500">
                GST-compliant itemized coworking invoice with automatic totals
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
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 text-xs">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Customer Selection */}
          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-800 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#20382F]" />
                Billed To
              </span>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1 text-[11px] text-neutral-600 cursor-pointer">
                  <input
                    type="radio"
                    name="clientType"
                    checked={isLinkedMember}
                    onChange={() => setIsLinkedMember(true)}
                    className="text-[#20382F] focus:ring-[#20382F]"
                  />
                  <span>Active Member</span>
                </label>
                <label className="flex items-center gap-1 text-[11px] text-neutral-600 cursor-pointer">
                  <input
                    type="radio"
                    name="clientType"
                    checked={!isLinkedMember}
                    onChange={() => setIsLinkedMember(false)}
                    className="text-[#20382F] focus:ring-[#20382F]"
                  />
                  <span>Custom Client / External</span>
                </label>
              </div>
            </div>

            {isLinkedMember ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-600 text-[11px] mb-1">
                    Select Member <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedMemberId}
                    onChange={(e) => {
                      setSelectedMemberId(e.target.value);
                      const m = members.find((x) => x.id === e.target.value);
                      if (m) setLocationName(m.homeLocation);
                    }}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-white"
                  >
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} {m.company ? `(${m.company})` : ""} · {m.homeLocation}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-600 text-[11px] mb-1">
                    Hub Location <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-white"
                  >
                    {locations.map((l) => (
                      <option key={l.id} value={l.name}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-neutral-600 text-[11px] mb-1">
                    Contact Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 text-[11px] mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. rahul@company.com"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 text-[11px] mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Acme Corp"
                    value={customCompany}
                    onChange={(e) => setCustomCompany(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Dates & Tax Rate */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                Issue Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#20382F]/20 focus:border-[#20382F]"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#20382F]/20 focus:border-[#20382F]"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                GST / Tax Rate (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={taxRatePercent}
                onChange={(e) => setTaxRatePercent(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#20382F]/20 focus:border-[#20382F]"
              />
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block font-medium text-neutral-700">
                Itemized Line Items
              </label>
              <button
                type="button"
                onClick={handleAddLineItem}
                className="text-[11px] text-[#20382F] hover:text-[#162720] font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Item
              </button>
            </div>

            <div className="border border-neutral-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-medium">
                    <th className="py-2 px-3">Description</th>
                    <th className="py-2 px-3 w-20 text-center">Qty</th>
                    <th className="py-2 px-3 w-28 text-right">Rate (₹)</th>
                    <th className="py-2 px-3 w-28 text-right">Total (₹)</th>
                    <th className="py-2 px-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {lineItems.map((item) => {
                    const rowTotal = (item.quantity || 0) * (item.unitPriceRupees || 0);
                    return (
                      <tr key={item.id} className="hover:bg-neutral-50/50">
                        <td className="p-2">
                          <input
                            type="text"
                            required
                            placeholder="e.g. Dedicated Desk, Boardroom booking"
                            value={item.description}
                            onChange={(e) =>
                              handleUpdateLineItem(item.id, "description", e.target.value)
                            }
                            className="w-full px-2 py-1.5 border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-[#20382F]"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min="1"
                            required
                            value={item.quantity}
                            onChange={(e) =>
                              handleUpdateLineItem(
                                item.id,
                                "quantity",
                                Math.max(1, parseInt(e.target.value) || 1)
                              )
                            }
                            className="w-full px-2 py-1.5 border border-neutral-200 rounded text-center focus:outline-none focus:ring-1 focus:ring-[#20382F]"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            required
                            value={item.unitPriceRupees}
                            onChange={(e) =>
                              handleUpdateLineItem(
                                item.id,
                                "unitPriceRupees",
                                Math.max(0, parseFloat(e.target.value) || 0)
                              )
                            }
                            className="w-full px-2 py-1.5 border border-neutral-200 rounded text-right focus:outline-none focus:ring-1 focus:ring-[#20382F]"
                          />
                        </td>
                        <td className="p-2 text-right font-medium text-neutral-800">
                          ₹{rowTotal.toLocaleString("en-IN")}
                        </td>
                        <td className="p-2 text-center">
                          {lineItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveLineItem(item.id)}
                              className="text-neutral-400 hover:text-red-600 p-1 transition-colors"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals Summary */}
          <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200 space-y-1.5">
            <div className="flex justify-between text-neutral-600">
              <span>Subtotal:</span>
              <span className="font-medium text-neutral-900">
                {formatCurrency(subtotalCents, "INR")}
              </span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>GST ({taxRatePercent}%):</span>
              <span className="font-medium text-neutral-900">
                {formatCurrency(taxAmountCents, "INR")}
              </span>
            </div>
            <div className="flex justify-between text-sm font-bold text-[#20382F] pt-2 border-t border-neutral-200">
              <span>Total Payable:</span>
              <span>{formatCurrency(totalAmountCents, "INR")}</span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-medium text-neutral-700 mb-1">
              Payment Terms & Instructions
            </label>
            <textarea
              rows={2}
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
              className="px-4 py-2 bg-[#20382F] hover:bg-[#162720] text-white rounded-lg transition-colors font-medium flex items-center gap-1.5 shadow-sm"
            >
              <Check className="w-4 h-4" />
              Create Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function InvoiceModal({
  isOpen,
  onClose,
  onSave,
  members,
  locations,
  existingInvoicesCount,
}: InvoiceModalProps) {
  if (!isOpen) return null;

  return (
    <InvoiceFormInner
      key={`new-invoice-${existingInvoicesCount}`}
      onClose={onClose}
      onSave={onSave}
      members={members}
      locations={locations}
      existingInvoicesCount={existingInvoicesCount}
    />
  );
}
