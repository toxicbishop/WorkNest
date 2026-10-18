"use client";

import React, { useState } from "react";
import { Users2, Plus, Mail, Shield, MapPin, Trash2, Edit2, X, Check, AlertCircle } from "lucide-react";
import { StaffMember, Location } from "@/types";

interface TeamTabProps {
  staff: StaffMember[];
  locations: Location[];
  onAddStaffMember: (member: Omit<StaffMember, "id">) => void;
  onUpdateStaffMember: (member: StaffMember) => void;
  onDeleteStaffMember: (staffId: string) => void;
}

export function TeamTab({
  staff,
  locations,
  onAddStaffMember,
  onUpdateStaffMember,
  onDeleteStaffMember,
}: TeamTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<StaffMember["role"]>("Community Manager");
  const [assignedLocation, setAssignedLocation] = useState<string>("All");
  const [status, setStatus] = useState<StaffMember["status"]>("Active");
  const [formError, setFormError] = useState("");

  const openAdd = () => {
    setEditingStaff(null);
    setName("");
    setEmail("");
    setRole("Community Manager");
    setAssignedLocation("All");
    setStatus("Active");
    setFormError("");
    setIsModalOpen(true);
  };

  const openEdit = (member: StaffMember) => {
    setEditingStaff(member);
    setName(member.name);
    setEmail(member.email);
    setRole(member.role);
    setAssignedLocation(member.assignedLocations[0] || "All");
    setStatus(member.status);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setFormError("Staff name and email address are required.");
      return;
    }

    if (editingStaff) {
      onUpdateStaffMember({
        ...editingStaff,
        name: name.trim(),
        email: email.trim(),
        role,
        assignedLocations: [assignedLocation],
        status,
      });
    } else {
      onAddStaffMember({
        name: name.trim(),
        email: email.trim(),
        role,
        assignedLocations: [assignedLocation],
        status,
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, staffName: string) => {
    if (staff.length <= 1) {
      alert("At least one workspace owner or administrator is required.");
      return;
    }
    if (confirm(`Remove access for ${staffName}?`)) {
      onDeleteStaffMember(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-[#1E2922]">
            Team Members & Roles ({staff.length})
          </h2>
          <p className="text-xs text-[#5A6860] mt-0.5">
            Manage staff accounts, administrative roles, and branch assignment permissions.
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg text-white bg-[#20382F] hover:bg-[#162721] transition-colors focus:ring-2 focus:ring-[#20382F]"
        >
          <Plus className="w-4 h-4" />
          Invite Staff Member
        </button>
      </div>

      <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F7F8F6] border-b border-[#E5E7EB] text-[#5A6860] font-medium">
                <th scope="col" className="px-5 py-3.5">Staff Member</th>
                <th scope="col" className="px-5 py-3.5">System Role</th>
                <th scope="col" className="px-5 py-3.5">Assigned Location</th>
                <th scope="col" className="px-5 py-3.5">Status</th>
                <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[#1E2922]">
              {staff.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-5 py-3.5">
                    <div>
                      <div className="font-medium text-[#1E2922]">{member.name}</div>
                      <div className="text-[11px] text-[#5A6860] flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 text-gray-400" />
                        {member.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1 text-gray-700 font-medium">
                      <Shield className="w-3.5 h-3.5 text-gray-400" />
                      {member.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1 text-[#5A6860]">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      {member.assignedLocations.join(", ")}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        member.status === "Active"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : member.status === "Invited"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-gray-100 text-gray-600 border border-gray-200"
                      }`}
                    >
                      {member.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => openEdit(member)}
                      className="p-1 rounded text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
                      title="Edit Staff Member"
                      aria-label={`Edit ${member.name}`}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(member.id, member.name)}
                      className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                      title="Remove Staff Access"
                      aria-label={`Delete ${member.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Dialog */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="team-modal-title"
        >
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-[#F7F8F6]">
              <div className="flex items-center gap-2">
                <Users2 className="w-5 h-5 text-[#20382F]" />
                <h3 id="team-modal-title" className="text-sm font-semibold text-[#1E2922]">
                  {editingStaff ? `Edit: ${editingStaff.name}` : "Invite Staff Member"}
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

              <div>
                <label className="block text-xs font-medium text-[#1E2922] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jordan Hayes"
                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20382F] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1E2922] mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@worknest.co"
                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20382F] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1E2922] mb-1">
                  Role & Permissions
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as StaffMember["role"])}
                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20382F] focus:outline-hidden bg-white"
                >
                  <option value="Community Manager">Community Manager (Operations & Tours)</option>
                  <option value="Sales Lead">Sales Lead (Prospect Qualification & Deals)</option>
                  <option value="Front Desk">Front Desk (Guest Check-in & Rooms)</option>
                  <option value="Workspace Owner">Workspace Owner (Full Administrator)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1E2922] mb-1">
                  Primary Location Scope
                </label>
                <select
                  value={assignedLocation}
                  onChange={(e) => setAssignedLocation(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20382F] focus:outline-hidden bg-white"
                >
                  <option value="All">All Network Locations</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.name}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1E2922] mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as StaffMember["status"])}
                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20382F] focus:outline-hidden bg-white"
                >
                  <option value="Active">Active</option>
                  <option value="Invited">Invited (Pending Confirmation)</option>
                  <option value="Inactive">Inactive / Suspended</option>
                </select>
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
                  {editingStaff ? "Save Member" : "Send Invite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
