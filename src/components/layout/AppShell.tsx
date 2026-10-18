"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { DemoBanner } from "@/components/layout/DemoBanner";
import { LeadModal } from "@/features/leads/LeadModal";
import { useWorkNest } from "@/context/WorkNestContext";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);

  const {
    selectedLocation,
    setSelectedLocation,
    addLead,
    leads,
  } = useWorkNest();

  return (
    <div className="min-h-screen bg-[#F7F8F6] text-[#1E2922] flex flex-col font-sans">
      {/* Required PRD fixture indicator */}
      <DemoBanner />

      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <Header
            onOpenSidebar={() => setIsSidebarOpen(true)}
            onOpenNewLead={() => setIsNewLeadModalOpen(true)}
            selectedLocation={selectedLocation}
            onLocationChange={setSelectedLocation}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
            {children}
          </main>
        </div>
      </div>

      {/* Global New Lead Modal */}
      <LeadModal
        isOpen={isNewLeadModalOpen}
        onClose={() => setIsNewLeadModalOpen(false)}
        onSave={addLead}
        existingLeads={leads}
      />
    </div>
  );
}
