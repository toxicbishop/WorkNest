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

export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  timezone: string;
  operatingHours: string;
  totalCapacity: number;
  currentOccupancyRate: number; // percentage, e.g. 84
  phone: string;
  managerName: string;
  status: "Active" | "Maintenance" | "Coming Soon";
}

export interface OrganizationSettings {
  name: string;
  supportEmail: string;
  defaultCurrency: string;
  primaryTimezone: string;
  taxId?: string;
  websiteUrl: string;
  autoAssignLeads: boolean;
  leadResponseGoalHours: number;
}

export interface MembershipPlan {
  id: string;
  name: string;
  code: "Hot Desk" | "Dedicated Desk" | "Private Office" | "Virtual Office" | "Enterprise Suite";
  monthlyRateCents: number;
  currency: string;
  meetingRoomCreditsHours: number;
  printingCreditsPages: number;
  includedLocations: string[]; // ["All"] or specific location IDs
  description: string;
  isActive: boolean;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: "Workspace Owner" | "Community Manager" | "Sales Lead" | "Front Desk";
  assignedLocations: string[]; // ["All"] or location names
  status: "Active" | "Invited" | "Inactive";
}

export type MembershipStatus =
  | "Trial"
  | "Active"
  | "Past Due"
  | "Expiring"
  | "Cancelled"
  | "Expired";

export const MEMBERSHIP_STATUSES: MembershipStatus[] = [
  "Active",
  "Trial",
  "Expiring",
  "Past Due",
  "Cancelled",
  "Expired",
];

export interface Membership {
  id: string;
  memberId: string;
  planId: string;
  planName: string;
  planCode: Lead["interestedPlan"];
  monthlyRateCents: number;
  currency: string;
  billingInterval: "Monthly" | "Quarterly" | "Annual";
  status: MembershipStatus;
  startDate: string;
  renewalDate: string;
  endDate?: string;
  deskOrOfficeNumber?: string;
  assignedLocation: string;
  autoRenew: boolean;
  notes?: string;
}

export interface Member {
  id: string;
  leadId?: string; // Originating lead if converted
  name: string;
  email: string;
  phone: string;
  company?: string;
  title?: string;
  homeLocation: string;
  status: "Active" | "Past Due" | "Suspended" | "Former";
  joinedDate: string;
  currentMembershipId?: string;
  avatarUrl?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  notes?: string;
}

export type SpaceType =
  | "Meeting Room"
  | "Conference Hall"
  | "Podcast Studio"
  | "Event Space"
  | "Phone Booth"
  | "Hot Desk Zone"
  | "Dedicated Desk Bay"
  | "Private Office Suite";

export interface Space {
  id: string;
  locationId: string;
  locationName: string;
  name: string;
  type: SpaceType;
  capacity: number;
  hourlyRateCents: number; // e.g. 50000 = ₹500/hr
  amenities: string[]; // e.g. ["4K Screen", "Polycom AV", "Whiteboard", "High-speed Fiber", "Acoustic Insulation"]
  floorOrZone: string;
  isActive: boolean;
  notes?: string;
}

export type BookingType = "Meeting Room" | "Prospect Tour" | "Event" | "Desk";
export type BookingStatus = "Confirmed" | "Checked In" | "Completed" | "Cancelled" | "No Show";

export interface Booking {
  id: string;
  spaceId: string;
  spaceName: string;
  locationName: string;
  title: string;
  bookingType: BookingType;
  bookedByName: string;
  bookedByEmail: string;
  memberId?: string;
  leadId?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM (24h, e.g. "10:00")
  endTime: string; // HH:MM (24h, e.g. "11:30")
  attendeesCount: number;
  status: BookingStatus;
  totalCostCents: number;
  creditsUsedHours: number;
  createdAt: string;
  notes?: string;
}


