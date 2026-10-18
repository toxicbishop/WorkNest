export type LeadStatus = "New" | "Contacted" | "Tour Booked" | "Converted" | "Lost";

export const LEAD_STATUSES: LeadStatus[] = [
  "New",
  "Contacted",
  "Tour Booked",
  "Converted",
  "Lost",
];

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  interestedPlan: "Hot Desk" | "Dedicated Desk" | "Private Office" | "Virtual Office" | "Enterprise Suite";
  preferredLocation: string;
  teamSize?: number;
  source: "Website Form" | "Walk-in" | "Referral" | "Event" | "Phone Call" | "Social Media" | "Partner";
  status: LeadStatus;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
  nextFollowUpDate?: string;
  notes?: string;
  lostReason?: string;
}

export type ActivityType = "call" | "email" | "tour" | "meeting" | "note" | "task";

export interface Activity {
  id: string;
  leadId?: string;
  leadName?: string;
  type: ActivityType;
  title: string;
  description?: string;
  dueDate: string;
  completed: boolean;
  outcome?: string;
  staffName: string;
  createdAt: string;
}

export interface DashboardMetrics {
  activeMembers: number;
  openLeads: number;
  toursScheduledThisWeek: number;
  mrrCents: number;
  pipelineCounts: Record<LeadStatus, number>;
  isDemoData: boolean;
  definitionNotes: {
    activeMembers: string;
    openLeads: string;
    toursScheduled: string;
    mrr: string;
  };
}
