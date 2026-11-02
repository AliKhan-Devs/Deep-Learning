"use client";

import React from "react";
import { Target } from "lucide-react";

interface LandmarkMetric {
  name: string;
  consistency: number; // e.g. 98.7
  status?: "normal" | "anomalous";
}

interface FacialLandmarkRadarProps {
  metrics?: LandmarkMetric[];
}

export const FacialLandmarkRadar: React.FC<FacialLandmarkRadarProps> = ({
  metrics = [
    { name: "LEFT EYE", consistency: 98.7, status: "normal" },
    { name: "RIGHT EYE", consistency: 98.2, status: "normal" },
    { name: "NOSE", consistency: 99.1, status: "normal" },
    { name: "MOUTH", consistency: 97.3, status: "normal" },
    { name: "JAWLINE", consistency: 96.8, status: "normal" },
  ],
}) => {
  return (
    <div className="hud-panel p-4 bg-[#050c18]/90 border border-[#0d2a45] h-full flex flex-col justify-between">
      <div className="reticle-tl" />
      <div className="reticle-tr" />
      <div className="reticle-bl" />
      <div className="reticle-br" />

      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-[#0d2a45]">
        <Target className="w-3.5 h-3.5 text-hud-cyan" />
        <h3 className="text-xs font-mono font-bold tracking-widest text-hud-cyan uppercase">
          FACIAL LANDMARK ANALYSIS
        </h3>
      </div>

      {/* Main Content: Wireframe Head + Connected Leader Lines */}
      <div className="relative flex items-center justify-between py-3 my-auto">
        {/* Miniature Wireframe Head SVG */}
        <div className="relative w-36 h-36 flex-shrink-0">
          <svg viewBox="0 0 160 160" className="w-full h-full glow-cyan">
            {/* Head Contour */}
            <ellipse cx="80" cy="78" rx="42" ry="58" fill="none" stroke="#00f0ff" strokeWidth="0.8" strokeOpacity="0.5" />
            <ellipse cx="80" cy="80" rx="36" ry="50" fill="none" stroke="#00f0ff" strokeWidth="0.6" strokeOpacity="0.4" />
            <line x1="80" y1="20" x2="80" y2="136" stroke="#00f0ff" strokeWidth="0.6" strokeOpacity="0.4" strokeDasharray="2 2" />

            {/* Mesh Segments */}
            {/* Forehead */}
            <path d="M 50 50 Q 80 42 110 50" fill="none" stroke="#00f0ff" strokeWidth="0.7" strokeOpacity="0.5" />
            <path d="M 44 65 Q 80 58 116 65" fill="none" stroke="#00f0ff" strokeWidth="0.7" strokeOpacity="0.5" />
            {/* Eyes */}
            <polygon points="56,72 66,68 76,73 66,76" fill="none" stroke="#00f0ff" strokeWidth="0.9" />
            <polygon points="84,73 94,68 104,72 94,76" fill="none" stroke="#00f0ff" strokeWidth="0.9" />
            {/* Nose */}
            <polyline points="80,68 80,94 72,100 88,100 80,94" fill="none" stroke="#00f0ff" strokeWidth="0.9" />
            {/* Mouth */}
            <path d="M 64 114 Q 80 110 96 114 Q 80 122 64 114" fill="none" stroke="#00f0ff" strokeWidth="0.9" />
            {/* Jaw */}
            <polyline points="46,80 50,110 65,130 80,136 95,130 110,110 114,80" fill="none" stroke="#00f0ff" strokeWidth="0.7" strokeOpacity="0.6" />

            {/* Target Reticles on Head */}
            {/* Left Eye */}
            <circle cx="66" cy="72" r="3" fill="none" stroke="#00f0ff" strokeWidth="1" />
            <circle cx="66" cy="72" r="1" fill="#00f0ff" />
            <line x1="69" y1="72" x2="150" y2="35" stroke="#00f0ff" strokeWidth="0.7" strokeOpacity="0.6" />

            {/* Right Eye */}
            <circle cx="94" cy="72" r="3" fill="none" stroke="#00f0ff" strokeWidth="1" />
            <circle cx="94" cy="72" r="1" fill="#00f0ff" />
            <line x1="97" y1="72" x2="150" y2="60" stroke="#00f0ff" strokeWidth="0.7" strokeOpacity="0.6" />

            {/* Nose */}
            <circle cx="80" cy="95" r="3" fill="none" stroke="#00f0ff" strokeWidth="1" />
            <circle cx="80" cy="95" r="1" fill="#00f0ff" />
            <line x1="83" y1="95" x2="150" y2="85" stroke="#00f0ff" strokeWidth="0.7" strokeOpacity="0.6" />

            {/* Mouth */}
            <circle cx="80" cy="115" r="3" fill="none" stroke="#00f0ff" strokeWidth="1" />
            <circle cx="80" cy="115" r="1" fill="#00f0ff" />
            <line x1="83" y1="115" x2="150" y2="110" stroke="#00f0ff" strokeWidth="0.7" strokeOpacity="0.6" />

            {/* Jawline */}
            <circle cx="95" cy="130" r="3" fill="none" stroke="#00f0ff" strokeWidth="1" />
            <circle cx="95" cy="130" r="1" fill="#00f0ff" />
            <line x1="98" y1="130" x2="150" y2="135" stroke="#00f0ff" strokeWidth="0.7" strokeOpacity="0.6" />
          </svg>
        </div>

        {/* Metrics List with Leader Line Connectors */}
        <div className="flex-1 pl-4 space-y-2">
          {metrics.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full border border-hud-cyan flex items-center justify-center">
                  <span className="w-1 h-1 rounded-full bg-hud-cyan animate-pulse" />
                </span>
                <span className="text-slate-300 tracking-wider text-[11px]">{item.name}</span>
              </div>
              <span className="font-bold text-hud-cyan text-[12px]">{item.consistency.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
