"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, Image as ImageIcon, Video as VideoIcon, Cpu, History, Activity } from "lucide-react";
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
    { href: "/", label: "Dashboard", icon: <Activity className="w-4 h-4" /> },
    { href: "/image", label: "Image Analysis", icon: <ImageIcon className="w-4 h-4" /> },
    { href: "/video", label: "Video Analysis", icon: <VideoIcon className="w-4 h-4" /> },
    { href: "/models", label: "Models & Colab", icon: <Cpu className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
              DeepGuard <span className="text-sky-400">AI</span>
            </span>
            <span className="block text-[10px] text-slate-400 -mt-1 font-mono">
              Deepfake Forensics
            </span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-slate-800 text-sky-400 border border-slate-700/60 shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* System Status Pill */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full border border-slate-800 bg-slate-900/60 text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                system?.status === "ONLINE" ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
              }`}
            />
            <span className="text-slate-300 font-mono text-[11px]">
              {system ? `${system.device.toUpperCase()}` : "API Offline"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
