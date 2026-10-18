import React from "react";
import { DashboardMetrics, LeadStatus } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface PipelineBreakdownProps {
  pipelineCounts: DashboardMetrics["pipelineCounts"];
}

const STAGE_ORDER: LeadStatus[] = [
  "New",
  "Contacted",
  "Tour Booked",
  "Converted",
  "Lost",
];

const STAGE_COLORS: Record<LeadStatus, string> = {
  New: "bg-blue-500",
  Contacted: "bg-amber-500",
  "Tour Booked": "bg-purple-500",
  Converted: "bg-emerald-500",
  Lost: "bg-rose-500",
};

export function PipelineBreakdown({ pipelineCounts }: PipelineBreakdownProps) {
  const total = Object.values(pipelineCounts).reduce((acc, count) => acc + count, 0);

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[#1E2922]">Lead Pipeline Distribution</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Active funnel by operational stage ({total} total prospects tracked)
          </p>
        </div>
      </div>

      {/* Progress Bar Distribution */}
      <div className="w-full h-3 rounded-full overflow-hidden flex bg-gray-100 my-4" aria-label="Pipeline distribution bar">
        {STAGE_ORDER.map((stage) => {
          const count = pipelineCounts[stage] || 0;
          const percentage = total > 0 ? (count / total) * 100 : 0;
          if (percentage === 0) return null;

          return (
            <div
              key={stage}
              style={{ width: `${percentage}%` }}
              className={`${STAGE_COLORS[stage]} h-full transition-all duration-300`}
              title={`${stage}: ${count} (${Math.round(percentage)}%)`}
            />
          );
        })}
      </div>

      {/* Stage Grid Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
        {STAGE_ORDER.map((stage) => {
          const count = pipelineCounts[stage] || 0;
          const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

          return (
            <div
              key={stage}
              className="p-3 rounded-lg border border-gray-100 bg-[#F7F8F6] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <StatusBadge status={stage} />
              </div>
              <div className="mt-3">
                <div className="text-lg font-bold text-gray-900">{count}</div>
                <div className="text-[11px] text-gray-500">{percentage}% of total</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
