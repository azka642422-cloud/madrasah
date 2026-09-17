// Target Muhafadloh berdasarkan Buku Sosialisasi Madrasah Diniyyah Takmiliyah.
// Bila sumber sendiri memuat angka yang tidak konsisten, keduanya dipertahankan
// dan perbedaannya dijelaskan, bukan direkonsiliasi secara diam-diam.

export interface TargetKelasRule {
  tingkat: number;
  namaMateri: string;
  targetPerSetoran: number[];
  targetTahunan: number;
  satuan: string;
  catatanKhusus?: string;
}

export const TARGET_MUHAFADZOH_RULES: Record<number, TargetKelasRule> = {
  1: {
    tingkat: 1,
    namaMateri: 'Tashrif Ishthilahi Tsulatsi Mujarrod 6 Bab',
    targetPerSetoran: [7, 7, 7, 7, 7, 6, 6, 6],
    targetTahunan: 53,
    satuan: 'Wazan/Mauzun',
    catatanKhusus: 'Bulan 1 s.d. 5: 7 Wazan/Mauzun. Bulan 6 s.d. 8: 6 Wazan/Mauzun.',
  },
  2: {
    tingkat: 2,
    namaMateri: 'Tashrif Lughowi',
    targetPerSetoran: [7, 7, 7, 7, 7, 7, 7, 6],
    targetTahunan: 55,
    satuan: 'Wazan/Mauzun',
    catatanKhusus: 'Bulan 1 s.d. 7: 7 Wazan/Mauzun. Bulan 8: 6 Wazan/Mauzun.',
  },
  3: {
    tingkat: 3,
    namaMateri: 'Nadzom Imrithi 130 Bait',
    targetPerSetoran: [18, 16, 16, 16, 16, 16, 16, 16],
    targetTahunan: 130,
    satuan: 'Bait',
    catatanKhusus: 'Bulan 1: 18 Bait. Bulan 2 s.d. 8: 16 Bait.',
  },
  4: {
    tingkat: 4,
    namaMateri: 'Nadzom Imrithi 124 Bait',
    targetPerSetoran: [16, 16, 16, 16, 15, 15, 15, 15],
    targetTahunan: 124,
    satuan: 'Bait',
    catatanKhusus: 'Bulan 1 s.d. 4: 16 Bait. Bulan 5 s.d. 8: 15 Bait.',
  },
  5: {
    tingkat: 5,
    namaMateri: 'Nadzom Qowaidus Shorfiyah Jilid 1 (80 Bait)',
    targetPerSetoran: [11, 11, 10, 10, 10, 10, 10, 10],
    targetTahunan: 80,
    satuan: 'Bait',
    catatanKhusus: 'Sumber menyebut total 80 Bait, tetapi rincian Bulan 1–2 masing-masing 11 dan Bulan 3–8 masing-masing 10 berjumlah 82. Sistem mempertahankan judul target 80 dan rincian bulanan apa adanya.',
  },
  6: {
    tingkat: 6,
    namaMateri: 'Surat dan Wirid',
    targetPerSetoran: [1, 1, 1, 1, 1, 1, 1, 1],
    targetTahunan: 8,
    satuan: 'Pelaksanaan',
    catatanKhusus: "Semester I: Surat Al-Mulk, Surat Al-Waqi'ah, Surat Yasin, dan Rotibul Haddad. Semester II: Tahlil dan Istighotsah (beserta Do'a dan Tawassul) dan Wirid Ba'da Sholat Maktubah. Dokumen tidak menetapkan pembagian materi satu-per-satu untuk M1–M8, sehingga sistem tidak menambahkan materi kedelapan buatan.",
  },
};

// Konstanta lama tetap tersedia untuk kompatibilitas modul lain. Angka ini
// bukan sumber nilai santri dan tidak digunakan untuk membuat nilai otomatis.
export const BOBOT_PENILAIAN = {
  ujianTulis: 0.35,
  ujianLisan: 0.30,
  muhafadzoh: 0.30,
  kehadiran: 0.05,
  kkmNilaiAkhir: 50,
  minKehadiran: 80,
  targetMuhafadzohMin: 100,
};
