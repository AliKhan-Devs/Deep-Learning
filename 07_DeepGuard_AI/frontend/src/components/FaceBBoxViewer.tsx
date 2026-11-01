import React, { useState } from "react";
import { FacePrediction } from "../lib/types";

interface FaceBBoxViewerProps {
  imageSrc: string;
  faces: FacePrediction[];
}

export const FaceBBoxViewer: React.FC<FaceBBoxViewerProps> = ({ imageSrc, faces }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-black/60 shadow-2xl flex items-center justify-center">
      <div className="relative inline-block max-w-full">
        {/* Render base image */}
        <img
          src={imageSrc}
          alt="Analyzed forensic target"
          className="max-h-[500px] w-auto object-contain block mx-auto"
        />

        {/* Overlay bounding boxes */}
        {faces.map((f, i) => {
          const isFake = f.predicted_label === "FAKE";
          const isHovered = hoveredIdx === f.face_index;

          return (
            <div
              key={f.face_index}
              onMouseEnter={() => setHoveredIdx(f.face_index)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`absolute transition-all cursor-pointer ${
                isFake
                  ? "border-2 border-rose-500 bg-rose-500/10 shadow-[0_0_15px_rgba(244,63,94,0.4)]"
                  : "border-2 border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
              } ${isHovered ? "ring-4 ring-white/50 z-20" : "z-10"}`}
              style={{
                left: `${f.bbox.x}px`,
                top: `${f.bbox.y}px`,
                width: `${f.bbox.w}px`,
                height: `${f.bbox.h}px`,
              }}
            >
              {/* Tooltip Tag */}
              <div
                className={`absolute -top-7 left-0 px-2 py-0.5 rounded text-[11px] font-bold text-white shadow-md whitespace-nowrap ${
                  isFake ? "bg-rose-600" : "bg-emerald-600"
                }`}
              >
                Face #{i + 1}: {f.predicted_label} ({(f.confidence * 100).toFixed(1)}%)
              </div>
            </div>
          );
        })}
      </div>

      {faces.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm p-6 text-center text-slate-400 text-sm">
          No faces detected in this image.
        </div>
      )}
    </div>
  );
};
