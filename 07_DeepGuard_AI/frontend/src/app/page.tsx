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
  FileText,
  Activity,
  Terminal,
  Radio,
  Eye
} from "lucide-react";
import { api } from "../lib/api";
import { HistoryResponse, ModelInfo, SystemStatus } from "../lib/types";
import { StatusBadge } from "../components/StatusBadge";
import { ForensicHUD } from "../components/ForensicHUD";
import { DisclaimerAlert } from "../components/DisclaimerAlert";

export default function DashboardPage() {
  const [history, setHistory] = useState<HistoryResponse | null>(null);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [system, setSystem] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLiveHUD, setShowLiveHUD] = useState(true);

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
    <div className="w-full max-w-[1400px] mx-auto space-y-8 select-none">
      {/* Top Cyber Mission Control Hero */}
      <div className="hud-panel p-6 sm:p-8 bg-[#050c18]/90 border border-[#0d2a45]">
        <div className="reticle-tl" />
        <div className="reticle-tr" />
        <div className="reticle-bl" />
        <div className="reticle-br" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-hud-cyan/10 border border-hud-cyan/30 text-hud-cyan text-[11px] font-mono tracking-widest uppercase mb-3 glow-cyan">
              <Radio className="w-3.5 h-3.5 animate-pulse" /> DEEPGUARD AI // MILITARY & FORENSIC SUITE
            </div>
            <h1 className="text-2xl sm:text-4xl font-mono font-black text-white tracking-widest uppercase leading-tight">
              NEURAL DEEPFAKE <span className="text-hud-cyan text-glow-cyan">DETECTION COMMAND</span>
            </h1>
            <p className="text-slate-400 font-mono text-xs sm:text-sm mt-2 leading-relaxed">
              Real-time facial manipulation analysis utilizing multi-stage cascade face localization, EfficientNet-B0 / XceptionNet architectures, and temporal frame inconsistency tracking.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-5 font-mono text-xs">
              <Link
                href="/video"
                className="px-5 py-2.5 rounded font-black tracking-widest bg-hud-cyan hover:bg-cyan-300 text-slate-950 flex items-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all uppercase"
              >
                <VideoIcon className="w-4 h-4" /> SCAN VIDEO STREAM
              </Link>
              <Link
                href="/image"
                className="px-5 py-2.5 rounded font-bold tracking-widest bg-[#091729] hover:bg-[#112a45] text-hud-cyan border border-hud-cyan/40 flex items-center gap-2 transition-all uppercase"
              >
                <ImageIcon className="w-4 h-4" /> INSPECT IMAGE
              </Link>
              <button
                onClick={() => setShowLiveHUD(!showLiveHUD)}
                className="px-4 py-2.5 rounded font-bold tracking-widest bg-[#06101c] text-slate-400 hover:text-white border border-[#133251] flex items-center gap-1.5 transition-colors uppercase"
              >
                <Eye className="w-3.5 h-3.5 text-hud-cyan" /> {showLiveHUD ? "COLLAPSE HUD" : "EXPAND HUD"}
              </button>
            </div>
          </div>

          {/* Quick Hardware Status Terminal */}
          <div className="p-4 rounded bg-[#030812] border border-[#0d2a45] font-mono text-xs space-y-2 lg:w-72">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#0d2a45] text-[10px] text-slate-400 uppercase tracking-widest">
              <span>HARDWARE TELEMETRY</span>
              <span className="w-2 h-2 rounded-full bg-hud-cyan animate-pulse" />
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">ENGINE DEVICE:</span>
              <span className="text-hud-cyan font-bold">{system?.device?.toUpperCase() || "CPU"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">CUDA ACCELERATION:</span>
              <span className={system?.cuda_available ? "text-hud-green" : "text-slate-400"}>
                {system?.cuda_available ? "ACTIVE" : "STANDBY (CPU)"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">TOTAL SCANS:</span>
              <span className="text-white font-bold">{history?.total_count || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">SYSTEM STATUS:</span>
              <span className="text-hud-green font-bold">OPERATIONAL</span>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Live Forensic HUD Mission Control */}
      {showLiveHUD && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-hud-cyan tracking-widest uppercase px-1">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-hud-cyan animate-pulse glow-cyan" />
              LIVE FORENSIC INSTRUMENT TELEMETRY (STANDBY PREVIEW)
            </span>
            <span className="text-slate-400 text-[11px]">INTERACTIVE BIO-METRIC HUD</span>
          </div>
          <ForensicHUD isDemo={true} />
        </div>
      )}

      {/* Cyber Metric Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 font-mono">
        {/* Total Analyses */}
        <div className="hud-panel p-4 bg-[#050c18]/90 border border-[#0d2a45]">
          <div className="text-[10px] text-slate-400 uppercase tracking-widest">TOTAL ANALYSES</div>
          <div className="text-2xl font-black text-white mt-1">{history?.total_count ?? 0}</div>
          <div className="text-[10px] text-hud-cyan mt-0.5 tracking-wider">ALL MEDIA TYPES</div>
        </div>

        {/* Images */}
        <div className="hud-panel p-4 bg-[#050c18]/90 border border-[#0d2a45]">
          <div className="text-[10px] text-slate-400 uppercase tracking-widest">IMAGES ANALYZED</div>
          <div className="text-2xl font-black text-hud-cyan mt-1">{history?.total_images ?? 0}</div>
          <div className="text-[10px] text-slate-400 mt-0.5 tracking-wider">STILL FRAMES</div>
        </div>

        {/* Videos */}
        <div className="hud-panel p-4 bg-[#050c18]/90 border border-[#0d2a45]">
          <div className="text-[10px] text-slate-400 uppercase tracking-widest">VIDEOS ANALYZED</div>
          <div className="text-2xl font-black text-hud-cyan mt-1">{history?.total_videos ?? 0}</div>
          <div className="text-[10px] text-slate-400 mt-0.5 tracking-wider">TEMPORAL SEQUENCES</div>
        </div>

        {/* Manipulated */}
        <div className="hud-panel p-4 bg-[#050c18]/90 border border-[#0d2a45]">
          <div className="text-[10px] text-slate-400 uppercase tracking-widest">SYNTHETIC DETECTED</div>
          <div className="text-2xl font-black text-hud-amber mt-1 text-glow-amber">
            {history?.manipulated_count ?? 0}
          </div>
          <div className="text-[10px] text-hud-amber/80 mt-0.5 tracking-wider">MANIPULATION FLAGGED</div>
        </div>

        {/* Authentic */}
        <div className="hud-panel p-4 bg-[#050c18]/90 border border-[#0d2a45]">
          <div className="text-[10px] text-slate-400 uppercase tracking-widest">VERIFIED AUTHENTIC</div>
          <div className="text-2xl font-black text-hud-green mt-1">
            {history?.authentic_count ?? 0}
          </div>
          <div className="text-[10px] text-hud-green/80 mt-0.5 tracking-wider">PRISTINE CONFIRMED</div>
        </div>
      </div>

      {/* Recent Investigations Tactical Table */}
      <div className="hud-panel bg-[#050c18]/90 border border-[#0d2a45] overflow-hidden">
        <div className="reticle-tl" />
        <div className="reticle-tr" />
        <div className="reticle-bl" />
        <div className="reticle-br" />

        <div className="p-4 border-b border-[#0d2a45] flex items-center justify-between">
          <div>
            <h3 className="text-xs font-mono font-bold tracking-widest text-hud-cyan uppercase">
              RECENT FORENSIC INVESTIGATIONS LOG
            </h3>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
              REAL-TIME BUFFER OF PROCESSED VERIFICATION QUERIES
            </p>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-1.5 rounded text-slate-400 hover:text-hud-cyan hover:bg-[#0b1c2f] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-hud-cyan" : ""}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#081525] text-slate-400 uppercase border-b border-[#0d2a45]">
              <tr>
                <th className="px-5 py-3">FILE IDENTIFIER</th>
                <th className="px-5 py-3">MEDIA</th>
                <th className="px-5 py-3">ARCHITECTURE</th>
                <th className="px-5 py-3">VERDICT</th>
                <th className="px-5 py-3">SYNTHETIC PROBABILITY</th>
                <th className="px-5 py-3">EXECUTION</th>
                <th className="px-5 py-3 text-right">TELEMETRY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0d2a45]">
              {history?.items && history.items.length > 0 ? (
                history.items.map((item) => (
                  <tr key={item.id} className="hover:bg-[#0a1b2e] transition-colors">
                    <td className="px-5 py-3.5 font-bold text-white truncate max-w-xs">
                      {item.original_filename}
                    </td>
                    <td className="px-5 py-3.5 uppercase text-hud-cyan text-[11px]">
                      {item.media_type}
                    </td>
                    <td className="px-5 py-3.5 text-slate-300">
                      {item.model_name}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={item.prediction || item.status} size="sm" />
                    </td>
                    <td className="px-5 py-3.5">
                      {item.fake_probability !== undefined && item.fake_probability !== null ? (
                        <span
                          className={`font-bold ${
                            item.fake_probability >= 0.5 ? "text-hud-amber" : "text-hud-green"
                          }`}
                        >
                          {(item.fake_probability * 100).toFixed(1)}%
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-slate-400">
                      {item.execution_duration_sec > 0 ? `${item.execution_duration_sec}s` : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/analysis/${item.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-hud-cyan/15 hover:bg-hud-cyan/25 text-hud-cyan border border-hud-cyan/40 font-bold transition-colors"
                      >
                        OPEN HUD &gt;
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-400 font-mono">
                    NO FORENSIC CASES IN LOG. INGEST AN IMAGE OR VIDEO TO INITIALIZE.
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
