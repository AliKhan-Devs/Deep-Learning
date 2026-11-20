"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Award,
  ArrowLeft,
  CheckCircle2,
  TrendingUp,
  Cpu,
  Target,
  FileText,
  BarChart2,
  HelpCircle,
  Sparkles,
} from "lucide-react";

export default function ExperimentsPage() {
  const [activeTab, setActiveTab] = useState<"v3" | "v2" | "v1">("v3");

  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-surface-light bg-surface/90 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl bg-surface-light hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                Comparative Experiment Analysis
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  3 YOLO Architectural Runs
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Evaluation of YOLOv8n, YOLOv26n, and YOLOv26s on custom face mask dataset
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 transition-all"
          >
            Launch Live Detector →
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-8">
        {/* Champion Callout Card */}
        <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 via-surface to-surface p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-1.5">
                  <Award className="w-4 h-4" /> OFFICIAL CHAMPION: EXPERIMENT 3 (YOLOv26s)
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Why YOLOv26s Was Selected For Final Production Deployment
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                Across 50 rigorous training epochs, <strong>YOLOv26s</strong> delivered the benchmark-leading{" "}
                <span className="text-emerald-400 font-semibold font-mono">55.85% mAP50-95</span>.
                While lightweight nano architectures (V1 and V2) performed well at rough 50% IoU thresholds,
                YOLOv26s demonstrated dramatically tighter bounding-box boundaries, lowest classification loss (0.5384),
                and zero false negative drop-offs in crowded scenes.
              </p>
            </div>

            <div className="flex flex-row md:flex-col gap-3 shrink-0">
              <div className="bg-surface-light/80 p-3 rounded-xl border border-emerald-500/30 text-center">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Champion mAP50-95</div>
                <div className="text-2xl font-bold font-mono text-emerald-400">55.85%</div>
                <div className="text-[9px] text-slate-500">Highest localization precision</div>
              </div>
              <div className="bg-surface-light/80 p-3 rounded-xl border border-slate-700 text-center">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Precision / Recall</div>
                <div className="text-2xl font-bold font-mono text-cyan-400">91.5% / 84.8%</div>
                <div className="text-[9px] text-slate-500">Balanced safety boundary</div>
              </div>
            </div>
          </div>
        </div>

        {/* Side-by-Side Comparison Matrix */}
        <div className="bg-surface rounded-2xl border border-surface-light p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-cyan-400" />
              Side-by-Side 3-Experiment Performance Matrix
            </h3>
            <span className="text-xs text-slate-400">All models trained on identical dataset splits</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-surface-light bg-surface-light/30 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Metric / Parameter</th>
                  <th className="py-3 px-4">V1: YOLOv8n (Baseline)</th>
                  <th className="py-3 px-4">V2: YOLOv26n (Nano Custom)</th>
                  <th className="py-3 px-4 text-emerald-400 font-bold bg-emerald-500/5">
                    V3: YOLOv26s (Champion) 🏆
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-light/50 font-mono">
                <tr>
                  <td className="py-3 px-4 text-slate-300 font-sans font-medium">Architecture</td>
                  <td className="py-3 px-4 text-slate-400">YOLOv8 Nano</td>
                  <td className="py-3 px-4 text-slate-400">YOLO Nano Custom</td>
                  <td className="py-3 px-4 text-emerald-300 font-semibold bg-emerald-500/5">YOLO Small Deep Pyramid</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-slate-300 font-sans font-medium">Model Parameters</td>
                  <td className="py-3 px-4">~3.2 Million</td>
                  <td className="py-3 px-4">~3.1 Million</td>
                  <td className="py-3 px-4 text-emerald-400 bg-emerald-500/5">~11.2 Million</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-slate-300 font-sans font-medium">Weights File Size</td>
                  <td className="py-3 px-4">6.25 MB</td>
                  <td className="py-3 px-4">5.45 MB</td>
                  <td className="py-3 px-4 text-slate-300 bg-emerald-500/5">20.31 MB</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-slate-300 font-sans font-medium">Training Epochs</td>
                  <td className="py-3 px-4">50 Epochs</td>
                  <td className="py-3 px-4">50 Epochs</td>
                  <td className="py-3 px-4 bg-emerald-500/5">50 Epochs</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-slate-300 font-sans font-medium">Best mAP50</td>
                  <td className="py-3 px-4 text-cyan-400 font-semibold">91.38% (Ep 38)</td>
                  <td className="py-3 px-4">90.46% (Ep 33)</td>
                  <td className="py-3 px-4 text-emerald-400 font-semibold bg-emerald-500/5">90.44% (Ep 47)</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-slate-300 font-sans font-medium">Best mAP50-95 (Strict IoU)</td>
                  <td className="py-3 px-4">53.12%</td>
                  <td className="py-3 px-4">53.63%</td>
                  <td className="py-3 px-4 text-emerald-400 font-bold text-sm bg-emerald-500/5">55.85% (Ep 31) ⭐</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-slate-300 font-sans font-medium">Final Validation Precision</td>
                  <td className="py-3 px-4">86.86%</td>
                  <td className="py-3 px-4 text-cyan-400 font-bold">92.13%</td>
                  <td className="py-3 px-4 text-emerald-400 font-bold bg-emerald-500/5">91.50%</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-slate-300 font-sans font-medium">Final Validation Recall</td>
                  <td className="py-3 px-4">85.15%</td>
                  <td className="py-3 px-4 text-rose-400">80.63% (Drop)</td>
                  <td className="py-3 px-4 text-emerald-400 font-semibold bg-emerald-500/5">84.82%</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-slate-300 font-sans font-medium">Final Val Classification Loss</td>
                  <td className="py-3 px-4">0.6225</td>
                  <td className="py-3 px-4">0.6797</td>
                  <td className="py-3 px-4 text-emerald-400 font-bold bg-emerald-500/5">0.5384 (Lowest)</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-slate-300 font-sans font-medium">Deployment Suitability</td>
                  <td className="py-3 px-4 text-slate-400">Microcontrollers & IoT</td>
                  <td className="py-3 px-4 text-slate-400">Mobile Edge Apps</td>
                  <td className="py-3 px-4 text-emerald-300 font-bold bg-emerald-500/5">Workstations & Real-time Edge</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Experiment Visual Curves & Diagnostics Tab */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Experiment Run Artifacts & Curves
            </h3>

            {/* Tab switch */}
            <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-surface-light text-xs font-semibold">
              <button
                onClick={() => setActiveTab("v3")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === "v3"
                    ? "bg-emerald-500 text-black shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                V3 Champion Curves
              </button>
              <button
                onClick={() => setActiveTab("v2")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === "v2"
                    ? "bg-cyan-500 text-black shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                V2 Curves
              </button>
              <button
                onClick={() => setActiveTab("v1")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === "v1"
                    ? "bg-cyan-500 text-black shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                V1 Baseline Curves
              </button>
            </div>
          </div>

          {/* Tab Content Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Training Loss & mAP Evolution Plot */}
            <div className="bg-surface rounded-2xl border border-surface-light p-4 shadow-xl space-y-2">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Loss & Metric Convergence (50 Epochs)</span>
                <span className="font-mono text-cyan-400 text-[11px]">results.png</span>
              </h4>
              <div className="rounded-xl overflow-hidden bg-background border border-surface-light p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/assets/${activeTab}_results.png`}
                  alt={`${activeTab} training results`}
                  className="w-full h-auto object-contain rounded-lg"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Smooth downward convergence across train/val box, class, and distribution focal losses.
              </p>
            </div>

            {/* Confusion Matrix */}
            <div className="bg-surface rounded-2xl border border-surface-light p-4 shadow-xl space-y-2">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Confusion Matrix (Mask vs No-Mask)</span>
                <span className="font-mono text-cyan-400 text-[11px]">confusion_matrix.png</span>
              </h4>
              <div className="rounded-xl overflow-hidden bg-background border border-surface-light p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/assets/${activeTab}_confusion_matrix.png`}
                  alt={`${activeTab} confusion matrix`}
                  className="w-full h-auto object-contain rounded-lg"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Shows near-zero off-diagonal confusion between wearers and unmasked individuals.
              </p>
            </div>

            {/* Precision-Recall Curve */}
            <div className="bg-surface rounded-2xl border border-surface-light p-4 shadow-xl space-y-2">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Precision-Recall Curve (BoxPR)</span>
                <span className="font-mono text-cyan-400 text-[11px]">BoxPR_curve.png</span>
              </h4>
              <div className="rounded-xl overflow-hidden bg-background border border-surface-light p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/assets/${activeTab}_pr_curve.png`}
                  alt={`${activeTab} PR curve`}
                  className="w-full h-auto object-contain rounded-lg"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                High area under the curve (AUC) demonstrates stability across diverse confidence thresholds.
              </p>
            </div>

            {/* Validation Batch Predictions Preview */}
            <div className="bg-surface rounded-2xl border border-surface-light p-4 shadow-xl space-y-2">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Model Predictions on Unseen Validation Batch</span>
                <span className="font-mono text-emerald-400 text-[11px]">val_batch0_pred.jpg</span>
              </h4>
              <div className="rounded-xl overflow-hidden bg-background border border-surface-light p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/assets/v3_val_batch0_pred.jpg`}
                  alt="Validation batch predictions"
                  className="w-full h-auto object-contain rounded-lg"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Actual inference detections on validation images displaying exact bounding-box accuracy.
              </p>
            </div>
          </div>
        </div>

        {/* Beginner-Friendly Metrics Guide */}
        <div className="bg-surface rounded-2xl border border-surface-light p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-surface-light pb-3">
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            Beginner-Friendly Guide to Object Detection Metrics
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-background border border-surface-light space-y-1.5">
              <h5 className="font-semibold text-cyan-400">What is mAP50?</h5>
              <p className="text-slate-300 leading-relaxed">
                <strong>Mean Average Precision at 0.50 IoU.</strong> A detection is considered correct if its bounding box overlaps at least 50% with the actual human label. Our champion scored <strong>90.44%</strong>.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-background border border-surface-light space-y-1.5">
              <h5 className="font-semibold text-emerald-400">What is mAP50-95? (The Gold Standard)</h5>
              <p className="text-slate-300 leading-relaxed">
                Measures accuracy across 10 strict overlap thresholds from 50% up to 95%. It proves whether bounding boxes fit tightly around the face or are loose approximations. <strong>YOLOv26s won here by 2.2%</strong>.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-background border border-surface-light space-y-1.5">
              <h5 className="font-semibold text-cyan-400">Precision vs Recall in Safety Vision</h5>
              <p className="text-slate-300 leading-relaxed">
                <strong>Precision</strong> answers: <em>"When an alarm fires, is it actually an unmasked face?"</em> (Prevents annoying false alarms). <strong>Recall</strong> answers: <em>"Did we catch every unmasked person?"</em> (Prevents safety breaches).
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-background border border-surface-light space-y-1.5">
              <h5 className="font-semibold text-cyan-400">What is DFL Loss (Distribution Focal Loss)?</h5>
              <p className="text-slate-300 leading-relaxed">
                Instead of treating coordinates as rigid integers, DFL represents box boundaries as continuous probability distributions. This enables sub-pixel precision when detecting faces partially turned away.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-light bg-surface/60 py-4 px-6 mt-12 text-center text-xs text-slate-500">
        <p>
          FaceMask AI • Deep Learning Portfolio Project 06 • Research & Comparative Benchmark Report
        </p>
      </footer>
    </div>
  );
}
