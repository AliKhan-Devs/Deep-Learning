import React from "react";
import { AlertTriangle } from "lucide-react";

interface DisclaimerAlertProps {
  className?: string;
}

export const DisclaimerAlert: React.FC<DisclaimerAlertProps> = ({ className = "" }) => {
  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-200 text-xs sm:text-sm leading-relaxed ${className}`}
    >
      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
      <div>
        <span className="font-semibold text-amber-300">Forensic Notice: </span>
        This result is an AI-generated assessment and is not definitive proof of media authenticity or manipulation.
        Deep learning models evaluate subtle facial boundary and compression artifacts. Always corroborate with multi-source forensic verification.
      </div>
    </div>
  );
};
