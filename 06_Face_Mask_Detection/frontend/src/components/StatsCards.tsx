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
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {/* Total Faces */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-sm">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider">Total Faces</span>
          <Users className="w-4 h-4 text-sky-600" />
        </div>
        <div className="text-2xl font-bold font-mono text-slate-900">{totalFaces}</div>
        <div className="text-[10px] text-slate-500 mt-0.5">Individuals in frame</div>
      </div>

      {/* Mask Count */}
      <div className="bg-emerald-50/60 rounded-xl border border-emerald-200 p-3.5 shadow-sm">
        <div className="flex items-center justify-between text-emerald-800 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider">Masked Faces</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="text-2xl font-bold font-mono text-emerald-700">{maskCount}</div>
        <div className="text-[10px] text-emerald-600 mt-0.5">Compliant wearers</div>
      </div>

      {/* No Mask Count */}
      <div className={`rounded-xl border p-3.5 shadow-sm transition-all ${
        noMaskCount > 0
          ? "bg-red-50 border-red-300"
          : "bg-white border-slate-200"
      }`}>
        <div className="flex items-center justify-between mb-1">
          <span className={`text-[11px] font-bold uppercase tracking-wider ${
            noMaskCount > 0 ? "text-red-800" : "text-slate-500"
          }`}>
            Violations
          </span>
          <AlertTriangle className={`w-4 h-4 ${noMaskCount > 0 ? "text-red-600" : "text-slate-400"}`} />
        </div>
        <div className={`text-2xl font-bold font-mono ${noMaskCount > 0 ? "text-red-700" : "text-slate-700"}`}>
          {noMaskCount}
        </div>
        <div className={`text-[10px] mt-0.5 ${noMaskCount > 0 ? "text-red-600 font-medium" : "text-slate-500"}`}>
          {noMaskCount > 0 ? "Unmasked alerts" : "No safety violations"}
        </div>
      </div>

      {/* Compliance Rate */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-sm">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider">Compliance</span>
          <Gauge className="w-4 h-4 text-sky-600" />
        </div>
        <div className="flex items-baseline gap-1">
          <span className={`text-2xl font-bold font-mono ${
            complianceRate >= 90
              ? "text-emerald-700"
              : complianceRate >= 60
              ? "text-amber-600"
              : "text-red-600"
          }`}>
            {totalFaces > 0 ? `${complianceRate}%` : "100%"}
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              complianceRate >= 90
                ? "bg-emerald-500"
                : complianceRate >= 60
                ? "bg-amber-500"
                : "bg-red-500"
            }`}
            style={{ width: `${totalFaces > 0 ? complianceRate : 100}%` }}
          />
        </div>
      </div>

      {/* Inference Latency */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-sm col-span-2 md:col-span-1">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider">Speed</span>
          <Clock className="w-4 h-4 text-sky-600" />
        </div>
        <div className="text-2xl font-bold font-mono text-sky-700">
          {inferenceTimeMs > 0 ? `${inferenceTimeMs.toFixed(0)}ms` : "—"}
        </div>
        <div className="text-[10px] text-slate-500 mt-0.5">YOLO latency</div>
      </div>
    </div>
  );
};
