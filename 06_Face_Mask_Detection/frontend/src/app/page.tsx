"use client";

import React, { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { ModelSelector } from "../components/ModelSelector";
import { StatsCards } from "../components/StatsCards";
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
import { Camera, Image as ImageIcon, Film } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"webcam" | "image" | "video">("webcam");
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("v3");
  const [confThreshold, setConfThreshold] = useState<number>(0.45);
  const [iouThreshold, setIouThreshold] = useState<number>(0.50);
  const [samples, setSamples] = useState<SampleImage[]>([]);
  const [imageResult, setImageResult] = useState<ImageDetectionResult | null>(null);
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
      setImageResult(res);
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
      setImageResult(res);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to analyze sample image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header status={systemStatus} activeModelId={selectedModel} />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-5">
        {/* Top Stats Banner */}
        <StatsCards
          totalFaces={imageResult?.total_faces || 0}
          maskCount={imageResult?.mask_count || 0}
          noMaskCount={imageResult?.no_mask_count || 0}
          complianceRate={imageResult?.compliance_rate || 100}
          inferenceTimeMs={imageResult?.inference_time_ms || 0}
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
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center justify-between">
            <span>{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-600 hover:text-red-900 font-bold ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-slate-200 text-xs font-semibold shadow-sm">
          <button
            onClick={() => setActiveTab("webcam")}
            className={`flex-1 py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
              activeTab === "webcam"
                ? "bg-sky-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Camera className="w-4 h-4" /> Live Webcam (In-Video Detection)
          </button>
          <button
            onClick={() => setActiveTab("image")}
            className={`flex-1 py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
              activeTab === "image"
                ? "bg-sky-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <ImageIcon className="w-4 h-4" /> Upload Image / Samples
          </button>
          <button
            onClick={() => setActiveTab("video")}
            className={`flex-1 py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
              activeTab === "video"
                ? "bg-sky-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Film className="w-4 h-4" /> Upload Video (In-Video Detection)
          </button>
        </div>

        {/* Single Focused Workspace: No separate right panel for video */}
        <div>
          {activeTab === "webcam" && (
            <WebcamScanner
              modelId={selectedModel}
              confThreshold={confThreshold}
            />
          )}

          {activeTab === "image" && (
            <UploadImageTab
              onSelectFile={handleSelectFile}
              onSelectSample={handleSelectSample}
              samples={samples}
              result={imageResult}
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
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 px-6 mt-12 text-center text-xs text-slate-500">
        <p>
          FaceMask AI &bull; Deep Learning Portfolio Project 06 &bull; Multi-Model YOLO Architecture Suite (v8n, v26n, v26s) & FastAPI
        </p>
      </footer>
    </div>
  );
}
