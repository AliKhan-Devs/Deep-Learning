"use client";

import React, { useEffect, useState } from "react";
import {
  Cpu,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Download,
  Terminal,
  BookOpen,
  FolderDown
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
    { num: 1, title: "Open Colab Notebook", desc: "Open '03_efficientnet_training.ipynb' or '04_xception_training.ipynb' in Google Colab." },
    { num: 2, title: "Select GPU Runtime", desc: "Navigate to Runtime > Change runtime type > Select GPU (T4, V100, or A100)." },
    { num: 3, title: "Mount Google Drive", desc: "Run the drive mount cell to access your dataset storage and save checkpoints." },
    { num: 4, title: "Obtain Dataset Access", desc: "Fill the official FaceForensics++ academic access agreement to download c23 H.264 sequences." },
    { num: 5, title: "Prepare Dataset Root", desc: "Set DATASET_ROOT in Notebook 01 pointing to your original and manipulated sequences." },
    { num: 6, title: "Generate Leak-Free Splits", desc: "Run identity-based grouping to isolate actor identities strictly between train, val, and test." },
    { num: 7, title: "Sample Frames & Extract Faces", desc: "Run Notebook 02 to extract face crops with 25% boundary expansion." },
    { num: 8, title: "Train EfficientNet-B0", desc: "Execute Notebook 03 with Automatic Mixed Precision (AMP), AdamW, and Cosine Annealing." },
    { num: 9, title: "Train XceptionNet", desc: "Execute Notebook 04 using timm's genuine Xception at 299×299 resolution." },
    { num: 10, title: "Evaluate on FF++ Test Set", desc: "Calculate Accuracy, Precision, Recall, F1, and ROC-AUC on unseen identities." },
    { num: 11, title: "Cross-Dataset Evaluation", desc: "Run zero-shot evaluation on Celeb-DF v2 to measure out-of-domain generalization." },
    { num: 12, title: "Inspect Confusion Matrix", desc: "Examine False Alarm Rate (FAR) and False Rejection Rate (FRR) curves." },
    { num: 13, title: "Export Checkpoint", desc: "Save 'best_model.pth' and 'model_config.json' to Google Drive." },
    { num: 14, title: "Download Checkpoint File", desc: "Download 'best_model.pth' directly to your local computer using files.download()." },
    { num: 15, title: "Place in Local Directory", desc: "Save into '07_DeepGuard_AI/backend/artifacts/models/<model_name>/best_model.pth'." },
    { num: 16, title: "Verify & Run Local Inference", desc: "Refresh DeepGuard AI dashboard; the model status badge switches immediately to 'Ready'!" }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Neural Model Management & Colab Training
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Inspect local checkpoint readiness and follow the step-by-step Google Colab training workflow.
        </p>
      </div>

      {/* Model Cards */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-sky-400" /> Configured Architectures
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {models.map((m) => (
            <div
              key={m.model_name}
              className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-base">{m.display_name}</h4>
                {m.checkpoint_exists ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/70 border border-emerald-600/50 text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Checkpoint Ready
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-950/70 border border-amber-600/50 text-amber-300">
                    <AlertCircle className="w-3.5 h-3.5" /> Checkpoint Missing
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 uppercase text-[10px] block font-semibold">Architecture</span>
                  <span className="font-mono text-slate-200">{m.architecture}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 uppercase text-[10px] block font-semibold">Input Size</span>
                  <span className="font-mono text-slate-200">{m.input_size[0]}×{m.input_size[1]}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 uppercase text-[10px] block font-semibold">Classes</span>
                  <span className="font-mono text-slate-200">{m.classes.join(", ")}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 uppercase text-[10px] block font-semibold">Threshold</span>
                  <span className="font-mono text-slate-200">{m.decision_threshold}</span>
                </div>
              </div>

              <div className="text-xs text-slate-400 font-mono bg-slate-950 p-3 rounded-xl border border-slate-800 break-all">
                <span className="text-slate-500 block text-[10px] uppercase font-sans font-semibold mb-1">
                  Expected Checkpoint Path
                </span>
                {m.checkpoint_path}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step-by-Step Google Colab Workflow */}
      <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-sky-400" />
              Complete Google Colab Training Workflow
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Step-by-step instructions for executing training in the cloud and importing weights locally.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {steps.map((s) => (
            <div
              key={s.num}
              className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-3.5"
            >
              <div className="w-7 h-7 rounded-lg bg-sky-950/80 border border-sky-800/60 text-sky-400 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                {s.num}
              </div>
              <div>
                <h5 className="font-bold text-xs text-slate-200 mb-1">{s.title}</h5>
                <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
