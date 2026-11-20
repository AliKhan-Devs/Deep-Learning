'use client';

import React from 'react';
import { DiagnosticResult } from '../lib/types';
import { X, Printer, ShieldCheck, Brain, AlertCircle } from 'lucide-react';

interface ClinicalReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: DiagnosticResult;
}

export default function ClinicalReportModal({ isOpen, onClose, result }: ClinicalReportModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-pacs-900 border border-pacs-700 rounded-xl max-w-3xl w-full p-6 shadow-2xl relative text-white my-8">
        {/* Header Controls */}
        <div className="flex items-center justify-between border-b border-pacs-750 pb-4 mb-4">
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold">Clinical Neuroradiology Diagnostic Summary</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
            >
              <Printer className="w-4 h-4" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-pacs-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="space-y-5 print:text-black">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-pacs-850 rounded-lg text-xs font-mono border border-pacs-750">
            <div>
              <span className="text-slate-400 block text-[10px]">SCAN ACCESSION</span>
              <span className="font-bold text-white">#{result.scan_id.toUpperCase()}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">EXAMINATION DATE</span>
              <span className="font-bold text-white">{new Date().toLocaleDateString()}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">MODALITY</span>
              <span className="font-bold text-white">Cranial MRI (T1/T2)</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">AI ENGINE</span>
              <span className="font-bold text-cyan-400">DenseNet-121 (95.56%)</span>
            </div>
          </div>

          {/* Saliency Verification Images */}
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-pacs-800 rounded-lg p-2 bg-black text-center">
              <span className="text-[10px] font-mono text-slate-400 block mb-1">
                EXAMINED MRI SLICE
              </span>
              <img
                src={result.original_b64}
                alt="Examined MRI"
                className="w-full max-h-56 object-contain mx-auto rounded"
              />
            </div>
            <div className="border border-pacs-800 rounded-lg p-2 bg-black text-center">
              <span className="text-[10px] font-mono text-cyan-400 block mb-1">
                GRAD-CAM++ TUMOR ATTRIBUTION
              </span>
              <img
                src={result.gradcam_pp_jet_b64}
                alt="XAI Saliency"
                className="w-full max-h-56 object-contain mx-auto rounded"
              />
            </div>
          </div>

          {/* Primary Finding */}
          <div className="border border-pacs-750 rounded-lg p-4 bg-pacs-850">
            <h3 className="text-xs uppercase font-bold text-cyan-400 mb-1">Radiological Finding</h3>
            <p className="text-sm font-semibold text-white">
              Primary Diagnosis: <span className="uppercase text-emerald-400">{result.predicted_class}</span> (
              {(result.confidence * 100).toFixed(1)}% Confidence)
            </p>
            <p className="text-xs text-slate-300 mt-1">
              Shannon Softmax Entropy: <span className="font-mono">{result.entropy.toFixed(3)} bits</span> &mdash;{' '}
              <span className="font-semibold text-cyan-300">{result.risk_level.replace('_', ' ')}</span>
            </p>
          </div>

          {/* Differential Breakdown */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Differential Diagnosis Matrix
            </h4>
            <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
              {result.probabilities.map((item) => (
                <div key={item.class_name} className="p-2 rounded bg-pacs-850 border border-pacs-800">
                  <span className="text-[10px] text-slate-400 block uppercase">{item.class_name}</span>
                  <span className="font-bold text-white">{item.percentage.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Clinical Sign-off / Disclaimer */}
          <div className="text-[10px] text-slate-500 border-t border-pacs-800 pt-3 flex justify-between items-center">
            <p>
              * Generated by NeuroScan XAI Clinical Decision Support System. Saliency maps derived from
              DenseNet-121 layer denseblock4. Final verification required by board-certified neuroradiologist.
            </p>
            <div className="text-right border-t border-slate-600 pt-1 w-36">
              <span>Physician Sign-Off</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
