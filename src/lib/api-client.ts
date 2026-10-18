import {
  Lead,
  Activity,
  Location,
  OrganizationSettings,
  MembershipPlan,
  StaffMember,
  Member,
  Membership,
  Space,
  Booking,
  Invoice,
  DashboardMetrics,
} from "@/types";

export interface AnalyticsReport {
  generated_at: string;
  selected_location: string;
  occupancy: Array<{
    location_id: string;
    location_name: string;
    capacity: number;
    occupancy_rate: number;
    active_members_count: number;
    total_spaces_count: number;
  }>;
  conversion: {
    total_leads: number;
    converted_leads: number;
    lost_leads: number;
    open_leads: number;
    conversion_rate_percent: number;
    lead_sources: Record<string, number>;
  };
  utilization: Array<{
    space_id: string;
    space_name: string;
    location_name: string;
    type: string;
    bookings_count: number;
    booked_hours: number;
  }>;
  revenue: {
    mrr_cents: number;
    total_invoiced_cents: number;
    collected_revenue_cents: number;
    outstanding_cents: number;
    active_memberships: number;
    churned_memberships: number;
    retention_rate_percent: number;
  };
}

// ==========================================
// Strongly-Typed Backend DTO Interfaces
// ==========================================

export interface BackendLead {
  id: string;
  org_id?: string;
  name: string;
  email: string;
  phone: string;
  company?: string | null;
  interested_plan: Lead["interestedPlan"];
  preferred_location: string;
  team_size?: number | null;
  source: Lead["source"];
  status: Lead["status"];
  assigned_to: string;
  created_at?: string;
  updated_at?: string;
  next_follow_up_date?: string | null;
  notes?: string | null;
  lost_reason?: string | null;
  converted_member_id?: string | null;
}

export interface BackendActivity {
  id: string;
  lead_id?: string | null;
  lead_name?: string | null;
  member_id?: string | null;
  type: Activity["type"];
  title: string;
  description?: string | null;
  due_date: string;
  completed: boolean;
  outcome?: string | null;
  staff_name: string;
  created_at?: string;
}

export interface BackendLocation {
  id: string;
  org_id?: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  timezone: string;
  operating_hours: string;
  total_capacity: number;
  current_occupancy_rate: number;
  phone: string;
  manager_name: string;
  status: Location["status"];
}

export interface BackendOrg {
  id?: string;
  name: string;
  support_email: string;
  default_currency: string;
  primary_timezone: string;
  tax_id?: string | null;
  website_url: string;
  auto_assign_leads: boolean;
  lead_response_goal_hours: number;
}

export interface BackendPlan {
  id: string;
  org_id?: string;
  name: string;
  code: MembershipPlan["code"];
  monthly_rate_cents: number;
  currency: string;
  meeting_room_credits_hours: number;
  printing_credits_pages: number;
  included_locations: string[];
  description: string;
  is_active: boolean;
}

export interface BackendStaff {
  id: string;
  org_id?: string;
  name: string;
  email: string;
  role: StaffMember["role"];
  assigned_locations: string[];
  status: StaffMember["status"];
}

export interface BackendMember {
  id: string;
  lead_id?: string | null;
  name: string;
  email: string;
  phone: string;
  company?: string | null;
  title?: string | null;
  home_location: string;
  status: Member["status"];
  joined_date: string;
  current_membership_id?: string | null;
  avatar_url?: string | null;
  emergency_contact?: Member["emergencyContact"] | null;
  notes?: string | null;
}

export interface BackendMembership {
  id: string;
  member_id: string;
  plan_id: string;
  plan_name: string;
  plan_code: Lead["interestedPlan"];
  monthly_rate_cents: number;
  currency: string;
  billing_interval: Membership["billingInterval"];
  status: Membership["status"];
  start_date: string;
  renewal_date: string;
  end_date?: string | null;
  desk_or_office_number?: string | null;
  assigned_location: string;
  auto_renew: boolean;
  notes?: string | null;
}

export interface BackendSpace {
  id: string;
  location_id: string;
  location_name: string;
  name: string;
  type: Space["type"];
  capacity: number;
  hourly_rate_cents: number;
  amenities: string[];
  floor_or_zone: string;
  is_active: boolean;
  notes?: string | null;
}

export interface BackendBooking {
  id: string;
  space_id: string;
  space_name: string;
  location_name: string;
  title: string;
  booking_type: Booking["bookingType"];
  booked_by_name: string;
  booked_by_email: string;
  member_id?: string | null;
  lead_id?: string | null;
  date: string;
  start_time: string;
  end_time: string;
  attendees_count: number;
  status: Booking["status"];
  total_cost_cents: number;
  credits_used_hours: number;
  created_at?: string;
  notes?: string | null;
}

export interface BackendLineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price_cents: number;
  amount_cents: number;
}

export interface BackendPaymentRecord {
  id: string;
  invoice_id: string;
  amount_cents: number;
  payment_method: Invoice["paymentRecords"][0]["paymentMethod"];
  transaction_ref: string;
  paid_at: string;
  notes?: string | null;
}

export interface BackendInvoice {
  id: string;
  invoice_number: string;
  member_id: string;
  member_name: string;
  member_email: string;
  company_name?: string | null;
  location_name: string;
  membership_id?: string | null;
  booking_id?: string | null;
  issue_date: string;
  due_date: string;
  status: Invoice["status"];
  currency: string;
  line_items?: BackendLineItem[];
  subtotal_cents: number;
  tax_rate_percent: number;
  tax_amount_cents: number;
  total_amount_cents: number;
  paid_amount_cents: number;
  payment_records?: BackendPaymentRecord[];
  notes?: string | null;
  created_at?: string;
}

export interface AuthLoginResponse {
  access_token: string;
  token_type: string;
  user: BackendStaff;
}

export interface BookingConflictCheckResponse {
  has_conflict: boolean;
  conflicting_booking?: BackendBooking | null;
}

export interface NotificationResponseItem {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  urgency: "high" | "medium" | "low";
  link: string;
}

export interface NotificationsSummaryResponse {
  items: NotificationResponseItem[];
  unread_count: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("worknest_access_token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errData: { detail?: string } = {};
    try {
      errData = (await response.json()) as { detail?: string };
    } catch {
      errData = { detail: response.statusText };
    }
    const message = errData?.detail || `API request failed with status ${response.status}`;
    throw new ApiError(response.status, message, errData);
  }

  if (response.status === 204) {
    return null as unknown as T;
  }

  return (await response.json()) as T;
}

// ==========================================
// Field Mappers (Backend snake_case <-> Frontend camelCase)
// ==========================================

export function mapBackendLead(b: BackendLead): Lead {
  return {
    id: b.id,
    name: b.name,
    email: b.email,
    phone: b.phone,
    company: b.company || undefined,
    interestedPlan: b.interested_plan,
    preferredLocation: b.preferred_location,
    teamSize: b.team_size || undefined,
    source: b.source,
    status: b.status,
    assignedTo: b.assigned_to,
    createdAt: b.created_at || new Date().toISOString(),
    updatedAt: b.updated_at || new Date().toISOString(),
    nextFollowUpDate: b.next_follow_up_date || undefined,
    notes: b.notes || undefined,
    lostReason: b.lost_reason || undefined,
  };
}

export function mapFrontendLeadToBackend(l: Partial<Lead>): Partial<BackendLead> {
  return {
    ...(l.id ? { id: l.id } : {}),
    ...(l.name ? { name: l.name } : {}),
    ...(l.email ? { email: l.email } : {}),
    ...(l.phone ? { phone: l.phone } : {}),
    company: l.company || null,
    ...(l.interestedPlan ? { interested_plan: l.interestedPlan } : {}),
    ...(l.preferredLocation ? { preferred_location: l.preferredLocation } : {}),
    team_size: l.teamSize || null,
    ...(l.source ? { source: l.source } : {}),
    ...(l.status ? { status: l.status } : {}),
    ...(l.assignedTo ? { assigned_to: l.assignedTo } : {}),
    next_follow_up_date: l.nextFollowUpDate || null,
    notes: l.notes || null,
    lost_reason: l.lostReason || null,
  };
}

export function mapBackendActivity(b: BackendActivity): Activity {
  return {
    id: b.id,
    leadId: b.lead_id || undefined,
    leadName: b.lead_name || undefined,
    type: b.type,
    title: b.title,
    description: b.description || undefined,
    dueDate: b.due_date,
    completed: b.completed,
    outcome: b.outcome || undefined,
    staffName: b.staff_name,
    createdAt: b.created_at || new Date().toISOString(),
  };
}

export function mapBackendLocation(b: BackendLocation): Location {
  return {
    id: b.id,
    name: b.name,
    address: b.address,
    city: b.city,
    state: b.state,
    zip: b.zip,
    timezone: b.timezone,
    operatingHours: b.operating_hours,
    totalCapacity: b.total_capacity,
    currentOccupancyRate: b.current_occupancy_rate,
    phone: b.phone,
    managerName: b.manager_name,
    status: b.status,
  };
}

export function mapBackendOrg(b: BackendOrg): OrganizationSettings {
  return {
    name: b.name,
    supportEmail: b.support_email,
    defaultCurrency: b.default_currency,
    primaryTimezone: b.primary_timezone,
    taxId: b.tax_id || undefined,
    websiteUrl: b.website_url,
    autoAssignLeads: b.auto_assign_leads,
    leadResponseGoalHours: b.lead_response_goal_hours,
  };
}

export function mapBackendPlan(b: BackendPlan): MembershipPlan {
  return {
    id: b.id,
    name: b.name,
    code: b.code,
    monthlyRateCents: b.monthly_rate_cents,
    currency: b.currency,
    meetingRoomCreditsHours: b.meeting_room_credits_hours,
    printingCreditsPages: b.printing_credits_pages,
    includedLocations: b.included_locations || ["All"],
    description: b.description,
    isActive: b.is_active,
  };
}

export function mapBackendStaff(b: BackendStaff): StaffMember {
  return {
    id: b.id,
    name: b.name,
    email: b.email,
    role: b.role,
    assignedLocations: b.assigned_locations || [],
    status: b.status,
  };
}

export function mapBackendMember(b: BackendMember): Member {
  return {
    id: b.id,
    leadId: b.lead_id || undefined,
    name: b.name,
    email: b.email,
    phone: b.phone,
    company: b.company || undefined,
    title: b.title || undefined,
    homeLocation: b.home_location,
    status: b.status,
    joinedDate: b.joined_date,
    currentMembershipId: b.current_membership_id || undefined,
    avatarUrl: b.avatar_url || undefined,
    emergencyContact: b.emergency_contact || undefined,
    notes: b.notes || undefined,
  };
}

export function mapBackendMembership(b: BackendMembership): Membership {
  return {
    id: b.id,
    memberId: b.member_id,
    planId: b.plan_id,
    planName: b.plan_name,
    planCode: b.plan_code,
    monthlyRateCents: b.monthly_rate_cents,
    currency: b.currency,
    billingInterval: b.billing_interval,
    status: b.status,
    startDate: b.start_date,
    renewalDate: b.renewal_date,
    endDate: b.end_date || undefined,
    deskOrOfficeNumber: b.desk_or_office_number || undefined,
    assignedLocation: b.assigned_location,
    autoRenew: b.auto_renew,
    notes: b.notes || undefined,
  };
}

export function mapBackendSpace(b: BackendSpace): Space {
  return {
    id: b.id,
    locationId: b.location_id,
    locationName: b.location_name,
    name: b.name,
    type: b.type,
    capacity: b.capacity,
    hourlyRateCents: b.hourly_rate_cents,
    amenities: b.amenities || [],
    floorOrZone: b.floor_or_zone,
    isActive: b.is_active,
    notes: b.notes || undefined,
  };
}

export function mapBackendBooking(b: BackendBooking): Booking {
  return {
    id: b.id,
    spaceId: b.space_id,
    spaceName: b.space_name,
    locationName: b.location_name,
    title: b.title,
    bookingType: b.booking_type,
    bookedByName: b.booked_by_name,
    bookedByEmail: b.booked_by_email,
    memberId: b.member_id || undefined,
    leadId: b.lead_id || undefined,
    date: b.date,
    startTime: b.start_time,
    endTime: b.end_time,
    attendeesCount: b.attendees_count,
    status: b.status,
    totalCostCents: b.total_cost_cents,
    creditsUsedHours: b.credits_used_hours,
    createdAt: b.created_at || new Date().toISOString(),
    notes: b.notes || undefined,
  };
}

export function mapBackendInvoice(b: BackendInvoice): Invoice {
  return {
    id: b.id,
    invoiceNumber: b.invoice_number,
    memberId: b.member_id,
    memberName: b.member_name,
    memberEmail: b.member_email,
    companyName: b.company_name || undefined,
    locationName: b.location_name,
    membershipId: b.membership_id || undefined,
    bookingId: b.booking_id || undefined,
    issueDate: b.issue_date,
    dueDate: b.due_date,
    status: b.status,
    currency: b.currency,
    lineItems: (b.line_items || []).map((li) => ({
      id: li.id,
      description: li.description,
      quantity: li.quantity,
      unitPriceCents: li.unit_price_cents,
      amountCents: li.amount_cents,
    })),
    subtotalCents: b.subtotal_cents,
    taxRatePercent: b.tax_rate_percent,
    taxAmountCents: b.tax_amount_cents,
    totalAmountCents: b.total_amount_cents,
    paidAmountCents: b.paid_amount_cents || 0,
    paymentRecords: (b.payment_records || []).map((pr) => ({
      id: pr.id,
      invoiceId: pr.invoice_id,
      amountCents: pr.amount_cents,
      paymentMethod: pr.payment_method,
      transactionRef: pr.transaction_ref,
      paidAt: pr.paid_at,
      notes: pr.notes || undefined,
    })),
    notes: b.notes || undefined,
    createdAt: b.created_at || new Date().toISOString(),
  };
}

// ==========================================
// API Client Service
// ==========================================

export const apiClient = {
  // Health & Availability Check
  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL.replace("/api/v1", "")}/health`, {
        cache: "no-store",
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Auth
  auth: {
    async login(email: string, password: string): Promise<AuthLoginResponse> {
      const data = await request<AuthLoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      if (typeof window !== "undefined" && data.access_token) {
        localStorage.setItem("worknest_access_token", data.access_token);
      }
      return data;
    },
    async getMe(): Promise<BackendStaff> {
      return request<BackendStaff>("/auth/me");
    },
    logout(): void {
      if (typeof window !== "undefined") {
        localStorage.removeItem("worknest_access_token");
      }
    },
  },

  // Leads
  leads: {
    async list(location?: string, status?: string, search?: string): Promise<Lead[]> {
      const params = new URLSearchParams();
      if (location && location !== "All Locations") params.append("location", location);
      if (status && status !== "All") params.append("status", status);
      if (search) params.append("search", search);
      const query = params.toString() ? `?${params.toString()}` : "";
      const raw = await request<BackendLead[]>(`/leads${query}`);
      return raw.map(mapBackendLead);
    },
    async create(lead: Partial<Lead>): Promise<Lead> {
      const payload = mapFrontendLeadToBackend(lead);
      const raw = await request<BackendLead>("/leads", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return mapBackendLead(raw);
    },
    async update(lead: Lead): Promise<Lead> {
      const payload = mapFrontendLeadToBackend(lead);
      const raw = await request<BackendLead>(`/leads/${lead.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      return mapBackendLead(raw);
    },
    async updateStatus(id: string, status: string, reason?: string): Promise<Lead> {
      const raw = await request<BackendLead>(`/leads/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, reason }),
      });
      return mapBackendLead(raw);
    },
    async convert(id: string, plan: string, startDate: string, billingInterval = "Monthly"): Promise<Member> {
      const raw = await request<BackendMember>(`/leads/${id}/convert`, {
        method: "POST",
        body: JSON.stringify({ plan, start_date: startDate, billing_interval: billingInterval }),
      });
      return mapBackendMember(raw);
    },
    async delete(id: string): Promise<void> {
      await request<void>(`/leads/${id}`, { method: "DELETE" });
    },
  },

  // Activities
  activities: {
    async list(completed?: boolean): Promise<Activity[]> {
      const params = new URLSearchParams();
      if (completed !== undefined) params.append("completed", String(completed));
      const query = params.toString() ? `?${params.toString()}` : "";
      const raw = await request<BackendActivity[]>(`/activities${query}`);
      return raw.map(mapBackendActivity);
    },
    async toggleComplete(id: string): Promise<Activity> {
      const raw = await request<BackendActivity>(`/activities/${id}/toggle`, { method: "PATCH" });
      return mapBackendActivity(raw);
    },
  },

  // Members & Memberships
  members: {
    async list(location?: string, status?: string, search?: string): Promise<Member[]> {
      const params = new URLSearchParams();
      if (location && location !== "All Locations") params.append("location", location);
      if (status && status !== "All") params.append("status", status);
      if (search) params.append("search", search);
      const query = params.toString() ? `?${params.toString()}` : "";
      const raw = await request<BackendMember[]>(`/members${query}`);
      return raw.map(mapBackendMember);
    },
    async create(
      member: Omit<Member, "id" | "joinedDate">,
      initialMembership?: Omit<Membership, "id" | "memberId">
    ): Promise<Member> {
      const raw = await request<BackendMember>("/members", {
        method: "POST",
        body: JSON.stringify({
          name: member.name,
          email: member.email,
          phone: member.phone,
          company: member.company || null,
          title: member.title || null,
          home_location: member.homeLocation,
          status: member.status || "Active",
          notes: member.notes || null,
          initial_membership: initialMembership
            ? {
                plan_id: initialMembership.planId,
                plan_name: initialMembership.planName,
                plan_code: initialMembership.planCode,
                monthly_rate_cents: initialMembership.monthlyRateCents,
                currency: initialMembership.currency || "INR",
                billing_interval: initialMembership.billingInterval || "Monthly",
                status: initialMembership.status || "Active",
                start_date: initialMembership.startDate,
                renewal_date: initialMembership.renewalDate,
                assigned_location: initialMembership.assignedLocation,
                desk_or_office_number: initialMembership.deskOrOfficeNumber || null,
              }
            : null,
        }),
      });
      return mapBackendMember(raw);
    },
    async update(member: Member): Promise<Member> {
      const raw = await request<BackendMember>(`/members/${member.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: member.name,
          email: member.email,
          phone: member.phone,
          company: member.company || null,
          title: member.title || null,
          home_location: member.homeLocation,
          status: member.status,
          notes: member.notes || null,
        }),
      });
      return mapBackendMember(raw);
    },
    async delete(id: string): Promise<void> {
      await request<void>(`/members/${id}`, { method: "DELETE" });
    },
    async updateMembershipStatus(membershipId: string, status: string): Promise<Membership> {
      const raw = await request<BackendMembership>(`/members/memberships/${membershipId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      return mapBackendMembership(raw);
    },
    async renewMembership(membershipId: string, nextRenewalDate: string): Promise<Membership> {
      const raw = await request<BackendMembership>(`/members/memberships/${membershipId}/renew`, {
        method: "POST",
        body: JSON.stringify({ next_renewal_date: nextRenewalDate }),
      });
      return mapBackendMembership(raw);
    },
  },

  // Spaces
  spaces: {
    async list(location?: string): Promise<Space[]> {
      const params = new URLSearchParams();
      if (location && location !== "All Locations") params.append("location", location);
      const query = params.toString() ? `?${params.toString()}` : "";
      const raw = await request<BackendSpace[]>(`/spaces${query}`);
      return raw.map(mapBackendSpace);
    },
    async create(space: Omit<Space, "id">): Promise<Space> {
      const raw = await request<BackendSpace>("/spaces", {
        method: "POST",
        body: JSON.stringify({
          location_id: space.locationId,
          location_name: space.locationName,
          name: space.name,
          type: space.type,
          capacity: space.capacity,
          hourly_rate_cents: space.hourlyRateCents,
          amenities: space.amenities,
          floor_or_zone: space.floorOrZone,
          is_active: space.isActive,
          notes: space.notes || null,
        }),
      });
      return mapBackendSpace(raw);
    },
    async update(space: Space): Promise<Space> {
      const raw = await request<BackendSpace>(`/spaces/${space.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: space.name,
          type: space.type,
          capacity: space.capacity,
          hourly_rate_cents: space.hourlyRateCents,
          amenities: space.amenities,
          floor_or_zone: space.floorOrZone,
          is_active: space.isActive,
          notes: space.notes || null,
        }),
      });
      return mapBackendSpace(raw);
    },
    async toggleActive(id: string): Promise<Space> {
      const raw = await request<BackendSpace>(`/spaces/${id}/toggle-active`, { method: "PATCH" });
      return mapBackendSpace(raw);
    },
    async delete(id: string): Promise<void> {
      await request<void>(`/spaces/${id}`, { method: "DELETE" });
    },
  },

  // Bookings
  bookings: {
    async list(location?: string, date?: string, status?: string): Promise<Booking[]> {
      const params = new URLSearchParams();
      if (location && location !== "All Locations") params.append("location", location);
      if (date) params.append("date", date);
      if (status && status !== "All") params.append("status", status);
      const query = params.toString() ? `?${params.toString()}` : "";
      const raw = await request<BackendBooking[]>(`/bookings${query}`);
      return raw.map(mapBackendBooking);
    },
    async checkConflict(
      spaceId: string,
      date: string,
      startTime: string,
      endTime: string,
      excludeBookingId?: string
    ): Promise<BookingConflictCheckResponse> {
      return request<BookingConflictCheckResponse>("/bookings/check-conflict", {
        method: "POST",
        body: JSON.stringify({
          space_id: spaceId,
          date,
          start_time: startTime,
          end_time: endTime,
          exclude_booking_id: excludeBookingId || null,
        }),
      });
    },
    async create(booking: Omit<Booking, "id" | "createdAt">): Promise<Booking> {
      const raw = await request<BackendBooking>("/bookings", {
        method: "POST",
        body: JSON.stringify({
          space_id: booking.spaceId,
          space_name: booking.spaceName,
          location_name: booking.locationName,
          title: booking.title,
          booking_type: booking.bookingType,
          booked_by_name: booking.bookedByName,
          booked_by_email: booking.bookedByEmail,
          member_id: booking.memberId || null,
          lead_id: booking.leadId || null,
          date: booking.date,
          start_time: booking.startTime,
          end_time: booking.endTime,
          attendees_count: booking.attendeesCount,
          status: booking.status || "Confirmed",
          total_cost_cents: booking.totalCostCents || 0,
          credits_used_hours: booking.creditsUsedHours || 0,
          notes: booking.notes || null,
        }),
      });
      return mapBackendBooking(raw);
    },
    async updateStatus(id: string, status: string): Promise<Booking> {
      const raw = await request<BackendBooking>(`/bookings/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      return mapBackendBooking(raw);
    },
    async cancel(id: string): Promise<Booking> {
      const raw = await request<BackendBooking>(`/bookings/${id}/cancel`, { method: "POST" });
      return mapBackendBooking(raw);
    },
    async delete(id: string): Promise<void> {
      await request<void>(`/bookings/${id}`, { method: "DELETE" });
    },
  },

  // Invoices & Billing
  invoices: {
    async list(location?: string, status?: string, search?: string): Promise<Invoice[]> {
      const params = new URLSearchParams();
      if (location && location !== "All Locations") params.append("location", location);
      if (status && status !== "All") params.append("status", status);
      if (search) params.append("search", search);
      const query = params.toString() ? `?${params.toString()}` : "";
      const raw = await request<BackendInvoice[]>(`/invoices${query}`);
      return raw.map(mapBackendInvoice);
    },
    async create(
      invoice: Omit<Invoice, "id" | "createdAt" | "paidAmountCents" | "paymentRecords">
    ): Promise<Invoice> {
      const raw = await request<BackendInvoice>("/invoices", {
        method: "POST",
        body: JSON.stringify({
          invoice_number: invoice.invoiceNumber,
          member_id: invoice.memberId,
          member_name: invoice.memberName,
          member_email: invoice.memberEmail,
          company_name: invoice.companyName || null,
          location_name: invoice.locationName,
          membership_id: invoice.membershipId || null,
          booking_id: invoice.bookingId || null,
          issue_date: invoice.issueDate,
          due_date: invoice.dueDate,
          status: invoice.status || "Open",
          currency: invoice.currency || "INR",
          subtotal_cents: invoice.subtotalCents,
          tax_rate_percent: invoice.taxRatePercent || 18,
          tax_amount_cents: invoice.taxAmountCents,
          total_amount_cents: invoice.totalAmountCents,
          notes: invoice.notes || null,
          line_items: (invoice.lineItems || []).map((li) => ({
            description: li.description,
            quantity: li.quantity,
            unit_price_cents: li.unitPriceCents,
            amount_cents: li.amountCents,
          })),
        }),
      });
      return mapBackendInvoice(raw);
    },
    async recordPayment(
      invoiceId: string,
      payment: {
        amountCents: number;
        paymentMethod: Invoice["paymentRecords"][0]["paymentMethod"];
        transactionRef: string;
        paidAt: string;
        notes?: string;
      }
    ): Promise<Invoice> {
      const raw = await request<BackendInvoice>(`/invoices/${invoiceId}/payments`, {
        method: "POST",
        body: JSON.stringify({
          amount_cents: payment.amountCents,
          payment_method: payment.paymentMethod,
          transaction_ref: payment.transactionRef,
          paid_at: payment.paidAt,
          notes: payment.notes || null,
        }),
      });
      return mapBackendInvoice(raw);
    },
    async void(id: string): Promise<Invoice> {
      const raw = await request<BackendInvoice>(`/invoices/${id}/void`, { method: "POST" });
      return mapBackendInvoice(raw);
    },
    async sendReminder(id: string): Promise<{ success: boolean; message: string }> {
      return request<{ success: boolean; message: string }>(`/invoices/${id}/send-reminder`, {
        method: "POST",
      });
    },
  },

  // Settings
  settings: {
    async getOrganization(): Promise<OrganizationSettings> {
      const raw = await request<BackendOrg>("/settings/organization");
      return mapBackendOrg(raw);
    },
    async updateOrganization(org: Partial<OrganizationSettings>): Promise<OrganizationSettings> {
      const raw = await request<BackendOrg>("/settings/organization", {
        method: "PATCH",
        body: JSON.stringify({
          name: org.name,
          support_email: org.supportEmail,
          default_currency: org.defaultCurrency,
          primary_timezone: org.primaryTimezone,
          tax_id: org.taxId || null,
          website_url: org.websiteUrl,
          auto_assign_leads: org.autoAssignLeads,
          lead_response_goal_hours: org.leadResponseGoalHours,
        }),
      });
      return mapBackendOrg(raw);
    },
    async listLocations(): Promise<Location[]> {
      const raw = await request<BackendLocation[]>("/settings/locations");
      return raw.map(mapBackendLocation);
    },
    async listPlans(): Promise<MembershipPlan[]> {
      const raw = await request<BackendPlan[]>("/settings/plans");
      return raw.map(mapBackendPlan);
    },
    async listStaff(): Promise<StaffMember[]> {
      const raw = await request<BackendStaff[]>("/settings/staff");
      return raw.map(mapBackendStaff);
    },
  },

  // Dashboard & Analytics
  dashboard: {
    async getMetrics(location?: string): Promise<DashboardMetrics> {
      const params = new URLSearchParams();
      if (location && location !== "All Locations") params.append("location", location);
      const query = params.toString() ? `?${params.toString()}` : "";
      return request<DashboardMetrics>(`/dashboard/metrics${query}`);
    },
    async getNotifications(location?: string): Promise<NotificationsSummaryResponse> {
      const params = new URLSearchParams();
      if (location && location !== "All Locations") params.append("location", location);
      const query = params.toString() ? `?${params.toString()}` : "";
      return request<NotificationsSummaryResponse>(`/dashboard/notifications${query}`);
    },
    async getAnalytics(location?: string): Promise<AnalyticsReport> {
      const params = new URLSearchParams();
      if (location && location !== "All Locations") params.append("location", location);
      const query = params.toString() ? `?${params.toString()}` : "";
      return request<AnalyticsReport>(`/dashboard/analytics${query}`);
    },
  },
};
