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
    sky: "bg-sky-500",
    emerald: "bg-emerald-500",
    rose: "bg-rose-500",
  };

  const clamped = Math.max(0, Math.min(100, progress));

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
          <span>{label}</span>
          <span>{clamped}%</span>
        </div>
      )}
      <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700/50">
        <div
          className={`h-full rounded-full transition-all duration-300 ${colorMap[color]}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
