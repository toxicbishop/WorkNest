"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import {
  Lead,
  Activity,
  DashboardMetrics,
  LeadStatus,
  Location,
  OrganizationSettings,
  MembershipPlan,
  StaffMember,
  Member,
  Membership,
  MembershipStatus,
} from "@/types";
import {
  INITIAL_LEADS,
  INITIAL_ACTIVITIES,
  INITIAL_METRICS,
  INITIAL_LOCATIONS,
  INITIAL_ORGANIZATION,
  INITIAL_MEMBERSHIP_PLANS,
  INITIAL_STAFF,
  INITIAL_MEMBERS,
  INITIAL_MEMBERSHIPS,
} from "@/lib/mock-data";

export type NewLeadData = Omit<Lead, "id" | "createdAt" | "updatedAt"> & { id?: string };

interface WorkNestContextType {
  leads: Lead[];
  activities: Activity[];
  metrics: DashboardMetrics;
  locations: Location[];
  organization: OrganizationSettings;
  plans: MembershipPlan[];
  staff: StaffMember[];
  members: Member[];
  memberships: Membership[];
  selectedLocation: string;
  setSelectedLocation: (loc: string) => void;
  addLead: (lead: NewLeadData) => void;
  updateLead: (lead: Lead) => void;
  deleteLead: (leadId: string) => void;
  updateLeadStatus: (leadId: string, status: LeadStatus, reason?: string) => void;
  convertLead: (leadId: string, plan: Lead["interestedPlan"], startDate: string) => void;
  toggleActivityComplete: (activityId: string) => void;
  // Phase 2 Settings methods
  updateOrganization: (settings: Partial<OrganizationSettings>) => void;
  addLocation: (location: Omit<Location, "id">) => void;
  updateLocation: (location: Location) => void;
  deleteLocation: (locationId: string) => void;
  togglePlanActive: (planId: string) => void;
  updatePlan: (plan: MembershipPlan) => void;
  addStaffMember: (member: Omit<StaffMember, "id">) => void;
  updateStaffMember: (member: StaffMember) => void;
  deleteStaffMember: (staffId: string) => void;
  // Phase 3 Members & Memberships methods
  addMember: (memberData: Omit<Member, "id" | "joinedDate">, membershipData?: Omit<Membership, "id" | "memberId">) => void;
  updateMember: (member: Member) => void;
  deleteMember: (memberId: string) => void;
  updateMembershipStatus: (membershipId: string, status: MembershipStatus) => void;
  renewMembership: (membershipId: string, nextRenewalDate: string) => void;
}

const WorkNestContext = createContext<WorkNestContextType | undefined>(undefined);

const STORAGE_KEY_LEADS = "worknest_leads_v1";
const STORAGE_KEY_ACTIVITIES = "worknest_activities_v1";
const STORAGE_KEY_LOCATIONS = "worknest_locations_v1";
const STORAGE_KEY_ORG = "worknest_org_v1";
const STORAGE_KEY_PLANS = "worknest_plans_v1";
const STORAGE_KEY_STAFF = "worknest_staff_v1";
const STORAGE_KEY_MEMBERS = "worknest_members_v1";
const STORAGE_KEY_MEMBERSHIPS = "worknest_memberships_v1";

export function WorkNestProvider({ children }: { children: React.ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [activities, setActivities] = useState<Activity[]>(INITIAL_ACTIVITIES);
  const [locations, setLocations] = useState<Location[]>(INITIAL_LOCATIONS);
  const [organization, setOrganization] = useState<OrganizationSettings>(INITIAL_ORGANIZATION);
  const [plans, setPlans] = useState<MembershipPlan[]>(INITIAL_MEMBERSHIP_PLANS);
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [memberships, setMemberships] = useState<Membership[]>(INITIAL_MEMBERSHIPS);
  const [selectedLocation, setSelectedLocation] = useState<string>("All");
  const [isHydrated, setIsHydrated] = useState(false);

  // Load persisted state from localStorage after mount using requestAnimationFrame
  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      try {
        const savedLeads = localStorage.getItem(STORAGE_KEY_LEADS);
        if (savedLeads) setLeads(JSON.parse(savedLeads));

        const savedActivities = localStorage.getItem(STORAGE_KEY_ACTIVITIES);
        if (savedActivities) setActivities(JSON.parse(savedActivities));

        const savedLocations = localStorage.getItem(STORAGE_KEY_LOCATIONS);
        if (savedLocations) setLocations(JSON.parse(savedLocations));

        const savedOrg = localStorage.getItem(STORAGE_KEY_ORG);
        if (savedOrg) setOrganization(JSON.parse(savedOrg));

        const savedPlans = localStorage.getItem(STORAGE_KEY_PLANS);
        if (savedPlans) setPlans(JSON.parse(savedPlans));

        const savedStaff = localStorage.getItem(STORAGE_KEY_STAFF);
        if (savedStaff) setStaff(JSON.parse(savedStaff));

        const savedMembers = localStorage.getItem(STORAGE_KEY_MEMBERS);
        if (savedMembers) setMembers(JSON.parse(savedMembers));

        const savedMemberships = localStorage.getItem(STORAGE_KEY_MEMBERSHIPS);
        if (savedMemberships) setMemberships(JSON.parse(savedMemberships));
      } catch {
        // ignore storage parse errors
      } finally {
        setIsHydrated(true);
      }
    });

    return () => cancelAnimationFrame(handle);
  }, []);

  // Save changes to localStorage only after initial hydration has loaded
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(leads));
      localStorage.setItem(STORAGE_KEY_ACTIVITIES, JSON.stringify(activities));
      localStorage.setItem(STORAGE_KEY_LOCATIONS, JSON.stringify(locations));
      localStorage.setItem(STORAGE_KEY_ORG, JSON.stringify(organization));
      localStorage.setItem(STORAGE_KEY_PLANS, JSON.stringify(plans));
      localStorage.setItem(STORAGE_KEY_STAFF, JSON.stringify(staff));
      localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(members));
      localStorage.setItem(STORAGE_KEY_MEMBERSHIPS, JSON.stringify(memberships));
    } catch {
      // ignore write errors
    }
  }, [isHydrated, leads, activities, locations, organization, plans, staff, members, memberships]);

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

  const convertLead = (leadId: string, planCode: Lead["interestedPlan"], startDate: string) => {
    const targetLead = leads.find((l) => l.id === leadId);
    if (!targetLead) return;

    // 1. Mark lead as Converted
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === leadId) {
          return {
            ...l,
            status: "Converted" as LeadStatus,
            interestedPlan: planCode,
            notes: `${l.notes ? `${l.notes}\n` : ""}Converted to active member effective ${startDate}.`,
            updatedAt: new Date().toISOString(),
          };
        }
        return l;
      })
    );

    // 2. Prevent duplicate member creation if already converted
    const existingMember = members.find((m) => m.leadId === leadId || m.email.toLowerCase() === targetLead.email.toLowerCase());
    if (existingMember) return;

    // 3. Match membership plan
    const matchedPlan = plans.find((p) => p.code === planCode) || plans[0];
    const newMemberId = `mbr-${Date.now()}`;
    const newMembershipId = `mship-${Date.now()}`;

    // Calculate initial 1-month renewal date
    const start = new Date(startDate);
    const renewal = new Date(start);
    renewal.setMonth(renewal.getMonth() + 1);

    const newMembership: Membership = {
      id: newMembershipId,
      memberId: newMemberId,
      planId: matchedPlan ? matchedPlan.id : "plan-hotdesk",
      planName: matchedPlan ? matchedPlan.name : `${planCode} Membership`,
      planCode,
      monthlyRateCents: matchedPlan ? matchedPlan.monthlyRateCents : 650000,
      currency: "INR",
      billingInterval: "Monthly",
      status: "Active",
      startDate,
      renewalDate: renewal.toISOString().split("T")[0],
      assignedLocation: targetLead.preferredLocation,
      autoRenew: true,
      notes: `Converted from lead ${targetLead.name}.`,
    };

    const newMember: Member = {
      id: newMemberId,
      leadId,
      name: targetLead.name,
      email: targetLead.email,
      phone: targetLead.phone,
      company: targetLead.company,
      homeLocation: targetLead.preferredLocation,
      status: "Active",
      joinedDate: startDate,
      currentMembershipId: newMembershipId,
      notes: targetLead.notes,
    };

    setMemberships((prev) => [newMembership, ...prev]);
    setMembers((prev) => [newMember, ...prev]);
  };

  const toggleActivityComplete = (activityId: string) => {
    setActivities((prev) =>
      prev.map((act) =>
        act.id === activityId ? { ...act, completed: !act.completed } : act
      )
    );
  };

  // Phase 3 Members & Memberships methods
  const addMember = (
    memberData: Omit<Member, "id" | "joinedDate">,
    membershipData?: Omit<Membership, "id" | "memberId">
  ) => {
    const newMemberId = `mbr-${Date.now()}`;
    const now = new Date().toISOString().split("T")[0];
    let newMembershipId: string | undefined = undefined;

    if (membershipData) {
      newMembershipId = `mship-${Date.now()}`;
      const newMembership: Membership = {
        ...membershipData,
        id: newMembershipId,
        memberId: newMemberId,
      };
      setMemberships((prev) => [newMembership, ...prev]);
    }

    const newMember: Member = {
      ...memberData,
      id: newMemberId,
      joinedDate: now,
      currentMembershipId: newMembershipId,
    };

    setMembers((prev) => [newMember, ...prev]);
  };

  const updateMember = (updatedMember: Member) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === updatedMember.id ? updatedMember : m))
    );
  };

  const deleteMember = (memberId: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    setMemberships((prev) => prev.filter((ms) => ms.memberId !== memberId));
  };

  const updateMembershipStatus = (membershipId: string, status: MembershipStatus) => {
    setMemberships((prev) =>
      prev.map((ms) => {
        if (ms.id === membershipId) {
          return { ...ms, status };
        }
        return ms;
      })
    );

    // Sync member status accordingly
    setMembers((prev) =>
      prev.map((m) => {
        if (m.currentMembershipId === membershipId) {
          const newMemberStatus =
            status === "Active" || status === "Trial" || status === "Expiring"
              ? "Active"
              : status === "Past Due"
              ? "Past Due"
              : "Former";
          return { ...m, status: newMemberStatus };
        }
        return m;
      })
    );
  };

  const renewMembership = (membershipId: string, nextRenewalDate: string) => {
    setMemberships((prev) =>
      prev.map((ms) =>
        ms.id === membershipId
          ? { ...ms, status: "Active", renewalDate: nextRenewalDate }
          : ms
      )
    );
  };

  // Phase 2 Settings methods
  const updateOrganization = (newSettings: Partial<OrganizationSettings>) => {
    setOrganization((prev) => ({ ...prev, ...newSettings }));
  };

  const addLocation = (locData: Omit<Location, "id">) => {
    const newLoc: Location = {
      ...locData,
      id: `loc-${Date.now()}`,
    };
    setLocations((prev) => [...prev, newLoc]);
  };

  const updateLocation = (updatedLoc: Location) => {
    setLocations((prev) =>
      prev.map((loc) => (loc.id === updatedLoc.id ? updatedLoc : loc))
    );
  };

  const deleteLocation = (locationId: string) => {
    setLocations((prev) => prev.filter((loc) => loc.id !== locationId));
    // If the active location was deleted, fallback to "All"
    setSelectedLocation((current) => {
      const loc = locations.find((l) => l.id === locationId);
      return loc && loc.name === current ? "All" : current;
    });
  };

  const togglePlanActive = (planId: string) => {
    setPlans((prev) =>
      prev.map((p) => (p.id === planId ? { ...p, isActive: !p.isActive } : p))
    );
  };

  const updatePlan = (updatedPlan: MembershipPlan) => {
    setPlans((prev) =>
      prev.map((p) => (p.id === updatedPlan.id ? updatedPlan : p))
    );
  };

  const addStaffMember = (staffData: Omit<StaffMember, "id">) => {
    const newMember: StaffMember = {
      ...staffData,
      id: `staff-${Date.now()}`,
    };
    setStaff((prev) => [...prev, newMember]);
  };

  const updateStaffMember = (updatedMember: StaffMember) => {
    setStaff((prev) =>
      prev.map((s) => (s.id === updatedMember.id ? updatedMember : s))
    );
  };

  const deleteStaffMember = (staffId: string) => {
    setStaff((prev) => prev.filter((s) => s.id !== staffId));
  };

  return (
    <WorkNestContext.Provider
      value={{
        leads,
        activities,
        metrics,
        locations,
        organization,
        plans,
        staff,
        members,
        memberships,
        selectedLocation,
        setSelectedLocation,
        addLead,
        updateLead,
        deleteLead,
        updateLeadStatus,
        convertLead,
        toggleActivityComplete,
        updateOrganization,
        addLocation,
        updateLocation,
        deleteLocation,
        togglePlanActive,
        updatePlan,
        addStaffMember,
        updateStaffMember,
        deleteStaffMember,
        addMember,
        updateMember,
        deleteMember,
        updateMembershipStatus,
        renewMembership,
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
