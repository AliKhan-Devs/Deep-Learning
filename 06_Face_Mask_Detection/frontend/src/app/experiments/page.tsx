"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "../../components/Header";
import {
  Award,
  ArrowLeft,
  TrendingUp,
  BarChart2,
  HelpCircle,
  LayoutGrid,
} from "lucide-react";

export default function ExperimentsPage() {
  const [activeTab, setActiveTab] = useState<"v3" | "v2" | "v1">("v3");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <Header status={null} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Comparative Experiment Analysis
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  3 YOLO Training Runs
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Detailed 50-epoch benchmark between YOLOv8n, YOLOv26n, and YOLOv26s
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/arena"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-all flex items-center gap-1"
            >
              <LayoutGrid className="w-3.5 h-3.5" /> 3-Model Live Arena →
            </Link>
          </div>
        </div>

        {/* Champion Announcement Card */}
        <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5 w-fit">
                <Award className="w-4 h-4 text-emerald-600" /> OFFICIAL CHAMPION: EXPERIMENT 3 (YOLOv26s)
              </span>
              <h3 className="text-xl font-bold text-slate-900">
                Why YOLOv26s Was Selected For Final Production Deployment
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
                Across 50 training epochs, <strong>YOLOv26s</strong> delivered the benchmark-leading{" "}
                <span className="text-emerald-700 font-bold font-mono">55.85% mAP50-95</span>.
                While lightweight nano architectures (V1 and V2) performed well at rough 50% IoU thresholds,
                YOLOv26s demonstrated tighter bounding-box boundaries, lowest classification loss (0.5384),
                and zero false negative drop-offs in crowded scenes.
              </p>
            </div>

            <div className="flex flex-row md:flex-col gap-3 shrink-0">
              <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 text-center min-w-[130px]">
                <div className="text-[10px] text-emerald-800 uppercase font-bold">Champion mAP50-95</div>
                <div className="text-2xl font-bold font-mono text-emerald-700">55.85%</div>
                <div className="text-[10px] text-emerald-600">Strict IoU Accuracy</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center min-w-[130px]">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Precision / Recall</div>
                <div className="text-2xl font-bold font-mono text-slate-800">91.5% / 84.8%</div>
                <div className="text-[10px] text-slate-500">Balanced Detection</div>
              </div>
            </div>
          </div>
        </div>

        {/* Side-by-Side Comparison Matrix */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-sky-600" />
              Side-by-Side 3-Experiment Performance Matrix
            </h3>
            <span className="text-xs text-slate-500">Evaluated on identical test sets</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase text-[10px]">
                  <th className="py-3 px-4">Metric / Parameter</th>
                  <th className="py-3 px-4">V1: YOLOv8n (Baseline)</th>
                  <th className="py-3 px-4">V2: YOLOv26n (Nano Custom)</th>
                  <th className="py-3 px-4 text-emerald-800 font-bold bg-emerald-50/60">
                    V3: YOLOv26s (Champion) 🏆
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                <tr>
                  <td className="py-2.5 px-4 text-slate-700 font-sans font-medium">Architecture</td>
                  <td className="py-2.5 px-4 text-slate-600">YOLOv8 Nano</td>
                  <td className="py-2.5 px-4 text-slate-600">YOLO Nano Custom</td>
                  <td className="py-2.5 px-4 text-emerald-800 font-semibold bg-emerald-50/60">YOLO Small Deep Pyramid</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-slate-700 font-sans font-medium">Model Parameters</td>
                  <td className="py-2.5 px-4">~3.2 Million</td>
                  <td className="py-2.5 px-4">~3.1 Million</td>
                  <td className="py-2.5 px-4 text-emerald-700 font-bold bg-emerald-50/60">~11.2 Million</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-slate-700 font-sans font-medium">Weights File Size</td>
                  <td className="py-2.5 px-4">6.25 MB</td>
                  <td className="py-2.5 px-4">5.45 MB</td>
                  <td className="py-2.5 px-4 text-slate-700 bg-emerald-50/60">20.31 MB</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-slate-700 font-sans font-medium">Best mAP50</td>
                  <td className="py-2.5 px-4 font-semibold text-sky-700">91.38% (Ep 38)</td>
                  <td className="py-2.5 px-4">90.46% (Ep 33)</td>
                  <td className="py-2.5 px-4 text-emerald-700 font-semibold bg-emerald-50/60">90.44% (Ep 47)</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-slate-700 font-sans font-medium">Best mAP50-95 (Strict IoU)</td>
                  <td className="py-2.5 px-4">53.12%</td>
                  <td className="py-2.5 px-4">53.63%</td>
                  <td className="py-2.5 px-4 text-emerald-800 font-bold text-sm bg-emerald-50/60">55.85% (Ep 31) ⭐</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-slate-700 font-sans font-medium">Final Validation Precision</td>
                  <td className="py-2.5 px-4">86.86%</td>
                  <td className="py-2.5 px-4 font-bold text-sky-700">92.13%</td>
                  <td className="py-2.5 px-4 text-emerald-800 font-bold bg-emerald-50/60">91.50%</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-slate-700 font-sans font-medium">Final Validation Recall</td>
                  <td className="py-2.5 px-4">85.15%</td>
                  <td className="py-2.5 px-4 text-red-600">80.63% (Drop)</td>
                  <td className="py-2.5 px-4 text-emerald-800 font-semibold bg-emerald-50/60">84.82%</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-slate-700 font-sans font-medium">Validation Class Loss</td>
                  <td className="py-2.5 px-4">0.6225</td>
                  <td className="py-2.5 px-4">0.6797</td>
                  <td className="py-2.5 px-4 text-emerald-800 font-bold bg-emerald-50/60">0.5384 (Lowest)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Experiment Visual Curves */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-600" />
              Experiment Training Artifacts & Curves
            </h3>

            {/* Tab switch */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs font-semibold shadow-sm">
              <button
                onClick={() => setActiveTab("v3")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === "v3"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                V3 Champion Curves
              </button>
              <button
                onClick={() => setActiveTab("v2")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === "v2"
                    ? "bg-sky-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                V2 Curves
              </button>
              <button
                onClick={() => setActiveTab("v1")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === "v1"
                    ? "bg-sky-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                V1 Baseline Curves
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>Loss & Metric Convergence (50 Epochs)</span>
                <span className="font-mono text-sky-600 text-[11px]">results.png</span>
              </h4>
              <div className="rounded-xl overflow-hidden bg-slate-100 border border-slate-200 p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/assets/${activeTab}_results.png`}
                  alt={`${activeTab} training results`}
                  className="w-full h-auto object-contain rounded-lg"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>Confusion Matrix (Mask vs No-Mask)</span>
                <span className="font-mono text-sky-600 text-[11px]">confusion_matrix.png</span>
              </h4>
              <div className="rounded-xl overflow-hidden bg-slate-100 border border-slate-200 p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/assets/${activeTab}_confusion_matrix.png`}
                  alt={`${activeTab} confusion matrix`}
                  className="w-full h-auto object-contain rounded-lg"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>Precision-Recall Curve</span>
                <span className="font-mono text-sky-600 text-[11px]">BoxPR_curve.png</span>
              </h4>
              <div className="rounded-xl overflow-hidden bg-slate-100 border border-slate-200 p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/assets/${activeTab}_pr_curve.png`}
                  alt={`${activeTab} PR curve`}
                  className="w-full h-auto object-contain rounded-lg"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>Validation Batch Predictions</span>
                <span className="font-mono text-emerald-700 text-[11px]">val_batch0_pred.jpg</span>
              </h4>
              <div className="rounded-xl overflow-hidden bg-slate-100 border border-slate-200 p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/v3_val_batch0_pred.jpg"
                  alt="Validation batch predictions"
                  className="w-full h-auto object-contain rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Beginner-Friendly Metrics Guide */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-3">
            <HelpCircle className="w-4 h-4 text-sky-600" />
            Plain-English Guide to Object Detection Metrics
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <h5 className="font-bold text-sky-700">What is mAP50?</h5>
              <p className="text-slate-600 leading-relaxed">
                <strong>Mean Average Precision at 0.50 IoU.</strong> A predicted box counts as correct if it overlaps at least 50% with the human face. Our champion scored <strong>90.44%</strong>.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <h5 className="font-bold text-emerald-700">What is mAP50-95? (The Gold Standard)</h5>
              <p className="text-slate-600 leading-relaxed">
                Evaluates accuracy across 10 progressive overlap thresholds (from 50% to 95%). It reveals whether the box tightly hugs the face or is just a rough guess. <strong>YOLOv26s won here by 2.2%</strong>.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <h5 className="font-bold text-slate-800">Precision vs Recall in Safety</h5>
              <p className="text-slate-600 leading-relaxed">
                <strong>Precision</strong> prevents false alarms (when it says "No Mask", you can trust it). <strong>Recall</strong> ensures nobody slips past unmasked without being noticed.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <h5 className="font-bold text-slate-800">What is DFL Loss (Distribution Focal Loss)?</h5>
              <p className="text-slate-600 leading-relaxed">
                Rather than treating coordinates as rigid integers, DFL models box edges as continuous probabilities, yielding sub-pixel accuracy on turned or angled faces.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 px-6 mt-12 text-center text-xs text-slate-500">
        <p>
          FaceMask AI • Deep Learning Portfolio Project 06 • Research & Comparative Benchmark Report
        </p>
      </footer>
    </div>
  );
}
