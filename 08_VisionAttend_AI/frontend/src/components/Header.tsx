"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, ScanFace, DatabaseZap } from "lucide-react";
import { api } from "../lib/api";

export const Header: React.FC = () => {
  const [timeStr, setTimeStr] = useState<string>("");
  const [dateStr, setDateStr] = useState<string>("");
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
      setDateStr(
        now.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSeedDemo = async () => {
    setSeeding(true);
    try {
      const res = await api.seedDemoData();
      alert(res.message || "Seeded corporate demo workforce.");
      window.location.reload();
    } catch (err: any) {
      alert("Error seeding demo data: " + err.message);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white/95 backdrop-blur-sm px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Date & Time Widget */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-slate-100 text-slate-600 border border-slate-200">
          <Clock className="w-4 h-4" />
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-900 font-mono tracking-wide">
            {timeStr || "--:--:-- --"}
          </div>
          <div className="text-[11px] text-slate-500">{dateStr || "Loading..."}</div>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSeedDemo}
          disabled={seeding}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm transition-colors disabled:opacity-50"
          title="Seed realistic sample corporate personnel"
        >
          <DatabaseZap className="w-3.5 h-3.5 text-slate-500" />
          {seeding ? "Seeding..." : "Seed Demo Workforce"}
        </button>

        <Link
          href="/kiosk"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors"
        >
          <ScanFace className="w-4 h-4" />
          Launch Reception Kiosk
        </Link>
      </div>
    </header>
  );
};
