'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FileImage, User, AlignLeft, ArrowUpRight } from 'lucide-react';

interface UploadDropzoneProps {
  onUpload: (file: File, patientId?: string, notes?: string) => void;
  isLoading: boolean;
}

export default function UploadDropzone({ onUpload, isLoading }: UploadDropzoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [patientId, setPatientId] = useState('');
  const [notes, setNotes] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile) {
      onUpload(selectedFile, patientId.trim() || undefined, notes.trim() || undefined);
    }
  };

  return (
    <div className="bg-pacs-900 border border-pacs-700/80 rounded-xl p-4 shadow-md">
      <form onSubmit={handleSubmit}>
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-cyan-400 bg-cyan-950/30'
              : selectedFile
              ? 'border-emerald-500/60 bg-emerald-950/20'
              : 'border-pacs-700 hover:border-cyan-500/50 hover:bg-pacs-850'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg"
            onChange={handleChange}
            className="hidden"
          />

          {selectedFile ? (
            <div className="flex flex-col items-center">
              <FileImage className="w-8 h-8 text-emerald-400 mb-2" />
              <p className="text-sm font-semibold text-white">{selectedFile.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {(selectedFile.size / 1024).toFixed(1)} KB — Click or drop to replace
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <UploadCloud className="w-8 h-8 text-cyan-400 mb-2 animate-bounce" />
              <p className="text-sm font-medium text-white">
                Drag & drop Brain MRI scan, or <span className="text-cyan-400 underline">browse</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Supports DICOM-exported JPEG, PNG slices (T1, T1-CE, T2 axial/sagittal/coronal)
              </p>
            </div>
          )}
        </div>

        {/* Patient ID and Clinical Notes (Optional) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          <div className="relative">
            <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Patient / Accession ID (e.g. PT-9821)"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-pacs-850 border border-pacs-700 rounded-md text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div className="relative">
            <AlignLeft className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Clinical Notes / Symptoms (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-pacs-850 border border-pacs-700 rounded-md text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-3 flex justify-end">
          <button
            type="submit"
            disabled={!selectedFile || isLoading}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
              !selectedFile || isLoading
                ? 'bg-pacs-800 text-slate-500 cursor-not-allowed border border-pacs-700'
                : 'bg-gradient-to-r from-cyan-600 to-emerald-600 text-white hover:from-cyan-500 hover:to-emerald-500 shadow-md shadow-cyan-900/40'
            }`}
          >
            <span>{isLoading ? 'Running Inference...' : 'Analyze MRI Scan'}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
