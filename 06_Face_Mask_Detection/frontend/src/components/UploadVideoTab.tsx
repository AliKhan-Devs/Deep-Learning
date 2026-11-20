"use client";

import React, { useRef, useState } from "react";
import {
  Film,
  UploadCloud,
  Clock,
  CheckCircle2,
  AlertTriangle,
  PlaySquare,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { detectVideoUpload } from "../lib/api";
import { VideoDetectionResult } from "../lib/types";

interface UploadVideoTabProps {
  modelId: string;
  confThreshold: number;
}

export const UploadVideoTab: React.FC<UploadVideoTabProps> = ({
  modelId,
  confThreshold,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [videoResult, setVideoResult] = useState<VideoDetectionResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sampleRate, setSampleRate] = useState<number>(3);

  const handleFile = async (file: File) => {
    setErrorMsg(null);
    setLoading(true);
    setVideoResult(null);

    try {
      const res = await detectVideoUpload(file, confThreshold, sampleRate, modelId);
      setVideoResult(res);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to process video");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Upload Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-surface-light hover:border-cyan-500/50 rounded-2xl p-8 text-center cursor-pointer transition-all bg-surface/60 hover:bg-surface-light/40 group flex flex-col items-center justify-center min-h-[190px]"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
          }}
          accept="video/mp4,video/webm,video/quicktime"
          className="hidden"
        />
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 group-hover:bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center mb-3 transition-all">
          <Film className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
        </div>
        <h3 className="text-sm font-semibold text-white mb-1">
          Upload CCTV or Surveillance Video Clip
        </h3>
        <p className="text-xs text-slate-400">
          Supports MP4, MOV, WEBM • Up to 100MB
        </p>

        {/* Sample rate config */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="mt-4 flex items-center gap-2 bg-surface-light px-3 py-1.5 rounded-xl text-xs text-slate-300 border border-slate-700"
        >
          <span>Frame Sampling:</span>
          <select
            value={sampleRate}
            onChange={(e) => setSampleRate(parseInt(e.target.value))}
            className="bg-background border border-surface-light text-cyan-400 font-semibold rounded px-2 py-0.5 text-xs outline-none"
          >
            <option value={1}>Every Frame (1x - Full fidelity)</option>
            <option value={2}>Every 2nd Frame (2x - Faster)</option>
            <option value={3}>Every 3rd Frame (3x - Recommended)</option>
            <option value={5}>Every 5th Frame (5x - Ultra fast)</option>
          </select>
        </div>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="bg-surface rounded-2xl border border-surface-light p-8 text-center flex flex-col items-center justify-center relative overflow-hidden">
          <div className="animate-scan" />
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-3 animate-spin">
            <Film className="w-6 h-6 text-cyan-400" />
          </div>
          <h4 className="text-sm font-semibold text-white mb-1">
            Processing Video Temporal Frames...
          </h4>
          <p className="text-xs text-slate-400 max-w-sm">
            Applying batch YOLO inference, compiling chronological compliance metrics, and detecting safety violations.
          </p>
        </div>
      )}

      {/* Error banner */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Video Results View */}
      {videoResult && (
        <div className="bg-surface rounded-2xl border border-surface-light p-5 shadow-xl space-y-5">
          {/* Header Stats */}
          <div className="flex items-center justify-between pb-3 border-b border-surface-light">
            <div className="flex items-center gap-2">
              <PlaySquare className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-white">Video Analysis Audit Report</h3>
            </div>
            {videoResult.has_violations ? (
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1.5 animate-pulse">
                <ShieldAlert className="w-3.5 h-3.5" /> Violations Detected
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Compliant Passage
              </span>
            )}
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-background/80 p-3 rounded-xl border border-surface-light">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Video Duration</div>
              <div className="text-lg font-bold font-mono text-white mt-0.5">
                {videoResult.duration_seconds}s
              </div>
              <div className="text-[10px] text-slate-500">{videoResult.total_video_frames} frames</div>
            </div>

            <div className="bg-background/80 p-3 rounded-xl border border-surface-light">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Compliance Rate</div>
              <div className={`text-lg font-bold font-mono mt-0.5 ${
                videoResult.overall_compliance_rate >= 90 ? "text-emerald-400" : "text-rose-400"
              }`}>
                {videoResult.overall_compliance_rate}%
              </div>
              <div className="text-[10px] text-slate-500">Overall footage score</div>
            </div>

            <div className="bg-background/80 p-3 rounded-xl border border-surface-light">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Masked Instances</div>
              <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
                {videoResult.total_mask_detections}
              </div>
              <div className="text-[10px] text-slate-500">Cumulative detections</div>
            </div>

            <div className="bg-background/80 p-3 rounded-xl border border-surface-light">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Unmasked Violations</div>
              <div className={`text-lg font-bold font-mono mt-0.5 ${
                videoResult.total_no_mask_detections > 0 ? "text-rose-400" : "text-slate-400"
              }`}>
                {videoResult.total_no_mask_detections}
              </div>
              <div className="text-[10px] text-slate-500">Alert triggers</div>
            </div>
          </div>

          {/* Temporal Timeline */}
          {videoResult.timeline.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Temporal Compliance Distribution
                </h4>
                <span className="text-[11px] text-slate-500">Green = Compliant • Red = Non-Compliant</span>
              </div>
              <div className="h-7 w-full bg-surface-light rounded-lg flex overflow-hidden border border-slate-700/60 p-0.5 gap-0.5">
                {videoResult.timeline.map((point, idx) => (
                  <div
                    key={idx}
                    title={`At ${point.timestamp}s: ${point.mask_count} masks, ${point.no_mask_count} violations`}
                    className={`h-full flex-1 rounded-sm transition-all ${
                      point.is_compliant
                        ? point.total_faces > 0
                          ? "bg-emerald-500 hover:brightness-125"
                          : "bg-slate-700/40"
                        : "bg-rose-500 hover:brightness-125 animate-pulse"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Violation Keyframes Filmstrip */}
          {videoResult.violation_keyframes.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Violation Incident Keyframes ({videoResult.violation_keyframes.length})
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {videoResult.violation_keyframes.map((kf, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl overflow-hidden border border-rose-500/30 bg-background p-1.5 shadow-md"
                  >
                    <div className="aspect-video rounded-lg overflow-hidden bg-black mb-1.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={kf.thumbnail}
                        alt={`Violation at ${kf.timestamp}s`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] px-1">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        {kf.timestamp}s
                      </span>
                      <span className="text-rose-400 font-bold font-mono">
                        {kf.no_mask_count} Unmasked
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
