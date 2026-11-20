"use client";

import React from "react";
import { Users, CheckCircle2, AlertTriangle, Gauge, Clock } from "lucide-react";

interface StatsCardsProps {
  totalFaces: number;
  maskCount: number;
  noMaskCount: number;
  complianceRate: number;
  inferenceTimeMs: number;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  totalFaces,
  maskCount,
  noMaskCount,
  complianceRate,
  inferenceTimeMs,
}) => {
  const isCompliant = noMaskCount === 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {/* Total Faces */}
      <div className="bg-surface rounded-xl border border-surface-light p-3.5 shadow-md">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Detected</span>
          <Users className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="text-2xl font-bold font-mono text-white">{totalFaces}</div>
        <div className="text-[10px] text-slate-500 mt-0.5">Total individuals</div>
      </div>

      {/* Mask Count */}
      <div className="bg-surface rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03] p-3.5 shadow-md">
        <div className="flex items-center justify-between text-emerald-400 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Masked</span>
          <CheckCircle2 className="w-4 h-4" />
        </div>
        <div className="text-2xl font-bold font-mono text-emerald-400">{maskCount}</div>
        <div className="text-[10px] text-slate-400 mt-0.5">Compliant wearers</div>
      </div>

      {/* No Mask Count */}
      <div className={`bg-surface rounded-xl border p-3.5 shadow-md transition-all ${
        noMaskCount > 0
          ? "border-rose-500/40 bg-rose-500/[0.06] animate-pulse"
          : "border-surface-light text-slate-400"
      }`}>
        <div className="flex items-center justify-between mb-1">
          <span className={`text-[11px] font-semibold uppercase tracking-wider ${
            noMaskCount > 0 ? "text-rose-400" : "text-slate-400"
          }`}>
            No Mask
          </span>
          <AlertTriangle className={`w-4 h-4 ${noMaskCount > 0 ? "text-rose-400" : "text-slate-500"}`} />
        </div>
        <div className={`text-2xl font-bold font-mono ${noMaskCount > 0 ? "text-rose-400" : "text-slate-400"}`}>
          {noMaskCount}
        </div>
        <div className="text-[10px] text-slate-400 mt-0.5">Violations recorded</div>
      </div>

      {/* Compliance Rate */}
      <div className="bg-surface rounded-xl border border-surface-light p-3.5 shadow-md">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Compliance</span>
          <Gauge className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className={`text-2xl font-bold font-mono ${
            complianceRate >= 90
              ? "text-emerald-400"
              : complianceRate >= 60
              ? "text-amber-400"
              : "text-rose-400"
          }`}>
            {totalFaces > 0 ? `${complianceRate}%` : "100%"}
          </span>
        </div>
        {/* Progress Mini Bar */}
        <div className="w-full h-1 bg-surface-light rounded-full mt-2 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              complianceRate >= 90
                ? "bg-emerald-400"
                : complianceRate >= 60
                ? "bg-amber-400"
                : "bg-rose-400"
            }`}
            style={{ width: `${totalFaces > 0 ? complianceRate : 100}%` }}
          />
        </div>
      </div>

      {/* Inference Latency */}
      <div className="bg-surface rounded-xl border border-surface-light p-3.5 shadow-md col-span-2 md:col-span-1">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Latency</span>
          <Clock className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="text-2xl font-bold font-mono text-cyan-400">
          {inferenceTimeMs > 0 ? `${inferenceTimeMs.toFixed(1)}ms` : "—"}
        </div>
        <div className="text-[10px] text-slate-500 mt-0.5">YOLO inference time</div>
      </div>
    </div>
  );
};
