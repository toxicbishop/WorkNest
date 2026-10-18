import React from "react";
import { Info } from "lucide-react";

export function DemoBanner() {
  return (
    <div
      role="status"
      className="bg-[#EBF3EF] border-b border-[#C8DFD2] px-4 py-2 text-xs text-[#20382F] flex items-center justify-between"
    >
      <div className="flex items-center gap-2">
        <Info className="w-4 h-4 text-[#20382F] shrink-0" aria-hidden="true" />
        <span>
          <strong>Phase 1 UI Prototype:</strong> All metrics, leads, and follow-ups shown are fixtures. Live database persistence begins in Phase 2.
        </span>
      </div>
      <span className="hidden sm:inline-block font-mono bg-white/70 px-2 py-0.5 rounded text-[11px] border border-[#C8DFD2]">
        MOCK DATA MODE
      </span>
    </div>
  );
}
