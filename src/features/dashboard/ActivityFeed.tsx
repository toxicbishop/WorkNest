"use client";

import React from "react";
import {
  PhoneCall,
  Mail,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Users,
} from "lucide-react";
import { Activity, ActivityType } from "@/types";
import { formatDate } from "@/lib/utils";
import { useCurrentTimestamp } from "@/lib/useCurrentTimestamp";

interface ActivityFeedProps {
  activities: Activity[];
  onToggleComplete: (activityId: string) => void;
}

const activityIcons: Record<ActivityType, React.ElementType> = {
  call: PhoneCall,
  email: Mail,
  tour: Calendar,
  meeting: Users,
  note: FileText,
  task: CheckCircle2,
};

export function ActivityFeed({ activities, onToggleComplete }: ActivityFeedProps) {
  const currentTimestamp = useCurrentTimestamp();

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 ">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[#1E2922]">Follow-ups & Scheduled Tasks</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Pending tour walkthroughs, discovery calls, and outreach
          </p>
        </div>
        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
          {activities.filter((a) => !a.completed).length} pending
        </span>
      </div>

      <div className="divide-y divide-gray-100" data-ui="ui-list">
        {activities.map((act) => {
          const Icon = activityIcons[act.type] || CheckCircle2;
          const isOverdue =
            !act.completed &&
            currentTimestamp > 0 &&
            new Date(act.dueDate).getTime() < currentTimestamp;

          return (
            <div
              key={act.id}
              className={`py-3.5 flex items-start justify-between gap-3 transition-opacity ${
                act.completed ? "opacity-60" : ""
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => onToggleComplete(act.id)}
                  className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                    act.completed
                      ? "bg-emerald-600 border-emerald-600 text-white"
                      : "border-gray-300 hover:border-[#20382F] text-neutral-900"
                  }`}
                  aria-label={act.completed ? "Mark incomplete" : "Mark complete"}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Icon className="w-3.5 h-3.5 text-gray-500 shrink-0" aria-hidden="true" />
                    <span
                      className={`text-xs font-semibold text-gray-900 ${
                        act.completed ? "line-through text-gray-500" : ""
                      }`}
                    >
                      {act.title}
                    </span>
                    {isOverdue && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        OVERDUE
                      </span>
                    )}
                  </div>

                  {act.leadName && (
                    <p className="text-[11px] text-[#20382F] font-medium mt-0.5">
                      {act.leadName}
                    </p>
                  )}

                  {act.description && (
                    <p className="text-xs text-gray-600 mt-1">{act.description}</p>
                  )}

                  <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-1.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      Due {formatDate(act.dueDate)}
                    </span>
                    <span>•</span>
                    <span>Owner: {act.staffName}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
