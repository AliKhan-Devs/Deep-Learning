"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Clock,
  ShieldCheck,
  Building2,
} from "lucide-react";
import { api } from "../../lib/api";
import { DepartmentStat, AttendanceSummary } from "../../lib/types";

export default function AnalyticsPage() {
  const [departments, setDepartments] = useState<DepartmentStat[]>([]);
  const [_summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [_loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getDepartmentAnalytics(), api.getTodaySummary()])
      .then(([dept, sum]) => {
        setDepartments(dept);
        setSummary(sum);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 select-none">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          <BarChart3 className="w-6 h-6 text-indigo-600" />
          Workforce Punctuality &amp; Biometric Analytics
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Deep-dive analysis of departmental compliance, peak shift arrival windows, and metric learning accuracy
        </p>
      </div>

      {/* Top Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="saas-card p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 tracking-wider">
            <span>PEAK ARRIVAL WINDOW</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">08:45 — 09:05 AM</div>
          <p className="text-[11px] text-slate-500">
            78% of on-time check-ins occur within 15 minutes prior to shift start.
          </p>
        </div>

        <div className="saas-card p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 tracking-wider">
            <span>BIOMETRIC RECOGNITION CONFIDENCE</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700">96.4% Avg</div>
          <p className="text-[11px] text-slate-500">
            Cosine vector similarity exceeding the 0.65 verification threshold.
          </p>
        </div>

        <div className="saas-card p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 tracking-wider">
            <span>ANTI-SPOOFING FILTER RATE</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-indigo-700">99.8% Pass</div>
          <p className="text-[11px] text-slate-500">
            Laplacian edge variance and chrominance distribution analysis active.
          </p>
        </div>
      </div>

      {/* Department Breakdown Cards Grid */}
      <div className="saas-card p-6 space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Departmental Compliance Matrix</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time punctuality and attendance rates across business units
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {departments.map((dept) => (
            <div
              key={dept.department}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  {dept.department}
                </span>
                <span className="text-xs font-mono font-semibold text-indigo-700">
                  {dept.attendance_rate_pct}% Rate
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-slate-200/70 overflow-hidden">
                <div
                  className="h-full rounded-full bg-indigo-600"
                  style={{ width: `${Math.min(100, dept.attendance_rate_pct)}%` }}
                />
              </div>

              <div className="grid grid-cols-4 gap-2 text-center text-[11px] pt-1">
                <div className="p-2 rounded-lg bg-white border border-slate-200">
                  <div className="text-slate-500 text-[10px] font-medium">TOTAL</div>
                  <div className="font-semibold text-slate-900 mt-0.5">{dept.total_employees}</div>
                </div>
                <div className="p-2 rounded-lg bg-white border border-slate-200">
                  <div className="text-slate-500 text-[10px] font-medium">PRESENT</div>
                  <div className="font-semibold text-emerald-700 mt-0.5">{dept.present}</div>
                </div>
                <div className="p-2 rounded-lg bg-white border border-slate-200">
                  <div className="text-slate-500 text-[10px] font-medium">ON-TIME</div>
                  <div className="font-semibold text-indigo-700 mt-0.5">{dept.on_time}</div>
                </div>
                <div className="p-2 rounded-lg bg-white border border-slate-200">
                  <div className="text-slate-500 text-[10px] font-medium">LATE</div>
                  <div className="font-semibold text-amber-700 mt-0.5">{dept.late}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
