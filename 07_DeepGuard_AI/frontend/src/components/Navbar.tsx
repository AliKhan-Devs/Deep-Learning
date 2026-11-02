"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldAlert, Image as ImageIcon, Video as VideoIcon, Cpu, Activity, Radio } from "lucide-react";
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
    { href: "/", label: "COMMAND", icon: <Activity className="w-3.5 h-3.5" /> },
    { href: "/video", label: "VIDEO FORENSICS", icon: <VideoIcon className="w-3.5 h-3.5" /> },
    { href: "/image", label: "IMAGE INSPECTOR", icon: <ImageIcon className="w-3.5 h-3.5" /> },
    { href: "/models", label: "NEURAL MODELS", icon: <Cpu className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[#0d2a45] bg-[#040811]/90 backdrop-blur-md">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="p-2 rounded bg-[#071322] border border-hud-cyan/40 text-hud-cyan glow-cyan group-hover:scale-105 transition-transform">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <span className="font-mono font-black text-sm tracking-widest text-white flex items-center gap-1.5 uppercase">
              DEEPGUARD <span className="text-hud-cyan">AI</span>
            </span>
            <span className="block text-[9px] text-hud-cyan/80 font-mono tracking-wider -mt-0.5">
              FORENSIC COUNTERMEASURES
            </span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1 font-mono">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-xs tracking-wider transition-all ${
                  isActive
                    ? "bg-[#0b1c30] text-hud-cyan border border-hud-cyan/50 shadow-[0_0_10px_rgba(0,240,255,0.2)] font-bold"
                    : "text-slate-400 hover:text-white hover:bg-[#071322]"
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* System Status Pill */}
        <div className="flex items-center gap-3 font-mono">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded bg-[#071322] border border-[#0d2a45] text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                system?.status === "ONLINE"
                  ? "bg-hud-cyan animate-pulse glow-cyan"
                  : "bg-hud-amber"
              }`}
            />
            <span className="text-slate-300 text-[11px] tracking-wider">
              {system ? `CORE: ${system.device.toUpperCase()}` : "CORE: OFFLINE"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
