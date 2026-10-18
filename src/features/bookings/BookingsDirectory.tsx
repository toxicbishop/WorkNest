"use client";

import React, { useState, useMemo } from "react";
import {
  CalendarCheck2,
  Plus,
  Search,
  Filter,
  Clock,
  MapPin,
  Building2,
  Users,
  CheckCircle2,
  Calendar,
  IndianRupee,
  Compass,
} from "lucide-react";
import { useWorkNest } from "@/context/WorkNestContext";
import { BookingStatus, BookingType } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { BookingModal } from "./BookingModal";

export function BookingsDirectory() {
  const {
    bookings,
    spaces,
    locations,
    members,
    leads,
    selectedLocation,
    setSelectedLocation,
    checkBookingConflict,
    createBooking,
    updateBookingStatus,
    cancelBooking,
    deleteBooking,
  } = useWorkNest();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [dateFilter, setDateFilter] = useState<"All" | "Today" | "Upcoming" | "Past">("All");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Today in YYYY-MM-DD
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Filtered Bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // Location filter
      if (selectedLocation !== "All" && b.locationName !== selectedLocation) {
        return false;
      }

      // Type filter
      if (selectedType !== "All" && b.bookingType !== selectedType) {
        return false;
      }

      // Status filter
      if (selectedStatus !== "All" && b.status !== selectedStatus) {
        return false;
      }

      // Date filter
      if (dateFilter === "Today" && b.date !== todayStr) {
        return false;
      }
      if (dateFilter === "Upcoming" && b.date < todayStr) {
        return false;
      }
      if (dateFilter === "Past" && b.date >= todayStr) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = b.title.toLowerCase().includes(q);
        const matchesName = b.bookedByName.toLowerCase().includes(q);
        const matchesEmail = b.bookedByEmail.toLowerCase().includes(q);
        const matchesSpace = b.spaceName.toLowerCase().includes(q);
        const matchesLoc = b.locationName.toLowerCase().includes(q);
        if (!matchesTitle && !matchesName && !matchesEmail && !matchesSpace && !matchesLoc) {
          return false;
        }
      }

      return true;
    });
  }, [bookings, selectedLocation, selectedType, selectedStatus, dateFilter, searchQuery, todayStr]);

  // Aggregate Stats
  const todayBookingsCount = useMemo(() => {
    return bookings.filter((b) => b.date === todayStr && b.status !== "Cancelled").length;
  }, [bookings, todayStr]);

  const activeCheckedInCount = useMemo(() => {
    return bookings.filter((b) => b.status === "Checked In").length;
  }, [bookings]);

  const upcomingToursCount = useMemo(() => {
    return bookings.filter((b) => b.bookingType === "Prospect Tour" && b.status === "Confirmed").length;
  }, [bookings]);

  const totalRevenuePaise = useMemo(() => {
    return bookings
      .filter((b) => b.status !== "Cancelled" && b.status !== "No Show")
      .reduce((sum, b) => sum + b.totalCostCents, 0);
  }, [bookings]);

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case "Confirmed":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Checked In":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Completed":
        return "bg-neutral-100 text-neutral-700 border-neutral-200";
      case "Cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      case "No Show":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-neutral-100 text-neutral-600 border-neutral-200";
    }
  };

  const getTypeBadge = (type: BookingType) => {
    switch (type) {
      case "Meeting Room":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "Prospect Tour":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Event":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Desk":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-neutral-50 text-neutral-700 border-neutral-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Operations KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-neutral-200">
          <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
            <Calendar className="w-4 h-4 text-[#20382F]" />
            <span>Today&apos;s Reservations</span>
          </div>
          <div className="text-2xl font-bold text-[#1E2922]">{todayBookingsCount}</div>
          <div className="text-[11px] text-neutral-500 mt-0.5">Scheduled for today</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200">
          <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Checked In Now</span>
          </div>
          <div className="text-2xl font-bold text-emerald-700">{activeCheckedInCount}</div>
          <div className="text-[11px] text-neutral-500 mt-0.5">Currently occupying space</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200">
          <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
            <Compass className="w-4 h-4 text-blue-600" />
            <span>Prospect Walkthroughs</span>
          </div>
          <div className="text-2xl font-bold text-blue-700">{upcomingToursCount}</div>
          <div className="text-[11px] text-neutral-500 mt-0.5">Lead tour bookings</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200">
          <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
            <IndianRupee className="w-4 h-4 text-amber-600" />
            <span>Booking Volume</span>
          </div>
          <div className="text-2xl font-bold text-[#1E2922]">
            {formatCurrency(totalRevenuePaise, "INR")}
          </div>
          <div className="text-[11px] text-neutral-500 mt-0.5">Recognized space bookings</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex flex-1 flex-col sm:flex-row gap-3 items-stretch sm:items-center flex-wrap">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search title, member, space, location..."
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
              aria-label="Filter by Hub Location"
            >
              <option value="All">All Coworking Hubs</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.name}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Booking Type Select */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#20382F]/20 focus:border-[#20382F] bg-white text-neutral-700"
              aria-label="Filter by Booking Type"
            >
              <option value="All">All Types</option>
              <option value="Meeting Room">Meeting Room</option>
              <option value="Prospect Tour">Prospect Tour</option>
              <option value="Event">Event Space</option>
              <option value="Desk">Desk Booking</option>
            </select>
          </div>

          {/* Status Select */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#20382F]/20 focus:border-[#20382F] bg-white text-neutral-700"
              aria-label="Filter by Status"
            >
              <option value="All">All Statuses</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Checked In">Checked In</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="No Show">No Show</option>
            </select>
          </div>

          {/* Date Filter Pills */}
          <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg text-xs">
            {(["All", "Today", "Upcoming", "Past"] as const).map((period) => (
              <button
                key={period}
                onClick={() => setDateFilter(period)}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  dateFilter === period
                    ? "bg-white text-[#20382F] shadow-xs"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-[#20382F] hover:bg-[#162720] text-white text-xs font-medium rounded-lg transition-colors shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          New Reservation
        </button>
      </div>

      {/* Bookings Table / List */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        {filteredBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-50/75 border-b border-neutral-200 text-neutral-500 font-medium">
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Space & Location</th>
                  <th className="py-3 px-4">Title & Type</th>
                  <th className="py-3 px-4">Attendee / Customer</th>
                  <th className="py-3 px-4 text-center">Attendees</th>
                  <th className="py-3 px-4">Cost / Credits</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-neutral-50/50 transition-colors">
                    {/* Date & Time */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-neutral-900">{b.date}</div>
                      <div className="text-[11px] text-neutral-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-neutral-400" />
                        <span>
                          {b.startTime} - {b.endTime}
                        </span>
                      </div>
                    </td>

                    {/* Space & Location */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-neutral-900 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <span>{b.spaceName}</span>
                      </div>
                      <div className="text-[11px] text-neutral-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                        <span>{b.locationName}</span>
                      </div>
                    </td>

                    {/* Title & Type */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-neutral-900 line-clamp-1">{b.title}</div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${getTypeBadge(
                            b.bookingType
                          )}`}
                        >
                          {b.bookingType}
                        </span>
                        {b.notes && (
                          <span
                            className="text-[10px] text-neutral-400 truncate max-w-[150px]"
                            title={b.notes}
                          >
                            · {b.notes}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Attendee / Customer */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-neutral-900">{b.bookedByName}</div>
                      <div className="text-[11px] text-neutral-500">{b.bookedByEmail}</div>
                      {b.memberId ? (
                        <span className="inline-block mt-0.5 text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded font-medium border border-indigo-100">
                          Member
                        </span>
                      ) : b.leadId ? (
                        <span className="inline-block mt-0.5 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-medium border border-emerald-100">
                          Lead Walkthrough
                        </span>
                      ) : null}
                    </td>

                    {/* Attendees Count */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded font-medium">
                        <Users className="w-3 h-3 text-neutral-400" />
                        {b.attendeesCount}
                      </span>
                    </td>

                    {/* Cost / Credits */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {b.creditsUsedHours > 0 ? (
                        <div className="text-neutral-700 font-medium">
                          {b.creditsUsedHours} hrs credit
                        </div>
                      ) : (
                        <div className="font-semibold text-[#20382F]">
                          {formatCurrency(b.totalCostCents, "INR")}
                        </div>
                      )}
                      <div className="text-[10px] text-neutral-400">
                        {b.bookingType === "Prospect Tour" ? "Free Tour" : "Billed"}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full font-medium border ${getStatusBadge(
                          b.status
                        )}`}
                      >
                        {b.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {b.status === "Confirmed" && (
                          <button
                            onClick={() => updateBookingStatus(b.id, "Checked In")}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded font-medium text-[11px] transition-colors"
                          >
                            Check In
                          </button>
                        )}

                        {b.status === "Checked In" && (
                          <button
                            onClick={() => updateBookingStatus(b.id, "Completed")}
                            className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded font-medium text-[11px] transition-colors"
                          >
                            Complete
                          </button>
                        )}

                        {b.status !== "Cancelled" && b.status !== "Completed" && (
                          <button
                            onClick={() => cancelBooking(b.id)}
                            className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-[11px] transition-colors font-medium"
                          >
                            Cancel
                          </button>
                        )}

                        {b.status === "Cancelled" && (
                          <button
                            onClick={() => deleteBooking(b.id)}
                            className="text-neutral-400 hover:text-red-600 p-1 text-[11px] transition-colors"
                            title="Delete Record"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <CalendarCheck2 className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-neutral-800 mb-1">
              No reservations found
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-4">
              No bookings match your current filter parameters. Try clearing filters or create a new reservation.
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedType("All");
                  setSelectedStatus("All");
                  setDateFilter("All");
                  setSelectedLocation("All");
                }}
                className="px-3 py-1.5 border border-neutral-200 text-neutral-600 rounded-lg text-xs hover:bg-neutral-50"
              >
                Reset Filters
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-3 py-1.5 bg-[#20382F] text-white rounded-lg text-xs font-medium hover:bg-[#162720]"
              >
                New Reservation
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={createBooking}
        spaces={spaces}
        locations={locations}
        members={members}
        leads={leads}
        checkConflict={checkBookingConflict}
      />
    </div>
  );
}
