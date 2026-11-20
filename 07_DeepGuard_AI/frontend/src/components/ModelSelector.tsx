import React from "react";
import { Cpu, AlertCircle, CheckCircle2, Award } from "lucide-react";
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
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {models.map((m) => {
          const isSelected = m.model_name === selectedModel;
          const isChamp = m.model_name === "efficientnet_b4";

          return (
            <button
              key={m.model_name}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(m.model_name)}
              className={`p-3.5 rounded-xl border text-left transition-all relative ${
                isSelected
                  ? isChamp
                    ? "bg-amber-50/60 border-amber-400 shadow-sm ring-2 ring-amber-300"
                    : "bg-blue-50/60 border-blue-400 shadow-sm ring-2 ring-blue-300"
                  : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
              }`}
            >
              {isChamp && (
                <div className="absolute -top-2.5 right-3">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full shadow-sm">
                    <Award className="w-3 h-3" /> CHAMPION
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-slate-900 tracking-tight">
                  {m.display_name}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
                <span>{m.input_size[0]}×{m.input_size[1]}px</span>
                {m.checkpoint_exists ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" /> Ready
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    <AlertCircle className="w-3 h-3" /> Missing
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
