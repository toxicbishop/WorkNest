"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Building,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  PieChart as PieIcon,
  CheckCircle2,
} from "lucide-react";
import { useWorkNest } from "@/context/WorkNestContext";
import { apiClient, AnalyticsReport } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";

export function AnalyticsDashboard() {
  const { selectedLocation, locations, leads, members, memberships, spaces, bookings, invoices } = useWorkNest();
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isLiveApi, setIsLiveApi] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function loadAnalytics() {
      setLoading(true);
      try {
        const isHealthy = await apiClient.checkHealth();
        if (isHealthy) {
          const liveReport = await apiClient.dashboard.getAnalytics(selectedLocation);
          if (isMounted) {
            setReport(liveReport);
            setIsLiveApi(true);
            setLoading(false);
            return;
          }
        }
      } catch {
        // Fallback to client-computed analytics
      }

      // Client-side fallback computation
      const filteredLocations =
        selectedLocation === "All" || selectedLocation === "All Locations"
          ? locations
          : locations.filter((l) => l.name === selectedLocation);

      const filteredLeads =
        selectedLocation === "All" || selectedLocation === "All Locations"
          ? leads
          : leads.filter((l) => l.preferredLocation === selectedLocation);

      const filteredSpaces =
        selectedLocation === "All" || selectedLocation === "All Locations"
          ? spaces
          : spaces.filter((s) => s.locationName === selectedLocation);

      const filteredBookings =
        selectedLocation === "All" || selectedLocation === "All Locations"
          ? bookings
          : bookings.filter((b) => b.locationName === selectedLocation);

      const filteredInvoices =
        selectedLocation === "All" || selectedLocation === "All Locations"
          ? invoices
          : invoices.filter((i) => i.locationName === selectedLocation);

      const filteredMemberships =
        selectedLocation === "All" || selectedLocation === "All Locations"
          ? memberships
          : memberships.filter((m) => m.assignedLocation === selectedLocation);

      const totalLeads = filteredLeads.length;
      const converted = filteredLeads.filter((l) => l.status === "Converted").length;
      const lost = filteredLeads.filter((l) => l.status === "Lost").length;
      const open = filteredLeads.filter((l) => ["New", "Contacted", "Tour Booked"].includes(l.status)).length;
      const convRate = totalLeads > 0 ? (converted / totalLeads) * 100 : 0;

      const sources: Record<string, number> = {};
      filteredLeads.forEach((l) => {
        const src = l.source || "Other";
        sources[src] = (sources[src] || 0) + 1;
      });

      const activeM = filteredMemberships.filter((m) => m.status === "Active").length;
      const churnedM = filteredMemberships.filter((m) => ["Cancelled", "Expired"].includes(m.status)).length;
      const totalCont = activeM + churnedM;
      const retRate = totalCont > 0 ? (activeM / totalCont) * 100 : 100;

      const mrr = filteredMemberships
        .filter((m) => m.status === "Active")
        .reduce((sum, m) => sum + m.monthlyRateCents, 0);

      const totalInvoiced = filteredInvoices
        .filter((i) => i.status !== "Void")
        .reduce((sum, i) => sum + i.totalAmountCents, 0);

      const collected = filteredInvoices
        .filter((i) => i.status !== "Void")
        .reduce((sum, i) => sum + i.paidAmountCents, 0);

      const fallbackReport: AnalyticsReport = {
        generated_at: new Date().toISOString(),
        selected_location: selectedLocation,
        occupancy: filteredLocations.map((loc) => ({
          location_id: loc.id,
          location_name: loc.name,
          capacity: loc.totalCapacity,
          occupancy_rate: loc.currentOccupancyRate,
          active_members_count: members.filter((m) => m.homeLocation === loc.name && m.status === "Active").length,
          total_spaces_count: spaces.filter((s) => s.locationId === loc.id).length,
        })),
        conversion: {
          total_leads: totalLeads,
          converted_leads: converted,
          lost_leads: lost,
          open_leads: open,
          conversion_rate_percent: Number(convRate.toFixed(1)),
          lead_sources: sources,
        },
        utilization: filteredSpaces.map((sp) => {
          const spBookings = filteredBookings.filter(
            (b) => b.spaceId === sp.id && ["Confirmed", "Checked In", "Completed"].includes(b.status)
          );
          let hours = 0;
          spBookings.forEach((b) => {
            const [sh, sm] = b.startTime.split(":").map(Number);
            const [eh, em] = b.endTime.split(":").map(Number);
            hours += Math.max(0, (eh * 60 + em - (sh * 60 + sm)) / 60);
          });
          return {
            space_id: sp.id,
            space_name: sp.name,
            location_name: sp.locationName,
            type: sp.type,
            bookings_count: spBookings.length,
            booked_hours: Number(hours.toFixed(1)),
          };
        }),
        revenue: {
          mrr_cents: mrr,
          total_invoiced_cents: totalInvoiced,
          collected_revenue_cents: collected,
          outstanding_cents: Math.max(0, totalInvoiced - collected),
          active_memberships: activeM,
          churned_memberships: churnedM,
          retention_rate_percent: Number(retRate.toFixed(1)),
        },
      };

      if (isMounted) {
        setReport(fallbackReport);
        setIsLiveApi(false);
        setLoading(false);
      }
    }

    loadAnalytics();

    return () => {
      isMounted = false;
    };
  }, [selectedLocation, locations, leads, members, memberships, spaces, bookings, invoices]);

  if (loading || !report) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-4">
        <RefreshCw className="w-8 h-8 text-[#20382F] animate-spin" />
        <p className="text-sm font-medium text-neutral-600">Generating operations & occupancy report...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-neutral-900">Analytics & Occupancy Cockpit</h1>
            {isLiveApi ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live FastAPI Data
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                Client Store
              </span>
            )}
          </div>
          <p className="text-sm text-neutral-500 mt-1">
            Authoritative utilization, customer acquisition velocity, and financial retention metrics.
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs font-medium text-neutral-400">Selected Location Scope</p>
          <p className="text-sm font-semibold text-[#20382F]">{selectedLocation}</p>
        </div>
      </div>

      {/* KPI Top Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 bg-white rounded-2xl border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Conversion Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-neutral-900 mt-2">{report.conversion.conversion_rate_percent}%</p>
          <p className="text-xs text-neutral-500 mt-1">
            {report.conversion.converted_leads} of {report.conversion.total_leads} inquiries converted
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Membership Retention</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-neutral-900 mt-2">{report.revenue.retention_rate_percent}%</p>
          <p className="text-xs text-neutral-500 mt-1">
            {report.revenue.active_memberships} active, {report.revenue.churned_memberships} churned
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Recognized MRR</span>
            <ArrowUpRight className="w-4 h-4 text-[#20382F]" />
          </div>
          <p className="text-2xl font-bold text-neutral-900 mt-2">{formatCurrency(report.revenue.mrr_cents)}</p>
          <p className="text-xs text-neutral-500 mt-1">Contracted recurring run-rate</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Collected Revenue</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-neutral-900 mt-2">
            {formatCurrency(report.revenue.collected_revenue_cents)}
          </p>
          <p className="text-xs text-amber-600 font-medium mt-1">
            {formatCurrency(report.revenue.outstanding_cents)} outstanding
          </p>
        </div>
      </div>

      {/* Location Occupancy Section */}
      <div className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Location Occupancy & Capacity</h2>
            <p className="text-xs text-neutral-500 mt-0.5">Real-time floor occupancy across operating locations.</p>
          </div>
          <Building className="w-5 h-5 text-neutral-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {report.occupancy.map((loc) => (
            <div key={loc.location_id} className="p-5 rounded-xl border border-neutral-100 bg-neutral-50/70">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-neutral-900">{loc.location_name}</h3>
                <span className="text-sm font-bold text-[#20382F]">{loc.occupancy_rate}%</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-neutral-200 rounded-full h-2.5 mt-3 overflow-hidden">
                <div
                  className="bg-[#20382F] h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, loc.occupancy_rate)}%` }}
                />
              </div>

              <div className="flex items-center justify-between mt-4 text-xs text-neutral-500">
                <span>Active Members: {loc.active_members_count}</span>
                <span>Capacity: {loc.capacity} seats</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Conversion Breakdown & Space Utilization Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pipeline & Lead Sources */}
        <div className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">Inquiry Acquisition Sources</h2>
              <p className="text-xs text-neutral-500 mt-0.5">Where high-converting prospects originate.</p>
            </div>
            <PieIcon className="w-5 h-5 text-neutral-400" />
          </div>

          <div className="space-y-3">
            {Object.entries(report.conversion.lead_sources).map(([src, count]) => {
              const pct = report.conversion.total_leads > 0 ? (count / report.conversion.total_leads) * 100 : 0;
              return (
                <div key={src} className="flex items-center justify-between p-3 rounded-lg bg-neutral-50">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-[#20382F]" />
                    <span className="text-sm font-medium text-neutral-800">{src}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-neutral-500">{pct.toFixed(0)}%</span>
                    <span className="text-sm font-bold text-neutral-900">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-neutral-100 text-center">
            <div className="p-2.5 rounded-lg bg-emerald-50">
              <p className="text-xs text-emerald-700 font-medium">Converted</p>
              <p className="text-lg font-bold text-emerald-900 mt-0.5">{report.conversion.converted_leads}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-blue-50">
              <p className="text-xs text-blue-700 font-medium">In Pipeline</p>
              <p className="text-lg font-bold text-blue-900 mt-0.5">{report.conversion.open_leads}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-neutral-100">
              <p className="text-xs text-neutral-600 font-medium">Lost</p>
              <p className="text-lg font-bold text-neutral-800 mt-0.5">{report.conversion.lost_leads}</p>
            </div>
          </div>
        </div>

        {/* Space Utilization */}
        <div className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">Meeting Room & Space Utilization</h2>
              <p className="text-xs text-neutral-500 mt-0.5">Booking intensity and booked hours per facility.</p>
            </div>
            <Clock className="w-5 h-5 text-neutral-400" />
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[340px] pr-1">
            {report.utilization.map((sp) => (
              <div key={sp.space_id} className="p-3.5 rounded-xl border border-neutral-100 bg-neutral-50/80">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-900">{sp.space_name}</h4>
                    <p className="text-xs text-neutral-500">
                      {sp.location_name} • {sp.type}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-[#20382F]">{sp.booked_hours} hrs</span>
                    <p className="text-xs text-neutral-400">{sp.bookings_count} bookings</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
