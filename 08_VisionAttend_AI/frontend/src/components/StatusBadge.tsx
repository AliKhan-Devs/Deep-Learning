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
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
      style: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    LATE: {
      label: "Late Arrival",
      icon: <Clock className="w-3.5 h-3.5 text-amber-600" />,
      style: "bg-amber-50 text-amber-700 border-amber-200",
    },
    DEPARTURE: {
      label: "Departure",
      icon: <LogOut className="w-3.5 h-3.5 text-blue-600" />,
      style: "bg-blue-50 text-blue-700 border-blue-200",
    },
    HALF_DAY: {
      label: "Half-Day",
      icon: <AlertTriangle className="w-3.5 h-3.5 text-purple-600" />,
      style: "bg-purple-50 text-purple-700 border-purple-200",
    },
    ABSENT: {
      label: "Absent",
      icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />,
      style: "bg-rose-50 text-rose-700 border-rose-200",
    },
  };

  const current = configs[norm] || {
    label: norm,
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />,
    style: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md border ${
        current.style
      } ${size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"}`}
    >
      {current.icon}
      <span>{current.label}</span>
    </span>
  );
};
