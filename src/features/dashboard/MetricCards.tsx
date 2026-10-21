import React from "react";
import { Users, UserPlus, Calendar, IndianRupee, Info } from "lucide-react";
import { DashboardMetrics } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface MetricCardsProps {
  metrics: DashboardMetrics;
}

export function MetricCards({ metrics }: MetricCardsProps) {
  const cards = [
    {
      title: "Active Members",
      value: metrics.activeMembers.toLocaleString(),
      definition: metrics.definitionNotes.activeMembers,
      icon: Users,
      trend: "Across 3 network locations",
      color: "text-emerald-700 bg-emerald-50 border-emerald-200",
    },
    {
      title: "Open Pipeline Leads",
      value: metrics.openLeads.toString(),
      definition: metrics.definitionNotes.openLeads,
      icon: UserPlus,
      trend: "Inquiry to Tour Booked",
      color: "text-blue-700 bg-blue-50 border-blue-200",
    },
    {
      title: "Tours Scheduled (7d)",
      value: metrics.toursScheduledThisWeek.toString(),
      definition: metrics.definitionNotes.toursScheduled,
      icon: Calendar,
      trend: "Scheduled walkthroughs",
      color: "text-emerald-700 bg-emerald-50 border-emerald-200",
    },
    {
      title: "Recognized MRR",
      value: formatCurrency(metrics.mrrCents),
      definition: metrics.definitionNotes.mrr,
      icon: IndianRupee,
      trend: "Active subscription billing",
      color: "text-amber-700 bg-amber-50 border-amber-200",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="bg-white rounded-xl border border-[#E5E7EB] p-5  relative flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                  <span>{card.title}</span>
                  <span
                    className="cursor-help text-gray-400 hover:text-gray-600"
                    title={card.definition}
                  >
                    <Info className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="text-2xl font-bold tracking-tight text-[#1E2922] mt-2">
                  {card.value}
                </div>
              </div>
              <div className={`p-2.5 rounded-lg border ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500" data-ui="ui-frame">
              <span>{card.trend}</span>
              <span className="tabular-nums text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                DEMO
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
