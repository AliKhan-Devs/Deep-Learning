"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Header } from "../../components/Header";
import {
  fetchSystemStatus,
  fetchSamples,
  compareAllModels,
  compareWebcamFrame,
} from "../../lib/api";
import {
  SystemStatus,
  SampleImage,
  MultiModelComparisonItem,
} from "../../lib/types";
import {
  Camera,
  Play,
  Square,
  UploadCloud,
  Sparkles,
  Zap,
  Award,
  Clock,
  Gauge,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Loader2,
  LayoutGrid,
} from "lucide-react";

export default function MultiModelArenaPage() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [samples, setSamples] = useState<SampleImage[]>([]);
  const [activeInputMode, setActiveInputMode] = useState<"webcam" | "upload">("upload");
  const [confThreshold, setConfThreshold] = useState<number>(0.45);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Results for the 3 models: [v1, v2, v3]
  const [comparisonResults, setComparisonResults] = useState<MultiModelComparisonItem[] | null>(null);

  // Webcam state
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [streamActive, setStreamActive] = useState<boolean>(false);
  const [continuousLoop, setContinuousLoop] = useState<boolean>(false);
  const [isProcessingFrame, setIsProcessingFrame] = useState<boolean>(false);

  useEffect(() => {
    fetchSystemStatus().then(setSystemStatus).catch(console.warn);
    fetchSamples().then((d) => {
      setSamples(d.samples);
      // Auto-load first sample on entry so users immediately see 3 models side-by-side!
      if (d.samples.length > 0) {
        handleSelectSample(d.samples[0]);
      }
    }).catch(console.warn);
  }, []);

  // Run 3-model comparison on file
  const handleSelectFile = async (file: File) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await compareAllModels(file, undefined, confThreshold);
      setComparisonResults(data.results);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to run multi-model comparison");
    } finally {
      setLoading(false);
    }
  };

  // Run 3-model comparison on sample
  const handleSelectSample = async (sample: SampleImage) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const resp = await fetch(`http://127.0.0.1:8003${sample.url}`);
      const blob = await resp.blob();
      const file = new File([blob], sample.filename, { type: "image/jpeg" });
      const data = await compareAllModels(file, undefined, confThreshold);
      setComparisonResults(data.results);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to analyze sample image");
    } finally {
      setLoading(false);
    }
  };

  // Start webcam
  const startCamera = async () => {
    setErrorMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 960 }, height: { ideal: 540 }, facingMode: "user" },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setStreamActive(true);
      }
    } catch (err: any) {
      setErrorMsg(`Could not access webcam: ${err.message}`);
    }
  };

  // Stop webcam
  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setStreamActive(false);
    setContinuousLoop(false);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Capture frame
  const captureFrame = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;
    const v = videoRef.current;
    const c = canvasRef.current;
    if (v.videoWidth === 0 || v.videoHeight === 0) return null;
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    const ctx = c.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(v, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", 0.8);
  }, []);

  // Single Frame Snapshot
  const handleSnapFrame = async () => {
    const frameB64 = captureFrame();
    if (!frameB64) return;
    setLoading(true);
    try {
      const data = await compareWebcamFrame(frameB64, confThreshold);
      setComparisonResults(data.results);
    } catch (err: any) {
      setErrorMsg(err.message || "Webcam comparison failed");
    } finally {
      setLoading(false);
    }
  };

  // Continuous loop running all 3 models simultaneously
  useEffect(() => {
    let animId: number;
    let isActive = continuousLoop;

    const runLoop = async () => {
      if (!isActive || isProcessingFrame) {
        if (isActive) animId = requestAnimationFrame(runLoop);
        return;
      }

      const frameB64 = captureFrame();
      if (frameB64) {
        setIsProcessingFrame(true);
        try {
          const data = await compareWebcamFrame(frameB64, confThreshold);
          setComparisonResults(data.results);
        } catch (e) {
          // ignore transient frame lag
        } finally {
          setIsProcessingFrame(false);
        }
      }

      if (isActive) {
        setTimeout(() => {
          if (isActive) animId = requestAnimationFrame(runLoop);
        }, 110);
      }
    };

    if (continuousLoop) {
      animId = requestAnimationFrame(runLoop);
    }

    return () => {
      isActive = false;
      cancelAnimationFrame(animId);
    };
  }, [continuousLoop, captureFrame, confThreshold, isProcessingFrame]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header status={systemStatus} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Page Title & Back Bar */}
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
                <LayoutGrid className="w-5 h-5 text-emerald-600" />
                3-Model Live Arena: Simultaneous Inference & FPS Comparison
              </h2>
              <p className="text-xs text-slate-500">
                Process the exact same visual frame across YOLOv8n, YOLOv26n, and YOLOv26s simultaneously
              </p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => {
                setActiveInputMode("upload");
                stopCamera();
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeInputMode === "upload"
                  ? "bg-white text-slate-900 shadow-sm font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Upload / Samples
            </button>
            <button
              onClick={() => setActiveInputMode("webcam")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeInputMode === "webcam"
                  ? "bg-white text-slate-900 shadow-sm font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Live Webcam Feed
            </button>
          </div>
        </div>

        {/* Input Bar: Upload or Webcam Stream */}
        {activeInputMode === "upload" ? (
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-all"
                >
                  <UploadCloud className="w-4 h-4" /> Upload Custom Photo
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleSelectFile(e.target.files[0]);
                    }
                  }}
                  accept="image/*"
                  className="hidden"
                />
                <span className="text-xs text-slate-400">or click a sample below:</span>
              </div>

              {/* Confidence Filter */}
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span>Confidence:</span>
                <input
                  type="range"
                  min="0.15"
                  max="0.85"
                  step="0.05"
                  value={confThreshold}
                  onChange={(e) => setConfThreshold(parseFloat(e.target.value))}
                  className="w-24 accent-sky-600"
                />
                <span className="font-mono font-bold text-slate-800">
                  {(confThreshold * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            {/* Samples Row */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {samples.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSelectSample(s)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-slate-700 whitespace-nowrap transition-all shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                  <span>{s.title}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <canvas ref={canvasRef} className="hidden" />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {!streamActive ? (
                  <button
                    onClick={startCamera}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center gap-2 shadow-sm"
                  >
                    <Camera className="w-4 h-4" /> Turn On Camera
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setContinuousLoop(!continuousLoop)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all ${
                        continuousLoop
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-emerald-600 text-white hover:bg-emerald-500"
                      }`}
                    >
                      {continuousLoop ? (
                        <>
                          <Square className="w-3.5 h-3.5" /> Pause 3-Model Live Stream
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" /> Run 3-Model Real-Time Stream
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleSnapFrame}
                      disabled={loading || isProcessingFrame}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                    >
                      Snapshot All 3
                    </button>
                  </>
                )}
              </div>

              {streamActive && (
                <button
                  onClick={stopCamera}
                  className="text-xs text-slate-500 hover:text-red-600 font-medium"
                >
                  Stop Camera
                </button>
              )}
            </div>

            {/* Hidden Video element for streaming */}
            <video
              ref={videoRef}
              playsInline
              muted
              className="hidden"
            />
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
            <Loader2 className="w-8 h-8 text-sky-600 animate-spin mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">
              Executing Multi-Model Parallel Inference across V1, V2, and V3...
            </p>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 3-COLUMN SIDE-BY-SIDE MODEL ARENA */}
        {comparisonResults && comparisonResults.length === 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {comparisonResults.map((item, idx) => {
              const isChampion = item.model_used === "v3";
              return (
                <div
                  key={item.model_used}
                  className={`bg-white rounded-2xl border transition-all overflow-hidden shadow-sm flex flex-col ${
                    isChampion
                      ? "border-emerald-400 ring-2 ring-emerald-100"
                      : "border-slate-200"
                  }`}
                >
                  {/* Card Header */}
                  <div className={`p-4 border-b flex items-center justify-between ${
                    isChampion ? "bg-emerald-50/60 border-emerald-200" : "bg-slate-50 border-slate-100"
                  }`}>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-slate-900">
                          {item.model_name.split(" ")[0]}
                        </span>
                        {isChampion ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white flex items-center gap-0.5 shadow-sm">
                            <Award className="w-2.5 h-2.5" /> CHAMPION
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                            Exp {idx + 1}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {item.model_used === "v3"
                          ? "YOLO Small Deep Pyramid"
                          : item.model_used === "v2"
                          ? "YOLO Nano Custom"
                          : "YOLOv8 Nano Baseline"}
                      </div>
                    </div>

                    {/* LIVE FPS BADGE */}
                    <div className="text-right">
                      <div className="text-[10px] text-slate-500 uppercase font-bold">Live Speed</div>
                      <div className={`text-base font-extrabold font-mono flex items-center justify-end gap-1 ${
                        item.fps >= 40 ? "text-emerald-600" : item.fps >= 25 ? "text-sky-600" : "text-amber-600"
                      }`}>
                        <Zap className="w-3.5 h-3.5" /> {item.fps} FPS
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {item.inference_time_ms}ms
                      </div>
                    </div>
                  </div>

                  {/* Model Detection Image */}
                  <div className="p-3 bg-slate-900 flex items-center justify-center min-h-[260px] max-h-[340px] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.annotated_image}
                      alt={`${item.model_name} Output`}
                      className="w-full h-auto max-h-[320px] object-contain rounded-lg"
                    />
                  </div>

                  {/* Card Bottom Stats */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="text-[10px] text-slate-400 font-semibold uppercase">Faces</div>
                        <div className="text-base font-bold font-mono text-slate-800">
                          {item.total_faces}
                        </div>
                      </div>

                      <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-100">
                        <div className="text-[10px] text-emerald-700 font-semibold uppercase">Masks</div>
                        <div className="text-base font-bold font-mono text-emerald-700">
                          {item.mask_count}
                        </div>
                      </div>

                      <div className="p-2 bg-red-50 rounded-xl border border-red-100">
                        <div className="text-[10px] text-red-700 font-semibold uppercase">No Mask</div>
                        <div className={`text-base font-bold font-mono ${
                          item.no_mask_count > 0 ? "text-red-700 font-extrabold" : "text-slate-400"
                        }`}>
                          {item.no_mask_count}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
                      <span>Compliance Score:</span>
                      <strong className={`font-mono ${
                        item.compliance_rate >= 90 ? "text-emerald-600" : "text-red-600"
                      }`}>
                        {item.compliance_rate}%
                      </strong>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>mAP50-95 Metric:</span>
                      <strong className="font-mono text-slate-800">
                        {item.model_used === "v3" ? "55.85%" : item.model_used === "v2" ? "53.63%" : "53.12%"}
                      </strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Comparison Summary Table */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Architecture, Weights & Latency Tradeoff Summary
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase text-[10px]">
                  <th className="py-2.5 px-3">Model</th>
                  <th className="py-2.5 px-3">Parameters</th>
                  <th className="py-2.5 px-3">File Size</th>
                  <th className="py-2.5 px-3">mAP50-95</th>
                  <th className="py-2.5 px-3">Typical FPS</th>
                  <th className="py-2.5 px-3">Best Use Case</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                <tr>
                  <td className="py-2 px-3 font-sans font-bold text-slate-800">V1: YOLOv8n</td>
                  <td className="py-2 px-3">3.2M</td>
                  <td className="py-2 px-3">6.25 MB</td>
                  <td className="py-2 px-3 text-slate-600">53.12%</td>
                  <td className="py-2 px-3 text-emerald-600 font-bold">~60-80 FPS</td>
                  <td className="py-2 px-3 font-sans text-slate-500">Fast IoT Raspberry Pi</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-sans font-bold text-slate-800">V2: YOLOv26n</td>
                  <td className="py-2 px-3">3.1M</td>
                  <td className="py-2 px-3">5.45 MB</td>
                  <td className="py-2 px-3 text-slate-600">53.63%</td>
                  <td className="py-2 px-3 text-emerald-600 font-bold">~65-85 FPS</td>
                  <td className="py-2 px-3 font-sans text-slate-500">Low false alarm edge apps</td>
                </tr>
                <tr className="bg-emerald-50/50">
                  <td className="py-2 px-3 font-sans font-bold text-emerald-800">V3: YOLOv26s 🏆</td>
                  <td className="py-2 px-3 text-emerald-800 font-bold">11.2M</td>
                  <td className="py-2 px-3">20.31 MB</td>
                  <td className="py-2 px-3 text-emerald-700 font-bold">55.85% ⭐</td>
                  <td className="py-2 px-3 text-sky-700 font-bold">~35-50 FPS</td>
                  <td className="py-2 px-3 font-sans font-medium text-emerald-900">Workstations & Public Safety</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 px-6 mt-12 text-center text-xs text-slate-500">
        <p>
          FaceMask AI • 3-Model Live Arena • Simultaneous Multi-Model Inference with Real-Time FPS Tracking
        </p>
      </footer>
    </div>
  );
}
