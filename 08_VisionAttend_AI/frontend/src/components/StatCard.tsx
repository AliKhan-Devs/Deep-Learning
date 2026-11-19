import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  color?: "indigo" | "emerald" | "amber" | "rose" | "sky";
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = "indigo",
}) => {
  const colorMap = {
    indigo: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    rose: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    sky: "text-sky-400 bg-sky-500/10 border-sky-500/20",
  };

  return (
    <div className="saas-card p-5 saas-card-hover flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <div className={`p-2 rounded-xl border ${colorMap[color]}`}>{icon}</div>
      </div>

      <div className="mt-4">
        <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {value}
        </div>
        {subtitle && (
          <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
            <span>{subtitle}</span>
            {trend && <span className="font-semibold text-emerald-400">{trend}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
