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
    <div className="w-full font-mono">
      <input
        ref={inputRef}
        type="file"
        accept={accept === "image" ? ".jpg,.jpeg,.png" : ".mp4,.mov,.avi"}
        onChange={handleChange}
        className="hidden"
        disabled={disabled}
      />

      {selectedFile ? (
        <div className="p-3.5 rounded bg-[#071322] border border-hud-cyan/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded bg-[#0b1d30] text-hud-cyan border border-hud-cyan/40 glow-cyan">
              {accept === "image" ? <FileImage className="w-5 h-5" /> : <FileVideo className="w-5 h-5" />}
            </div>
            <div>
              <div className="font-bold text-xs text-white truncate max-w-xs sm:max-w-md">
                {selectedFile.name}
              </div>
              <div className="text-[10px] text-hud-cyan/80 mt-0.5">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB &bull; {selectedFile.type || accept}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClear}
            disabled={disabled}
            className="p-1.5 rounded text-slate-400 hover:text-hud-amber hover:bg-[#1a0f08] transition-colors"
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
          className={`border-2 border-dashed rounded p-6 sm:p-8 text-center cursor-pointer transition-all ${
            disabled
              ? "opacity-50 cursor-not-allowed border-[#0d2a45] bg-[#050c18]"
              : isDragging
              ? "border-hud-cyan bg-[#07192d] shadow-[0_0_15px_rgba(0,240,255,0.3)]"
              : "border-[#0e2c49] bg-[#050c18] hover:border-hud-cyan/60 hover:bg-[#071322]"
          }`}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 rounded-full bg-[#081525] border border-[#103254] text-hud-cyan">
              <UploadCloud className="w-6 h-6 animate-pulse" />
            </div>
            <div className="text-xs font-bold text-white tracking-wider uppercase mt-1">
              CLICK OR DROP {accept === "image" ? "FACIAL IMAGE" : "VIDEO STREAM"} HERE
            </div>
            <div className="text-[10px] text-slate-400 tracking-wider">
              {accept === "image"
                ? "JPG, PNG, WEBP (MIN 128x128 PX)"
                : "MP4, AVI, MOV (MAX 100MB)"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
