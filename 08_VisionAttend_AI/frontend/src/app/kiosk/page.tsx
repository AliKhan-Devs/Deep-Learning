"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ScanFace,
  ArrowLeft,
  Maximize2,
  Clock,
  Sparkles,
  Users,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { WebcamScanner } from "../../components/WebcamScanner";
import { StatusBadge } from "../../components/StatusBadge";
import { api } from "../../lib/api";
import { AttendanceRecord, DetectedFaceVerdict } from "../../lib/types";

export default function KioskPage() {
  const [todayRecords, setTodayRecords] = useState<AttendanceRecord[]>([]);
  const [recentNotification, setRecentNotification] = useState<DetectedFaceVerdict | null>(null);

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

  const handleCheckInSuccess = (verdict: DetectedFaceVerdict) => {
    setRecentNotification(verdict);
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
      <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Exit Kiosk &amp; Return to Dashboard
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>FRONT DESK RECEPTION KIOSK #01</span>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-[#141d33] border border-[#23314d] text-slate-300 hover:text-white transition-colors"
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
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#1e293b]">
              <div className="flex items-center gap-2">
                <ScanFace className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-bold text-white">Contactless Facial Recognition</h2>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                FaceNet Inception-ResNet-v1 (512-D)
              </span>
            </div>

            <WebcamScanner onCheckInSuccess={handleCheckInSuccess} />
          </div>
        </div>

        {/* Right Area (Span 4): Live Reception Feed */}
        <div className="lg:col-span-4 saas-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
            <div>
              <h3 className="text-sm font-bold text-white">Live Attendance Stream</h3>
              <p className="text-[11px] text-slate-400">Today's verified check-ins</p>
            </div>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>

          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {todayRecords.length > 0 ? (
              todayRecords.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3 rounded-xl bg-[#141d33]/80 border border-[#23314d] flex items-center justify-between gap-3 transition-all hover:border-indigo-500/40"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0 border border-indigo-500/30">
                      {rec.full_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">
                        {rec.full_name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {rec.department} &bull; <span className="font-mono">{rec.employee_code}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-mono font-bold text-slate-200">
                      {rec.check_in_time}
                    </div>
                    <div className="mt-0.5">
                      <StatusBadge status={rec.status} size="sm" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-16 text-center text-slate-500 text-xs">
                No check-ins registered yet. Stand in front of the camera to verify.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
