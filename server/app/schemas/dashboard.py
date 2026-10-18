from typing import Dict, List
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
