"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, ArrowRight, Building } from "lucide-react";
import { useWorkNest, NewLeadData } from "@/context/WorkNestContext";
import { MetricCards } from "@/features/dashboard/MetricCards";
import { PipelineBreakdown } from "@/features/dashboard/PipelineBreakdown";
import { ActivityFeed } from "@/features/dashboard/ActivityFeed";
import { LeadsTable } from "@/features/leads/LeadsTable";
import { LeadModal } from "@/features/leads/LeadModal";
import { ConvertModal } from "@/features/leads/ConvertModal";
import { Lead } from "@/types";

export default function DashboardPage() {
  const {
    leads,
    activities,
    metrics,
    selectedLocation,
    addLead,
    updateLead,
    deleteLead,
    updateLeadStatus,
    convertLead,
    toggleActivityComplete,
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

  const handleConvertLead = (lead: Lead) => {
    setConvertingLead(lead);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1E2922]">
            Operations Dashboard
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Monitoring prospect pipeline, member engagement, and tour schedules across{" "}
            <span className="font-semibold text-gray-700">
              {selectedLocation === "All" ? "all coworking hubs" : selectedLocation}
            </span>
            .
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/leads"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 px-3 py-2 rounded-lg transition-colors shadow-2xs"
          >
            <span>View Full Pipeline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={handleOpenNewLead}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#20382F] hover:bg-[#172A23] px-3.5 py-2 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <MetricCards metrics={metrics} />

      {/* Main Grid: Funnel & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Funnel & Leads Table (2 spans on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          <PipelineBreakdown pipelineCounts={metrics.pipelineCounts} />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[#1E2922]">Prospects & Tour Pipeline</h2>
                <p className="text-xs text-gray-500">Filterable list with instant status updates</p>
              </div>
              <Link
                href="/leads"
                className="text-xs font-semibold text-[#20382F] hover:underline flex items-center gap-1"
              >
                <span>Pipeline view</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <LeadsTable
              leads={leads}
              onEditLead={handleEditLead}
              onDeleteLead={deleteLead}
              onStatusChange={updateLeadStatus}
              onConvertLead={handleConvertLead}
              onOpenNewLead={handleOpenNewLead}
              selectedLocationFilter={selectedLocation}
            />
          </div>
        </div>

        {/* Right Column: Follow-up Tasks & Quick Info */}
        <div className="space-y-6">
          <ActivityFeed
            activities={activities}
            onToggleComplete={toggleActivityComplete}
          />

          {/* Location Quick Glance */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <Building className="w-4 h-4 text-emerald-800" />
              <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Location Inventory Health
              </h3>
            </div>
            <div className="space-y-3 text-xs text-gray-600">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span>Downtown Hub</span>
                <span className="font-semibold text-emerald-800">92% Occupied</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span>Westside Commons</span>
                <span className="font-semibold text-emerald-800">84% Occupied</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Tech District</span>
                <span className="font-semibold text-amber-700">71% Occupied</span>
              </div>
            </div>
            <p className="text-[11px] text-gray-400 mt-3 pt-3 border-t border-gray-100">
              Full space reservation and conflict-free booking engine arrives in <strong>Phase 4</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Add / Edit Lead Modal */}
      <LeadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveLead}
        initialLead={editingLead}
        existingLeads={leads}
      />

      {/* Convert Lead to Member Modal */}
      <ConvertModal
        isOpen={!!convertingLead}
        lead={convertingLead}
        onClose={() => setConvertingLead(null)}
        onConfirmConvert={convertLead}
      />
    </div>
  );
}
