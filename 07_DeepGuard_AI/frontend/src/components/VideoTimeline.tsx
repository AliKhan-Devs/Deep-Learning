import React, { useState } from "react";
import { VideoFrameDetail } from "../lib/types";
import { AlertCircle, CheckCircle, ShieldAlert } from "lucide-react";

interface VideoTimelineProps {
  timeline: VideoFrameDetail[];
}

export const VideoTimeline: React.FC<VideoTimelineProps> = ({ timeline }) => {
  const [selectedFrame, setSelectedFrame] = useState<VideoFrameDetail | null>(
    timeline.length > 0 ? timeline[0] : null
  );

  const API_HOST = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:8000";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-sky-400" />
          Extracted Frame Forensic Timeline ({timeline.length} sampled frames)
        </h4>
        <span className="text-xs text-slate-400">Click any frame to inspect details</span>
      </div>

      {/* Frame Strip Scrubber */}
      <div className="flex gap-3 overflow-x-auto pb-4 pt-1 px-1">
        {timeline.map((frame) => {
          const isSelected = selectedFrame?.frame_index === frame.frame_index;
          const isSuspicious = frame.is_suspicious;

          const thumbSrc = frame.thumbnail_url
            ? frame.thumbnail_url.startsWith("http")
              ? frame.thumbnail_url
              : `${API_HOST}${frame.thumbnail_url}`
            : null;

          return (
            <button
              key={frame.frame_index}
              type="button"
              onClick={() => setSelectedFrame(frame)}
              className={`shrink-0 w-36 rounded-xl border p-2 text-left transition-all ${
                isSelected
                  ? "ring-2 ring-sky-400 border-sky-400 bg-sky-950/40"
                  : isSuspicious
                  ? "border-rose-500/60 bg-rose-950/20 hover:border-rose-400"
                  : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
              }`}
            >
              <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-950 mb-2 border border-slate-800">
                {thumbSrc ? (
                  <img
                    src={thumbSrc}
                    alt={`Frame ${frame.frame_index}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-500">
                    No thumb
                  </div>
                )}
                {isSuspicious && (
                  <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-rose-600 text-white shadow">
                    SUSPICIOUS
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="font-mono text-slate-300">{frame.timestamp_sec.toFixed(2)}s</span>
                <span
                  className={`font-bold ${
                    isSuspicious ? "text-rose-400" : "text-emerald-400"
                  }`}
                >
                  {(frame.fake_probability * 100).toFixed(0)}% Fake
                </span>
              </div>

              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full ${isSuspicious ? "bg-rose-500" : "bg-emerald-500"}`}
                  style={{ width: `${Math.max(5, frame.fake_probability * 100)}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Frame Detail Inspector */}
      {selectedFrame && (
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-full sm:w-64 aspect-video rounded-xl overflow-hidden bg-black border border-slate-700 shrink-0">
            {selectedFrame.thumbnail_url ? (
              <img
                src={
                  selectedFrame.thumbnail_url.startsWith("http")
                    ? selectedFrame.thumbnail_url
                    : `${API_HOST}${selectedFrame.thumbnail_url}`
                }
                alt="Selected frame"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                Thumbnail unavailable
              </div>
            )}
          </div>

          <div className="flex-1 space-y-2 w-full">
            <div className="flex items-center justify-between">
              <h5 className="font-bold text-white text-base">
                Frame #{selectedFrame.frame_index} &bull; Timestamp {selectedFrame.timestamp_sec.toFixed(2)}s
              </h5>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                  selectedFrame.is_suspicious
                    ? "bg-rose-950/70 border-rose-600 text-rose-300"
                    : "bg-emerald-950/70 border-emerald-600 text-emerald-300"
                }`}
              >
                {selectedFrame.is_suspicious ? "Anomaly Detected" : "Nominal Consistency"}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Faces in Frame</div>
                <div className="text-sm font-bold text-white">{selectedFrame.faces_count}</div>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Fake Probability</div>
                <div className="text-sm font-bold text-rose-400">
                  {(selectedFrame.fake_probability * 100).toFixed(1)}%
                </div>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Authenticity</div>
                <div className="text-sm font-bold text-emerald-400">
                  {(selectedFrame.real_probability * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
