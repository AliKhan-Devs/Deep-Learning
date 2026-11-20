"use client";

import React from "react";
import { Sliders, Award, Zap, Sparkles } from "lucide-react";
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
  return (
    <div className="bg-surface rounded-2xl border border-surface-light p-4 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-cyan-400" /> Model Engine & Thresholds
        </h3>
        <span className="text-[11px] text-cyan-400 font-mono">
          Model: {selectedModel.toUpperCase()}
        </span>
      </div>

      {/* Model Selection Tabs */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {models.map((m) => {
          const isSelected = m.id === selectedModel;
          return (
            <button
              key={m.id}
              onClick={() => onSelectModel(m.id)}
              className={`p-2.5 rounded-xl border text-left transition-all relative overflow-hidden ${
                isSelected
                  ? "bg-cyan-500/15 border-cyan-500/50 shadow-md shadow-cyan-500/10 text-white"
                  : "bg-surface-light/40 border-surface-light text-slate-400 hover:text-slate-200 hover:bg-surface-light"
              }`}
            >
              {m.is_champion && (
                <div className="absolute top-1.5 right-1.5">
                  <span className="p-0.5 rounded bg-emerald-500/20 text-emerald-400 flex items-center gap-0.5 text-[9px] font-bold px-1.5">
                    <Award className="w-2.5 h-2.5" /> CHAMPION
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1.5 font-semibold text-xs mb-0.5">
                {m.id === "v3" ? (
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Zap className="w-3 h-3 text-cyan-400" />
                )}
                {m.name.split(" ")[0]}
              </div>
              <div className="text-[10px] text-slate-400 flex items-center justify-between">
                <span>mAP50-95:</span>
                <span className="font-mono font-medium text-white">
                  {(m.mAP50_95 * 100).toFixed(1)}%
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Threshold Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-surface-light/60">
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-slate-300 font-medium">Confidence Filter</span>
            <span className="text-cyan-400 font-mono font-semibold">
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
            className="w-full h-1.5 bg-surface-light rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <p className="text-[10px] text-slate-500 mt-1">
            Higher values reject faint ambiguous detections; lower values capture distant faces.
          </p>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-slate-300 font-medium">NMS IoU Threshold</span>
            <span className="text-cyan-400 font-mono font-semibold">
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
            className="w-full h-1.5 bg-surface-light rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <p className="text-[10px] text-slate-500 mt-1">
            Non-Maximum Suppression threshold to merge overlapping boxes.
          </p>
        </div>
      </div>
    </div>
  );
};
