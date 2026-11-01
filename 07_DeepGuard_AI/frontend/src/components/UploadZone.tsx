import React, { useRef, useState } from "react";
import { UploadCloud, FileVideo, FileImage, X } from "lucide-react";

interface UploadZoneProps {
  accept: "image" | "video";
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
  disabled?: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  accept,
  onFileSelect,
  selectedFile,
  onClear,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const acceptedTypes =
    accept === "image"
      ? ["image/jpeg", "image/png", "image/jpg"]
      : ["video/mp4", "video/quicktime", "video/x-msvideo"];

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (acceptedTypes.includes(file.type) || file.name.match(/\.(jpg|jpeg|png|mp4|mov|avi)$/i)) {
        onFileSelect(file);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept={accept === "image" ? ".jpg,.jpeg,.png" : ".mp4,.mov,.avi"}
        onChange={handleChange}
        className="hidden"
        disabled={disabled}
      />

      {selectedFile ? (
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-sky-950/60 text-sky-400 border border-sky-800/40">
              {accept === "image" ? <FileImage className="w-6 h-6" /> : <FileVideo className="w-6 h-6" />}
            </div>
            <div>
              <div className="font-semibold text-sm text-white truncate max-w-xs sm:max-w-md">
                {selectedFile.name}
              </div>
              <div className="text-xs text-slate-400">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB &bull; {selectedFile.type || accept}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClear}
            disabled={disabled}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? "border-sky-400 bg-sky-950/20"
              : "border-slate-800 hover:border-slate-700 bg-slate-900/40"
          }`}
        >
          <div className="mx-auto w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-300 mb-4 shadow-inner">
            <UploadCloud className="w-7 h-7 text-sky-400" />
          </div>
          <h4 className="text-base font-bold text-white mb-1">
            Drag & Drop {accept === "image" ? "Face Image" : "Video Recording"}
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            {accept === "image"
              ? "Supports JPG, JPEG, PNG (Max 15 MB). Multiple faces in frame supported."
              : "Supports MP4, MOV, AVI (Max 150 MB). Frames sampled at controlled intervals."}
          </p>
          <span className="inline-block px-4 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition-colors">
            Browse from Computer
          </span>
        </div>
      )}
    </div>
  );
};
