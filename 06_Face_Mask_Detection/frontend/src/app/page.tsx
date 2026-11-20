"use client";

import React, { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { ModelSelector } from "../components/ModelSelector";
import { StatsCards } from "../components/StatsCards";
import { DetectionViewer } from "../components/DetectionViewer";
import { UploadImageTab } from "../components/UploadImageTab";
import { WebcamScanner } from "../components/WebcamScanner";
import { UploadVideoTab } from "../components/UploadVideoTab";
import {
  fetchSystemStatus,
  fetchModels,
  fetchSamples,
  detectImageUpload,
} from "../lib/api";
import {
  SystemStatus,
  ModelInfo,
  SampleImage,
  ImageDetectionResult,
} from "../lib/types";
import { Camera, Image as ImageIcon, Film, Sparkles, CheckCircle2 } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"webcam" | "image" | "video">("webcam");
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("v3");
  const [confThreshold, setConfThreshold] = useState<number>(0.45);
  const [iouThreshold, setIouThreshold] = useState<number>(0.50);
  const [samples, setSamples] = useState<SampleImage[]>([]);
  const [detectionResult, setDetectionResult] = useState<ImageDetectionResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load telemetry & models on mount
  useEffect(() => {
    fetchSystemStatus()
      .then(setSystemStatus)
      .catch((err) => console.warn("Backend telemetry offline:", err.message));

    fetchModels()
      .then((data) => {
        setModels(data.models);
        if (data.recommended_model) {
          setSelectedModel(data.recommended_model);
        }
      })
      .catch((err) => console.warn("Models list offline:", err.message));

    fetchSamples()
      .then((data) => setSamples(data.samples))
      .catch((err) => console.warn("Samples offline:", err.message));
  }, []);

  // Handle uploaded image file
  const handleSelectFile = async (file: File) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await detectImageUpload(
        file,
        undefined,
        confThreshold,
        iouThreshold,
        selectedModel
      );
      setDetectionResult(res);
    } catch (err: any) {
      setErrorMessage(err.message || "Detection failed");
    } finally {
      setLoading(false);
    }
  };

  // Handle 1-click sample image
  const handleSelectSample = async (sample: SampleImage) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      // Fetch sample image from backend as blob
      const sampleResp = await fetch(`http://127.0.0.1:8003${sample.url}`);
      const blob = await sampleResp.blob();
      const file = new File([blob], sample.filename, { type: "image/jpeg" });
      const res = await detectImageUpload(
        file,
        undefined,
        confThreshold,
        iouThreshold,
        selectedModel
      );
      setDetectionResult(res);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to analyze sample image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header status={systemStatus} activeModelId={selectedModel} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Top Stats Banner */}
        <StatsCards
          totalFaces={detectionResult?.total_faces || 0}
          maskCount={detectionResult?.mask_count || 0}
          noMaskCount={detectionResult?.no_mask_count || 0}
          complianceRate={detectionResult?.compliance_rate || 100}
          inferenceTimeMs={detectionResult?.inference_time_ms || 0}
        />

        {/* Model Engine & Threshold Settings */}
        <ModelSelector
          models={models}
          selectedModel={selectedModel}
          onSelectModel={setSelectedModel}
          confThreshold={confThreshold}
          onChangeConf={setConfThreshold}
          iouThreshold={iouThreshold}
          onChangeIou={setIouThreshold}
        />

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
            <span>{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-white font-bold ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {/* Two-Column Workstation Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Interactive Input Modes (Tabs) */}
          <div className="lg:col-span-6 space-y-4">
            {/* Tab Navigation */}
            <div className="flex items-center gap-1.5 p-1 bg-surface rounded-xl border border-surface-light text-xs font-semibold">
              <button
                onClick={() => setActiveTab("webcam")}
                className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
                  activeTab === "webcam"
                    ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/20"
                    : "text-slate-400 hover:text-white hover:bg-surface-light"
                }`}
              >
                <Camera className="w-3.5 h-3.5" /> Live Webcam
              </button>
              <button
                onClick={() => setActiveTab("image")}
                className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
                  activeTab === "image"
                    ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/20"
                    : "text-slate-400 hover:text-white hover:bg-surface-light"
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" /> Upload Image
              </button>
              <button
                onClick={() => setActiveTab("video")}
                className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
                  activeTab === "video"
                    ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/20"
                    : "text-slate-400 hover:text-white hover:bg-surface-light"
                }`}
              >
                <Film className="w-3.5 h-3.5" /> Upload Video
              </button>
            </div>

            {/* Tab Panels */}
            {activeTab === "webcam" && (
              <WebcamScanner
                modelId={selectedModel}
                confThreshold={confThreshold}
                onResult={setDetectionResult}
              />
            )}

            {activeTab === "image" && (
              <UploadImageTab
                onSelectFile={handleSelectFile}
                onSelectSample={handleSelectSample}
                samples={samples}
                loading={loading}
              />
            )}

            {activeTab === "video" && (
              <UploadVideoTab
                modelId={selectedModel}
                confThreshold={confThreshold}
              />
            )}
          </div>

          {/* Right Column: Visual Detection Output & Inspector */}
          <div className="lg:col-span-6">
            <DetectionViewer result={detectionResult} loading={loading} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-light bg-surface/60 py-4 px-6 mt-12 text-center text-xs text-slate-500">
        <p>
          FaceMask AI • Deep Learning Portfolio Project 06 • Powered by Ultralytics YOLOv26s & FastAPI
        </p>
      </footer>
    </div>
  );
}
