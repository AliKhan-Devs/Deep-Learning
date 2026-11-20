'use client';

import React from 'react';
import { SampleScanInfo } from '../lib/types';
import { Sparkles, Shield, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface SampleScanGalleryProps {
  samples: SampleScanInfo[];
  selectedId?: string;
  onSelect: (sampleId: string) => void;
  isLoading: boolean;
}

export default function SampleScanGallery({
  samples,
  selectedId,
  onSelect,
  isLoading,
}: SampleScanGalleryProps) {
  const getBadgeStyle = (cls: string) => {
    switch (cls) {
      case 'glioma':
        return 'border-rose-500/40 text-rose-400 bg-rose-500/10 hover:bg-rose-500/20';
      case 'meningioma':
        return 'border-amber-500/40 text-amber-400 bg-amber-500/10 hover:bg-amber-500/20';
      case 'pituitary':
        return 'border-purple-500/40 text-purple-400 bg-purple-500/10 hover:bg-purple-500/20';
      case 'notumor':
      default:
        return 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20';
    }
  };

  return (
    <div className="bg-pacs-900 border border-pacs-700/80 rounded-xl p-4 shadow-md">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-white tracking-wide uppercase">
            Clinical Demo Gallery (1-Click Test)
          </h3>
        </div>
        <span className="text-[11px] text-slate-400">
          Zero-upload instant radiological evaluation
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {samples.map((sample) => {
          const isSelected = selectedId === sample.id;
          const badgeClass = getBadgeStyle(sample.class_name);

          return (
            <button
              key={sample.id}
              onClick={() => onSelect(sample.id)}
              disabled={isLoading}
              className={`p-3 rounded-lg border text-left transition-all relative overflow-hidden group ${
                isSelected
                  ? 'border-cyan-400 bg-cyan-950/40 ring-1 ring-cyan-400 shadow-md shadow-cyan-950/60'
                  : 'border-pacs-700/60 bg-pacs-850 hover:border-pacs-600 hover:bg-pacs-800'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase ${badgeClass}`}>
                  {sample.class_name}
                </span>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                )}
              </div>
              <p className="text-xs font-semibold text-white truncate group-hover:text-cyan-300 transition-colors">
                {sample.title}
              </p>
              <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                {sample.clinical_notes}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
