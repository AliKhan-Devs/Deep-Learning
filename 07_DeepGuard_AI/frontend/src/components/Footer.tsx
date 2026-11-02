import React from "react";
import Link from "next/link";
import { Shield, Github, BookOpen, Terminal } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#0d2a45] bg-[#040811] mt-20 py-8 text-xs font-mono text-slate-400">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Terminal className="w-4 h-4 text-hud-cyan" />
          <span className="tracking-wider uppercase">
            DEEPGUARD AI &bull; DEEP LEARNING & COMPUTER VISION FORENSICS &bull; PORTFOLIO SPEC
          </span>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/models" className="hover:text-hud-cyan transition-colors flex items-center gap-1.5 uppercase">
            <BookOpen className="w-3.5 h-3.5 text-hud-cyan" /> COLAB TRAINING MATRIX
          </Link>
          <a
            href="https://github.com/AliKhan-Devs/Deep-Learning"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-hud-cyan transition-colors flex items-center gap-1.5 uppercase"
          >
            <Github className="w-3.5 h-3.5 text-hud-cyan" /> GITHUB REMOTE
          </a>
        </div>
      </div>
    </footer>
  );
};
