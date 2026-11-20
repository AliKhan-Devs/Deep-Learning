"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Video as VideoIcon,
  ShieldAlert,
  ShieldCheck,
  FileText,
  AlertCircle,
  RefreshCw,
  Clock,
  Layers,
  Award,
  Play,
  Pause,
  Film,
  Zap,
} from "lucide-react";
import { api, ApiError } from "../../lib/api";
import { VideoAnalysisResponse, ModelInfo, VideoFrameDetail } from "../../lib/types";
import { UploadZone } from "../../components/UploadZone";
import { ModelSelector } from "../../components/ModelSelector";
import { ProgressBar } from "../../components/ProgressBar";
import { DisclaimerAlert } from "../../components/DisclaimerAlert";

export default function VideoAnalysisPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState("efficientnet_b4");
  const [submitting, setSubmitting] = useState(false);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [analysisState, setAnalysisState] = useState<VideoAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    api.getModels().then((m) => {
      setModels(m);
      if (m.length > 0) {
        const champ = m.find((x) => x.model_name === "efficientnet_b4");
        if (champ) {
          setSelectedModel("efficientnet_b4");
        } else {
          setSelectedModel(m[0].model_name);
        }
      }
    });

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const handleFileSelect = (selected: File) => {
    setFile(selected);
    setError(null);
    setAnalysisId(null);
    setAnalysisState(null);
    const url = URL.createObjectURL(selected);
    setPreviewUrl(url);
  };

  const handleClear = () => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    setFile(null);
    setPreviewUrl(null);
    setAnalysisId(null);
    setAnalysisState(null);
    setError(null);
  };

  const startPolling = (id: string) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    pollIntervalRef.current = setInterval(async () => {
      try {
        const state = await api.getAnalysisStatus(id);
        setAnalysisState(state);

        if (state.status === "COMPLETED" || state.status === "FAILED") {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          if (state.status === "FAILED") {
            setError(state.error_message || "Video analysis pipeline encountered an error.");
          }
        }
      } catch (err: any) {
        console.error("Polling error:", err);
      }
    }, 1500);
  };

  const handleStartAnalysis = async () => {
    if (!file) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await api.analyzeVideo(file, selectedModel);
      setAnalysisId(res.analysis_id);
      startPolling(res.analysis_id);
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 422) {
        setError(
          `Checkpoint Missing: ${err.message}. Please place 'best_model.pth' in the local artifacts directory.`
        );
      } else {
        setError(err.message || "Failed to submit video for analysis.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const isProcessing =
    analysisState?.status === "PENDING" || analysisState?.status === "PROCESSING";

  const isCompleted = analysisState?.status === "COMPLETED";
  const isFake =
    analysisState?.fake_probability !== undefined && analysisState.fake_probability >= 0.5;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-2">
              <VideoIcon className="w-3.5 h-3.5 text-blue-600" /> Video Forensics
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Temporal Video Deepfake Forensic Scanner
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Frame extraction at 0.75s intervals with face detection and trimmed-mean score aggregation.
            </p>
          </div>

          <Link
            href="/arena"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition-colors shadow-sm self-start sm:self-auto"
          >
            <Layers className="w-4 h-4 text-amber-600" />
            Compare Models in Arena
          </Link>
        </div>
      </div>

      {/* Model Selector & Upload Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Model Architecture Selector */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              1. Select Architecture
            </h2>
            <span className="text-xs text-slate-500">Default: Champion</span>
          </div>

          <ModelSelector
            models={models}
            selectedModel={selectedModel}
            onSelect={setSelectedModel}
            disabled={submitting || isProcessing}
          />
        </div>

        {/* Video Upload Dropzone */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              2. Upload Video
            </h2>
            <span className="text-xs text-slate-500">MP4, MOV, AVI (Max 150 MB)</span>
          </div>

          <UploadZone
            accept="video"
            onFileSelect={handleFileSelect}
            selectedFile={file}
            onClear={handleClear}
            disabled={submitting || isProcessing}
          />

          {file && !analysisId && (
            <div className="flex justify-end pt-2">
              <button
                onClick={handleStartAnalysis}
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Queuing Video...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" /> Start Video Analysis
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Pipeline Error: </span>
            {error}
          </div>
        </div>
      )}

      {/* Processing Telemetry Banner */}
      {isProcessing && (
        <div className="bg-white border border-blue-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  {analysisState?.status === "PENDING"
                    ? "Video Queued for Processing..."
                    : "Extracting Frames & Running Neural Inference..."}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sampling video frames at 0.75-second intervals with facial boundary tracking.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold animate-pulse">
              {analysisState?.progress_pct || 15}%
            </span>
          </div>

          <ProgressBar
            progress={analysisState?.progress_pct || 15}
            label="Frame Extraction & Biometric Classification"
          />
        </div>
      )}

      {/* Video Player with IN-VIDEO Detection Overlay */}
      {previewUrl && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Film className="w-5 h-5 text-blue-600" />
                Video Feed & In-Video Detection Display
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                All detection diagnostics, confidence scores, and frame telemetry are rendered directly inside the video stream.
              </p>
            </div>

            {isCompleted && (
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    isFake
                      ? "bg-red-50 text-red-700 border-red-200"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  }`}
                >
                  {analysisState?.prediction}
                </span>
              </div>
            )}
          </div>

          {/* Video Container with In-Video Overlay */}
          <div className="relative mx-auto max-w-2xl bg-black rounded-xl overflow-hidden border border-slate-200 shadow-md">
            <video
              ref={videoRef}
              src={previewUrl}
              controls
              className="w-full h-auto max-h-[440px] block"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />

            {/* In-Video Top Overlay Badge */}
            {isCompleted && (
              <div className="absolute top-4 left-4 z-20 pointer-events-none">
                <div
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg flex items-center gap-2 backdrop-blur-md ${
                    isFake
                      ? "bg-red-600/90 text-white border border-red-400"
                      : "bg-emerald-600/90 text-white border border-emerald-400"
                  }`}
                >
                  {isFake ? (
                    <ShieldAlert className="w-4 h-4 text-white" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-white" />
                  )}
                  <span>{analysisState?.prediction}</span>
                  <span className="text-[11px] opacity-90">
                    ({((analysisState?.fake_probability || 0) * 100).toFixed(1)}% Fake)
                  </span>
                </div>
              </div>
            )}

            {/* In-Video Bottom Telemetry Bar */}
            {isCompleted && (
              <div className="absolute bottom-12 left-4 right-4 z-20 pointer-events-none flex justify-between items-center text-[11px] font-mono text-white bg-black/60 px-3 py-1.5 rounded backdrop-blur-sm">
                <span>Model: {analysisState?.model_name}</span>
                <span>Frames Analyzed: {analysisState?.frames_analyzed}</span>
                <span>Suspicious Frames: {analysisState?.suspicious_frames_count}</span>
              </div>
            )}
          </div>

          {/* Timeline & Summary Details */}
          {isCompleted && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-500">Video Aggregation Verdict</div>
                <div
                  className={`text-base font-bold mt-1 ${
                    isFake ? "text-red-600" : "text-emerald-600"
                  }`}
                >
                  {analysisState?.prediction}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Trimmed-mean fake probability: {((analysisState?.fake_probability || 0) * 100).toFixed(1)}%
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-500">Sampled Frames</div>
                <div className="text-base font-bold text-slate-900 mt-1">
                  {analysisState?.frames_analyzed} frames
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {analysisState?.frames_with_faces} frames with detected faces
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-500">Execution Speed</div>
                <div className="text-base font-bold text-slate-900 mt-1">
                  {analysisState?.execution_duration_sec.toFixed(2)} seconds
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Processing architecture: {analysisState?.model_name}
                </div>
              </div>
            </div>
          )}

          {/* Timeline Filmstrip if available */}
          {isCompleted && analysisState?.timeline && analysisState.timeline.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                Sampled Frame Timeline Filmstrip
              </h3>

              <div className="flex gap-2 overflow-x-auto pb-2">
                {analysisState.timeline.map((frame: VideoFrameDetail) => {
                  const frameIsFake = frame.fake_probability >= 0.5;
                  return (
                    <div
                      key={frame.frame_index}
                      className={`shrink-0 w-28 p-2 rounded-lg border text-center text-xs space-y-1 ${
                        frameIsFake
                          ? "border-red-300 bg-red-50/50"
                          : "border-slate-200 bg-slate-50/50"
                      }`}
                    >
                      {frame.thumbnail_url ? (
                        <img
                          src={frame.thumbnail_url}
                          alt={`Frame ${frame.frame_index}`}
                          className="w-full h-16 object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-16 bg-slate-200 rounded flex items-center justify-center text-slate-400 text-[10px]">
                          Frame #{frame.frame_index}
                        </div>
                      )}
                      <div className="font-semibold text-slate-700">
                        {frame.timestamp_sec.toFixed(1)}s
                      </div>
                      <div
                        className={`text-[10px] font-bold ${
                          frameIsFake ? "text-red-600" : "text-emerald-600"
                        }`}
                      >
                        {(frame.fake_probability * 100).toFixed(0)}% Fake
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <DisclaimerAlert />
        </div>
      )}
    </div>
  );
}
