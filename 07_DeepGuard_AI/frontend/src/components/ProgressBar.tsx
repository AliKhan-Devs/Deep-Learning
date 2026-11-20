import React from "react";

interface ProgressBarProps {
  progress: number;
  label?: string;
  color?: "sky" | "emerald" | "rose";
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label,
  color = "sky",
}) => {
  const colorMap = {
    sky: "bg-blue-600",
    emerald: "bg-emerald-600",
    rose: "bg-red-600",
  };

  const clamped = Math.max(0, Math.min(100, progress));

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
          <span>{label}</span>
          <span>{clamped}%</span>
        </div>
      )}
      <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden border border-slate-300/50">
        <div
          className={`h-full rounded-full transition-all duration-300 ${colorMap[color]}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
