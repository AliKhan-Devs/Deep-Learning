"use client";

import React, { useRef } from "react";
import { UploadCloud, Image as ImageIcon, Sparkles } from "lucide-react";
import { SampleImage } from "../lib/types";

interface UploadImageTabProps {
  onSelectFile: (file: File) => void;
  onSelectSample: (sample: SampleImage) => void;
  samples: SampleImage[];
  loading: boolean;
}

export const UploadImageTab: React.FC<UploadImageTabProps> = ({
  onSelectFile,
  onSelectSample,
  samples,
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
    <div className="space-y-4">
      {/* Drag & Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-surface-light hover:border-cyan-500/50 rounded-2xl p-8 text-center cursor-pointer transition-all bg-surface/60 hover:bg-surface-light/40 group flex flex-col items-center justify-center min-h-[190px]"
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
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 group-hover:bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center mb-3 transition-all">
          <UploadCloud className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
        </div>
        <h3 className="text-sm font-semibold text-white mb-1">
          Click to upload or drag & drop image
        </h3>
        <p className="text-xs text-slate-400">
          Supports JPG, PNG, WEBP, or high-res photos up to 25MB
        </p>
      </div>

      {/* 1-Click Sample Benchmark Images */}
      {samples.length > 0 && (
        <div className="bg-surface rounded-2xl border border-surface-light p-4 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              1-Click Benchmark Samples (Validation Set)
            </h4>
            <span className="text-[11px] text-slate-500">Instant Test</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {samples.map((sample) => (
              <button
                key={sample.id}
                onClick={() => onSelectSample(sample)}
                disabled={loading}
                className="group relative rounded-xl overflow-hidden border border-surface-light hover:border-cyan-500/60 transition-all text-left bg-background p-1.5 disabled:opacity-50"
              >
                <div className="aspect-[4/3] rounded-lg overflow-hidden bg-surface-light/50 relative mb-1.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`http://127.0.0.1:8003${sample.url}`}
                    alt={sample.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-cyan-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-cyan-300" />
                  </div>
                </div>
                <div className="text-[11px] font-medium text-slate-200 truncate group-hover:text-cyan-400">
                  {sample.title}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
