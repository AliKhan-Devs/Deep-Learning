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
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { api } from "../../../lib/api";
import { VideoAnalysisResponse } from "../../../lib/types";
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
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        <span className="text-sm font-semibold text-slate-600">
          Loading Forensic Telemetry...
        </span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-2xl mx-auto text-center py-24 space-y-4">
        <div className="inline-flex p-3 rounded-full bg-red-50 border border-red-200 text-red-600">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          Analysis Record Not Found
        </h2>
        <p className="text-sm text-slate-500">
          Record ID: {id} may have expired or been deleted from storage.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isFake = (data.fake_probability || 0) >= 0.5;

  return (
    <div className="w-full space-y-6">
      {/* Top Utility Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 flex items-center gap-1.5 transition-colors"
            title="Delete Record"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete Record
          </button>
        </div>
      </div>

      {/* Main Report Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Forensic Report: {data.original_filename}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              ID: {id} &bull; Model: {data.model_name} &bull; Created: {data.created_at}
            </p>
          </div>

          <div
            className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 border ${
              isFake
                ? "bg-red-50 text-red-700 border-red-200"
                : "bg-emerald-50 text-emerald-700 border-emerald-200"
            }`}
          >
            {isFake ? <ShieldAlert className="w-5 h-5 text-red-600" /> : <ShieldCheck className="w-5 h-5 text-emerald-600" />}
            {data.prediction} ({((data.fake_probability || 0) * 100).toFixed(1)}% Fake)
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs text-slate-500">Status</div>
            <div className="text-base font-bold text-slate-900 mt-1">{data.status}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs text-slate-500">Frames Analyzed</div>
            <div className="text-base font-bold text-slate-900 mt-1">{data.frames_analyzed}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs text-slate-500">Frames with Faces</div>
            <div className="text-base font-bold text-slate-900 mt-1">{data.frames_with_faces}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs text-slate-500">Suspicious Frames</div>
            <div className="text-base font-bold text-slate-900 mt-1">{data.suspicious_frames_count}</div>
          </div>
        </div>
      </div>

      <DisclaimerAlert />
    </div>
  );
}
