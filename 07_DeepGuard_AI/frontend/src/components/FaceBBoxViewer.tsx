import React, { useState } from "react";
import { FacePrediction } from "../lib/types";

interface FaceBBoxViewerProps {
  imageSrc: string;
  faces: FacePrediction[];
}

export const FaceBBoxViewer: React.FC<FaceBBoxViewerProps> = ({ imageSrc, faces }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <div className="relative rounded overflow-hidden border border-[#0d2a45] bg-[#030712] shadow-2xl flex items-center justify-center p-2">
      <div className="relative inline-block max-w-full">
        {/* Render base image */}
        <img
          src={imageSrc}
          alt="Analyzed forensic target"
          className="max-h-[460px] w-auto object-contain block mx-auto rounded"
        />

        {/* Overlay bounding boxes with reticle brackets */}
        {faces.map((f, i) => {
          const isFake = f.predicted_label === "FAKE";
          const isHovered = hoveredIdx === f.face_index;

          return (
            <div
              key={f.face_index}
              onMouseEnter={() => setHoveredIdx(f.face_index)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`absolute transition-all cursor-pointer font-mono ${
                isFake
                  ? "border border-hud-amber bg-hud-amber/15 shadow-[0_0_15px_rgba(255,153,0,0.5)]"
                  : "border border-hud-green bg-hud-green/15 shadow-[0_0_15px_rgba(0,255,170,0.4)]"
              } ${isHovered ? "ring-2 ring-white/60 z-20" : "z-10"}`}
              style={{
                left: `${f.bbox.x}px`,
                top: `${f.bbox.y}px`,
                width: `${f.bbox.w}px`,
                height: `${f.bbox.h}px`,
              }}
            >
              {/* Corner reticles for bounding box */}
              <div
                className={`absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 ${
                  isFake ? "border-hud-amber" : "border-hud-green"
                }`}
              />
              <div
                className={`absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 ${
                  isFake ? "border-hud-amber" : "border-hud-green"
                }`}
              />
              <div
                className={`absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 ${
                  isFake ? "border-hud-amber" : "border-hud-green"
                }`}
              />
              <div
                className={`absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 ${
                  isFake ? "border-hud-amber" : "border-hud-green"
                }`}
              />

              {/* Tooltip Tag */}
              <div
                className={`absolute -top-6 left-0 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider text-slate-950 uppercase shadow-md whitespace-nowrap ${
                  isFake ? "bg-hud-amber text-slate-950 font-black" : "bg-hud-green text-slate-950 font-black"
                }`}
              >
                TARGET #0{i + 1}: {f.predicted_label} ({(f.confidence * 100).toFixed(1)}%)
              </div>
            </div>
          );
        })}
      </div>

      {faces.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 text-center text-slate-400 font-mono text-xs">
          NO FACIAL TARGETS IDENTIFIED IN BUFFER.
        </div>
      )}
    </div>
  );
};
