"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  UserPlus,
  Clock,
  X,
  Compass,
} from "lucide-react";
import { useWorkNest } from "@/context/WorkNestContext";
import { formatCurrency } from "@/lib/utils";

interface NotificationItem {
  id: string;
  type: "lead" | "activity" | "tour" | "invoice" | "renewal";
  title: string;
  description: string;
  timestamp: string;
  href: string;
  severity: "info" | "warning" | "urgent";
}

export function NotificationDropdown() {
  const { leads, activities, bookings, invoices, memberships } = useWorkNest();
  const [isOpen, setIsOpen] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Compute live notifications from system state
  const allNotifications = useMemo(() => {
    const list: NotificationItem[] = [];

    // 1. Overdue follow-up tasks
    activities
      .filter((a) => !a.completed)
      .slice(0, 3)
      .forEach((act) => {
        list.push({
          id: `notif-act-${act.id}`,
          type: "activity",
          title: act.title,
          description: `Follow-up assigned to ${act.staffName}: ${act.description}`,
          timestamp: "Action Required",
          href: "/leads",
          severity: "warning",
        });
      });

    // 2. Overdue Invoices
    invoices
      .filter(
        (inv) =>
          inv.status === "Overdue" ||
          (inv.dueDate < todayStr && inv.paidAmountCents < inv.totalAmountCents && inv.status !== "Void")
      )
      .slice(0, 3)
      .forEach((inv) => {
        const bal = inv.totalAmountCents - inv.paidAmountCents;
        list.push({
          id: `notif-inv-${inv.id}`,
          type: "invoice",
          title: `Overdue Invoice: ${inv.invoiceNumber}`,
          description: `${formatCurrency(bal, "INR")} pending collection from ${inv.memberName}.`,
          timestamp: `Due: ${inv.dueDate}`,
          href: "/billing",
          severity: "urgent",
        });
      });

    // 3. Upcoming prospect walkthrough tours
    bookings
      .filter((b) => b.bookingType === "Prospect Tour" && b.status === "Confirmed")
      .slice(0, 2)
      .forEach((tour) => {
        list.push({
          id: `notif-tour-${tour.id}`,
          type: "tour",
          title: `Scheduled Walkthrough: ${tour.bookedByName}`,
          description: `Tour at ${tour.spaceName} (${tour.locationName}) on ${tour.date} at ${tour.startTime}.`,
          timestamp: `${tour.date} · ${tour.startTime}`,
          href: "/bookings",
          severity: "info",
        });
      });

    // 4. New prospect inquiry leads
    leads
      .filter((l) => l.status === "New")
      .slice(0, 2)
      .forEach((l) => {
        list.push({
          id: `notif-lead-${l.id}`,
          type: "lead",
          title: `New Lead: ${l.name}`,
          description: `Inquired about ${l.interestedPlan} at ${l.preferredLocation}.`,
          timestamp: "Just Now",
          href: "/leads",
          severity: "info",
        });
      });

    // 5. Expiring memberships
    memberships
      .filter((m) => m.status === "Past Due" || m.status === "Expiring")
      .slice(0, 2)
      .forEach((m) => {
        list.push({
          id: `notif-mship-${m.id}`,
          type: "renewal",
          title: `Membership ${m.status}: ${m.planName}`,
          description: `Renewal scheduled for ${m.renewalDate}. Review payment status.`,
          timestamp: m.renewalDate,
          href: "/members",
          severity: "warning",
        });
      });

    return list;
  }, [activities, invoices, bookings, leads, memberships, todayStr]);

  const activeNotifications = useMemo(() => {
    return allNotifications.filter((n) => !dismissedIds.includes(n.id));
  }, [allNotifications, dismissedIds]);

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setDismissedIds((prev) => [...prev, id]);
  };

  const handleMarkAllRead = () => {
    setDismissedIds(allNotifications.map((n) => n.id));
  };

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "invoice":
        return <Receipt className="w-4 h-4 text-amber-700" />;
      case "activity":
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case "tour":
        return <Compass className="w-4 h-4 text-blue-600" />;
      case "lead":
        return <UserPlus className="w-4 h-4 text-emerald-600" />;
      case "renewal":
        return <Clock className="w-4 h-4 text-purple-600" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-[#20382F] transition-colors"
        aria-label="Notifications"
        aria-expanded={isOpen}
        title={`${activeNotifications.length} operational notifications`}
      >
        <span className="relative inline-flex items-center justify-center">
          <Bell className="w-5 h-5" />
          {activeNotifications.length > 0 && (
            <span
              className="absolute -top-1 -right-1.5 min-w-[15px] h-[15px] px-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-bold leading-none flex items-center justify-center ring-2 ring-white pointer-events-none shadow-xs"
              aria-hidden="true"
            >
              {activeNotifications.length > 99 ? "99+" : activeNotifications.length}
            </span>
          )}
        </span>
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-neutral-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          {/* Header */}
          <div className="px-4 py-3 bg-neutral-50/80 border-b border-neutral-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs text-[#1E2922]">
                Notifications & Alerts
              </span>
              <span className="text-[10px] bg-neutral-200 text-neutral-700 px-1.5 py-0.5 rounded-full font-medium">
                {activeNotifications.length} active
              </span>
            </div>

            {activeNotifications.length > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] text-[#20382F] hover:text-[#162720] font-medium flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Clear All
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-neutral-100">
            {activeNotifications.length > 0 ? (
              activeNotifications.map((notif) => (
                <Link
                  key={notif.id}
                  href={notif.href}
                  onClick={() => setIsOpen(false)}
                  className="p-3.5 hover:bg-neutral-50/80 transition-colors flex items-start gap-3 block group"
                >
                  <div className="p-2 rounded-lg bg-neutral-100 shrink-0 mt-0.5">
                    {getIcon(notif.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="text-xs font-semibold text-neutral-900 group-hover:text-[#20382F] truncate">
                        {notif.title}
                      </h4>
                      <button
                        onClick={(e) => handleDismiss(notif.id, e)}
                        className="text-neutral-400 hover:text-neutral-600 p-0.5 rounded transition-colors"
                        title="Dismiss"
                        aria-label="Dismiss notification"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-[11px] text-neutral-600 line-clamp-2 mt-0.5">
                      {notif.description}
                    </p>
                    <div className="text-[10px] text-neutral-400 mt-1 font-medium">
                      {notif.timestamp}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-8 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2 opacity-80" />
                <h5 className="text-xs font-semibold text-neutral-800">All caught up!</h5>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  No pending follow-ups, overdue invoices, or scheduled tours requiring attention.
                </p>
              </div>
            )}
          </div>

          {/* Footer Link */}
          <div className="p-2.5 bg-neutral-50/50 border-t border-neutral-100 text-center">
            <span className="text-[11px] text-neutral-500">
              WorkNest Automated Operational Alerts
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
