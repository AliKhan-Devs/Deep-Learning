"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart3,
  Award,
  CheckCircle2,
  TrendingUp,
  FileText,
  ShieldCheck,
  ShieldAlert,
  Layers,
  ArrowRight,
  Database,
} from "lucide-react";
import { api } from "../../lib/api";
import { ModelBenchmarkItem } from "../../lib/types";

export default function BenchmarksPage() {
  const [benchmarks, setBenchmarks] = useState<ModelBenchmarkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"efficientnet_b4" | "xception" | "efficientnet_b0">("efficientnet_b4");

  useEffect(() => {
    api
      .getBenchmarks()
      .then((data) => setBenchmarks(data))
      .catch((err) => console.error("Error loading benchmarks:", err))
      .finally(() => setLoading(false));
  }, []);

  const activeModel = benchmarks.find((b) => b.model_name === activeTab);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-2">
              <BarChart3 className="w-3.5 h-3.5 text-blue-600" /> Research & Empirical Analysis
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              3-Experiment Deep Learning Benchmark & Champion Selection
            </h1>
            <p className="text-slate-600 text-sm mt-1 max-w-3xl">
              Comparative analysis of 3 experimental architectures trained on the Deepfake Detection dataset: EfficientNet-B0 (Edge), XceptionNet (Benchmark), and EfficientNet-B4 (Champion). All models evaluated across 8,938 independent test images.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
            <Award className="w-8 h-8 text-amber-600 shrink-0" />
            <div>
              <div className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                Selected Champion
              </div>
              <div className="text-sm font-bold text-slate-900">
                EfficientNet-B4 Detector
              </div>
              <div className="text-xs text-amber-800">
                97.0% Accuracy &bull; 0.9968 ROC-AUC
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparative Performance Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            Side-by-Side Experimental Results (8,938 Test Images)
          </h2>
          <span className="text-xs text-slate-500">
            Split: 4,469 Real &bull; 4,469 Fake
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Model Architecture</th>
                <th className="py-3.5 px-4 font-semibold">Input Size</th>
                <th className="py-3.5 px-4 font-semibold">Weights Size</th>
                <th className="py-3.5 px-4 font-semibold">Test Accuracy</th>
                <th className="py-3.5 px-4 font-semibold">ROC-AUC</th>
                <th className="py-3.5 px-4 font-semibold">Fake Recall</th>
                <th className="py-3.5 px-4 font-semibold">Missed Fakes</th>
                <th className="py-3.5 px-4 font-semibold">Min Val Loss</th>
                <th className="py-3.5 px-4 font-semibold">Role & Verdict</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-xs">
              {/* Champion: EfficientNet-B4 */}
              <tr className="bg-amber-50/40 hover:bg-amber-50/70 transition-colors">
                <td className="py-4 px-4 font-bold text-slate-900 flex items-center gap-2">
                  <span className="p-1 rounded bg-amber-500 text-white">
                    <Award className="w-3.5 h-3.5" />
                  </span>
                  EfficientNet-B4 (Champion)
                </td>
                <td className="py-4 px-4">380 × 380</td>
                <td className="py-4 px-4">70.97 MB</td>
                <td className="py-4 px-4 font-bold text-emerald-700 text-sm">97.0%</td>
                <td className="py-4 px-4 font-bold text-emerald-700 text-sm">0.9968</td>
                <td className="py-4 px-4 font-bold text-slate-900">98.2%</td>
                <td className="py-4 px-4 font-bold text-emerald-700">80 / 4,469</td>
                <td className="py-4 px-4 font-bold text-slate-900">0.075</td>
                <td className="py-4 px-4 font-sans font-semibold text-amber-800">
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px]">
                    Production Champion 🏆
                  </span>
                </td>
              </tr>

              {/* Xception */}
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="py-4 px-4 font-semibold text-slate-900">
                  XceptionNet
                </td>
                <td className="py-4 px-4">299 × 299</td>
                <td className="py-4 px-4">83.55 MB</td>
                <td className="py-4 px-4 text-slate-900">93.0%</td>
                <td className="py-4 px-4 text-slate-900">0.9867</td>
                <td className="py-4 px-4 text-slate-900">95.3%</td>
                <td className="py-4 px-4 text-slate-700">210 / 4,469</td>
                <td className="py-4 px-4 text-slate-700">0.155</td>
                <td className="py-4 px-4 font-sans text-slate-600">
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px]">
                    Classical Baseline
                  </span>
                </td>
              </tr>

              {/* EfficientNet-B0 */}
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="py-4 px-4 font-semibold text-slate-900">
                  EfficientNet-B0
                </td>
                <td className="py-4 px-4">224 × 224</td>
                <td className="py-4 px-4">16.34 MB</td>
                <td className="py-4 px-4 text-slate-900">92.0%</td>
                <td className="py-4 px-4 text-slate-900">0.9795</td>
                <td className="py-4 px-4 text-slate-900">92.9%</td>
                <td className="py-4 px-4 text-slate-700">316 / 4,469</td>
                <td className="py-4 px-4 text-slate-700">0.175</td>
                <td className="py-4 px-4 font-sans text-slate-600">
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px]">
                    Lightweight Edge
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Deep Dive & Diagnostic Visuals */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Training Diagnostics & Evaluation Plots
            </h2>
            <p className="text-slate-500 text-xs mt-0.5">
              Select an architecture to inspect its confusion matrix, classification report, training/val loss curves, and ROC-AUC curve.
            </p>
          </div>

          {/* Model Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("efficientnet_b4")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "efficientnet_b4"
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              EfficientNet-B4 (Champion)
            </button>
            <button
              onClick={() => setActiveTab("xception")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "xception"
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              XceptionNet
            </button>
            <button
              onClick={() => setActiveTab("efficientnet_b0")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "efficientnet_b0"
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              EfficientNet-B0
            </button>
          </div>
        </div>

        {/* Selected Model Details & Visuals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Diagnostic 1: Precision, Recall & Confusion Matrix */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                Classification Metrics & Confusion Matrix
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                {activeTab}
              </span>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-2 overflow-hidden flex items-center justify-center min-h-[340px]">
              <img
                src={`/assets/${activeTab}_metrics.png`}
                alt={`${activeTab} precision recall and accuracy`}
                className="max-h-[380px] w-auto object-contain rounded"
              />
            </div>
          </div>

          {/* Diagnostic 2: Loss & ROC-AUC Curve */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                Training/Val Loss & Test ROC Curve
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                {activeTab}
              </span>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-2 overflow-hidden flex items-center justify-center min-h-[340px]">
              <img
                src={`/assets/${activeTab}_roc.png`}
                alt={`${activeTab} training validation loss and ROC curve`}
                className="max-h-[380px] w-auto object-contain rounded"
              />
            </div>
          </div>
        </div>

        {/* Analytical Justification */}
        <div className="p-5 bg-blue-50/50 border border-blue-200 rounded-xl text-slate-800 space-y-3">
          <h3 className="font-bold text-sm text-blue-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-600" />
            Key Research Findings: Why EfficientNet-B4 Outperformed All Models
          </h3>
          <ul className="text-xs text-slate-700 space-y-2 list-disc list-inside leading-relaxed">
            <li>
              <strong>62% Reduction in Missed Deepfakes:</strong> EfficientNet-B4 misclassified only <strong>80</strong> deepfake samples out of 4,469 (98.2% recall), compared to <strong>210</strong> missed by Xception and <strong>316</strong> missed by EfficientNet-B0.
            </li>
            <li>
              <strong>Superior Input Resolution (380×380):</strong> Higher spatial resolution prevents subtle facial warp boundaries, blending artifacts, and eye specular discrepancies from being downsampled away during early convolution stages.
            </li>
            <li>
              <strong>Over 50% Lower Loss Convergence:</strong> Validation loss dropped to a minimum of <strong>0.075</strong>, substantially tighter than Xception (0.155) and B0 (0.175), demonstrating stronger generalization on unseen faces.
            </li>
            <li>
              <strong>Optimal Efficiency-to-Size Ratio:</strong> At 70.97 MB, EfficientNet-B4 is actually smaller than Xception (83.55 MB) while delivering a +4.0% accuracy leap and near-perfect 0.9968 ROC-AUC.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
