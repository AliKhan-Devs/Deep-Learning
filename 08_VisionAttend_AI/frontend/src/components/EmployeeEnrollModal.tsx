"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  Camera,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
} from "lucide-react";
import { api } from "../lib/api";
import { Employee } from "../lib/types";

interface EmployeeEnrollModalProps {
  employee: Employee;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const EmployeeEnrollModal: React.FC<EmployeeEnrollModalProps> = ({
  employee,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [streamActive, setStreamActive] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0); // 0: Front, 1: Left, 2: Right
  const [shots, setShots] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const stepsConfig = [
    { title: "Shot 1: Frontal Gaze", instruction: "Look directly at the camera with a neutral expression." },
    { title: "Shot 2: Slight Left Angle", instruction: "Turn your head approximately 15° to the left." },
    { title: "Shot 3: Slight Right Angle", instruction: "Turn your head approximately 15° to the right." },
  ];

  // Start webcam
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 480, height: 480, facingMode: "user" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setStreamActive(true);
      }
    } catch {
      setErrorMsg("Camera access denied or unavailable.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const s = videoRef.current.srcObject as MediaStream;
      s.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setStreamActive(false);
  };

  useEffect(() => {
    if (isOpen) {
      setShots([]);
      setCurrentStep(0);
      setErrorMsg(null);
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen]);

  const captureShot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 480;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const b64 = canvas.toDataURL("image/jpeg", 0.9);
    const updated = [...shots, b64];
    setShots(updated);

    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const retakeAll = () => {
    setShots([]);
    setCurrentStep(0);
    setErrorMsg(null);
  };

  const handleFinishEnrollment = async () => {
    if (shots.length === 0) return;
    setSubmitting(true);
    setErrorMsg(null);

    try {
      await api.enrollFace(employee.id, shots);
      stopCamera();
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Enrollment failed. Face could not be isolated.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <canvas ref={canvasRef} className="hidden" />

      <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="font-semibold text-slate-900 text-base flex items-center gap-2">
              <Camera className="w-4 h-4 text-indigo-600" />
              Biometric Face Enrollment
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Enrolling: <span className="text-slate-800 font-semibold">{employee.full_name}</span> ({employee.employee_code})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Step Indicator */}
          <div className="flex items-center justify-between text-xs font-medium pb-2 border-b border-slate-200">
            {stepsConfig.map((s, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-1.5 ${
                  shots.length > idx
                    ? "text-emerald-700 font-semibold"
                    : currentStep === idx
                    ? "text-indigo-700 font-semibold"
                    : "text-slate-400"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    shots.length > idx
                      ? "bg-emerald-100 text-emerald-800 font-bold"
                      : currentStep === idx
                      ? "bg-indigo-600 text-white font-bold"
                      : "bg-slate-100 text-slate-500 border border-slate-200"
                  }`}
                >
                  {shots.length > idx ? "✓" : idx + 1}
                </span>
                <span className="hidden sm:inline">{s.title.split(":")[0]}</span>
              </div>
            ))}
          </div>

          {/* Current Pose Prompt */}
          {shots.length < 3 && (
            <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-900">
              <span className="font-semibold">{stepsConfig[currentStep].title}:</span>{" "}
              {stepsConfig[currentStep].instruction}
            </div>
          )}

          {/* Video Preview or Completed Grid */}
          <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 aspect-square max-h-[300px] mx-auto flex items-center justify-center">
            {shots.length < 3 ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {/* Face Alignment Oval Guide */}
                <div className="absolute inset-8 border-2 border-dashed border-indigo-400/70 rounded-full pointer-events-none" />
              </>
            ) : (
              /* Completed 3-Shot Thumbnails Grid */
              <div className="grid grid-cols-3 gap-2 p-3 w-full h-full">
                {shots.map((shot, i) => (
                  <div key={i} className="relative rounded-lg overflow-hidden border border-emerald-500 bg-slate-950">
                    <img src={shot} alt={`Shot ${i + 1}`} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-900/80 text-white">
                      Pose #{i + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={retakeAll}
            disabled={shots.length === 0 || submitting}
            className="text-xs text-slate-600 hover:text-slate-900 font-medium transition-colors disabled:opacity-40"
          >
            Retake Shots
          </button>

          <div className="flex items-center gap-2">
            {shots.length < 3 ? (
              <button
                type="button"
                onClick={captureShot}
                disabled={!streamActive}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <Camera className="w-4 h-4" />
                Capture Pose #{shots.length + 1}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinishEnrollment}
                disabled={submitting}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Save Multi-Pose Biometrics
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
