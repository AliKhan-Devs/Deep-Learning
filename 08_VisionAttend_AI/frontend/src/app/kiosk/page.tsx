"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ScanFace,
  ArrowLeft,
  Maximize2,
  Users,
} from "lucide-react";
import { WebcamScanner } from "../../components/WebcamScanner";
import { StatusBadge } from "../../components/StatusBadge";
import { api } from "../../lib/api";
import { AttendanceRecord, DetectedFaceVerdict } from "../../lib/types";

export default function KioskPage() {
  const [todayRecords, setTodayRecords] = useState<AttendanceRecord[]>([]);

  const fetchTodayRecords = async () => {
    try {
      const summary = await api.getTodaySummary();
      setTodayRecords(summary.recent_checkins);
    } catch {
      // Offline fallback
    }
  };

  useEffect(() => {
    fetchTodayRecords();
  }, []);

  const handleCheckInSuccess = (_verdict: DetectedFaceVerdict) => {
    fetchTodayRecords();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="space-y-6 select-none">
      {/* Top Utility Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Exit Kiosk &amp; Return to Dashboard
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-mono font-medium text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>RECEPTION KIOSK TERMINAL #01</span>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm transition-colors"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main 2-Column Kiosk Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Area (Span 8): Interactive Facial Scanner */}
        <div className="lg:col-span-8 space-y-4">
          <div className="saas-card p-6">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <ScanFace className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-semibold text-slate-900">Contactless Facial Recognition</h2>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                FaceNet Inception-ResNet-v1 (512-D)
              </span>
            </div>

            <WebcamScanner onCheckInSuccess={handleCheckInSuccess} />
          </div>
        </div>

        {/* Right Area (Span 4): Live Reception Feed */}
        <div className="lg:col-span-4 saas-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Live Attendance Stream</h3>
              <p className="text-[11px] text-slate-500">Today's verified arrivals</p>
            </div>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>

          <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
            {todayRecords.length > 0 ? (
              todayRecords.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 transition-colors hover:border-slate-300"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-md bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 border border-indigo-100">
                      {rec.full_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-900 truncate">
                        {rec.full_name}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {rec.department} &bull; <span className="font-mono text-slate-600">{rec.employee_code}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-mono font-semibold text-slate-800">
                      {rec.check_in_time}
                    </div>
                    <div className="mt-0.5">
                      <StatusBadge status={rec.status} size="sm" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-16 text-center text-slate-400 text-xs">
                No check-ins registered yet. Stand in front of the camera to verify.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
