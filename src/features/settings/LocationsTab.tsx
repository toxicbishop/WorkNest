"use client";

import React, { useState } from "react";
import {
  MapPin,
  Plus,
  Clock,
  Phone,
  User,
  Users,
  Edit2,
  Trash2,
  AlertCircle,
  X,
  Check,
} from "lucide-react";
import { Location } from "@/types";

interface LocationsTabProps {
  locations: Location[];
  onAddLocation: (loc: Omit<Location, "id">) => void;
  onUpdateLocation: (loc: Location) => void;
  onDeleteLocation: (locId: string) => void;
}

export function LocationsTab({
  locations,
  onAddLocation,
  onUpdateLocation,
  onDeleteLocation,
}: LocationsTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLoc, setEditingLoc] = useState<Location | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [timezone, setTimezone] = useState("America/Los_Angeles");
  const [operatingHours, setOperatingHours] = useState("Mon - Fri: 8:00 AM - 8:00 PM");
  const [totalCapacity, setTotalCapacity] = useState(100);
  const [phone, setPhone] = useState("");
  const [managerName, setManagerName] = useState("");
  const [status, setStatus] = useState<Location["status"]>("Active");
  const [formError, setFormError] = useState("");

  const openAddModal = () => {
    setEditingLoc(null);
    setName("");
    setAddress("");
    setCity("");
    setState("");
    setZip("");
    setTimezone("America/Los_Angeles");
    setOperatingHours("Mon - Fri: 8:00 AM - 8:00 PM");
    setTotalCapacity(100);
    setPhone("");
    setManagerName("");
    setStatus("Active");
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (loc: Location) => {
    setEditingLoc(loc);
    setName(loc.name);
    setAddress(loc.address);
    setCity(loc.city);
    setState(loc.state);
    setZip(loc.zip);
    setTimezone(loc.timezone);
    setOperatingHours(loc.operatingHours);
    setTotalCapacity(loc.totalCapacity);
    setPhone(loc.phone);
    setManagerName(loc.managerName);
    setStatus(loc.status);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim() || !city.trim() || !managerName.trim()) {
      setFormError("Please fill out all required location details.");
      return;
    }

    if (editingLoc) {
      onUpdateLocation({
        ...editingLoc,
        name: name.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim() || "CA",
        zip: zip.trim(),
        timezone,
        operatingHours,
        totalCapacity: Number(totalCapacity) || 50,
        phone: phone.trim(),
        managerName: managerName.trim(),
        status,
      });
    } else {
      onAddLocation({
        name: name.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim() || "CA",
        zip: zip.trim(),
        timezone,
        operatingHours,
        totalCapacity: Number(totalCapacity) || 50,
        currentOccupancyRate: 0,
        phone: phone.trim(),
        managerName: managerName.trim(),
        status,
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, locName: string) => {
    if (locations.length <= 1) {
      alert("At least one active location is required for the co-working network.");
      return;
    }
    if (confirm(`Are you sure you want to remove '${locName}'? Leads and data linked to this location should be reviewed.`)) {
      onDeleteLocation(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-[#1E2922]">
            Co-working Locations ({locations.length})
          </h2>
          <p className="text-xs text-[#5A6860] mt-0.5">
            Configure branches, building operating hours, capacity limits, and local management staff.
          </p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg text-white bg-[#20382F] hover:bg-[#162721] transition-colors focus:ring-2 focus:ring-[#20382F] focus:ring-offset-2"
        >
          <Plus className="w-4 h-4" />
          Add Location
        </button>
      </div>

      {/* Location Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {locations.map((loc) => (
          <div
            key={loc.id}
            className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-gray-300 transition-all"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-[#20382F]/10 text-[#20382F]">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#1E2922]">{loc.name}</h3>
                    <p className="text-xs text-[#5A6860]">{loc.city}, {loc.state}</p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                    loc.status === "Active"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : loc.status === "Maintenance"
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-gray-100 text-gray-700 border border-gray-200"
                  }`}
                >
                  {loc.status}
                </span>
              </div>

              {/* Details List */}
              <div className="mt-4 space-y-2 text-xs text-[#5A6860]">
                <div className="flex items-start gap-2">
                  <span className="font-medium text-gray-700 shrink-0">Address:</span>
                  <span className="truncate">{loc.address}, {loc.zip}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="truncate">{loc.operatingHours}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span>{loc.phone || "No phone listed"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span>Manager: <strong className="text-gray-700 font-medium">{loc.managerName}</strong></span>
                </div>
              </div>

              {/* Capacity & Occupancy indicator */}
              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[#5A6860] flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    Capacity: {loc.totalCapacity} desks
                  </span>
                  <span className="font-semibold text-[#1E2922]">{loc.currentOccupancyRate}% Occupied</span>
                </div>
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#20382F] h-1.5 rounded-full transition-all"
                    style={{ width: `${Math.min(100, loc.currentOccupancyRate)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => openEditModal(loc)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDelete(loc.id, loc.name)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors"
                title="Delete Location"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Location Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="location-modal-title"
        >
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-[#F7F8F6]">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#20382F]" />
                <h3 id="location-modal-title" className="text-sm font-semibold text-[#1E2922]">
                  {editingLoc ? `Edit Location: ${editingLoc.name}` : "Add New Co-working Location"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-md text-gray-400 hover:text-gray-600 focus:outline-hidden"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-[#1E2922] mb-1">
                    Location Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Marina Arts Loft"
                    className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20382F] focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-[#1E2922] mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 700 S Grand Ave, 4th Floor"
                    className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20382F] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#1E2922] mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Los Angeles"
                    className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20382F] focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-[#1E2922] mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="CA"
                      className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20382F] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#1E2922] mb-1">
                      ZIP
                    </label>
                    <input
                      type="text"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      placeholder="90017"
                      className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20382F] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#1E2922] mb-1">
                    Operating Hours
                  </label>
                  <input
                    type="text"
                    value={operatingHours}
                    onChange={(e) => setOperatingHours(e.target.value)}
                    placeholder="Mon - Fri: 8:00 AM - 8:00 PM"
                    className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20382F] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#1E2922] mb-1">
                    Timezone
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20382F] focus:outline-hidden bg-white"
                  >
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#1E2922] mb-1">
                    Total Desk Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={totalCapacity}
                    onChange={(e) => setTotalCapacity(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20382F] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#1E2922] mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Location["status"])}
                    className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20382F] focus:outline-hidden bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Coming Soon">Coming Soon</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#1E2922] mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 80 4567 8900"
                    className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20382F] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#1E2922] mb-1">
                    Branch Manager Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20382F] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-hidden"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#20382F] hover:bg-[#162721] rounded-lg transition-colors focus:ring-2 focus:ring-[#20382F]"
                >
                  <Check className="w-4 h-4" />
                  {editingLoc ? "Save Changes" : "Create Location"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
