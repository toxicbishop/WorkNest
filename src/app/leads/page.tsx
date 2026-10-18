"use client";

import React, { useState } from "react";
import { Plus, Users2 } from "lucide-react";
import { useWorkNest, NewLeadData } from "@/context/WorkNestContext";
import { LeadsTable } from "@/features/leads/LeadsTable";
import { LeadModal } from "@/features/leads/LeadModal";
import { ConvertModal } from "@/features/leads/ConvertModal";
import { Lead } from "@/types";

export default function LeadsPage() {
  const {
    leads,
    selectedLocation,
    addLead,
    updateLead,
    deleteLead,
    updateLeadStatus,
    convertLead,
  } = useWorkNest();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [convertingLead, setConvertingLead] = useState<Lead | null>(null);

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setIsModalOpen(true);
  };

  const handleOpenNewLead = () => {
    setEditingLead(null);
    setIsModalOpen(true);
  };

  const handleSaveLead = (leadData: NewLeadData) => {
    if (leadData.id) {
      updateLead(leadData as Lead);
    } else {
      addLead(leadData);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <Users2 className="w-5 h-5 text-emerald-800" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1E2922]">
              Leads & Opportunity Pipeline
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Qualify incoming prospects, schedule tours, and convert approved inquiries to active members.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenNewLead}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#20382F] hover:bg-[#172A23] px-3.5 py-2 rounded-lg transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Lead Inquiry</span>
        </button>
      </div>

      {/* Main Table */}
      <LeadsTable
        leads={leads}
        onEditLead={handleEditLead}
        onDeleteLead={deleteLead}
        onStatusChange={updateLeadStatus}
        onConvertLead={(lead) => setConvertingLead(lead)}
        onOpenNewLead={handleOpenNewLead}
        selectedLocationFilter={selectedLocation}
      />

      {/* Add / Edit Modal */}
      <LeadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveLead}
        initialLead={editingLead}
        existingLeads={leads}
      />

      {/* Convert to Member Modal */}
      <ConvertModal
        isOpen={!!convertingLead}
        lead={convertingLead}
        onClose={() => setConvertingLead(null)}
        onConfirmConvert={convertLead}
      />
    </div>
  );
}
