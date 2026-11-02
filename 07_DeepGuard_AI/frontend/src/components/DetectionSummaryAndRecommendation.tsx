"use client";

import React from "react";
import { AlertTriangle, ShieldCheck, Grid, Activity, Box, ShieldAlert } from "lucide-react";

interface DetectionSummaryProps {
  isManipulated?: boolean;
  artifactsValue?: string;
  inconsistenciesValue?: string;
  manipulationValue?: string;
  sourceReliabilityValue?: string;
  recommendationTitle?: string;
  recommendationDetail?: string;
}

export const DetectionSummaryAndRecommendation: React.FC<DetectionSummaryProps> = ({
  isManipulated = true,
  artifactsValue,
  inconsistenciesValue,
  manipulationValue,
  sourceReliabilityValue,
  recommendationTitle,
  recommendationDetail,
}) => {
  const artifacts = artifactsValue || (isManipulated ? "DETECTED" : "NONE DETECTED");
  const inconsistencies = inconsistenciesValue || (isManipulated ? "HIGH" : "LOW");
  const manipulation = manipulationValue || (isManipulated ? "LIKELY" : "UNLIKELY");
  const reliability = sourceReliabilityValue || (isManipulated ? "VERY LOW" : "HIGH");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Detection Summary Left Area */}
      <div className="lg:col-span-7 hud-panel p-4 bg-[#050c18]/90 border border-[#0d2a45]">
        <div className="reticle-tl" />
        <div className="reticle-tr" />
        <div className="reticle-bl" />
        <div className="reticle-br" />

        <div className="pb-2 border-b border-[#0d2a45] mb-3">
          <h3 className="text-xs font-mono font-bold tracking-widest text-hud-cyan uppercase">
            DETECTION SUMMARY
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Artifacts */}
          <div className="flex items-center gap-3 p-2 rounded bg-[#071322]/80 border border-[#0f2d4a]">
            <div
              className={`p-1.5 rounded border ${
                isManipulated
                  ? "border-hud-amber/60 text-hud-amber bg-hud-amber/10 glow-amber"
                  : "border-hud-cyan/60 text-hud-cyan bg-hud-cyan/10"
              }`}
            >
              <Grid className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">
                ARTIFACTS
              </div>
              <div
                className={`text-xs font-mono font-bold tracking-wide mt-0.5 ${
                  isManipulated ? "text-hud-amber" : "text-hud-cyan"
                }`}
              >
                {artifacts}
              </div>
            </div>
          </div>

          {/* Inconsistencies */}
          <div className="flex items-center gap-3 p-2 rounded bg-[#071322]/80 border border-[#0f2d4a]">
            <div
              className={`p-1.5 rounded border ${
                isManipulated
                  ? "border-hud-amber/60 text-hud-amber bg-hud-amber/10"
                  : "border-hud-cyan/60 text-hud-cyan bg-hud-cyan/10"
              }`}
            >
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">
                INCONSISTENCIES
              </div>
              <div
                className={`text-xs font-mono font-bold tracking-wide mt-0.5 ${
                  isManipulated ? "text-hud-amber" : "text-hud-cyan"
                }`}
              >
                {inconsistencies}
              </div>
            </div>
          </div>

          {/* Manipulation */}
          <div className="flex items-center gap-3 p-2 rounded bg-[#071322]/80 border border-[#0f2d4a]">
            <div
              className={`p-1.5 rounded border ${
                isManipulated
                  ? "border-hud-amber/60 text-hud-amber bg-hud-amber/10"
                  : "border-hud-cyan/60 text-hud-cyan bg-hud-cyan/10"
              }`}
            >
              <Box className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">
                MANIPULATION
              </div>
              <div
                className={`text-xs font-mono font-bold tracking-wide mt-0.5 ${
                  isManipulated ? "text-hud-amber" : "text-hud-cyan"
                }`}
              >
                {manipulation}
              </div>
            </div>
          </div>

          {/* Source Reliability */}
          <div className="flex items-center gap-3 p-2 rounded bg-[#071322]/80 border border-[#0f2d4a]">
            <div
              className={`p-1.5 rounded border ${
                isManipulated
                  ? "border-hud-red/60 text-hud-red bg-hud-red/10 glow-red"
                  : "border-hud-green/60 text-hud-green bg-hud-green/10"
              }`}
            >
              {isManipulated ? (
                <ShieldAlert className="w-5 h-5" />
              ) : (
                <ShieldCheck className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">
                SOURCE RELIABILITY
              </div>
              <div
                className={`text-xs font-mono font-bold tracking-wide mt-0.5 ${
                  isManipulated ? "text-hud-red" : "text-hud-green"
                }`}
              >
                {reliability}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendation Right Area */}
      <div className="lg:col-span-5 hud-panel p-4 bg-[#050c18]/90 border border-[#0d2a45]">
        <div className="reticle-tl" />
        <div className="reticle-tr" />
        <div className="reticle-bl" />
        <div className="reticle-br" />

        <div className="pb-2 border-b border-[#0d2a45] mb-3">
          <h3 className="text-xs font-mono font-bold tracking-widest text-hud-cyan uppercase">
            RECOMMENDATION
          </h3>
        </div>

        <div className="flex items-center gap-3.5 my-auto">
          {isManipulated ? (
            <AlertTriangle className="w-9 h-9 text-hud-amber stroke-[2.3] flex-shrink-0 glow-amber" />
          ) : (
            <ShieldCheck className="w-9 h-9 text-hud-green stroke-[2.3] flex-shrink-0 glow-green" />
          )}

          <div>
            <div
              className={`text-sm font-mono font-black tracking-wide uppercase ${
                isManipulated ? "text-hud-amber" : "text-hud-green"
              }`}
            >
              {recommendationTitle ||
                (isManipulated
                  ? "CONTENT IS LIKELY SYNTHETIC"
                  : "CONTENT IS LIKELY AUTHENTIC")}
            </div>
            <div className="text-[11px] font-mono text-slate-400 tracking-wider uppercase mt-0.5">
              {recommendationDetail ||
                (isManipulated
                  ? "DO NOT TRUST THIS VIDEO AS AUTHENTIC"
                  : "VERIFIED NO CRITICAL SYNTHESIS ANOMALIES DETECTED")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
