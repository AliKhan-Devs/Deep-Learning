"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Camera, VideoOff, RefreshCw, Sparkles, AlertCircle, Play, Square } from "lucide-react";
import { detectWebcamFrame } from "../lib/api";
import { ImageDetectionResult } from "../lib/types";

interface WebcamScannerProps {
  modelId: string;
  confThreshold: number;
  onResult: (res: ImageDetectionResult) => void;
}

export const WebcamScanner: React.FC<WebcamScannerProps> = ({
  modelId,
  confThreshold,
  onResult,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [streamActive, setStreamActive] = useState(false);
  const [continuousScanning, setContinuousScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fps, setFps] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);

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
          ? "Camera access was denied. Please allow camera permissions in your browser."
          : `Could not initialize camera: ${err.message}`
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
    setFps(0);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Capture single frame
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

  // Single Snap & Analyze
  const handleSnapPhoto = async () => {
    const frameB64 = captureFrame();
    if (!frameB64) return;
    try {
      setIsProcessing(true);
      const res = await detectWebcamFrame(frameB64, confThreshold, modelId);
      onResult(res);
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
        const t0 = performance.now();
        try {
          const res = await detectWebcamFrame(frameB64, confThreshold, modelId);
          onResult(res);
          frameCount++;
          const now = performance.now();
          if (now - lastTime >= 1000) {
            setFps(Math.round((frameCount * 1000) / (now - lastTime)));
            frameCount = 0;
            lastTime = now;
          }
        } catch (e) {
          // ignore transient frame error in live loop
        } finally {
          setIsProcessing(false);
        }
      }

      if (isActive) {
        // Run next scan in ~100ms
        setTimeout(() => {
          if (isActive) {
            animationFrameId = requestAnimationFrame(loop);
          }
        }, 80);
      }
    };

    if (continuousScanning) {
      animationFrameId = requestAnimationFrame(loop);
    }

    return () => {
      isActive = false;
      cancelAnimationFrame(animationFrameId);
    };
  }, [continuousScanning, captureFrame, confThreshold, modelId, onResult, isProcessing]);

  return (
    <div className="space-y-4">
      {/* Viewport container */}
      <div className="relative rounded-2xl overflow-hidden bg-black border border-surface-light min-h-[380px] flex items-center justify-center">
        {/* Hidden capture canvas */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Video feed */}
        <video
          ref={videoRef}
          playsInline
          muted
          className={`w-full max-h-[460px] object-cover ${streamActive ? "block" : "hidden"}`}
        />

        {/* Placeholder if camera off */}
        {!streamActive && (
          <div className="text-center p-8 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-surface-light border border-slate-700 flex items-center justify-center mb-4 text-slate-400">
              <Camera className="w-8 h-8" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">
              Live Webcam Not Initialized
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mb-5">
              Enable your local camera to test real-time face mask detection with instant bounding boxes.
            </p>
            <button
              onClick={startCamera}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black font-semibold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
            >
              <Camera className="w-4 h-4" /> Start Camera Feed
            </button>
          </div>
        )}

        {/* Live HUD overlay on active video */}
        {streamActive && (
          <>
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-rose-500/90 text-white flex items-center gap-1.5 shadow-md">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                LIVE
              </span>
              {continuousScanning && (
                <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold bg-black/70 border border-cyan-500/40 text-cyan-300">
                  {fps} FPS
                </span>
              )}
            </div>

            {continuousScanning && <div className="animate-scan" />}
          </>
        )}
      </div>

      {/* Camera controls toolbar */}
      {streamActive && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-surface p-3 rounded-2xl border border-surface-light">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setContinuousScanning(!continuousScanning)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                continuousScanning
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30"
                  : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30"
              }`}
            >
              {continuousScanning ? (
                <>
                  <Square className="w-3.5 h-3.5" /> Stop Real-time Scan
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" /> Continuous Stream Inference
                </>
              )}
            </button>

            <button
              onClick={handleSnapPhoto}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-surface-light hover:bg-slate-700 text-white border border-slate-700 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Capture Single Snapshot
            </button>
          </div>

          <button
            onClick={stopCamera}
            className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all flex items-center gap-1.5"
          >
            <VideoOff className="w-3.5 h-3.5" /> Turn Off Camera
          </button>
        </div>
      )}

      {/* Error alert */}
      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};
