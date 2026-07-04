import React from 'react';
import { Sparkles, GraduationCap, FileText, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function Header() {
  return (
    <header id="app-header" className="border-b border-slate-200 bg-white shadow-xs sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 flex items-center justify-center">
            <GraduationCap className="h-7 w-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Generator Kokurikuler AI
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Rancang Rencana Pembelajaran Kokurikuler instan yang bermakna (meaningful), berkesadaran (mindful), dan menggembirakan (joyful) untuk sekolah Anda.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-4 text-xs text-slate-500 border-r border-slate-200 pr-4">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
              Bermakna (Meaningful)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block"></span>
              Berkesadaran (Mindful)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              Menggembirakan (Joyful)
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <a 
              href="#panduan" 
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById('panduan-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <FileText className="w-3.5 h-3.5" /> Panduan Aplikasi
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
