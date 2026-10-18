"use client";

import React, { useState } from "react";
import {
  Users,
  MapPin,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  Sparkles,
  Layers,
} from "lucide-react";
import { Space } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface SpaceCardProps {
  space: Space;
  onEdit: (space: Space) => void;
  onDelete: (spaceId: string) => void;
  onToggleActive: (spaceId: string) => void;
}

export function SpaceCard({
  space,
  onEdit,
  onDelete,
  onToggleActive,
}: SpaceCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const getTypeColor = (type: Space["type"]) => {
    switch (type) {
      case "Meeting Room":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Conference Hall":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Event Space":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Podcast Studio":
        return "bg-pink-50 text-pink-700 border-pink-200";
      case "Phone Booth":
        return "bg-teal-50 text-teal-700 border-teal-200";
      case "Private Office Suite":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Hot Desk Zone":
      case "Dedicated Desk Bay":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      default:
        return "bg-neutral-50 text-neutral-700 border-neutral-200";
    }
  };

  return (
    <div
      className={`bg-white rounded-xl border transition-all hover:shadow-md flex flex-col justify-between ${
        space.isActive ? "border-neutral-200" : "border-neutral-200 opacity-75 bg-neutral-50/50"
      }`}
    >
      <div className="p-5">
        {/* Header / Type / Status */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${getTypeColor(
                  space.type
                )}`}
              >
                {space.type}
              </span>
              <span
                className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                  space.isActive
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-neutral-100 text-neutral-600 border border-neutral-200"
                }`}
              >
                {space.isActive ? (
                  <>
                    <CheckCircle2 className="w-3 h-3" />
                    Available
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3" />
                    Inactive
                  </>
                )}
              </span>
            </div>
            <h3 className="text-base font-semibold text-[#1E2922] group-hover:text-[#20382F]">
              {space.name}
            </h3>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-[#20382F]">
              {formatCurrency(space.hourlyRateCents, "INR")}
            </div>
            <div className="text-[11px] text-neutral-500">per hour</div>
          </div>
        </div>

        {/* Location & Floor */}
        <div className="flex items-center gap-3 text-xs text-neutral-600 mb-3 flex-wrap">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-neutral-400" />
            <span>{space.locationName}</span>
          </div>
          {space.floorOrZone && (
            <div className="flex items-center gap-1 text-neutral-500">
              <Layers className="w-3.5 h-3.5 text-neutral-400" />
              <span>{space.floorOrZone}</span>
            </div>
          )}
        </div>

        {/* Capacity */}
        <div className="flex items-center gap-2 text-xs font-medium text-neutral-700 bg-neutral-50 px-3 py-2 rounded-lg mb-3 border border-neutral-100">
          <Users className="w-4 h-4 text-neutral-500" />
          <span>Capacity:</span>
          <span className="font-semibold text-neutral-900">{space.capacity} people</span>
        </div>

        {/* Amenities */}
        {space.amenities && space.amenities.length > 0 && (
          <div className="space-y-1.5 mb-3">
            <div className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-neutral-400" />
              Amenities & Equipment
            </div>
            <div className="flex flex-wrap gap-1.5">
              {space.amenities.map((amenity, i) => (
                <span
                  key={i}
                  className="text-[11px] bg-neutral-100/80 text-neutral-700 px-2 py-0.5 rounded-md border border-neutral-200/60"
                >
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {space.notes && (
          <p className="text-xs text-neutral-500 italic mt-2 line-clamp-2">
            &ldquo;{space.notes}&rdquo;
          </p>
        )}
      </div>

      {/* Footer Actions */}
      <div className="px-5 py-3 border-t border-neutral-100 bg-neutral-50/50 rounded-b-xl flex items-center justify-between text-xs">
        <button
          onClick={() => onToggleActive(space.id)}
          className={`font-medium transition-colors ${
            space.isActive
              ? "text-neutral-500 hover:text-amber-700"
              : "text-emerald-700 hover:text-emerald-800"
          }`}
        >
          {space.isActive ? "Mark Inactive" : "Mark Active"}
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(space)}
            className="p-1.5 text-neutral-500 hover:text-[#20382F] hover:bg-white rounded-md transition-all border border-transparent hover:border-neutral-200"
            title="Edit Space"
            aria-label={`Edit ${space.name}`}
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>

          {confirmDelete ? (
            <div className="flex items-center gap-1 bg-red-50 p-1 rounded border border-red-200">
              <span className="text-[10px] text-red-700 font-medium">Delete?</span>
              <button
                onClick={() => onDelete(space.id)}
                className="text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded font-medium hover:bg-red-700"
              >
                Yes
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-[10px] text-neutral-600 px-1 py-0.5 hover:text-neutral-900"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
              title="Delete Space"
              aria-label={`Delete ${space.name}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
