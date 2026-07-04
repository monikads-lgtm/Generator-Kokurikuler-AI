import React, { useState, useRef } from 'react';
import { 
  FileText, Clipboard, Check, Printer, RefreshCw, MessageSquare, 
  BookOpen, Landmark, Calendar, Award, ChevronRight, HelpCircle, 
  MapPin, Users, Heart, Share2, AlertCircle, ArrowRight, Download
} from 'lucide-react';
import { LessonPlan } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface LessonPlanViewProps {
  plan: LessonPlan;
  onRefine: (instruction: string) => Promise<void>;
  isRefining: boolean;
}

export default function LessonPlanView({ plan, onRefine, isRefining }: LessonPlanViewProps) {
  const [activeTab, setActiveTab] = useState<'identitas' | 'kerangka' | 'kegiatan' | 'asesmen' | 'raw'>('identitas');
  const [rawViewMode, setRawViewMode] = useState<'paper' | 'markdown'>('paper');
  const [refineText, setRefineText] = useState('');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [showPrintNotice, setShowPrintNotice] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

  const handleCopy = (text: string, type: 'markdown' | 'rubric' | 'all') => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handlePrint = () => {
    if (isInIframe) {
      setShowPrintNotice(true);
    } else {
      window.print();
    }
  };

  const handleDownloadMarkdown = () => {
    const element = document.createElement("a");
    const file = new Blob([plan.fullMarkdown], {type: 'text/markdown;charset=utf-8'});
    element.href = URL.createObjectURL(file);
    const sanitizedTitle = (plan.identitas.tema || 'rencana_kokurikuler')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_');
    element.download = `rpp_kokurikuler_${sanitizedTitle}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCopyToGoogleDocs = async () => {
    // Generate beautiful inline HTML style version of the A4 layout matching the exact design
    const dimensiHtml = plan.dimensi.map(d => `
      <div style="margin-bottom: 14px; padding-left: 14px; border-left: 3px solid #64748b;">
        <p style="font-weight: bold; color: #0f172a; font-size: 14px; margin: 0 0 4px 0; font-family: Arial, sans-serif;">${d.nama}</p>
        <p style="color: #334155; font-size: 13px; margin: 0; line-height: 1.6; font-family: Arial, sans-serif;">${d.deskripsi}</p>
      </div>
    `).join('');

    const tujuanHtml = plan.tujuan.map(t => `
      <li style="margin-bottom: 8px; padding-left: 4px; font-family: Arial, sans-serif; font-size: 13px; color: #334155;">
        <strong>${t}</strong>
      </li>
    `).join('');

    const mapelHtml = plan.bentukKegiatan.mapelTerintegrasi && plan.bentukKegiatan.mapelTerintegrasi.length > 0
      ? `
        <tr style="border-bottom: 1px solid #cbd5e1;">
          <td style="padding: 10px 8px; font-weight: bold; width: 30%; color: #475569; text-transform: uppercase; font-size: 11px; font-family: Arial, sans-serif;">Mata Pelajaran Kolaboratif</td>
          <td style="padding: 10px 8px; font-weight: 600; color: #0f172a; font-family: Arial, sans-serif; font-size: 13px;">${plan.bentukKegiatan.mapelTerintegrasi.join(', ')}</td>
        </tr>
      `
      : '';

    const tahapAwalHtml = plan.kegiatan.tahapAwal.map(act => `
      <li style="margin-bottom: 6px; font-family: Arial, sans-serif; font-size: 13px; color: #334155; line-height: 1.6;">${act}</li>
    `).join('');
    
    const tahapPelaksanaanHtml = plan.kegiatan.tahapPelaksanaan.map(act => `
      <li style="margin-bottom: 6px; font-family: Arial, sans-serif; font-size: 13px; color: #334155; line-height: 1.6;">${act}</li>
    `).join('');

    const tahapRefleksiHtml = plan.kegiatan.tahapRefleksi.map(act => `
      <li style="margin-bottom: 6px; font-family: Arial, sans-serif; font-size: 13px; color: #334155; line-height: 1.6;">${act}</li>
    `).join('');

    const sumatifRowsHtml = plan.asesmen.sumatif.kriteria.map(krit => `
      <tr style="border-bottom: 1px solid #cbd5e1;">
        <td style="padding: 10px; font-weight: bold; border: 1px solid #cbd5e1; background-color: #f8fafc; color: #1e293b; font-family: Arial, sans-serif; font-size: 12px; vertical-align: top;">${krit.namaKriteria}</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1; color: #334155; font-family: Arial, sans-serif; font-size: 12px; vertical-align: top; line-height: 1.5;">${krit.sangatBaik}</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1; color: #334155; font-family: Arial, sans-serif; font-size: 12px; vertical-align: top; line-height: 1.5;">${krit.baik}</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1; color: #334155; font-family: Arial, sans-serif; font-size: 12px; vertical-align: top; line-height: 1.5;">${krit.cukup}</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1; color: #334155; font-family: Arial, sans-serif; font-size: 12px; vertical-align: top; line-height: 1.5;">${krit.kurang}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 800px; margin: 0 auto; padding: 20px;">
        <!-- Kop Surat -->
        <div style="text-align: center; border-bottom: 4px double #0f172a; padding-bottom: 15px; margin-bottom: 30px;">
          <h2 style="font-size: 18px; font-weight: bold; color: #0f172a; margin: 0; text-transform: uppercase; font-family: Arial, sans-serif;">
            RENCANA PROGRAM PEMBELAJARAN KOKURIKULER (RPP-K)
          </h2>
          <h3 style="font-size: 15px; font-weight: bold; color: #334155; margin: 6px 0 0 0; text-transform: uppercase; font-family: Arial, sans-serif;">
            ${plan.identitas.namaSekolah || 'SEKOLAH HEBAT'}
          </h3>
          <p style="font-size: 11px; color: #64748b; margin: 6px 0 0 0; font-weight: 500; font-family: Arial, sans-serif;">
            TAHUN AJARAN 2026/2027 • IMPLEMENTASI KURIKULUM MERDEKA
          </p>
        </div>

        <!-- Identitas -->
        <div style="margin-bottom: 30px;">
          <h4 style="font-size: 13px; font-weight: bold; color: #0f172a; background-color: #f1f5f9; padding: 8px 12px; border-radius: 6px; margin: 0 0 15px 0; text-transform: uppercase; font-family: Arial, sans-serif;">
            IDENTITAS PROGRAM
          </h4>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tbody>
              <tr style="border-bottom: 1px solid #cbd5e1;">
                <td style="padding: 10px 8px; font-weight: bold; width: 30%; color: #475569; text-transform: uppercase; font-size: 11px; font-family: Arial, sans-serif;">Satuan Pendidikan</td>
                <td style="padding: 10px 8px; font-weight: 600; color: #0f172a; font-family: Arial, sans-serif; font-size: 13px;">${plan.identitas.namaSekolah}</td>
              </tr>
              <tr style="border-bottom: 1px solid #cbd5e1;">
                <td style="padding: 10px 8px; font-weight: bold; width: 30%; color: #475569; text-transform: uppercase; font-size: 11px; font-family: Arial, sans-serif;">Jenjang / Kelas / Fase</td>
                <td style="padding: 10px 8px; font-weight: 600; color: #0f172a; font-family: Arial, sans-serif; font-size: 13px;">${plan.identitas.kelasFase}</td>
              </tr>
              <tr style="border-bottom: 1px solid #cbd5e1;">
                <td style="padding: 10px 8px; font-weight: bold; width: 30%; color: #475569; text-transform: uppercase; font-size: 11px; font-family: Arial, sans-serif;">Tema Utama Kokurikuler</td>
                <td style="padding: 10px 8px; font-weight: 600; color: #0f172a; font-family: Arial, sans-serif; font-size: 13px;">${plan.identitas.tema}</td>
              </tr>
              <tr style="border-bottom: 1px solid #cbd5e1;">
                <td style="padding: 10px 8px; font-weight: bold; width: 30%; color: #475569; text-transform: uppercase; font-size: 11px; font-family: Arial, sans-serif;">Alokasi Waktu</td>
                <td style="padding: 10px 8px; font-weight: 600; color: #0f172a; font-family: Arial, sans-serif; font-size: 13px;">${plan.identitas.alokasiWaktu}</td>
              </tr>
              <tr style="border-bottom: 1px solid #cbd5e1;">
                <td style="padding: 10px 8px; font-weight: bold; width: 30%; color: #475569; text-transform: uppercase; font-size: 11px; font-family: Arial, sans-serif;">Bentuk Kegiatan Utama</td>
                <td style="padding: 10px 8px; font-weight: 600; color: #0f172a; font-family: Arial, sans-serif; font-size: 13px;">${plan.bentukKegiatan.jenis}</td>
              </tr>
              ${mapelHtml}
            </tbody>
          </table>
        </div>

        <!-- I. Dimensi -->
        <div style="margin-bottom: 30px;">
          <h4 style="font-size: 13px; font-weight: bold; color: #0f172a; background-color: #f1f5f9; padding: 8px 12px; border-radius: 6px; margin: 0 0 15px 0; text-transform: uppercase; font-family: Arial, sans-serif;">
            I. SASARAN DIMENSI PROFIL LULUSAN
          </h4>
          <div style="padding-top: 4px;">
            ${dimensiHtml}
          </div>
        </div>

        <!-- II. Tujuan -->
        <div style="margin-bottom: 30px;">
          <h4 style="font-size: 13px; font-weight: bold; color: #0f172a; background-color: #f1f5f9; padding: 8px 12px; border-radius: 6px; margin: 0 0 15px 0; text-transform: uppercase; font-family: Arial, sans-serif;">
            II. TUJUAN PEMBELAJARAN KHUSUS
          </h4>
          <ol style="margin: 0; padding-left: 24px; font-size: 13px; color: #334155; line-height: 1.7;">
            ${tujuanHtml}
          </ol>
        </div>

        <!-- III. Bentuk Kegiatan -->
        <div style="margin-bottom: 30px;">
          <h4 style="font-size: 13px; font-weight: bold; color: #0f172a; background-color: #f1f5f9; padding: 8px 12px; border-radius: 6px; margin: 0 0 15px 0; text-transform: uppercase; font-family: Arial, sans-serif;">
            III. BENTUK KEGIATAN & KOLABORASI LINTAS DISIPLIN
          </h4>
          <p style="font-size: 13px; color: #334155; line-height: 1.7; text-align: justify; margin: 0; padding-left: 4px; font-family: Arial, sans-serif;">
            ${plan.bentukKegiatan.detail}
          </p>
        </div>

        <!-- IV. Kerangka Deeper Learning -->
        <div style="margin-bottom: 30px;">
          <h4 style="font-size: 13px; font-weight: bold; color: #0f172a; background-color: #f1f5f9; padding: 8px 12px; border-radius: 6px; margin: 0 0 15px 0; text-transform: uppercase; font-family: Arial, sans-serif;">
            IV. KERANGKA PEMBELAJARAN DEEPER LEARNING
          </h4>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px;">
            <thead>
              <tr style="background-color: #f8fafc;">
                <th style="width: 33.3%; border: 1px solid #cbd5e1; padding: 10px; font-weight: bold; text-align: left; text-transform: uppercase; font-size: 10px; color: #475569; font-family: Arial, sans-serif;">Praktik Pedagogis</th>
                <th style="width: 33.3%; border: 1px solid #cbd5e1; padding: 10px; font-weight: bold; text-align: left; text-transform: uppercase; font-size: 10px; color: #475569; font-family: Arial, sans-serif;">Lingkungan Belajar</th>
                <th style="width: 33.3%; border: 1px solid #cbd5e1; padding: 10px; font-weight: bold; text-align: left; text-transform: uppercase; font-size: 10px; color: #475569; font-family: Arial, sans-serif;">Pemanfaatan Teknologi</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="border: 1px solid #cbd5e1; padding: 12px; color: #334155; vertical-align: top; line-height: 1.6; font-family: Arial, sans-serif; font-size: 12px;">${plan.kerangka.praktikPedagogis}</td>
                <td style="border: 1px solid #cbd5e1; padding: 12px; color: #334155; vertical-align: top; line-height: 1.6; font-family: Arial, sans-serif; font-size: 12px;">${plan.kerangka.lingkungan}</td>
                <td style="border: 1px solid #cbd5e1; padding: 12px; color: #334155; vertical-align: top; line-height: 1.6; font-family: Arial, sans-serif; font-size: 12px;">${plan.kerangka.teknologi}</td>
              </tr>
            </tbody>
          </table>
          
          <p style="font-size: 11px; font-weight: bold; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 10px 0; font-family: Arial, sans-serif;">Kemitraan Catur Pusat:</p>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <tbody>
              <tr>
                <td style="width: 50%; padding: 8px 15px 8px 0; vertical-align: top;">
                  <div style="border-left: 3px solid #10b981; padding-left: 10px;">
                    <strong style="color: #0f172a; font-size: 12px; display: block; margin-bottom: 4px; font-family: Arial, sans-serif;">1. Sekolah (Pendidik)</strong>
                    <span style="color: #475569; line-height: 1.5; font-family: Arial, sans-serif;">${plan.kerangka.kemitraan.sekolah}</span>
                  </div>
                </td>
                <td style="width: 50%; padding: 8px 0 8px 15px; vertical-align: top;">
                  <div style="border-left: 3px solid #10b981; padding-left: 10px;">
                    <strong style="color: #0f172a; font-size: 12px; display: block; margin-bottom: 4px; font-family: Arial, sans-serif;">2. Keluarga (Orang Tua)</strong>
                    <span style="color: #475569; line-height: 1.5; font-family: Arial, sans-serif;">${plan.kerangka.kemitraan.keluarga}</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="width: 50%; padding: 8px 15px 8px 0; vertical-align: top;">
                  <div style="border-left: 3px solid #10b981; padding-left: 10px;">
                    <strong style="color: #0f172a; font-size: 12px; display: block; margin-bottom: 4px; font-family: Arial, sans-serif;">3. Masyarakat (Mitra / Komunitas)</strong>
                    <span style="color: #475569; line-height: 1.5; font-family: Arial, sans-serif;">${plan.kerangka.kemitraan.masyarakat}</span>
                  </div>
                </td>
                <td style="width: 50%; padding: 8px 0 8px 15px; vertical-align: top;">
                  <div style="border-left: 3px solid #10b981; padding-left: 10px;">
                    <strong style="color: #0f172a; font-size: 12px; display: block; margin-bottom: 4px; font-family: Arial, sans-serif;">4. Media (Komunikasi / Digital)</strong>
                    <span style="color: #475569; line-height: 1.5; font-family: Arial, sans-serif;">${plan.kerangka.kemitraan.media}</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- V. Rangkaian Kegiatan -->
        <div style="margin-bottom: 30px;">
          <h4 style="font-size: 13px; font-weight: bold; color: #0f172a; background-color: #f1f5f9; padding: 8px 12px; border-radius: 6px; margin: 0 0 15px 0; text-transform: uppercase; font-family: Arial, sans-serif;">
            V. ALUR DAN RANGKAIAN KEGIATAN PEMBELAJARAN
          </h4>
          
          <div style="margin-bottom: 20px;">
            <h5 style="font-size: 13px; font-weight: bold; color: #1e293b; margin: 0 0 10px 0; text-transform: uppercase; font-family: Arial, sans-serif;">
              A. Tahap Awal (Peluncuran & Membangun Kesepakatan)
            </h5>
            <ul style="margin: 0; padding-left: 24px; font-size: 13px; color: #334155; line-height: 1.7; font-family: Arial, sans-serif;">
              ${tahapAwalHtml}
            </ul>
          </div>

          <div style="margin-bottom: 20px;">
            <h5 style="font-size: 13px; font-weight: bold; color: #1e293b; margin: 0 0 10px 0; text-transform: uppercase; font-family: Arial, sans-serif;">
              B. Tahap Pelaksanaan (Aksi Nyata & Kolaborasi)
            </h5>
            <ul style="margin: 0; padding-left: 24px; font-size: 13px; color: #334155; line-height: 1.7; font-family: Arial, sans-serif;">
              ${tahapPelaksanaanHtml}
            </ul>
          </div>

          <div style="margin-bottom: 20px;">
            <h5 style="font-size: 13px; font-weight: bold; color: #1e293b; margin: 0 0 10px 0; text-transform: uppercase; font-family: Arial, sans-serif;">
              C. Tahap Refleksi, Evaluasi & Diseminasi (Pameran Karya)
            </h5>
            <ul style="margin: 0; padding-left: 24px; font-size: 13px; color: #334155; line-height: 1.7; font-family: Arial, sans-serif;">
              ${tahapRefleksiHtml}
            </ul>
          </div>
        </div>

        <!-- VI. Asesmen -->
        <div style="margin-bottom: 30px;">
          <h4 style="font-size: 13px; font-weight: bold; color: #0f172a; background-color: #f1f5f9; padding: 8px 12px; border-radius: 6px; margin: 0 0 15px 0; text-transform: uppercase; font-family: Arial, sans-serif;">
            VI. RENCANA ASESMEN & RUBRIK SUMATIF
          </h4>
          
          <div style="margin-bottom: 20px;">
            <p style="font-size: 13px; font-weight: bold; color: #0f172a; margin: 0 0 6px 0; font-family: Arial, sans-serif;">A. Asesmen Formatif (Penilaian Proses):</p>
            <p style="font-size: 13px; color: #334155; line-height: 1.6; margin: 0; padding-left: 4px; font-family: Arial, sans-serif;">${plan.asesmen.formatif}</p>
          </div>

          <div>
            <p style="font-size: 13px; font-weight: bold; color: #0f172a; margin: 0 0 10px 0; font-family: Arial, sans-serif;">B. Asesmen Sumatif (Rubrik Kinerja):</p>
            <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 10px;">
              <thead>
                <tr style="background-color: #f8fafc; border-bottom: 2px solid #cbd5e1;">
                  <th style="padding: 10px; font-weight: bold; text-align: left; border: 1px solid #cbd5e1; width: 20%; color: #334155; font-family: Arial, sans-serif;">Kriteria</th>
                  <th style="padding: 10px; font-weight: bold; text-align: left; border: 1px solid #cbd5e1; width: 20%; background-color: #ecfdf5; color: #065f46; font-family: Arial, sans-serif;">Sangat Baik (A)</th>
                  <th style="padding: 10px; font-weight: bold; text-align: left; border: 1px solid #cbd5e1; width: 20%; background-color: #eff6ff; color: #1e40af; font-family: Arial, sans-serif;">Baik (B)</th>
                  <th style="padding: 10px; font-weight: bold; text-align: left; border: 1px solid #cbd5e1; width: 20%; background-color: #fffbeb; color: #92400e; font-family: Arial, sans-serif;">Cukup (C)</th>
                  <th style="padding: 10px; font-weight: bold; text-align: left; border: 1px solid #cbd5e1; width: 20%; background-color: #fff1f2; color: #9f1239; font-family: Arial, sans-serif;">Kurang (D)</th>
                </tr>
              </thead>
              <tbody>
                ${sumatifRowsHtml}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Signatures -->
        <table style="width: 100%; border-collapse: collapse; margin-top: 60px; font-size: 13px;">
          <tbody>
            <tr>
              <td style="width: 50%; text-align: center; padding-bottom: 70px; font-family: Arial, sans-serif;">
                Mengetahui,<br>
                <strong style="color: #0f172a;">Kepala Sekolah</strong>
              </td>
              <td style="width: 50%; text-align: center; padding-bottom: 70px; font-family: Arial, sans-serif;">
                Mengetahui,<br>
                <strong style="color: #0f172a;">Koordinator Kokurikuler</strong>
              </td>
            </tr>
            <tr>
              <td style="width: 50%; text-align: center; font-family: Arial, sans-serif;">
                <span style="text-decoration: underline; font-weight: bold; color: #0f172a;">__________________________</span><br>
                <span style="font-size: 11px; color: #64748b;">NIP. ........................................</span>
              </td>
              <td style="width: 50%; text-align: center; font-family: Arial, sans-serif;">
                <span style="text-decoration: underline; font-weight: bold; color: #0f172a;">__________________________</span><br>
                <span style="font-size: 11px; color: #64748b;">NIP. ........................................</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    `;

    try {
      // Use ClipboardItem for browser support copy-paste rich html text
      const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
      const textBlob = new Blob([plan.fullMarkdown], { type: 'text/plain' });
      const item = new ClipboardItem({
        'text/html': htmlBlob,
        'text/plain': textBlob
      });
      await navigator.clipboard.write([item]);
      setCopiedText('gdocs');
      setTimeout(() => setCopiedText(null), 3000);
    } catch (err) {
      console.error('Failed to copy html to clipboard:', err);
      // Fallback
      navigator.clipboard.writeText(plan.fullMarkdown);
      setCopiedText('gdocs');
      setTimeout(() => setCopiedText(null), 3000);
    }

    // Direct redirection to Google Docs creation page
    window.open('https://docs.google.com/document/u/0/create', '_blank');
  };

  const handleRefineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refineText.trim() || isRefining) return;
    onRefine(refineText);
    setRefineText('');
  };

  const handleQuickRefine = (instruction: string) => {
    if (isRefining) return;
    onRefine(instruction);
  };

  // Convert Rubric to Markdown Table for easy copy-pasting
  const getRubricMarkdown = () => {
    let md = "| Kriteria Penilaian | Sangat Baik | Baik | Cukup | Kurang |\n";
    md += "| --- | --- | --- | --- | --- |\n";
    plan.asesmen.sumatif.kriteria.forEach(k => {
      md += `| **${k.namaKriteria}** | ${k.sangatBaik} | ${k.baik} | ${k.cukup} | ${k.kurang} |\n`;
    });
    return md;
  };

  return (
    <div id="lesson-plan-view-container" className="space-y-6">
      {/* Top action header for document */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
            DOKUMEN DIHASILKAN
          </span>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
            Rencana Kegiatan Kokurikuler
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
            <span className="font-semibold text-slate-700">{plan.identitas.namaSekolah}</span> • {plan.identitas.kelasFase}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleCopy(plan.fullMarkdown, 'markdown')}
            className="px-3.5 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 border border-blue-200 hover:bg-blue-50/50 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copiedText === 'markdown' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                <span>Tersalin!</span>
              </>
            ) : (
              <>
                <Clipboard className="w-3.5 h-3.5" />
                <span>Salin Markdown</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadMarkdown}
            className="px-3.5 py-1.5 text-xs font-medium text-emerald-700 hover:text-emerald-800 border border-emerald-200 hover:bg-emerald-50 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh (.md)</span>
          </button>

          <button
            onClick={handleCopyToGoogleDocs}
            className="px-3.5 py-1.5 text-xs font-semibold text-blue-700 hover:text-blue-800 border border-blue-200 hover:bg-blue-50/80 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer bg-blue-50/30 shadow-xs"
            title="Salin RPP format rapi (A4) dan buka Google Docs otomatis"
          >
            {copiedText === 'gdocs' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 animate-bounce" />
                <span className="text-emerald-700 font-bold">Format A4 Tersalin!</span>
              </>
            ) : (
              <>
                <FileText className="w-3.5 h-3.5 text-blue-500" />
                <span>Salin & Buka Google Docs</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Rencana</span>
          </button>
        </div>
      </div>

      {/* Primary document tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto bg-slate-50/50 rounded-xl p-1 gap-1">
        <button
          onClick={() => setActiveTab('identitas')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all shrink-0 cursor-pointer ${
            activeTab === 'identitas'
              ? 'bg-white text-blue-600 shadow-xs border border-slate-200'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          1. Identitas & Tujuan
        </button>
        <button
          onClick={() => setActiveTab('kerangka')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all shrink-0 cursor-pointer ${
            activeTab === 'kerangka'
              ? 'bg-white text-blue-600 shadow-xs border border-slate-200'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          2. Kerangka & Kemitraan
        </button>
        <button
          onClick={() => setActiveTab('kegiatan')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all shrink-0 cursor-pointer ${
            activeTab === 'kegiatan'
              ? 'bg-white text-blue-600 shadow-xs border border-slate-200'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          3. Rangkaian Kegiatan
        </button>
        <button
          onClick={() => setActiveTab('asesmen')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all shrink-0 cursor-pointer ${
            activeTab === 'asesmen'
              ? 'bg-white text-blue-600 shadow-xs border border-slate-200'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          4. Asesmen & Rubrik
        </button>
        <button
          onClick={() => setActiveTab('raw')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all shrink-0 cursor-pointer ${
            activeTab === 'raw'
              ? 'bg-white text-blue-600 shadow-xs border border-slate-200'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Dokumen Utuh (Markdown)
        </button>
      </div>

      {/* Tabs Content */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs min-h-[400px]">
        {activeTab === 'identitas' && (
          <div className="space-y-6 animate-fadeIn">
            {/* 1. Identitas Grid */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-3 tracking-tight flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-blue-500" />
                I. IDENTITAS PROGRAM KOKURIKULER
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Sekolah</span>
                  <span className="text-xs font-semibold text-slate-800 mt-1 block">{plan.identitas.namaSekolah}</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Jenjang/Kelas</span>
                  <span className="text-xs font-semibold text-slate-800 mt-1 block">{plan.identitas.kelasFase}</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Tema Utama</span>
                  <span className="text-xs font-semibold text-slate-800 mt-1 block">{plan.identitas.tema}</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Alokasi Waktu</span>
                  <span className="text-xs font-semibold text-slate-800 mt-1 block">{plan.identitas.alokasiWaktu}</span>
                </div>
              </div>
            </div>

            {/* 2. Dimensi Profil Lulusan */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-3 tracking-tight flex items-center gap-1.5">
                <Award className="w-4 h-4 text-indigo-500" />
                II. DIMENSI PROFIL LULUSAN YANG DISASAR
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plan.dimensi.map((d, index) => (
                  <div key={index} className="p-4 bg-indigo-50/30 border border-indigo-100/50 rounded-xl flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{d.nama}</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{d.deskripsi}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Bentuk Kegiatan */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-3 tracking-tight flex items-center gap-1.5">
                <Landmark className="w-4 h-4 text-emerald-500" />
                III. BENTUK KEGIATAN KOKURIKULER
              </h3>
              <div className="p-4 bg-emerald-50/30 border border-emerald-100/50 rounded-xl space-y-3">
                <div>
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block bg-emerald-100/60 px-2 py-0.5 rounded-md w-max">
                    {plan.bentukKegiatan.jenis}
                  </span>
                  <p className="text-xs text-slate-700 mt-2.5 leading-relaxed font-medium">
                    {plan.bentukKegiatan.detail}
                  </p>
                </div>

                {plan.bentukKegiatan.mapelTerintegrasi && plan.bentukKegiatan.mapelTerintegrasi.length > 0 && (
                  <div className="border-t border-emerald-100/40 pt-2.5 mt-2.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">
                      Mata Pelajaran yang Berkolaborasi Lintas Disiplin:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {plan.bentukKegiatan.mapelTerintegrasi.map((m, idx) => (
                        <span key={idx} className="px-2.5 py-0.5 rounded-md bg-white border border-emerald-100 text-emerald-800 text-[10px] font-semibold">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 4. Tujuan Pembelajaran */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-3 tracking-tight flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-500" />
                IV. TUJUAN PEMBELAJARAN KOKURIKULER
              </h3>
              <div className="space-y-2">
                {plan.tujuan.map((t, idx) => (
                  <div key={idx} className="p-3 bg-amber-50/20 border border-amber-100/40 rounded-xl flex items-start gap-3">
                    <ChevronRight className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">{t}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'kerangka' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-3 tracking-tight">
                V. KERANGKA PEMBELAJARAN MENDALAM (DEEPER LEARNING)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-blue-600 uppercase block tracking-wider">Praktik Pedagogis</span>
                  <h4 className="text-xs font-bold text-slate-900 mt-1">{plan.kerangka.praktikPedagogis}</h4>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase block tracking-wider">Lingkungan Pembelajaran</span>
                  <h4 className="text-xs font-bold text-slate-900 mt-1">{plan.kerangka.lingkungan}</h4>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase block tracking-wider">Teknologi Digital</span>
                  <h4 className="text-xs font-bold text-slate-900 mt-1">{plan.kerangka.teknologi}</h4>
                </div>
              </div>

              {/* Catur Pusat Partnerships */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-3 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" /> Kemitraan Pembelajaran Catur Pusat:
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4.5 bg-sky-50/20 border border-sky-100/50 rounded-2xl">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-sky-100 text-sky-800 uppercase tracking-wider">
                      Sekolah (Pendidik)
                    </span>
                    <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">{plan.kerangka.kemitraan.sekolah}</p>
                  </div>

                  <div className="p-4.5 bg-rose-50/20 border border-rose-100/50 rounded-2xl">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-100 text-rose-800 uppercase tracking-wider">
                      Keluarga (Orang Tua)
                    </span>
                    <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">{plan.kerangka.kemitraan.keluarga}</p>
                  </div>

                  <div className="p-4.5 bg-amber-50/20 border border-amber-100/50 rounded-2xl">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wider">
                      Masyarakat (Mitra/Tokoh)
                    </span>
                    <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">{plan.kerangka.kemitraan.masyarakat}</p>
                  </div>

                  <div className="p-4.5 bg-emerald-50/20 border border-emerald-100/50 rounded-2xl">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                      Media (Sosial/Konvensional)
                    </span>
                    <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">{plan.kerangka.kemitraan.media}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'kegiatan' && (
          <div className="space-y-6 animate-fadeIn">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4 tracking-tight">
              VI. RANGKAIAN KEGIATAN KOKURIKULER (LANGKAH SISTEMATIS)
            </h3>

            <div className="relative border-l border-slate-200 pl-6 ml-3 space-y-8">
              {/* Stage 1 */}
              <div className="relative">
                <div className="absolute -left-[31px] top-0.5 w-6 h-6 rounded-full bg-blue-100 text-blue-600 border-2 border-white flex items-center justify-center text-xs font-bold shadow-xs">
                  A
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    Tahap Awal / Membangun Kesepakatan
                    <span className="text-[10px] font-medium text-slate-400 capitalize">(Membangun Kesadaran Murid)</span>
                  </h4>
                  <div className="mt-3 bg-slate-50/70 border border-slate-100/80 rounded-xl p-4 space-y-2.5">
                    {plan.kegiatan.tahapAwal.map((act, i) => (
                      <div key={i} className="text-xs text-slate-700 leading-relaxed flex items-start gap-2">
                        <span className="text-blue-500 font-semibold shrink-0">•</span>
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stage 2 */}
              <div className="relative">
                <div className="absolute -left-[31px] top-0.5 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 border-2 border-white flex items-center justify-center text-xs font-bold shadow-xs">
                  B
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    Tahap Pelaksanaan / Pembiasaan / Aksi Nyata
                    <span className="text-[10px] font-medium text-slate-400 capitalize">(Implementasi Lapangan)</span>
                  </h4>
                  <div className="mt-3 bg-slate-50/70 border border-slate-100/80 rounded-xl p-4 space-y-2.5">
                    {plan.kegiatan.tahapPelaksanaan.map((act, i) => (
                      <div key={i} className="text-xs text-slate-700 leading-relaxed flex items-start gap-2">
                        <span className="text-indigo-500 font-semibold shrink-0">•</span>
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stage 3 */}
              <div className="relative">
                <div className="absolute -left-[31px] top-0.5 w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 border-2 border-white flex items-center justify-center text-xs font-bold shadow-xs">
                  C
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    Tahap Refleksi, Evaluasi & Diseminasi
                    <span className="text-[10px] font-medium text-slate-400 capitalize">(Pameran & Penguatan Karakter)</span>
                  </h4>
                  <div className="mt-3 bg-slate-50/70 border border-slate-100/80 rounded-xl p-4 space-y-2.5">
                    {plan.kegiatan.tahapRefleksi.map((act, i) => (
                      <div key={i} className="text-xs text-slate-700 leading-relaxed flex items-start gap-2">
                        <span className="text-emerald-500 font-semibold shrink-0">•</span>
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'asesmen' && (
          <div className="space-y-6 animate-fadeIn">
            {/* 1. Formatif */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-3 tracking-tight">
                VII. RENCANA ASESMEN FORMATIF
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed p-4 bg-slate-50 border border-slate-100 rounded-xl">
                {plan.asesmen.formatif}
              </p>
            </div>

            {/* 2. Sumatif (Rubrik Kinerja Table) */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2 mb-3">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  VIII. RUBRIK PENILAIAN SUMATIF (KINERJA AKTIVITAS)
                </h3>
                
                <button
                  onClick={() => handleCopy(getRubricMarkdown(), 'rubric')}
                  className="px-2.5 py-1 text-[10px] font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer w-max"
                >
                  {copiedText === 'rubric' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>Rubrik Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Clipboard className="w-3 h-3" />
                      <span>Salin Tabel (Siap ke Word)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Styled Table responsive wrapper */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="p-3 font-semibold text-slate-700 w-1/5 min-w-[120px]">Kriteria Penilaian</th>
                      <th className="p-3 font-semibold text-emerald-700 bg-emerald-50/30 w-1/5 min-w-[150px]">Sangat Baik</th>
                      <th className="p-3 font-semibold text-blue-700 bg-blue-50/30 w-1/5 min-w-[150px]">Baik</th>
                      <th className="p-3 font-semibold text-amber-700 bg-amber-50/30 w-1/5 min-w-[150px]">Cukup</th>
                      <th className="p-3 font-semibold text-rose-700 bg-rose-50/30 w-1/5 min-w-[150px]">Kurang</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plan.asesmen.sumatif.kriteria.map((krit, idx) => (
                      <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/30 transition-colors">
                        <td className="p-3 font-bold text-slate-800">{krit.namaKriteria}</td>
                        <td className="p-3 text-slate-600 bg-emerald-50/10 leading-relaxed">{krit.sangatBaik}</td>
                        <td className="p-3 text-slate-600 bg-blue-50/10 leading-relaxed">{krit.baik}</td>
                        <td className="p-3 text-slate-600 bg-amber-50/10 leading-relaxed">{krit.cukup}</td>
                        <td className="p-3 text-slate-600 bg-rose-50/10 leading-relaxed">{krit.kurang}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'raw' && (
          <div className="space-y-6 animate-fadeIn">
            {/* View Mode Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-500" />
                  DOKUMEN UTUH & PRATINJAU CETAK
                </h3>
                <p className="text-[10px] text-slate-500">Lihat rencana pembelajaran dalam tampilan dokumen siap cetak atau salin kode Markdown asli.</p>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="bg-slate-100 p-1 rounded-xl flex gap-1 border border-slate-200">
                  <button
                    onClick={() => setRawViewMode('paper')}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      rawViewMode === 'paper'
                        ? 'bg-white text-blue-600 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    📋 Pratinjau Cetak (A4)
                  </button>
                  <button
                    onClick={() => setRawViewMode('markdown')}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      rawViewMode === 'markdown'
                        ? 'bg-white text-blue-600 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    💻 Kode Markdown
                  </button>
                </div>

                <button
                  onClick={handleCopyToGoogleDocs}
                  className="px-3 py-1.5 text-xs font-semibold text-blue-700 hover:text-blue-800 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  title="Salin RPP format rapi (A4) dan buka Google Docs otomatis"
                >
                  {copiedText === 'gdocs' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 animate-bounce" />
                      <span className="text-emerald-700 font-bold">Format A4 Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-3.5 h-3.5 text-blue-500" />
                      <span>Ekspor ke Google Docs (A4)</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleCopy(plan.fullMarkdown, 'all')}
                  className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedText === 'all' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Clipboard className="w-3.5 h-3.5" />
                      <span>Salin Semua</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {rawViewMode === 'markdown' ? (
              <div className="space-y-2">
                <textarea
                  ref={textRef}
                  readOnly
                  value={plan.fullMarkdown}
                  className="w-full h-[550px] p-4.5 font-mono text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-hidden resize-y leading-relaxed"
                />
              </div>
            ) : (
              /* Simulated continuous white A4 paper page */
              <div className="bg-slate-50 rounded-2xl p-2 md:p-6 border border-slate-200 max-h-[650px] overflow-y-auto">
                <div className="bg-white border border-slate-200 p-6 md:p-12 shadow-sm rounded-xl max-w-4xl mx-auto font-sans leading-relaxed text-slate-800 text-xs md:text-sm space-y-6">
                  {/* Kop Surat Sekolah / Document Header */}
                  <div className="text-center border-b-4 border-double border-slate-800 pb-4 mb-6">
                    <h2 className="text-sm md:text-base font-bold text-slate-900 tracking-tight uppercase">
                      RENCANA PROGRAM PEMBELAJARAN KOKURIKULER (RPP-K)
                    </h2>
                    <h3 className="text-xs md:text-sm font-bold text-slate-800 mt-1 uppercase">
                      {plan.identitas.namaSekolah || 'SEKOLAH HEBAT'}
                    </h3>
                    <p className="text-[9px] md:text-xs text-slate-400 font-medium tracking-wide mt-1">
                      TAHUN AJARAN 2026/2027 • IMPLEMENTASI KURIKULUM MERDEKA
                    </p>
                  </div>

                  {/* Identitas Table */}
                  <div>
                    <h4 className="text-[10px] md:text-xs font-bold text-slate-900 bg-slate-100 px-3 py-1.5 rounded-md mb-3 uppercase tracking-wider">
                      IDENTITAS PROGRAM
                    </h4>
                    <table className="w-full text-xs md:text-sm border-collapse">
                      <tbody>
                        <tr className="border-b border-slate-200">
                          <td className="py-2 font-bold w-1/3 text-slate-500 uppercase tracking-wider text-[9px] md:text-[10px]">Satuan Pendidikan</td>
                          <td className="py-2 font-semibold text-slate-900">{plan.identitas.namaSekolah}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="py-2 font-bold w-1/3 text-slate-500 uppercase tracking-wider text-[9px] md:text-[10px]">Jenjang / Kelas / Fase</td>
                          <td className="py-2 font-semibold text-slate-900">{plan.identitas.kelasFase}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="py-2 font-bold w-1/3 text-slate-500 uppercase tracking-wider text-[9px] md:text-[10px]">Tema Utama Kokurikuler</td>
                          <td className="py-2 font-semibold text-slate-900">{plan.identitas.tema}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="py-2 font-bold w-1/3 text-slate-500 uppercase tracking-wider text-[9px] md:text-[10px]">Alokasi Waktu</td>
                          <td className="py-2 font-semibold text-slate-900">{plan.identitas.alokasiWaktu}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="py-2 font-bold w-1/3 text-slate-500 uppercase tracking-wider text-[9px] md:text-[10px]">Bentuk Kegiatan Utama</td>
                          <td className="py-2 font-semibold text-slate-900">{plan.bentukKegiatan.jenis}</td>
                        </tr>
                        {plan.bentukKegiatan.mapelTerintegrasi && plan.bentukKegiatan.mapelTerintegrasi.length > 0 && (
                          <tr className="border-b border-slate-200">
                            <td className="py-2 font-bold w-1/3 text-slate-500 uppercase tracking-wider text-[9px] md:text-[10px]">Mata Pelajaran Kolaboratif</td>
                            <td className="py-2 font-semibold text-slate-900">{plan.bentukKegiatan.mapelTerintegrasi.join(', ')}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Section I: Dimensi */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] md:text-xs font-bold text-slate-900 bg-slate-100 px-3 py-1.5 rounded-md uppercase tracking-wider">
                      I. SASARAN DIMENSI PROFIL LULUSAN
                    </h4>
                    <div className="space-y-3 pt-1">
                      {plan.dimensi.map((d, i) => (
                        <div key={i} className="text-xs md:text-sm pl-4 border-l-2 border-slate-300">
                          <p className="font-bold text-slate-950">{d.nama}</p>
                          <p className="text-slate-600 mt-0.5 leading-relaxed">{d.deskripsi}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section II: Tujuan */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] md:text-xs font-bold text-slate-900 bg-slate-100 px-3 py-1.5 rounded-md uppercase tracking-wider">
                      II. TUJUAN PEMBELAJARAN KHUSUS
                    </h4>
                    <ol className="list-decimal list-inside space-y-2 text-xs md:text-sm pl-2 pt-1 leading-relaxed text-slate-700">
                      {plan.tujuan.map((t, i) => (
                        <li key={i} className="pl-1">
                          <span className="font-medium text-slate-800">{t}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Section III: Bentuk Kegiatan */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] md:text-xs font-bold text-slate-900 bg-slate-100 px-3 py-1.5 rounded-md uppercase tracking-wider">
                      III. BENTUK KEGIATAN & KOLABORASI LINTAS DISIPLIN
                    </h4>
                    <p className="text-xs md:text-sm text-slate-700 leading-relaxed text-justify pt-1 pl-1">
                      {plan.bentukKegiatan.detail}
                    </p>
                  </div>

                  {/* Section IV: Kerangka Deeper Learning */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] md:text-xs font-bold text-slate-900 bg-slate-100 px-3 py-1.5 rounded-md uppercase tracking-wider">
                      IV. KERANGKA PEMBELAJARAN DEEPER LEARNING
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <p className="font-bold text-slate-800 uppercase text-[9px] mb-1">Praktik Pedagogis</p>
                        <p className="text-slate-600 leading-relaxed">{plan.kerangka.praktikPedagogis}</p>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <p className="font-bold text-slate-800 uppercase text-[9px] mb-1">Lingkungan Belajar</p>
                        <p className="text-slate-600 leading-relaxed">{plan.kerangka.lingkungan}</p>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <p className="font-bold text-slate-800 uppercase text-[9px] mb-1">Pemanfaatan Teknologi</p>
                        <p className="text-slate-600 leading-relaxed">{plan.kerangka.teknologi}</p>
                      </div>
                    </div>
                    
                    <div className="mt-2 space-y-2">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">Kemitraan Catur Pusat:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="pl-3 border-l-2 border-emerald-500">
                          <p className="font-bold text-slate-800 text-[10px]">1. Sekolah (Pendidik)</p>
                          <p className="text-slate-600 mt-0.5 leading-relaxed">{plan.kerangka.kemitraan.sekolah}</p>
                        </div>
                        <div className="pl-3 border-l-2 border-emerald-500">
                          <p className="font-bold text-slate-800 text-[10px]">2. Keluarga (Orang Tua)</p>
                          <p className="text-slate-600 mt-0.5 leading-relaxed">{plan.kerangka.kemitraan.keluarga}</p>
                        </div>
                        <div className="pl-3 border-l-2 border-emerald-500">
                          <p className="font-bold text-slate-800 text-[10px]">3. Masyarakat (Mitra / Komunitas)</p>
                          <p className="text-slate-600 mt-0.5 leading-relaxed">{plan.kerangka.kemitraan.masyarakat}</p>
                        </div>
                        <div className="pl-3 border-l-2 border-emerald-500">
                          <p className="font-bold text-slate-800 text-[10px]">4. Media (Komunikasi / Digital)</p>
                          <p className="text-slate-600 mt-0.5 leading-relaxed">{plan.kerangka.kemitraan.media}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section V: Rangkaian Kegiatan */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] md:text-xs font-bold text-slate-900 bg-slate-100 px-3 py-1.5 rounded-md uppercase tracking-wider">
                      V. ALUR DAN RANGKAIAN KEGIATAN PEMBELAJARAN
                    </h4>
                    
                    <div className="space-y-3 pt-1">
                      <div>
                        <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wide mb-1.5 pl-1">
                          A. Tahap Awal (Peluncuran & Membangun Kesepakatan)
                        </h5>
                        <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-600 pl-3 leading-relaxed">
                          {plan.kegiatan.tahapAwal.map((act, i) => (
                            <li key={i}>{act}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-2">
                        <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wide mb-1.5 pl-1">
                          B. Tahap Pelaksanaan (Aksi Nyata & Kolaborasi)
                        </h5>
                        <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-600 pl-3 leading-relaxed">
                          {plan.kegiatan.tahapPelaksanaan.map((act, i) => (
                            <li key={i}>{act}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-2">
                        <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wide mb-1.5 pl-1">
                          C. Tahap Refleksi, Evaluasi & Diseminasi (Pameran Karya)
                        </h5>
                        <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-600 pl-3 leading-relaxed">
                          {plan.kegiatan.tahapRefleksi.map((act, i) => (
                            <li key={i}>{act}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Section VI: Asesmen */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] md:text-xs font-bold text-slate-900 bg-slate-100 px-3 py-1.5 rounded-md uppercase tracking-wider">
                      VI. RENCANA ASESMEN & RUBRIK SUMATIF
                    </h4>
                    
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-slate-800 pl-1">A. Asesmen Formatif (Penilaian Proses):</p>
                      <p className="text-xs text-slate-600 leading-relaxed pl-1">{plan.asesmen.formatif}</p>
                    </div>

                    <div className="space-y-2 pt-2">
                      <p className="text-xs font-bold text-slate-800 pl-1">B. Asesmen Sumatif (Rubrik Kinerja):</p>
                      <table className="w-full text-left border-collapse text-[10px] md:text-xs mt-1.5">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-300">
                            <th className="p-2 font-bold text-slate-700 border w-1/5">Kriteria</th>
                            <th className="p-2 font-bold text-slate-700 border bg-emerald-50/10 w-1/5">Sangat Baik (A)</th>
                            <th className="p-2 font-bold text-slate-700 border bg-blue-50/10 w-1/5">Baik (B)</th>
                            <th className="p-2 font-bold text-slate-700 border bg-amber-50/10 w-1/5">Cukup (C)</th>
                            <th className="p-2 font-bold text-slate-700 border bg-rose-50/10 w-1/5">Kurang (D)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {plan.asesmen.sumatif.kriteria.map((krit, idx) => (
                            <tr key={idx} className="border-b border-slate-200">
                              <td className="p-2 font-bold text-slate-800 border bg-slate-50/30">{krit.namaKriteria}</td>
                              <td className="p-2 text-slate-600 leading-relaxed border">{krit.sangatBaik}</td>
                              <td className="p-2 text-slate-600 leading-relaxed border">{krit.baik}</td>
                              <td className="p-2 text-slate-600 leading-relaxed border">{krit.cukup}</td>
                              <td className="p-2 text-slate-600 leading-relaxed border">{krit.kurang}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Signatures */}
                  <div className="pt-12 mt-12 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs text-slate-700 text-center">
                    <div>
                      <p className="mb-16">Mengetahui,<br /><span className="font-bold">Kepala Sekolah</span></p>
                      <p className="font-bold underline text-slate-950">__________________________</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">NIP. ........................................</p>
                    </div>
                    <div>
                      <p className="mb-16">Mengetahui,<br /><span className="font-bold">Koordinator Kokurikuler</span></p>
                      <p className="font-bold underline text-slate-950">__________________________</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">NIP. ........................................</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Interactive AI assistant sidebar/chat box */}
      <div id="ai-refine-box" className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-6 shadow-md">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 bg-blue-600/20 text-blue-400 rounded-lg">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Ingin Menyesuaikan Rencana Pembelajaran Ini?
            </h3>
            <p className="text-xs text-slate-400">
              Kecerdasan Buatan kami dapat merevisi modul ini secara langsung sesuai kebutuhan spesifik Anda.
            </p>
          </div>
        </div>

        {/* Quick actions bubbles */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            disabled={isRefining}
            onClick={() => handleQuickRefine('Tambahkan integrasi mata pelajaran Informatika ke dalam kegiatan pelaksanaan.')}
            className="px-2.5 py-1 text-[11px] font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            + Integrasi Informatika
          </button>
          <button
            disabled={isRefining}
            onClick={() => handleQuickRefine('Ubah alokasi waktu menjadi 12 JP dan kembangkan tahapan kegiatannya agar lebih rinci.')}
            className="px-2.5 py-1 text-[11px] font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ⏰ Ubah ke 12 JP
          </button>
          <button
            disabled={isRefining}
            onClick={() => handleQuickRefine('Sederhanakan rubrik penilaian agar hanya memuat 2 kriteria esensial saja.')}
            className="px-2.5 py-1 text-[11px] font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            📉 Sederhanakan Rubrik
          </button>
          <button
            disabled={isRefining}
            onClick={() => handleQuickRefine('Tambahkan langkah konkret pelibatan orang tua pada Tahap Pelaksanaan/Aksi Nyata.')}
            className="px-2.5 py-1 text-[11px] font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            👨‍👩‍👦 Detail Peran Orang Tua
          </button>
        </div>

        {/* Custom chat text area */}
        <form onSubmit={handleRefineSubmit} className="relative flex items-center bg-slate-800 border border-slate-700 rounded-xl focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
          <input
            type="text"
            value={refineText}
            onChange={(e) => setRefineText(e.target.value)}
            disabled={isRefining}
            placeholder={isRefining ? 'Sedang memperbarui...' : 'Tulis instruksi kustom Anda (misal: "Tambahkan tantangan lingkungan hidup di desa")'}
            className="w-full bg-transparent px-4 py-3 text-xs text-white focus:outline-hidden placeholder:text-slate-500 pr-24"
          />
          <button
            type="submit"
            disabled={isRefining || !refineText.trim()}
            className="absolute right-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRefining ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Memproses</span>
              </>
            ) : (
              <>
                <span>Sesuaikan</span>
                <ArrowRight className="w-3 h-3" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Export & save instructions footer */}
      <div id="panduan-save" className="p-4.5 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-emerald-900">Cara Menyimpan ke Microsoft Word / PDF:</h4>
          <ol className="list-decimal list-inside text-xs text-emerald-800 mt-1 space-y-1 leading-relaxed">
            <li>Klik tombol <strong>"Salin Markdown"</strong> atau <strong>"Salin Semua Teks"</strong> di atas.</li>
            <li>Buka <strong>Microsoft Word</strong> atau <strong>Google Docs</strong>, lalu buat dokumen kosong baru.</li>
            <li>Tempelkan teks yang sudah disalin tadi (gunakan shortcut <kbd className="px-1 py-0.5 bg-white border rounded text-[10px]">Ctrl + V</kbd> atau <kbd className="px-1 py-0.5 bg-white border rounded text-[10px]">Cmd + V</kbd>). Tabel rubrik asesmen dan formatnya otomatis akan menyesuaikan dan tertata sangat rapi!</li>
            <li>Anda juga dapat menekan tombol <strong>"Cetak Rencana"</strong> untuk langsung mencetak fisik atau menyimpannya sebagai file PDF langsung melalui browser Anda.</li>
          </ol>
        </div>
      </div>

      {/* Hidden printable document specifically used for @media print */}
      <div id="printable-co-curricular-document" className="hidden print:block bg-white text-slate-900 p-8 md:p-12 font-sans leading-relaxed text-xs space-y-6">
        <div className="text-center border-b-4 border-double border-slate-800 pb-4 mb-6">
          <h2 className="text-base font-bold text-slate-900 tracking-tight uppercase">
            RENCANA PROGRAM PEMBELAJARAN KOKURIKULER (RPP-K)
          </h2>
          <h3 className="text-sm font-bold text-slate-800 mt-1 uppercase">
            {plan.identitas.namaSekolah || 'SEKOLAH HEBAT'}
          </h3>
          <p className="text-[10px] text-slate-500 font-medium tracking-wide mt-1">
            TAHUN AJARAN 2026/2027 • IMPLEMENTASI KURIKULUM MERDEKA
          </p>
        </div>

        <table className="w-full text-xs border-collapse border border-slate-300">
          <tbody>
            <tr className="border-b border-slate-300">
              <td className="p-2 font-bold w-1/3 bg-slate-50 uppercase text-[9px] border-r border-slate-300">Satuan Pendidikan</td>
              <td className="p-2 font-semibold text-slate-900">{plan.identitas.namaSekolah}</td>
            </tr>
            <tr className="border-b border-slate-300">
              <td className="p-2 font-bold w-1/3 bg-slate-50 uppercase text-[9px] border-r border-slate-300">Jenjang / Kelas / Fase</td>
              <td className="p-2 font-semibold text-slate-900">{plan.identitas.kelasFase}</td>
            </tr>
            <tr className="border-b border-slate-300">
              <td className="p-2 font-bold w-1/3 bg-slate-50 uppercase text-[9px] border-r border-slate-300">Tema Utama Kokurikuler</td>
              <td className="p-2 font-semibold text-slate-900">{plan.identitas.tema}</td>
            </tr>
            <tr className="border-b border-slate-300">
              <td className="p-2 font-bold w-1/3 bg-slate-50 uppercase text-[9px] border-r border-slate-300">Alokasi Waktu</td>
              <td className="p-2 font-semibold text-slate-900">{plan.identitas.alokasiWaktu}</td>
            </tr>
            <tr className="border-b border-slate-300">
              <td className="p-2 font-bold w-1/3 bg-slate-50 uppercase text-[9px] border-r border-slate-300">Bentuk Kegiatan Utama</td>
              <td className="p-2 font-semibold text-slate-900">{plan.bentukKegiatan.jenis}</td>
            </tr>
            {plan.bentukKegiatan.mapelTerintegrasi && plan.bentukKegiatan.mapelTerintegrasi.length > 0 && (
              <tr className="border-b border-slate-300">
                <td className="p-2 font-bold w-1/3 bg-slate-50 uppercase text-[9px] border-r border-slate-300">Mata Pelajaran Kolaboratif</td>
                <td className="p-2 font-semibold text-slate-900">{plan.bentukKegiatan.mapelTerintegrasi.join(', ')}</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-900 bg-slate-100 px-3 py-1 border border-slate-200 uppercase tracking-wider">
            I. SASARAN DIMENSI PROFIL LULUSAN
          </h4>
          <div className="space-y-2.5 pt-1">
            {plan.dimensi.map((d, i) => (
              <div key={i} className="text-xs pl-4 border-l-2 border-slate-400">
                <p className="font-bold text-slate-950">{d.nama}</p>
                <p className="text-slate-600 mt-0.5">{d.deskripsi}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-900 bg-slate-100 px-3 py-1 border border-slate-200 uppercase tracking-wider">
            II. TUJUAN PEMBELAJARAN KHUSUS
          </h4>
          <ol className="list-decimal list-inside space-y-1.5 text-xs pl-1.5 pt-1 text-slate-700">
            {plan.tujuan.map((t, i) => (
              <li key={i} className="pl-1">
                <span className="font-medium text-slate-900">{t}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-900 bg-slate-100 px-3 py-1 border border-slate-200 uppercase tracking-wider">
            III. BENTUK KEGIATAN & KOLABORASI LINTAS DISIPLIN
          </h4>
          <p className="text-xs text-slate-700 leading-relaxed text-justify pt-1 pl-1">
            {plan.bentukKegiatan.detail}
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-900 bg-slate-100 px-3 py-1 border border-slate-200 uppercase tracking-wider">
            IV. KERANGKA PEMBELAJARAN DEEPER LEARNING
          </h4>
          <div className="grid grid-cols-3 gap-3 text-xs pt-1">
            <div className="p-2 border border-slate-300 bg-slate-50/50">
              <p className="font-bold text-slate-800 uppercase text-[8px] mb-1">Praktik Pedagogis</p>
              <p className="text-slate-600 leading-relaxed">{plan.kerangka.praktikPedagogis}</p>
            </div>
            <div className="p-2 border border-slate-300 bg-slate-50/50">
              <p className="font-bold text-slate-800 uppercase text-[8px] mb-1">Lingkungan Belajar</p>
              <p className="text-slate-600 leading-relaxed">{plan.kerangka.lingkungan}</p>
            </div>
            <div className="p-2 border border-slate-300 bg-slate-50/50">
              <p className="font-bold text-slate-800 uppercase text-[8px] mb-1">Pemanfaatan Teknologi</p>
              <p className="text-slate-600 leading-relaxed">{plan.kerangka.teknologi}</p>
            </div>
          </div>
          
          <div className="mt-2 space-y-1">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider pl-1">Kemitraan Catur Pusat:</p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="pl-3 border-l border-slate-400">
                <p className="font-bold text-slate-800 text-[9px]">1. Sekolah (Pendidik)</p>
                <p className="text-slate-600 leading-relaxed">{plan.kerangka.kemitraan.sekolah}</p>
              </div>
              <div className="pl-3 border-l border-slate-400">
                <p className="font-bold text-slate-800 text-[9px]">2. Keluarga (Orang Tua)</p>
                <p className="text-slate-600 leading-relaxed">{plan.kerangka.kemitraan.keluarga}</p>
              </div>
              <div className="pl-3 border-l border-slate-400">
                <p className="font-bold text-slate-800 text-[9px]">3. Masyarakat (Mitra / Komunitas)</p>
                <p className="text-slate-600 leading-relaxed">{plan.kerangka.kemitraan.masyarakat}</p>
              </div>
              <div className="pl-3 border-l border-slate-400">
                <p className="font-bold text-slate-800 text-[9px]">4. Media (Komunikasi / Digital)</p>
                <p className="text-slate-600 leading-relaxed">{plan.kerangka.kemitraan.media}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 page-break-before">
          <h4 className="text-xs font-bold text-slate-900 bg-slate-100 px-3 py-1 border border-slate-200 uppercase tracking-wider">
            V. ALUR DAN RANGKAIAN KEGIATAN PEMBELAJARAN
          </h4>
          
          <div className="space-y-3 pt-1">
            <div>
              <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wide mb-1.5 pl-1">
                A. Tahap Awal (Peluncuran & Membangun Kesepakatan)
              </h5>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 pl-3 leading-relaxed">
                {plan.kegiatan.tahapAwal.map((act, i) => (
                  <li key={i}>{act}</li>
                ))}
              </ul>
            </div>

            <div className="pt-1.5">
              <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wide mb-1.5 pl-1">
                B. Tahap Pelaksanaan (Aksi Nyata & Kolaborasi)
              </h5>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 pl-3 leading-relaxed">
                {plan.kegiatan.tahapPelaksanaan.map((act, i) => (
                  <li key={i}>{act}</li>
                ))}
              </ul>
            </div>

            <div className="pt-1.5">
              <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wide mb-1.5 pl-1">
                C. Tahap Refleksi, Evaluasi & Diseminasi (Pameran Karya)
              </h5>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 pl-3 leading-relaxed">
                {plan.kegiatan.tahapRefleksi.map((act, i) => (
                  <li key={i}>{act}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-4 page-break-before">
          <h4 className="text-xs font-bold text-slate-900 bg-slate-100 px-3 py-1 border border-slate-200 uppercase tracking-wider">
            VI. RENCANA ASESMEN & RUBRIK SUMATIF
          </h4>
          
          <div className="space-y-1.5">
            <p className="text-xs font-bold text-slate-800 pl-1">A. Asesmen Formatif (Penilaian Proses):</p>
            <p className="text-xs text-slate-600 leading-relaxed pl-1">{plan.asesmen.formatif}</p>
          </div>

          <div className="space-y-1.5 pt-1.5">
            <p className="text-xs font-bold text-slate-800 pl-1">B. Asesmen Sumatif (Rubrik Kinerja):</p>
            <table className="w-full text-left border-collapse text-[10px] mt-1">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-300">
                  <th className="p-2 font-bold text-slate-700 border border-slate-300 w-1/5">Kriteria</th>
                  <th className="p-2 font-bold text-slate-700 border border-slate-300 bg-emerald-50/10 w-1/5">Sangat Baik (A)</th>
                  <th className="p-2 font-bold text-slate-700 border border-slate-300 bg-blue-50/10 w-1/5">Baik (B)</th>
                  <th className="p-2 font-bold text-slate-700 border border-slate-300 bg-amber-50/10 w-1/5">Cukup (C)</th>
                  <th className="p-2 font-bold text-slate-700 border border-slate-300 bg-rose-50/10 w-1/5">Kurang (D)</th>
                </tr>
              </thead>
              <tbody>
                {plan.asesmen.sumatif.kriteria.map((krit, idx) => (
                  <tr key={idx} className="border-b border-slate-300">
                    <td className="p-2 font-bold text-slate-800 border border-slate-300 bg-slate-50/30">{krit.namaKriteria}</td>
                    <td className="p-2 text-slate-600 leading-relaxed border border-slate-300">{krit.sangatBaik}</td>
                    <td className="p-2 text-slate-600 leading-relaxed border border-slate-300">{krit.baik}</td>
                    <td className="p-2 text-slate-600 leading-relaxed border border-slate-300">{krit.cukup}</td>
                    <td className="p-2 text-slate-600 leading-relaxed border border-slate-300">{krit.kurang}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Signatures for Print */}
        <div className="pt-12 mt-12 border-t border-slate-300 grid grid-cols-2 gap-8 text-xs text-slate-700 text-center avoid-break">
          <div>
            <p className="mb-16">Mengetahui,<br /><span className="font-bold">Kepala Sekolah</span></p>
            <p className="font-bold underline text-slate-900">__________________________</p>
            <p className="text-[10px] text-slate-500 mt-0.5">NIP. ........................................</p>
          </div>
          <div>
            <p className="mb-16">Mengetahui,<br /><span className="font-bold">Koordinator Kokurikuler</span></p>
            <p className="font-bold underline text-slate-900">__________________________</p>
            <p className="text-[10px] text-slate-500 mt-0.5">NIP. ........................................</p>
          </div>
        </div>
      </div>

      {/* Embedded print media style overrides */}
      <style>{`
        @media print {
          /* Hide all screen components, modals, sidebars, headers, instructions, tabs */
          #root > div > *:not(#lesson-plan-view-container),
          #lesson-plan-view-container > div:not(#printable-co-curricular-document),
          #form-section, #app-header, #ai-refine-box, #panduan-save, #panduan-section, footer, button, .flex.border-b {
            display: none !important;
          }
          /* Setup page margins and full size printable card */
          #printable-co-curricular-document {
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            color: #1a1a1a !important;
          }
          .page-break-before {
            page-break-before: always !important;
          }
          .avoid-break {
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      {/* Modal Petunjuk Cetak/Simpan PDF */}
      <AnimatePresence>
        {showPrintNotice && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200"
            >
              {/* Header */}
              <div className="bg-slate-50 px-6 py-4.5 border-b border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg border border-amber-200">
                    <Printer className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-950 text-sm md:text-base">Petunjuk Cetak / Simpan PDF</h3>
                </div>
                <button 
                  onClick={() => setShowPrintNotice(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-lg p-1.5 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                <div className="bg-amber-50/50 rounded-xl p-3.5 border border-amber-200/50 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-xs text-amber-900">Mengapa dialog cetak belum terbuka?</h4>
                    <p className="text-xs text-slate-600 leading-relaxed mt-1">
                      Aplikasi ini berjalan di dalam <strong>panel pratinjau (iframe)</strong> AI Studio yang memiliki pembatasan keamanan ketat dari browser, sehingga perintah cetak langsung dari tombol ini dibatasi oleh browser.
                    </p>
                  </div>
                </div>

                <div className="space-y-3.5">
                  <p className="text-xs font-bold text-slate-800 uppercase tracking-wide">PILIHAN SOLUSI MUDAH & CEPAT:</p>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {/* Opsi 1: Google Docs */}
                    <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200/60 flex gap-3 hover:bg-blue-50/70 transition-all shadow-xs">
                      <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg h-fit border border-blue-200">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-bold text-xs text-blue-950 flex items-center gap-1">
                          <span>1. Ekspor & Tempel di Google Docs (Format Rapi A4)</span>
                          <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">Tercepat & Terapi</span>
                        </h5>
                        <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                          Sistem akan langsung menyalin dokumen lengkap dengan <strong>tata letak A4 yang sangat rapi, kop surat, garis pemisah, tanda tangan, dan tabel berwarna</strong> ke clipboard Anda.
                        </p>
                        <p className="text-[11px] text-slate-700 mt-1 font-semibold">
                          👉 Klik tombol di bawah ini, lalu di Google Docs kosong yang terbuka, tekan saja <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-300 rounded text-[10px] font-mono font-bold text-slate-800">Ctrl + V</kbd> (atau <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-300 rounded text-[10px] font-mono font-bold text-slate-800">Cmd + V</kbd>).
                        </p>
                        <button
                          onClick={() => {
                            handleCopyToGoogleDocs();
                            setShowPrintNotice(false);
                          }}
                          className="mt-3 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-[0.98]"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Salin Format & Buka Google Docs Sekarang</span>
                        </button>
                      </div>
                    </div>

                    {/* Opsi 2: Unduh Markdown */}
                    <div className="p-3.5 bg-emerald-50/30 rounded-xl border border-emerald-100 flex gap-3 hover:bg-emerald-50/50 transition-colors">
                      <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg h-fit border border-emerald-200">
                        <Download className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-bold text-xs text-emerald-950">2. Unduh Dokumen (.md)</h5>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                          Dapatkan file rencana pembelajaran dalam format Markdown. Anda bisa langsung membukanya di <strong>Microsoft Word</strong> atau Google Docs untuk diedit lebih lanjut dan dicetak dengan rapi.
                        </p>
                        <button
                          onClick={() => {
                            handleDownloadMarkdown();
                            setShowPrintNotice(false);
                          }}
                          className="mt-2.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Unduh File Sekarang</span>
                        </button>
                      </div>
                    </div>

                    {/* Opsi 3: Buka di Tab Baru */}
                    <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 flex gap-3">
                      <div className="p-1.5 bg-slate-100 text-slate-600 rounded-lg h-fit border border-slate-200">
                        <Share2 className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-bold text-xs text-slate-900">3. Buka Aplikasi di Tab Baru</h5>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                          Klik tombol <strong>"Buka di tab baru"</strong> di pojok kanan paling atas layar pratinjau Anda. Setelah terbuka penuh di tab mandiri, klik kembali tombol <strong>Cetak Rencana</strong> untuk membuka dialog Simpan PDF browser secara penuh.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setShowPrintNotice(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Tutup Petunjuk
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
