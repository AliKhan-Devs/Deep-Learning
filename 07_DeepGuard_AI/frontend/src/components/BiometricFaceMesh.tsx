"use client";

import React, { useState } from "react";
import { Play, Pause, Scan, Eye, Activity } from "lucide-react";

interface BiometricFaceMeshProps {
  currentFrame?: number;
  totalFrames?: number;
  timestampSec?: number;
  totalDurationSec?: number;
  onFrameChange?: (frame: number) => void;
  rawImageUrl?: string | null;
  fakeProbability?: number;
}

export const BiometricFaceMesh: React.FC<BiometricFaceMeshProps> = ({
  currentFrame = 38,
  totalFrames = 300,
  timestampSec = 1.25,
  totalDurationSec = 10.0,
  onFrameChange,
  rawImageUrl,
  fakeProbability = 0.82,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [viewMode, setViewMode] = useState<"wireframe" | "raw" | "combined">("wireframe");

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `00:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}.${String(ms).padStart(3, "0")}`;
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const frame = parseInt(e.target.value, 10);
    if (onFrameChange) onFrameChange(frame);
  };

  // Wireframe nodes for biometric face mesh
  const nodes = [
    // Top Head / Cranium
    { id: "c1", x: 200, y: 55 },
    { id: "c2", x: 160, y: 70 }, { id: "c3", x: 240, y: 70 },
    { id: "c4", x: 125, y: 100 }, { id: "c5", x: 275, y: 100 },
    // Forehead
    { id: "f1", x: 200, y: 105 },
    { id: "f2", x: 165, y: 110 }, { id: "f3", x: 235, y: 110 },
    { id: "f4", x: 130, y: 135 }, { id: "f5", x: 270, y: 135 },
    // Brows
    { id: "b1", x: 155, y: 145 }, { id: "b2", x: 185, y: 142 },
    { id: "b3", x: 215, y: 142 }, { id: "b4", x: 245, y: 145 },
    // Eyes
    { id: "el1", x: 140, y: 160 }, { id: "el2", x: 160, y: 153 }, { id: "el3", x: 180, y: 162 }, { id: "el4", x: 160, y: 168 },
    { id: "er1", x: 220, y: 162 }, { id: "er2", x: 240, y: 153 }, { id: "er3", x: 260, y: 160 }, { id: "er4", x: 240, y: 168 },
    // Nose Bridge & Tip
    { id: "n1", x: 200, y: 155 },
    { id: "n2", x: 200, y: 185 },
    { id: "n3", x: 200, y: 215 },
    { id: "n4", x: 185, y: 225 }, { id: "n5", x: 215, y: 225 },
    // Cheeks & Temples
    { id: "t1", x: 105, y: 175 }, { id: "t2", x: 295, y: 175 },
    { id: "ck1", x: 135, y: 225 }, { id: "ck2", x: 265, y: 225 },
    { id: "ck3", x: 165, y: 240 }, { id: "ck4", x: 235, y: 240 },
    // Mouth
    { id: "m1", x: 170, y: 265 }, { id: "m2", x: 200, y: 258 }, { id: "m3", x: 230, y: 265 },
    { id: "m4", x: 200, y: 275 }, { id: "m5", x: 185, y: 285 }, { id: "m6", x: 215, y: 285 },
    // Jaw & Chin
    { id: "j1", x: 115, y: 240 }, { id: "j2", x: 285, y: 240 },
    { id: "j3", x: 135, y: 300 }, { id: "j4", x: 265, y: 300 },
    { id: "j5", x: 165, y: 340 }, { id: "j6", x: 235, y: 340 },
    { id: "chin", x: 200, y: 355 },
    // Neck contour
    { id: "nk1", x: 160, y: 380 }, { id: "nk2", x: 240, y: 380 }
  ];

  // Wireframe triangle and quadrilateral connections
  const edges = [
    // Cranium
    ["c1", "c2"], ["c1", "c3"], ["c2", "c4"], ["c3", "c5"],
    ["c1", "f1"], ["c2", "f2"], ["c3", "f3"], ["c4", "f4"], ["c5", "f5"],
    // Forehead
    ["f1", "f2"], ["f1", "f3"], ["f2", "f4"], ["f3", "f5"],
    ["f2", "b1"], ["f2", "b2"], ["f1", "b2"], ["f1", "b3"], ["f3", "b3"], ["f3", "b4"],
    ["f4", "t1"], ["f5", "t2"], ["f4", "el1"], ["f5", "er3"],
    // Left Eye
    ["b1", "el1"], ["b1", "el2"], ["b2", "el2"], ["b2", "el3"],
    ["el1", "el2"], ["el2", "el3"], ["el3", "el4"], ["el4", "el1"],
    // Right Eye
    ["b3", "er1"], ["b3", "er2"], ["b4", "er2"], ["b4", "er3"],
    ["er1", "er2"], ["er2", "er3"], ["er3", "er4"], ["er4", "er1"],
    // Nose
    ["b2", "n1"], ["b3", "n1"], ["n1", "n2"], ["n2", "n3"],
    ["el3", "n1"], ["el3", "n2"], ["er1", "n1"], ["er1", "n2"],
    ["n3", "n4"], ["n3", "n5"], ["n2", "n4"], ["n2", "n5"],
    // Cheeks & Temples
    ["t1", "ck1"], ["t2", "ck2"], ["el1", "ck1"], ["er3", "ck2"],
    ["el4", "ck3"], ["er4", "ck4"], ["n4", "ck3"], ["n5", "ck4"],
    ["ck1", "ck3"], ["ck2", "ck4"],
    // Mouth
    ["n3", "m2"], ["n4", "m1"], ["n5", "m3"],
    ["m1", "m2"], ["m2", "m3"], ["m1", "m4"], ["m3", "m4"],
    ["m1", "m5"], ["m3", "m6"], ["m5", "m4"], ["m6", "m4"],
    ["ck3", "m1"], ["ck4", "m3"],
    // Jawline
    ["t1", "j1"], ["t2", "j2"], ["j1", "j3"], ["j2", "j4"],
    ["ck1", "j1"], ["ck2", "j2"], ["ck1", "j3"], ["ck2", "j4"],
    ["j3", "j5"], ["j4", "j6"], ["ck3", "j5"], ["ck4", "j6"],
    ["m5", "chin"], ["m6", "chin"], ["j5", "chin"], ["j6", "chin"],
    ["chin", "nk1"], ["chin", "nk2"], ["j5", "nk1"], ["j6", "nk2"]
  ];

  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  return (
    <div className="hud-panel p-4 flex flex-col justify-between h-full bg-[#050c18]/90 border border-[#0d2a45]">
      {/* Reticle brackets on panel corners */}
      <div className="reticle-tl" />
      <div className="reticle-tr" />
      <div className="reticle-bl" />
      <div className="reticle-br" />

      {/* Header with Mode Toggles */}
      <div className="flex items-center justify-between pb-3 border-b border-[#0d2a45]">
        <div className="flex items-center gap-2">
          <Scan className="w-3.5 h-3.5 text-hud-cyan animate-pulse" />
          <h3 className="text-xs font-mono font-bold tracking-widest text-hud-cyan uppercase">
            INPUT VIDEO FRAME
          </h3>
        </div>

        {rawImageUrl && (
          <div className="flex items-center gap-1 bg-[#091526] p-0.5 rounded border border-[#133454]">
            <button
              onClick={() => setViewMode("wireframe")}
              className={`px-2 py-0.5 text-[10px] font-mono rounded transition-colors ${
                viewMode === "wireframe" ? "bg-hud-cyan text-slate-950 font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              MESH
            </button>
            <button
              onClick={() => setViewMode("raw")}
              className={`px-2 py-0.5 text-[10px] font-mono rounded transition-colors ${
                viewMode === "raw" ? "bg-hud-cyan text-slate-950 font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              FEED
            </button>
            <button
              onClick={() => setViewMode("combined")}
              className={`px-2 py-0.5 text-[10px] font-mono rounded transition-colors ${
                viewMode === "combined" ? "bg-hud-cyan text-slate-950 font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              HUD
            </button>
          </div>
        )}
      </div>

      {/* Center 3D Wireframe Canvas */}
      <div className="relative my-auto flex items-center justify-center min-h-[310px] py-2 overflow-hidden">
        {/* Reticle Crosshairs and Inset Brackets */}
        <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-hud-cyan/60 pointer-events-none" />
        <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-hud-cyan/60 pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-hud-cyan/60 pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-hud-cyan/60 pointer-events-none" />

        {/* Ambient Grid overlay */}
        <div className="absolute inset-4 border border-hud-cyan/10 pointer-events-none bg-[radial-gradient(#00f0ff08_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Real media background if present */}
        {rawImageUrl && (viewMode === "raw" || viewMode === "combined") && (
          <img
            src={rawImageUrl}
            alt="Source Frame"
            className={`absolute max-h-[290px] w-auto object-contain rounded opacity-80 ${
              viewMode === "raw" ? "opacity-100" : "opacity-40 mix-blend-screen"
            }`}
          />
        )}

        {/* 3D Wireframe Face Mesh SVG */}
        {(viewMode === "wireframe" || viewMode === "combined") && (
          <svg
            viewBox="0 0 400 400"
            className="w-full h-[290px] max-w-[340px] glow-cyan transition-all duration-300"
          >
            <defs>
              <linearGradient id="cyanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#00b4d8" stopOpacity="0.4" />
              </linearGradient>
              <filter id="meshGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Connecting Edges */}
            {edges.map(([idA, idB], idx) => {
              const a = nodeMap.get(idA);
              const b = nodeMap.get(idB);
              if (!a || !b) return null;
              return (
                <line
                  key={`e-${idx}`}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke="#00f0ff"
                  strokeWidth="0.85"
                  strokeOpacity="0.65"
                />
              );
            })}

            {/* Nodes */}
            {nodes.map((node) => (
              <circle
                key={node.id}
                cx={node.x}
                cy={node.y}
                r="1.8"
                fill="#00f0ff"
                opacity="0.9"
                filter="url(#meshGlow)"
              />
            ))}

            {/* Pupil focal reticles */}
            <circle cx="160" cy="160" r="4" fill="none" stroke="#00f0ff" strokeWidth="1" opacity="0.8" />
            <circle cx="240" cy="160" r="4" fill="none" stroke="#00f0ff" strokeWidth="1" opacity="0.8" />
            <circle cx="160" cy="160" r="1.5" fill="#00f0ff" />
            <circle cx="240" cy="160" r="1.5" fill="#00f0ff" />
          </svg>
        )}

        {/* Scanning laser line animation */}
        <div className="absolute inset-x-8 top-0 h-[2px] bg-gradient-to-r from-transparent via-hud-cyan to-transparent animate-scanline opacity-60 pointer-events-none" />
      </div>

      {/* Scrubber and Video Controls Bar */}
      <div className="pt-3 border-t border-[#0d2a45] space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono text-hud-cyan tracking-wider">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="text-hud-cyan hover:text-white transition-colors"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            </button>
            <span className="text-slate-300">
              {formatTime(timestampSec)} <span className="text-slate-500">/</span> {formatTime(totalDurationSec)}
            </span>
          </div>

          <div className="text-hud-cyan/90">
            FRAME <span className="text-white font-bold">{currentFrame}</span> / {totalFrames}
          </div>
        </div>

        {/* Custom Progress Scrubber */}
        <div className="relative flex items-center group">
          <input
            type="range"
            min={1}
            max={totalFrames || 300}
            value={currentFrame}
            onChange={handleSliderChange}
            className="w-full h-1 bg-[#0b1c2f] rounded-lg appearance-none cursor-pointer accent-hud-cyan focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};
