"use client";

import React, { useState } from "react";
import { Building2, MapPin, CreditCard, Users2 } from "lucide-react";
import { useWorkNest } from "@/context/WorkNestContext";
import { OrganizationTab } from "@/features/settings/OrganizationTab";
import { LocationsTab } from "@/features/settings/LocationsTab";
import { PlansTab } from "@/features/settings/PlansTab";
import { TeamTab } from "@/features/settings/TeamTab";

type SettingsTab = "locations" | "organization" | "plans" | "team";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("locations");

  const {
    locations,
    addLocation,
    updateLocation,
    deleteLocation,
    organization,
    updateOrganization,
    plans,
    togglePlanActive,
    updatePlan,
    staff,
    addStaffMember,
    updateStaffMember,
    deleteStaffMember,
  } = useWorkNest();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-[#1E2922]">Workspace Settings</h1>
        <p className="text-xs text-[#5A6860] mt-1">
          Manage your co-working network locations, brand configuration, membership pricing, and staff roles.
        </p>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="border-b border-[#E5E7EB] flex items-center gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("locations")}
          className={`inline-flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === "locations"
              ? "border-[#20382F] text-[#20382F]"
              : "border-transparent text-[#5A6860] hover:text-[#1E2922] hover:border-gray-300"
          }`}
        >
          <MapPin className="w-4 h-4" />
          Locations ({locations.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("organization")}
          className={`inline-flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === "organization"
              ? "border-[#20382F] text-[#20382F]"
              : "border-transparent text-[#5A6860] hover:text-[#1E2922] hover:border-gray-300"
          }`}
        >
          <Building2 className="w-4 h-4" />
          Organization & Policies
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("plans")}
          className={`inline-flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === "plans"
              ? "border-[#20382F] text-[#20382F]"
              : "border-transparent text-[#5A6860] hover:text-[#1E2922] hover:border-gray-300"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Membership Plans ({plans.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("team")}
          className={`inline-flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === "team"
              ? "border-[#20382F] text-[#20382F]"
              : "border-transparent text-[#5A6860] hover:text-[#1E2922] hover:border-gray-300"
          }`}
        >
          <Users2 className="w-4 h-4" />
          Team & Roles ({staff.length})
        </button>
      </div>

      {/* Tab Panels */}
      <div className="pt-2">
        {activeTab === "locations" && (
          <LocationsTab
            locations={locations}
            onAddLocation={addLocation}
            onUpdateLocation={updateLocation}
            onDeleteLocation={deleteLocation}
          />
        )}

        {activeTab === "organization" && (
          <OrganizationTab
            organization={organization}
            onUpdateOrganization={updateOrganization}
          />
        )}

        {activeTab === "plans" && (
          <PlansTab
            plans={plans}
            onTogglePlanActive={togglePlanActive}
            onUpdatePlan={updatePlan}
          />
        )}

        {activeTab === "team" && (
          <TeamTab
            staff={staff}
            locations={locations}
            onAddStaffMember={addStaffMember}
            onUpdateStaffMember={updateStaffMember}
            onDeleteStaffMember={deleteStaffMember}
          />
        )}
      </div>
    </div>
  );
}
