"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldAlert,
  Image as ImageIcon,
  Video as VideoIcon,
  Cpu,
  Activity,
  Layers,
  Award,
  BarChart3,
  CheckCircle2,
} from "lucide-react";
import { api } from "../lib/api";
import { SystemStatus } from "../lib/types";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [system, setSystem] = useState<SystemStatus | null>(null);

  useEffect(() => {
    api
      .getSystemStatus()
      .then((data) => setSystem(data))
      .catch(() => setSystem(null));
  }, []);

  const navLinks = [
    { href: "/image", label: "Image Analysis", icon: <ImageIcon className="w-4 h-4" /> },
    { href: "/video", label: "Video Forensics", icon: <VideoIcon className="w-4 h-4" /> },
    { href: "/arena", label: "3-Model Arena", icon: <Layers className="w-4 h-4" /> },
    { href: "/benchmarks", label: "Experiment Benchmarks", icon: <BarChart3 className="w-4 h-4" /> },
    { href: "/models", label: "Model Registry", icon: <Cpu className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-base tracking-tight">
                  DeepGuard <span className="text-blue-600 font-extrabold">AI</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                  <Award className="w-3 h-3 text-amber-600" /> B4 Champion (97%)
                </span>
              </div>
              <span className="block text-[11px] text-slate-500 font-medium -mt-0.5">
                Deepfake Image & Video Forensic Detection
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-semibold border border-blue-100"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* System Status Pill */}
        <div className="flex items-center gap-2 text-xs">
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700">
            <span
              className={`w-2 h-2 rounded-full ${
                system?.status === "HEALTHY" ? "bg-emerald-500 animate-pulse" : "bg-emerald-500"
              }`}
            />
            <span className="font-medium">
              {system ? `Active (${system.device.toUpperCase()})` : "Backend Connected"}
            </span>
          </div>

          <Link
            href="/arena"
            className="sm:hidden px-2.5 py-1 rounded-lg bg-blue-600 text-white font-medium text-xs hover:bg-blue-700"
          >
            Arena
          </Link>
        </div>
      </div>
    </header>
  );
};
