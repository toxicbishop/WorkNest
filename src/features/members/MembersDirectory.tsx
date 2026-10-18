"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Building,
  Calendar,
  UserCheck,
  ChevronRight,
  Filter,
} from "lucide-react";
import { Member, Membership, Location, MembershipPlan, MembershipStatus } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { MemberModal } from "@/features/members/MemberModal";
import { MemberDetailModal } from "@/features/members/MemberDetailModal";

interface MembersDirectoryProps {
  members: Member[];
  memberships: Membership[];
  locations: Location[];
  plans: MembershipPlan[];
  selectedLocation: string;
  onAddMember: (
    member: Omit<Member, "id" | "joinedDate">,
    membership?: Omit<Membership, "id" | "memberId">
  ) => void;
  onUpdateMember: (member: Member) => void;
  onDeleteMember: (memberId: string) => void;
  onUpdateStatus: (membershipId: string, status: MembershipStatus) => void;
  onRenew: (membershipId: string, nextRenewalDate: string) => void;
}

export function MembersDirectory({
  members,
  memberships,
  locations,
  plans,
  selectedLocation,
  onAddMember,
  onDeleteMember,
  onUpdateStatus,
  onRenew,
}: MembersDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Map memberId -> active membership
  const membershipMap = useMemo(() => {
    const map = new Map<string, Membership>();
    memberships.forEach((ms) => {
      map.set(ms.memberId, ms);
    });
    return map;
  }, [memberships]);

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      // 1. Location filter
      if (
        selectedLocation !== "All" &&
        member.homeLocation !== selectedLocation
      ) {
        return false;
      }

      const membership = membershipMap.get(member.id);

      // 2. Status filter
      if (statusFilter !== "All") {
        if (membership && membership.status !== statusFilter) {
          return false;
        }
        if (!membership && statusFilter !== "Former") {
          return false;
        }
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = member.name.toLowerCase().includes(q);
        const matchesEmail = member.email.toLowerCase().includes(q);
        const matchesCompany = (member.company || "").toLowerCase().includes(q);
        const matchesPlan = (membership?.planName || "").toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesCompany && !matchesPlan) {
          return false;
        }
      }

      return true;
    });
  }, [members, selectedLocation, statusFilter, searchQuery, membershipMap]);

  const activeMembershipForSelected = selectedMember
    ? membershipMap.get(selectedMember.id)
    : null;

  const getStatusBadge = (status?: MembershipStatus) => {
    switch (status) {
      case "Active":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Trial":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Expiring":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Past Due":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "Cancelled":
      case "Expired":
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, company, email, or plan..."
              className="w-full text-xs pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#20382F] focus:outline-hidden bg-white shadow-2xs"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#20382F] hover:bg-[#162721] rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard Member</span>
          </button>
        </div>
      </div>

      {/* Status Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-gray-400 text-xs font-medium mr-1 flex items-center gap-1 shrink-0">
          <Filter className="w-3.5 h-3.5" /> Status:
        </span>
        <button
          type="button"
          onClick={() => setStatusFilter("All")}
          className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors shrink-0 ${
            statusFilter === "All"
              ? "bg-[#20382F] text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          All Members ({members.length})
        </button>
        {["Active", "Trial", "Expiring", "Past Due", "Cancelled"].map((st) => {
          const count = members.filter(
            (m) => membershipMap.get(m.id)?.status === st
          ).length;
          const isSelected = statusFilter === st;
          return (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors shrink-0 ${
                isSelected
                  ? "bg-[#20382F] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {st} ({count})
            </button>
          );
        })}
      </div>

      {/* Members Table */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F7F8F6] border-b border-[#E5E7EB] text-[#5A6860] font-medium">
                <th scope="col" className="px-5 py-3.5">Member & Company</th>
                <th scope="col" className="px-5 py-3.5">Plan & Monthly Fee</th>
                <th scope="col" className="px-5 py-3.5">Home Branch</th>
                <th scope="col" className="px-5 py-3.5">Contract Status</th>
                <th scope="col" className="px-5 py-3.5">Renewal Date</th>
                <th scope="col" className="px-5 py-3.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[#1E2922]">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => {
                  const ms = membershipMap.get(member.id);
                  return (
                    <tr
                      key={member.id}
                      onClick={() => setSelectedMember(member)}
                      className="hover:bg-gray-50/70 transition-colors cursor-pointer group"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#20382F]/10 text-[#20382F] flex items-center justify-center font-bold text-xs shrink-0">
                            {member.name.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 group-hover:text-[#20382F] flex items-center gap-1.5">
                              {member.name}
                              {member.leadId && (
                                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                                  Converted
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#5A6860] mt-0.5">
                              {member.company || member.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        {ms ? (
                          <div>
                            <div className="font-medium text-gray-900">{ms.planName}</div>
                            <div className="text-[11px] text-emerald-800 font-semibold mt-0.5">
                              {formatCurrency(ms.monthlyRateCents)} / mo
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">No Active Plan</span>
                        )}
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1 text-gray-700">
                          <Building className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          {member.homeLocation}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        {ms ? (
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${getStatusBadge(
                              ms.status
                            )}`}
                          >
                            {ms.status}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                            Former
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3.5">
                        {ms ? (
                          <div className="flex items-center gap-1 text-[#5A6860]">
                            <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span>{formatDate(ms.renewalDate)}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-[#20382F] group-hover:underline">
                          View
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    <UserCheck className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm font-medium">No members found</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Try clearing search filters or onboard your first member.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Onboard Member Modal */}
      <MemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={onAddMember}
        locations={locations}
        plans={plans}
      />

      {/* Member Details & Renewal Modal */}
      <MemberDetailModal
        isOpen={!!selectedMember}
        member={selectedMember}
        membership={activeMembershipForSelected}
        onClose={() => setSelectedMember(null)}
        onUpdateStatus={onUpdateStatus}
        onRenew={onRenew}
        onDeleteMember={onDeleteMember}
      />
    </div>
  );
}
