'use client';

import React from 'react';
import { DiagnosticResult } from '../lib/types';
import { ShieldCheck, AlertCircle, AlertTriangle, FileDown, Activity, CheckCircle2 } from 'lucide-react';

interface DiagnosticCardProps {
  result: DiagnosticResult;
  onOpenReport: () => void;
}

export default function DiagnosticCard({ result, onOpenReport }: DiagnosticCardProps) {
  // Format class name nicely
  const getClassNameDisplay = (name: string) => {
    switch (name) {
      case 'glioma':
        return 'Glioma (Glial Neoplasm)';
      case 'meningioma':
        return 'Meningioma (Extra-Axial)';
      case 'pituitary':
        return 'Pituitary Adenoma';
      case 'notumor':
      default:
        return 'No Tumor Detected (Healthy)';
    }
  };

  const getClassBadgeColor = (name: string) => {
    switch (name) {
      case 'glioma':
        return 'bg-rose-500/15 border-rose-500/40 text-rose-400';
      case 'meningioma':
        return 'bg-amber-500/15 border-amber-500/40 text-amber-400';
      case 'pituitary':
        return 'bg-purple-500/15 border-purple-500/40 text-purple-400';
      case 'notumor':
      default:
        return 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CONFIDENT':
        return {
          badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40',
          icon: ShieldCheck,
          text: 'text-emerald-400',
        };
      case 'REVIEW_RECOMMENDED':
        return {
          badge: 'bg-amber-500/15 text-amber-400 border-amber-500/40',
          icon: AlertTriangle,
          text: 'text-amber-400',
        };
      case 'HIGH_UNCERTAINTY':
      default:
        return {
          badge: 'bg-rose-500/15 text-rose-400 border-rose-500/40',
          icon: AlertCircle,
          text: 'text-rose-400',
        };
    }
  };

  const riskStyle = getRiskColor(result.risk_level);
  const RiskIcon = riskStyle.icon;

  return (
    <div className="bg-pacs-900 border border-pacs-700/80 rounded-xl p-5 shadow-xl flex flex-col space-y-5">
      {/* Primary Diagnosis Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            Primary Radiological Finding
          </span>
          <span className="text-xs font-mono text-cyan-400">
            DenseNet-121
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span
              className={`text-sm sm:text-base font-bold px-3 py-1 rounded-lg border uppercase tracking-wide ${getClassBadgeColor(
                result.predicted_class
              )}`}
            >
              {getClassNameDisplay(result.predicted_class)}
            </span>
          </div>

          <div className="text-right">
            <span className="text-2xl font-bold font-mono text-white">
              {(result.confidence * 100).toFixed(1)}%
            </span>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Likelihood</p>
          </div>
        </div>
      </div>

      <div className="h-px bg-pacs-800" />

      {/* Uncertainty & Clinical Safety Gauge (Shannon Entropy) */}
      <div className="bg-pacs-850 border border-pacs-750 rounded-lg p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <RiskIcon className={`w-4 h-4 ${riskStyle.text}`} />
            <span className="text-xs font-bold text-white uppercase tracking-wide">
              Clinical Triage & Safety
            </span>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${riskStyle.badge}`}>
            {result.risk_level.replace('_', ' ')}
          </span>
        </div>

        {/* Entropy Meter */}
        <div>
          <div className="flex justify-between text-[11px] font-mono text-slate-300 mb-1">
            <span>Shannon Entropy H(p):</span>
            <span className="font-bold text-cyan-400">{result.entropy.toFixed(3)} bits</span>
          </div>
          <div className="w-full bg-pacs-950 h-2 rounded-full overflow-hidden flex">
            {/* Entropy ranges: [0.0 - 0.40] Low, [0.40 - 0.85] Moderate, [0.85 - 2.0] High */}
            <div
              className={`h-full transition-all duration-300 ${
                result.entropy < 0.4
                  ? 'bg-emerald-500'
                  : result.entropy < 0.85
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(100, (result.entropy / 2.0) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[9px] font-mono text-slate-400 mt-1">
            <span>0.0 (Certain)</span>
            <span>0.40 (Triage Cutoff)</span>
            <span>0.85 (Ambiguous)</span>
            <span>2.0 (Max Ent)</span>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed border-t border-pacs-800/80 pt-2">
          {result.risk_description}
        </p>
      </div>

      {/* Differential Diagnosis Probability Distribution */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
          <span>Differential Probabilities</span>
          <span className="text-[10px] font-normal text-slate-400">Sum = 100%</span>
        </h4>

        <div className="space-y-2">
          {result.probabilities.map((item) => {
            const isTop = item.class_name === result.predicted_class;
            return (
              <div key={item.class_name} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className={`font-medium capitalize ${isTop ? 'text-white font-bold' : 'text-slate-400'}`}>
                    {item.class_name}
                  </span>
                  <span className="font-mono text-slate-300 font-semibold">
                    {item.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-pacs-950 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      item.class_name === 'glioma'
                        ? 'bg-rose-500'
                        : item.class_name === 'meningioma'
                        ? 'bg-amber-500'
                        : item.class_name === 'pituitary'
                        ? 'bg-purple-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Report Generator Action */}
      <div className="pt-2">
        <button
          onClick={onOpenReport}
          className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg bg-pacs-800 hover:bg-pacs-750 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 transition-all font-semibold text-xs uppercase tracking-wider shadow-sm"
        >
          <FileDown className="w-4 h-4" />
          <span>Export Clinical Findings Report</span>
        </button>
      </div>
    </div>
  );
}
