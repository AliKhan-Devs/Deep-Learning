"use client";

import React, { useState, useEffect } from "react";
import {
  ClipboardList,
  Download,
  Filter,
  Search,
  Calendar,
  Building2,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { api } from "../../lib/api";
import { AttendanceRecord } from "../../lib/types";
import { StatusBadge } from "../../components/StatusBadge";

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [search, setSearch] = useState<string>("");
  const [department, setDepartment] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const data = await api.getAttendanceHistory({
        search: search || undefined,
        department: department || undefined,
        status: status || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        limit: 100,
      });
      setRecords(data);
    } catch (err) {
      console.error("Failed to fetch records:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [department, status, startDate, endDate]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRecords();
  };

  const departments = ["Engineering", "Product", "Design", "Operations", "HR"];
  const statuses = [
    { label: "All Statuses", value: "" },
    { label: "On-Time", value: "ON_TIME" },
    { label: "Late Arrival", value: "LATE" },
    { label: "Departure", value: "DEPARTURE" },
  ];

  return (
    <div className="space-y-6 select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1e293b]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <ClipboardList className="w-6 h-6 text-indigo-400" />
            Attendance History &amp; Audit Logs
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Detailed verification records, timestamps, and confidence metrics
          </p>
        </div>

        <a
          href={api.getExportCsvUrl(startDate, endDate)}
          download
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all self-start sm:self-auto"
        >
          <Download className="w-4 h-4" /> Download CSV Export
        </a>
      </div>

      {/* Filter Control Bar */}
      <div className="saas-card p-4 space-y-3">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search employee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#141d33] border border-[#23314d] text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#141d33] border border-[#23314d] text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#141d33] border border-[#23314d] text-white focus:outline-none focus:border-indigo-500"
            >
              {statuses.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#141d33] border border-[#23314d] text-white focus:outline-none focus:border-indigo-500"
              title="From Date"
            />
          </div>

          {/* End Date */}
          <div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#141d33] border border-[#23314d] text-white focus:outline-none focus:border-indigo-500"
              title="To Date"
            />
          </div>
        </form>
      </div>

      {/* Logs Table */}
      <div className="saas-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#141d33]/60 text-slate-400 uppercase font-semibold border-b border-[#1e293b]">
              <tr>
                <th className="px-6 py-3.5">Employee</th>
                <th className="px-6 py-3.5">Code</th>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Check-In</th>
                <th className="px-6 py-3.5">Check-Out</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]">
              {records.length > 0 ? (
                records.map((rec) => (
                  <tr key={rec.id} className="hover:bg-[#131d33]/50 transition-colors">
                    <td className="px-6 py-3.5 font-bold text-white">
                      {rec.full_name}
                    </td>

                    <td className="px-6 py-3.5 font-mono text-slate-300">
                      {rec.employee_code}
                    </td>

                    <td className="px-6 py-3.5 text-slate-400">
                      {rec.department}
                    </td>

                    <td className="px-6 py-3.5 text-slate-300 font-mono">
                      {rec.date}
                    </td>

                    <td className="px-6 py-3.5 font-mono font-bold text-white">
                      {rec.check_in_time || "—"}
                    </td>

                    <td className="px-6 py-3.5 font-mono text-slate-400">
                      {rec.check_out_time || "—"}
                    </td>

                    <td className="px-6 py-3.5">
                      <StatusBadge status={rec.status} size="sm" />
                    </td>

                    <td className="px-6 py-3.5 text-right font-mono font-bold text-indigo-400">
                      {rec.confidence_score ? `${(rec.confidence_score * 100).toFixed(1)}%` : "100%"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    {loading ? "Loading attendance logs..." : "No attendance logs match the selected filters."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
