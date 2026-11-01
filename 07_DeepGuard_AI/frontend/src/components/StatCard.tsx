import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trendColor?: "rose" | "emerald" | "amber" | "sky";
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trendColor = "sky",
}) => {
  const borderColors = {
    rose: "border-rose-500/30 hover:border-rose-500/50",
    emerald: "border-emerald-500/30 hover:border-emerald-500/50",
    amber: "border-amber-500/30 hover:border-amber-500/50",
    sky: "border-sky-500/30 hover:border-sky-500/50",
  };

  const bgIconColors = {
    rose: "bg-rose-500/10 text-rose-400",
    emerald: "bg-emerald-500/10 text-emerald-400",
    amber: "bg-amber-500/10 text-amber-400",
    sky: "bg-sky-500/10 text-sky-400",
  };

  return (
    <div
      className={`relative p-5 rounded-2xl bg-slate-900/90 border transition-all duration-200 shadow-lg ${borderColors[trendColor]}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        {icon && <div className={`p-2.5 rounded-xl ${bgIconColors[trendColor]}`}>{icon}</div>}
      </div>
      <div className="text-3xl font-extrabold text-white tracking-tight">{value}</div>
      {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
    </div>
  );
};
