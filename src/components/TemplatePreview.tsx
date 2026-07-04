import React from 'react';
import { Sparkles, Compass, Lightbulb, Heart, BookOpen, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function TemplatePreview() {
  return (
    <div id="template-preview-container" className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-sm flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm tracking-wider uppercase mb-3">
          <Compass className="w-4 h-4 animate-spin-slow" />
          <span>Panduan Penyusunan Modul Kokurikuler</span>
        </div>
        
        <h2 className="text-2xl font-bold text-slate-950 tracking-tight leading-tight">
          Selamat Datang di Generator Kokurikuler!
        </h2>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          Silakan isi formulir parameter di sebelah kiri untuk merancang Rencana Pembelajaran Kokurikuler instan yang memenuhi standar kurikulum nasional 2025 terbaru. 
        </p>

        {/* Core Principles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
          <div className="p-4 bg-slate-50/70 border border-slate-100 rounded-xl">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-2 font-semibold">
              01
            </div>
            <h3 className="text-xs font-semibold text-slate-900 flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5 text-yellow-500" /> Bermakna
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Fokus pada isu nyata dan kontekstual di sekitar kehidupan murid sehari-hari.
            </p>
          </div>

          <div className="p-4 bg-slate-50/70 border border-slate-100 rounded-xl">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2 font-semibold">
              02
            </div>
            <h3 className="text-xs font-semibold text-slate-900 flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-rose-500" /> Berkesadaran
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Membangun kesadaran diri, kepedulian sosial, serta refleksi mendalam atas aksi yang dilakukan.
            </p>
          </div>

          <div className="p-4 bg-slate-50/70 border border-slate-100 rounded-xl">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2 font-semibold">
              03
            </div>
            <h3 className="text-xs font-semibold text-slate-900 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> Menggembirakan
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Menggunakan metode aktif, kolaboratif, dan pameran karya (diseminasi) yang menyenangkan.
            </p>
          </div>
        </div>

        {/* Structural Skeleton Preview */}
        <div className="border border-dashed border-slate-200 rounded-xl p-5 bg-slate-50/30">
          <h4 className="text-xs font-semibold text-slate-400 tracking-wider uppercase mb-3 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" /> Struktur Rencana Pembelajaran yang Akan Dihasilkan:
          </h4>
          
          <ul className="space-y-2.5 text-xs text-slate-500">
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-slate-100 text-slate-600 flex items-center justify-center font-medium">1</span>
              <span><strong>Identitas Program Lengkap:</strong> Alokasi waktu (JP), Fase, Kelas, dan Tema terpilih.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-slate-100 text-slate-600 flex items-center justify-center font-medium">2</span>
              <span><strong>Dimensi Profil Lulusan:</strong> Menjelaskan relevansi spesifik dari 8 dimensi resmi Kemendikdasmen.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-slate-100 text-slate-600 flex items-center justify-center font-medium">3</span>
              <span><strong>Tujuan Pembelajaran Khusus:</strong> Menggabungkan dimensi kompetensi dan konten isu riil.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-slate-100 text-slate-600 flex items-center justify-center font-medium">4</span>
              <span><strong>Kerangka Catur Pusat:</strong> Mengintegrasikan kemitraan Sekolah, Keluarga, Masyarakat, dan Media.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-slate-100 text-slate-600 flex items-center justify-center font-medium">5</span>
              <span><strong>Rangkaian Kegiatan Joyful:</strong> Langkah detail: Tahap Awal, Pelaksanaan, Refleksi & Diseminasi.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-slate-100 text-slate-600 flex items-center justify-center font-medium">6</span>
              <span><strong>Asesmen & Rubrik Sumatif:</strong> Dilengkapi dengan kriteria penilaian formatif dan tabel rubrik kinerja Word-ready.</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-8 pt-4 border-t border-slate-100 flex items-center gap-2 text-amber-600 bg-amber-50/50 p-3.5 rounded-xl border border-amber-100/50">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span className="text-xs leading-relaxed">
          <strong>Tip Pedagogis:</strong> Pilihlah dimensi profil lulusan yang paling relevan dengan kondisi murid Anda. Fokus pada kualitas pembiasaan nyata, bukan sekadar teori di kelas.
        </span>
      </div>
    </div>
  );
}
