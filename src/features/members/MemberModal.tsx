"use client";

import React, { useState } from "react";
import { X, UserPlus, Check, AlertCircle } from "lucide-react";
import { Member, Membership, Location, MembershipPlan } from "@/types";

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    member: Omit<Member, "id" | "joinedDate">,
    membership?: Omit<Membership, "id" | "memberId">
  ) => void;
  locations: Location[];
  plans: MembershipPlan[];
}

export function MemberModal({
  isOpen,
  onClose,
  onSave,
  locations,
  plans,
}: MemberModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [title, setTitle] = useState("");
  const [homeLocation, setHomeLocation] = useState(locations[0]?.name || "Downtown Hub");
  const [selectedPlanId, setSelectedPlanId] = useState(plans[0]?.id || "");
  const [billingInterval, setBillingInterval] = useState<Membership["billingInterval"]>("Monthly");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [deskOrOfficeNumber, setDeskOrOfficeNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [formError, setFormError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setFormError("Member name and email address are required.");
      return;
    }

    const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[0];

    const start = new Date(startDate);
    const renewal = new Date(start);
    if (billingInterval === "Annual") {
      renewal.setFullYear(renewal.getFullYear() + 1);
    } else if (billingInterval === "Quarterly") {
      renewal.setMonth(renewal.getMonth() + 3);
    } else {
      renewal.setMonth(renewal.getMonth() + 1);
    }

    const membershipData: Omit<Membership, "id" | "memberId"> = {
      planId: selectedPlan ? selectedPlan.id : "plan-hotdesk",
      planName: selectedPlan ? selectedPlan.name : "Flex Hot Desk",
      planCode: selectedPlan ? selectedPlan.code : "Hot Desk",
      monthlyRateCents: selectedPlan ? selectedPlan.monthlyRateCents : 650000,
      currency: "INR",
      billingInterval,
      status: "Active",
      startDate,
      renewalDate: renewal.toISOString().split("T")[0],
      deskOrOfficeNumber: deskOrOfficeNumber.trim() || undefined,
      assignedLocation: homeLocation,
      autoRenew: true,
      notes: notes.trim() || undefined,
    };

    onSave(
      {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || "+91 98765 43210",
        company: company.trim() || undefined,
        title: title.trim() || undefined,
        homeLocation,
        status: "Active",
        emergencyContact: emergencyName.trim()
          ? {
              name: emergencyName.trim(),
              phone: emergencyPhone.trim(),
              relationship: "Emergency Contact",
            }
          : undefined,
        notes: notes.trim() || undefined,
      },
      membershipData
    );

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="member-modal-title"
    >
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full border border-gray-200 overflow-hidden" data-ui="overlay">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-[#F7F8F6]" data-ui="ui-frame">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#20382F]" />
            <h3 id="member-modal-title" className="text-sm font-semibold text-[#1E2922]">
              Direct Member Onboarding
            </h3>
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#1E2922] mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Priyesh Mehta"
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20382F] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#1E2922] mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="priyesh@company.in"
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20382F] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#1E2922] mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20382F] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#1E2922] mb-1">
                Company / Organization
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Vance Architecture Ltd"
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20382F] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#1E2922] mb-1">
                Job Title / Profession
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Founder & CEO"
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20382F] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#1E2922] mb-1">
                Home Branch Location
              </label>
              <select
                value={homeLocation}
                onChange={(e) => setHomeLocation(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20382F] focus:outline-hidden bg-white"
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.name}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#1E2922] mb-1">
                Membership Plan
              </label>
              <select
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20382F] focus:outline-hidden bg-white"
              >
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#1E2922] mb-1">
                Billing Cycle
              </label>
              <select
                value={billingInterval}
                onChange={(e) => setBillingInterval(e.target.value as Membership["billingInterval"])}
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20382F] focus:outline-hidden bg-white"
              >
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Annual">Annual (Yearly)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#1E2922] mb-1">
                Contract Start Date
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20382F] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#1E2922] mb-1">
                Emergency Contact Name
              </label>
              <input
                type="text"
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
                placeholder="e.g. Suman Mehta"
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20382F] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#1E2922] mb-1">
                Emergency Contact Phone
              </label>
              <input
                type="tel"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                placeholder="+91 98765 00000"
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20382F] focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#1E2922] mb-1">
                Assigned Desk / Office Suite No. (Optional)
              </label>
              <input
                type="text"
                value={deskOrOfficeNumber}
                onChange={(e) => setDeskOrOfficeNumber(e.target.value)}
                placeholder="e.g. Desk D-04 or Suite 201"
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20382F] focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#1E2922] mb-1">
                Member Notes / Onboarding Requirements
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Keycard preferences, dietary restrictions, fiber requests..."
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20382F] focus:outline-hidden resize-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3" data-ui="ui-frame">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-hidden"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#20382F] hover:bg-[#162721] rounded-lg transition-colors focus:ring-2 focus:ring-[#20382F]"
            >
              <Check className="w-4 h-4" />
              Onboard Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
