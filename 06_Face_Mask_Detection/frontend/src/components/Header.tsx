"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Cpu, Activity, Award, BarChart3, Video } from "lucide-react";
import { SystemStatus } from "../lib/types";

interface HeaderProps {
  status: SystemStatus | null;
  activeModelId: string;
}

export const Header: React.FC<HeaderProps> = ({ status, activeModelId }) => {
  return (
    <header className="border-b border-surface-light bg-surface/90 backdrop-blur-md sticky top-0 z-50 px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/40 shadow-lg shadow-cyan-500/10">
            <ShieldCheck className="w-6 h-6 text-cyan-400" />
            <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                FaceMask <span className="text-cyan-400">AI</span>
              </h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                <Award className="w-3 h-3" /> YOLOv26s Champion
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Project 06 • Edge Vision • Real-time Safety Compliance
            </p>
          </div>
        </div>

        {/* Center Nav */}
        <nav className="flex items-center gap-2 bg-background/60 p-1 rounded-xl border border-surface-light text-xs font-medium">
          <Link
            href="/"
            className="px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
          >
            <Video className="w-3.5 h-3.5" /> Live Detector
          </Link>
          <Link
            href="/experiments"
            className="px-3.5 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-light transition-all flex items-center gap-1.5"
          >
            <BarChart3 className="w-3.5 h-3.5" /> 3-Model Benchmark
          </Link>
        </nav>

        {/* System telemetry pill */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-surface-light text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline text-slate-400">Inference Device:</span>
            <span className="font-mono font-medium text-white">
              {status?.device || "Standard Inference"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Activity className="w-3.5 h-3.5" />
            <span className="font-semibold uppercase tracking-wider text-[11px]">
              {status?.status || "ONLINE"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
