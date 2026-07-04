import React, { useState } from 'react';
import { 
  Sparkles, Compass, Lightbulb, Heart, BookOpen, AlertCircle, 
  HelpCircle, ChevronDown, Check, Send, Trash2, RotateCcw,
  School, GraduationCap, Calendar, Info, MapPin
} from 'lucide-react';
import Header from './components/Header';
import TemplatePreview from './components/TemplatePreview';
import LoadingOverlay from './components/LoadingOverlay';
import LessonPlanView from './components/LessonPlanView';
import { 
  FormInput, LessonPlan, OFFICIAL_THEMES, OFFICIAL_DIMENSIONS, 
  BENTUK_KEGIATAN_OPTIONS, GENERAL_SUBJECTS, SEVEN_KAIH_HABITS, 
  PRESET_CLASSES, DISABILITY_TYPES 
} from './types';

export default function App() {
  // Form state
  const [form, setForm] = useState<FormInput>({
    namaSekolah: '',
    kelasFase: PRESET_CLASSES[7], // Default to SMP Kelas VII (Fase D)
    tema: OFFICIAL_THEMES[1].name, // Default to Kearifan Lokal
    alokasiWaktu: '8 JP',
    dimensiList: ['Penalaran Kritis', 'Kolaborasi'], // Default selections
    bentukKegiatan: BENTUK_KEGIATAN_OPTIONS[0].id, // Default to lintas-disiplin
    bentukKegiatanDetail: '',
    mapelTerintegrasi: ['Bahasa Indonesia', 'IPA (Ilmu Pengetahuan Alam)'],
    catatanTambahan: '',
    jenisKetunaan: DISABILITY_TYPES[0]
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<LessonPlan | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Toggle multiple dimensions
  const handleDimensionToggle = (dimName: string) => {
    setForm(prev => {
      const exists = prev.dimensiList.includes(dimName);
      let newList = [];
      if (exists) {
        newList = prev.dimensiList.filter(d => d !== dimName);
      } else {
        newList = [...prev.dimensiList, dimName];
      }
      return { ...prev, dimensiList: newList };
    });
  };

  // Toggle multiple subjects
  const handleSubjectToggle = (subName: string) => {
    setForm(prev => {
      const exists = prev.mapelTerintegrasi.includes(subName);
      let newList = [];
      if (exists) {
        newList = prev.mapelTerintegrasi.filter(s => s !== subName);
      } else {
        newList = [...prev.mapelTerintegrasi, subName];
      }
      return { ...prev, mapelTerintegrasi: newList };
    });
  };

  // Toggle multiple 7 KAIH habits in detail
  const handleHabitToggle = (habit: string) => {
    setForm(prev => {
      const currentDetail = prev.bentukKegiatanDetail || '';
      const habits = currentDetail ? currentDetail.split(', ').filter(Boolean) : [];
      const exists = habits.includes(habit);
      let newDetail = '';
      if (exists) {
        newDetail = habits.filter(h => h !== habit).join(', ');
      } else {
        newDetail = [...habits, habit].join(', ');
      }
      return { ...prev, bentukKegiatanDetail: newDetail };
    });
  };

  // Handle simple input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => {
      let updatedMapel = prev.mapelTerintegrasi;
      if (name === 'kelasFase' && !value.includes('LB')) {
        updatedMapel = prev.mapelTerintegrasi.filter(sub => sub !== 'Program Kebutuhan Khusus');
      }
      return { ...prev, [name]: value, mapelTerintegrasi: updatedMapel };
    });
  };

  // Select shape of kegiatan
  const handleBentukChange = (id: string) => {
    setForm(prev => ({
      ...prev,
      bentukKegiatan: id,
      bentukKegiatanDetail: '', // Reset detail description when type changes
      mapelTerintegrasi: id === 'lintas-disiplin' ? ['Bahasa Indonesia', 'IPA (Ilmu Pengetahuan Alam)'] : []
    }));
  };

  // Reset form to default
  const handleResetForm = () => {
    if (window.confirm('Apakah Anda yakin ingin mengosongkan semua isian formulir?')) {
      setForm({
        namaSekolah: '',
        kelasFase: PRESET_CLASSES[7],
        tema: OFFICIAL_THEMES[1].name,
        alokasiWaktu: '8 JP',
        dimensiList: [],
        bentukKegiatan: BENTUK_KEGIATAN_OPTIONS[0].id,
        bentukKegiatanDetail: '',
        mapelTerintegrasi: [],
        catatanTambahan: '',
        jenisKetunaan: DISABILITY_TYPES[0]
      });
      setErrorMsg(null);
    }
  };

  // Submit form to generate plan
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations
    if (!form.namaSekolah.trim()) {
      setErrorMsg('Harap isi Nama Satuan Pendidikan (Sekolah).');
      return;
    }
    if (form.dimensiList.length === 0) {
      setErrorMsg('Harap pilih minimal 1 Dimensi Profil Lulusan yang disasar.');
      return;
    }
    if (form.bentukKegiatan === 'lintas-disiplin' && form.mapelTerintegrasi.length === 0) {
      setErrorMsg('Harap pilih minimal 1 mata pelajaran kolaboratif.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          namaSekolah: form.namaSekolah,
          kelasFase: form.kelasFase,
          jenisKetunaan: form.kelasFase.includes('LB') ? form.jenisKetunaan : undefined,
          tema: form.tema,
          alokasiWaktu: form.alokasiWaktu,
          dimensiList: form.dimensiList,
          bentukKegiatan: BENTUK_KEGIATAN_OPTIONS.find(b => b.id === form.bentukKegiatan)?.name,
          bentukKegiatanDetail: form.bentukKegiatan === '7kaih' ? `Menerapkan kebiasaan: ${form.bentukKegiatanDetail}` : form.bentukKegiatanDetail,
          mapelTerintegrasi: form.mapelTerintegrasi,
          catatanTambahan: form.catatanTambahan
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Terjadi kesalahan sistem server.');
      }

      const planData: LessonPlan = await response.json();
      setGeneratedPlan(planData);
      // Smooth scroll to top of preview section
      setTimeout(() => {
        const el = document.getElementById('output-section-top');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Gagal terhubung dengan server AI. Periksa koneksi internet Anda dan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  // Refine existing plan
  const handleRefinePlan = async (instruction: string) => {
    if (!generatedPlan || isRefining) return;
    setIsRefining(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/refine-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPlan: generatedPlan,
          instruction: instruction
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal melakukan revisi Rencana Pembelajaran.');
      }

      const updatedPlan: LessonPlan = await response.json();
      setGeneratedPlan(updatedPlan);
    } catch (err: any) {
      console.error(err);
      alert(`Gagal merespons revisi: ${err.message || 'Terjadi kesalahan kustom.'}`);
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      <Header />

      {/* Main Grid Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column - Form Parameters */}
          <section id="form-section" className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <School className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-bold text-slate-950 tracking-tight">
                  Parameter Program Kokurikuler
                </h2>
              </div>
              <button
                type="button"
                onClick={handleResetForm}
                className="text-xs text-slate-400 hover:text-rose-600 transition-colors flex items-center gap-1 font-semibold cursor-pointer"
                title="Atur ulang isian formulir"
              >
                <Trash2 className="w-3.5 h-3.5" /> Bersihkan
              </button>
            </div>

            {errorMsg && (
              <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Kesalahan Validasi:</span>
                  <p className="mt-0.5 leading-relaxed">{errorMsg}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* 1. Nama Sekolah */}
              <div>
                <label htmlFor="namaSekolah" className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Nama Satuan Pendidikan (Sekolah) *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <School className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    id="namaSekolah"
                    name="namaSekolah"
                    value={form.namaSekolah}
                    onChange={handleInputChange}
                    placeholder="Contoh: SD Negeri 1 Cikalong / SMP Hebat Mandiri"
                    className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden transition-all placeholder:text-slate-400 text-slate-800"
                    required
                  />
                </div>
              </div>

              {/* 2. Kelas/Fase & Alokasi Waktu Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="kelasFase" className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Jenjang / Kelas / Fase *
                  </label>
                  <div className="relative">
                    <select
                      id="kelasFase"
                      name="kelasFase"
                      value={form.kelasFase}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-slate-200 px-3 py-2.5 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden appearance-none cursor-pointer"
                    >
                      {PRESET_CLASSES.map((cls) => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>
                    <span className="absolute right-3.5 top-3.5 pointer-events-none text-slate-400">
                      <ChevronDown className="w-4 h-4" />
                    </span>
                  </div>
                </div>

                <div>
                  <label htmlFor="alokasiWaktu" className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Alokasi Waktu *
                  </label>
                  <input
                    type="text"
                    id="alokasiWaktu"
                    name="alokasiWaktu"
                    value={form.alokasiWaktu}
                    onChange={handleInputChange}
                    placeholder="Contoh: 8 JP, 12 JP, atau 2 Minggu"
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden transition-all text-slate-800"
                    required
                  />
                </div>
              </div>

              {/* Conditional disability select for SLB classes */}
              {form.kelasFase.includes('LB') && (
                <div className="p-4 bg-purple-50 border border-purple-200/60 rounded-xl space-y-2 animate-fadeIn">
                  <label htmlFor="jenisKetunaan" className="block text-xs font-bold text-purple-950 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
                    <span>Jenis Ketunaan (Kekhususan SLB) *</span>
                  </label>
                  <div className="relative">
                    <select
                      id="jenisKetunaan"
                      name="jenisKetunaan"
                      value={form.jenisKetunaan || DISABILITY_TYPES[0]}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-purple-200 px-3.5 py-2.5 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-hidden appearance-none cursor-pointer"
                    >
                      {DISABILITY_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <span className="absolute right-3.5 top-3.5 pointer-events-none text-purple-600">
                      <ChevronDown className="w-4 h-4" />
                    </span>
                  </div>
                  <p className="text-[10.5px] text-purple-800 leading-relaxed">
                    Sistem AI akan menyelaraskan tujuan pembelajaran, alur langkah, media kemitraan, metode pedagogis, serta rubrik asesmen agar ramah dan sesuai untuk siswa dengan hambatan <strong>{form.jenisKetunaan || DISABILITY_TYPES[0]}</strong>.
                  </p>
                </div>
              )}

              {/* 3. Tema Kokurikuler Resmi */}
              <div>
                <label htmlFor="tema" className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider flex items-center justify-between">
                  <span>Tema Utama Kokurikuler *</span>
                  <span className="text-[10px] text-blue-600 font-semibold lowercase">8 Tema Resmi 2025</span>
                </label>
                <div className="relative">
                  <select
                    id="tema"
                    name="tema"
                    value={form.tema}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-slate-200 px-3 py-2.5 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden appearance-none cursor-pointer"
                  >
                    {OFFICIAL_THEMES.map((t) => (
                      <option key={t.id} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                  <span className="absolute right-3.5 top-3.5 pointer-events-none text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </div>
                {/* Dynamically show theme description */}
                <p className="text-[11px] text-slate-400 mt-1.5 italic">
                  Keterangan: {OFFICIAL_THEMES.find(t => t.name === form.tema)?.desc}
                </p>
              </div>

              {/* 4. Dimensi Profil Lulusan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider flex items-center justify-between">
                  <span>Dimensi Profil Lulusan (Pilih yang Relevan) *</span>
                  <span className="text-[10px] text-slate-400 font-normal">Pilih minimal 1</span>
                </label>
                <div className="grid grid-cols-1 gap-2 max-h-[180px] overflow-y-auto border border-slate-100 rounded-xl p-2.5 bg-slate-50/50">
                  {OFFICIAL_DIMENSIONS.map((dim) => {
                    const isChecked = form.dimensiList.includes(dim.name);
                    return (
                      <label 
                        key={dim.id} 
                        className={`p-2.5 rounded-lg border text-xs flex items-start gap-2.5 transition-all cursor-pointer ${
                          isChecked 
                            ? 'bg-blue-50 border-blue-200 text-blue-950 font-medium' 
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleDimensionToggle(dim.name)}
                          className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                        />
                        <div>
                          <span>{dim.name}</span>
                          <span className="block text-[10px] text-slate-400 font-normal mt-0.5">{dim.desc}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 5. Bentuk Kegiatan Kokurikuler */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                  Bentuk Kegiatan Kokurikuler *
                </label>
                <div className="space-y-2">
                  {BENTUK_KEGIATAN_OPTIONS.map((opt) => {
                    const isSelected = form.bentukKegiatan === opt.id;
                    return (
                      <div 
                        key={opt.id}
                        onClick={() => handleBentukChange(opt.id)}
                        className={`p-3 rounded-xl border text-xs flex items-start gap-3 transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-emerald-50/50 border-emerald-200 text-slate-900 font-medium shadow-2xs' 
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 bg-white'
                        }`}>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <div>
                          <span className="font-bold">{opt.name}</span>
                          <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed font-normal">{opt.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sub-options based on Bentuk Kegiatan Selection */}
              {form.bentukKegiatan === 'lintas-disiplin' && (
                <div className="p-4 bg-blue-50/30 border border-blue-100/50 rounded-xl space-y-2.5 animate-fadeIn">
                  <span className="block text-[11px] font-bold text-blue-800 uppercase tracking-wider">
                    Pilih Mata Pelajaran Kolaboratif *
                  </span>
                  <div className="grid grid-cols-2 gap-2 max-h-[140px] overflow-y-auto bg-white p-2.5 rounded-lg border border-slate-200/60">
                    {(form.kelasFase.includes('LB') ? [...GENERAL_SUBJECTS, 'Program Kebutuhan Khusus'] : GENERAL_SUBJECTS).map((sub) => {
                      const isChecked = form.mapelTerintegrasi.includes(sub);
                      const isSpecialLB = sub === 'Program Kebutuhan Khusus';
                      return (
                        <label key={sub} className={`flex items-center gap-2 text-xs text-slate-700 hover:text-slate-900 cursor-pointer ${isSpecialLB ? 'col-span-2 p-1.5 bg-purple-50 rounded-md border border-purple-100 text-purple-950 font-medium' : ''}`}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleSubjectToggle(sub)}
                            className={`rounded text-blue-600 focus:ring-blue-500 border-slate-300 ${isSpecialLB ? 'text-purple-600 focus:ring-purple-500' : ''}`}
                          />
                          <span className="flex items-center gap-1.5 flex-wrap">
                            <span>{sub}</span>
                            {isSpecialLB && <span className="text-[9px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded font-bold uppercase shrink-0">Khas SLB</span>}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {form.bentukKegiatan === '7kaih' && (
                <div className="p-4 bg-emerald-50/30 border border-emerald-100/50 rounded-xl space-y-2.5 animate-fadeIn">
                  <div className="flex justify-between items-center">
                    <span className="block text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                      Kebiasaan yang Ingin Difokuskan *
                    </span>
                    <span className="text-[9px] text-emerald-700 font-semibold bg-emerald-100/50 px-1.5 py-0.5 rounded-sm">7 KAIH RI</span>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5 max-h-[140px] overflow-y-auto bg-white p-2.5 rounded-lg border border-slate-200/60">
                    {SEVEN_KAIH_HABITS.map((habit) => {
                      const isChecked = (form.bentukKegiatanDetail || '').split(', ').filter(Boolean).includes(habit);
                      return (
                        <label key={habit} className="flex items-start gap-2 text-xs text-slate-700 hover:text-slate-900 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleHabitToggle(habit)}
                            className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 mt-0.5"
                          />
                          <span className="leading-snug">{habit}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {form.bentukKegiatan === 'cara-lainnya' && (
                <div className="space-y-1.5 animate-fadeIn">
                  <label htmlFor="bentukKegiatanDetail" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Uraian Bentuk Kegiatan Kustom / Kearifan Lokal *
                  </label>
                  <input
                    type="text"
                    id="bentukKegiatanDetail"
                    name="bentukKegiatanDetail"
                    value={form.bentukKegiatanDetail}
                    onChange={handleInputChange}
                    placeholder="Contoh: Kunjungan museum, pameran kriya limbah eceng gondok..."
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden text-slate-800"
                    required
                  />
                </div>
              )}

              {/* 6. Catatan Tambahan */}
              <div>
                <label htmlFor="catatanTambahan" className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider flex items-center justify-between">
                  <span>Catatan Tambahan & Konteks Sekolah (Opsional)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Sangat membantu akurasi</span>
                </label>
                <textarea
                  id="catatanTambahan"
                  name="catatanTambahan"
                  value={form.catatanTambahan}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Contoh: Lokasi sekolah dekat sungai, melibatkan pakar pertanian setempat, atau fokus pada hasil yang bisa dipamerkan di sekolah."
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden transition-all text-slate-800 placeholder:text-slate-400"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-300 text-white font-bold rounded-xl text-xs tracking-wide uppercase transition-all shadow-sm hover:shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    <span>Menganalisis & Merancang...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                    <span>Rancang Program Sekarang</span>
                  </>
                )}
              </button>

            </form>
          </section>

          {/* Right Column - Generation Result */}
          <section id="output-section" className="lg:col-span-7 h-full min-h-[500px]">
            <div id="output-section-top" />
            {isLoading ? (
              <LoadingOverlay />
            ) : generatedPlan ? (
              <LessonPlanView 
                plan={generatedPlan} 
                onRefine={handleRefinePlan}
                isRefining={isRefining}
              />
            ) : (
              <TemplatePreview />
            )}
          </section>

        </div>

        {/* Pedagogical FAQ & Guidance Section at bottom */}
        <section id="panduan-section" className="mt-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-3">
            <GraduationCap className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Panduan Resmi Pelaksanaan Kokurikuler RI (Kemendikdasmen 2025)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  Apa perbedaan Kokurikuler dengan Ekstrakurikuler?
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  <strong>Kokurikuler</strong> adalah kegiatan pembelajaran yang dilaksanakan untuk menguatkan, memperdalam, dan/atau menunjang pembelajaran intrakurikuler dalam rangka pembentukan karakter. Berbeda dengan ekstrakurikuler yang bersifat opsional dan dilaksanakan di luar jam sekolah, Kokurikuler bersifat <strong>wajib bagi semua murid</strong>, memiliki alokasi waktu JP khusus, dan dinilai menggunakan rubrik karakter/kinerja.
                </p>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  Mengapa menggunakan pendekatan "Catur Pusat"?
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Pendekatan <strong>Catur Pusat Kemitraan</strong> memastikan ekosistem belajar yang utuh. Karakter murid dibentuk bukan hanya oleh <strong>Sekolah (Pendidik)</strong>, tetapi juga diselaraskan dengan kebiasaan di rumah bersama <strong>Keluarga (Orang Tua)</strong>, didukung oleh nilai positif di <strong>Masyarakat (Mitra/Tokoh)</strong>, serta disaring secara kritis melalui pengaruh <strong>Media (Sosial/Konvensional)</strong>.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  Bagaimana pembiasaan Gerakan 7 KAIH diintegrasikan?
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  <strong>Gerakan 7 Kebiasaan Anak Indonesia Hebat (7 KAIH)</strong> adalah inisiatif nasional 2025 untuk membentuk karakter disiplin dan sehat sejak dini. Melalui generator ini, jika Anda memilih opsi 7 KAIH, kami akan memformulasikan proyek aksi harian murid yang terstruktur, lembar kontrol kebiasaan mandiri, serta kerja sama pelaporan bersama orang tua secara kontekstual.
                </p>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  Tips agar pameran hasil karya (Diseminasi) menggembirakan?
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Diseminasi tidak harus berupa pameran panggung besar yang mahal. Lakukan secara sederhana tapi bermakna, misalnya <em>peer presentation</em> antarkelas, mengunggah poster infografis ke media sosial sekolah, atau membuat pojok karya di lorong sekolah. Hal yang terpenting adalah murid merasakan kegembiraan atas proses dan pencapaian mereka.
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Elegant Footer */}
      <footer className="bg-white border-t border-slate-200 mt-20 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Generator Kokurikuler AI • Berdasarkan Panduan Resmi Kemendikdasmen RI 2025</p>
          <p className="text-[10px] text-slate-400">
            Dibuat secara khidmat untuk mendukung guru dan pendidikan Indonesia yang maju dan berkualitas.
          </p>
        </div>
      </footer>
    </div>
  );
}
