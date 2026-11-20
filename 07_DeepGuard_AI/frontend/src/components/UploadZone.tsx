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
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
              {accept === "image" ? <FileImage className="w-5 h-5" /> : <FileVideo className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 truncate max-w-xs sm:max-w-md">
                {selectedFile.name}
              </p>
              <p className="text-xs text-slate-500">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB &bull; Ready for inference
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClear}
            disabled={disabled}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
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
          onClick={() => !disabled && inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? "border-blue-500 bg-blue-50/50"
              : "border-slate-300 hover:border-blue-400 hover:bg-slate-50/50"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-full border border-blue-100">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Click to upload or drag & drop
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {accept === "image"
                  ? "JPG, PNG, or JPEG (Max 15 MB)"
                  : "MP4, MOV, or AVI (Max 150 MB)"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
