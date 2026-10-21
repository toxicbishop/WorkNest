"use client";

import React, { useState } from "react";
import { CreditCard, Check, Edit2, X } from "lucide-react";
import { MembershipPlan } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface PlansTabProps {
  plans: MembershipPlan[];
  onTogglePlanActive: (planId: string) => void;
  onUpdatePlan: (plan: MembershipPlan) => void;
}

export function PlansTab({
  plans,
  onTogglePlanActive,
  onUpdatePlan,
}: PlansTabProps) {
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);
  const [monthlyRateDollars, setMonthlyRateDollars] = useState(0);
  const [meetingCredits, setMeetingCredits] = useState(0);
  const [printCredits, setPrintCredits] = useState(0);
  const [description, setDescription] = useState("");

  const openEdit = (plan: MembershipPlan) => {
    setEditingPlan(plan);
    setMonthlyRateDollars(Math.round(plan.monthlyRateCents / 100));
    setMeetingCredits(plan.meetingRoomCreditsHours);
    setPrintCredits(plan.printingCreditsPages);
    setDescription(plan.description);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    onUpdatePlan({
      ...editingPlan,
      monthlyRateCents: Math.round(Number(monthlyRateDollars) * 100),
      meetingRoomCreditsHours: Number(meetingCredits),
      printingCreditsPages: Number(printCredits),
      description: description.trim(),
    });
    setEditingPlan(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-[#1E2922]">
          Membership Plans & Pricing ({plans.length})
        </h2>
        <p className="text-xs text-[#5A6860] mt-0.5">
          Define recurring subscription tiers, monthly credits, and booking entitlements.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-white border rounded-xl p-5  flex flex-col justify-between transition-all ${
              plan.isActive ? "border-[#E5E7EB]" : "border-gray-200 opacity-60 bg-gray-50/50"
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-[#1E2922]">{plan.name}</h3>
                  <span className="text-[11px] tabular-nums text-[#5A6860] uppercase">{plan.code}</span>
                </div>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                    plan.isActive
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-gray-100 text-gray-500 border border-gray-200"
                  }`}
                >
                  {plan.isActive ? "Active Plan" : "Archived"}
                </span>
              </div>

              <div className="mt-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-[#1E2922]">
                    {formatCurrency(plan.monthlyRateCents)}
                  </span>
                  <span className="text-xs text-[#5A6860]">/ month</span>
                </div>
                <p className="mt-2 text-xs text-[#5A6860] min-h-[36px]">
                  {plan.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 space-y-1.5 text-xs text-[#5A6860]" data-ui="ui-frame">
                <div className="flex items-center justify-between">
                  <span>Meeting Room Credits:</span>
                  <strong className="text-gray-800 font-medium">{plan.meetingRoomCreditsHours} hrs/mo</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Printing Allowance:</span>
                  <strong className="text-gray-800 font-medium">{plan.printingCreditsPages} pages/mo</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Location Access:</span>
                  <strong className="text-emerald-700 font-medium">All Network Locations</strong>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between" data-ui="ui-frame">
              <button
                type="button"
                onClick={() => onTogglePlanActive(plan.id)}
                className={`text-xs font-medium px-2.5 py-1.5 rounded-md transition-colors ${
                  plan.isActive
                    ? "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    : "text-emerald-700 hover:bg-emerald-50"
                }`}
              >
                {plan.isActive ? "Deactivate" : "Re-activate"}
              </button>
              <button
                type="button"
                onClick={() => openEdit(plan)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#20382F] hover:bg-[#20382F]/10 rounded-md transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit Plan
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Plan Dialog */}
      {editingPlan && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="plan-modal-title"
        >
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-gray-200 overflow-hidden" data-ui="overlay">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-[#F7F8F6]" data-ui="ui-frame">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#20382F]" />
                <h3 id="plan-modal-title" className="text-sm font-semibold text-[#1E2922]">
                  Edit Plan: {editingPlan.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingPlan(null)}
                className="p-1 rounded-md text-gray-400 hover:text-gray-600 focus:outline-hidden"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#1E2922] mb-1">
                  Monthly Rate (INR ₹) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="5"
                  required
                  value={monthlyRateDollars}
                  onChange={(e) => setMonthlyRateDollars(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20382F] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1E2922] mb-1">
                  Meeting Room Credits (Hours/mo)
                </label>
                <input
                  type="number"
                  min="0"
                  value={meetingCredits}
                  onChange={(e) => setMeetingCredits(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20382F] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1E2922] mb-1">
                  Monthly Printing Allowance (Pages)
                </label>
                <input
                  type="number"
                  min="0"
                  value={printCredits}
                  onChange={(e) => setPrintCredits(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20382F] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1E2922] mb-1">
                  Public Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20382F] focus:outline-hidden resize-none"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3" data-ui="ui-frame">
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-hidden"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#20382F] hover:bg-[#162721] rounded-lg transition-colors focus:ring-2 focus:ring-[#20382F]"
                >
                  <Check className="w-4 h-4" />
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
