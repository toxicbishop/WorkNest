"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  Edit,
  Trash2,
  UserCheck,
  Building,
  Mail,
  Phone,
} from "lucide-react";
import { Lead, LeadStatus, LEAD_STATUSES } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/utils";

interface LeadsTableProps {
  leads: Lead[];
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (leadId: string) => void;
  onStatusChange: (leadId: string, newStatus: LeadStatus) => void;
  onConvertLead: (lead: Lead) => void;
  onOpenNewLead: () => void;
  selectedLocationFilter: string;
}

export function LeadsTable({
  leads,
  onEditLead,
  onDeleteLead,
  onStatusChange,
  onConvertLead,
  onOpenNewLead,
  selectedLocationFilter,
}: LeadsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [sortField, setSortField] = useState<"createdAt" | "name">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Filtered & Sorted Leads
  const filteredLeads = useMemo(() => {
    return leads
      .filter((lead) => {
        // Location filter
        if (
          selectedLocationFilter !== "All" &&
          lead.preferredLocation !== selectedLocationFilter
        ) {
          return false;
        }

        // Status filter
        if (selectedStatus !== "All" && lead.status !== selectedStatus) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchName = lead.name.toLowerCase().includes(query);
          const matchEmail = lead.email.toLowerCase().includes(query);
          const matchCompany = lead.company?.toLowerCase().includes(query) || false;
          if (!matchName && !matchEmail && !matchCompany) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortField === "createdAt") {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
        } else {
          return sortOrder === "asc"
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        }
      });
  }, [leads, selectedLocationFilter, selectedStatus, searchQuery, sortField, sortOrder]);

  const toggleSort = (field: "createdAt" | "name") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedStatus("All");
  };

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-xs overflow-hidden">
      {/* Search and Filters Header */}
      <div className="p-4 sm:p-5 border-b border-[#E5E7EB] space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by prospect name, email, or company..."
              className="w-full text-xs rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-[#20382F]"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenNewLead}
              className="inline-flex items-center gap-1.5 bg-[#20382F] hover:bg-[#172A23] text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-xs transition-colors focus:outline-hidden focus:ring-2 focus:ring-[#20382F]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Lead</span>
            </button>
          </div>
        </div>

        {/* Stage Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 text-xs">
          <span className="text-gray-400 text-xs font-medium mr-1 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Stage:
          </span>
          <button
            type="button"
            onClick={() => setSelectedStatus("All")}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors shrink-0 ${
              selectedStatus === "All"
                ? "bg-[#20382F] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All Stages ({leads.length})
          </button>
          {LEAD_STATUSES.map((status) => {
            const count = leads.filter((l) => l.status === status).length;
            const isSelected = selectedStatus === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => setSelectedStatus(status)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors shrink-0 ${
                  isSelected
                    ? "bg-[#20382F] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {status} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Leads Table */}
      {filteredLeads.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400 mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">No matching leads found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mb-4">
            Try adjusting your search query, clearing status filters, or creating a new lead.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="text-xs font-semibold text-[#20382F] hover:underline"
          >
            Reset active filters
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" aria-label="Leads list">
            <thead>
              <tr className="border-b border-gray-200 bg-[#F7F8F6] text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
                <th className="py-3 px-4">
                  <button
                    type="button"
                    onClick={() => toggleSort("name")}
                    className="flex items-center gap-1 hover:text-gray-900"
                  >
                    <span>Prospect / Company</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Plan & Location</th>
                <th className="py-3 px-4">Assigned To</th>
                <th className="py-3 px-4">
                  <button
                    type="button"
                    onClick={() => toggleSort("createdAt")}
                    className="flex items-center gap-1 hover:text-gray-900"
                  >
                    <span>Created</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50/80 transition-colors">
                  {/* Prospect & Contact */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-gray-900">{lead.name}</div>
                    {lead.company && (
                      <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                        <Building className="w-3 h-3 text-gray-400" />
                        <span>{lead.company}</span>
                        {lead.teamSize && lead.teamSize > 1 && (
                          <span className="text-[10px] bg-gray-100 px-1.5 py-0.2 rounded text-gray-600">
                            {lead.teamSize} people
                          </span>
                        )}
                      </div>
                    )}
                    <div className="text-[11px] text-gray-500 flex items-center gap-2 mt-1">
                      {lead.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-gray-400" />
                          {lead.email}
                        </span>
                      )}
                      {lead.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-gray-400" />
                          {lead.phone}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Status Dropdown */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={lead.status} />
                      <label htmlFor={`status-select-${lead.id}`} className="sr-only">
                        Change status for {lead.name}
                      </label>
                      <select
                        id={`status-select-${lead.id}`}
                        value={lead.status}
                        onChange={(e) => onStatusChange(lead.id, e.target.value as LeadStatus)}
                        className="text-[11px] border border-gray-200 rounded px-1.5 py-1 text-gray-700 bg-white hover:border-gray-400 focus:outline-hidden cursor-pointer"
                      >
                        <option value="New">Move to New</option>
                        <option value="Contacted">Move to Contacted</option>
                        <option value="Tour Booked">Move to Tour Booked</option>
                        <option value="Converted">Move to Converted</option>
                        <option value="Lost">Move to Lost</option>
                      </select>
                    </div>
                    {lead.status === "Lost" && lead.lostReason && (
                      <p className="text-[10px] text-rose-600 italic mt-1 max-w-xs truncate">
                        Reason: {lead.lostReason}
                      </p>
                    )}
                  </td>

                  {/* Plan & Location */}
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-gray-900">{lead.interestedPlan}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">{lead.preferredLocation}</div>
                  </td>

                  {/* Assigned Owner */}
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 text-gray-700">
                      <span className="w-2 h-2 rounded-full bg-emerald-600/40" />
                      {lead.assignedTo}
                    </span>
                  </td>

                  {/* Date Created */}
                  <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap">
                    {formatDate(lead.createdAt)}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {lead.status !== "Converted" && (
                        <button
                          type="button"
                          onClick={() => onConvertLead(lead)}
                          title="Convert lead to member"
                          aria-label={`Convert ${lead.name} to member`}
                          data-testid={`convert-lead-${lead.id}`}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-1 rounded transition-colors"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Convert</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onEditLead(lead)}
                        className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                        title="Edit lead details"
                        aria-label={`Edit ${lead.name}`}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteLead(lead.id)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        title="Delete lead record"
                        aria-label={`Delete ${lead.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Table Footer */}
      <div className="p-3 bg-[#F7F8F6] border-t border-[#E5E7EB] text-xs text-gray-500 flex items-center justify-between">
        <span>
          Showing <strong>{filteredLeads.length}</strong> of <strong>{leads.length}</strong> leads
        </span>
        <span className="text-[11px] text-gray-400">
          WorkNest Lead Engine • All mutations audited in browser memory
        </span>
      </div>
    </div>
  );
}
