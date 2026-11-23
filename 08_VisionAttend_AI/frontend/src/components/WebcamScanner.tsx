"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Camera,
  CameraOff,
  Scan,
  CheckCircle2,
  Volume2,
  VolumeX,
  Upload,
  UserCheck
} from "lucide-react";
import { api } from "../lib/api";
import { VerifyFrameResponse, DetectedFaceVerdict } from "../lib/types";

interface WebcamScannerProps {
  onCheckInSuccess?: (verdict: DetectedFaceVerdict) => void;
}

export const WebcamScanner: React.FC<WebcamScannerProps> = ({ onCheckInSuccess }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [streamActive, setStreamActive] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [scanning, setScanning] = useState<boolean>(false);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [lastVerdict, setLastVerdict] = useState<DetectedFaceVerdict | null>(null);
  const [currentVerdicts, setCurrentVerdicts] = useState<DetectedFaceVerdict[]>([]);
  const [latencyMs, setLatencyMs] = useState<number>(0);

  // Play subtle audio confirmation using Web Audio API
  const playChime = useCallback((isSuccess: boolean) => {
    if (!audioEnabled || typeof window === "undefined") return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      if (isSuccess) {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = "sine";
        osc2.type = "sine";
        osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc2.frequency.setValueAtTime(880.00, ctx.currentTime + 0.1); // A5

        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(ctx.currentTime);
        osc1.stop(ctx.currentTime + 0.2);
        osc2.start(ctx.currentTime + 0.1);
        osc2.stop(ctx.currentTime + 0.5);
      }
    } catch {
      // Audio autoplay policy fallback
    }
  }, [audioEnabled]);

  // Start webcam stream
  const startCamera = async () => {
    setErrorMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setStreamActive(true);
      }
    } catch (err: any) {
      console.warn("Webcam access error:", err);
      setErrorMsg("Camera access was not granted or no webcam detected.");
      setStreamActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setStreamActive(false);
    setCurrentVerdicts([]);
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  // Frame processing loop
  const processFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || scanning) return;
    const video = videoRef.current;
    if (video.readyState !== video.HAVE_ENOUGH_DATA) return;

    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const base64Data = canvas.toDataURL("image/jpeg", 0.85);

    setScanning(true);
    try {
      const res: VerifyFrameResponse = await api.verifyFrame(base64Data);
      setLatencyMs(res.processing_time_ms);
      setCurrentVerdicts(res.verdicts);

      // Check for recognized face
      const recognized = res.verdicts.find((v) => v.recognized);
      if (recognized) {
        setLastVerdict(recognized);
        playChime(true);
        if (onCheckInSuccess) onCheckInSuccess(recognized);
      }
    } catch (err) {
      // Silent error during live polling
    } finally {
      setScanning(false);
    }
  }, [scanning, playChime, onCheckInSuccess]);

  // Periodic capture interval while camera is active
  useEffect(() => {
    if (!streamActive) return;
    const interval = setInterval(processFrame, 1200);
    return () => clearInterval(interval);
  }, [streamActive, processFrame]);

  // Handle uploaded test image
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        setScanning(true);
        try {
          const res = await api.verifyFrame(base64);
          setLatencyMs(res.processing_time_ms);
          setCurrentVerdicts(res.verdicts);
          const recognized = res.verdicts.find((v) => v.recognized);
          if (recognized) {
            setLastVerdict(recognized);
            playChime(true);
            if (onCheckInSuccess) onCheckInSuccess(recognized);
          } else {
            alert(res.verdicts[0]?.message || "No recognized face detected in uploaded photo.");
          }
        } catch (err: any) {
          alert("Verification error: " + err.message);
        } finally {
          setScanning(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4 font-sans select-none">
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Main Video Viewport Container */}
      <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-950 shadow-sm flex items-center justify-center min-h-[380px] sm:min-h-[460px]">
        {/* Live Video Feed */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full max-h-[500px] object-cover transition-opacity duration-300 ${
            streamActive ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Overlay Face Bounding Boxes */}
        {streamActive &&
          videoRef.current &&
          currentVerdicts.map((verdict, idx) => {
            const vidW = videoRef.current?.videoWidth || 640;
            const vidH = videoRef.current?.videoHeight || 480;

            const leftPct = (verdict.bbox.x / vidW) * 100;
            const topPct = (verdict.bbox.y / vidH) * 100;
            const widthPct = (verdict.bbox.w / vidW) * 100;
            const heightPct = (verdict.bbox.h / vidH) * 100;

            const isRecognized = verdict.recognized;

            return (
              <div
                key={idx}
                className={`absolute transition-all duration-150 z-20 pointer-events-none ${
                  isRecognized
                    ? "border-2 border-emerald-500 bg-emerald-500/10"
                    : "border-2 border-blue-400 bg-blue-500/10"
                }`}
                style={{
                  left: `${leftPct}%`,
                  top: `${topPct}%`,
                  width: `${widthPct}%`,
                  height: `${heightPct}%`,
                }}
              >
                {/* Floating Tag */}
                <div
                  className={`absolute -top-7 left-0 px-2 py-0.5 rounded text-[11px] font-semibold text-white shadow-sm whitespace-nowrap flex items-center gap-1 ${
                    isRecognized ? "bg-emerald-600" : "bg-blue-600"
                  }`}
                >
                  {isRecognized ? (
                    <>
                      <UserCheck className="w-3 h-3" />
                      <span>
                        {verdict.full_name} ({verdict.confidence}%)
                      </span>
                    </>
                  ) : (
                    <>
                      <Scan className="w-3 h-3 animate-spin" />
                      <span>Verifying Face...</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}

        {/* Fallback View if Camera Inactive */}
        {!streamActive && (
          <div className="p-8 text-center space-y-4 max-w-sm">
            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 text-indigo-400 mx-auto flex items-center justify-center">
              <CameraOff className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">Camera Feed Inactive</h3>
              <p className="text-xs text-slate-400 mt-1">
                {errorMsg || "Webcam is currently disconnected or permission was blocked."}
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={startCamera}
                className="w-full py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors flex items-center justify-center gap-1.5"
              >
                <Camera className="w-4 h-4" /> Connect Webcam
              </button>
              <label className="w-full py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                <Upload className="w-4 h-4" /> Upload Verification Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}

        {/* Top Status Bar inside Viewport */}
        {streamActive && (
          <div className="absolute top-3 inset-x-3 flex items-center justify-between z-30 pointer-events-auto">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-sm border border-slate-700 text-[11px] font-mono text-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>LIVE KIOSK</span>
              {latencyMs > 0 && (
                <span className="text-slate-400 ml-1">({latencyMs.toFixed(0)}ms)</span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                className="p-1.5 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-slate-700 text-slate-300 hover:text-white transition-colors"
                title={audioEnabled ? "Mute Audio" : "Enable Audio"}
              >
                {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button
                onClick={stopCamera}
                className="p-1.5 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-slate-700 text-slate-300 hover:text-rose-400 transition-colors"
                title="Pause Camera"
              >
                <CameraOff className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Modern Live Verification Toast Card */}
        {lastVerdict && (
          <div className="absolute bottom-4 inset-x-4 max-w-md mx-auto p-4 rounded-xl bg-white border border-emerald-200 shadow-xl flex items-center gap-3.5 z-30">
            <div className="w-11 h-11 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-slate-900 text-sm truncate">
                  {lastVerdict.full_name}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                    lastVerdict.attendance_status === "ON_TIME"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}
                >
                  {lastVerdict.attendance_status?.replace("_", " ") || "VERIFIED"}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                <span>{lastVerdict.department}</span>
                <span>&bull;</span>
                <span className="font-mono text-slate-700">{lastVerdict.employee_code}</span>
              </div>
              <div className="text-[11px] text-emerald-700 font-medium mt-0.5 truncate">
                {lastVerdict.message}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Manual Upload Alternative when Camera is in use */}
      {streamActive && (
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>Position face inside camera frame with balanced lighting.</span>
          <label className="text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer transition-colors flex items-center gap-1">
            <Upload className="w-3.5 h-3.5" /> Test Single Photo
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      )}
    </div>
  );
};
