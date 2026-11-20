"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle,
  FileText,
  AlertCircle,
  RefreshCw,
  Image as ImageIcon,
  Layers,
  Award,
  Zap,
} from "lucide-react";
import { api, ApiError } from "../../lib/api";
import { ImageAnalysisResponse, ModelInfo, FacePrediction } from "../../lib/types";
import { UploadZone } from "../../components/UploadZone";
import { ModelSelector } from "../../components/ModelSelector";
import { DisclaimerAlert } from "../../components/DisclaimerAlert";

export default function ImageAnalysisPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState("efficientnet_b4");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImageAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imgNaturalSize, setImgNaturalSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  useEffect(() => {
    api.getModels().then((m) => {
      setModels(m);
      if (m.length > 0) {
        // Prefer champion model if available
        const champ = m.find((x) => x.model_name === "efficientnet_b4");
        if (champ) {
          setSelectedModel("efficientnet_b4");
        } else {
          setSelectedModel(m[0].model_name);
        }
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
          `Checkpoint Missing: ${err.message}. Please place 'best_model.pth' in the local artifacts directory.`
        );
      } else {
        setError(err.message || "Failed to analyze image.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-2">
              <ImageIcon className="w-3.5 h-3.5 text-blue-600" /> Image Forensics
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Single-Image Deepfake Forensic Inspector
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Automated multi-cascade face localization with deep feature extraction and binary classification.
            </p>
          </div>

          <Link
            href="/arena"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition-colors shadow-sm self-start sm:self-auto"
          >
            <Layers className="w-4 h-4 text-amber-600" />
            Compare All 3 Models in Arena
          </Link>
        </div>
      </div>

      {/* Model Selection & Upload Controls */}
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
            disabled={loading}
          />
        </div>

        {/* Source Media Upload */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              2. Upload Target Face
            </h2>
            <span className="text-xs text-slate-500">JPG, PNG (Max 15 MB)</span>
          </div>

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
                className="px-6 py-2.5 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Analyzing Facial Artifacts...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" /> Run Forensic Analysis
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
            <span className="font-semibold">Analysis Error: </span>
            {error}
          </div>
        </div>
      )}

      {/* Image Preview with In-Image Detection Overlays */}
      {(result || previewUrl) && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-600" />
                Detection Preview & In-Image Overlays
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Bounding boxes and probability scores are rendered directly over localized faces.
              </p>
            </div>

            {result && (
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-500">
                  Latency: {(result.execution_duration_sec * 1000).toFixed(1)} ms
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    result.prediction === "Likely Manipulated"
                      ? "bg-red-50 text-red-700 border-red-200"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  }`}
                >
                  {result.prediction}
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Center Image Container with Percentage-Accurate In-Image Bounding Boxes */}
            <div className="lg:col-span-8 bg-slate-100 border border-slate-200 rounded-xl p-4 flex items-center justify-center min-h-[380px] overflow-hidden">
              <div className="relative inline-block max-w-full max-h-[460px]">
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Target preview"
                    onLoad={(e) => {
                      setImgNaturalSize({
                        width: e.currentTarget.naturalWidth,
                        height: e.currentTarget.naturalHeight,
                      });
                    }}
                    className="max-h-[440px] w-auto max-w-full object-contain block mx-auto rounded shadow-sm"
                  />
                )}

                {/* Direct In-Image Overlays */}
                {result &&
                  imgNaturalSize.width > 0 &&
                  result.faces.map((f: FacePrediction) => {
                    const isFake = f.predicted_label === "FAKE" || f.fake_probability >= 0.5;
                    const leftPct = (f.bbox.x / imgNaturalSize.width) * 100;
                    const topPct = (f.bbox.y / imgNaturalSize.height) * 100;
                    const widthPct = (f.bbox.w / imgNaturalSize.width) * 100;
                    const heightPct = (f.bbox.h / imgNaturalSize.height) * 100;

                    return (
                      <div
                        key={f.face_index}
                        className={`absolute border-2 transition-all rounded font-mono ${
                          isFake
                            ? "border-red-500 bg-red-500/10 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                            : "border-emerald-500 bg-emerald-500/10 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                        }`}
                        style={{
                          left: `${leftPct}%`,
                          top: `${topPct}%`,
                          width: `${widthPct}%`,
                          height: `${heightPct}%`,
                        }}
                      >
                        {/* In-Image Tag */}
                        <div
                          className={`absolute -top-7 left-0 px-2 py-0.5 rounded text-[11px] font-bold text-white shadow-sm flex items-center gap-1 ${
                            isFake ? "bg-red-600" : "bg-emerald-600"
                          }`}
                        >
                          <span>{f.predicted_label}</span>
                          <span>{(f.confidence * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Metrics Breakdown Sidebar */}
            <div className="lg:col-span-4 space-y-4">
              {result ? (
                <>
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                    <h3 className="font-bold text-sm text-slate-800">
                      Overall Assessment
                    </h3>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">Model Used</span>
                      <span className="font-mono font-semibold text-slate-900">
                        {result.model_name}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">Faces Detected</span>
                      <span className="font-mono font-semibold text-slate-900">
                        {result.faces_detected_count}
                      </span>
                    </div>

                    <div className="space-y-1 pt-2 border-t border-slate-200 text-xs">
                      <div className="flex justify-between font-medium">
                        <span className="text-slate-600">Fake Probability</span>
                        <span className="font-bold text-red-600">
                          {(result.fake_probability * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden flex">
                        <div
                          className="bg-red-500"
                          style={{ width: `${result.fake_probability * 100}%` }}
                        />
                        <div
                          className="bg-emerald-500"
                          style={{ width: `${result.real_probability * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>Fake: {(result.fake_probability * 100).toFixed(1)}%</span>
                        <span>Real: {(result.real_probability * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>

                  {result.faces.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Localized Face Regions
                      </h4>
                      {result.faces.map((f) => (
                        <div
                          key={f.face_index}
                          className="p-3 rounded-lg border border-slate-200 bg-white text-xs space-y-1"
                        >
                          <div className="flex justify-between font-semibold">
                            <span>Face #{f.face_index + 1}</span>
                            <span
                              className={
                                f.predicted_label === "FAKE" ? "text-red-600" : "text-emerald-600"
                              }
                            >
                              {f.predicted_label} ({(f.confidence * 100).toFixed(1)}%)
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            BBox: [{f.bbox.x}, {f.bbox.y}, {f.bbox.w}, {f.bbox.h}]
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <DisclaimerAlert />
                </>
              ) : (
                <div className="p-6 rounded-xl border border-dashed border-slate-200 text-center text-slate-400 text-sm">
                  Click &ldquo;Run Forensic Analysis&rdquo; to process this image.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
