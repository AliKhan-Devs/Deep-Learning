"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Cpu,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Download,
  BookOpen,
  FolderDown,
  Award,
  BarChart3,
  Layers,
} from "lucide-react";
import { api } from "../../lib/api";
import { ModelInfo } from "../../lib/types";

export default function ModelsPage() {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getModels()
      .then((m) => setModels(m))
      .catch((err) => console.error("Error loading models:", err))
      .finally(() => setLoading(false));
  }, []);

  const steps = [
    { num: 1, title: "OPEN COLAB NOTEBOOK", desc: "Open '03_efficientnet_training.ipynb' or '04_xception_training.ipynb' in Google Colab." },
    { num: 2, title: "SELECT GPU ACCELERATOR", desc: "Navigate to Runtime > Change runtime type > Select GPU (T4, V100, or A100)." },
    { num: 3, title: "MOUNT GOOGLE DRIVE", desc: "Run the drive mount cell to access dataset storage and persist checkpoints." },
    { num: 4, title: "OBTAIN DATASET ACCESS", desc: "Download the deepfake face manipulation training and validation sequences." },
    { num: 5, title: "SET DATASET ROOT", desc: "Configure DATASET_ROOT pointing to original and manipulated face sequences." },
    { num: 6, title: "GENERATE LEAK-FREE SPLITS", desc: "Run identity-based grouping to isolate actor identities strictly between train, val, and test." },
    { num: 7, title: "EXTRACT FACIAL CROPS", desc: "Run face extraction with 25% boundary expansion to preserve blend seams." },
    { num: 8, title: "TRAIN EFFICIENTNET-B0", desc: "Execute baseline training with Automatic Mixed Precision (AMP), AdamW, and Cosine Annealing." },
    { num: 9, title: "TRAIN XCEPTIONNET", desc: "Execute XceptionNet training with depthwise separable convolutions at 299×299 resolution." },
    { num: 10, title: "TRAIN EFFICIENTNET-B4", desc: "Execute champion training with compound scaling at 380×380 resolution (97.0% Accuracy)." },
    { num: 11, title: "EVALUATE TEST SET", desc: "Calculate Accuracy, Precision, Recall, F1, and ROC-AUC on 8,938 test images." },
    { num: 12, title: "INSPECT CONFUSION MATRIX", desc: "Examine False Positives and False Negatives to confirm deepfake recall." },
    { num: 13, title: "EXPORT CHECKPOINT", desc: "Save 'best_model.pth' and 'model_config.json' to Google Drive." },
    { num: 14, title: "DOWNLOAD CHECKPOINT FILE", desc: "Download 'best_model.pth' locally using files.download()." },
    { num: 15, title: "PLACE IN LOCAL ARTIFACTS", desc: "Save into '07_DeepGuard_AI/backend/artifacts/models/<model_name>/best_model.pth'." },
    { num: 16, title: "VERIFY & RUN LOCAL INFERENCE", desc: "Refresh DeepGuard AI dashboard; the model status badge switches immediately to 'Ready'!" }
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-2">
              <Cpu className="w-3.5 h-3.5 text-blue-600" /> Model Registry
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Neural Architecture Registry & Colab Protocol
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Inspect model checkpoint readiness, device allocation, and the step-by-step training pipeline.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/benchmarks"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors shadow-sm"
            >
              <BarChart3 className="w-4 h-4 text-blue-600" /> View Benchmarks
            </Link>
            <Link
              href="/arena"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition-colors shadow-sm"
            >
              <Layers className="w-4 h-4 text-amber-600" /> Open Arena
            </Link>
          </div>
        </div>
      </div>

      {/* Model Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {models.map((m) => {
          const isChamp = m.model_name === "efficientnet_b4";
          return (
            <div
              key={m.model_name}
              className={`bg-white rounded-xl p-6 space-y-4 ${
                isChamp
                  ? "border-2 border-amber-400 shadow-md ring-1 ring-amber-300"
                  : "border border-slate-200 shadow-sm hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  {isChamp && (
                    <span className="p-1 rounded bg-amber-500 text-white">
                      <Award className="w-3.5 h-3.5" />
                    </span>
                  )}
                  <h3 className="font-bold text-sm text-slate-900">{m.display_name}</h3>
                </div>
                {m.checkpoint_exists ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" /> Ready
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    <AlertCircle className="w-3 h-3" /> Missing
                  </span>
                )}
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Architecture:</span>
                  <span className="text-slate-900 font-semibold">{m.architecture}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Input Resolution:</span>
                  <span className="text-slate-900 font-semibold">{m.input_size[0]} × {m.input_size[1]} px</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Target Classes:</span>
                  <span className="text-slate-900 font-semibold">{m.classes.join(", ")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Device:</span>
                  <span className="text-slate-900 font-semibold uppercase">{m.device}</span>
                </div>
                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-sans truncate">
                  Path: {m.checkpoint_path.split("\\").pop()}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 16-Step Google Colab Protocol */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <div className="pb-3 border-b border-slate-200">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            Google Colab Training & Deployment Protocol (16-Step Guide)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Zero-GPU-cost workflow utilizing Google Colab Free Tier (T4 Tensor Core).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {steps.map((s) => (
            <div key={s.num} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-xs">
                {String(s.num).padStart(2, "0")}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">{s.title}</h4>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
