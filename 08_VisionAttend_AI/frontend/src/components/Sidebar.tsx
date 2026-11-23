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
  Cpu,
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
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col justify-between shrink-0 min-h-screen">
      {/* Brand Header */}
      <div>
        <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-200">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm">
            <ScanFace className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight text-slate-900">
                VisionAttend
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                AI
              </span>
            </div>
            <span className="block text-[11px] text-slate-500 font-medium">
              Workforce Biometrics
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
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-100 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? "text-indigo-600" : "text-slate-400"}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wide">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* System Status Footer Box */}
      <div className="p-4 m-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-xs font-semibold text-slate-800">Biometric Engine</span>
          </div>
          <span className="relative flex h-2 w-2">
            <span
              className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                status ? "bg-emerald-400 animate-ping" : "bg-amber-400"
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                status ? "bg-emerald-500" : "bg-amber-500"
              }`}
            />
          </span>
        </div>
        <div className="text-[11px] text-slate-600 space-y-1 font-mono">
          <div className="flex justify-between">
            <span className="text-slate-500">Model:</span>
            <span className="text-slate-800 font-semibold">FaceNet 512-D</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Device:</span>
            <span className="text-slate-700 uppercase">{status?.device || "CPU"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Enrolled:</span>
            <span className="text-indigo-700 font-semibold">
              {status?.enrolled_biometrics_count ?? 0} Personnel
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
