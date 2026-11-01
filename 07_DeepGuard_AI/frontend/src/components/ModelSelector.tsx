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
  const current = models.find((m) => m.model_name === selectedModel);

  return (
    <div className="space-y-3">
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
        Detection Neural Architecture
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {models.map((m) => {
          const isSelected = m.model_name === selectedModel;
          return (
            <button
              key={m.model_name}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(m.model_name)}
              className={`p-4 rounded-xl border text-left transition-all relative ${
                isSelected
                  ? "bg-sky-950/40 border-sky-500 shadow-md shadow-sky-500/10"
                  : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm text-white">{m.display_name}</span>
                {m.checkpoint_exists ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> Ready
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 rounded-full">
                    <AlertCircle className="w-3 h-3" /> Checkpoint Missing
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 line-clamp-2">
                Input: {m.input_size[0]}×{m.input_size[1]} px &bull; Architecture: {m.architecture} &bull; Device: {m.device}
              </p>
            </button>
          );
        })}
      </div>

      {current && !current.checkpoint_exists && (
        <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-950/30 text-amber-300 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Model Checkpoint Not Found: </span>
            {current.colab_instructions}
          </div>
        </div>
      )}
    </div>
  );
};
