"use client";

import React from "react";
import { Activity } from "lucide-react";

export interface MicroExpressionItem {
  label: string;
  status: "ANOMALOUS" | "NORMAL";
}

interface MicroExpressionCardProps {
  items?: MicroExpressionItem[];
  isManipulated?: boolean;
}

export const MicroExpressionCard: React.FC<MicroExpressionCardProps> = ({
  items,
  isManipulated = true,
}) => {
  const defaultItems: MicroExpressionItem[] = isManipulated
    ? [
        { label: "BLINK RATE", status: "ANOMALOUS" },
        { label: "EYE MOVEMENT", status: "ANOMALOUS" },
        { label: "BROW MOVEMENT", status: "ANOMALOUS" },
        { label: "MOUTH MOVEMENT", status: "ANOMALOUS" },
        { label: "HEAD MOVEMENT", status: "NORMAL" },
      ]
    : [
        { label: "BLINK RATE", status: "NORMAL" },
        { label: "EYE MOVEMENT", status: "NORMAL" },
        { label: "BROW MOVEMENT", status: "NORMAL" },
        { label: "MOUTH MOVEMENT", status: "NORMAL" },
        { label: "HEAD MOVEMENT", status: "NORMAL" },
      ];

  const displayItems = items || defaultItems;

  return (
    <div className="hud-panel p-4 bg-[#050c18]/90 border border-[#0d2a45] h-full flex flex-col justify-between">
      <div className="reticle-tl" />
      <div className="reticle-tr" />
      <div className="reticle-bl" />
      <div className="reticle-br" />

      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-[#0d2a45]">
        <Activity className="w-3.5 h-3.5 text-hud-cyan" />
        <h3 className="text-xs font-mono font-bold tracking-widest text-hud-cyan uppercase">
          MICRO-EXPRESSION ANALYSIS
        </h3>
      </div>

      {/* Wireframe and Status List */}
      <div className="relative flex items-center justify-between py-2 my-auto">
        {/* Wireframe Head with Glowing Facial Nodes */}
        <div className="relative w-32 h-36 flex-shrink-0">
          <svg viewBox="0 0 140 160" className="w-full h-full">
            {/* Base Wireframe Mesh */}
            <ellipse cx="70" cy="78" rx="40" ry="56" fill="none" stroke="#00f0ff" strokeWidth="0.8" strokeOpacity="0.4" />
            <path d="M 40 50 Q 70 42 100 50" fill="none" stroke="#00f0ff" strokeWidth="0.6" strokeOpacity="0.4" />
            <path d="M 35 68 Q 70 60 105 68" fill="none" stroke="#00f0ff" strokeWidth="0.6" strokeOpacity="0.4" />
            <polyline points="40,75 70,135 100,75" fill="none" stroke="#00f0ff" strokeWidth="0.6" strokeOpacity="0.3" />
            
            {/* Eyes */}
            <circle cx="54" cy="72" r="3" fill="none" stroke="#ff9900" strokeWidth="1" className={isManipulated ? "glow-amber" : ""} />
            <circle cx="86" cy="72" r="3" fill="none" stroke="#ff9900" strokeWidth="1" className={isManipulated ? "glow-amber" : ""} />

            {/* Eyebrows */}
            <path d="M 44 63 Q 54 58 64 62" fill="none" stroke={isManipulated ? "#ff9900" : "#00f0ff"} strokeWidth="1.2" />
            <path d="M 76 62 Q 86 58 96 63" fill="none" stroke={isManipulated ? "#ff9900" : "#00f0ff"} strokeWidth="1.2" />

            {/* Mouth */}
            <ellipse cx="70" cy="115" rx="14" ry="5" fill="none" stroke={isManipulated ? "#ff9900" : "#00f0ff"} strokeWidth="1.2" />

            {/* Indicator Target Dots */}
            <circle cx="54" cy="72" r="2" fill={isManipulated ? "#ff9900" : "#00f0ff"} />
            <circle cx="86" cy="72" r="2" fill={isManipulated ? "#ff9900" : "#00f0ff"} />
            <circle cx="70" cy="60" r="2.5" fill={isManipulated ? "#ff9900" : "#00f0ff"} />
            <circle cx="70" cy="115" r="2.5" fill={isManipulated ? "#ff9900" : "#00f0ff"} />
            <circle cx="70" cy="140" r="2.5" fill="#00f0ff" />
          </svg>
        </div>

        {/* Indicators on the Right with Status Badges */}
        <div className="flex-1 pl-2 space-y-2.5">
          {displayItems.map((item, idx) => {
            const isAnom = item.status === "ANOMALOUS";
            return (
              <div key={idx} className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full border flex items-center justify-center ${
                      isAnom ? "border-hud-amber" : "border-hud-cyan"
                    }`}
                  >
                    <span
                      className={`w-1 h-1 rounded-full ${
                        isAnom ? "bg-hud-amber" : "bg-hud-cyan"
                      }`}
                    />
                  </span>
                  <span className="text-slate-300 tracking-wider text-[11px]">{item.label}</span>
                </div>

                <span
                  className={`text-[10px] font-bold tracking-widest px-2 py-0.5 rounded border ${
                    isAnom
                      ? "bg-hud-amber/10 border-hud-amber/40 text-hud-amber glow-amber"
                      : "bg-hud-cyan/10 border-hud-cyan/40 text-hud-cyan"
                  }`}
                >
                  {item.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
