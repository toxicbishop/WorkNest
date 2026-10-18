import React from "react";
import { AnalyticsDashboard } from "@/features/analytics/AnalyticsDashboard";

export const metadata = {
  title: "Analytics & Occupancy — WorkNest CRM",
  description: "Operations reporting, space utilization, and conversion metrics.",
};

export default function AnalyticsPage() {
  return <AnalyticsDashboard />;
}
