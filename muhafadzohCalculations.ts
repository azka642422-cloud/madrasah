import { SiswaMuhafadzoh, CalculatedMuhafadzohResult } from '../types';
import { BOBOT_PENILAIAN } from './muhafadzohRules';

/**
 * Membedakan null / undefined / string kosong dari angka 0.
 * Angka 0 adalah nilai sah (misal belum setor wazan sama sekali), sedangkan null/undefined adalah data kosong.
 */
export function isNumberDefined(val: any): val is number {
  return val !== null && val !== undefined && val !== '' && !isNaN(Number(val));
}

export function calculateMuhafadzohDanAkademik(siswa: SiswaMuhafadzoh): CalculatedMuhafadzohResult {
  const catatanData: string[] = [];

  // 1. Capaian Muhafadzoh 1-8
  const capaianList = [
    siswa.capaian1,
    siswa.capaian2,
    siswa.capaian3,
    siswa.capaian4,
    siswa.capaian5,
    siswa.capaian6,
    siswa.capaian7,
    siswa.capaian8,
  ];

  const filledCapaian = capaianList.filter(isNumberDefined);
  const hasAnyCapaian = filledCapaian.length > 0;
  const isCapaianLengkap = filledCapaian.length === 8;

  let totalCapaian: number | null = null;
  let kekuranganMuhafadzoh: number | null = null;
  let persenCapaian: number | null = null;
  let nilaiMuhafadzoh: number | null = null;

  if (hasAnyCapaian) {
    totalCapaian = filledCapaian.reduce((acc, curr) => acc + Number(curr), 0);
    kekuranganMuhafadzoh = Math.max(0, siswa.targetTahunan - totalCapaian);
    const rawPersen = (totalCapaian / siswa.targetTahunan) * 100;
    persenCapaian = Math.round(rawPersen * 100) / 100;
    nilaiMuhafadzoh = Math.min(100, persenCapaian);
  } else {
    catatanData.push('Data capaian muhafadzoh belum lengkap.');
  }

  // 2. Rata-rata Ujian Tulis
  let rataUjianTulis: number | null = null;
  const hasUjianTulisLengkap = isNumberDefined(siswa.ujianTulisS1) && isNumberDefined(siswa.ujianTulisS2);
  if (hasUjianTulisLengkap) {
    rataUjianTulis = Math.round(((Number(siswa.ujianTulisS1) + Number(siswa.ujianTulisS2)) / 2) * 100) / 100;
  } else {
    catatanData.push('Nilai ujian tulis semester 1 atau 2 belum lengkap.');
  }

  // 3. Rata-rata Ujian Lisan
  let rataUjianLisan: number | null = null;
  const hasUjianLisanLengkap = isNumberDefined(siswa.ujianLisanS1) && isNumberDefined(siswa.ujianLisanS2);
  if (hasUjianLisanLengkap) {
    rataUjianLisan = Math.round(((Number(siswa.ujianLisanS1) + Number(siswa.ujianLisanS2)) / 2) * 100) / 100;
  } else {
    catatanData.push('Nilai ujian lisan semester 1 atau 2 belum lengkap.');
  }

  // 4. Kehadiran
  const hasKehadiran = isNumberDefined(siswa.kehadiran);
  if (!hasKehadiran) {
    catatanData.push('Data kehadiran belum tersedia.');
  }

  // 5. Nilai Akhir
  // Hanya dihitung jika seluruh komponen tersedia: Rata Tulis, Rata Lisan, Nilai Muhafadzoh, dan Kehadiran
  let nilaiAkhir: number | null = null;
  const hasNilaiAkhir =
    rataUjianTulis !== null &&
    rataUjianLisan !== null &&
    nilaiMuhafadzoh !== null &&
    hasKehadiran;

  let predikat: 'A' | 'B' | 'C' | 'D' | null = null;
  let predikatLabel = 'Belum Ada';

  if (hasNilaiAkhir) {
    const rawNilaiAkhir =
      rataUjianTulis! * BOBOT_PENILAIAN.ujianTulis +
      rataUjianLisan! * BOBOT_PENILAIAN.ujianLisan +
      nilaiMuhafadzoh! * BOBOT_PENILAIAN.muhafadzoh +
      Number(siswa.kehadiran) * BOBOT_PENILAIAN.kehadiran;

    nilaiAkhir = Math.round(rawNilaiAkhir * 100) / 100;

    // Predikat
    if (nilaiAkhir >= 85) {
      predikat = 'A';
      predikatLabel = 'A / Sangat Baik';
    } else if (nilaiAkhir >= 70) {
      predikat = 'B';
      predikatLabel = 'B / Baik';
    } else if (nilaiAkhir >= 50) {
      predikat = 'C';
      predikatLabel = 'C / Cukup';
    } else {
      predikat = 'D';
      predikatLabel = 'D / Belum Lulus';
    }
  } else {
    catatanData.push('Perhitungan nilai akhir belum dapat dilakukan secara lengkap.');
  }

  // 6. Syarat Kenaikan Kelas (Dua Jenis Status)
  // Status A: Sesuai Dokumen (Nilai Akhir >= 50)
  let statusDokumen: 'Naik Kelas' | 'Tidak Naik' | 'Belum dapat ditentukan' = 'Belum dapat ditentukan';
  if (nilaiAkhir !== null) {
    statusDokumen = nilaiAkhir >= BOBOT_PENILAIAN.kkmNilaiAkhir ? 'Naik Kelas' : 'Tidak Naik';
  }

  // Status B: Rekomendasi Akademik + Muhafadzoh
  // Syarat: Nilai Akhir >= 50 DAN Kehadiran >= 80% DAN Muhafadzoh >= 100%
  let statusRekomendasi:
    | 'Naik Kelas'
    | 'BELUM MEMENUHI SYARAT'
    | 'BELUM DAPAT DITENTUKAN – data belum lengkap' = 'BELUM DAPAT DITENTUKAN – data belum lengkap';
  let alasanRekomendasi = '';

  if (!hasNilaiAkhir || !hasKehadiran || persenCapaian === null) {
    statusRekomendasi = 'BELUM DAPAT DITENTUKAN – data belum lengkap';
    alasanRekomendasi = 'Data nilai ujian, muhafadzoh, atau kehadiran belum lengkap diinput.';
  } else {
    const reasons: string[] = [];

    if (nilaiAkhir! < BOBOT_PENILAIAN.kkmNilaiAkhir) {
      reasons.push(`nilai akhir ${nilaiAkhir} (di bawah standar minimal 50)`);
    }

    if (Number(siswa.kehadiran) < BOBOT_PENILAIAN.minKehadiran) {
      reasons.push(`kehadiran ${siswa.kehadiran}% (di bawah batas minimal 80%)`);
    }

    if (persenCapaian! < BOBOT_PENILAIAN.targetMuhafadzohMin) {
      reasons.push(`capaian Muhafadzoh baru ${persenCapaian}% (target 100%, kurang ${kekuranganMuhafadzoh})`);
    }

    if (reasons.length === 0) {
      statusRekomendasi = 'Naik Kelas';
      alasanRekomendasi = 'Memenuhi seluruh kriteria akademik (Nilai Akhir ≥ 50), kehadiran (≥ 80%), dan target muhafadzoh (≥ 100%).';
    } else {
      statusRekomendasi = 'BELUM MEMENUHI SYARAT';
      alasanRekomendasi = `Belum memenuhi syarat karena ${reasons.join(', dan ')}.`;
    }
  }

  return {
    hasAnyCapaian,
    isCapaianLengkap,
    totalCapaian,
    kekuranganMuhafadzoh,
    persenCapaian,
    nilaiMuhafadzoh,
    hasUjianTulisLengkap,
    rataUjianTulis,
    hasUjianLisanLengkap,
    rataUjianLisan,
    hasNilaiAkhir,
    nilaiAkhir,
    predikat,
    predikatLabel,
    statusDokumen,
    statusRekomendasi,
    alasanRekomendasi,
    catatanData,
  };
}
