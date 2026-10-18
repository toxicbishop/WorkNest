"use client";

import React, { useState } from "react";
import { Building, Globe, Mail, Clock, DollarSign, Check } from "lucide-react";
import { OrganizationSettings } from "@/types";

interface OrganizationTabProps {
  organization: OrganizationSettings;
  onUpdateOrganization: (settings: Partial<OrganizationSettings>) => void;
}

export function OrganizationTab({
  organization,
  onUpdateOrganization,
}: OrganizationTabProps) {
  const [name, setName] = useState(organization.name);
  const [supportEmail, setSupportEmail] = useState(organization.supportEmail);
  const [defaultCurrency, setDefaultCurrency] = useState(organization.defaultCurrency);
  const [primaryTimezone, setPrimaryTimezone] = useState(organization.primaryTimezone);
  const [taxId, setTaxId] = useState(organization.taxId || "");
  const [websiteUrl, setWebsiteUrl] = useState(organization.websiteUrl);
  const [autoAssignLeads, setAutoAssignLeads] = useState(organization.autoAssignLeads);
  const [leadResponseGoalHours, setLeadResponseGoalHours] = useState(
    organization.leadResponseGoalHours
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateOrganization({
      name: name.trim(),
      supportEmail: supportEmail.trim(),
      defaultCurrency,
      primaryTimezone,
      taxId: taxId.trim(),
      websiteUrl: websiteUrl.trim(),
      autoAssignLeads,
      leadResponseGoalHours: Number(leadResponseGoalHours) || 4,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {savedSuccess && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-800">
          <Check className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>Organization settings successfully saved and applied network-wide.</span>
        </div>
      )}

      {/* General Information Card */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-[#1E2922] flex items-center gap-2">
            <Building className="w-4 h-4 text-[#20382F]" />
            Organization Profile
          </h2>
          <p className="text-xs text-[#5A6860] mt-0.5">
            Primary co-working business entity, legal identity, and default currency rules.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-medium text-[#1E2922] mb-1">
              Co-working Brand / Legal Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20382F] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#1E2922] mb-1">
              Support & Inquiries Email *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="email"
                required
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20382F] focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#1E2922] mb-1">
              Official Website URL
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20382F] focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#1E2922] mb-1">
              Tax ID / EIN
            </label>
            <input
              type="text"
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              placeholder="e.g. 12-3456789"
              className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20382F] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#1E2922] mb-1">
              Default Currency
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
              <select
                value={defaultCurrency}
                onChange={(e) => setDefaultCurrency(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20382F] focus:outline-hidden bg-white"
              >
                <option value="INR (₹)">INR (₹) — Indian Rupee</option>
                <option value="USD ($)">USD ($) — United States Dollar</option>
                <option value="EUR (€)">EUR (€) — Euro</option>
                <option value="GBP (£)">GBP (£) — British Pound</option>
                <option value="CAD ($)">CAD ($) — Canadian Dollar</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#1E2922] mb-1">
              Network Reference Timezone
            </label>
            <div className="relative">
              <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
              <select
                value={primaryTimezone}
                onChange={(e) => setPrimaryTimezone(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20382F] focus:outline-hidden bg-white"
              >
                <option value="America/Los_Angeles (PT)">America/Los_Angeles (PT)</option>
                <option value="America/Denver (MT)">America/Denver (MT)</option>
                <option value="America/Chicago (CT)">America/Chicago (CT)</option>
                <option value="America/New_York (ET)">America/New_York (ET)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* CRM Lead Automation Policies */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-[#1E2922]">
            CRM & Pipeline Automation Rules
          </h2>
          <p className="text-xs text-[#5A6860] mt-0.5">
            Configure round-robin inquiry routing and target SLA response times.
          </p>
        </div>

        <div className="space-y-4 pt-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={autoAssignLeads}
              onChange={(e) => setAutoAssignLeads(e.target.checked)}
              className="mt-0.5 rounded text-[#20382F] focus:ring-[#20382F]"
            />
            <div>
              <span className="text-xs font-medium text-[#1E2922]">
                Auto-assign incoming web inquiries to location branch managers
              </span>
              <p className="text-[11px] text-[#5A6860]">
                When enabled, new leads are routed directly to the staff manager of their preferred location.
              </p>
            </div>
          </label>

          <div className="max-w-xs">
            <label className="block text-xs font-medium text-[#1E2922] mb-1">
              Target Initial Lead Response SLA (Hours)
            </label>
            <input
              type="number"
              min="1"
              max="72"
              value={leadResponseGoalHours}
              onChange={(e) => setLeadResponseGoalHours(Number(e.target.value))}
              className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20382F] focus:outline-hidden"
            />
            <p className="text-[11px] text-[#5A6860] mt-1">
              Tasks created for new inquiries will be set to overdue if uncontacted past this threshold.
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end">
        <button
          type="submit"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#20382F] hover:bg-[#162721] rounded-lg transition-colors focus:ring-2 focus:ring-[#20382F] shadow-xs"
        >
          <Check className="w-4 h-4" />
          Save Organization Settings
        </button>
      </div>
    </form>
  );
}
