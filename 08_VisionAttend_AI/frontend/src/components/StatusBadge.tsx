import React from "react";
import { CheckCircle2, Clock, AlertTriangle, LogOut } from "lucide-react";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = "md" }) => {
  const norm = status.toUpperCase();

  const configs: Record<string, { label: string; icon: React.ReactNode; style: string }> = {
    ON_TIME: {
      label: "On-Time",
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      style: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    },
    LATE: {
      label: "Late Arrival",
      icon: <Clock className="w-3.5 h-3.5" />,
      style: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    },
    DEPARTURE: {
      label: "Departure",
      icon: <LogOut className="w-3.5 h-3.5" />,
      style: "bg-sky-500/15 text-sky-400 border-sky-500/30",
    },
    HALF_DAY: {
      label: "Half-Day",
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
      style: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    },
    ABSENT: {
      label: "Absent",
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
      style: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    },
  };

  const current = configs[norm] || {
    label: norm,
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    style: "bg-slate-800 text-slate-300 border-slate-700",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-lg border ${
        current.style
      } ${size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"}`}
    >
      {current.icon}
      <span>{current.label}</span>
    </span>
  );
};
