"use client";

import React, { useState, useMemo } from "react";
import {
  Building2,
  Plus,
  Search,
  Filter,
  Users,
  CheckCircle2,
  DoorOpen,
} from "lucide-react";
import { useWorkNest } from "@/context/WorkNestContext";
import { Space } from "@/types";
import { SpaceCard } from "./SpaceCard";
import { SpaceModal } from "./SpaceModal";

export function SpacesDirectory() {
  const {
    spaces,
    locations,
    selectedLocation,
    setSelectedLocation,
    addSpace,
    updateSpace,
    deleteSpace,
    toggleSpaceActive,
  } = useWorkNest();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSpace, setEditingSpace] = useState<Space | null>(null);

  // Filter spaces by search query, location, type, and active status
  const filteredSpaces = useMemo(() => {
    return spaces.filter((space) => {
      // Location filter
      if (selectedLocation !== "All" && space.locationName !== selectedLocation) {
        return false;
      }

      // Type filter
      if (selectedType !== "All" && space.type !== selectedType) {
        return false;
      }

      // Active status filter
      if (showActiveOnly && !space.isActive) {
        return false;
      }

      // Search query (name, amenities, floor, notes)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = space.name.toLowerCase().includes(query);
        const matchesLocation = space.locationName.toLowerCase().includes(query);
        const matchesType = space.type.toLowerCase().includes(query);
        const matchesFloor = space.floorOrZone?.toLowerCase().includes(query);
        const matchesAmenities = space.amenities?.some((a) =>
          a.toLowerCase().includes(query)
        );
        if (
          !matchesName &&
          !matchesLocation &&
          !matchesType &&
          !matchesFloor &&
          !matchesAmenities
        ) {
          return false;
        }
      }

      return true;
    });
  }, [spaces, selectedLocation, selectedType, showActiveOnly, searchQuery]);

  // Aggregate stats
  const totalCapacity = useMemo(() => {
    return spaces.reduce((acc, s) => acc + s.capacity, 0);
  }, [spaces]);

  const meetingRoomsCount = useMemo(() => {
    return spaces.filter((s) => s.type === "Meeting Room" || s.type === "Conference Hall").length;
  }, [spaces]);

  const activeSpacesCount = useMemo(() => {
    return spaces.filter((s) => s.isActive).length;
  }, [spaces]);

  const handleOpenAdd = () => {
    setEditingSpace(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (space: Space) => {
    setEditingSpace(space);
    setIsModalOpen(true);
  };

  const handleSaveSpace = (spaceData: Omit<Space, "id"> | Space) => {
    if ("id" in spaceData) {
      updateSpace(spaceData);
    } else {
      addSpace(spaceData);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Inventory Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-neutral-200">
          <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
            <Building2 className="w-4 h-4 text-[#20382F]" />
            <span>Total Spaces</span>
          </div>
          <div className="text-2xl font-bold text-[#1E2922]">{spaces.length}</div>
          <div className="text-[11px] text-neutral-500 mt-0.5">Across {locations.length} locations</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200">
          <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Active & Bookable</span>
          </div>
          <div className="text-2xl font-bold text-emerald-700">{activeSpacesCount}</div>
          <div className="text-[11px] text-neutral-500 mt-0.5">Open for reservation</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200">
          <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
            <DoorOpen className="w-4 h-4 text-blue-600" />
            <span>Meeting Rooms & Pods</span>
          </div>
          <div className="text-2xl font-bold text-blue-700">{meetingRoomsCount}</div>
          <div className="text-[11px] text-neutral-500 mt-0.5">Equipped with AV & screens</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200">
          <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
            <Users className="w-4 h-4 text-indigo-600" />
            <span>Total Seat Capacity</span>
          </div>
          <div className="text-2xl font-bold text-indigo-700">{totalCapacity}</div>
          <div className="text-[11px] text-neutral-500 mt-0.5">People simultaneously</div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex flex-1 flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search spaces, amenities, floors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#20382F]/20 focus:border-[#20382F]"
            />
          </div>

          {/* Location Select */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#20382F]/20 focus:border-[#20382F] bg-white text-neutral-700"
              aria-label="Filter by Location"
            >
              <option value="All">All Locations</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.name}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type Select */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#20382F]/20 focus:border-[#20382F] bg-white text-neutral-700"
              aria-label="Filter by Space Type"
            >
              <option value="All">All Space Types</option>
              <option value="Meeting Room">Meeting Room</option>
              <option value="Conference Hall">Conference Hall</option>
              <option value="Event Space">Event Space</option>
              <option value="Podcast Studio">Podcast Studio</option>
              <option value="Phone Booth">Phone Booth</option>
              <option value="Private Office Suite">Private Office Suite</option>
              <option value="Hot Desk Zone">Hot Desk Zone</option>
              <option value="Dedicated Desk Bay">Dedicated Desk Bay</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 justify-between sm:justify-end">
          <label className="flex items-center gap-1.5 text-xs text-neutral-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showActiveOnly}
              onChange={(e) => setShowActiveOnly(e.target.checked)}
              className="rounded border-neutral-300 text-[#20382F] focus:ring-[#20382F] w-3.5 h-3.5"
            />
            <span>Active only</span>
          </label>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#20382F] hover:bg-[#162720] text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Space
          </button>
        </div>
      </div>

      {/* Spaces Grid */}
      {filteredSpaces.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSpaces.map((space) => (
            <SpaceCard
              key={space.id}
              space={space}
              onEdit={handleOpenEdit}
              onDelete={deleteSpace}
              onToggleActive={toggleSpaceActive}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
          <Building2 className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-neutral-800 mb-1">No spaces found</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-4">
            No rooms or inventory match your current filters. Try resetting filters or adding a new space.
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedType("All");
                setShowActiveOnly(false);
                setSelectedLocation("All");
              }}
              className="px-3 py-1.5 border border-neutral-200 text-neutral-600 rounded-lg text-xs hover:bg-neutral-50"
            >
              Reset Filters
            </button>
            <button
              onClick={handleOpenAdd}
              className="px-3 py-1.5 bg-[#20382F] text-white rounded-lg text-xs font-medium hover:bg-[#162720]"
            >
              Add First Space
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit Space Modal */}
      <SpaceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSpace}
        spaceToEdit={editingSpace}
        locations={locations}
      />
    </div>
  );
}
