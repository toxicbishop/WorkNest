"use client";

import React from "react";
import { useWorkNest } from "@/context/WorkNestContext";
import { InvoicesDirectory } from "@/features/billing/InvoicesDirectory";

export default function BillingPage() {
  const { selectedLocation } = useWorkNest();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1E2922]">
          Invoices & Billing
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          GST-compliant billing, member subscriptions, room overage invoicing, and payment reconciliations across{" "}
          <span className="font-semibold text-neutral-700">
            {selectedLocation === "All" ? "all coworking hubs" : selectedLocation}
          </span>
          .
        </p>
      </div>

      <InvoicesDirectory />
    </div>
  );
}
