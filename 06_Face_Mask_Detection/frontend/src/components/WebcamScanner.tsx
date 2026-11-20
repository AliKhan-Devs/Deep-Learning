"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Camera, VideoOff, Play, Square, Sparkles, AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";
import { detectWebcamFrame } from "../lib/api";
import { ImageDetectionResult } from "../lib/types";

interface WebcamScannerProps {
  modelId: string;
  confThreshold: number;
}

export const WebcamScanner: React.FC<WebcamScannerProps> = ({
  modelId,
  confThreshold,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [streamActive, setStreamActive] = useState(false);
  const [continuousScanning, setContinuousScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fps, setFps] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Store live detection result to display right inside the video
  const [currentResult, setCurrentResult] = useState<ImageDetectionResult | null>(null);

  // Start webcam
  const startCamera = async () => {
    setErrorMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setStreamActive(true);
      }
    } catch (err: any) {
      setErrorMsg(
        err.name === "NotAllowedError"
          ? "Camera permission denied. Please allow camera access in your browser."
          : `Failed to open camera: ${err.message}`
      );
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
    setContinuousScanning(false);
    setCurrentResult(null);
    setFps(0);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Capture current video frame to base64
  const captureFrame = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.85);
  }, []);

  // Single Snapshot Detection
  const handleSnapPhoto = async () => {
    const frameB64 = captureFrame();
    if (!frameB64) return;
    try {
      setIsProcessing(true);
      const res = await detectWebcamFrame(frameB64, confThreshold, modelId);
      setCurrentResult(res);
    } catch (err: any) {
      setErrorMsg(err.message || "Inference failed");
    } finally {
      setIsProcessing(false);
    }
  };

  // Continuous real-time detection loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();
    let frameCount = 0;
    let isActive = continuousScanning;

    const loop = async () => {
      if (!isActive || isProcessing) {
        if (isActive) {
          animationFrameId = requestAnimationFrame(loop);
        }
        return;
      }

      const frameB64 = captureFrame();
      if (frameB64) {
        setIsProcessing(true);
        try {
          const res = await detectWebcamFrame(frameB64, confThreshold, modelId);
          setCurrentResult(res);
          frameCount++;
          const now = performance.now();
          if (now - lastTime >= 1000) {
            setFps(Math.round((frameCount * 1000) / (now - lastTime)));
            frameCount = 0;
            lastTime = now;
          }
        } catch (e) {
          // ignore transient frame failure
        } finally {
          setIsProcessing(false);
        }
      }

      if (isActive) {
        setTimeout(() => {
          if (isActive) {
            animationFrameId = requestAnimationFrame(loop);
          }
        }, 75);
      }
    };

    if (continuousScanning) {
      animationFrameId = requestAnimationFrame(loop);
    }

    return () => {
      isActive = false;
      cancelAnimationFrame(animationFrameId);
    };
  }, [continuousScanning, captureFrame, confThreshold, modelId, isProcessing]);

  const hasViolation = currentResult && currentResult.no_mask_count > 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
      {/* Viewport: Detection is shown DIRECTLY IN THE VIDEO */}
      <div className={`relative rounded-xl overflow-hidden bg-slate-900 border-2 transition-all flex items-center justify-center min-h-[440px] max-h-[580px] ${
        hasViolation ? "border-red-500 shadow-md shadow-red-100" : "border-slate-200"
      }`}>
        {/* Hidden Canvas */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Raw Video Feed (shown when camera is on but not displaying annotated frame) */}
        <video
          ref={videoRef}
          playsInline
          muted
          className={`w-full h-full max-h-[560px] object-contain ${
            streamActive && !currentResult?.annotated_image ? "block" : "hidden"
          }`}
        />

        {/* Live Annotated Feed with In-Video Bounding Boxes */}
        {streamActive && currentResult?.annotated_image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={currentResult.annotated_image}
            alt="Live In-Video Detection Feed"
            className="w-full h-full max-h-[560px] object-contain"
          />
        )}

        {/* Camera Off Placeholder */}
        {!streamActive && (
          <div className="text-center p-8 flex flex-col items-center max-w-sm">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 text-slate-300 flex items-center justify-center mb-4">
              <Camera className="w-8 h-8" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1.5">
              Live Webcam Inactive
            </h3>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              Start your webcam to see real-time bounding boxes drawn directly on your face inside the video feed.
            </p>
            <button
              onClick={startCamera}
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-all"
            >
              <Camera className="w-4 h-4" /> Start Camera
            </button>
          </div>
        )}

        {/* HUD In-Video Overlay Badges */}
        {streamActive && (
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-red-600 text-white shadow-sm flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                LIVE
              </span>
              {continuousScanning && (
                <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-black/80 text-emerald-400 border border-emerald-500/40">
                  {fps} FPS
                </span>
              )}
            </div>

            {/* In-Video Compliance Counter */}
            {currentResult && (
              <div className="flex items-center gap-2 bg-black/85 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10 text-xs shadow-md">
                <span className="text-white font-medium">
                  {currentResult.total_faces} Face{currentResult.total_faces !== 1 ? "s" : ""}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {currentResult.mask_count} Masked
                </span>
                <span className="text-slate-400">•</span>
                <span className={`font-semibold flex items-center gap-1 ${
                  currentResult.no_mask_count > 0 ? "text-red-400 font-bold" : "text-slate-400"
                }`}>
                  <AlertTriangle className="w-3.5 h-3.5" /> {currentResult.no_mask_count} No Mask
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Camera Controls & Status Bar */}
      {streamActive && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setContinuousScanning(!continuousScanning)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all ${
                continuousScanning
                  ? "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                  : "bg-sky-600 text-white hover:bg-sky-500"
              }`}
            >
              {continuousScanning ? (
                <>
                  <Square className="w-3.5 h-3.5" /> Pause Live Scan
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" /> Run Real-time In-Video Scan
                </>
              )}
            </button>

            <button
              onClick={handleSnapPhoto}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              Capture Snapshot
            </button>
          </div>

          <div className="flex items-center gap-3">
            {currentResult && (
              <span className="text-xs text-slate-500 font-mono">
                Latency: <strong className="text-slate-800">{currentResult.inference_time_ms}ms</strong>
              </span>
            )}
            <button
              onClick={stopCamera}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition-all flex items-center gap-1.5"
            >
              <VideoOff className="w-3.5 h-3.5" /> Turn Off Camera
            </button>
          </div>
        </div>
      )}

      {/* Error alert */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};
