"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ScanFace,
  Users,
  ClipboardList,
  BarChart3,
  Settings as SettingsIcon,
  Sparkles,
  Cpu,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { api } from "../lib/api";
import { SystemStatus } from "../lib/types";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [status, setStatus] = useState<SystemStatus | null>(null);

  useEffect(() => {
    api.getSystemStatus().then(setStatus).catch(() => setStatus(null));
  }, []);

  const navItems = [
    { href: "/", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { href: "/kiosk", label: "Attendance Kiosk", icon: <ScanFace className="w-4 h-4" />, badge: "Live" },
    { href: "/employees", label: "Personnel Directory", icon: <Users className="w-4 h-4" /> },
    { href: "/attendance", label: "Attendance Logs", icon: <ClipboardList className="w-4 h-4" /> },
    { href: "/analytics", label: "Workforce Analytics", icon: <BarChart3 className="w-4 h-4" /> },
    { href: "/settings", label: "System Settings", icon: <SettingsIcon className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 border-r border-[#1e293b] bg-[#0c1222] flex flex-col justify-between shrink-0 min-h-screen">
      {/* Brand Header */}
      <div>
        <div className="h-16 px-6 flex items-center gap-3 border-b border-[#1e293b]">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <ScanFace className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
              VisionAttend <span className="text-sky-400 font-mono text-xs">AI</span>
            </span>
            <span className="block text-[10px] text-slate-400 font-medium">
              Enterprise Biometrics
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 font-bold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-[#131d33]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? "text-indigo-400" : "text-slate-500"}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider animate-pulse">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* System Status Footer Box */}
      <div className="p-4 m-3 rounded-xl bg-[#0f182c] border border-[#1e293b] space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[11px] font-semibold text-slate-300">Biometric Engine</span>
          </div>
          <span
            className={`w-2 h-2 rounded-full ${
              status ? "bg-emerald-400 animate-pulse glow-emerald" : "bg-amber-400"
            }`}
          />
        </div>
        <div className="text-[10px] text-slate-400 space-y-1 font-mono">
          <div className="flex justify-between">
            <span>Model:</span>
            <span className="text-slate-300 font-bold">FaceNet (512-D)</span>
          </div>
          <div className="flex justify-between">
            <span>Device:</span>
            <span className="text-slate-300 uppercase">{status?.device || "CPU"}</span>
          </div>
          <div className="flex justify-between">
            <span>Enrolled:</span>
            <span className="text-indigo-400 font-bold">
              {status?.enrolled_biometrics_count ?? 0} Personnel
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
