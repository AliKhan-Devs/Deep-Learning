"use client";

import React, { useState } from "react";
import { Sliders, Zap, Sparkles, CheckCircle2, Info, ChevronDown, ChevronUp } from "lucide-react";
import { ModelInfo } from "../lib/types";

interface ModelSelectorProps {
  models: ModelInfo[];
  selectedModel: string;
  onSelectModel: (id: string) => void;
  confThreshold: number;
  onChangeConf: (val: number) => void;
  iouThreshold: number;
  onChangeIou: (val: number) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  models,
  selectedModel,
  onSelectModel,
  confThreshold,
  onChangeConf,
  iouThreshold,
  onChangeIou,
}) => {
  const [showAllGuides, setShowAllGuides] = useState(false);

  // Model Profiles with Achieved Metrics & When to Use Guidance
  const modelProfiles: Record<
    string,
    {
      title: string;
      roleBadge: string;
      metricsSummary: { label: string; value: string }[];
      whenToUse: string;
      idealEnvironments: string[];
      tradeoff: string;
    }
  > = {
    v3: {
      title: "YOLOv26s (Small Architecture)",
      roleBadge: "High Spatial Accuracy",
      metricsSummary: [
        { label: "mAP50-95", value: "55.85%" },
        { label: "Precision", value: "91.50%" },
        { label: "Recall", value: "84.82%" },
        { label: "Class Loss", value: "0.5384" },
        { label: "Size", value: "20.31 MB" },
        { label: "Params", value: "11.2M" },
      ],
      whenToUse:
        "Select YOLOv26s when spatial localization accuracy and tight boundary fitting are critical. It achieves the highest mAP50-95 (55.85%) and the lowest classification loss across all 50-epoch runs.",
      idealEnvironments: [
        "Hospital triage & healthcare safety compliance",
        "Airports, transit hubs & crowded security checkpoints",
        "Challenging angles, partial occlusions & low-lighting surveillance",
        "Workstations & server GPU deployments with 35-50+ FPS headroom",
      ],
      tradeoff: "Higher compute overhead (20.3 MB / 11.2M params) vs Nano models.",
    },
    v2: {
      title: "YOLOv26n (Nano Architecture)",
      roleBadge: "High Precision & Low False Alarms",
      metricsSummary: [
        { label: "Precision", value: "92.13%" },
        { label: "mAP50-95", value: "53.63%" },
        { label: "mAP50", value: "90.46%" },
        { label: "Recall", value: "80.63%" },
        { label: "Size", value: "5.45 MB" },
        { label: "Params", value: "3.1M" },
      ],
      whenToUse:
        "Select YOLOv26n when operating on resource-constrained hardware or when false alarms must be strictly minimized. It achieved the highest precision (92.13%) of any model tested.",
      idealEnvironments: [
        "Edge devices (Raspberry Pi 4/5, Jetson Nano, mobile cameras)",
        "Automated audio alerts or turnstiles where false positives cause disruption",
        "High-density multi-camera streams requiring 65-85+ FPS throughput",
        "Embedded systems with strict storage budgets (<10 MB)",
      ],
      tradeoff: "Lower recall (80.63%) on small or heavily distant faces.",
    },
    v1: {
      title: "YOLOv8n (Nano Baseline)",
      roleBadge: "Standard Reference Baseline",
      metricsSummary: [
        { label: "mAP50", value: "91.38%" },
        { label: "mAP50-95", value: "53.12%" },
        { label: "Precision", value: "86.86%" },
        { label: "Recall", value: "85.15%" },
        { label: "Size", value: "6.25 MB" },
        { label: "Params", value: "3.2M" },
      ],
      whenToUse:
        "Select YOLOv8n as a reliable standard baseline. It achieved the highest mAP at the looser 50% IoU threshold (91.38%) and integrates seamlessly with standard YOLOv8 runtimes.",
      idealEnvironments: [
        "Standard webcam compliance monitoring",
        "Benchmarking baseline for research and comparison",
        "Existing production deployments standardized on vanilla YOLOv8 weights",
      ],
      tradeoff: "Lower strict spatial localization (53.12% mAP50-95) compared to v3.",
    },
  };

  const activeProfile = modelProfiles[selectedModel] || modelProfiles.v3;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-sky-600" /> Active Model Engine & Achieved Metrics
        </h3>
        <span className="text-[11px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
          Selected: {selectedModel.toUpperCase()}
        </span>
      </div>

      {/* Model Selection Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {models.map((m) => {
          const isSelected = m.id === selectedModel;
          const profile = modelProfiles[m.id];

          return (
            <button
              key={m.id}
              onClick={() => onSelectModel(m.id)}
              className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                isSelected
                  ? "bg-sky-50/80 border-sky-400 shadow-sm ring-1 ring-sky-300"
                  : "bg-slate-50 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                    {m.id === "v3" ? (
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Zap className="w-3.5 h-3.5 text-sky-600" />
                    )}
                    {m.id === "v3" ? "YOLOv26s" : m.id === "v2" ? "YOLOv26n" : "YOLOv8n"}
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isSelected
                        ? "bg-sky-600 text-white"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {profile ? profile.roleBadge : m.type}
                  </span>
                </div>

                {/* Specific Achieved Metrics Line */}
                <div className="grid grid-cols-2 gap-1 text-[11px] font-mono text-slate-600 mt-2 pt-2 border-t border-slate-200/60">
                  <div>
                    <span className="text-slate-400 text-[10px] font-sans">mAP50-95: </span>
                    <strong className="text-slate-900">{(m.mAP50_95 * 100).toFixed(1)}%</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] font-sans">Precision: </span>
                    <strong className="text-slate-900">{(m.precision * 100).toFixed(1)}%</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] font-sans">Recall: </span>
                    <strong className="text-slate-900">{(m.recall * 100).toFixed(1)}%</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] font-sans">File Size: </span>
                    <strong className="text-slate-900">
                      {m.id === "v3" ? "20.3 MB" : m.id === "v2" ? "5.45 MB" : "6.25 MB"}
                    </strong>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Dynamic "When to Use Which One" Guidance Box */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
            <Info className="w-4 h-4 text-sky-600" />
            <span>When to Use {activeProfile.title}</span>
          </div>
          <button
            onClick={() => setShowAllGuides(!showAllGuides)}
            className="text-[11px] font-semibold text-sky-700 hover:text-sky-900 flex items-center gap-1"
          >
            {showAllGuides ? (
              <>
                Hide Comparison Guide <ChevronUp className="w-3 h-3" />
              </>
            ) : (
              <>
                Compare When to Use All 3 Models <ChevronDown className="w-3 h-3" />
              </>
            )}
          </button>
        </div>

        <p className="text-slate-600 leading-relaxed">{activeProfile.whenToUse}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
          <div>
            <span className="font-semibold text-slate-700 block mb-1">Recommended Deployment Scenarios:</span>
            <ul className="space-y-0.5 text-slate-600 list-disc list-inside">
              {activeProfile.idealEnvironments.map((env, i) => (
                <li key={i}>{env}</li>
              ))}
            </ul>
          </div>
          <div className="sm:border-l sm:border-slate-200 sm:pl-3">
            <span className="font-semibold text-slate-700 block mb-1">Architecture Tradeoff:</span>
            <p className="text-slate-600 leading-relaxed">{activeProfile.tradeoff}</p>
          </div>
        </div>

        {/* Expanded 3-Model Comparison View */}
        {showAllGuides && (
          <div className="pt-3 mt-3 border-t border-slate-200 space-y-2.5">
            <h4 className="font-bold text-slate-800 text-xs">Full Model Selection Framework:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {Object.entries(modelProfiles).map(([id, p]) => (
                <div
                  key={id}
                  className={`p-2.5 rounded-lg border text-[11px] space-y-1 ${
                    id === selectedModel
                      ? "bg-white border-sky-300 shadow-xs"
                      : "bg-white/60 border-slate-200"
                  }`}
                >
                  <div className="font-bold text-slate-900 flex items-center justify-between">
                    <span>{p.title}</span>
                    <span className="text-[10px] text-sky-700 font-mono font-bold">
                      {p.metricsSummary[0].label}: {p.metricsSummary[0].value}
                    </span>
                  </div>
                  <p className="text-slate-600 leading-normal text-[10px]">{p.whenToUse}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Detection Confidence & IoU Sensitivity Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 text-xs">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-slate-700 font-medium">Confidence Threshold</span>
            <span className="text-sky-700 font-mono font-bold">
              {(confThreshold * 100).toFixed(0)}%
            </span>
          </div>
          <input
            type="range"
            min="0.10"
            max="0.95"
            step="0.05"
            value={confThreshold}
            onChange={(e) => onChangeConf(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
          />
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span className="text-slate-700 font-medium">IoU Overlap Threshold</span>
            <span className="text-sky-700 font-mono font-bold">
              {(iouThreshold * 100).toFixed(0)}%
            </span>
          </div>
          <input
            type="range"
            min="0.20"
            max="0.80"
            step="0.05"
            value={iouThreshold}
            onChange={(e) => onChangeIou(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
          />
        </div>
      </div>
    </div>
  );
};
