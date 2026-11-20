"use client";

import React, { useRef, useState } from "react";
import {
  Film,
  Clock,
  CheckCircle2,
  AlertTriangle,
  PlaySquare,
  ShieldCheck,
  ShieldAlert,
  Loader2,
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
  const [activePreviewImage, setActivePreviewImage] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setErrorMsg(null);
    setLoading(true);
    setVideoResult(null);
    setActivePreviewImage(null);

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
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-5">
      {/* Upload Zone (shown before upload or as a compact bar once processed) */}
      {!videoResult && !loading && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 hover:border-sky-500 rounded-2xl p-10 text-center cursor-pointer transition-all bg-slate-50 hover:bg-sky-50/40 group flex flex-col items-center justify-center min-h-[220px]"
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
          <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Film className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 mb-1">
            Upload Surveillance or CCTV Video File
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Supports MP4, MOV, WEBM • Up to 100MB
          </p>

          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl text-xs text-slate-600 border border-slate-200 shadow-sm"
          >
            <span>Sampling:</span>
            <select
              value={sampleRate}
              onChange={(e) => setSampleRate(parseInt(e.target.value))}
              className="bg-slate-50 border border-slate-200 text-sky-700 font-semibold rounded px-2 py-0.5 text-xs outline-none"
            >
              <option value={1}>Every 1st frame (Full precision)</option>
              <option value={2}>Every 2nd frame (Fast)</option>
              <option value={3}>Every 3rd frame (Balanced)</option>
              <option value={5}>Every 5th frame (Ultra fast)</option>
            </select>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="w-10 h-10 text-sky-600 animate-spin mb-3" />
          <h4 className="text-base font-semibold text-slate-900 mb-1">
            Processing Video & Overlaying In-Video Detections...
          </h4>
          <p className="text-xs text-slate-500 max-w-md leading-relaxed">
            Scanning every frame, localizing faces, predicting mask compliance, and generating the annotated video stream.
          </p>
        </div>
      )}

      {/* Error alert */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Processed Video View: All detections shown IN THE VIDEO */}
      {videoResult && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <PlaySquare className="w-4 h-4 text-sky-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Processed Video with In-Video Bounding Boxes
              </h3>
            </div>
            <button
              onClick={() => {
                setVideoResult(null);
                setActivePreviewImage(null);
              }}
              className="text-xs text-sky-600 hover:text-sky-800 font-medium"
            >
              Upload Another Video
            </button>
          </div>

          {/* Video Container showing detections directly inside */}
          <div className="relative rounded-xl overflow-hidden bg-black border border-slate-300 min-h-[360px] max-h-[520px] flex items-center justify-center">
            {activePreviewImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={activePreviewImage}
                alt="Selected Violation Frame"
                className="w-full h-full max-h-[500px] object-contain"
              />
            ) : videoResult.video_url ? (
              <video
                controls
                autoPlay
                playsInline
                className="w-full h-full max-h-[500px] object-contain"
                src={`http://127.0.0.1:8003${videoResult.video_url}`}
              >
                Your browser does not support HTML5 video playback.
              </video>
            ) : videoResult.violation_keyframes.length > 0 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={videoResult.violation_keyframes[0].thumbnail}
                alt="First violation frame"
                className="w-full h-full max-h-[500px] object-contain"
              />
            ) : (
              <div className="text-white text-xs">Video processed successfully</div>
            )}

            {/* In-video badge */}
            <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/20 text-xs font-semibold text-white shadow-md flex items-center gap-1.5">
              {videoResult.has_violations ? (
                <>
                  <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-red-300">
                    {videoResult.total_no_mask_detections} Violations Detected
                  </span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">100% Compliant</span>
                </>
              )}
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Compliance Score</span>
              <div className={`text-xl font-bold font-mono mt-0.5 ${
                videoResult.overall_compliance_rate >= 90 ? "text-emerald-600" : "text-red-600"
              }`}>
                {videoResult.overall_compliance_rate}%
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Video Duration</span>
              <div className="text-xl font-bold font-mono text-slate-800 mt-0.5">
                {videoResult.duration_seconds}s
              </div>
              <div className="text-[10px] text-slate-500">{videoResult.total_video_frames} frames</div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Masked Faces</span>
              <div className="text-xl font-bold font-mono text-emerald-600 mt-0.5">
                {videoResult.total_mask_detections}
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Unmasked Violations</span>
              <div className={`text-xl font-bold font-mono mt-0.5 ${
                videoResult.total_no_mask_detections > 0 ? "text-red-600 font-bold" : "text-slate-600"
              }`}>
                {videoResult.total_no_mask_detections}
              </div>
            </div>
          </div>

          {/* Temporal Timeline */}
          {videoResult.timeline.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Chronological Compliance Bar</span>
                <span>Green = Compliant • Red = Non-Compliant</span>
              </div>
              <div className="h-6 w-full bg-slate-200 rounded-lg flex overflow-hidden p-0.5 gap-0.5">
                {videoResult.timeline.map((point, idx) => (
                  <div
                    key={idx}
                    title={`At ${point.timestamp}s: ${point.mask_count} masks, ${point.no_mask_count} violations`}
                    className={`h-full flex-1 rounded-sm transition-all ${
                      point.is_compliant
                        ? point.total_faces > 0
                          ? "bg-emerald-500"
                          : "bg-slate-300"
                        : "bg-red-500"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Violation Keyframes: Click to display right in the main video */}
          {videoResult.violation_keyframes.length > 0 && (
            <div className="pt-2">
              <h4 className="text-xs font-bold text-red-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Click Any Violation Keyframe to Preview in Screen ({videoResult.violation_keyframes.length})
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {videoResult.violation_keyframes.map((kf, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePreviewImage(kf.thumbnail)}
                    className="rounded-xl overflow-hidden border border-red-200 bg-red-50/50 p-1.5 hover:border-red-400 text-left transition-all group"
                  >
                    <div className="aspect-video rounded-lg overflow-hidden bg-black mb-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={kf.thumbnail}
                        alt={`Violation at ${kf.timestamp}s`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] px-1 text-slate-600">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {kf.timestamp}s
                      </span>
                      <span className="text-red-600 font-bold">
                        {kf.no_mask_count} No Mask
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
