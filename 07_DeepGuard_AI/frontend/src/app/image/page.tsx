"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  CheckCircle,
  FileText,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Radio,
  Image as ImageIcon
} from "lucide-react";
import { api, ApiError } from "../../lib/api";
import { ImageAnalysisResponse, ModelInfo } from "../../lib/types";
import { UploadZone } from "../../components/UploadZone";
import { ModelSelector } from "../../components/ModelSelector";
import { FaceBBoxViewer } from "../../components/FaceBBoxViewer";
import { ForensicHUD } from "../../components/ForensicHUD";
import { DisclaimerAlert } from "../../components/DisclaimerAlert";

export default function ImageAnalysisPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState("efficientnet_b0");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImageAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getModels().then((m) => {
      setModels(m);
      if (m.length > 0 && !selectedModel) {
        setSelectedModel(m[0].model_name);
      }
    });
  }, []);

  const handleFileSelect = (selected: File) => {
    setFile(selected);
    setError(null);
    setResult(null);
    const url = URL.createObjectURL(selected);
    setPreviewUrl(url);
  };

  const handleClear = () => {
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      const res = await api.analyzeImage(file, selectedModel);
      setResult(res);
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 422) {
        setError(
          `Checkpoint Missing: ${err.message}. Please train the model in Google Colab and place 'best_model.pth' in the local directory.`
        );
      } else {
        setError(err.message || "Failed to analyze image.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#0d2a45]">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-hud-cyan animate-pulse" />
            <h1 className="text-xl sm:text-2xl font-mono font-black tracking-widest text-white uppercase">
              IMAGE FORENSIC INSPECTOR
            </h1>
          </div>
          <p className="text-xs font-mono tracking-wider text-slate-400 mt-0.5">
            MULTI-FACE SYNTHESIS EXTRACTION & MICRO-TEXTURE ARTIFACT DETECTION
          </p>
        </div>
      </div>

      {/* Model Selection & Upload Controls */}
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
            disabled={loading}
          />
        </div>

        {/* Source Media Ingestion */}
        <div className="lg:col-span-7 hud-panel p-4 bg-[#050c18]/90 border border-[#0d2a45]">
          <div className="reticle-tl" />
          <div className="reticle-tr" />
          <div className="reticle-bl" />
          <div className="reticle-br" />

          <div className="pb-2 mb-3 border-b border-[#0d2a45] flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold tracking-widest text-hud-cyan uppercase">
              IMAGE INGESTION BUFFER
            </h3>
            <span className="text-[10px] font-mono text-slate-400">JPG, PNG, WEBP</span>
          </div>

          <UploadZone
            accept="image"
            onFileSelect={handleFileSelect}
            selectedFile={file}
            onClear={handleClear}
            disabled={loading}
          />

          {file && !result && (
            <div className="flex justify-end pt-3">
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="px-5 py-2 rounded text-xs font-mono font-black tracking-widest bg-hud-cyan hover:bg-cyan-300 text-slate-950 flex items-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all disabled:opacity-50 uppercase"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> SCANNING FACIAL ARTIFACTS...
                  </>
                ) : (
                  "EXECUTE BIOMETRIC SCAN"
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

      {/* When Results Arrive: Display Full Forensic HUD */}
      {result && previewUrl && (
        <div className="space-y-6">
          <ForensicHUD imageData={result} analysisId={result.analysis_id} />

          {/* Additional Inspection: Bounding Box Overlay & Per-Face Table */}
          <div className="hud-panel p-5 bg-[#050c18]/90 border border-[#0d2a45] space-y-4">
            <div className="reticle-tl" />
            <div className="reticle-tr" />
            <div className="reticle-bl" />
            <div className="reticle-br" />

            <div className="pb-2 border-b border-[#0d2a45] flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold tracking-widest text-hud-cyan uppercase">
                SPATIAL MANIPULATION BOUNDARIES ({result.faces_detected_count} FACES LOCATED)
              </h3>
              <a
                href={api.getReportUrl(result.analysis_id, "html")}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 rounded text-[11px] font-mono bg-hud-cyan/20 hover:bg-hud-cyan/30 text-hud-cyan border border-hud-cyan/40 flex items-center gap-1.5 transition-colors"
              >
                <FileText className="w-3 h-3" /> OFFICIAL CERTIFICATE
              </a>
            </div>

            <div className="py-2">
              <FaceBBoxViewer imageSrc={previewUrl} faces={result.faces} />
            </div>

            {/* Per-Face Prediction Table */}
            {result.faces.length > 0 && (
              <div className="rounded border border-[#0d2a45] overflow-hidden">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#091729] text-hud-cyan uppercase border-b border-[#0d2a45]">
                    <tr>
                      <th className="px-4 py-2.5">Face Target</th>
                      <th className="px-4 py-2.5">Verdict</th>
                      <th className="px-4 py-2.5">Confidence</th>
                      <th className="px-4 py-2.5">P(Synthetic)</th>
                      <th className="px-4 py-2.5">P(Authentic)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#0d2a45] bg-[#050c18]">
                    {result.faces.map((f, i) => (
                      <tr key={f.face_index} className="hover:bg-[#0a1b2e]">
                        <td className="px-4 py-2.5 font-bold text-white">#0{i + 1}</td>
                        <td className="px-4 py-2.5">
                          <span
                            className={`font-black tracking-wider ${
                              f.predicted_label === "FAKE" ? "text-hud-amber" : "text-hud-green"
                            }`}
                          >
                            {f.predicted_label}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-slate-300">{(f.confidence * 100).toFixed(1)}%</td>
                        <td className="px-4 py-2.5 text-hud-amber font-bold">
                          {(f.fake_probability * 100).toFixed(1)}%
                        </td>
                        <td className="px-4 py-2.5 text-hud-green font-bold">
                          {(f.real_probability * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      <DisclaimerAlert />
    </div>
  );
}
