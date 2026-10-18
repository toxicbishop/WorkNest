"use client";

import React, { useState } from "react";
import {
  X,
  CreditCard,
  Building,
  Mail,
  Phone,
  Calendar,
  RotateCw,
  Trash2,
} from "lucide-react";
import { Member, Membership, MembershipStatus, MEMBERSHIP_STATUSES } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

interface MemberDetailModalProps {
  isOpen: boolean;
  member: Member | null;
  membership?: Membership | null;
  onClose: () => void;
  onUpdateStatus: (membershipId: string, status: MembershipStatus) => void;
  onRenew: (membershipId: string, nextRenewalDate: string) => void;
  onDeleteMember: (memberId: string) => void;
}

export function MemberDetailModal({
  isOpen,
  member,
  membership,
  onClose,
  onUpdateStatus,
  onRenew,
  onDeleteMember,
}: MemberDetailModalProps) {
  const [isRenewing, setIsRenewing] = useState(false);
  const [newRenewalDate, setNewRenewalDate] = useState("");

  if (!isOpen || !member) return null;

  const handleRenewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!membership || !newRenewalDate) return;
    onRenew(membership.id, newRenewalDate);
    setIsRenewing(false);
  };

  const getStatusBadge = (status?: MembershipStatus) => {
    switch (status) {
      case "Active":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Trial":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Expiring":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Past Due":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "Cancelled":
      case "Expired":
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="member-detail-title"
    >
      <div className="bg-white rounded-xl shadow-xl max-w-xl w-full border border-gray-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-[#F7F8F6]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#20382F] text-white flex items-center justify-center font-bold text-sm">
              {member.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <h2 id="member-detail-title" className="text-sm font-semibold text-[#1E2922]">
                {member.name}
              </h2>
              <p className="text-xs text-[#5A6860]">
                {member.title ? `${member.title} • ` : ""}{member.company || "Independent Professional"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 focus:outline-hidden"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Contact & Branch Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50/70 p-4 rounded-lg border border-gray-100">
            <div>
              <span className="text-[#5A6860] block font-medium">Email Address</span>
              <span className="text-gray-900 font-medium flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                {member.email}
              </span>
            </div>
            <div>
              <span className="text-[#5A6860] block font-medium">Phone Number</span>
              <span className="text-gray-900 font-medium flex items-center gap-1.5 mt-0.5">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                {member.phone}
              </span>
            </div>
            <div>
              <span className="text-[#5A6860] block font-medium">Home Branch Location</span>
              <span className="text-gray-900 font-medium flex items-center gap-1.5 mt-0.5">
                <Building className="w-3.5 h-3.5 text-gray-400" />
                {member.homeLocation}
              </span>
            </div>
            <div>
              <span className="text-[#5A6860] block font-medium">Member Since</span>
              <span className="text-gray-900 font-medium flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                {formatDate(member.joinedDate)}
              </span>
            </div>
          </div>

          {/* Current Membership Contract Details */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-[#1E2922] uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-[#20382F]" />
                Active Membership Contract
              </h3>
              {membership && (
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${getStatusBadge(
                    membership.status
                  )}`}
                >
                  {membership.status}
                </span>
              )}
            </div>

            {membership ? (
              <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-white">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">{membership.planName}</h4>
                    <p className="text-xs text-[#5A6860]">
                      {membership.deskOrOfficeNumber ? `Assigned to ${membership.deskOrOfficeNumber} • ` : ""}
                      {membership.billingInterval} billing
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-bold text-[#1E2922]">
                      {formatCurrency(membership.monthlyRateCents)}
                    </span>
                    <span className="text-xs text-[#5A6860] block">/ month</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-gray-100">
                  <div>
                    <span className="text-[#5A6860]">Contract Period:</span>
                    <div className="font-medium text-gray-900 mt-0.5">
                      {formatDate(membership.startDate)} — {formatDate(membership.renewalDate)}
                    </div>
                  </div>
                  <div>
                    <span className="text-[#5A6860]">Auto-Renew:</span>
                    <div className="font-medium text-gray-900 mt-0.5">
                      {membership.autoRenew ? "Enabled (Recurring)" : "Manual Review Required"}
                    </div>
                  </div>
                </div>

                {membership.notes && (
                  <p className="text-xs text-[#5A6860] bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                    <strong>Contract Note:</strong> {membership.notes}
                  </p>
                )}

                {/* Status Quick Switcher */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 font-medium">Status:</span>
                    <select
                      value={membership.status}
                      onChange={(e) =>
                        onUpdateStatus(membership.id, e.target.value as MembershipStatus)
                      }
                      className="px-2 py-1 border border-gray-300 rounded text-xs bg-white focus:outline-hidden focus:ring-1 focus:ring-[#20382F]"
                    >
                      {MEMBERSHIP_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsRenewing(true);
                      const current = new Date(membership.renewalDate);
                      current.setMonth(current.getMonth() + 1);
                      setNewRenewalDate(current.toISOString().split("T")[0]);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#20382F] hover:underline"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    Renew Contract
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-gray-300 text-center text-xs text-gray-500">
                No active membership linked to this member record.
              </div>
            )}
          </div>

          {/* Renew Contract Mini Form */}
          {isRenewing && (
            <form
              onSubmit={handleRenewSubmit}
              className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-emerald-900">Extend & Renew Membership</span>
                <button
                  type="button"
                  onClick={() => setIsRenewing(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="date"
                  required
                  value={newRenewalDate}
                  onChange={(e) => setNewRenewalDate(e.target.value)}
                  className="px-2.5 py-1.5 border border-emerald-300 rounded-lg text-xs bg-white text-gray-900 focus:outline-hidden"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#20382F] hover:bg-[#162721] text-white rounded-lg font-medium text-xs transition-colors"
                >
                  Confirm Renewal
                </button>
              </div>
            </form>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (confirm(`Remove member '${member.name}' and archive contract?`)) {
                  onDeleteMember(member.id);
                  onClose();
                }
              }}
              className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-md transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Member Record
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-hidden"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
