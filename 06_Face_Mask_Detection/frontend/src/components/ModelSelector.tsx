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
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-sky-600" /> Active Model Engine & Sensitivity
        </h3>
        <span className="text-[11px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
          Selected: {selectedModel.toUpperCase()}
        </span>
      </div>

      {/* Model Selection Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-3.5">
        {models.map((m) => {
          const isSelected = m.id === selectedModel;
          return (
            <button
              key={m.id}
              onClick={() => onSelectModel(m.id)}
              className={`p-3 rounded-xl border text-left transition-all relative ${
                isSelected
                  ? "bg-sky-50/70 border-sky-400 shadow-sm"
                  : "bg-slate-50 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {m.is_champion && (
                <span className="absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-0.5">
                  <Award className="w-2.5 h-2.5 text-emerald-600" /> CHAMPION
                </span>
              )}
              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 mb-0.5">
                {m.id === "v3" ? (
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Zap className="w-3.5 h-3.5 text-sky-600" />
                )}
                {m.name.split(" ")[0]}
              </div>
              <div className="text-[11px] text-slate-500 flex items-center justify-between mt-1">
                <span>mAP50-95:</span>
                <span className="font-mono font-bold text-slate-800">
                  {(m.mAP50_95 * 100).toFixed(1)}%
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100 text-xs">
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
