"use client";

import React, { useRef } from "react";
import { UploadCloud, Image as ImageIcon, Sparkles, CheckCircle2, AlertTriangle, Download } from "lucide-react";
import { SampleImage, ImageDetectionResult } from "../lib/types";

interface UploadImageTabProps {
  onSelectFile: (file: File) => void;
  onSelectSample: (sample: SampleImage) => void;
  samples: SampleImage[];
  result: ImageDetectionResult | null;
  loading: boolean;
}

export const UploadImageTab: React.FC<UploadImageTabProps> = ({
  onSelectFile,
  onSelectSample,
  samples,
  result,
  loading,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onSelectFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-5">
      {/* Upload Drag & Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-300 hover:border-sky-500 rounded-2xl p-8 text-center cursor-pointer transition-all bg-slate-50 hover:bg-sky-50/40 group flex flex-col items-center justify-center min-h-[170px]"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              onSelectFile(e.target.files[0]);
            }
          }}
          accept="image/*"
          className="hidden"
        />
        <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
          <UploadCloud className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-800 mb-0.5">
          Click to upload or drag & drop image
        </h3>
        <p className="text-xs text-slate-500">
          Supports JPG, PNG, WEBP • Instant bounding box detection
        </p>
      </div>

      {/* 1-Click Benchmark Samples */}
      {samples.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              1-Click Validation Test Images
            </h4>
            <span className="text-[11px] text-slate-400">Instant Benchmark</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {samples.map((sample) => (
              <button
                key={sample.id}
                onClick={() => onSelectSample(sample)}
                disabled={loading}
                className="group rounded-xl border border-slate-200 hover:border-sky-400 p-1.5 bg-slate-50 hover:bg-white text-left transition-all disabled:opacity-50 shadow-sm"
              >
                <div className="aspect-[4/3] rounded-lg overflow-hidden bg-slate-200 relative mb-1.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`http://127.0.0.1:8003${sample.url}`}
                    alt={sample.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <div className="text-[11px] font-semibold text-slate-700 truncate group-hover:text-sky-600">
                  {sample.title}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* In-Place Image Detection Output */}
      {loading && (
        <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
          <div className="inline-block animate-spin text-sky-600 mb-2">
            <ImageIcon className="w-8 h-8" />
          </div>
          <p className="text-xs font-semibold text-slate-700">Running YOLO Object Detection...</p>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-3 pt-3 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800">
                Detection Result ({result.total_faces} Face{result.total_faces !== 1 ? "s" : ""})
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {result.image_dimensions.width}x{result.image_dimensions.height}px • {result.inference_time_ms}ms
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${
                result.status === "COMPLIANT"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}>
                {result.status === "COMPLIANT" ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {result.compliance_rate}% Compliant
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600" /> {result.no_mask_count} Violations
                  </>
                )}
              </span>

              <a
                href={result.annotated_image}
                download="detected_mask.jpg"
                className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                title="Download Annotated Image"
              >
                <Download className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Annotated Image with Bounding Boxes */}
          <div className="rounded-xl overflow-hidden bg-slate-900 border border-slate-300 flex items-center justify-center max-h-[500px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={result.annotated_image}
              alt="Detected Faces with Bounding Boxes"
              className="w-full h-auto max-h-[500px] object-contain"
            />
          </div>

          {/* Detections List */}
          {result.detections.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {result.detections.map((det, idx) => {
                const isMask = det.class_id === 1;
                return (
                  <div
                    key={idx}
                    className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
                      isMask
                        ? "bg-emerald-50/60 border-emerald-200 text-emerald-800"
                        : "bg-red-50/60 border-red-200 text-red-800"
                    }`}
                  >
                    <span className="font-semibold capitalize flex items-center gap-1">
                      {isMask ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      )}
                      {det.class_name.replace("_", " ")}
                    </span>
                    <span className="font-mono font-bold">
                      {(det.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
