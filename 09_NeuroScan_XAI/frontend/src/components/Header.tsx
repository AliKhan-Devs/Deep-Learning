'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, Brain, FileText, History, ShieldCheck, Zap } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Diagnostic Viewport', href: '/', icon: Brain },
    { label: 'Model Evidence & XAI', href: '/evidence', icon: ShieldCheck },
    { label: 'Audit History', href: '/history', icon: History },
  ];

  return (
    <header className="border-b border-pacs-700 bg-pacs-900/90 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Branding */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-cyan-600 to-emerald-500 p-0.5 shadow-lg shadow-cyan-950/40">
            <div className="w-full h-full bg-pacs-900 rounded-[7px] flex items-center justify-center">
              <Brain className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg text-white tracking-wide">NeuroScan</span>
              <span className="px-1.5 py-0.5 text-xs font-semibold rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                XAI
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Clinical Brain MRI Explainability System</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  active
                    ? 'bg-pacs-800 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-pacs-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* System Metric Pill */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-mono font-medium">DenseNet-121</span>
            <span className="text-slate-400">|</span>
            <span className="font-mono font-bold text-white">95.56% Acc</span>
          </div>

          <span className="text-xs px-2.5 py-1 rounded bg-pacs-800 text-slate-300 border border-pacs-700 font-mono">
            v1.0.0
          </span>
        </div>
      </div>
    </header>
  );
}
