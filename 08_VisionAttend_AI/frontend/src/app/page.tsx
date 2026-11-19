"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  UserCheck,
  Clock,
  AlertTriangle,
  BarChart3,
  ScanFace,
  Download,
  PlusCircle,
  RefreshCw,
  Building2,
  Calendar,
  Sparkles
} from "lucide-react";
import { api } from "../lib/api";
import { AttendanceSummary, DepartmentStat, SystemStatus } from "../lib/types";
import { StatCard } from "../components/StatCard";
import { StatusBadge } from "../components/StatusBadge";

export default function DashboardPage() {
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [departments, setDepartments] = useState<DepartmentStat[]>([]);
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [sumData, deptData, sysData] = await Promise.all([
        api.getTodaySummary(),
        api.getDepartmentAnalytics(),
        api.getSystemStatus(),
      ]);
      setSummary(sumData);
      setDepartments(deptData);
      setStatus(sysData);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8 select-none">
      {/* Top Hero Banner */}
      <div className="relative rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-indigo-950/40 via-[#0f172a] to-sky-950/30 border border-[#1e293b] overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Biometric Workforce Analytics
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Workforce Attendance <span className="text-sky-400">Command Center</span>
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1.5 leading-relaxed">
            Real-time biometric recognition tracking on-time punctuality, department attendance rates, and automated shift logging via FaceNet 512-dimensional vector matching.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-5">
            <Link
              href="/kiosk"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition-all"
            >
              <ScanFace className="w-4 h-4" /> Open Reception Kiosk
            </Link>
            <Link
              href="/employees"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#141d33] hover:bg-[#1c2947] text-slate-200 border border-[#23314d] transition-all"
            >
              <PlusCircle className="w-4 h-4 text-sky-400" /> Enroll Personnel
            </Link>
            <a
              href={api.getExportCsvUrl()}
              download
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#141d33] hover:bg-[#1c2947] text-slate-200 border border-[#23314d] transition-all"
            >
              <Download className="w-4 h-4 text-emerald-400" /> Export CSV Report
            </a>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Attendance Rate"
          value={`${summary?.attendance_rate_pct ?? 0}%`}
          subtitle="Of active workforce"
          trend={summary && summary.attendance_rate_pct >= 85 ? "+Optimal" : "Standard"}
          color="emerald"
          icon={<UserCheck className="w-4 h-4" />}
        />
        <StatCard
          title="Total Enrolled"
          value={summary?.total_employees ?? 0}
          subtitle="Active personnel"
          color="indigo"
          icon={<Users className="w-4 h-4" />}
        />
        <StatCard
          title="Present Today"
          value={summary?.total_present ?? 0}
          subtitle="Checked in"
          color="sky"
          icon={<UserCheck className="w-4 h-4" />}
        />
        <StatCard
          title="On-Time Arrivals"
          value={summary?.total_on_time ?? 0}
          subtitle="Before shift grace cutoff"
          color="emerald"
          icon={<Clock className="w-4 h-4" />}
        />
        <StatCard
          title="Late Arrivals"
          value={summary?.total_late ?? 0}
          subtitle="Post grace window"
          color="amber"
          icon={<AlertTriangle className="w-4 h-4" />}
        />
      </div>

      {/* 2-Column Dashboard Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Check-in Activity Feed */}
        <div className="lg:col-span-7 saas-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#1e293b]">
              <div>
                <h3 className="font-bold text-white text-sm">Today's Live Check-In Activity</h3>
                <p className="text-xs text-slate-400 mt-0.5">Real-time incoming biometric verifications</p>
              </div>
              <button
                onClick={fetchDashboardData}
                disabled={loading}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#141d33] transition-colors"
                title="Refresh Stream"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-indigo-400" : ""}`} />
              </button>
            </div>

            <div className="divide-y divide-[#1e293b] mt-3">
              {summary?.recent_checkins && summary.recent_checkins.length > 0 ? (
                summary.recent_checkins.map((rec) => (
                  <div key={rec.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#141d33] border border-[#23314d] flex items-center justify-center font-bold text-indigo-400 text-xs">
                        {rec.full_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-white">{rec.full_name}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{rec.department}</span>
                          <span>&bull;</span>
                          <span className="font-mono text-slate-300">{rec.employee_code}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-3">
                      <div className="text-xs font-mono font-bold text-white">
                        {rec.check_in_time}
                      </div>
                      <StatusBadge status={rec.status} size="sm" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No check-ins recorded yet for today. Launch the reception kiosk or simulate arrival.
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-[#1e293b] flex items-center justify-between text-xs text-slate-400">
            <span>Showing latest verifications</span>
            <Link href="/attendance" className="text-indigo-400 hover:text-indigo-300 font-semibold">
              View All Logs &rarr;
            </Link>
          </div>
        </div>

        {/* Right Column: Department Attendance Breakdown */}
        <div className="lg:col-span-5 saas-card p-6 flex flex-col justify-between">
          <div>
            <div className="pb-4 border-b border-[#1e293b]">
              <h3 className="font-bold text-white text-sm">Department Punctuality Breakdown</h3>
              <p className="text-xs text-slate-400 mt-0.5">Attendance rates by business unit</p>
            </div>

            <div className="space-y-4 mt-4">
              {departments.length > 0 ? (
                departments.map((dept) => (
                  <div key={dept.department} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                        {dept.department}
                      </span>
                      <span className="text-slate-400 font-mono">
                        {dept.present}/{dept.total_employees} ({dept.attendance_rate_pct}%)
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-[#141d33] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-400 transition-all duration-500"
                        style={{ width: `${Math.min(100, dept.attendance_rate_pct)}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No department telemetry recorded yet.
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-[#1e293b] flex items-center justify-between text-xs text-slate-400">
            <span>Shift Cutoff: 09:15 AM</span>
            <Link href="/analytics" className="text-sky-400 hover:text-sky-300 font-semibold">
              Full Analytics &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
