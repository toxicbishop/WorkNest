"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { Lead, Activity, DashboardMetrics, LeadStatus } from "@/types";
import {
  INITIAL_LEADS,
  INITIAL_ACTIVITIES,
  INITIAL_METRICS,
} from "@/lib/mock-data";

export type NewLeadData = Omit<Lead, "id" | "createdAt" | "updatedAt"> & { id?: string };

interface WorkNestContextType {
  leads: Lead[];
  activities: Activity[];
  metrics: DashboardMetrics;
  selectedLocation: string;
  setSelectedLocation: (loc: string) => void;
  addLead: (lead: NewLeadData) => void;
  updateLead: (lead: Lead) => void;
  deleteLead: (leadId: string) => void;
  updateLeadStatus: (leadId: string, status: LeadStatus, reason?: string) => void;
  convertLead: (leadId: string, plan: Lead["interestedPlan"], startDate: string) => void;
  toggleActivityComplete: (activityId: string) => void;
}

const WorkNestContext = createContext<WorkNestContextType | undefined>(undefined);

const STORAGE_KEY_LEADS = "worknest_leads_v1";
const STORAGE_KEY_ACTIVITIES = "worknest_activities_v1";

function getInitialLeads(): Lead[] {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LEADS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
  }
  return INITIAL_LEADS;
}

function getInitialActivities(): Activity[] {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACTIVITIES);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
  }
  return INITIAL_ACTIVITIES;
}

export function WorkNestProvider({ children }: { children: React.ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>(getInitialLeads);
  const [activities, setActivities] = useState<Activity[]>(getInitialActivities);
  const [selectedLocation, setSelectedLocation] = useState<string>("All");

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(leads));
      localStorage.setItem(STORAGE_KEY_ACTIVITIES, JSON.stringify(activities));
    } catch {
      // ignore write errors
    }
  }, [leads, activities]);

  // Compute metrics dynamically from current persisted state (PRD FR-11)
  const metrics: DashboardMetrics = useMemo(() => {
    const pipelineCounts: Record<LeadStatus, number> = {
      New: 0,
      Contacted: 0,
      "Tour Booked": 0,
      Converted: 0,
      Lost: 0,
    };

    leads.forEach((l) => {
      pipelineCounts[l.status] = (pipelineCounts[l.status] || 0) + 1;
    });

    const openLeads =
      pipelineCounts.New + pipelineCounts.Contacted + pipelineCounts["Tour Booked"];

    return {
      activeMembers: INITIAL_METRICS.activeMembers + pipelineCounts.Converted - 14,
      openLeads,
      toursScheduledThisWeek: pipelineCounts["Tour Booked"] + 4,
      mrrCents: INITIAL_METRICS.mrrCents,
      pipelineCounts,
      isDemoData: true,
      definitionNotes: INITIAL_METRICS.definitionNotes,
    };
  }, [leads]);

  const addLead = (leadData: NewLeadData) => {
    const now = new Date().toISOString();
    const newLead: Lead = {
      ...leadData,
      id: `lead-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    setLeads((prev) => [newLead, ...prev]);

    // Automatically create a follow-up task for the new lead
    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      leadId: newLead.id,
      leadName: `${newLead.name}${newLead.company ? ` (${newLead.company})` : ""}`,
      type: "call",
      title: `Initial Discovery Call with ${newLead.name}`,
      description: `Inquired about ${newLead.interestedPlan} at ${newLead.preferredLocation}.`,
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      completed: false,
      staffName: newLead.assignedTo,
      createdAt: now,
    };
    setActivities((prev) => [newActivity, ...prev]);
  };

  const updateLead = (updated: Lead) => {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === updated.id
          ? { ...updated, updatedAt: new Date().toISOString() }
          : l
      )
    );
  };

  const deleteLead = (leadId: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== leadId));
  };

  const updateLeadStatus = (leadId: string, status: LeadStatus, reason?: string) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === leadId) {
          return {
            ...l,
            status,
            lostReason: status === "Lost" ? reason || l.lostReason : undefined,
            updatedAt: new Date().toISOString(),
          };
        }
        return l;
      })
    );
  };

  const convertLead = (leadId: string, plan: Lead["interestedPlan"], startDate: string) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === leadId) {
          return {
            ...l,
            status: "Converted" as LeadStatus,
            interestedPlan: plan,
            notes: `${l.notes ? `${l.notes}\n` : ""}Converted to member effective ${startDate}.`,
            updatedAt: new Date().toISOString(),
          };
        }
        return l;
      })
    );
  };

  const toggleActivityComplete = (activityId: string) => {
    setActivities((prev) =>
      prev.map((act) =>
        act.id === activityId ? { ...act, completed: !act.completed } : act
      )
    );
  };

  return (
    <WorkNestContext.Provider
      value={{
        leads,
        activities,
        metrics,
        selectedLocation,
        setSelectedLocation,
        addLead,
        updateLead,
        deleteLead,
        updateLeadStatus,
        convertLead,
        toggleActivityComplete,
      }}
    >
      {children}
    </WorkNestContext.Provider>
  );
}

export function useWorkNest() {
  const context = useContext(WorkNestContext);
  if (!context) {
    throw new Error("useWorkNest must be used within a WorkNestProvider");
  }
  return context;
}
