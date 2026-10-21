"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  CalendarCheck2,
  AlertTriangle,
  CheckCircle2,
  Users,
  User,
} from "lucide-react";
import { Booking, BookingType, Space, Location, Member, Lead } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (booking: Omit<Booking, "id" | "createdAt">) => { success: boolean; error?: string };
  spaces: Space[];
  locations: Location[];
  members: Member[];
  leads: Lead[];
  checkConflict: (
    spaceId: string,
    date: string,
    startTime: string,
    endTime: string,
    excludeBookingId?: string
  ) => { hasConflict: boolean; conflictingBooking?: Booking };
  initialDate?: string;
  initialSpaceId?: string;
}

function BookingFormInner({
  onClose,
  onSave,
  spaces,
  locations,
  members,
  leads,
  checkConflict,
  initialDate,
  initialSpaceId,
}: {
  onClose: () => void;
  onSave: (booking: Omit<Booking, "id" | "createdAt">) => { success: boolean; error?: string };
  spaces: Space[];
  locations: Location[];
  members: Member[];
  leads: Lead[];
  checkConflict: (
    spaceId: string,
    date: string,
    startTime: string,
    endTime: string,
    excludeBookingId?: string
  ) => { hasConflict: boolean; conflictingBooking?: Booking };
  initialDate?: string;
  initialSpaceId?: string;
}) {
  const activeSpaces = useMemo(() => spaces.filter((s) => s.isActive), [spaces]);

  const defaultInitialSpace = useMemo(() => {
    if (initialSpaceId) {
      return spaces.find((s) => s.id === initialSpaceId);
    }
    return activeSpaces[0];
  }, [spaces, initialSpaceId, activeSpaces]);

  const [bookingType, setBookingType] = useState<BookingType>("Meeting Room");
  const [selectedLocationName, setSelectedLocationName] = useState<string>(
    defaultInitialSpace?.locationName || locations[0]?.name || "Downtown Hub"
  );

  // Filter spaces matching selected location
  const locationSpaces = useMemo(() => {
    return activeSpaces.filter((s) => s.locationName === selectedLocationName);
  }, [activeSpaces, selectedLocationName]);

  const [selectedSpaceId, setSelectedSpaceId] = useState<string>(
    defaultInitialSpace?.id || locationSpaces[0]?.id || activeSpaces[0]?.id || ""
  );

  const [title, setTitle] = useState("");
  const [date, setDate] = useState<string>(
    initialDate || new Date().toISOString().split("T")[0]
  );
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("11:00");
  const [attendeesCount, setAttendeesCount] = useState(2);
  const [notes, setNotes] = useState("");

  // Customer selection
  const [isLinkedMember, setIsLinkedMember] = useState(true);
  const [selectedMemberId, setSelectedMemberId] = useState<string>(members[0]?.id || "");
  const [selectedLeadId, setSelectedLeadId] = useState<string>(leads[0]?.id || "");
  const [customName, setCustomName] = useState("");
  const [customEmail, setCustomEmail] = useState("");

  const [useCredits, setUseCredits] = useState(false);
  const [formError, setFormError] = useState("");

  const handleLocationChange = (locName: string) => {
    setSelectedLocationName(locName);
    const matching = activeSpaces.filter((s) => s.locationName === locName);
    if (matching.length > 0) {
      setSelectedSpaceId(matching[0].id);
    }
    setFormError("");
  };

  const selectedSpace = useMemo(() => {
    return spaces.find((s) => s.id === selectedSpaceId);
  }, [spaces, selectedSpaceId]);

  // Compute duration in hours
  const durationHours = useMemo(() => {
    if (!startTime || !endTime) return 0;
    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);
    const totalMinutes = endH * 60 + endM - (startH * 60 + startM);
    return Math.max(0, totalMinutes / 60);
  }, [startTime, endTime]);

  // Check real-time conflicts
  const conflictResult: {
    hasConflict: boolean;
    invalidTimes?: boolean;
    conflictingBooking?: Booking;
  } = useMemo(() => {
    if (!selectedSpaceId || !date || !startTime || !endTime) {
      return { hasConflict: false };
    }
    if (startTime >= endTime) {
      return {
        hasConflict: true,
        invalidTimes: true,
      };
    }
    return checkConflict(selectedSpaceId, date, startTime, endTime);
  }, [selectedSpaceId, date, startTime, endTime, checkConflict]);

  // Check capacity
  const isOverCapacity = useMemo(() => {
    if (!selectedSpace) return false;
    return attendeesCount > selectedSpace.capacity;
  }, [selectedSpace, attendeesCount]);

  // Calculate pricing
  const totalCostCents = useMemo(() => {
    if (!selectedSpace) return 0;
    if (bookingType === "Prospect Tour") return 0; // Tours are complimentary
    if (useCredits) return 0;
    return Math.round(durationHours * selectedSpace.hourlyRateCents);
  }, [selectedSpace, durationHours, bookingType, useCredits]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSpace) {
      setFormError("Please select a space.");
      return;
    }

    if (!title.trim()) {
      setFormError("Reservation title is required.");
      return;
    }

    if (startTime >= endTime) {
      setFormError("Start time must be before end time.");
      return;
    }

    if (conflictResult.hasConflict) {
      setFormError(
        `Time slot conflict: ${conflictResult.conflictingBooking?.title || "Another booking"} already occupies this space.`
      );
      return;
    }

    // Determine bookedByName and bookedByEmail
    let bookedByName = customName.trim();
    let bookedByEmail = customEmail.trim();
    let memberId: string | undefined = undefined;
    let leadId: string | undefined = undefined;

    if (bookingType === "Prospect Tour") {
      if (isLinkedMember && selectedLeadId) {
        const lead = leads.find((l) => l.id === selectedLeadId);
        if (lead) {
          bookedByName = lead.name;
          bookedByEmail = lead.email;
          leadId = lead.id;
        }
      }
    } else {
      if (isLinkedMember && selectedMemberId) {
        const member = members.find((m) => m.id === selectedMemberId);
        if (member) {
          bookedByName = member.name;
          bookedByEmail = member.email;
          memberId = member.id;
        }
      }
    }

    if (!bookedByName || !bookedByEmail) {
      setFormError("Attendee name and email are required.");
      return;
    }

    const result = onSave({
      spaceId: selectedSpace.id,
      spaceName: selectedSpace.name,
      locationName: selectedSpace.locationName,
      title: title.trim(),
      bookingType,
      bookedByName,
      bookedByEmail,
      memberId,
      leadId,
      date,
      startTime,
      endTime,
      attendeesCount: Number(attendeesCount),
      status: "Confirmed",
      totalCostCents,
      creditsUsedHours: useCredits ? durationHours : 0,
      notes: notes.trim() || undefined,
    });

    if (result.success) {
      onClose();
    } else {
      setFormError(result.error || "Failed to create booking.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xl border border-neutral-200 overflow-hidden flex flex-col max-h-[92vh]" data-ui="overlay">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50" data-ui="ui-frame">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#20382F]/10 flex items-center justify-center text-[#20382F]">
              <CalendarCheck2 className="w-4 h-4" />
            </div>
            <div>
              <h2 id="booking-modal-title" className="text-base font-semibold text-[#1E2922]">
                New Space Reservation / Tour
              </h2>
              <p className="text-xs text-neutral-500">
                Atomic conflict-prevention engine & instant availability validation
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
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Booking Type Pill Selector */}
          <div>
            <label className="block font-medium text-neutral-700 mb-1.5">
              Reservation Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(["Meeting Room", "Prospect Tour", "Event", "Desk"] as BookingType[]).map(
                (type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setBookingType(type);
                      setFormError("");
                      if (type === "Prospect Tour") {
                        setTitle(`Tour - ${leads[0]?.name || "Prospective Client"}`);
                      } else {
                        setTitle("");
                      }
                    }}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium text-center transition-all ${
                      bookingType === type
                        ? "bg-[#20382F] text-white border-[#20382F] "
                        : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50"
                    }`}
                  >
                    {type}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block font-medium text-neutral-700 mb-1">
              Title / Purpose <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Q4 Strategy Review, Client Pitch, Design Sprint"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setFormError("");
              }}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#20382F]/20 focus:border-[#20382F]"
            />
          </div>

          {/* Location & Space */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                Coworking Hub <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedLocationName}
                onChange={(e) => handleLocationChange(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#20382F]/20 focus:border-[#20382F] bg-white"
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.name}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                Room / Space <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedSpaceId}
                onChange={(e) => {
                  setSelectedSpaceId(e.target.value);
                  setFormError("");
                }}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#20382F]/20 focus:border-[#20382F] bg-white"
              >
                {locationSpaces.length > 0 ? (
                  locationSpaces.map((sp) => (
                    <option key={sp.id} value={sp.id}>
                      {sp.name} ({sp.type} · Cap: {sp.capacity} · ₹{sp.hourlyRateCents / 100}/hr)
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    No active spaces in this location
                  </option>
                )}
              </select>
            </div>
          </div>

          {/* Date, Start Time, End Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setFormError("");
                }}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#20382F]/20 focus:border-[#20382F]"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                Start Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  setFormError("");
                }}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#20382F]/20 focus:border-[#20382F]"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                End Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value);
                  setFormError("");
                }}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#20382F]/20 focus:border-[#20382F]"
              />
            </div>
          </div>

          {/* Real-Time Conflict / Validation Warning Banner */}
          {startTime >= endTime ? (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>Invalid duration: End time must be later than start time.</span>
            </div>
          ) : conflictResult.hasConflict ? (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2 text-xs animate-in fade-in">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <div>
                <span className="font-semibold">Schedule Conflict Detected:</span> This space is
                already reserved by{" "}
                <span className="font-medium underline">
                  {conflictResult.conflictingBooking?.title}
                </span>{" "}
                from{" "}
                <span className="font-semibold">
                  {conflictResult.conflictingBooking?.startTime}
                </span>{" "}
                to{" "}
                <span className="font-semibold">
                  {conflictResult.conflictingBooking?.endTime}
                </span>
                . Please select another time or room.
              </div>
            </div>
          ) : (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center justify-between text-xs animate-in fade-in">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium">Space is available for this slot</span>
              </div>
              <span className="text-neutral-500 text-[11px]">
                Duration: {durationHours} hr{durationHours === 1 ? "" : "s"}
              </span>
            </div>
          )}

          {/* Attendees & Capacity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                Attendees Count <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={attendeesCount}
                onChange={(e) => {
                  setAttendeesCount(Math.max(1, parseInt(e.target.value) || 1));
                  setFormError("");
                }}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#20382F]/20 focus:border-[#20382F]"
              />
            </div>

            {selectedSpace && (
              <div className="flex flex-col justify-end">
                <div
                  className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
                    isOverCapacity
                      ? "bg-amber-50 border-amber-200 text-amber-800"
                      : "bg-neutral-50 border-neutral-200 text-neutral-700"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <span>Room Capacity:</span>
                  </div>
                  <span className="font-bold">{selectedSpace.capacity} people</span>
                </div>
              </div>
            )}
          </div>

          {isOverCapacity && (
            <div className="p-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
              <span>
                Warning: Attendee count ({attendeesCount}) exceeds maximum space capacity (
                {selectedSpace?.capacity}).
              </span>
            </div>
          )}

          {/* Booked By: Member or Lead */}
          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-800 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#20382F]" />
                {bookingType === "Prospect Tour" ? "Prospect Contact" : "Booked By"}
              </span>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1 text-[11px] text-neutral-600 cursor-pointer">
                  <input
                    type="radio"
                    name="linkContact"
                    checked={isLinkedMember}
                    onChange={() => setIsLinkedMember(true)}
                    className="text-[#20382F] focus:ring-[#20382F]"
                  />
                  <span>
                    {bookingType === "Prospect Tour" ? "Existing Lead" : "Existing Member"}
                  </span>
                </label>
                <label className="flex items-center gap-1 text-[11px] text-neutral-600 cursor-pointer">
                  <input
                    type="radio"
                    name="linkContact"
                    checked={!isLinkedMember}
                    onChange={() => setIsLinkedMember(false)}
                    className="text-[#20382F] focus:ring-[#20382F]"
                  />
                  <span>Guest / Manual</span>
                </label>
              </div>
            </div>

            {isLinkedMember ? (
              bookingType === "Prospect Tour" ? (
                <div>
                  <label className="block text-neutral-600 text-[11px] mb-1">
                    Select Lead from Pipeline
                  </label>
                  <select
                    value={selectedLeadId}
                    onChange={(e) => {
                      setSelectedLeadId(e.target.value);
                      setFormError("");
                    }}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-white"
                  >
                    {leads.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name} {l.company ? `(${l.company})` : ""} · {l.interestedPlan}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-neutral-600 text-[11px] mb-1">
                    Select Subscribed Member
                  </label>
                  <select
                    value={selectedMemberId}
                    onChange={(e) => {
                      setSelectedMemberId(e.target.value);
                      setFormError("");
                    }}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-white"
                  >
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} {m.company ? `(${m.company})` : ""} · {m.homeLocation}
                      </option>
                    ))}
                  </select>
                </div>
              )
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-600 text-[11px] mb-1">
                    Contact Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required={!isLinkedMember}
                    placeholder="e.g. Rahul Sharma"
                    value={customName}
                    onChange={(e) => {
                      setCustomName(e.target.value);
                      setFormError("");
                    }}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 text-[11px] mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required={!isLinkedMember}
                    placeholder="e.g. rahul@lumina-ai.dev"
                    value={customEmail}
                    onChange={(e) => {
                      setCustomEmail(e.target.value);
                      setFormError("");
                    }}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Pricing & Credits Summary */}
          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 flex items-center justify-between">
            <div>
              <div className="font-semibold text-neutral-800">Reservation Pricing</div>
              <div className="text-[11px] text-neutral-500">
                {bookingType === "Prospect Tour"
                  ? "Complimentary tour walkthrough"
                  : useCredits
                  ? `Applied ${durationHours} member meeting room credits`
                  : `${durationHours} hrs × ${formatCurrency(
                      selectedSpace?.hourlyRateCents || 0,
                      "INR"
                    )}/hr`}
              </div>
            </div>

            <div className="text-right">
              {bookingType !== "Prospect Tour" && (
                <label className="flex items-center gap-1.5 text-[11px] text-neutral-600 cursor-pointer mb-1 justify-end">
                  <input
                    type="checkbox"
                    checked={useCredits}
                    onChange={(e) => setUseCredits(e.target.checked)}
                    className="rounded border-neutral-300 text-[#20382F] focus:ring-[#20382F] w-3.5 h-3.5"
                  />
                  <span>Use Room Credits</span>
                </label>
              )}
              <div className="text-base font-bold text-[#20382F]">
                {bookingType === "Prospect Tour" || useCredits
                  ? "₹0 (Complimentary)"
                  : formatCurrency(totalCostCents, "INR")}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-medium text-neutral-700 mb-1">
              Setup Instructions & Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Guest badge requirements, HDMI dongle, whiteboards, or catering..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#20382F]/20 focus:border-[#20382F]"
            />
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
              disabled={conflictResult.hasConflict || startTime >= endTime}
              className={`px-4 py-2 rounded-lg transition-colors font-medium flex items-center gap-1.5 ${
                conflictResult.hasConflict || startTime >= endTime
                  ? "bg-neutral-300 text-neutral-500 cursor-not-allowed"
                  : "bg-[#20382F] hover:bg-[#162720] text-white "
              }`}
            >
              <CalendarCheck2 className="w-4 h-4" />
              Confirm Reservation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function BookingModal({
  isOpen,
  onClose,
  onSave,
  spaces,
  locations,
  members,
  leads,
  checkConflict,
  initialDate,
  initialSpaceId,
}: BookingModalProps) {
  if (!isOpen) return null;

  return (
    <BookingFormInner
      key={`${initialDate || "today"}-${initialSpaceId || "default"}`}
      onClose={onClose}
      onSave={onSave}
      spaces={spaces}
      locations={locations}
      members={members}
      leads={leads}
      checkConflict={checkConflict}
      initialDate={initialDate}
      initialSpaceId={initialSpaceId}
    />
  );
}
