'use client';

import React, { useState, useEffect } from 'react';
import {
  DiagnosticResult,
  SampleScanInfo,
} from '../lib/types';
import {
  getSampleScans,
  analyzeSampleScan,
  analyzeUploadedScan,
} from '../lib/api';
import Header from '../components/Header';
import SampleScanGallery from '../components/SampleScanGallery';
import UploadDropzone from '../components/UploadDropzone';
import RadiologyViewport from '../components/RadiologyViewport';
import DiagnosticCard from '../components/DiagnosticCard';
import ClinicalReportModal from '../components/ClinicalReportModal';
import { Activity, Brain, Loader2, Sparkles, AlertCircle } from 'lucide-react';

export default function WorkstationPage() {
  const [samples, setSamples] = useState<SampleScanInfo[]>([]);
  const [selectedSampleId, setSelectedSampleId] = useState<string>('glioma');
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);

  // Load sample gallery and run initial demo inference on glioma
  useEffect(() => {
    async function loadInitialData() {
      try {
        setIsLoading(true);
        const sampleList = await getSampleScans();
        setSamples(sampleList);

        // Run initial demo inference on glioma sample
        const initialResult = await analyzeSampleScan('glioma', 'DEMO-GLIOMA-01', 'Initial baseline clinical evaluation.');
        setResult(initialResult);
        setSelectedSampleId('glioma');
      } catch (err: any) {
        console.error('Failed to load initial data:', err);
        setError('Could not connect to the NeuroScan XAI backend engine. Please verify the FastAPI server is running on port 8002.');
      } finally {
        setIsLoading(false);
      }
    }

    loadInitialData();
  }, []);

  // Handle 1-click sample scan selection
  const handleSelectSample = async (sampleId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setSelectedSampleId(sampleId);
      const res = await analyzeSampleScan(sampleId);
      setResult(res);
    } catch (err: any) {
      console.error('Sample analysis failed:', err);
      setError(err.message || 'Sample analysis failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle custom file upload
  const handleUploadScan = async (file: File, patientId?: string, notes?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setSelectedSampleId('');
      const res = await analyzeUploadedScan(file, patientId, notes);
      setResult(res);
    } catch (err: any) {
      console.error('Upload analysis failed:', err);
      setError(err.message || 'Upload analysis failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-pacs-900 border border-pacs-700/80 shadow-md">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2">
            <span>Clinical Neuroradiology Diagnostic Workstation</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time differential tumor classification, Grad-CAM++ feature localization, and Shannon entropy safety triage.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-3 py-1.5 rounded-lg">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span>Active Checkpoint: DenseNet-121 (95.56% Val Acc)</span>
        </div>
      </div>

      {/* Error Alert (if backend offline) */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/50 flex items-start space-x-3 text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Backend Connection Notice</p>
            <p className="text-xs mt-0.5 text-rose-300/90">{error}</p>
          </div>
        </div>
      )}

      {/* Input Section: 1-Click Sample Gallery & Upload Zone */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SampleScanGallery
            samples={samples}
            selectedId={selectedSampleId}
            onSelect={handleSelectSample}
            isLoading={isLoading}
          />
        </div>
        <div>
          <UploadDropzone
            onUpload={handleUploadScan}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Main Analysis Display: Viewport + Diagnostic Card */}
      {isLoading && !result ? (
        <div className="bg-pacs-900 border border-pacs-800 rounded-xl p-16 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mb-4" />
          <p className="text-base font-semibold text-white">Running DenseNet-121 Inference & XAI Engine...</p>
          <p className="text-xs text-slate-400 mt-1">
            Computing high-order derivatives for Grad-CAM++ and Shannon Softmax Entropy.
          </p>
        </div>
      ) : result ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* PACS Viewport: 2 Columns */}
          <div className="lg:col-span-2">
            <RadiologyViewport result={result} />
          </div>

          {/* Diagnostic Card: 1 Column */}
          <div>
            <DiagnosticCard
              result={result}
              onOpenReport={() => setIsReportOpen(true)}
            />
          </div>
        </div>
      ) : null}

      {/* Report Modal */}
      {result && (
        <ClinicalReportModal
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          result={result}
        />
      )}
    </div>
  );
}
