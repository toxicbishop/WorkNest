"use client";

import React, { useState } from "react";
import { X, Building2, Check, AlertCircle } from "lucide-react";
import { Space, SpaceType, Location } from "@/types";

interface SpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (space: Omit<Space, "id"> | Space) => void;
  spaceToEdit?: Space | null;
  locations: Location[];
}

const SPACE_TYPES: SpaceType[] = [
  "Meeting Room",
  "Conference Hall",
  "Podcast Studio",
  "Event Space",
  "Phone Booth",
  "Hot Desk Zone",
  "Dedicated Desk Bay",
  "Private Office Suite",
];

const SUGGESTED_AMENITIES = [
  "4K Display",
  "Polycom Video Conf",
  "Zoom Rooms Kit",
  "Whiteboard",
  "High-speed Fiber",
  "Acoustic Insulation",
  "Podcast Microphones",
  "Ceiling Projector",
  "PA Audio System",
  "Air Conditioned",
  "Ergonomic Chairs",
];

function SpaceFormInner({
  onClose,
  onSave,
  spaceToEdit,
  locations,
}: {
  onClose: () => void;
  onSave: (space: Omit<Space, "id"> | Space) => void;
  spaceToEdit?: Space | null;
  locations: Location[];
}) {
  const [name, setName] = useState(spaceToEdit?.name || "");
  const [locationId, setLocationId] = useState(
    spaceToEdit?.locationId || locations[0]?.id || ""
  );
  const [type, setType] = useState<SpaceType>(spaceToEdit?.type || "Meeting Room");
  const [capacity, setCapacity] = useState(spaceToEdit?.capacity || 6);
  const [hourlyRateRupees, setHourlyRateRupees] = useState(
    spaceToEdit ? spaceToEdit.hourlyRateCents / 100 : 800
  );
  const [floorOrZone, setFloorOrZone] = useState(spaceToEdit?.floorOrZone || "");
  const [amenitiesInput, setAmenitiesInput] = useState(
    spaceToEdit?.amenities?.join(", ") || "4K Display, Whiteboard, High-speed Fiber"
  );
  const [isActive, setIsActive] = useState(
    spaceToEdit !== undefined && spaceToEdit !== null ? spaceToEdit.isActive : true
  );
  const [notes, setNotes] = useState(spaceToEdit?.notes || "");
  const [formError, setFormError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("Space name is required.");
      return;
    }
    if (capacity < 1) {
      setFormError("Capacity must be at least 1 person.");
      return;
    }
    if (hourlyRateRupees < 0) {
      setFormError("Hourly rate cannot be negative.");
      return;
    }

    const matchedLocation = locations.find((l) => l.id === locationId) || locations[0];
    const amenities = amenitiesInput
      .split(",")
      .map((a) => a.trim())
      .filter((a) => a.length > 0);

    const spaceData = {
      locationId: matchedLocation.id,
      locationName: matchedLocation.name,
      name: name.trim(),
      type,
      capacity: Number(capacity),
      hourlyRateCents: Math.round(Number(hourlyRateRupees) * 100),
      amenities,
      floorOrZone: floorOrZone.trim(),
      isActive,
      notes: notes.trim() || undefined,
    };

    if (spaceToEdit) {
      onSave({
        ...spaceData,
        id: spaceToEdit.id,
      });
    } else {
      onSave(spaceData);
    }
    onClose();
  };

  const handleAddAmenity = (item: string) => {
    const current = amenitiesInput
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);
    if (!current.includes(item)) {
      setAmenitiesInput(current.concat(item).join(", "));
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-neutral-200 overflow-hidden flex flex-col max-h-[90vh]" data-ui="overlay">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50" data-ui="ui-frame">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#20382F]/10 flex items-center justify-center text-[#20382F]">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 id="modal-title" className="text-base font-semibold text-[#1E2922]">
                {spaceToEdit ? "Edit Space" : "Add New Space"}
              </h2>
              <p className="text-xs text-neutral-500">
                Configure room or desk inventory details & hourly pricing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 p-1 rounded-lg hover:bg-neutral-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 text-xs">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-medium text-neutral-700 mb-1">
                Space Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Kaveri Boardroom, Focus Pod A"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setFormError("");
                }}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#20382F]/20 focus:border-[#20382F]"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                Location <span className="text-red-500">*</span>
              </label>
              <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#20382F]/20 focus:border-[#20382F] bg-white"
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                Space Type <span className="text-red-500">*</span>
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as SpaceType)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#20382F]/20 focus:border-[#20382F] bg-white"
              >
                {SPACE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                Capacity (People) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={capacity}
                onChange={(e) => setCapacity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#20382F]/20 focus:border-[#20382F]"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                Hourly Rate (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="50"
                required
                value={hourlyRateRupees}
                onChange={(e) => setHourlyRateRupees(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#20382F]/20 focus:border-[#20382F]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-medium text-neutral-700 mb-1">
                Floor / Zone
              </label>
              <input
                type="text"
                placeholder="e.g. Floor 12 East Wing, Building C 2nd Floor"
                value={floorOrZone}
                onChange={(e) => setFloorOrZone(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#20382F]/20 focus:border-[#20382F]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-medium text-neutral-700 mb-1">
                Amenities & Equipment
              </label>
              <input
                type="text"
                placeholder="e.g. 4K Screen, Polycom AV, Whiteboard"
                value={amenitiesInput}
                onChange={(e) => setAmenitiesInput(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#20382F]/20 focus:border-[#20382F] mb-1.5"
              />
              <div className="flex flex-wrap gap-1">
                <span className="text-[10px] text-neutral-500 self-center mr-1">Suggested:</span>
                {SUGGESTED_AMENITIES.slice(0, 6).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleAddAmenity(item)}
                    className="text-[10px] bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-1.5 py-0.5 rounded border border-neutral-200 transition-colors"
                  >
                    + {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-medium text-neutral-700 mb-1">
                Operational Notes
              </label>
              <textarea
                rows={2}
                placeholder="Special access instructions, AV setup details, or equipment specs..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#20382F]/20 focus:border-[#20382F]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-neutral-300 text-[#20382F] focus:ring-[#20382F] w-4 h-4"
                />
                <span className="font-medium text-neutral-800">
                  Space is active and open for member bookings & walkthrough tours
                </span>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-2" data-ui="ui-frame">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-neutral-200 rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#20382F] hover:bg-[#162720] text-white rounded-lg transition-colors font-medium flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              {spaceToEdit ? "Save Changes" : "Create Space"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function SpaceModal({
  isOpen,
  onClose,
  onSave,
  spaceToEdit,
  locations,
}: SpaceModalProps) {
  if (!isOpen) return null;

  return (
    <SpaceFormInner
      key={spaceToEdit?.id || "new-space"}
      onClose={onClose}
      onSave={onSave}
      spaceToEdit={spaceToEdit}
      locations={locations}
    />
  );
}
