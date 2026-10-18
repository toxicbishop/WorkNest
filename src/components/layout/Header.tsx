"use client";

import React from "react";
import { Menu, Plus, MapPin, Bell } from "lucide-react";

interface HeaderProps {
  onOpenSidebar: () => void;
  onOpenNewLead?: () => void;
  selectedLocation: string;
  onLocationChange: (loc: string) => void;
}

export function Header({
  onOpenSidebar,
  onOpenNewLead,
  selectedLocation,
  onLocationChange,
}: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-[#E5E7EB] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 lg:hidden focus:outline-hidden focus:ring-2 focus:ring-[#20382F]"
          aria-label="Open navigation sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Location Selector */}
        <div className="flex items-center gap-2 bg-[#F7F8F6] border border-[#E5E7EB] rounded-lg px-2.5 py-1.5 text-xs text-[#1E2922]">
          <MapPin className="w-3.5 h-3.5 text-[#5A6860] shrink-0" aria-hidden="true" />
          <label htmlFor="location-select" className="sr-only">
            Select Location Scope
          </label>
          <select
            id="location-select"
            value={selectedLocation}
            onChange={(e) => onLocationChange(e.target.value)}
            className="bg-transparent font-medium text-[#1E2922] focus:outline-hidden cursor-pointer"
          >
            <option value="All">All Locations (Network)</option>
            <option value="Downtown Hub">Downtown Hub</option>
            <option value="Westside Commons">Westside Commons</option>
            <option value="Tech District">Tech District</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="relative p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-hidden focus:ring-2 focus:ring-[#20382F]"
          aria-label="Notifications"
          title="3 active notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-600 ring-2 ring-white" />
        </button>

        {onOpenNewLead && (
          <button
            type="button"
            onClick={onOpenNewLead}
            className="inline-flex items-center gap-1.5 bg-[#20382F] hover:bg-[#172A23] text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-xs transition-colors focus:outline-hidden focus:ring-2 focus:ring-[#20382F] focus:ring-offset-2"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Lead</span>
            <span className="sm:hidden">Add</span>
          </button>
        )}
      </div>
    </header>
  );
}
