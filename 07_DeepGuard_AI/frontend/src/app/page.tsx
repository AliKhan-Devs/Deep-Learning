"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Image as ImageIcon,
  Video as VideoIcon,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Cpu,
  FileText
} from "lucide-react";
import { api } from "../lib/api";
import { HistoryResponse, ModelInfo, SystemStatus } from "../lib/types";
import { StatCard } from "../components/StatCard";
import { StatusBadge } from "../components/StatusBadge";
import { DisclaimerAlert } from "../components/DisclaimerAlert";

export default function DashboardPage() {
  const [history, setHistory] = useState<HistoryResponse | null>(null);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [system, setSystem] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [histData, modelsData, sysData] = await Promise.all([
        api.getHistory(1, 10),
        api.getModels(),
        api.getSystemStatus(),
      ]);
      setHistory(histData);
      setModels(modelsData);
      setSystem(sysData);
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
      <div className="relative rounded-3xl p-8 sm:p-12 overflow-hidden border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-sky-950/30 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Cpu className="w-3.5 h-3.5" /> AI Digital Forensics Platform
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
            Forensic Deepfake <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">Detection</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            DeepGuard AI evaluates subtle facial synthesis artifacts using fine-tuned EfficientNet-B0 and XceptionNet architectures. Inspect single images or analyze video sequences with controlled frame sampling and aggregation.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/image"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-lg shadow-sky-500/25 transition-all"
            >
              <ImageIcon className="w-4 h-4" /> Analyze Image
            </Link>
            <Link
              href="/video"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all"
            >
              <VideoIcon className="w-4 h-4" /> Analyze Video
            </Link>
          </div>
        </div>
      </div>

      {/* Model Readiness Status Alert */}
      {models.some((m) => !m.checkpoint_exists) && (
        <div className="p-5 rounded-2xl border border-amber-500/30 bg-amber-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-amber-300">Google Colab Model Training Required</h4>
              <p className="text-xs text-amber-200/80 mt-0.5">
                Local checkpoint weights (<code className="font-mono text-amber-100">best_model.pth</code>) have not yet been downloaded. Train the model using the provided Google Colab notebook and save to the artifacts directory.
              </p>
            </div>
          </div>
          <Link
            href="/models"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 shrink-0 transition-colors"
          >
            View Colab Guide
          </Link>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Analyses"
          value={history?.total_count ?? 0}
          subtitle="Processed media items"
          trendColor="sky"
        />
        <StatCard
          title="Images Analyzed"
          value={history?.total_images ?? 0}
          subtitle="Single image queries"
          trendColor="sky"
          icon={<ImageIcon className="w-4 h-4" />}
        />
        <StatCard
          title="Videos Analyzed"
          value={history?.total_videos ?? 0}
          subtitle="Video sequences"
          trendColor="sky"
          icon={<VideoIcon className="w-4 h-4" />}
        />
        <StatCard
          title="Likely Manipulated"
          value={history?.manipulated_count ?? 0}
          subtitle="Synthesized content flagged"
          trendColor="rose"
          icon={<ShieldAlert className="w-4 h-4" />}
        />
        <StatCard
          title="Likely Authentic"
          value={history?.authentic_count ?? 0}
          subtitle="Pristine media confirmed"
          trendColor="emerald"
          icon={<CheckCircle className="w-4 h-4" />}
        />
      </div>

      {/* Recent Analyses Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-lg">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-white">Recent Forensic Analyses</h3>
            <p className="text-xs text-slate-400 mt-0.5">Real-time log of processed verification queries</p>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Filename</th>
                <th className="px-6 py-3.5">Type</th>
                <th className="px-6 py-3.5">Model</th>
                <th className="px-6 py-3.5">Verdict</th>
                <th className="px-6 py-3.5">Manipulation Score</th>
                <th className="px-6 py-3.5">Duration</th>
                <th className="px-6 py-3.5 text-right">Report</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {history?.items && history.items.length > 0 ? (
                history.items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-white truncate max-w-xs">
                      {item.original_filename}
                    </td>
                    <td className="px-6 py-4 uppercase text-slate-400 font-mono text-[11px]">
                      {item.media_type}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-300">
                      {item.model_name}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={item.prediction || item.status} size="sm" />
                    </td>
                    <td className="px-6 py-4 font-mono">
                      {item.fake_probability !== undefined && item.fake_probability !== null
                        ? `${(item.fake_probability * 100).toFixed(1)}%`
                        : "—"}
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-mono">
                      {item.execution_duration_sec > 0 ? `${item.execution_duration_sec}s` : "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/analysis/${item.id}`}
                        className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 font-semibold"
                      >
                        Inspect <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No analyses recorded yet. Upload an image or video to begin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DisclaimerAlert />
    </div>
  );
}
