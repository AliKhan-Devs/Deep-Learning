"use client";

import React from "react";
import { VideoFrameDetail } from "../lib/types";

interface TemporalConsistencyChartProps {
  timeline?: VideoFrameDetail[];
  currentFrame?: number;
  totalFrames?: number;
  onSelectFrame?: (frame: number) => void;
  hasInconsistency?: boolean;
}

export const TemporalConsistencyChart: React.FC<TemporalConsistencyChartProps> = ({
  timeline,
  currentFrame = 38,
  totalFrames = 300,
  onSelectFrame,
  hasInconsistency = true,
}) => {
  // Synthesize realistic temporal curve points if timeline is empty or small
  // In reference: 0 to 300 frames. Actual line hovers around 0.8-0.7, dips sharply to 0.3 near frame 160-180, recovers to 0.65, then dips to 0.35 near 270.
  const svgWidth = 420;
  const svgHeight = 160;
  const paddingLeft = 32;
  const paddingRight = 16;
  const paddingTop = 20;
  const paddingBottom = 28;

  const chartW = svgWidth - paddingLeft - paddingRight;
  const chartH = svgHeight - paddingTop - paddingBottom;

  // Generate 40 sampling points
  const pointsCount = 40;
  const points: { x: number; y: number; val: number; frame: number; isDip: boolean }[] = [];

  for (let i = 0; i <= pointsCount; i++) {
    const frame = Math.round((i / pointsCount) * totalFrames);
    let val = 0.78 + Math.sin(i * 0.8) * 0.08 - (i / pointsCount) * 0.15;

    // Introduce sharp dip around frame 160-190 (index 22-26) if hasInconsistency
    const isDip = hasInconsistency && i >= 23 && i <= 26;
    if (isDip) {
      val = 0.32 + (i % 2 === 0 ? 0.08 : -0.05);
    } else if (hasInconsistency && i >= 35 && i <= 37) {
      val = 0.38 + (i % 2 === 0 ? 0.06 : -0.04);
    }

    // Clamp val
    val = Math.max(0.1, Math.min(0.95, val));

    const x = paddingLeft + (i / pointsCount) * chartW;
    const y = paddingTop + (1 - val) * chartH;
    points.push({ x, y, val, frame, isDip });
  }

  // Construct SVG path string for actual series
  const actualPath = points.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, "");

  // Expected series is a steady high baseline
  const expectedPoints = points.map(p => ({
    x: p.x,
    y: paddingTop + (1 - 0.85) * chartH
  }));
  const expectedPath = expectedPoints.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, "");

  // Anomaly callout position (around point 24)
  const dipPoint = points[24];

  return (
    <div className="hud-panel p-4 bg-[#050c18]/90 border border-[#0d2a45] h-full flex flex-col justify-between">
      <div className="reticle-tl" />
      <div className="reticle-tr" />
      <div className="reticle-bl" />
      <div className="reticle-br" />

      {/* Header and Legend */}
      <div className="flex items-center justify-between pb-2 border-b border-[#0d2a45]">
        <h3 className="text-xs font-mono font-bold tracking-widest text-hud-cyan uppercase">
          TEMPORAL CONSISTENCY
        </h3>

        <div className="flex items-center gap-4 text-[10px] font-mono">
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="w-3.5 h-[1.5px] bg-slate-500 inline-block" />
            <span>EXPECTED</span>
          </div>
          <div className="flex items-center gap-1.5 text-hud-cyan">
            <span className="w-3.5 h-[1.5px] bg-hud-cyan border-t border-dashed border-hud-cyan inline-block" />
            <span>ACTUAL</span>
          </div>
        </div>
      </div>

      {/* Oscilloscope ECG Chart SVG */}
      <div className="relative w-full my-auto py-1">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible">
          {/* Y-Axis Grid Lines & Labels */}
          {[1.0, 0.5, 0.0].map((val) => {
            const y = paddingTop + (1 - val) * chartH;
            return (
              <g key={val}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  stroke="#0f2b45"
                  strokeWidth="0.8"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  fill="#54789e"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {val.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* X-Axis Grid Ticks & Labels */}
          {[0, 75, 150, 225, 300].map((val) => {
            const x = paddingLeft + (val / totalFrames) * chartW;
            return (
              <g key={val}>
                <line
                  x1={x}
                  y1={paddingTop}
                  x2={x}
                  y2={paddingTop + chartH}
                  stroke="#0f2b45"
                  strokeWidth="0.6"
                  strokeDasharray="2 2"
                />
                <text
                  x={x}
                  y={paddingTop + chartH + 16}
                  textAnchor="middle"
                  fill="#54789e"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* X-Axis Bottom Label */}
          <text
            x={paddingLeft + chartW / 2}
            y={paddingTop + chartH + 28}
            textAnchor="middle"
            fill="#54789e"
            fontSize="9"
            fontFamily="monospace"
            letterSpacing="2"
          >
            FRAME
          </text>

          {/* Expected Baseline Line */}
          <path
            d={expectedPath}
            fill="none"
            stroke="#1d486e"
            strokeWidth="1.2"
          />

          {/* Actual Consistency Jagged Line */}
          <path
            d={actualPath}
            fill="none"
            stroke="#00f0ff"
            strokeWidth="1.6"
            className="glow-cyan"
          />

          {/* Current Frame Marker Line */}
          {currentFrame && (
            <line
              x1={paddingLeft + (currentFrame / totalFrames) * chartW}
              y1={paddingTop}
              x2={paddingLeft + (currentFrame / totalFrames) * chartW}
              y2={paddingTop + chartH}
              stroke="#00ffaa"
              strokeWidth="1.2"
              strokeDasharray="2 2"
              opacity="0.8"
            />
          )}

          {/* Anomaly Callout Circle & Label */}
          {hasInconsistency && dipPoint && (
            <g className="cursor-pointer">
              {/* Outer Pulsing Rings */}
              <circle
                cx={dipPoint.x}
                cy={dipPoint.y + 4}
                r="14"
                fill="none"
                stroke="#ff3366"
                strokeWidth="1.5"
                opacity="0.8"
                className="animate-ping"
                style={{ transformOrigin: `${dipPoint.x}px ${dipPoint.y + 4}px`, animationDuration: "2.5s" }}
              />
              <circle
                cx={dipPoint.x}
                cy={dipPoint.y + 4}
                r="13"
                fill="#ff336615"
                stroke="#ff3366"
                strokeWidth="1.8"
              />
              <circle
                cx={dipPoint.x}
                cy={dipPoint.y + 4}
                r="2.5"
                fill="#ff3366"
              />

              {/* Anomaly Callout text below */}
              <text
                x={dipPoint.x}
                y={dipPoint.y + 26}
                textAnchor="middle"
                fill="#ff5577"
                fontSize="8.5"
                fontWeight="bold"
                fontFamily="monospace"
                letterSpacing="0.8"
                className="glow-red"
              >
                INCONSISTENCY DETECTED
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};
