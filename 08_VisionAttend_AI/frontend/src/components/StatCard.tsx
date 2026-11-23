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
    indigo: "text-indigo-600 bg-indigo-50 border-indigo-100",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
    amber: "text-amber-600 bg-amber-50 border-amber-100",
    rose: "text-rose-600 bg-rose-50 border-rose-100",
    sky: "text-sky-600 bg-sky-50 border-sky-100",
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-slate-300 hover:shadow transition-all flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        <div className={`p-2 rounded-lg border ${colorMap[color]}`}>{icon}</div>
      </div>

      <div className="mt-4">
        <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          {value}
        </div>
        {subtitle && (
          <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
            <span>{subtitle}</span>
            {trend && <span className="font-semibold text-emerald-600">{trend}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
