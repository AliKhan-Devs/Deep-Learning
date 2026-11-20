"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  Image as ImageIcon,
  Video as VideoIcon,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Cpu,
  FileText,
  Activity,
  Layers,
  Award,
  BarChart3,
  Zap,
} from "lucide-react";
import { api } from "../lib/api";
import { HistoryResponse, ModelInfo, SystemStatus, ModelBenchmarkItem } from "../lib/types";
import { DisclaimerAlert } from "../components/DisclaimerAlert";

export default function DashboardPage() {
  const [history, setHistory] = useState<HistoryResponse | null>(null);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [benchmarks, setBenchmarks] = useState<ModelBenchmarkItem[]>([]);
  const [system, setSystem] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [histData, modelsData, sysData, benchData] = await Promise.all([
        api.getHistory(1, 10).catch(() => null),
        api.getModels().catch(() => []),
        api.getSystemStatus().catch(() => null),
        api.getBenchmarks().catch(() => []),
      ]);
      setHistory(histData);
      setModels(modelsData);
      setSystem(sysData);
      setBenchmarks(benchData);
    } catch (err) {
      console.error("Dashboard fetch failure:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-3">
              <Award className="w-4 h-4 text-amber-600" /> Deep Learning Computer Vision & Forensic Suite
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              DeepGuard <span className="text-blue-600">AI</span>
            </h1>
            <p className="text-slate-600 text-sm sm:text-base mt-2 leading-relaxed">
              Empirical deepfake detection framework powered by three experimental architectures. Features our champion model, <strong>EfficientNet-B4</strong> (97.0% Accuracy & 0.9968 ROC-AUC), paired with an interactive 3-model live arena and automated video frame sampling.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-6 text-sm">
              <Link
                href="/arena"
                className="px-5 py-2.5 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 shadow-sm transition-all"
              >
                <Layers className="w-4 h-4" /> Open 3-Model Arena
              </Link>
              <Link
                href="/image"
                className="px-5 py-2.5 rounded-xl font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center gap-2 border border-slate-200 transition-all"
              >
                <ImageIcon className="w-4 h-4 text-slate-600" /> Image Inspector
              </Link>
              <Link
                href="/video"
                className="px-5 py-2.5 rounded-xl font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center gap-2 border border-slate-200 transition-all"
              >
                <VideoIcon className="w-4 h-4 text-slate-600" /> Video Forensics
              </Link>
              <Link
                href="/benchmarks"
                className="px-5 py-2.5 rounded-xl font-medium text-blue-700 hover:bg-blue-50 flex items-center gap-2 transition-all"
              >
                <BarChart3 className="w-4 h-4" /> Experiment Benchmarks &rarr;
              </Link>
            </div>
          </div>

          {/* Champion Highlight Box */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-6 shadow-sm max-w-sm w-full">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider mb-2">
              <Award className="w-5 h-5 text-amber-600" /> Model Champion
            </div>
            <div className="text-xl font-black text-slate-900">
              EfficientNet-B4
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Outperformed XceptionNet and EfficientNet-B0 across all forensic metrics on 8,938 test images.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-amber-200/60 font-mono text-center">
              <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200">
                <div className="text-[10px] text-slate-500 uppercase font-sans">Accuracy</div>
                <div className="text-lg font-bold text-emerald-600">97.0%</div>
              </div>
              <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200">
                <div className="text-[10px] text-slate-500 uppercase font-sans">ROC-AUC</div>
                <div className="text-lg font-bold text-blue-600">0.9968</div>
              </div>
            </div>

            <div className="mt-3 text-[11px] text-amber-900 flex items-center justify-between">
              <span>Missed Fakes: <strong>80 / 4,469</strong></span>
              <span>Resolution: <strong>380×380</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Model Experimental Summary Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-600" />
            Experimental Model Roster & Specifications
          </h2>
          <Link
            href="/benchmarks"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            Full Diagnostic Charts <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Champion: EfficientNet-B4 */}
          <div className="bg-white rounded-xl border-2 border-amber-400 p-6 shadow-md relative space-y-4">
            <div className="absolute -top-3 right-4">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white shadow-sm">
                <Award className="w-3.5 h-3.5" /> CHAMPION
              </span>
            </div>

            <div>
              <div className="text-xs text-amber-800 font-semibold uppercase tracking-wider">
                Experiment 3
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                EfficientNet-B4 Detector
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Compound scaled CNN optimized for high-frequency artifact preservation.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 font-mono text-center text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] font-sans">Accuracy</span>
                <span className="font-bold text-emerald-600 text-sm">97.0%</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-sans">ROC-AUC</span>
                <span className="font-bold text-blue-600 text-sm">0.9968</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-sans">Resolution</span>
                <span className="font-bold text-slate-800 text-sm">380px</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Highest precision and recall. Only 80 deepfakes missed out of 4,469 test images.
            </p>

            <Link
              href="/arena"
              className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              Test in 3-Model Arena
            </Link>
          </div>

          {/* Xception */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-slate-300 transition-all space-y-4">
            <div>
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                Experiment 2
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                XceptionNet Detector
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Classical deepfake benchmark utilizing depthwise separable convolutions.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 font-mono text-center text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] font-sans">Accuracy</span>
                <span className="font-bold text-slate-800 text-sm">93.0%</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-sans">ROC-AUC</span>
                <span className="font-bold text-slate-800 text-sm">0.9867</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-sans">Resolution</span>
                <span className="font-bold text-slate-800 text-sm">299px</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Solid cross-channel baseline. 210 deepfakes missed out of 4,469 test images.
            </p>

            <Link
              href="/arena"
              className="w-full py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              Test in 3-Model Arena
            </Link>
          </div>

          {/* EfficientNet-B0 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-slate-300 transition-all space-y-4">
            <div>
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                Experiment 1
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                EfficientNet-B0 Detector
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Ultra-lightweight 16 MB baseline designed for resource-constrained edge devices.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 font-mono text-center text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] font-sans">Accuracy</span>
                <span className="font-bold text-slate-800 text-sm">92.0%</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-sans">ROC-AUC</span>
                <span className="font-bold text-slate-800 text-sm">0.9795</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-sans">Resolution</span>
                <span className="font-bold text-slate-800 text-sm">224px</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Fastest inference footprint (16 MB). 316 deepfakes missed out of 4,469 test images.
            </p>

            <Link
              href="/arena"
              className="w-full py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              Test in 3-Model Arena
            </Link>
          </div>
        </div>
      </div>

      {/* Recent History or Quick Stats */}
      {history && history.items && history.items.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              Recent Forensic Analysis Records
            </h2>
            <span className="text-xs text-slate-500">
              Total Recorded: {history.total_count}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">File</th>
                  <th className="py-2.5 px-4 font-semibold">Type</th>
                  <th className="py-2.5 px-4 font-semibold">Model</th>
                  <th className="py-2.5 px-4 font-semibold">Verdict</th>
                  <th className="py-2.5 px-4 font-semibold">Fake Prob</th>
                  <th className="py-2.5 px-4 font-semibold">Latency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-mono">
                {history.items.slice(0, 5).map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-sans font-medium text-slate-900 truncate max-w-[200px]">
                      {item.original_filename}
                    </td>
                    <td className="py-3 px-4 uppercase text-slate-500">
                      {item.media_type}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {item.model_name}
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          item.prediction === "Likely Manipulated"
                            ? "bg-red-50 text-red-700"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {item.prediction || item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {item.fake_probability !== undefined
                        ? `${(item.fake_probability * 100).toFixed(1)}%`
                        : "N/A"}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {(item.execution_duration_sec * 1000).toFixed(0)} ms
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <DisclaimerAlert />
    </div>
  );
}
