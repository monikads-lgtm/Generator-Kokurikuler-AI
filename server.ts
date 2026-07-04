import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Helper schema for structured output of lesson plan
const lessonPlanSchema = {
  type: Type.OBJECT,
  properties: {
    identitas: {
      type: Type.OBJECT,
      properties: {
        namaSekolah: { type: Type.STRING },
        kelasFase: { type: Type.STRING },
        tema: { type: Type.STRING },
        alokasiWaktu: { type: Type.STRING }
      },
      required: ['namaSekolah', 'kelasFase', 'tema', 'alokasiWaktu']
    },
    dimensi: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          nama: { type: Type.STRING },
          deskripsi: { type: Type.STRING }
        },
        required: ['nama', 'deskripsi']
      }
    },
    bentukKegiatan: {
      type: Type.OBJECT,
      properties: {
        jenis: { type: Type.STRING },
        detail: { type: Type.STRING },
        mapelTerintegrasi: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      },
      required: ['jenis', 'detail']
    },
    tujuan: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    kerangka: {
      type: Type.OBJECT,
      properties: {
        praktikPedagogis: { type: Type.STRING },
        lingkungan: { type: Type.STRING },
        teknologi: { type: Type.STRING },
        kemitraan: {
          type: Type.OBJECT,
          properties: {
            sekolah: { type: Type.STRING },
            keluarga: { type: Type.STRING },
            masyarakat: { type: Type.STRING },
            media: { type: Type.STRING }
          },
          required: ['sekolah', 'keluarga', 'masyarakat', 'media']
        }
      },
      required: ['praktikPedagogis', 'lingkungan', 'teknologi', 'kemitraan']
    },
    kegiatan: {
      type: Type.OBJECT,
      properties: {
        tahapAwal: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        tahapPelaksanaan: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        tahapRefleksi: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      },
      required: ['tahapAwal', 'tahapPelaksanaan', 'tahapRefleksi']
    },
    asesmen: {
      type: Type.OBJECT,
      properties: {
        formatif: { type: Type.STRING },
        sumatif: {
          type: Type.OBJECT,
          properties: {
            kriteria: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  namaKriteria: { type: Type.STRING },
                  sangatBaik: { type: Type.STRING },
                  baik: { type: Type.STRING },
                  cukup: { type: Type.STRING },
                  kurang: { type: Type.STRING }
                },
                required: ['namaKriteria', 'sangatBaik', 'baik', 'cukup', 'kurang']
              }
            }
          },
          required: ['kriteria']
        }
      },
      required: ['formatif', 'sumatif']
    },
    fullMarkdown: {
      type: Type.STRING,
      description: "The complete lesson plan in professional Indonesian Markdown format, with proper header tags, tables, and spacing, perfectly suitable for copy-pasting to Word or exporting."
    }
  },
  required: ['identitas', 'dimensi', 'bentukKegiatan', 'tujuan', 'kerangka', 'kegiatan', 'asesmen', 'fullMarkdown']
};

// API Endpoint to generate co-curricular plan
app.post('/api/generate-plan', async (req, res) => {
  try {
    const {
      namaSekolah,
      kelasFase,
      jenisKetunaan,
      tema,
      alokasiWaktu,
      dimensiList, // array of strings (selected dimensions)
      bentukKegiatan, // object or string
      bentukKegiatanDetail,
      mapelTerintegrasi, // array of strings (if any)
      catatanTambahan // any special instructions
    } = req.body;

    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
    }

    const slbContextGuide = jenisKetunaan
      ? `\n\n[PENTING - ADAPTASI SEKOLAH LUAR BIASA (SLB)]\nKarena RPP Kokurikuler ini dirancang khusus untuk SLB dengan Jenis Ketunaan: "${jenisKetunaan}", Anda WAJIB menyesuaikan seluruh rancangan pembelajaran agar ramah, aksesibel, dan relevan dengan karakteristik serta hambatan belajar siswa tersebut:\n` +
        `- Bagi hambatan penglihatan (Tunanetra): maksimalkan penggunaan sensori taktil/perabaan, audio, orientasi mobilitas, deskripsi verbal yang kaya, huruf Braille, atau gawai bersuara.\n` +
        `- Bagi hambatan pendengaran (Tunarungu): maksimalkan visualisasi, isyarat, ekspresi, petunjuk bergambar, video dengan teks, papan tulis komunikasi, dan latihan motorik terarah.\n` +
        `- Bagi hambatan intelektual (Tunagrahita): sederhanakan alur instruksi, gunakan langkah konkret berulang, libatkan banyak alat peraga visual nyata, dan fokus pada kecakapan hidup mandiri (activity of daily living).\n` +
        `- Bagi hambatan fisik/motorik (Tunadaksa): pastikan modifikasi mobilitas fisik, aksesibilitas lingkungan belajar bebas hambatan (ramah kursi roda), pemanfaatan alat bantu genggam, dan aktivitas kolaboratif yang tidak membebani fisik secara berlebih.\n` +
        `- Bagi hambatan emosi/perilaku (Tunalaras) & Autis (ASD): buat rutinitas yang sangat terstruktur, buat petunjuk visual yang jelas, sediakan area tenang (calming corner), minimalisir distrak visual/audio yang berlebih, dan fokus pada regulasi diri serta interaksi sosial positif.\n` +
        `- Selaraskan tujuan, langkah-langkah kegiatan, keterlibatan orang tua (kemitraan), media belajar, dan kriteria asesmen agar realistis serta bermakna untuk kondisi kekhususan siswa tersebut.`
      : '';

    const systemPrompt = `Anda adalah "Generator Kokurikuler" – Asisten AI Ahli yang bertugas membantu guru merancang Rencana Pembelajaran Kokurikuler secara instan, praktis, dan sistematis berdasarkan Panduan Kokurikuler Resmi Kementerian Pendidikan Dasar dan Menengah RI (2025).
Tugas Anda adalah mengubah input dari guru menjadi dokumen Rencana Pembelajaran Kokurikuler yang komprehensif, bermakna (meaningful), berkesadaran (mindful), dan menggembirakan (joyful).

Anda HARUS menghasilkan dokumen dalam format JSON terstruktur yang sesuai dengan schema yang ditentukan. 
Semua penjelasan dan teks harus ditulis menggunakan Bahasa Indonesia yang formal, positif, edukatif, dan inspiratif.

Kembangkan Rencana Pembelajaran dengan kualitas pedagogis terbaik berdasarkan input berikut:
- Nama Sekolah: ${namaSekolah || 'Sekolah Hebat'}
- Kelas/Fase: ${kelasFase || 'Fase D (SMP Kelas VII)'}${jenisKetunaan ? ` (Kekhususan SLB: ${jenisKetunaan})` : ''}
- Tema Kokurikuler: ${tema || 'Kearifan Lokal'}
- Alokasi Waktu: ${alokasiWaktu || '8 JP'}
- Dimensi Profil Lulusan yang Ditargetkan: ${dimensiList && dimensiList.length ? dimensiList.join(', ') : 'Penalaran Kritis, Kolaborasi'}
- Bentuk Kegiatan: ${bentukKegiatan || 'Pembelajaran Kolaboratif Lintas Disiplin Ilmu'} (${bentukKegiatanDetail || 'Tidak spesifik'})
- Mapel Terintegrasi: ${mapelTerintegrasi && mapelTerintegrasi.length ? mapelTerintegrasi.join(', ') : 'Tidak ada'}
- Catatan Tambahan/Konteks Lokal: ${catatanTambahan || 'Fokus pada partisipasi aktif murid dan hasil yang berdampak nyata.'}${slbContextGuide}

Harap penuhi komponen wajib berikut:
1. IDENTITAS PROGRAM: Tulis ulang dengan lengkap.
2. DIMENSI PROFIL LULUSAN: Jelaskan keterkaitan dimensi terpilih dengan proyek/tema kokurikuler secara mendalam.
3. BENTUK KEGIATAN: Uraikan bentuk kegiatannya (misalnya Pembelajaran Lintas Disiplin, Gerakan 7 KAIH, atau nilai kekhasan lokal). Jelaskan integrasi mapel jika ada.
4. TUJUAN PEMBELAJARAN: Buat 3-4 tujuan pembelajaran konkret yang memadukan kompetensi (Dimensi Profil) dan konten (isu tema) yang disesuaikan realistis sesuai tingkat kemampuan siswa.
5. KERANGKA PEMBELAJARAN MENDALAM:
   - Praktik Pedagogis (Inquiry-Based, Project-Based, Problem-Based, dll.)
   - Lingkungan Pembelajaran (Kelas, luar ruang, komunitas, digital)
   - Kemitraan Pembelajaran (Catur Pusat: Pendidik, Orang Tua, Tokoh Masyarakat/Mitra, Media)
   - Pemanfaatan Teknologi Digital/Alat Bantu Aksesibilitas
6. RANGKAIAN KEGIATAN: Berikan langkah-langkah detail dan terstruktur (Tahap Awal/Kesepakatan, Tahap Pelaksanaan/Aksi Nyata, Tahap Refleksi/Diseminasi).
7. RENCANA ASESMEN: Berikan asesmen formatif (misal: jurnal refleksi harian, lembar observasi) dan asesmen sumatif (berupa tabel rubrik penilaian kinerja dengan kriteria Sangat Baik, Baik, Cukup, Kurang).

Dalam field 'fullMarkdown', buat dokumen utuh berformat Markdown yang sangat rapi, formal, terstruktur, bebas dari placeholder, dan siap cetak/salin. Gunakan susunan standar sebagai berikut:

# RENCANA PROGRAM PEMBELAJARAN KOKURIKULER
## ${namaSekolah ? namaSekolah.toUpperCase() : 'SEKOLAH HEBAT'}

---

### **IDENTITAS PROGRAM**
* **Satuan Pendidikan:** ${namaSekolah || 'Sekolah Hebat'}
* **Jenjang / Kelas / Fase:** ${kelasFase || 'Fase D (SMP Kelas VII)'}${jenisKetunaan ? ` (SLB - Kekhususan: ${jenisKetunaan})` : ''}
* **Tema Utama Kokurikuler:** ${tema || 'Kearifan Lokal'}
* **Alokasi Waktu:** ${alokasiWaktu || '8 JP'}
* **Pendekatan Utama:** ${bentukKegiatan || 'Pembelajaran Kolaboratif'}

---

### **I. LATAR BELAKANG DAN RELEVANSI PROGRAM**
(Tuliskan latar belakang, esensi pemilihan tema, pentingnya program kokurikuler ini untuk murid, dan relevansinya dengan tantangan lokal/global secara komprehensif 2-3 paragraf)

---

### **II. DIMENSI PROFIL LULUSAN YANG DISASAR**
(Uraikan secara detail setiap dimensi terpilih di bawah ini beserta sub-elemen dan bentuk keterkaitan konkretnya dengan proyek kokurikuler)
* **Dimensi:** ...
  * *Penjelasan Keterkaitan:* ...

---

### **III. BENTUK KEGIATAN & INTEGRASI DISIPLIN ILMU**
* **Bentuk Kegiatan Utama:** ${bentukKegiatan || 'Pembelajaran Kolaboratif Lintas Disiplin Ilmu'} (${bentukKegiatanDetail || 'Tidak spesifik'})
* **Integrasi Mata Pelajaran:** ${mapelTerintegrasi && mapelTerintegrasi.length ? mapelTerintegrasi.join(', ') : 'Tidak ada'}
(Jelaskan secara komprehensif bagaimana setiap mata pelajaran berkontribusi, serta bagaimana pendekatan kegiatan ini dirancang agar bermakna dan menggembirakan bagi murid)

---

### **IV. TUJUAN PEMBELAJARAN KHUSUS**
(Sebutkan minimal 3-4 tujuan pembelajaran konkret yang menggabungkan kompetensi dimensi karakter dengan konten isu tema kokurikuler)
1. ...
2. ...

---

### **V. KERANGKA PEMBELAJARAN DEEPER LEARNING**
* **Praktik Pedagogis:** (misal: Project-Based Learning / Inquiry-Based Learning)
* **Lingkungan Belajar:** (Kombinasi kelas, luar ruang, digital)
* **Pemanfaatan Teknologi:** (Pemanfaatan gawai, presentasi multimedia, Google Docs, Canva, dll)

#### **Kemitraan Pembelajaran Catur Pusat:**
* **1. Sekolah (Pendidik):** ...
* **2. Keluarga (Orang Tua):** ...
* **3. Masyarakat (Mitra / Tokoh Lokal):** ...
* **4. Media (Digital / Sosial):** ...

---

### **VI. ALUR DAN RANGKAIAN KEGIATAN PEMBELAJARAN (JOYFUL LEARNING)**
#### **A. Tahap Awal (Peluncuran & Membangun Kesepakatan)**
(Tulis 2-3 langkah aktivitas detail, menyenangkan, serta interaktif untuk memicu rasa ingin tahu murid)
1. ...
2. ...

#### **B. Tahap Pelaksanaan (Aksi Nyata & Kolaborasi Lapangan)**
(Tulis 3-4 langkah aktivitas konkret harian/mingguan yang berpusat pada murid, kreatif, dan mandiri)
1. ...
2. ...

#### **C. Tahap Refleksi, Evaluasi & Diseminasi (Pameran Karya)**
(Tulis 2-3 langkah perayaan belajar, refleksi mendalam, penarikan kesimpulan, serta pameran hasil karya murid yang menggembirakan)
1. ...
2. ...

---

### **VII. RENCANA ASESMEN**
#### **A. Asesmen Formatif (Selama Proses)**
(Sebutkan jenis penilaian proses: jurnal harian, lembar observasi partisipasi, atau umpan balik rekan sejawat)

#### **B. Asesmen Sumatif (Kinerja Hasil Proyek)**
(Tampilkan tabel rubrik penilaian kinerja sumatif secara utuh dengan menggunakan format tabel Markdown yang benar-benar rapi seperti berikut ini)

| Kriteria Penilaian | Sangat Baik (A) | Baik (B) | Cukup (C) | Kurang (D) |
| :--- | :--- | :--- | :--- | :--- |
| **Kriteria 1** | Penjelasan kriteria sangat baik... | Penjelasan kriteria baik... | Penjelasan kriteria cukup... | Penjelasan kriteria kurang... |
| **Kriteria 2** | Penjelasan kriteria sangat baik... | Penjelasan kriteria baik... | Penjelasan kriteria cukup... | Penjelasan kriteria kurang... |

---

Tulis dengan format Markdown yang sangat rapi agar ketika disalin oleh guru ke Microsoft Word atau Google Docs, dokumen tersebut langsung menjadi rancangan modul kokurikuler yang sangat profesional dan siap digunakan.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: systemPrompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: lessonPlanSchema,
        temperature: 0.2
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error('Empty response from Gemini API');
    }

    const planData = JSON.parse(resultText);
    res.json(planData);
  } catch (error: any) {
    console.error('Error generating plan:', error);
    res.status(500).json({ error: error.message || 'Gagal menghasilkan Rencana Pembelajaran.' });
  }
});

// API Endpoint to refine/modify an existing co-curricular plan based on user request
app.post('/api/refine-plan', async (req, res) => {
  try {
    const { currentPlan, instruction } = req.body;

    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
    }

    if (!currentPlan || !instruction) {
      return res.status(400).json({ error: 'Data rencana saat ini dan instruksi perbaikan diperlukan.' });
    }

    const systemPrompt = `Anda adalah "Generator Kokurikuler" – Asisten AI Ahli perancang Rencana Pembelajaran Kokurikuler.
Guru ingin MEMPERBAIKI atau MENYESUAIKAN rencana pembelajaran kokurikuler yang sudah dihasilkan sebelumnya.

Rencana Pembelajaran saat ini:
${JSON.stringify(currentPlan, null, 2)}

Instruksi Perbaikan/Penyesuaian dari Guru:
"${instruction}"

Tugas Anda adalah memodifikasi rencana pembelajaran kokurikuler saat ini dengan cermat sesuai dengan instruksi guru di atas. Tetap pertahankan bagian lain yang tidak terpengaruh oleh perubahan ini, tetapi pastikan seluruh dokumen tetap sinkron, logis, dan profesional.
Seluruh dokumen harus ditulis dalam Bahasa Indonesia yang formal, positif, edukatif, dan inspiratif.

Anda HARUS menghasilkan dokumen dalam format JSON terstruktur yang sesuai dengan schema yang sama seperti sebelumnya. 
Pastikan untuk memperbarui bagian 'fullMarkdown' agar mencerminkan semua perubahan/perbaikan tersebut dengan format dokumen yang sangat rapi, formal, terstruktur menggunakan heading #, ##, ###, bullet points, pemisah garis ---, dan tabel Markdown lengkap untuk rubrik penilaian sumatif.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: systemPrompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: lessonPlanSchema,
        temperature: 0.2
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error('Empty response from Gemini API');
    }

    const planData = JSON.parse(resultText);
    res.json(planData);
  } catch (error: any) {
    console.error('Error refining plan:', error);
    res.status(500).json({ error: error.message || 'Gagal memperbarui Rencana Pembelajaran.' });
  }
});

// Setup Vite or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
