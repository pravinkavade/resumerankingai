import React, { useState } from "react";
import { ApplicationStatus } from "../types/index.js";
import { ChevronDown, Check } from "lucide-react";

interface StatusBadgeProps {
  status: ApplicationStatus;
  applicationId?: string;
  onStatusChange?: (newStatus: ApplicationStatus) => void;
  editable?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  onStatusChange,
  editable = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const statusConfig: Record<
    ApplicationStatus,
    { label: string; bg: string; text: string; dot: string; border: string }
  > = {
    Applied: {
      label: "Applied",
      bg: "bg-indigo-500/15",
      text: "text-indigo-300",
      dot: "bg-indigo-400",
      border: "border-indigo-500/30",
    },
    Screened: {
      label: "Screened",
      bg: "bg-sky-500/15",
      text: "text-sky-300",
      dot: "bg-sky-400",
      border: "border-sky-500/30",
    },
    Shortlisted: {
      label: "Shortlisted",
      bg: "bg-emerald-500/15",
      text: "text-emerald-300",
      dot: "bg-emerald-400",
      border: "border-emerald-500/30",
    },
    Interview: {
      label: "Interview",
      bg: "bg-amber-500/15",
      text: "text-amber-300",
      dot: "bg-amber-400",
      border: "border-amber-500/30",
    },
    Offer: {
      label: "Offer Extended",
      bg: "bg-violet-500/15",
      text: "text-violet-300",
      dot: "bg-violet-400",
      border: "border-violet-500/30",
    },
    Rejected: {
      label: "Declined",
      bg: "bg-rose-500/15",
      text: "text-rose-300",
      dot: "bg-rose-400",
      border: "border-rose-500/30",
    },
  };

  const current = statusConfig[status] || statusConfig.Applied;
  const allStatuses: ApplicationStatus[] = [
    "Applied",
    "Screened",
    "Shortlisted",
    "Interview",
    "Offer",
    "Rejected",
  ];

  const handleSelect = (newStatus: ApplicationStatus, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    if (onStatusChange && newStatus !== status) {
      onStatusChange(newStatus);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        disabled={!editable}
        onClick={(e) => {
          if (!editable) return;
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${current.bg} ${current.text} ${current.border} transition-all backdrop-blur-sm ${
          editable ? "hover:brightness-125 cursor-pointer shadow-sm active:scale-95" : "cursor-default"
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
        <span className="tracking-tight">{current.label}</span>
        {editable && <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />}
      </button>

      {editable && isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
          />
          <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-[#0e1424] border border-white/[0.12] shadow-2xl z-50 py-1.5 text-xs backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100">
            <p className="px-3.5 py-1 text-[10px] uppercase font-bold text-slate-500 tracking-wider font-mono">
              Move Pipeline Stage
            </p>
            {allStatuses.map((st) => {
              const conf = statusConfig[st];
              const isSelected = st === status;
              return (
                <button
                  key={st}
                  onClick={(e) => handleSelect(st, e)}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-left transition-colors hover:bg-white/[0.06] ${
                    isSelected ? "text-violet-400 font-bold bg-violet-500/10" : "text-slate-300"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${conf.dot}`} />
                    <span>{conf.label}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-violet-400" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
