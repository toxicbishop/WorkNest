"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users2,
  CalendarCheck2,
  UserCheck,
  Building2,
  Receipt,
  Settings,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    phase: "Phase 1",
    available: true,
  },
  {
    name: "Leads Pipeline",
    href: "/leads",
    icon: Users2,
    phase: "Phase 1",
    available: true,
  },
  {
    name: "Members",
    href: "/members",
    icon: UserCheck,
    phase: "Phase 3",
    available: false,
    badge: "Phase 3",
  },
  {
    name: "Bookings & Tours",
    href: "/bookings",
    icon: CalendarCheck2,
    phase: "Phase 4",
    available: false,
    badge: "Phase 4",
  },
  {
    name: "Spaces & Inventory",
    href: "/spaces",
    icon: Building2,
    phase: "Phase 4",
    available: false,
    badge: "Phase 4",
  },
  {
    name: "Invoices & Billing",
    href: "/billing",
    icon: Receipt,
    phase: "Phase 5",
    available: false,
    badge: "Phase 5",
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    phase: "Phase 2",
    available: true,
  },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#20382F] text-white flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Main Navigation"
      >
        {/* Brand header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 font-bold">
              W
            </div>
            <div>
              <span className="font-semibold tracking-tight text-lg text-white">
                WorkNest
              </span>
              <span className="ml-1 text-[10px] text-emerald-400 font-medium uppercase tracking-wider">
                CRM
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/10 lg:hidden"
            aria-label="Close navigation sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Location switcher mock context */}
        <div className="px-4 py-3 border-b border-white/10 bg-black/15">
          <label className="text-[11px] font-medium text-gray-300 block mb-1 uppercase tracking-wider">
            Workspace Scope
          </label>
          <div className="flex items-center justify-between text-xs text-emerald-200 bg-white/5 border border-white/10 rounded px-2.5 py-1.5">
            <span className="truncate">Downtown Hub (HQ)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Active location" />
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-medium text-gray-400 uppercase tracking-wider">
            Operations
          </div>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            if (!item.available) {
              return (
                <div
                  key={item.name}
                  className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg text-gray-400 hover:text-gray-300 hover:bg-white/5 cursor-not-allowed transition-colors"
                  title={`${item.name} is scheduled for ${item.phase}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-gray-500 group-hover:text-gray-400 shrink-0" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-gray-400">
                      {item.badge}
                    </span>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={cn(
                  "flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "bg-emerald-600/30 text-white border border-emerald-500/30 font-semibold"
                    : "text-gray-200 hover:text-white hover:bg-white/10"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "w-4 h-4 shrink-0",
                      isActive ? "text-emerald-300" : "text-gray-400"
                    )}
                  />
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer profile info */}
        <div className="p-4 border-t border-white/10 bg-black/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-700/60 flex items-center justify-center text-xs font-semibold text-emerald-100 border border-emerald-500/30">
              MV
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">Marcus Vance</p>
              <p className="text-[11px] text-gray-400 truncate">Community Manager</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
