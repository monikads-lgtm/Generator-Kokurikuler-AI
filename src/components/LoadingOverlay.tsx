import React, { useState, useEffect } from 'react';
import { Loader2, Sparkles, BookOpen, Heart, Landmark, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const LOADING_STEPS = [
  { text: 'Menganalisis Parameter Pembelajaran Anda...', icon: Compass },
  { text: 'Menyeimbangkan Dimensi Profil Lulusan Resmi...', icon: BookOpen },
  { text: 'Merumuskan Tujuan Pembelajaran Khusus (Kompetensi & Konten)...', icon: Landmark },
  { text: 'Merancang Rangkaian Kegiatan Lintas Disiplin / Pembiasaan Karakter...', icon: Sparkles },
  { text: 'Mengintegrasikan Kemitraan Catur Pusat (Sekolah, Keluarga, Masyarakat, Media)...', icon: Heart },
  { text: 'Menyusun Rencana Asesmen Formatif & Tabel Rubrik Sumatif...', icon: Loader2 }
];

export default function LoadingOverlay() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const StepIcon = LOADING_STEPS[currentStepIndex].icon;

  return (
    <div id="loading-overlay" className="bg-white/95 backdrop-blur-xs rounded-2xl border border-slate-200 p-8 md:p-12 shadow-sm flex flex-col items-center justify-center min-h-[500px] text-center">
      <div className="relative flex items-center justify-center mb-6">
        <div className="w-16 h-16 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin flex items-center justify-center">
        </div>
        <div className="absolute text-blue-600 animate-pulse">
          <Sparkles className="w-6 h-6" />
        </div>
      </div>

      <h3 className="text-lg font-bold text-slate-900 tracking-tight">
        Kecerdasan Buatan Sedang Merancang Rencana Kokurikuler...
      </h3>
      <p className="text-xs text-slate-500 mt-1 max-w-md">
        Hal ini biasanya memakan waktu sekitar 10-15 detik karena kami merumuskan program yang sangat terstruktur, bermakna, dan siap pakai.
      </p>

      {/* Rotating Steps Banner */}
      <div className="mt-8 bg-slate-50 border border-slate-100 rounded-2xl p-6 max-w-lg w-full min-h-[140px] flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStepIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center"
          >
            <div className="p-2 bg-white rounded-lg shadow-xs text-blue-600 mb-3 border border-slate-100">
              <StepIcon className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
              Langkah {currentStepIndex + 1} dari {LOADING_STEPS.length}
            </span>
            <p className="text-sm text-slate-700 font-medium mt-1.5 leading-relaxed">
              {LOADING_STEPS[currentStepIndex].text}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Mini progress bar dots */}
        <div className="flex justify-center gap-1.5 mt-5">
          {LOADING_STEPS.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentStepIndex ? 'w-5 bg-blue-600' : 'w-1.5 bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="mt-8 text-[11px] text-slate-400 italic">
        "Kokurikuler yang menggembirakan adalah kunci tumbuhnya karakter murid Indonesia Hebat."
      </div>
    </div>
  );
}
