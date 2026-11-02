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
  AlertTriangle,
  Radio,
  Play
} from "lucide-react";
import { api, ApiError } from "../../lib/api";
import { VideoAnalysisResponse, ModelInfo } from "../../lib/types";
import { UploadZone } from "../../components/UploadZone";
import { ModelSelector } from "../../components/ModelSelector";
import { StatusBadge } from "../../components/StatusBadge";
import { ProgressBar } from "../../components/ProgressBar";
import { ForensicHUD } from "../../components/ForensicHUD";
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
  const [demoMode, setDemoMode] = useState(false);

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
    <div className="w-full max-w-[1400px] mx-auto space-y-6">
      {/* Top Banner and Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#0d2a45]">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-hud-cyan animate-pulse" />
            <h1 className="text-xl sm:text-2xl font-mono font-black tracking-widest text-white uppercase">
              VIDEO FORENSIC ENGINE
            </h1>
          </div>
          <p className="text-xs font-mono tracking-wider text-slate-400 mt-0.5">
            TEMPORAL CONSISTENCY VERIFICATION & BIOMETRIC MESH AUTHENTICATION
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setDemoMode(!demoMode)}
            className={`px-3 py-1.5 rounded text-xs font-mono font-bold border transition-all ${
              demoMode
                ? "bg-hud-cyan text-slate-950 border-hud-cyan shadow-[0_0_12px_rgba(0,240,255,0.4)]"
                : "bg-[#081525] text-hud-cyan border-[#0f3456] hover:bg-[#0f243c]"
            }`}
          >
            {demoMode ? "EXIT HUD DEMO" : "HUD SIMULATOR MODE"}
          </button>
        </div>
      </div>

      {/* Model Selector & Upload Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Model Architecture Selector */}
        <div className="lg:col-span-5 hud-panel p-4 bg-[#050c18]/90 border border-[#0d2a45]">
          <div className="reticle-tl" />
          <div className="reticle-tr" />
          <div className="reticle-bl" />
          <div className="reticle-br" />

          <div className="pb-2 mb-3 border-b border-[#0d2a45]">
            <h3 className="text-xs font-mono font-bold tracking-widest text-hud-cyan uppercase">
              NEURAL ARCHITECTURE SELECTOR
            </h3>
          </div>

          <ModelSelector
            models={models}
            selectedModel={selectedModel}
            onSelect={setSelectedModel}
            disabled={submitting || isProcessing}
          />
        </div>

        {/* Video Upload Dropzone */}
        <div className="lg:col-span-7 hud-panel p-4 bg-[#050c18]/90 border border-[#0d2a45]">
          <div className="reticle-tl" />
          <div className="reticle-tr" />
          <div className="reticle-bl" />
          <div className="reticle-br" />

          <div className="pb-2 mb-3 border-b border-[#0d2a45] flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold tracking-widest text-hud-cyan uppercase">
              VIDEO SOURCE INGESTION
            </h3>
            <span className="text-[10px] font-mono text-slate-400">MP4, AVI, MOV</span>
          </div>

          <UploadZone
            accept="video"
            onFileSelect={handleFileSelect}
            selectedFile={file}
            onClear={handleClear}
            disabled={submitting || isProcessing}
          />

          {file && !analysisId && (
            <div className="flex justify-end pt-3">
              <button
                onClick={handleStartAnalysis}
                disabled={submitting}
                className="px-5 py-2 rounded text-xs font-mono font-black tracking-widest bg-hud-cyan hover:bg-cyan-300 text-slate-950 flex items-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all disabled:opacity-50 uppercase"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> ENQUEUING STREAM...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" /> EXECUTE FORENSIC ANALYSIS
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-4 rounded border border-hud-red/40 bg-hud-red/10 text-hud-red text-xs font-mono flex items-start gap-3 glow-red">
          <AlertCircle className="w-4 h-4 text-hud-red shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">FORENSIC PIPELINE ERROR: </span>
            {error}
          </div>
        </div>
      )}

      {/* Processing Telemetry Banner */}
      {isProcessing && (
        <div className="hud-panel p-5 bg-[#050c18]/90 border border-hud-cyan/50 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-hud-cyan animate-spin glow-cyan" />
              <div>
                <h4 className="font-mono font-bold text-white text-xs tracking-wider uppercase">
                  {analysisState?.status === "PENDING"
                    ? "STREAM ENQUEUED IN FORENSIC BUFFER..."
                    : "EXTRACTING FRAMES & COMPILATION OF BIOMETRIC TELEMETRY..."}
                </h4>
                <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                  Controlled face sampling at 0.75s intervals with tensor anomaly tracking.
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded bg-hud-cyan/15 text-hud-cyan border border-hud-cyan/40 text-[10px] font-mono font-bold uppercase animate-pulse">
              PROCESSING
            </span>
          </div>

          <ProgressBar
            progress={analysisState?.progress_pct || 15}
            label="TEMPORAL SEQUENCE ANALYSIS"
          />
        </div>
      )}

      {/* Main HUD: Active either when analysis is completed or in demo mode */}
      {(analysisState?.status === "COMPLETED" || demoMode) && (
        <div className="pt-2">
          <ForensicHUD
            videoData={analysisState}
            analysisId={analysisId || (demoMode ? "DF-DEMO-2026" : undefined)}
            isDemo={demoMode}
          />
        </div>
      )}

      <DisclaimerAlert />
    </div>
  );
}
