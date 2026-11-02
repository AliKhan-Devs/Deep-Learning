"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  Trash2,
  ArrowLeft,
  Download,
  RefreshCw,
  Share2,
  AlertTriangle
} from "lucide-react";
import { api } from "../../../lib/api";
import { VideoAnalysisResponse } from "../../../lib/types";
import { ForensicHUD } from "../../../components/ForensicHUD";
import { DisclaimerAlert } from "../../../components/DisclaimerAlert";

export default function AnalysisDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [data, setData] = useState<VideoAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      api
        .getAnalysisStatus(id)
        .then((res) => setData(res))
        .catch((err) => {
          console.error("Error loading analysis:", err);
          setError("Failed to fetch analysis record.");
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this forensic analysis record?")) return;
    setDeleting(true);
    try {
      await api.deleteAnalysis(id);
      router.push("/");
    } catch (err) {
      alert("Failed to delete record.");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RefreshCw className="w-8 h-8 text-hud-cyan animate-spin glow-cyan" />
        <span className="text-xs font-mono tracking-widest text-hud-cyan uppercase">
          INITIALIZING FORENSIC TELEMETRY...
        </span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-2xl mx-auto text-center py-24 space-y-4">
        <div className="inline-flex p-3 rounded-full bg-red-950/40 border border-red-500/40 text-red-400">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-mono font-bold text-white uppercase tracking-wider">
          Analysis Record Not Found
        </h2>
        <p className="text-xs font-mono text-slate-400">
          Record ID: {id} may have expired or been deleted from storage.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded text-xs font-mono font-bold bg-[#0a1b2d] hover:bg-[#122c47] text-hud-cyan border border-hud-cyan/40 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> RETURN TO DASHBOARD
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Top Utility Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-[#0d2a45]">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono font-bold text-slate-400 hover:text-hud-cyan transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> &lt; DASHBOARD
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-3 py-1.5 rounded text-xs font-mono bg-[#180a0d] hover:bg-red-950 text-red-400 border border-red-900/60 flex items-center gap-1.5 transition-colors"
            title="Purge Record"
          >
            <Trash2 className="w-3.5 h-3.5" /> PURGE RECORD
          </button>
        </div>
      </div>

      {/* Main Military/Cyber Forensic HUD Dashboard */}
      <ForensicHUD videoData={data} analysisId={id} />

      {/* Legal & Scientific Disclaimer */}
      <div className="pt-4">
        <DisclaimerAlert />
      </div>
    </div>
  );
}
