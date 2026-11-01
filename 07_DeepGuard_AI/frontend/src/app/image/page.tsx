"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  CheckCircle,
  FileText,
  AlertCircle,
  RefreshCw,
  ExternalLink
} from "lucide-react";
import { api, ApiError } from "../../lib/api";
import { ImageAnalysisResponse, ModelInfo } from "../../lib/types";
import { UploadZone } from "../../components/UploadZone";
import { ModelSelector } from "../../components/ModelSelector";
import { FaceBBoxViewer } from "../../components/FaceBBoxViewer";
import { StatusBadge } from "../../components/StatusBadge";
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
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Image Forensic Analysis
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Detects all faces in frame, crops with 25% boundary margin, and computes manipulation confidence.
        </p>
      </div>

      {/* Model Selection */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-md">
        <ModelSelector
          models={models}
          selectedModel={selectedModel}
          onSelect={setSelectedModel}
          disabled={loading}
        />
      </div>

      {/* Upload Area */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-md space-y-4">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
          Source Media
        </label>
        <UploadZone
          accept="image"
          onFileSelect={handleFileSelect}
          selectedFile={file}
          onClear={handleClear}
          disabled={loading}
        />

        {file && !result && (
          <div className="flex justify-end pt-2">
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 flex items-center gap-2 shadow-lg shadow-sky-500/25 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Evaluating Faces...
                </>
              ) : (
                "Run Deepfake Analysis"
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

      {/* Results View */}
      {result && previewUrl && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs uppercase font-semibold text-slate-400">Forensic Assessment</span>
                <div className="flex items-center gap-3 mt-1">
                  <h2 className="text-2xl font-black text-white">{result.prediction}</h2>
                  <StatusBadge status={result.prediction} size="md" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={api.getReportUrl(result.analysis_id, "html")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  <FileText className="w-4 h-4" /> Download Certificate
                </a>
              </div>
            </div>

            {/* Score Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[11px] font-semibold text-slate-400 uppercase">Manipulation Score</div>
                <div className="text-2xl font-black text-rose-400 mt-1">
                  {(result.fake_probability * 100).toFixed(1)}%
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[11px] font-semibold text-slate-400 uppercase">Authenticity Score</div>
                <div className="text-2xl font-black text-emerald-400 mt-1">
                  {(result.real_probability * 100).toFixed(1)}%
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[11px] font-semibold text-slate-400 uppercase">Faces Detected</div>
                <div className="text-2xl font-black text-white mt-1">
                  {result.faces_detected_count}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[11px] font-semibold text-slate-400 uppercase">Processing Time</div>
                <div className="text-2xl font-black text-sky-400 mt-1">
                  {result.execution_duration_sec}s
                </div>
              </div>
            </div>

            {/* Interactive Image Face Bounding Box Display */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Detected Faces & Manipulation Boundaries
              </h4>
              <FaceBBoxViewer imageSrc={previewUrl} faces={result.faces} />
            </div>

            {/* Per-Face Prediction Table */}
            {result.faces.length > 0 && (
              <div className="rounded-xl border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Face Index</th>
                      <th className="px-4 py-3">Predicted Label</th>
                      <th className="px-4 py-3">Confidence</th>
                      <th className="px-4 py-3">P(Fake)</th>
                      <th className="px-4 py-3">P(Real)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {result.faces.map((f, i) => (
                      <tr key={f.face_index} className="hover:bg-slate-850/50">
                        <td className="px-4 py-3 font-semibold text-white">Face #{i + 1}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`font-bold ${
                              f.predicted_label === "FAKE" ? "text-rose-400" : "text-emerald-400"
                            }`}
                          >
                            {f.predicted_label}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono">{(f.confidence * 100).toFixed(1)}%</td>
                        <td className="px-4 py-3 font-mono text-rose-400">
                          {(f.fake_probability * 100).toFixed(1)}%
                        </td>
                        <td className="px-4 py-3 font-mono text-emerald-400">
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
