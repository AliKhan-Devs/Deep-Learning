import React from "react";
import { Cpu, AlertCircle, CheckCircle2 } from "lucide-react";
import { ModelInfo } from "../lib/types";

interface ModelSelectorProps {
  models: ModelInfo[];
  selectedModel: string;
  onSelect: (modelName: string) => void;
  disabled?: boolean;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  models,
  selectedModel,
  onSelect,
  disabled = false,
}) => {
  return (
    <div className="space-y-3 font-mono">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {models.map((m) => {
          const isSelected = m.model_name === selectedModel;
          return (
            <button
              key={m.model_name}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(m.model_name)}
              className={`p-3.5 rounded border text-left transition-all relative ${
                isSelected
                  ? "bg-[#091a2e] border-hud-cyan shadow-[0_0_12px_rgba(0,240,255,0.25)]"
                  : "bg-[#071322] border-[#0d2a45] hover:border-[#153f68]"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs uppercase tracking-wider text-white">
                  {m.display_name}
                </span>
                {m.checkpoint_exists ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-hud-green bg-[#061a12] border border-hud-green/40 px-2 py-0.5 rounded">
                    <CheckCircle2 className="w-3 h-3" /> READY
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-hud-amber bg-[#1a1206] border border-hud-amber/40 px-2 py-0.5 rounded">
                    <AlertCircle className="w-3 h-3" /> NO WEIGHTS
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Input: {m.input_size[0]}×{m.input_size[1]}px &bull; Core: {m.architecture} &bull; Device: {m.device.toUpperCase()}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
