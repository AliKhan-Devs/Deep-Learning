"use client";

import React, { useState, useRef } from "react";
import { Play, Pause, Scan, Eye, Activity, Target } from "lucide-react";
import { FacePrediction } from "../lib/types";

interface BiometricFaceMeshProps {
  currentFrame?: number;
  totalFrames?: number;
  timestampSec?: number;
  totalDurationSec?: number;
  onFrameChange?: (frame: number) => void;
  rawImageUrl?: string | null;
  faces?: FacePrediction[];
  isVideo?: boolean;
  fakeProbability?: number;
}

export const BiometricFaceMesh: React.FC<BiometricFaceMeshProps> = ({
  currentFrame = 38,
  totalFrames = 300,
  timestampSec = 1.25,
  totalDurationSec = 10.0,
  onFrameChange,
  rawImageUrl,
  faces = [],
  isVideo = false,
  fakeProbability = 0.82,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  // Default to 'feed' when a real image is provided; otherwise 'wireframe'
  const [viewMode, setViewMode] = useState<"feed" | "wireframe" | "combined">(
    rawImageUrl ? "feed" : "wireframe"
  );
  const [hoveredFaceIdx, setHoveredFaceIdx] = useState<number | null>(null);

  // Store image natural dimensions to calculate exact bounding box percentages
  const [imgNaturalSize, setImgNaturalSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    setImgNaturalSize({
      width: target.naturalWidth,
      height: target.naturalHeight,
    });
  };

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

  // 3D wireframe biometric mesh nodes
  const nodes = [
    { id: "c1", x: 200, y: 55 },
    { id: "c2", x: 160, y: 70 }, { id: "c3", x: 240, y: 70 },
    { id: "c4", x: 125, y: 100 }, { id: "c5", x: 275, y: 100 },
    { id: "f1", x: 200, y: 105 },
    { id: "f2", x: 165, y: 110 }, { id: "f3", x: 235, y: 110 },
    { id: "f4", x: 130, y: 135 }, { id: "f5", x: 270, y: 135 },
    { id: "b1", x: 155, y: 145 }, { id: "b2", x: 185, y: 142 },
    { id: "b3", x: 215, y: 142 }, { id: "b4", x: 245, y: 145 },
    { id: "el1", x: 140, y: 160 }, { id: "el2", x: 160, y: 153 }, { id: "el3", x: 180, y: 162 }, { id: "el4", x: 160, y: 168 },
    { id: "er1", x: 220, y: 162 }, { id: "er2", x: 240, y: 153 }, { id: "er3", x: 260, y: 160 }, { id: "er4", x: 240, y: 168 },
    { id: "n1", x: 200, y: 155 }, { id: "n2", x: 200, y: 185 }, { id: "n3", x: 200, y: 215 },
    { id: "n4", x: 185, y: 225 }, { id: "n5", x: 215, y: 225 },
    { id: "t1", x: 105, y: 175 }, { id: "t2", x: 295, y: 175 },
    { id: "ck1", x: 135, y: 225 }, { id: "ck2", x: 265, y: 225 },
    { id: "ck3", x: 165, y: 240 }, { id: "ck4", x: 235, y: 240 },
    { id: "m1", x: 170, y: 265 }, { id: "m2", x: 200, y: 258 }, { id: "m3", x: 230, y: 265 },
    { id: "m4", x: 200, y: 275 }, { id: "m5", x: 185, y: 285 }, { id: "m6", x: 215, y: 285 },
    { id: "j1", x: 115, y: 240 }, { id: "j2", x: 285, y: 240 },
    { id: "j3", x: 135, y: 300 }, { id: "j4", x: 265, y: 300 },
    { id: "j5", x: 165, y: 340 }, { id: "j6", x: 235, y: 340 },
    { id: "chin", x: 200, y: 355 },
    { id: "nk1", x: 160, y: 380 }, { id: "nk2", x: 240, y: 380 }
  ];

  const edges = [
    ["c1", "c2"], ["c1", "c3"], ["c2", "c4"], ["c3", "c5"],
    ["c1", "f1"], ["c2", "f2"], ["c3", "f3"], ["c4", "f4"], ["c5", "f5"],
    ["f1", "f2"], ["f1", "f3"], ["f2", "f4"], ["f3", "f5"],
    ["f2", "b1"], ["f2", "b2"], ["f1", "b2"], ["f1", "b3"], ["f3", "b3"], ["f3", "b4"],
    ["f4", "t1"], ["f5", "t2"], ["f4", "el1"], ["f5", "er3"],
    ["b1", "el1"], ["b1", "el2"], ["b2", "el2"], ["b2", "el3"],
    ["el1", "el2"], ["el2", "el3"], ["el3", "el4"], ["el4", "el1"],
    ["b3", "er1"], ["b3", "er2"], ["b4", "er2"], ["b4", "er3"],
    ["er1", "er2"], ["er2", "er3"], ["er3", "er4"], ["er4", "er1"],
    ["b2", "n1"], ["b3", "n1"], ["n1", "n2"], ["n2", "n3"],
    ["el3", "n1"], ["el3", "n2"], ["er1", "n1"], ["er1", "n2"],
    ["n3", "n4"], ["n3", "n5"], ["n2", "n4"], ["n2", "n5"],
    ["t1", "ck1"], ["t2", "ck2"], ["el1", "ck1"], ["er3", "ck2"],
    ["el4", "ck3"], ["er4", "ck4"], ["n4", "ck3"], ["n5", "ck4"],
    ["ck1", "ck3"], ["ck2", "ck4"],
    ["n3", "m2"], ["n4", "m1"], ["n5", "m3"],
    ["m1", "m2"], ["m2", "m3"], ["m1", "m4"], ["m3", "m4"],
    ["m1", "m5"], ["m3", "m6"], ["m5", "m4"], ["m6", "m4"],
    ["ck3", "m1"], ["ck4", "m3"],
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
            {isVideo ? "INPUT VIDEO FRAME" : "INPUT SOURCE FEED"}
          </h3>
        </div>

        {rawImageUrl && (
          <div className="flex items-center gap-1 bg-[#091526] p-0.5 rounded border border-[#133454]">
            <button
              onClick={() => setViewMode("feed")}
              className={`px-2 py-0.5 text-[10px] font-mono rounded transition-colors ${
                viewMode === "feed" ? "bg-hud-cyan text-slate-950 font-bold" : "text-slate-400 hover:text-white"
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
            <button
              onClick={() => setViewMode("wireframe")}
              className={`px-2 py-0.5 text-[10px] font-mono rounded transition-colors ${
                viewMode === "wireframe" ? "bg-hud-cyan text-slate-950 font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              MESH
            </button>
          </div>
        )}
      </div>

      {/* Center Display: Shows Real Uploaded Image with Accurate Bounding Boxes OR 3D Wireframe */}
      <div className="relative my-auto flex items-center justify-center min-h-[310px] py-2 overflow-hidden">
        {/* Reticle Crosshairs and Inset Brackets */}
        <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-hud-cyan/60 pointer-events-none z-20" />
        <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-hud-cyan/60 pointer-events-none z-20" />
        <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-hud-cyan/60 pointer-events-none z-20" />
        <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-hud-cyan/60 pointer-events-none z-20" />

        {/* Ambient Grid overlay */}
        <div className="absolute inset-4 border border-hud-cyan/10 pointer-events-none bg-[radial-gradient(#00f0ff08_1px,transparent_1px)] [background-size:16px_16px] z-0" />

        {/* Real Source Image Display with Percentage-Accurate Bounding Boxes */}
        {rawImageUrl && (viewMode === "feed" || viewMode === "combined") && (
          <div className="relative inline-block max-w-full max-h-[290px] z-10">
            {/* The base source image */}
            <img
              src={rawImageUrl}
              alt="Source Frame"
              onLoad={handleImageLoad}
              className={`max-h-[285px] w-auto max-w-full object-contain block mx-auto rounded shadow-2xl transition-opacity duration-300 ${
                viewMode === "feed" ? "opacity-100" : "opacity-55"
              }`}
            />

            {/* Exactly Aligned Face Bounding Boxes */}
            {imgNaturalSize.width > 0 &&
              faces.map((f, i) => {
                const isFake = f.predicted_label === "FAKE" || f.fake_probability >= 0.5;
                const isHovered = hoveredFaceIdx === f.face_index;

                // Accurate percentage calculation based on original image dimensions
                const natW = imgNaturalSize.width;
                const natH = imgNaturalSize.height;

                const leftPct = (f.bbox.x / natW) * 100;
                const topPct = (f.bbox.y / natH) * 100;
                const widthPct = (f.bbox.w / natW) * 100;
                const heightPct = (f.bbox.h / natH) * 100;

                return (
                  <div
                    key={f.face_index}
                    onMouseEnter={() => setHoveredFaceIdx(f.face_index)}
                    onMouseLeave={() => setHoveredFaceIdx(null)}
                    className={`absolute transition-all cursor-pointer font-mono ${
                      isFake
                        ? "border border-hud-amber bg-hud-amber/15 shadow-[0_0_12px_rgba(255,153,0,0.6)]"
                        : "border border-hud-green bg-hud-green/15 shadow-[0_0_12px_rgba(0,255,170,0.5)]"
                    } ${isHovered ? "ring-2 ring-white/80 z-30" : "z-20"}`}
                    style={{
                      left: `${leftPct}%`,
                      top: `${topPct}%`,
                      width: `${widthPct}%`,
                      height: `${heightPct}%`,
                    }}
                  >
                    {/* Corner Reticle Brackets */}
                    <div
                      className={`absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 ${
                        isFake ? "border-hud-amber" : "border-hud-green"
                      }`}
                    />
                    <div
                      className={`absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 ${
                        isFake ? "border-hud-amber" : "border-hud-green"
                      }`}
                    />
                    <div
                      className={`absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 ${
                        isFake ? "border-hud-amber" : "border-hud-green"
                      }`}
                    />
                    <div
                      className={`absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 ${
                        isFake ? "border-hud-amber" : "border-hud-green"
                      }`}
                    />

                    {/* Reticle Tag Badge */}
                    <div
                      className={`absolute -top-5 left-0 px-1.5 py-0.2 rounded text-[9px] font-black tracking-wider uppercase whitespace-nowrap shadow-md ${
                        isFake ? "bg-hud-amber text-slate-950" : "bg-hud-green text-slate-950"
                      }`}
                    >
                      #0{i + 1}: {f.predicted_label} ({(f.confidence * 100).toFixed(0)}%)
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {/* 3D Wireframe Face Mesh SVG Overlay or Standalone */}
        {(viewMode === "wireframe" || viewMode === "combined") && (
          <svg
            viewBox="0 0 400 400"
            className={`w-full h-[290px] max-w-[340px] glow-cyan transition-all duration-300 z-10 ${
              viewMode === "combined" ? "absolute inset-0 m-auto pointer-events-none opacity-75" : ""
            }`}
          >
            <defs>
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

            {/* Eye Pupil Reticles */}
            <circle cx="160" cy="160" r="4" fill="none" stroke="#00f0ff" strokeWidth="1" opacity="0.8" />
            <circle cx="240" cy="160" r="4" fill="none" stroke="#00f0ff" strokeWidth="1" opacity="0.8" />
            <circle cx="160" cy="160" r="1.5" fill="#00f0ff" />
            <circle cx="240" cy="160" r="1.5" fill="#00f0ff" />
          </svg>
        )}

        {/* Scanning laser line animation */}
        <div className="absolute inset-x-8 top-0 h-[2px] bg-gradient-to-r from-transparent via-hud-cyan to-transparent animate-scanline opacity-60 pointer-events-none z-20" />
      </div>

      {/* Bottom Controls / Telemetry */}
      {isVideo ? (
        /* Video Frame Scrubber */
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
      ) : (
        /* Image Spatial Telemetry Footer */
        <div className="pt-2.5 border-t border-[#0d2a45] flex items-center justify-between text-[10px] font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-hud-cyan animate-pulse glow-cyan" />
            <span className="text-hud-cyan font-bold">
              {faces.length > 0
                ? `${faces.length} TARGET${faces.length > 1 ? "S" : ""} LOCKED`
                : rawImageUrl
                ? "IMAGE LOADED &bull; SCAN COMPLETE"
                : "STANDBY // SYNTHETIC MESH"}
            </span>
          </div>

          {imgNaturalSize.width > 0 && (
            <div className="text-slate-400">
              RES: <span className="text-white">{imgNaturalSize.width}×{imgNaturalSize.height}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
