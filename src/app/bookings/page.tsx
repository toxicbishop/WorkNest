"use client";

import React from "react";
import { useWorkNest } from "@/context/WorkNestContext";
import { BookingsDirectory } from "@/features/bookings/BookingsDirectory";

export default function BookingsPage() {
  const { selectedLocation } = useWorkNest();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1E2922]">
          Bookings & Tours
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Schedule meeting rooms, manage prospect walkthroughs, prevent reservation overlaps, and track space check-ins across{" "}
          <span className="font-semibold text-neutral-700">
            {selectedLocation === "All" ? "all coworking hubs" : selectedLocation}
          </span>
          .
        </p>
      </div>

      <BookingsDirectory />
    </div>
  );
}
