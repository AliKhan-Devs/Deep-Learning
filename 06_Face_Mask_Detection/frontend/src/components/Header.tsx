"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, Cpu, LayoutGrid, BarChart3, Video, Award } from "lucide-react";
import { SystemStatus } from "../lib/types";

interface HeaderProps {
  status: SystemStatus | null;
  activeModelId?: string;
}

export const Header: React.FC<HeaderProps> = ({ status }) => {
  const pathname = usePathname();

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50 px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                FaceMask <span className="text-sky-600">AI</span>
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <Award className="w-3 h-3 text-emerald-600" /> YOLOv26s Champion
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Real-Time Face Mask Detection & Safety Compliance
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-medium border border-slate-200">
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              pathname === "/"
                ? "bg-white text-slate-900 shadow-sm font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Video className="w-3.5 h-3.5 text-sky-600" /> Live & Upload Detector
          </Link>

          <Link
            href="/arena"
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              pathname === "/arena"
                ? "bg-white text-slate-900 shadow-sm font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 text-emerald-600" /> 3-Model Live Arena (FPS)
          </Link>

          <Link
            href="/experiments"
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              pathname === "/experiments"
                ? "bg-white text-slate-900 shadow-sm font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-indigo-600" /> Benchmark Reports
          </Link>
        </nav>

        {/* Telemetry */}
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200">
            <Cpu className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-mono text-slate-700">
              {status?.device || "Inference Engine"}
            </span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            READY
          </div>
        </div>
      </div>
    </header>
  );
};
