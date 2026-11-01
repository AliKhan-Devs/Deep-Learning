"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  Trash2,
  ArrowLeft,
  Clock,
  Cpu,
  Download,
  AlertTriangle,
  RefreshCw,
  Share2
} from "lucide-react";
import { api } from "../../../lib/api";
import { VideoAnalysisResponse } from "../../../lib/types";
import { StatusBadge } from "../../../components/StatusBadge";
import { VideoTimeline } from "../../../components/VideoTimeline";
import { DisclaimerAlert } from "../../../components/DisclaimerAlert";

export default function AnalysisDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [data, setData] = useState<VideoAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      api
        .getAnalysisStatus(id)
        .then((res) => setData(res))
        .catch((err) => console.error("Error loading analysis:", err))
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
      <div className="flex items-center justify-center min-h-[50vh]">
        <RefreshCw className="w-6 h-6 text-sky-400 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-xl font-bold text-white">Analysis Record Not Found</h2>
        <Link href="/" className="inline-flex items-center gap-1.5 text-sky-400 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="flex items-center gap-2">
          <a
            href={api.getReportUrl(id, "json")}
            download
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> JSON Export
          </a>
          <a
            href={api.getReportUrl(id, "html")}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <FileText className="w-3.5 h-3.5" /> HTML Certificate
          </a>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            title="Delete Record"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Analysis Card */}
      <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase font-mono text-slate-400">ID: {data.analysis_id}</span>
              <StatusBadge status={data.prediction || data.status} size="sm" />
            </div>
            <h1 className="text-2xl font-black text-white">{data.original_filename}</h1>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400 uppercase font-semibold">Manipulation Score</div>
            <div className="text-3xl font-black text-rose-400">
              {data.fake_probability !== undefined && data.fake_probability !== null
                ? `${(data.fake_probability * 100).toFixed(1)}%`
                : "—"}
            </div>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-[11px] font-semibold text-slate-400 uppercase">Media Type</div>
            <div className="text-sm font-bold text-white uppercase mt-0.5">{data.media_type}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-[11px] font-semibold text-slate-400 uppercase">Architecture</div>
            <div className="text-sm font-bold text-sky-400 mt-0.5">{data.model_name}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-[11px] font-semibold text-slate-400 uppercase">Duration</div>
            <div className="text-sm font-bold text-white mt-0.5">{data.execution_duration_sec}s</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-[11px] font-semibold text-slate-400 uppercase">Timestamp</div>
            <div className="text-xs font-mono text-slate-300 mt-1 truncate">{data.created_at}</div>
          </div>
        </div>

        {/* Video Timeline View if Video */}
        {data.media_type === "video" && data.timeline.length > 0 && (
          <div className="pt-4 border-t border-slate-800">
            <VideoTimeline timeline={data.timeline} />
          </div>
        )}
      </div>

      <DisclaimerAlert />
    </div>
  );
}
