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
  FolderDown,
  Radio
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
    { num: 4, title: "OBTAIN DATASET ACCESS", desc: "Fill the official FaceForensics++ academic agreement to download c23 H.264 sequences." },
    { num: 5, title: "SET DATASET ROOT", desc: "Configure DATASET_ROOT in Notebook 01 pointing to original and manipulated sequences." },
    { num: 6, title: "GENERATE LEAK-FREE SPLITS", desc: "Run identity-based grouping to isolate actor identities strictly between train, val, and test." },
    { num: 7, title: "EXTRACT FACIAL CROPS", desc: "Run Notebook 02 to extract face crops with 25% boundary expansion." },
    { num: 8, title: "TRAIN EFFICIENTNET-B0", desc: "Execute Notebook 03 with Automatic Mixed Precision (AMP), AdamW, and Cosine Annealing." },
    { num: 9, title: "TRAIN XCEPTIONNET", desc: "Execute Notebook 04 using timm's genuine Xception at 299×299 resolution." },
    { num: 10, title: "EVALUATE ON FF++ TEST SET", desc: "Calculate Accuracy, Precision, Recall, F1, and ROC-AUC on unseen identities." },
    { num: 11, title: "CROSS-DATASET EVALUATION", desc: "Run zero-shot evaluation on Celeb-DF v2 to measure out-of-domain generalization." },
    { num: 12, title: "INSPECT CONFUSION MATRIX", desc: "Examine False Alarm Rate (FAR) and False Rejection Rate (FRR) curves." },
    { num: 13, title: "EXPORT CHECKPOINT", desc: "Save 'best_model.pth' and 'model_config.json' to Google Drive." },
    { num: 14, title: "DOWNLOAD CHECKPOINT FILE", desc: "Download 'best_model.pth' directly to your local computer using files.download()." },
    { num: 15, title: "PLACE IN LOCAL ARTIFACTS", desc: "Save into '07_DeepGuard_AI/backend/artifacts/models/<model_name>/best_model.pth'." },
    { num: 16, title: "VERIFY & RUN LOCAL INFERENCE", desc: "Refresh DeepGuard AI dashboard; the model status badge switches immediately to 'Ready'!" }
  ];

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-8 font-mono select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#0d2a45]">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-hud-cyan animate-pulse" />
            <h1 className="text-xl sm:text-2xl font-black tracking-widest text-white uppercase">
              NEURAL ARCHITECTURE MATRIX
            </h1>
          </div>
          <p className="text-xs tracking-wider text-slate-400 mt-0.5">
            MODEL WEIGHT TELEMETRY & GOOGLE COLAB PIPELINE PROTOCOL
          </p>
        </div>
      </div>

      {/* Model Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {models.map((m) => (
          <div
            key={m.model_name}
            className="hud-panel p-5 bg-[#050c18]/90 border border-[#0d2a45] space-y-4"
          >
            <div className="reticle-tl" />
            <div className="reticle-tr" />
            <div className="reticle-bl" />
            <div className="reticle-br" />

            <div className="flex items-center justify-between pb-2 border-b border-[#0d2a45]">
              <h4 className="font-bold text-sm text-white uppercase tracking-wider">{m.display_name}</h4>
              {m.checkpoint_exists ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#061a12] border border-hud-green/40 text-hud-green glow-green">
                  <CheckCircle2 className="w-3 h-3" /> CHECKPOINT READY
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#1a1206] border border-hud-amber/40 text-hud-amber glow-amber">
                  <AlertCircle className="w-3 h-3" /> WEIGHTS REQUIRED
                </span>
              )}
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">CORE ARCHITECTURE:</span>
                <span className="text-hud-cyan font-bold">{m.architecture}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">INPUT TENSOR SIZE:</span>
                <span className="text-white">{m.input_size[0]} × {m.input_size[1]} px</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">INFERENCE DEVICE:</span>
                <span className="text-white uppercase">{m.device}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">WEIGHTS LOCATION:</span>
                <span className="text-slate-300 truncate max-w-[240px] text-[11px]">{m.checkpoint_path}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 16-Step Google Colab Protocol */}
      <div className="hud-panel p-6 bg-[#050c18]/90 border border-[#0d2a45] space-y-4">
        <div className="reticle-tl" />
        <div className="reticle-tr" />
        <div className="reticle-bl" />
        <div className="reticle-br" />

        <div className="pb-3 border-b border-[#0d2a45]">
          <h3 className="text-xs font-bold tracking-widest text-hud-cyan uppercase">
            COLAB TRAINING WORKFLOW PROTOCOL (16-STEP GUIDE)
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Zero GPU cost training pipeline using Google Colab Free Tier (T4 Tensor Core).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {steps.map((s) => (
            <div key={s.num} className="p-3 rounded bg-[#071322] border border-[#0d2a45] flex items-start gap-3">
              <div className="w-6 h-6 rounded bg-[#0b1d30] border border-hud-cyan/40 text-hud-cyan font-bold flex items-center justify-center shrink-0 text-[10px]">
                {String(s.num).padStart(2, "0")}
              </div>
              <div>
                <h5 className="font-bold text-white text-[11px] tracking-wider uppercase">{s.title}</h5>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
