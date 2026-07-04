export interface Identitas {
  namaSekolah: string;
  kelasFase: string;
  tema: string;
  alokasiWaktu: string;
}

export interface Dimensi {
  nama: string;
  deskripsi: string;
}

export interface BentukKegiatan {
  jenis: string;
  detail: string;
  mapelTerintegrasi?: string[];
}

export interface Kemitraan {
  sekolah: string;
  keluarga: string;
  masyarakat: string;
  media: string;
}

export interface Kerangka {
  praktikPedagogis: string;
  lingkungan: string;
  teknologi: string;
  kemitraan: Kemitraan;
}

export interface Kegiatan {
  tahapAwal: string[];
  tahapPelaksanaan: string[];
  tahapRefleksi: string[];
}

export interface RubrikKriteria {
  namaKriteria: string;
  sangatBaik: string;
  baik: string;
  cukup: string;
  kurang: string;
}

export interface Asesmen {
  formatif: string;
  sumatif: {
    kriteria: RubrikKriteria[];
  };
}

export interface LessonPlan {
  identitas: Identitas;
  dimensi: Dimensi[];
  bentukKegiatan: BentukKegiatan;
  tujuan: string[];
  kerangka: Kerangka;
  kegiatan: Kegiatan;
  asesmen: Asesmen;
  fullMarkdown: string;
}

export interface FormInput {
  namaSekolah: string;
  kelasFase: string;
  tema: string;
  alokasiWaktu: string;
  dimensiList: string[];
  bentukKegiatan: string;
  bentukKegiatanDetail: string;
  mapelTerintegrasi: string[];
  catatanTambahan: string;
  jenisKetunaan?: string;
}

export const OFFICIAL_THEMES = [
  { id: 'gaya-hidup', name: 'Gaya Hidup Berkelanjutan', desc: 'Memahami dampak aktivitas manusia terhadap lingkungan dan membangun gaya hidup ramah lingkungan.' },
  { id: 'kearifan-lokal', name: 'Kearifan Lokal', desc: 'Mengeksplorasi adat istiadat, nilai-nilai lokal, budaya, dan kesenian daerah sekitar.' },
  { id: 'bhinneka', name: 'Bhinneka Tunggal Ika', desc: 'Merayakan keberagaman, toleransi, empati, dan persatuan dalam perbedaan sosial budaya.' },
  { id: 'bangun-jiwa', name: 'Bangunlah Jiwa dan Raganya', desc: 'Menguatkan kesehatan fisik dan mental, pencegahan bullying, serta regulasi emosi diri.' },
  { id: 'suara-demokrasi', name: 'Suara Demokrasi', desc: 'Melatih kemampuan berpendapat, bermusyawarah, berorganisasi, dan berpartisipasi aktif.' },
  { id: 'rekayasa-tek', name: 'Rekayasa dan Teknologi', desc: 'Mengembangkan inovasi teknologi digital atau rekayasa mekanis untuk menjawab masalah riil.' },
  { id: 'kewirausahaan', name: 'Kewirausahaan', desc: 'Menggali potensi ekonomi kreatif, kerja sama tim, pemasaran, dan perencanaan finansial mandiri.' },
  { id: 'kebekerjaan', name: 'Kebekerjaan (Khusus SMK)', desc: 'Menyiapkan keterampilan profesional, etos kerja tinggi, dan adaptasi iklim industri.' }
];

export const OFFICIAL_DIMENSIONS = [
  { id: 'iman-taqwa', name: 'Keimanan & Ketakwaan terhadap Tuhan YME', desc: 'Berakhlak mulia, beribadah taat, menghormati sesama makhluk hidup, dan menjaga alam.' },
  { id: 'kewargaan', name: 'Kewargaan', desc: 'Cinta tanah air, aktif bermasyarakat, peduli isu sosial, dan menghargai keragaman nasional.' },
  { id: 'penalaran-kritis', name: 'Penalaran Kritis', desc: 'Menganalisis informasi, memecahkan masalah logis, dan merefleksikan pemikiran mandiri.' },
  { id: 'kreativitas', name: 'Kreativitas', desc: 'Menghasilkan gagasan orisinal, menciptakan karya inovatif, dan berani mencoba hal baru.' },
  { id: 'kolaborasi', name: 'Kolaborasi', desc: 'Bekerja sama secara aktif, berbagi peran, berempati, dan menyelaraskan tindakan demi tujuan bersama.' },
  { id: 'kemandirian', name: 'Kemandirian', desc: 'Memiliki kesadaran diri, mengelola emosi, mengatur waktu belajar, dan tangguh menghadapi tantangan.' },
  { id: 'kesehatan', name: 'Kesehatan', desc: 'Menerapkan pola hidup bersih dan sehat, berolahraga teratur, makan bergizi, dan istirahat cukup.' },
  { id: 'komunikasi', name: 'Komunikasi', desc: 'Menyampaikan gagasan secara santun, menyimak dengan empati, dan berdiskusi secara efektif.' }
];

export const BENTUK_KEGIATAN_OPTIONS = [
  { id: 'lintas-disiplin', name: 'Pembelajaran Kolaboratif Lintas Disiplin Ilmu', desc: 'Integrasi dan kolaborasi beberapa mata pelajaran dalam aksi nyata atau proyek kontekstual.' },
  { id: '7kaih', name: 'Gerakan 7 Kebiasaan Anak Indonesia Hebat (7 KAIH)', desc: 'Pembiasaan karakter melalui 7 kebiasaan harian: Bangun pagi, Beribadah, Berolahraga, Makan sehat, Gemar belajar, Bermasyarakat, Tidur cepat.' },
  { id: 'cara-lainnya', name: 'Cara Lainnya (Konteks Lokal / Nilai Khas)', desc: 'Kegiatan khusus yang mengangkat kearifan, tradisi lokal, atau nilai-nilai keunggulan khas sekolah.' }
];

export const GENERAL_SUBJECTS = [
  'Bahasa Indonesia', 'Matematika', 'IPAS (Ilmu Pengetahuan Alam dan Sosial)', 'IPA (Ilmu Pengetahuan Alam)', 'IPS (Ilmu Pengetahuan Sosial)',
  'PPKn / Pendidikan Pancasila', 'Seni & Budaya', 'PJOK (Pendidikan Jasmani, Olahraga, & Kesehatan)',
  'Bahasa Inggris', 'Informatika', 'Pendidikan Agama & Budi Pekerti', 'Prakarya', 'Muatan Lokal (Bahasa/Seni Daerah)'
];

export const SEVEN_KAIH_HABITS = [
  'Bangun pagi (Kedisiplinan & kemandirian)',
  'Beribadah (Keimanan, ketakwaan, & spiritualitas)',
  'Berolahraga (Kesehatan fisik, kebugaran, & ketahanan)',
  'Makan sehat (Nutrisi seimbang & peduli tubuh)',
  'Gemar belajar (Rasa ingin tahu & pengembangan diri)',
  'Bermasyarakat (Kepedulian sosial, gotong royong, & empati)',
  'Tidur cepat (Pola istirahat berkualitas & kesehatan mental)'
];

export const PRESET_CLASSES = [
  'PAUD / Fase Pondasi',
  'SD Kelas I (Fase A)',
  'SD Kelas II (Fase A)',
  'SD Kelas III (Fase B)',
  'SD Kelas IV (Fase B)',
  'SD Kelas V (Fase C)',
  'SD Kelas VI (Fase C)',
  'SMP Kelas VII (Fase D)',
  'SMP Kelas VIII (Fase D)',
  'SMP Kelas IX (Fase D)',
  'SMA/SMK Kelas X (Fase E)',
  'SMA/SMK Kelas XI (Fase F)',
  'SMA/SMK Kelas XII (Fase F)',
  'SDLB (Fase A/B/C - SD Luar Biasa)',
  'SMPLB (Fase D - SMP Luar Biasa)',
  'SMALB (Fase E/F - SMA Luar Biasa)'
];

export const DISABILITY_TYPES = [
  'Tunanetra (Hambatan Penglihatan)',
  'Tunarungu (Hambatan Pendengaran)',
  'Tunagrahita (Hambatan Intelektual)',
  'Tunadaksa (Hambatan Fisik / Anggota Gerak)',
  'Tunalaras (Hambatan Emosi, Sosial & Perilaku)',
  'Autis / ASD (Autism Spectrum Disorder)',
  'Hambatan Majemuk (Ganda)',
  'Kesulitan Belajar Spesifik (Disleksia/Disgrafia/Diskalkulia)',
  'Lamban Belajar (Slow Learner)'
];

