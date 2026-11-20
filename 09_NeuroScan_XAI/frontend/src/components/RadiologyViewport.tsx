'use client';

import React, { useState } from 'react';
import { DiagnosticResult, XAIMode, ColorMap } from '../lib/types';
import { Eye, Layers, Palette, Sliders, Maximize2, Crosshair, Box } from 'lucide-react';

interface RadiologyViewportProps {
  result: DiagnosticResult;
}

export default function RadiologyViewport({ result }: RadiologyViewportProps) {
  const [mode, setMode] = useState<XAIMode>('gradcam_pp');
  const [colormap, setColormap] = useState<ColorMap>('jet');
  const [opacity, setOpacity] = useState<number>(0.65);
  const [showBBoxes, setShowBBoxes] = useState<boolean>(true);

  // Determine which heatmap to display
  const getHeatmapSource = () => {
    if (mode === 'contours') {
      return result.contours_overlay_b64;
    }

    if (colormap === 'turbo') {
      return result.gradcam_turbo_b64;
    } else if (colormap === 'viridis') {
      return result.gradcam_viridis_b64;
    } else {
      return mode === 'gradcam_pp' ? result.gradcam_pp_jet_b64 : result.gradcam_jet_b64;
    }
  };

  return (
    <div className="bg-pacs-950 border border-pacs-700 rounded-xl overflow-hidden shadow-2xl flex flex-col">
      {/* Viewport Top Control Ribbon */}
      <div className="bg-pacs-900 border-b border-pacs-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Mode Selector */}
        <div className="flex items-center space-x-1.5">
          <span className="text-xs text-slate-400 font-medium flex items-center space-x-1 mr-1">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Mode:</span>
          </span>
          <div className="inline-flex rounded-md bg-pacs-850 p-0.5 border border-pacs-700">
            <button
              onClick={() => setMode('gradcam_pp')}
              className={`px-2.5 py-1 text-xs font-semibold rounded ${
                mode === 'gradcam_pp'
                  ? 'bg-cyan-500 text-pacs-950 shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Grad-CAM++
            </button>
            <button
              onClick={() => setMode('gradcam')}
              className={`px-2.5 py-1 text-xs font-semibold rounded ${
                mode === 'gradcam'
                  ? 'bg-cyan-500 text-pacs-950 shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Grad-CAM
            </button>
            <button
              onClick={() => setMode('contours')}
              className={`px-2.5 py-1 text-xs font-semibold rounded ${
                mode === 'contours'
                  ? 'bg-emerald-500 text-pacs-950 shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Tumor Contours
            </button>
            <button
              onClick={() => setMode('side_by_side')}
              className={`px-2.5 py-1 text-xs font-semibold rounded ${
                mode === 'side_by_side'
                  ? 'bg-purple-500 text-white shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Dual View
            </button>
          </div>
        </div>

        {/* Colormap & Bounding Box Toggle */}
        <div className="flex items-center space-x-3">
          {mode !== 'contours' && (
            <div className="flex items-center space-x-1.5">
              <Palette className="w-3.5 h-3.5 text-slate-400" />
              <div className="inline-flex rounded-md bg-pacs-850 p-0.5 border border-pacs-700">
                {(['jet', 'turbo', 'viridis'] as ColorMap[]).map((cm) => (
                  <button
                    key={cm}
                    onClick={() => setColormap(cm)}
                    className={`px-2 py-0.5 text-[11px] font-mono uppercase rounded ${
                      colormap === cm
                        ? 'bg-pacs-700 text-cyan-300 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cm}
                  </button>
                ))}
              </div>
            </div>
          )}

          {result.has_tumor && result.bounding_boxes.length > 0 && (
            <button
              onClick={() => setShowBBoxes(!showBBoxes)}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs border ${
                showBBoxes
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                  : 'bg-pacs-850 border-pacs-700 text-slate-400'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>ROI Box ({result.bounding_boxes.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Diagnostic Display Area */}
      <div className="p-4 bg-black flex-1 flex flex-col items-center justify-center min-h-[420px] relative">
        {mode === 'side_by_side' ? (
          /* Dual Side-by-Side View */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
            {/* Left: Original Scan */}
            <div className="relative border border-pacs-800 rounded-lg overflow-hidden bg-pacs-900/60 p-2 flex flex-col items-center">
              <div className="absolute top-3 left-3 bg-pacs-950/80 px-2 py-0.5 rounded text-[10px] font-mono text-cyan-400 border border-pacs-700">
                ORIGINAL MRI (GRAYSCALE)
              </div>
              <img
                src={result.original_b64}
                alt="Original Brain MRI"
                className="w-full max-w-[340px] aspect-square object-contain rounded"
              />
            </div>

            {/* Right: Heatmap Overlay */}
            <div className="relative border border-pacs-800 rounded-lg overflow-hidden bg-pacs-900/60 p-2 flex flex-col items-center">
              <div className="absolute top-3 left-3 bg-pacs-950/80 px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400 border border-pacs-700">
                GRAD-CAM++ HEATMAP OVERLAY
              </div>
              <img
                src={result.gradcam_pp_jet_b64}
                alt="Grad-CAM++ Heatmap"
                className="w-full max-w-[340px] aspect-square object-contain rounded"
              />
            </div>
          </div>
        ) : (
          /* Single Interactive Scrubbing View */
          <div className="relative w-full max-w-[420px] aspect-square rounded-lg overflow-hidden border border-pacs-800 shadow-2xl flex items-center justify-center bg-black">
            {/* Background: Original Grayscale Image */}
            <img
              src={result.original_b64}
              alt="Original MRI"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            />

            {/* Foreground: Heatmap Overlay with dynamic opacity */}
            <img
              src={getHeatmapSource()}
              alt="Explainable Heatmap"
              style={{ opacity: mode === 'contours' ? 1.0 : opacity }}
              className="absolute inset-0 w-full h-full object-contain pointer-events-none transition-opacity duration-150"
            />

            {/* Bounding Box Renderings */}
            {showBBoxes && result.has_tumor && result.bounding_boxes.map((box, idx) => (
              <div
                key={idx}
                className="absolute border-2 border-dashed border-emerald-400 rounded pointer-events-none animate-pulse"
                style={{
                  left: `${(box.x / 224) * 100}%`,
                  top: `${(box.y / 224) * 100}%`,
                  width: `${(box.w / 224) * 100}%`,
                  height: `${(box.h / 224) * 100}%`,
                }}
              >
                <span className="absolute -top-5 left-0 text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 px-1 py-0.2 rounded border border-emerald-500">
                  FOCUS #{idx + 1} ({box.confidence_score})
                </span>
              </div>
            ))}

            {/* HUD Reticle Corners */}
            <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-cyan-500 pointer-events-none" />
            <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cyan-500 pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-cyan-500 pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-cyan-500 pointer-events-none" />

            {/* Scan Metadata Badge */}
            <div className="absolute bottom-3 left-3 bg-pacs-950/85 backdrop-blur px-2.5 py-1 rounded border border-pacs-700 text-[11px] font-mono text-slate-300">
              SCAN-ID: #{result.scan_id.toUpperCase()} | 224×224
            </div>

            <div className="absolute bottom-3 right-3 bg-pacs-950/85 backdrop-blur px-2.5 py-1 rounded border border-pacs-700 text-[11px] font-mono text-cyan-400">
              {result.inference_time_ms} ms
            </div>
          </div>
        )}
      </div>

      {/* Viewport Bottom Controls: Opacity Scrub Slider */}
      {mode !== 'side_by_side' && mode !== 'contours' && (
        <div className="bg-pacs-900 border-t border-pacs-800 px-5 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Heatmap Blend (Alpha):</span>
          </div>

          <div className="flex-1 max-w-md flex items-center space-x-3">
            <span className="text-[11px] font-mono text-slate-400">0% (Anatomy)</span>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-pacs-800 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-[11px] font-mono text-cyan-400 font-bold">
              {Math.round(opacity * 100)}%
            </span>
          </div>

          <button
            onClick={() => setOpacity(opacity === 0.0 ? 0.65 : 0.0)}
            className="px-2.5 py-1 text-xs rounded border border-pacs-700 bg-pacs-850 hover:bg-pacs-800 text-slate-300"
          >
            {opacity === 0.0 ? 'Show Heatmap' : 'Pure Scan'}
          </button>
        </div>
      )}
    </div>
  );
}
