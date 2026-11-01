"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Video as VideoIcon,
  ShieldAlert,
  FileText,
  AlertCircle,
  RefreshCw,
  Clock,
  Layers,
  AlertTriangle
} from "lucide-react";
import { api, ApiError } from "../../lib/api";
import { VideoAnalysisResponse, ModelInfo } from "../../lib/types";
import { UploadZone } from "../../components/UploadZone";
import { ModelSelector } from "../../components/ModelSelector";
import { VideoTimeline } from "../../components/VideoTimeline";
import { StatusBadge } from "../../components/StatusBadge";
import { ProgressBar } from "../../components/ProgressBar";
import { DisclaimerAlert } from "../../components/DisclaimerAlert";

export default function VideoAnalysisPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState("efficientnet_b0");
  const [submitting, setSubmitting] = useState(false);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [analysisState, setAnalysisState] = useState<VideoAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    api.getModels().then((m) => {
      setModels(m);
      if (m.length > 0 && !selectedModel) {
        setSelectedModel(m[0].model_name);
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
          `Checkpoint Missing: ${err.message}. Please train the model in Google Colab and place 'best_model.pth' in the local directory.`
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

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Video Forensic Analysis
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Controlled frame extraction, multi-face tracking, and temporal score aggregation across video sequences.
        </p>
      </div>

      {/* Model Selector */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-md">
        <ModelSelector
          models={models}
          selectedModel={selectedModel}
          onSelect={setSelectedModel}
          disabled={submitting || isProcessing}
        />
      </div>

      {/* Upload Box */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-md space-y-4">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
          Source Video Recording
        </label>
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
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 flex items-center gap-2 shadow-lg shadow-sky-500/25 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Enqueuing Video...
                </>
              ) : (
                "Initiate Video Forensic Scan"
              )}
            </button>
          </div>
        )}
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-950/30 text-rose-300 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">Error: </span>
            {error}
          </div>
        </div>
      )}

      {/* Processing Progress Status */}
      {isProcessing && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-sky-400 animate-spin" />
              <div>
                <h4 className="font-bold text-white text-sm">
                  {analysisState?.status === "PENDING"
                    ? "Queued in Forensic Queue..."
                    : "Extracting Frames & Analyzing Faces..."}
                </h4>
                <p className="text-xs text-slate-400">
                  Sampling one frame every 0.75 seconds up to safety ceiling.
                </p>
              </div>
            </div>
            <StatusBadge status={analysisState?.status} size="sm" />
          </div>

          <ProgressBar
            progress={analysisState?.progress_pct || 10}
            label="Forensic Inference Progress"
          />
        </div>
      )}

      {/* Analysis Results View */}
      {analysisState?.status === "COMPLETED" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs uppercase font-semibold text-slate-400">
                  Video-Level Forensic Verdict
                </span>
                <div className="flex items-center gap-3 mt-1">
                  <h2 className="text-2xl font-black text-white">{analysisState.prediction}</h2>
                  <StatusBadge status={analysisState.prediction} size="md" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={api.getReportUrl(analysisState.analysis_id, "html")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  <FileText className="w-4 h-4" /> Download Certificate
                </a>
              </div>
            </div>

            {/* Score Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[11px] font-semibold text-slate-400 uppercase">
                  Aggregated Fake Prob
                </div>
                <div className="text-2xl font-black text-rose-400 mt-1">
                  {((analysisState.fake_probability || 0) * 100).toFixed(1)}%
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[11px] font-semibold text-slate-400 uppercase">
                  Sampled Frames
                </div>
                <div className="text-2xl font-black text-white mt-1">
                  {analysisState.frames_analyzed}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[11px] font-semibold text-slate-400 uppercase">
                  Faces Detected
                </div>
                <div className="text-2xl font-black text-white mt-1">
                  {analysisState.frames_with_faces}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[11px] font-semibold text-slate-400 uppercase">
                  Suspicious Bursts
                </div>
                <div className="text-2xl font-black text-amber-400 mt-1">
                  {analysisState.suspicious_frames_count}
                </div>
              </div>
            </div>

            {/* Video Frame Timeline */}
            <VideoTimeline timeline={analysisState.timeline} />
          </div>
        </div>
      )}

      <DisclaimerAlert />
    </div>
  );
}
