"use client";

import React from "react";
import { AlertTriangle, CheckCircle2, ShieldCheck } from "lucide-react";

interface AnalysisResultsCardProps {
  authenticityScore?: number; // 0 to 100%
  isManipulated?: boolean;
  confidence?: "HIGH" | "MEDIUM" | "LOW";
  predictionText?: string;
}

export const AnalysisResultsCard: React.FC<AnalysisResultsCardProps> = ({
  authenticityScore = 18,
  isManipulated = true,
  confidence = "HIGH",
  predictionText,
}) => {
  const isSynthetic = isManipulated ?? authenticityScore < 50;

  return (
    <div className="hud-panel p-5 bg-[#050c18]/90 border border-[#0d2a45] h-full flex flex-col justify-between">
      <div className="reticle-tl" />
      <div className="reticle-tr" />
      <div className="reticle-bl" />
      <div className="reticle-br" />

      {/* Header */}
      <div className="pb-3 border-b border-[#0d2a45]">
        <h3 className="text-xs font-mono font-bold tracking-widest text-hud-cyan uppercase">
          ANALYSIS RESULTS
        </h3>
      </div>

      <div className="space-y-4 my-auto py-2">
        {/* Tactical Banner Callout Box */}
        <div
          className={`p-3.5 rounded border flex items-center gap-3.5 transition-all ${
            isSynthetic
              ? "bg-[#1f1609]/60 border-hud-amber/60 text-hud-amber glow-amber"
              : "bg-[#091f16]/60 border-hud-green/60 text-hud-green glow-green"
          }`}
        >
          {isSynthetic ? (
            <AlertTriangle className="w-8 h-8 flex-shrink-0 text-hud-amber stroke-[2.2]" />
          ) : (
            <ShieldCheck className="w-8 h-8 flex-shrink-0 text-hud-green stroke-[2.2]" />
          )}
          <div>
            <div className="font-mono font-black text-sm tracking-wide uppercase">
              {predictionText
                ? predictionText.toUpperCase()
                : isSynthetic
                ? "SYNTHETIC CONTENT DETECTED"
                : "AUTHENTIC CONTENT VERIFIED"}
            </div>
            <div className="text-[11px] font-mono tracking-wider opacity-90 mt-0.5">
              {confidence} CONFIDENCE
            </div>
          </div>
        </div>

        {/* Authenticity Score and Confidence */}
        <div className="pt-2">
          <div className="text-[11px] font-mono tracking-widest text-slate-400 uppercase mb-1">
            AUTHENTICITY SCORE
          </div>

          <div className="flex items-baseline justify-between">
            <div
              className={`text-5xl font-mono font-black tracking-tight ${
                isSynthetic ? "text-hud-amber text-glow-amber" : "text-hud-green"
              }`}
            >
              {Math.round(authenticityScore)}
              <span className="text-2xl font-normal ml-0.5">%</span>
            </div>

            <div className="text-right">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                CONFIDENCE
              </div>
              <div
                className={`text-sm font-mono font-black tracking-wider uppercase mt-0.5 ${
                  isSynthetic ? "text-hud-amber" : "text-hud-green"
                }`}
              >
                {confidence}
              </div>
            </div>
          </div>

          {/* Horizontal Level Gauge */}
          <div className="mt-3 space-y-1">
            <div className="w-full h-2.5 bg-[#0b1c2f] rounded-none border border-[#133454] relative overflow-hidden">
              <div
                className={`h-full transition-all duration-700 ${
                  isSynthetic
                    ? "bg-gradient-to-r from-hud-red via-hud-amber to-hud-amber"
                    : "bg-gradient-to-r from-hud-cyan to-hud-green"
                }`}
                style={{ width: `${Math.min(100, Math.max(0, authenticityScore))}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
