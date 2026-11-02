"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { VideoFrameDetail } from "../lib/types";

interface FrameAnomalyFilmstripProps {
  timeline?: VideoFrameDetail[];
  currentFrame?: number;
  onSelectFrame?: (frameIndex: number) => void;
  isManipulated?: boolean;
}

export const FrameAnomalyFilmstrip: React.FC<FrameAnomalyFilmstripProps> = ({
  timeline,
  currentFrame = 38,
  onSelectFrame,
  isManipulated = true,
}) => {
  // If real timeline frames are passed from backend, use them; otherwise use default reference frames
  const defaultFrames = [
    { index: 34, isSuspicious: false },
    { index: 35, isSuspicious: true },
    { index: 37, isSuspicious: true },
    { index: 38, isSuspicious: true, active: true },
    { index: 39, isSuspicious: true },
    { index: 40, isSuspicious: false },
    { index: 41, isSuspicious: false },
  ];

  let displayFrames: { index: number; isSuspicious: boolean; thumbnailUrl?: string | null }[] = [];

  if (timeline && timeline.length > 0) {
    // Pick 7 frames centered around currentFrame
    const sorted = [...timeline].sort((a, b) => a.frame_index - b.frame_index);
    const centerIdx = sorted.findIndex(f => f.frame_index >= currentFrame);
    const start = Math.max(0, Math.min(sorted.length - 7, (centerIdx === -1 ? 0 : centerIdx) - 3));
    displayFrames = sorted.slice(start, start + 7).map(f => ({
      index: f.frame_index,
      isSuspicious: f.is_suspicious || f.fake_probability > 0.5,
      thumbnailUrl: f.thumbnail_url,
    }));
  } else {
    displayFrames = defaultFrames.map(f => ({
      index: f.index,
      isSuspicious: isManipulated ? f.isSuspicious : false,
    }));
  }

  return (
    <div className="hud-panel p-4 bg-[#050c18]/90 border border-[#0d2a45] h-full flex flex-col justify-between">
      <div className="reticle-tl" />
      <div className="reticle-tr" />
      <div className="reticle-bl" />
      <div className="reticle-br" />

      {/* Header */}
      <div className="pb-2 border-b border-[#0d2a45]">
        <h3 className="text-xs font-mono font-bold tracking-widest text-hud-cyan uppercase">
          FRAME-BY-FRAME ANOMALY DETECTION
        </h3>
      </div>

      {/* Filmstrip Cards Row */}
      <div className="grid grid-cols-7 gap-2 my-auto py-2">
        {displayFrames.map((frame) => {
          const isSelected = frame.index === currentFrame;
          const isAnom = frame.isSuspicious;

          return (
            <div
              key={frame.index}
              onClick={() => onSelectFrame && onSelectFrame(frame.index)}
              className="flex flex-col items-center cursor-pointer group transition-transform hover:-translate-y-0.5"
            >
              {/* Anomaly Warning Marker */}
              <div className="h-4 flex items-center justify-center">
                {isAnom ? (
                  <span className="text-[10px] text-hud-amber animate-pulse">▲</span>
                ) : (
                  <span className="text-[10px] opacity-0">▲</span>
                )}
              </div>

              {/* Frame Card Box */}
              <div
                className={`w-full aspect-[3/4] rounded-sm p-1 flex items-center justify-center border transition-all ${
                  isAnom
                    ? isSelected
                      ? "border-hud-amber bg-hud-amber/15 shadow-[0_0_10px_rgba(255,153,0,0.5)]"
                      : "border-hud-amber/70 bg-[#160d04]/70"
                    : isSelected
                    ? "border-hud-cyan bg-hud-cyan/15 shadow-[0_0_10px_rgba(0,240,255,0.4)]"
                    : "border-[#10304f] bg-[#071322] hover:border-hud-cyan/50"
                }`}
              >
                {frame.thumbnailUrl ? (
                  <img
                    src={frame.thumbnailUrl}
                    alt={`Frame ${frame.index}`}
                    className="w-full h-full object-cover rounded-xs"
                  />
                ) : (
                  /* Miniature Biometric Wireframe Face in Filmstrip */
                  <svg
                    viewBox="0 0 40 50"
                    className={`w-full h-full ${
                      isAnom ? "text-hud-amber glow-amber" : "text-hud-cyan/70"
                    }`}
                  >
                    <ellipse
                      cx="20"
                      cy="23"
                      rx="14"
                      ry="18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="0.8"
                    />
                    <polygon
                      points="12,20 16,18 20,20 16,22"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="0.7"
                    />
                    <polygon
                      points="20,20 24,18 28,20 24,22"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="0.7"
                    />
                    <polyline
                      points="20,18 20,27 18,29 22,29 20,27"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="0.7"
                    />
                    <path
                      d="M 15 34 Q 20 32 25 34 Q 20 37 15 34"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="0.7"
                    />
                    <line x1="12" y1="20" x2="16" y2="29" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.5" />
                    <line x1="28" y1="20" x2="24" y2="29" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.5" />
                  </svg>
                )}
              </div>

              {/* Frame Number Label */}
              <span
                className={`text-[10px] font-mono mt-1 ${
                  isSelected
                    ? "font-bold text-white underline underline-offset-2"
                    : isAnom
                    ? "text-hud-amber font-semibold"
                    : "text-slate-400 group-hover:text-hud-cyan"
                }`}
              >
                {frame.index}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend Footer */}
      <div className="pt-2 border-t border-[#0d2a45] flex items-center justify-center gap-6 text-[10px] font-mono">
        <div className="flex items-center gap-1.5 text-hud-cyan">
          <span className="w-3.5 h-[2px] bg-hud-cyan inline-block" />
          <span>NORMAL</span>
        </div>
        <div className="flex items-center gap-1.5 text-hud-amber">
          <span className="w-3.5 h-[2px] bg-hud-amber inline-block" />
          <span>ANOMALY DETECTED</span>
        </div>
      </div>
    </div>
  );
};
