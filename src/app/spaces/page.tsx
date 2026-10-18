"use client";

import React from "react";
import { useWorkNest } from "@/context/WorkNestContext";
import { SpacesDirectory } from "@/features/spaces/SpacesDirectory";

export default function SpacesPage() {
  const { selectedLocation } = useWorkNest();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1E2922]">
          Spaces & Inventory
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Catalog of meeting rooms, private office suites, podcast studios, and desk bays across{" "}
          <span className="font-semibold text-neutral-700">
            {selectedLocation === "All" ? "all coworking hubs" : selectedLocation}
          </span>
          .
        </p>
      </div>

      <SpacesDirectory />
    </div>
  );
}
