import React from "react";
import Link from "next/link";
import { ShieldAlert, Github, BookOpen, Layers, BarChart3 } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white mt-16 py-8 text-sm text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-blue-600" />
          <span className="font-semibold text-slate-800">DeepGuard AI</span>
          <span>&bull;</span>
          <span>Multi-Model Deepfake Detection Architecture</span>
        </div>

        <div className="flex items-center gap-6 text-sm">
          <Link href="/arena" className="hover:text-blue-600 transition-colors flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-slate-400" /> 3-Model Arena
          </Link>
          <Link href="/benchmarks" className="hover:text-blue-600 transition-colors flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-slate-400" /> Benchmarks
          </Link>
          <Link href="/models" className="hover:text-blue-600 transition-colors flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-slate-400" /> Models
          </Link>
          <a
            href="https://github.com/AliKhan-Devs/Deep-Learning"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600 transition-colors flex items-center gap-1.5"
          >
            <Github className="w-4 h-4 text-slate-400" /> GitHub Repository
          </a>
        </div>
      </div>
    </footer>
  );
};
