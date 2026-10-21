"use client";

import React, { useState } from "react";
import { UserCheck, X, CheckCircle2 } from "lucide-react";
import { Lead } from "@/types";

interface ConvertModalProps {
  isOpen: boolean;
  lead: Lead | null;
  onClose: () => void;
  onConfirmConvert: (leadId: string, plan: Lead["interestedPlan"], startDate: string) => void;
}

export function ConvertModal({
  isOpen,
  lead,
  onClose,
  onConfirmConvert,
}: ConvertModalProps) {
  const [startDate, setStartDate] = useState("2026-11-01");
  const [selectedPlan, setSelectedPlan] = useState<Lead["interestedPlan"]>(
    lead?.interestedPlan || "Dedicated Desk"
  );
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !lead) return null;

  const handleConvert = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmConvert(lead.id, selectedPlan, startDate);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="convert-modal-title"
    >
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-gray-200 overflow-hidden" data-ui="overlay">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-[#F7F8F6]" data-ui="ui-frame">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-700" />
            <h2 id="convert-modal-title" className="text-sm font-semibold text-[#1E2922]">
              Convert Lead to Active Member
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto " />
            <h3 className="text-base font-semibold text-gray-900">
              Successfully Converted!
            </h3>
            <p className="text-xs text-gray-600">
              {lead.name} has been transitioned to <strong>Converted</strong>. A member profile and {selectedPlan} membership will be created in Phase 3.
            </p>
          </div>
        ) : (
          <form onSubmit={handleConvert} className="p-6 space-y-4">
            <p className="text-xs text-gray-600">
              Converting <strong>{lead.name}</strong> ({lead.company || "Individual"}) into an active member will update their pipeline stage and create audit records.
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-gray-500">Contact Email:</span>
                <span className="font-medium text-gray-900">{lead.email || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Location:</span>
                <span className="font-medium text-gray-900">{lead.preferredLocation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Team Size:</span>
                <span className="font-medium text-gray-900">{lead.teamSize || 1} Person</span>
              </div>
            </div>

            <div>
              <label htmlFor="convert-plan" className="block text-xs font-semibold text-gray-700 mb-1">
                Finalized Membership Plan
              </label>
              <select
                id="convert-plan"
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value as Lead["interestedPlan"])}
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
              <label htmlFor="convert-start-date" className="block text-xs font-semibold text-gray-700 mb-1">
                Membership Start Date
              </label>
              <input
                id="convert-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-xs rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-[#20382F]"
              />
            </div>

            <div className="pt-2 border-t border-gray-100 flex items-center justify-end gap-3" data-ui="ui-frame">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg  transition-colors focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
              >
                Confirm Conversion
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
