"use client";

import React from "react";
import { useWorkNest } from "@/context/WorkNestContext";
import { MembersDirectory } from "@/features/members/MembersDirectory";

export default function MembersPage() {
  const {
    members,
    memberships,
    locations,
    plans,
    selectedLocation,
    addMember,
    updateMember,
    deleteMember,
    updateMembershipStatus,
    renewMembership,
  } = useWorkNest();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1E2922]">
          Members & Subscriptions
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Complete member directory, active recurring contracts, and renewal timelines across{" "}
          <span className="font-semibold text-gray-700">
            {selectedLocation === "All" ? "all coworking hubs" : selectedLocation}
          </span>
          .
        </p>
      </div>

      <MembersDirectory
        members={members}
        memberships={memberships}
        locations={locations}
        plans={plans}
        selectedLocation={selectedLocation}
        onAddMember={addMember}
        onUpdateMember={updateMember}
        onDeleteMember={deleteMember}
        onUpdateStatus={updateMembershipStatus}
        onRenew={renewMembership}
      />
    </div>
  );
}
