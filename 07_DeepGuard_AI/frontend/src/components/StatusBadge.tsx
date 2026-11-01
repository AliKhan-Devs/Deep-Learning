import React from "react";

interface StatusBadgeProps {
  status?: string;
  size?: "sm" | "md" | "lg";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status = "UNKNOWN", size = "md" }) => {
  const s = status.toLowerCase();

  let colorClass = "bg-slate-800 text-slate-300 border-slate-700";
  let label = status;

  if (s.includes("manipulated") || s === "fake") {
    colorClass = "bg-rose-950/70 text-rose-300 border-rose-600/50";
    label = "Likely Manipulated";
  } else if (s.includes("authentic") || s === "real") {
    colorClass = "bg-emerald-950/70 text-emerald-300 border-emerald-600/50";
    label = "Likely Authentic";
  } else if (s.includes("inconclusive")) {
    colorClass = "bg-amber-950/70 text-amber-300 border-amber-600/50";
    label = "Inconclusive";
  } else if (s === "processing" || s === "pending") {
    colorClass = "bg-sky-950/70 text-sky-300 border-sky-600/50 animate-pulse";
    label = s === "processing" ? "Processing..." : "Queued";
  } else if (s === "failed") {
    colorClass = "bg-red-950/70 text-red-300 border-red-600/50";
    label = "Failed";
  }

  const sizeClasses = {
    sm: "px-2.5 py-0.5 text-xs",
    md: "px-3 py-1 text-xs sm:text-sm font-semibold",
    lg: "px-4 py-1.5 text-sm sm:text-base font-bold",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-sm ${sizeClasses[size]} ${colorClass}`}
    >
      <span
        className={`w-2 h-2 rounded-full ${
          s.includes("manipulated")
            ? "bg-rose-500"
            : s.includes("authentic")
            ? "bg-emerald-500"
            : s.includes("inconclusive")
            ? "bg-amber-500"
            : "bg-sky-400"
        }`}
      />
      {label}
    </span>
  );
};
