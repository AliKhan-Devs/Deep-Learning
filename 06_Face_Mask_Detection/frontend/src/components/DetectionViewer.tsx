"use client";

import React from "react";
import { Download, CheckCircle2, AlertTriangle, Eye, ShieldAlert, Sparkles } from "lucide-react";
import { ImageDetectionResult } from "../lib/types";

interface DetectionViewerProps {
  result: ImageDetectionResult | null;
  loading: boolean;
}

export const DetectionViewer: React.FC<DetectionViewerProps> = ({ result, loading }) => {
  if (loading) {
    return (
      <div className="bg-surface rounded-2xl border border-surface-light p-8 flex flex-col items-center justify-center min-h-[420px] text-center relative overflow-hidden">
        <div className="animate-scan" />
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-4 animate-pulse">
          <Eye className="w-8 h-8 text-cyan-400" />
        </div>
        <h3 className="text-sm font-semibold text-white mb-1">
          Executing YOLO Neural Inference...
        </h3>
        <p className="text-xs text-slate-400 max-w-sm">
          Processing multi-scale feature pyramid, predicting bounding boxes, and classifying facial masks.
        </p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-surface rounded-2xl border border-surface-light border-dashed p-8 flex flex-col items-center justify-center min-h-[420px] text-center">
        <div className="w-16 h-16 rounded-2xl bg-surface-light flex items-center justify-center mb-4 text-slate-500">
          <Eye className="w-8 h-8" />
        </div>
        <h3 className="text-sm font-semibold text-slate-300 mb-1">
          No Detection Output Yet
        </h3>
        <p className="text-xs text-slate-500 max-w-sm">
          Upload an image, drop a video file, select a sample benchmark, or enable live webcam to begin real-time detection.
        </p>
      </div>
    );
  }

  const handleDownload = () => {
    if (!result.annotated_image) return;
    const a = document.createElement("a");
    a.href = result.annotated_image;
    a.download = `facemask_detection_${Date.now()}.jpg`;
    a.click();
  };

  return (
    <div className="bg-surface rounded-2xl border border-surface-light p-5 shadow-xl space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 border-b border-surface-light">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-semibold text-sm text-white">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            Detection Output
          </div>
          <span className="text-xs text-slate-400 font-mono">
            ({result.image_dimensions.width}x{result.image_dimensions.height}px)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {result.status === "COMPLIANT" ? (
            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% COMPLIANT
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1.5 animate-pulse">
              <ShieldAlert className="w-3.5 h-3.5" /> NON-COMPLIANCE DETECTED
            </span>
          )}

          <button
            onClick={handleDownload}
            className="p-1.5 rounded-lg bg-surface-light hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700"
            title="Download Annotated Image"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main visual preview */}
      <div className="relative rounded-xl overflow-hidden bg-background border border-surface-light flex items-center justify-center max-h-[500px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={result.annotated_image}
          alt="YOLO Annotated Output"
          className="max-h-[500px] w-auto object-contain rounded-lg shadow-inner"
        />
      </div>

      {/* Detections table / pills */}
      <div>
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Individual Face Instances ({result.detections.length})
        </h4>

        {result.detections.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No human faces detected in frame.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
            {result.detections.map((det, idx) => {
              const isMask = det.class_id === 1;
              return (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                    isMask
                      ? "bg-emerald-500/[0.04] border-emerald-500/20 text-slate-200"
                      : "bg-rose-500/[0.06] border-rose-500/30 text-rose-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isMask ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <div>
                      <div className="font-semibold capitalize text-white flex items-center gap-1">
                        Face #{idx + 1}
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
                          isMask ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"
                        }`}>
                          {det.class_name.replace("_", " ")}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Box: [{det.box.join(", ")}]
                      </div>
                    </div>
                  </div>
                  <div className="font-mono font-bold text-xs text-right">
                    <span className={isMask ? "text-emerald-400" : "text-rose-400"}>
                      {(det.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
