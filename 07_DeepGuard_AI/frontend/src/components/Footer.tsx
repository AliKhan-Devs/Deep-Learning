import React from "react";
import Link from "next/link";
import { Shield, Github, BookOpen } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 mt-20 py-10 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-sky-400" />
          <span>
            DeepGuard AI &bull; Deep Learning & Computer Vision Portfolio &bull; Open-Source
          </span>
        </div>

        <div className="flex items-center gap-6 text-slate-400">
          <Link href="/models" className="hover:text-white transition-colors flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" /> Colab Training Guide
          </Link>
          <a
            href="https://github.com/AliKhan-Devs/Deep-Learning"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Github className="w-4 h-4" /> GitHub Repository
          </a>
        </div>
      </div>
    </footer>
  );
};
