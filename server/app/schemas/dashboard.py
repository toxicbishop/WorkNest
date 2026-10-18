from typing import Dict, List, Optional
from pydantic import BaseModel


class DefinitionNotes(BaseModel):
    activeMembers: str
    openLeads: str
    toursScheduled: str
    mrr: str


class DashboardMetricsResponse(BaseModel):
    activeMembers: int
    openLeads: int
    toursScheduledThisWeek: int
    mrrCents: int
    pipelineCounts: Dict[str, int]
    isDemoData: bool = False
    definitionNotes: DefinitionNotes


class NotificationItem(BaseModel):
    id: str
    type: str  # task, invoice, tour, system
    title: str
    description: str
    timestamp: str
    read: bool
    urgency: str  # high, medium, low
    link: str


class NotificationsSummaryResponse(BaseModel):
    items: List[NotificationItem]
    unread_count: int


# Phase 7 Analytics & Occupancy Reporting Schemas
class LocationOccupancy(BaseModel):
    location_id: str
    location_name: str
    capacity: int
    occupancy_rate: int
    active_members_count: int
    total_spaces_count: int


class ConversionAnalytics(BaseModel):
    total_leads: int
    converted_leads: int
    lost_leads: int
    open_leads: int
    conversion_rate_percent: float
    lead_sources: Dict[str, int]


class SpaceUtilization(BaseModel):
    space_id: str
    space_name: str
    location_name: str
    type: str
    bookings_count: int
    booked_hours: float


class RevenueAnalytics(BaseModel):
    mrr_cents: int
    total_invoiced_cents: int
    collected_revenue_cents: int
    outstanding_cents: int
    active_memberships: int
    churned_memberships: int
    retention_rate_percent: float


class AnalyticsReportResponse(BaseModel):
    generated_at: str
    selected_location: str
    occupancy: List[LocationOccupancy]
    conversion: ConversionAnalytics
    utilization: List[SpaceUtilization]
    revenue: RevenueAnalytics
