"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Download, FileText, ArrowLeft, RefreshCw, Radio } from "lucide-react";
import { BiometricFaceMesh } from "./BiometricFaceMesh";
import { FacialLandmarkRadar } from "./FacialLandmarkRadar";
import { AnalysisResultsCard } from "./AnalysisResultsCard";
import { MicroExpressionCard } from "./MicroExpressionCard";
import { TemporalConsistencyChart } from "./TemporalConsistencyChart";
import { FrameAnomalyFilmstrip } from "./FrameAnomalyFilmstrip";
import { DetectionSummaryAndRecommendation } from "./DetectionSummaryAndRecommendation";
import { VideoAnalysisResponse, ImageAnalysisResponse } from "../lib/types";
import { api } from "../lib/api";

interface ForensicHUDProps {
  videoData?: VideoAnalysisResponse | null;
  imageData?: ImageAnalysisResponse | null;
  analysisId?: string;
  isDemo?: boolean;
}

export const ForensicHUD: React.FC<ForensicHUDProps> = ({
  videoData,
  imageData,
  analysisId,
  isDemo = false,
}) => {
  // Determine if manipulated based on data or demo defaults
  const isManipulated =
    videoData?.fake_probability !== undefined
      ? videoData.fake_probability >= 0.5
      : imageData?.fake_probability !== undefined
      ? imageData.fake_probability >= 0.5
      : true; // Default demo is synthetic (18% authenticity)

  const fakeProb =
    videoData?.fake_probability ?? imageData?.fake_probability ?? 0.82;
  const authenticityScore =
    videoData?.real_probability !== undefined
      ? videoData.real_probability * 100
      : imageData?.real_probability !== undefined
      ? imageData.real_probability * 100
      : (1 - fakeProb) * 100;

  const currentAnalysisId =
    analysisId || videoData?.analysis_id || imageData?.analysis_id || "DF-7X92-1K3L";
  const modelName =
    videoData?.model_name || imageData?.model_name || "ADVANCED-FORENSICS v3.2";
  const durationSec =
    videoData?.execution_duration_sec ?? imageData?.execution_duration_sec ?? 3.842;
  const durationFormatted = `00:00:0${durationSec.toFixed(3)}`;

  // Timeline and frame handling
  const totalFrames = videoData?.frames_analyzed || 300;
  const [currentFrame, setCurrentFrame] = useState(38);

  // Compute timestamp for the selected frame
  const currentTimestamp = (currentFrame / (totalFrames || 300)) * (durationSec * 2.5);

  // Check if current frame has a real thumbnail from video timeline
  const activeFrameDetail = videoData?.timeline?.find(
    (f) => f.frame_index === currentFrame
  );
  const rawImageUrl = activeFrameDetail?.thumbnail_url || null;

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-4 font-sans select-none">
      {/* Top HUD Header Bar */}
      <header className="hud-panel p-4 bg-[#050c18]/95 border border-[#0d2a45]">
        <div className="reticle-tl" />
        <div className="reticle-tr" />
        <div className="reticle-bl" />
        <div className="reticle-br" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Main Title & Subtitle */}
          <div>
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-hud-cyan animate-pulse glow-cyan" />
              <h1 className="text-xl sm:text-2xl font-mono font-black tracking-widest text-white uppercase">
                DEEPFAKE DETECTION ANALYSIS
              </h1>
            </div>
            <p className="text-xs font-mono tracking-widest text-hud-cyan uppercase mt-1 pl-5">
              AI-POWERED VIDEO AUTHENTICATION SYSTEM
            </p>
          </div>

          {/* Metadata Block and Status */}
          <div className="flex flex-wrap items-center gap-6 text-xs font-mono">
            {/* Metadata Columns */}
            <div className="space-y-1 text-slate-400">
              <div>
                <span className="tracking-wider text-slate-400">ANALYSIS ID:</span>{" "}
                <span className="text-hud-cyan font-bold">{currentAnalysisId}</span>
              </div>
              <div>
                <span className="tracking-wider text-slate-400">MODEL:</span>{" "}
                <span className="text-slate-200 uppercase">{modelName}</span>
              </div>
              <div>
                <span className="tracking-wider text-slate-400">PROCESSING TIME:</span>{" "}
                <span className="text-slate-200">{durationFormatted}</span>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-3 pl-4 border-l border-[#0d2a45]">
              <div>
                <div className="text-[10px] text-slate-400 tracking-widest uppercase">
                  STATUS
                </div>
                <div className="text-xs font-bold text-hud-cyan tracking-wider uppercase mt-0.5">
                  {videoData?.status === "PROCESSING"
                    ? "PROCESSING SEQUENCE"
                    : "ANALYSIS COMPLETE"}
                </div>
              </div>

              <div className="w-8 h-8 rounded-full border border-hud-cyan/80 bg-hud-cyan/10 flex items-center justify-center text-hud-cyan glow-cyan">
                {videoData?.status === "PROCESSING" ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
                )}
              </div>
            </div>

            {/* Quick Export Actions if real ID is present */}
            {analysisId && (
              <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-[#0d2a45]">
                <a
                  href={api.getReportUrl(analysisId, "json")}
                  download
                  className="px-2.5 py-1.5 rounded text-[11px] font-mono bg-[#091729] hover:bg-[#122842] text-hud-cyan border border-[#133454] flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3 h-3" /> JSON
                </a>
                <a
                  href={api.getReportUrl(analysisId, "html")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 rounded text-[11px] font-mono bg-hud-cyan/20 hover:bg-hud-cyan/30 text-hud-cyan border border-hud-cyan/40 flex items-center gap-1.5 transition-colors"
                >
                  <FileText className="w-3 h-3" /> CERTIFICATE
                </a>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main 3-Column Instrument Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column (Span 4) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Panel 1: Input Video Frame */}
          <div className="h-[360px]">
            <BiometricFaceMesh
              currentFrame={currentFrame}
              totalFrames={totalFrames}
              timestampSec={currentTimestamp}
              totalDurationSec={durationSec * 2.5}
              onFrameChange={(f) => setCurrentFrame(f)}
              rawImageUrl={rawImageUrl}
              fakeProbability={fakeProb}
            />
          </div>

          {/* Panel 2: Facial Landmark Analysis */}
          <div className="h-[210px]">
            <FacialLandmarkRadar />
          </div>
        </div>

        {/* Center Column (Span 4) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Panel 3: Analysis Results */}
          <div className="h-[360px]">
            <AnalysisResultsCard
              authenticityScore={authenticityScore}
              isManipulated={isManipulated}
              confidence="HIGH"
              predictionText={videoData?.prediction || imageData?.prediction}
            />
          </div>

          {/* Panel 4: Micro-Expression Analysis */}
          <div className="h-[210px]">
            <MicroExpressionCard isManipulated={isManipulated} />
          </div>
        </div>

        {/* Right Column (Span 4) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Panel 5: Temporal Consistency */}
          <div className="h-[280px]">
            <TemporalConsistencyChart
              timeline={videoData?.timeline}
              currentFrame={currentFrame}
              totalFrames={totalFrames}
              onSelectFrame={(f) => setCurrentFrame(f)}
              hasInconsistency={isManipulated}
            />
          </div>

          {/* Panel 6: Frame-By-Frame Anomaly Detection */}
          <div className="h-[290px]">
            <FrameAnomalyFilmstrip
              timeline={videoData?.timeline}
              currentFrame={currentFrame}
              onSelectFrame={(f) => setCurrentFrame(f)}
              isManipulated={isManipulated}
            />
          </div>
        </div>
      </div>

      {/* Bottom Row: Detection Summary & Recommendation */}
      <DetectionSummaryAndRecommendation
        isManipulated={isManipulated}
        recommendationTitle={
          isManipulated
            ? "CONTENT IS LIKELY SYNTHETIC"
            : "CONTENT IS LIKELY AUTHENTIC"
        }
        recommendationDetail={
          isManipulated
            ? "DO NOT TRUST THIS VIDEO AS AUTHENTIC"
            : "PASSED BIOMETRIC AND TEMPORAL AUTHENTICITY CHECKS"
        }
      />
    </div>
  );
};
