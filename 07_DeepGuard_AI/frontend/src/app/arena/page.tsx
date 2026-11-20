"use client";

import React, { useState } from "react";
import {
  Layers,
  Upload,
  RefreshCw,
  AlertCircle,
  Award,
  Zap,
  Gauge,
  ShieldCheck,
  ShieldAlert,
  Info,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { api, ApiError } from "../../lib/api";
import { MultiModelComparisonResponse, ModelInferenceComparisonItem } from "../../lib/types";

export default function ArenaPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<MultiModelComparisonResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setError(null);
      setResults(null);
      const url = URL.createObjectURL(selected);
      setPreviewUrl(url);
    }
  };

  const handleAnalyzeAll = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      const res = await api.compareModels(file);
      setResults(res);
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 422) {
        setError(`Checkpoint Missing: ${err.message}. Ensure models are placed in artifacts folder.`);
      } else {
        setError(err.message || "Failed to compare models.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreviewUrl(null);
    setResults(null);
    setError(null);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-2">
              <Layers className="w-3.5 h-3.5 text-blue-600" /> Multi-Model Arena
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              3-Model Forensic Comparison Arena
            </h1>
            <p className="text-slate-600 text-sm mt-1 max-w-3xl">
              Evaluate an image against all three trained architectures (EfficientNet-B4 Champion, XceptionNet, and EfficientNet-B0) simultaneously to benchmark detection accuracy, confidence, inference latency, and FPS.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-900 border border-amber-200">
              <Award className="w-4 h-4 text-amber-600" /> Champion: EfficientNet-B4 (97.0%)
            </span>
          </div>
        </div>
      </div>

      {/* Upload Zone & Action */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <label className="w-full sm:w-auto flex-1 cursor-pointer">
            <div className="flex items-center justify-center gap-3 px-6 py-4 border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-500 hover:bg-blue-50/50 transition-all text-slate-600">
              <Upload className="w-5 h-5 text-blue-600" />
              <div className="text-sm">
                <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop an image
                <span className="block text-xs text-slate-400 mt-0.5">JPG, PNG up to 15 MB</span>
              </div>
            </div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              className="hidden"
              onChange={handleFileChange}
              disabled={loading}
            />
          </label>

          {file && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleAnalyzeAll}
                disabled={loading}
                className="flex-1 sm:flex-initial px-6 py-3.5 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Evaluating 3 Models...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" /> Run 3-Model Arena
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={loading}
                className="px-4 py-3.5 rounded-xl font-medium text-sm text-slate-600 hover:bg-slate-100 border border-slate-200"
              >
                Reset
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Analysis Error: </span>
              {error}
            </div>
          </div>
        )}
      </div>

      {/* Image Preview with In-Image Detection Overlay */}
      {previewUrl && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              Source Image & Detection Overlay
            </h2>
            {results && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {results.faces_detected_count} Face(s) Detected
              </span>
            )}
          </div>

          <div className="relative mx-auto max-w-xl flex items-center justify-center bg-slate-100 rounded-lg overflow-hidden border border-slate-200 p-2">
            <img
              src={previewUrl}
              alt="Uploaded test sample"
              onLoad={(e) => {
                setNaturalSize({
                  width: e.currentTarget.naturalWidth,
                  height: e.currentTarget.naturalHeight,
                });
              }}
              className="max-h-80 w-auto object-contain rounded"
            />

            {/* In-image Champion Verdict Ribbon */}
            {results && (
              <div className="absolute top-4 left-4 z-20">
                {(() => {
                  const b4Result = results.models.find((m) => m.model_name === "efficientnet_b4");
                  const isFake = b4Result?.fake_probability && b4Result.fake_probability >= 0.5;
                  return (
                    <div
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-md flex items-center gap-1.5 ${
                        isFake
                          ? "bg-red-600 text-white"
                          : "bg-emerald-600 text-white"
                      }`}
                    >
                      {isFake ? <ShieldAlert className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                      Champion Verdict: {b4Result?.prediction || "Evaluated"}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3 Models Side-by-Side Arena Cards */}
      {results && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              Model Performance Comparison
            </h2>
            <span className="text-xs text-slate-500">
              Sorted by Champion Priority
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {results.models.map((model) => {
              const isFake = model.fake_probability >= 0.5;
              const isChamp = model.is_champion;

              return (
                <div
                  key={model.model_name}
                  className={`bg-white rounded-xl transition-all ${
                    isChamp
                      ? "border-2 border-amber-400 shadow-md ring-1 ring-amber-300/50"
                      : "border border-slate-200 shadow-sm hover:border-slate-300"
                  }`}
                >
                  {/* Card Header */}
                  <div
                    className={`p-4 rounded-t-xl border-b ${
                      isChamp ? "bg-amber-50/70 border-amber-200" : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      {isChamp ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white">
                          <Award className="w-3.5 h-3.5" /> Champion Model
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-slate-500">
                          {model.model_name === "xception" ? "Classical Benchmark" : "Lightweight Edge"}
                        </span>
                      )}

                      {/* Speed Badge */}
                      <span className="inline-flex items-center gap-1 text-xs font-mono font-semibold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                        <Gauge className="w-3 h-3 text-blue-600" />
                        {model.latency_ms.toFixed(1)} ms &bull; {model.fps.toFixed(0)} FPS
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base">
                      {model.display_name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Arch: {model.architecture} &bull; Input: {model.model_name === "efficientnet_b4" ? "380×380" : model.model_name === "xception" ? "299×299" : "224×224"}px
                    </p>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-4">
                    {/* Verdict Pill */}
                    <div
                      className={`p-3.5 rounded-xl border text-center font-semibold text-sm flex items-center justify-center gap-2 ${
                        isFake
                          ? "bg-red-50 border-red-200 text-red-700"
                          : "bg-emerald-50 border-emerald-200 text-emerald-700"
                      }`}
                    >
                      {isFake ? (
                        <>
                          <XCircle className="w-5 h-5 text-red-600" />
                          Likely Manipulated (Deepfake)
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          Likely Authentic (Real)
                        </>
                      )}
                    </div>

                    {/* Probability Bars */}
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between font-medium">
                        <span className="text-slate-600">Fake Probability</span>
                        <span className="font-bold text-slate-900">
                          {(model.fake_probability * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                        <div
                          className="bg-red-500 transition-all duration-500"
                          style={{ width: `${model.fake_probability * 100}%` }}
                        />
                        <div
                          className="bg-emerald-500 transition-all duration-500"
                          style={{ width: `${(1 - model.fake_probability) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>Fake: {(model.fake_probability * 100).toFixed(1)}%</span>
                        <span>Real: {(model.real_probability * 100).toFixed(1)}%</span>
                      </div>
                    </div>

                    {/* Model Architecture Note */}
                    <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 leading-relaxed">
                      {model.model_name === "efficientnet_b4" && (
                        <div className="bg-amber-50/50 p-2.5 rounded-lg border border-amber-100">
                          <span className="font-bold text-amber-900">Why Champion: </span>
                          Captures high-frequency facial seam blending and eye specular highlights with 97.0% test accuracy and 0.9968 ROC-AUC.
                        </div>
                      )}
                      {model.model_name === "xception" && (
                        <div>
                          <span className="font-bold text-slate-700">Benchmark Baseline: </span>
                          Separable convolutions decouple spatial and channel correlations (93.0% test accuracy, 0.9867 ROC-AUC).
                        </div>
                      )}
                      {model.model_name === "efficientnet_b0" && (
                        <div>
                          <span className="font-bold text-slate-700">Edge Optimized: </span>
                          Ultra-compact 16 MB footprint designed for rapid mobile/edge screening (92.0% test accuracy).
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
