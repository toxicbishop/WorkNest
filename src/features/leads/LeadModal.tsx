"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Lead, LeadStatus } from "@/types";

export type LeadFormData = Omit<Lead, "id" | "createdAt" | "updatedAt"> & { id?: string };

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (leadData: LeadFormData) => void;
  initialLead?: Lead | null;
  existingLeads?: Lead[];
}

function LeadFormInner({
  onClose,
  onSave,
  initialLead,
  existingLeads = [],
}: {
  onClose: () => void;
  onSave: (leadData: LeadFormData) => void;
  initialLead?: Lead | null;
  existingLeads?: Lead[];
}) {
  const [name, setName] = useState(initialLead?.name || "");
  const [email, setEmail] = useState(initialLead?.email || "");
  const [phone, setPhone] = useState(initialLead?.phone || "");
  const [company, setCompany] = useState(initialLead?.company || "");
  const [interestedPlan, setInterestedPlan] = useState<Lead["interestedPlan"]>(
    initialLead?.interestedPlan || "Hot Desk"
  );
  const [preferredLocation, setPreferredLocation] = useState(
    initialLead?.preferredLocation || "Downtown Hub"
  );
  const [teamSize, setTeamSize] = useState<number>(initialLead?.teamSize || 1);
  const [source, setSource] = useState<Lead["source"]>(
    initialLead?.source || "Website Form"
  );
  const [status, setStatus] = useState<LeadStatus>(initialLead?.status || "New");
  const [assignedTo, setAssignedTo] = useState(
    initialLead?.assignedTo || "Marcus Vance"
  );
  const [notes, setNotes] = useState(initialLead?.notes || "");
  const [lostReason, setLostReason] = useState(initialLead?.lostReason || "");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Contact name is required.";
    }

    if (!email.trim() && !phone.trim()) {
      newErrors.email = "Provide at least an email or phone number.";
    } else if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Enter a valid email address.";
    }

    if (teamSize < 1) {
      newErrors.teamSize = "Team size must be at least 1.";
    }

    if (status === "Lost" && !lostReason.trim()) {
      newErrors.lostReason = "Reason is required when marking a lead as Lost (PRD §6.2).";
    }

    // Check duplicate email
    if (email.trim()) {
      const isDuplicate = existingLeads.some(
        (lead) =>
          lead.email.toLowerCase() === email.trim().toLowerCase() &&
          lead.id !== initialLead?.id
      );
      if (isDuplicate) {
        newErrors.email = "A lead with this email already exists.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onSave({
        ...(initialLead ? { id: initialLead.id } : {}),
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        company: company.trim() || undefined,
        interestedPlan,
        preferredLocation,
        teamSize: Number(teamSize),
        source,
        status,
        assignedTo,
        notes: notes.trim() || undefined,
        lostReason: status === "Lost" ? lostReason.trim() : undefined,
      });
      setIsSubmitting(false);
      onClose();
    }, 200);
  };

  return (
    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full border border-gray-200 overflow-hidden" data-ui="overlay">
      {/* Modal Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-[#F7F8F6]" data-ui="ui-frame">
        <h2 id="modal-title" className="text-base font-semibold text-[#1E2922]">
          {initialLead ? "Edit Lead Details" : "Create New Lead Inquiry"}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-200/50"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Name & Company */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="lead-name" className="block text-xs font-semibold text-gray-700 mb-1">
              Contact Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="lead-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Morgan"
              className={`w-full text-xs rounded-lg border px-3 py-2 text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-[#20382F] ${
                errors.name ? "border-rose-400 bg-rose-50/30" : "border-gray-300"
              }`}
            />
            {errors.name && <p className="text-[11px] text-rose-600 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="lead-company" className="block text-xs font-semibold text-gray-700 mb-1">
              Company / Studio (Optional)
            </label>
            <input
              id="lead-company"
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Vance Architecture Ltd"
              className="w-full text-xs rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-[#20382F]"
            />
          </div>
        </div>

        {/* Email & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="lead-email" className="block text-xs font-semibold text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="lead-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@company.com"
              className={`w-full text-xs rounded-lg border px-3 py-2 text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-[#20382F] ${
                errors.email ? "border-rose-400 bg-rose-50/30" : "border-gray-300"
              }`}
            />
            {errors.email && <p className="text-[11px] text-rose-600 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="lead-phone" className="block text-xs font-semibold text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              id="lead-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full text-xs rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-[#20382F]"
            />
          </div>
        </div>

        {/* Plan & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="lead-plan" className="block text-xs font-semibold text-gray-700 mb-1">
              Interested Plan
            </label>
            <select
              id="lead-plan"
              value={interestedPlan}
              onChange={(e) => setInterestedPlan(e.target.value as Lead["interestedPlan"])}
              className="w-full text-xs rounded-lg border border-gray-300 px-3 py-2 text-gray-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#20382F]"
            >
              <option value="Hot Desk">Hot Desk</option>
              <option value="Dedicated Desk">Dedicated Desk</option>
              <option value="Private Office">Private Office</option>
              <option value="Virtual Office">Virtual Office</option>
              <option value="Enterprise Suite">Enterprise Suite</option>
            </select>
          </div>

          <div>
            <label htmlFor="lead-location" className="block text-xs font-semibold text-gray-700 mb-1">
              Preferred Location
            </label>
            <select
              id="lead-location"
              value={preferredLocation}
              onChange={(e) => setPreferredLocation(e.target.value)}
              className="w-full text-xs rounded-lg border border-gray-300 px-3 py-2 text-gray-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#20382F]"
            >
              <option value="Downtown Hub">Downtown Hub</option>
              <option value="Westside Commons">Westside Commons</option>
              <option value="Tech District">Tech District</option>
            </select>
          </div>
        </div>

        {/* Team Size & Lead Source */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="lead-teamsize" className="block text-xs font-semibold text-gray-700 mb-1">
              Team Size
            </label>
            <input
              id="lead-teamsize"
              type="number"
              min="1"
              max="500"
              value={teamSize}
              onChange={(e) => setTeamSize(parseInt(e.target.value) || 1)}
              className={`w-full text-xs rounded-lg border px-3 py-2 text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-[#20382F] ${
                errors.teamSize ? "border-rose-400 bg-rose-50/30" : "border-gray-300"
              }`}
            />
            {errors.teamSize && <p className="text-[11px] text-rose-600 mt-1">{errors.teamSize}</p>}
          </div>

          <div>
            <label htmlFor="lead-source" className="block text-xs font-semibold text-gray-700 mb-1">
              Lead Source
            </label>
            <select
              id="lead-source"
              value={source}
              onChange={(e) => setSource(e.target.value as Lead["source"])}
              className="w-full text-xs rounded-lg border border-gray-300 px-3 py-2 text-gray-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#20382F]"
            >
              <option value="Website Form">Website Form</option>
              <option value="Walk-in">Walk-in</option>
              <option value="Referral">Referral</option>
              <option value="Event">Event</option>
              <option value="Phone Call">Phone Call</option>
              <option value="Social Media">Social Media</option>
              <option value="Partner">Partner</option>
            </select>
          </div>
        </div>

        {/* Status & Assigned Staff */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="lead-status" className="block text-xs font-semibold text-gray-700 mb-1">
              Pipeline Stage
            </label>
            <select
              id="lead-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as LeadStatus)}
              className="w-full text-xs rounded-lg border border-gray-300 px-3 py-2 text-gray-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#20382F]"
            >
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Tour Booked">Tour Booked</option>
              <option value="Converted">Converted</option>
              <option value="Lost">Lost</option>
            </select>
          </div>

          <div>
            <label htmlFor="lead-owner" className="block text-xs font-semibold text-gray-700 mb-1">
              Assigned Staff Owner
            </label>
            <select
              id="lead-owner"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full text-xs rounded-lg border border-gray-300 px-3 py-2 text-gray-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#20382F]"
            >
              <option value="Marcus Vance">Marcus Vance</option>
              <option value="Sarah Jenkins">Sarah Jenkins</option>
            </select>
          </div>
        </div>

        {/* Lost Reason (Required when status is Lost) */}
        {status === "Lost" && (
            <div className="p-3 bg-rose-50/60 border border-rose-200 rounded-lg">
              <label htmlFor="lead-lost-reason" className="block text-xs font-semibold text-rose-800 mb-1">
                Reason for Lost Status <span className="text-rose-600">*</span>
              </label>
              <input
                id="lead-lost-reason"
                type="text"
                value={lostReason}
                onChange={(e) => setLostReason(e.target.value)}
                placeholder="e.g. Budget mismatch, chose competitor, moved area"
                className={`w-full text-xs rounded-lg border px-3 py-2 text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 ${
                  errors.lostReason ? "border-rose-500 bg-rose-50" : "border-rose-300 bg-white"
                }`}
              />
              {errors.lostReason && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.lostReason}</p>
              )}
            </div>
        )}

        {/* Notes */}
        <div>
          <label htmlFor="lead-notes" className="block text-xs font-semibold text-gray-700 mb-1">
            Internal Discovery Notes
          </label>
          <textarea
            id="lead-notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Requirements, move-in timeframe, tech needs..."
            className="w-full text-xs rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-[#20382F]"
          />
        </div>

        {/* Actions */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-end gap-3" data-ui="ui-frame">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#20382F] hover:bg-[#172A23] rounded-lg  transition-colors focus:outline-hidden focus:ring-2 focus:ring-[#20382F]"
          >
            {isSubmitting ? "Saving..." : initialLead ? "Update Lead" : "Create Lead"}
          </button>
        </div>
      </form>
    </div>
  );
}

export function LeadModal({
  isOpen,
  onClose,
  onSave,
  initialLead,
  existingLeads = [],
}: LeadModalProps) {
  // Handle keyboard Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <LeadFormInner
        key={initialLead ? initialLead.id : "new-lead"}
        onClose={onClose}
        onSave={onSave}
        initialLead={initialLead}
        existingLeads={existingLeads}
      />
    </div>
  );
}
