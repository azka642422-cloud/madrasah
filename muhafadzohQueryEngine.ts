import { SiswaMuhafadzoh } from '../types';
import { calculateMuhafadzohDanAkademik } from '../data/muhafadzohCalculations';
import { TARGET_MUHAFADZOH_RULES } from '../data/muhafadzohRules';

export interface QueryResultSection {
  type: 'text' | 'table' | 'cards' | 'callout' | 'student-detail' | 'disambiguation';
  title?: string;
  content?: string;
  tableHeaders?: string[];
  tableRows?: (string | number)[][];
  calloutType?: 'info' | 'warning' | 'success' | 'alert';
  matchedStudents?: SiswaMuhafadzoh[];
  selectedStudent?: SiswaMuhafadzoh;
  metadata?: any;
}

export interface QueryExecutionResult {
  query: string;
  category: string;
  summaryTitle: string;
  sections: QueryResultSection[];
  conclusion?: string;
  catatanData?: string[];
}

/**
 * Normalizes user text for robust keyword and pattern detection
 */
function cleanText(text: string): string {
  return text.toLowerCase().trim().replace(/[?!.,]/g, '');
}

export function executeMuhafadzohQuery(
  rawQuery: string,
  students: SiswaMuhafadzoh[]
): QueryExecutionResult {
  const q = cleanText(rawQuery);

  // 1. Ambiguity / Exact student search: "Cari NIS dan data Ahmad", "Ahmad", "Cari siswa X"
  if (
    q.startsWith('cari') ||
    q.startsWith('siapa siswa') ||
    q.startsWith('data siswa') ||
    q.startsWith('profil siswa') ||
    q.includes('nis dan data') ||
    q.startsWith('jelaskan mengapa') ||
    q.includes('mengapa siswa') ||
    (!q.includes('semua') && !q.includes('kelas') && !q.includes('target') && !q.includes('rekap') && !q.includes('urutkan'))
  ) {
    // Extract search terms
    let searchTerm = q
      .replace(/cari\s+nis\s+dan\s+data\s+/g, '')
      .replace(/cari\s+data\s+siswa\s+/g, '')
      .replace(/cari\s+siswa\s+/g, '')
      .replace(/cari\s+/g, '')
      .replace(/jelaskan\s+mengapa\s+siswa\s+ini\s+belum\s+memenuhi\s+syarat/g, '')
      .replace(/jelaskan\s+mengapa\s+siswa\s+/g, '')
      .replace(/jelaskan\s+mengapa\s+/g, '')
      .replace(/data\s+/g, '')
      .trim();

    if (searchTerm.length >= 2) {
      const matches = students.filter(s =>
        s.nama.toLowerCase().includes(searchTerm) || s.nis.includes(searchTerm)
      );

      if (matches.length === 1) {
        return buildSingleStudentAnalysis(matches[0], rawQuery);
      } else if (matches.length > 1) {
        // "Jika terdapat nama yang sama, jangan langsung menentukan siswa. Tampilkan NIS dan kelas agar pengguna dapat memilih siswa yang dimaksud."
        return {
          query: rawQuery,
          category: 'Pencarian Siswa (Disambiguasi)',
          summaryTitle: `Ditemukan ${matches.length} Siswa dengan Nama "${searchTerm}"`,
          sections: [
            {
              type: 'callout',
              calloutType: 'info',
              content: `Terdapat ${matches.length} siswa dengan nama yang cocok. Sesuai aturan, silakan pilih salah satu berdasarkan NIS dan Kelas untuk melihat analisis lengkap.`,
            },
            {
              type: 'disambiguation',
              title: 'Pilih Siswa yang Dimaksud:',
              matchedStudents: matches,
              tableHeaders: ['No', 'NIS', 'Nama Lengkap', 'Kelas', 'Tingkat', 'Status', 'Materi Muhafadzoh'],
              tableRows: matches.map((s, idx) => [
                idx + 1,
                s.nis,
                s.nama,
                s.kelas,
                `Kelas ${s.tingkat}`,
                s.status,
                s.materiMuhafadzoh,
              ]),
            },
          ],
          conclusion: 'Klik salah satu siswa di atas atau cari menggunakan NIS spesifik untuk menampilkan profil dan analisis komprehensif.',
          catatanData: [
            'Sistem tidak langsung menentukan siswa untuk mencegah kesalahan identifikasi pada nama yang serupa.',
          ],
        };
      }
    }
  }

  // 2. "Tampilkan semua siswa kelas 1" / "Tampilkan semua siswa kelas 1A", "kelas 3", dst.
  const matchKelas = q.match(/kelas\s*([1-6][abc]?|[1-6])/i);
  if (
    (q.includes('tampilkan') || q.includes('daftar') || q.includes('semua siswa') || q.includes('list')) &&
    matchKelas
  ) {
    const rawKelasParam = matchKelas[1].toUpperCase();
    return buildKelasStudentList(rawKelasParam, students, rawQuery);
  }

  // 3. "Berapa target muhafadzoh kelas 3?" / Target Muhafadzoh per kelas
  if (q.includes('target muhafadzoh') || (q.includes('target') && q.includes('hafalan'))) {
    if (matchKelas) {
      const tingkatNum = parseInt(matchKelas[1][0], 10);
      return buildTargetMuhafadzohExplanation(tingkatNum, rawQuery);
    } else {
      return buildAllTargetMuhafadzohExplanation(rawQuery);
    }
  }

  // 4. "Hitung nilai rata-rata siswa kelas 4"
  if (
    (q.includes('rata-rata') || q.includes('rata rata') || q.includes('hitung nilai')) &&
    matchKelas
  ) {
    const rawKelasParam = matchKelas[1].toUpperCase();
    return buildRataRataKelasAnalysis(rawKelasParam, students, rawQuery);
  }

  // 5. "Siapa yang belum memenuhi target muhafadzoh?" / "Kekurangan hafalan"
  if (
    q.includes('belum memenuhi target muhafadzoh') ||
    q.includes('belum memenuhi target') ||
    q.includes('kekurangan hafalan') ||
    q.includes('muhafadzoh belum tuntas')
  ) {
    const targetTingkat = matchKelas ? parseInt(matchKelas[1][0], 10) : undefined;
    return buildBelumTargetMuhafadzohAnalysis(students, rawQuery, targetTingkat);
  }

  // 6. "Tampilkan siswa dengan kehadiran di bawah 80%"
  if (
    (q.includes('kehadiran') && (q.includes('80') || q.includes('bawah') || q.includes('kurang'))) ||
    q.includes('absen rendah')
  ) {
    return buildKehadiranRendahAnalysis(students, rawQuery);
  }

  // 7. "Siapa yang direkomendasikan naik kelas?"
  if (
    q.includes('direkomendasikan naik kelas') ||
    q.includes('rekomendasi naik') ||
    q.includes('siapa yang naik')
  ) {
    return buildRekomendasiNaikAnalysis(students, rawQuery);
  }

  // 8. "Buat rekap kenaikan kelas semua kelas." / "Rekap seluruh kelas"
  if (
    q.includes('rekap kenaikan kelas') ||
    q.includes('rekap semua kelas') ||
    q.includes('rekap seluruh') ||
    q.includes('laporan kenaikan')
  ) {
    return buildRekapSeluruhKelasAnalysis(students, rawQuery);
  }

  // 9. "Tampilkan 10 siswa dengan nilai akhir terendah" / "nilai terendah"
  if (q.includes('nilai akhir terendah') || q.includes('nilai terendah') || q.includes('terbawah')) {
    return buildSiswaNilaiTerendahAnalysis(students, rawQuery);
  }

  // 10. "Urutkan capaian muhafadzoh tertinggi." / "capaian tertinggi"
  if (
    q.includes('capaian muhafadzoh tertinggi') ||
    q.includes('muhafadzoh tertinggi') ||
    q.includes('capaian tertinggi')
  ) {
    return buildCapaianMuhafadzohTertinggiAnalysis(students, rawQuery);
  }

  // 11. "Buat laporan hasil muhafadzoh kelas 1 sampai kelas 6." / "laporan muhafadzoh"
  if (
    q.includes('laporan hasil muhafadzoh') ||
    q.includes('laporan muhafadzoh') ||
    q.includes('rekap muhafadzoh')
  ) {
    return buildLaporanMuhafadzoh1Sampai6(students, rawQuery);
  }

  // 12. "Cari siswa yang belum memenuhi syarat" / Siswa Bermasalah
  if (
    q.includes('belum memenuhi syarat') ||
    q.includes('siswa bermasalah') ||
    q.includes('perlu perhatian')
  ) {
    return buildSiswaBermasalahAnalysis(students, rawQuery);
  }

  // Default fallback: Search across students or provide guide
  const fallbackMatches = students.filter(
    s => s.nama.toLowerCase().includes(q) || s.nis.includes(q)
  );

  if (fallbackMatches.length === 1) {
    return buildSingleStudentAnalysis(fallbackMatches[0], rawQuery);
  } else if (fallbackMatches.length > 1) {
    return {
      query: rawQuery,
      category: 'Hasil Pencarian Siswa',
      summaryTitle: `Ditemukan ${fallbackMatches.length} Siswa`,
      sections: [
        {
          type: 'disambiguation',
          title: 'Daftar Siswa Ditemukan:',
          matchedStudents: fallbackMatches,
          tableHeaders: ['No', 'NIS', 'Nama Lengkap', 'Kelas', 'Tingkat', 'Status'],
          tableRows: fallbackMatches.map((s, idx) => [
            idx + 1,
            s.nis,
            s.nama,
            s.kelas,
            `Kelas ${s.tingkat}`,
            s.status,
          ]),
        },
      ],
      conclusion: 'Silakan klik salah satu siswa untuk menampilkan analisis terperinci.',
      catatanData: ['Gunakan nama spesifik atau nomor induk (NIS) untuk pencarian langsung.'],
    };
  }

  // General Guidance
  return {
    query: rawQuery,
    category: 'Panduan Asisten',
    summaryTitle: 'Perintah Diterima - Ringkasan Analisis Data',
    sections: [
      {
        type: 'callout',
        calloutType: 'info',
        content: `Perintah "${rawQuery}" dapat diakses secara langsung melalui tombol cepat atau perintah terstruktur. Sistem mengelola data resmi 247 siswa dari Kelas 1 sampai Kelas 6.`,
      },
    ],
    conclusion: 'Pilih opsi cepat pada panel asisten di atas atau ketik nama/NIS siswa yang ingin dianalisis.',
    catatanData: [
      'Gunakan data resmi yang tersedia sebagai sumber utama.',
      'Sistem membedakan data kosong dengan angka 0 secara ketat.',
    ],
  };
}

// -------------------------------------------------------------
// HELPER BUILDERS ACCORDING TO USER'S EXACT RULES & SPECIFICATIONS
// -------------------------------------------------------------

export function buildSingleStudentAnalysis(
  siswa: SiswaMuhafadzoh,
  rawQuery: string
): QueryExecutionResult {
  const calc = calculateMuhafadzohDanAkademik(siswa);

  const tableHeaders = ['Komponen Penilaian', 'Target / Standar', 'Capaian / Nilai', 'Keterangan'];
  const tableRows: (string | number)[][] = [
    ['Materi Muhafadzoh', '-', siswa.materiMuhafadzoh, `Tingkat Kelas ${siswa.tingkat}`],
    ['Target Tahunan', `${siswa.targetTahunan} satuan`, '-', 'Target total 8 kali setoran'],
    [
      'Total Capaian Muhafadzoh',
      `${siswa.targetTahunan}`,
      calc.totalCapaian !== null ? `${calc.totalCapaian}` : 'Belum Lengkap',
      calc.hasAnyCapaian ? `Kekurangan: ${calc.kekuranganMuhafadzoh ?? 0}` : 'Data capaian belum lengkap',
    ],
    [
      'Persentase Muhafadzoh',
      '100%',
      calc.persenCapaian !== null ? `${calc.persenCapaian}%` : 'Belum Ada',
      calc.persenCapaian !== null && calc.persenCapaian >= 100 ? 'Memenuhi Target (100%)' : 'Belum Tuntas',
    ],
    [
      'Nilai Muhafadzoh (Bobot 30%)',
      'Maksimal 100',
      calc.nilaiMuhafadzoh !== null ? `${calc.nilaiMuhafadzoh}` : 'Belum Ada',
      'MIN(100, Persentase)',
    ],
    [
      'Rata-rata Ujian Tulis (Bobot 35%)',
      'KKM 50',
      calc.rataUjianTulis !== null ? `${calc.rataUjianTulis}` : 'Belum Lengkap',
      calc.hasUjianTulisLengkap
        ? `S1: ${siswa.ujianTulisS1 ?? '-'}, S2: ${siswa.ujianTulisS2 ?? '-'}`
        : 'Salah satu/kedua nilai semester belum diisi',
    ],
    [
      'Rata-rata Ujian Lisan (Bobot 30%)',
      'KKM 50',
      calc.rataUjianLisan !== null ? `${calc.rataUjianLisan}` : 'Belum Lengkap',
      calc.hasUjianLisanLengkap
        ? `S1: ${siswa.ujianLisanS1 ?? '-'}, S2: ${siswa.ujianLisanS2 ?? '-'}`
        : 'Salah satu/kedua nilai semester belum diisi',
    ],
    [
      'Kehadiran (Bobot 5%)',
      'Minimal 80%',
      siswa.kehadiran !== null && siswa.kehadiran !== undefined ? `${siswa.kehadiran}%` : 'Belum Ada',
      siswa.kehadiran !== null && Number(siswa.kehadiran) >= 80 ? 'Memenuhi Presensi (≥ 80%)' : 'Di Bawah Standar (< 80%)',
    ],
    [
      'Nilai Akhir Terpadu',
      'KKM 50',
      calc.nilaiAkhir !== null ? `${calc.nilaiAkhir}` : 'Belum dapat dihitung',
      calc.hasNilaiAkhir ? `Predikat: ${calc.predikatLabel}` : 'Perhitungan nilai akhir belum lengkap',
    ],
    [
      'Predikat',
      '-',
      calc.predikatLabel,
      calc.predikat ? `Kategori Predikat ${calc.predikat}` : 'Menunggu kelengkapan data',
    ],
    [
      'Status Kenaikan (Dokumen)',
      'Nilai Akhir ≥ 50',
      calc.statusDokumen,
      calc.nilaiAkhir !== null
        ? (calc.nilaiAkhir >= 50 ? 'Memenuhi Nilai Akademik' : 'Nilai Akhir < 50')
        : 'Data belum lengkap',
    ],
    [
      'Status Rekomendasi (Akademik + Muhafadzoh)',
      'Nilai ≥50, Presensi ≥80%, Hafalan 100%',
      calc.statusRekomendasi,
      calc.alasanRekomendasi,
    ],
  ];

  return {
    query: rawQuery,
    category: 'Analisis Individual Siswa',
    summaryTitle: `Analisis Data Siswa: ${siswa.nama} (NIS: ${siswa.nis})`,
    sections: [
      {
        type: 'student-detail',
        selectedStudent: siswa,
        title: 'Biodata & Identitas Santri',
        content: `Nama: ${siswa.nama} | NIS: ${siswa.nis} | Kelas: ${siswa.kelas} (Tingkat ${siswa.tingkat}) | Status: ${siswa.status}`,
      },
      {
        type: 'table',
        title: 'Tabel Komponen Asesmen & Muhafadzoh',
        tableHeaders,
        tableRows,
      },
      {
        type: 'callout',
        calloutType:
          calc.statusRekomendasi === 'Naik Kelas'
            ? 'success'
            : calc.statusRekomendasi === 'BELUM MEMENUHI SYARAT'
            ? 'warning'
            : 'info',
        title: `Status Rekomendasi: ${calc.statusRekomendasi}`,
        content: calc.alasanRekomendasi,
      },
    ],
    conclusion: `Siswa ${siswa.nama} (NIS: ${siswa.nis}) berada di ${siswa.kelas}. Status dokumen: "${calc.statusDokumen}". Status rekomendasi akademik & muhafadzoh: "${calc.statusRekomendasi}".`,
    catatanData: calc.catatanData.length > 0 ? calc.catatanData : undefined,
  };
}

function buildKelasStudentList(
  kelasParam: string,
  students: SiswaMuhafadzoh[],
  rawQuery: string
): QueryExecutionResult {
  // Can be "1" (all 1A and 1B), or "1A" specifically
  let matched: SiswaMuhafadzoh[];
  if (kelasParam.length === 1 && /^[1-6]$/.test(kelasParam)) {
    const tingkatNum = parseInt(kelasParam, 10);
    matched = students.filter(s => s.tingkat === tingkatNum);
  } else {
    matched = students.filter(s => s.kelas.toUpperCase() === kelasParam);
  }

  const tableHeaders = ['No', 'NIS', 'Nama Lengkap', 'JK', 'Kelas', 'Status', 'Materi Muhafadzoh', 'Target Tahunan'];
  const tableRows = matched.map((s, idx) => [
    idx + 1,
    s.nis,
    s.nama,
    s.jk,
    s.kelas,
    s.status,
    s.materiMuhafadzoh,
    s.targetTahunan,
  ]);

  return {
    query: rawQuery,
    category: 'Daftar Siswa Per Kelas',
    summaryTitle: `Daftar Seluruh Siswa Kelas ${kelasParam} (Total: ${matched.length} Siswa)`,
    sections: [
      {
        type: 'callout',
        calloutType: 'info',
        content: `Menampilkan seluruh ${matched.length} siswa resmi yang terdaftar pada Kelas ${kelasParam}. Tidak ada data siswa fiktif yang dibuat.`,
      },
      {
        type: 'table',
        title: `Tabel Siswa Kelas ${kelasParam}`,
        tableHeaders,
        tableRows,
      },
    ],
    conclusion: `Total terdapat ${matched.length} siswa pada Kelas ${kelasParam} (${matched.filter(s => s.status === 'Aktif').length} siswa aktif).`,
    catatanData: [
      'Data diambil langsung dari dataset resmi 247 santri madrasah tanpa rekayasa identitas.',
    ],
  };
}

function buildTargetMuhafadzohExplanation(
  tingkat: number,
  rawQuery: string
): QueryExecutionResult {
  const rule = TARGET_MUHAFADZOH_RULES[tingkat];
  if (!rule) {
    return buildAllTargetMuhafadzohExplanation(rawQuery);
  }

  const tableHeaders = ['Setoran Ke-', 'Target Satuan', 'Satuan Ukuran', 'Keterangan'];
  const tableRows = rule.targetPerSetoran.map((t, idx) => [
    `Setoran ${idx + 1}`,
    t,
    rule.satuan,
    `Tahap ke-${idx + 1} dalam satu tahun ajaran`,
  ]);

  return {
    query: rawQuery,
    category: 'Ketentuan Target Muhafadzoh',
    summaryTitle: `Target Muhafadzoh Kelas ${tingkat}: ${rule.namaMateri}`,
    sections: [
      {
        type: 'callout',
        calloutType: 'info',
        title: `Materi: ${rule.namaMateri}`,
        content: `Total target tahunan Kelas ${tingkat} adalah ${rule.targetTahunan} ${rule.satuan} yang dibagi ke dalam 8 kali setoran muhafadzoh. ${rule.catatanKhusus || ''}`,
      },
      {
        type: 'table',
        title: `Rincian 8 Kali Setoran Kelas ${tingkat}`,
        tableHeaders,
        tableRows,
      },
    ],
    conclusion: `Total target tahunan untuk Kelas ${tingkat} adalah tepat ${rule.targetTahunan} ${rule.satuan}. Perhitungan persentase muhafadzoh menggunakan rumus: (Total Capaian / ${rule.targetTahunan}) × 100.`,
    catatanData: rule.catatanKhusus ? [rule.catatanKhusus] : undefined,
  };
}

function buildAllTargetMuhafadzohExplanation(rawQuery: string): QueryExecutionResult {
  const tableHeaders = ['Tingkat', 'Materi Muhafadzoh', 'Rincian 8 Setoran', 'Target Tahunan', 'Satuan'];
  const tableRows: (string | number)[][] = Object.values(TARGET_MUHAFADZOH_RULES).map(r => [
    `Kelas ${r.tingkat}`,
    r.namaMateri,
    r.targetPerSetoran.join(', '),
    r.targetTahunan,
    r.satuan,
  ]);

  return {
    query: rawQuery,
    category: 'Target Muhafadzoh Pesantren',
    summaryTitle: 'Standar Target Muhafadzoh Kelas 1 sampai Kelas 6',
    sections: [
      {
        type: 'table',
        title: 'Tabel Target Muhafadzoh Per Tingkat Kelas',
        tableHeaders,
        tableRows,
      },
      {
        type: 'callout',
        calloutType: 'info',
        title: 'Catatan Khusus Kelas 5 & Kelas 6',
        content:
          'Kelas 5: Deskripsi materi menyebut 80 bait, tetapi rincian target 8 kali setoran (11, 11, 10, 10, 10, 10, 10, 10) menghasilkan 82 bait. Untuk perhitungan gunakan 82 bait sampai administrator mengubah ketentuan.\nKelas 6: Materi Surat dan Wirid (8 item materi/surah untuk Semester I dan II).',
      },
    ],
    conclusion:
      'Setiap kelas memiliki target spesifik yang dilaksanakan sebanyak 8 kali setoran per tahun. Nilai Muhafadzoh dihitung dengan bobot 30% dari total nilai akhir.',
  };
}

function buildRataRataKelasAnalysis(
  kelasParam: string,
  students: SiswaMuhafadzoh[],
  rawQuery: string
): QueryExecutionResult {
  let matched: SiswaMuhafadzoh[];
  if (kelasParam.length === 1 && /^[1-6]$/.test(kelasParam)) {
    const tingkatNum = parseInt(kelasParam, 10);
    matched = students.filter(s => s.tingkat === tingkatNum);
  } else {
    matched = students.filter(s => s.kelas.toUpperCase() === kelasParam);
  }

  const aktif = matched.filter(s => s.status === 'Aktif');

  // Calculate stats
  let totalTulis = 0;
  let countTulis = 0;
  let totalLisan = 0;
  let countLisan = 0;
  let totalMuhafadzoh = 0;
  let countMuhafadzoh = 0;
  let totalNilaiAkhir = 0;
  let countNilaiAkhir = 0;

  matched.forEach(s => {
    const calc = calculateMuhafadzohDanAkademik(s);
    if (calc.rataUjianTulis !== null) {
      totalTulis += calc.rataUjianTulis;
      countTulis++;
    }
    if (calc.rataUjianLisan !== null) {
      totalLisan += calc.rataUjianLisan;
      countLisan++;
    }
    if (calc.nilaiMuhafadzoh !== null) {
      totalMuhafadzoh += calc.nilaiMuhafadzoh;
      countMuhafadzoh++;
    }
    if (calc.nilaiAkhir !== null) {
      totalNilaiAkhir += calc.nilaiAkhir;
      countNilaiAkhir++;
    }
  });

  const avgTulis = countTulis > 0 ? (totalTulis / countTulis).toFixed(2) : 'Belum Ada Data';
  const avgLisan = countLisan > 0 ? (totalLisan / countLisan).toFixed(2) : 'Belum Ada Data';
  const avgMuhafadzoh = countMuhafadzoh > 0 ? (totalMuhafadzoh / countMuhafadzoh).toFixed(2) : 'Belum Ada Data';
  const avgNilaiAkhir = countNilaiAkhir > 0 ? (totalNilaiAkhir / countNilaiAkhir).toFixed(2) : 'Belum Ada Data';

  const tableHeaders = ['Parameter', 'Jumlah Data Terisi', 'Rata-rata Kelas', 'Keterangan'];
  const tableRows = [
    ['Jumlah Siswa Terdaftar', `${matched.length} siswa`, `${aktif.length} aktif`, `${matched.length - aktif.length} keluar`],
    ['Rata-rata Ujian Tulis', `${countTulis} / ${matched.length}`, avgTulis, 'Bobot 35% pada Nilai Akhir'],
    ['Rata-rata Ujian Lisan', `${countLisan} / ${matched.length}`, avgLisan, 'Bobot 30% pada Nilai Akhir'],
    ['Rata-rata Nilai Muhafadzoh', `${countMuhafadzoh} / ${matched.length}`, avgMuhafadzoh, 'Bobot 30% pada Nilai Akhir'],
    ['Rata-rata Nilai Akhir Kelas', `${countNilaiAkhir} / ${matched.length}`, avgNilaiAkhir, 'KKM Standar: 50.00'],
  ];

  return {
    query: rawQuery,
    category: 'Analisis Nilai Per Kelas',
    summaryTitle: `Analisis Nilai Rata-rata Kelas ${kelasParam}`,
    sections: [
      {
        type: 'table',
        title: `Statistik Rata-rata Kelas ${kelasParam}`,
        tableHeaders,
        tableRows,
      },
      {
        type: 'callout',
        calloutType: 'info',
        title: 'Status Kelengkapan Data',
        content: `Dari ${matched.length} siswa di Kelas ${kelasParam}, terdapat ${countNilaiAkhir} siswa yang telah memiliki nilai akhir lengkap. Siswa yang belum memiliki nilai ujian atau capaian muhafadzoh tidak dihitung sebagai nilai 0.`,
      },
    ],
    conclusion: `Rata-rata nilai akhir kelas ${kelasParam} adalah ${avgNilaiAkhir}. Data capaian muhafadzoh dan nilai ujian yang belum dimasukkan oleh guru ditandai sebagai data belum lengkap.`,
    catatanData: [
      'Sesuai aturan, nilai kosong bukan bernilai 0, melainkan "belum ada data".',
      'Jangan menetapkan status Tidak Naik hanya karena nilai belum dimasukkan.',
    ],
  };
}

function buildBelumTargetMuhafadzohAnalysis(
  students: SiswaMuhafadzoh[],
  rawQuery: string,
  filterTingkat?: number
): QueryExecutionResult {
  const filtered = filterTingkat ? students.filter(s => s.tingkat === filterTingkat) : students;

  const results: {
    siswa: SiswaMuhafadzoh;
    capaian: number;
    target: number;
    kekurangan: number;
    persen: number;
    keterangan: string;
  }[] = [];

  filtered.forEach(s => {
    const calc = calculateMuhafadzohDanAkademik(s);
    if (!calc.hasAnyCapaian) {
      results.push({
        siswa: s,
        capaian: 0,
        target: s.targetTahunan,
        kekurangan: s.targetTahunan,
        persen: 0,
        keterangan: 'Data capaian muhafadzoh belum lengkap (belum ada setoran diinput)',
      });
    } else if (calc.persenCapaian !== null && calc.persenCapaian < 100) {
      results.push({
        siswa: s,
        capaian: calc.totalCapaian ?? 0,
        target: s.targetTahunan,
        kekurangan: calc.kekuranganMuhafadzoh ?? (s.targetTahunan - (calc.totalCapaian ?? 0)),
        persen: calc.persenCapaian,
        keterangan: `Capaian baru ${calc.persenCapaian}%, kurang ${calc.kekuranganMuhafadzoh} dari target tahunan`,
      });
    }
  });

  const tableHeaders = ['No', 'NIS', 'Nama Lengkap', 'Kelas', 'Target', 'Total Capaian', 'Kekurangan', 'Persen', 'Keterangan'];
  // Limit to first 30 if too long, with clear note
  const displayResults = results.slice(0, 35);
  const tableRows = displayResults.map((r, idx) => [
    idx + 1,
    r.siswa.nis,
    r.siswa.nama,
    r.siswa.kelas,
    r.target,
    r.capaian,
    r.kekurangan,
    `${r.persen}%`,
    r.keterangan,
  ]);

  return {
    query: rawQuery,
    category: 'Target Muhafadzoh Belum Terpenuhi',
    summaryTitle: `Siswa yang Belum Memenuhi Target Muhafadzoh 100% (${results.length} Siswa)`,
    sections: [
      {
        type: 'callout',
        calloutType: 'warning',
        title: 'Status Capaian Muhafadzoh',
        content: `Terdapat ${results.length} siswa yang capaian muhafadzohnya belum mencapai target 100% atau data setorannya belum lengkap diinput.`,
      },
      {
        type: 'table',
        title: `Daftar Siswa Belum Memenuhi Target Muhafadzoh ${filterTingkat ? `(Kelas ${filterTingkat})` : '(Menampilkan 35 Teratas)'}`,
        tableHeaders,
        tableRows,
      },
    ],
    conclusion: `Sebanyak ${results.length} siswa belum mencapai target hafalan tahunan. Agar direkomendasikan naik kelas, capaian muhafadzoh wajib mencapai minimal 100%.`,
    catatanData: [
      'Jangan menganggap kolom kosong sebagai capaian penuh atau capaian 0 tetap. Siswa tanpa data setoran diberi keterangan "Data capaian muhafadzoh belum lengkap."',
    ],
  };
}

function buildKehadiranRendahAnalysis(
  students: SiswaMuhafadzoh[],
  rawQuery: string
): QueryExecutionResult {
  const lowAttendance = students.filter(
    s => s.kehadiran !== null && s.kehadiran !== undefined && Number(s.kehadiran) < 80
  );

  const tableHeaders = ['No', 'NIS', 'Nama Lengkap', 'Kelas', 'Kehadiran', 'Standar Minimal', 'Status'];
  const tableRows = lowAttendance.map((s, idx) => [
    idx + 1,
    s.nis,
    s.nama,
    s.kelas,
    `${s.kehadiran}%`,
    '80%',
    'Di Bawah Standar (< 80%)',
  ]);

  return {
    query: rawQuery,
    category: 'Kehadiran di Bawah 80%',
    summaryTitle: `Siswa dengan Kehadiran di Bawah 80% (${lowAttendance.length} Siswa)`,
    sections: [
      {
        type: 'callout',
        calloutType: lowAttendance.length > 0 ? 'warning' : 'info',
        title: 'Standar Presensi Madrasah',
        content:
          lowAttendance.length > 0
            ? `Ditemukan ${lowAttendance.length} siswa yang memiliki catatan persentase kehadiran di bawah 80%. Siswa ini tidak dapat direkomendasikan naik kelas sampai presensi diperbaiki.`
            : 'Saat ini belum ada data kehadiran yang berada di bawah 80% (atau data kehadiran siswa belum diinput lengkap).',
      },
      ...(lowAttendance.length > 0
        ? [
            {
              type: 'table' as const,
              title: 'Tabel Siswa dengan Kehadiran Kurang dari 80%',
              tableHeaders,
              tableRows,
            },
          ]
        : []),
    ],
    conclusion:
      lowAttendance.length > 0
        ? `Terdapat ${lowAttendance.length} siswa dengan kehadiran < 80%. Syarat rekomendasi naik kelas mensyaratkan kehadiran minimal 80%.`
        : 'Tidak ada siswa yang tercatat kehadiran di bawah 80% pada data saat ini.',
    catatanData: [
      'Siswa yang belum memiliki data presensi tidak disimpulkan gagal, melainkan ditandai "data belum lengkap".',
    ],
  };
}

function buildRekomendasiNaikAnalysis(
  students: SiswaMuhafadzoh[],
  rawQuery: string
): QueryExecutionResult {
  const naik: SiswaMuhafadzoh[] = [];
  const belumMemenuhi: { siswa: SiswaMuhafadzoh; alasan: string }[] = [];
  const belumLengkap: SiswaMuhafadzoh[] = [];

  students.forEach(s => {
    const calc = calculateMuhafadzohDanAkademik(s);
    if (calc.statusRekomendasi === 'Naik Kelas') {
      naik.push(s);
    } else if (calc.statusRekomendasi === 'BELUM MEMENUHI SYARAT') {
      belumMemenuhi.push({ siswa: s, alasan: calc.alasanRekomendasi });
    } else {
      belumLengkap.push(s);
    }
  });

  const tableHeaders = ['Kategori Rekomendasi', 'Jumlah Siswa', 'Persentase', 'Keterangan Kriteria'];
  const tableRows = [
    [
      'Direkomendasikan Naik Kelas',
      `${naik.length} siswa`,
      `${students.length > 0 ? ((naik.length / students.length) * 100).toFixed(1) : '0.0'}%`,
      'Memenuhi SEMUA: Nilai Akhir ≥ 50, Kehadiran ≥ 80%, Muhafadzoh ≥ 100%',
    ],
    [
      'BELUM MEMENUHI SYARAT',
      `${belumMemenuhi.length} siswa`,
      `${students.length > 0 ? ((belumMemenuhi.length / students.length) * 100).toFixed(1) : '0.0'}%`,
      'Salah satu atau lebih kriteria belum terpenuhi (alasan dicantumkan spesifik)',
    ],
    [
      'BELUM DAPAT DITENTUKAN',
      `${belumLengkap.length} siswa`,
      `${students.length > 0 ? ((belumLengkap.length / students.length) * 100).toFixed(1) : '0.0'}%`,
      'Data nilai ujian, kehadiran, atau muhafadzoh belum lengkap diinput',
    ],
  ];

  return {
    query: rawQuery,
    category: 'Status Rekomendasi Kenaikan Kelas',
    summaryTitle: 'Rekapitulasi Rekomendasi Kenaikan Kelas (Akademik + Muhafadzoh)',
    sections: [
      {
        type: 'table',
        title: 'Tabel Ringkasan Status Rekomendasi 247 Siswa',
        tableHeaders,
        tableRows,
      },
      {
        type: 'callout',
        calloutType: 'info',
        title: 'Ketentuan Evaluasi',
        content:
          'Sesuai Aturan 12, jangan menetapkan "Tidak Naik" atau "Gagal" hanya karena nilai belum dimasukkan. Siswa dengan data belum lengkap diberi status "BELUM DAPAT DITENTUKAN – data belum lengkap".',
      },
    ],
    conclusion: `Dari total 247 siswa: ${naik.length} direkomendasikan naik, ${belumMemenuhi.length} belum memenuhi syarat, dan ${belumLengkap.length} belum dapat ditentukan karena data nilai/setoran belum lengkap diisi.`,
    catatanData: [
      'Kenaikan kelas terbagi menjadi 2 status: Status Dokumen (Nilai Akhir ≥ 50) dan Status Rekomendasi (Nilai ≥ 50, Kehadiran ≥ 80%, Muhafadzoh ≥ 100%).',
    ],
  };
}

function buildRekapSeluruhKelasAnalysis(
  students: SiswaMuhafadzoh[],
  rawQuery: string
): QueryExecutionResult {
  const kelasList = ['1A', '1B', '2A', '2B', '3A', '3B', '3C', '4A', '4B', '5A', '5B', '6'];

  const tableHeaders = [
    'Kelas',
    'Jumlah Siswa',
    'Rata-rata Nilai',
    'Rata-rata Muhafadzoh',
    'Naik',
    'Belum Memenuhi',
    'Data Belum Lengkap',
  ];

  const tableRows: (string | number)[][] = [];

  let highestMuhafadzohKelas = '';
  let highestMuhafadzohScore = -1;
  let lowestMuhafadzohKelas = '';
  let lowestMuhafadzohScore = 999;
  let mostBelumMemenuhiKelas = '';
  let mostBelumMemenuhiCount = -1;

  kelasList.forEach(k => {
    const matched = students.filter(s => s.kelas.toUpperCase() === k);
    let totalNilai = 0;
    let countNilai = 0;
    let totalMuhafadzoh = 0;
    let countMuhafadzoh = 0;
    let naikCount = 0;
    let belumMemenuhiCount = 0;
    let belumLengkapCount = 0;

    matched.forEach(s => {
      const calc = calculateMuhafadzohDanAkademik(s);
      if (calc.nilaiAkhir !== null) {
        totalNilai += calc.nilaiAkhir;
        countNilai++;
      }
      if (calc.nilaiMuhafadzoh !== null) {
        totalMuhafadzoh += calc.nilaiMuhafadzoh;
        countMuhafadzoh++;
      }
      if (calc.statusRekomendasi === 'Naik Kelas') {
        naikCount++;
      } else if (calc.statusRekomendasi === 'BELUM MEMENUHI SYARAT') {
        belumMemenuhiCount++;
      } else {
        belumLengkapCount++;
      }
    });

    const avgNilai = countNilai > 0 ? (totalNilai / countNilai).toFixed(2) : '-';
    const avgMuhafadzoh = countMuhafadzoh > 0 ? (totalMuhafadzoh / countMuhafadzoh).toFixed(2) : '-';

    tableRows.push([
      k,
      matched.length,
      avgNilai,
      avgMuhafadzoh,
      naikCount,
      belumMemenuhiCount,
      belumLengkapCount,
    ]);

    // Comparisons
    const numMuhaf = countMuhafadzoh > 0 ? totalMuhafadzoh / countMuhafadzoh : 0;
    if (numMuhaf > highestMuhafadzohScore) {
      highestMuhafadzohScore = numMuhaf;
      highestMuhafadzohKelas = k;
    }
    if (numMuhaf < lowestMuhafadzohScore) {
      lowestMuhafadzohScore = numMuhaf;
      lowestMuhafadzohKelas = k;
    }
    if (belumMemenuhiCount > mostBelumMemenuhiCount) {
      mostBelumMemenuhiCount = belumMemenuhiCount;
      mostBelumMemenuhiKelas = k;
    }
  });

  return {
    query: rawQuery,
    category: 'Analisis Seluruh Kelas',
    summaryTitle: 'Rekapitulasi Asesmen & Kenaikan Kelas Seluruh Pesantren',
    sections: [
      {
        type: 'table',
        title: 'Tabel Rekapitulasi Per Kelas (1A sampai Kelas 6)',
        tableHeaders,
        tableRows,
      },
      {
        type: 'callout',
        calloutType: 'info',
        title: 'Ringkasan Capaian & Evaluasi Antar-Kelas',
        content: `• Capaian Muhafadzoh Tertinggi: Kelas ${highestMuhafadzohKelas || '1A'} (${highestMuhafadzohScore > 0 ? highestMuhafadzohScore.toFixed(2) : 'Menunggu input'})\n• Capaian Muhafadzoh Terendah: Kelas ${lowestMuhafadzohKelas || '6'}\n• Jumlah Siswa Belum Memenuhi Syarat Terbanyak: Kelas ${mostBelumMemenuhiKelas || '1A'} (${mostBelumMemenuhiCount > 0 ? mostBelumMemenuhiCount : 0} siswa)`,
      },
    ],
    conclusion:
      'Tabel di atas mengelompokkan 247 siswa berdasarkan 12 rombel kelas. Sebagian besar kelas saat ini masih berstatus "Data Belum Lengkap" karena menunggu setoran dan nilai ujian akhir semester.',
    catatanData: [
      'Nilai kosong diperlakukan sebagai "data belum ada", bukan nilai 0.',
      'Administrator dan dewan asatidz dapat memasukkan setoran hafalan secara bertahap pada tabel.',
    ],
  };
}

function buildSiswaBermasalahAnalysis(
  students: SiswaMuhafadzoh[],
  rawQuery: string
): QueryExecutionResult {
  const atRiskList: {
    siswa: SiswaMuhafadzoh;
    nilaiAkhir: string;
    kehadiran: string;
    muhafadzoh: string;
    kekurangan: string;
    alasan: string;
  }[] = [];

  students.forEach(s => {
    const calc = calculateMuhafadzohDanAkademik(s);
    if (calc.statusRekomendasi === 'BELUM MEMENUHI SYARAT') {
      atRiskList.push({
        siswa: s,
        nilaiAkhir: calc.nilaiAkhir !== null ? `${calc.nilaiAkhir}` : '-',
        kehadiran: s.kehadiran !== null && s.kehadiran !== undefined ? `${s.kehadiran}%` : '-',
        muhafadzoh: calc.persenCapaian !== null ? `${calc.persenCapaian}%` : '-',
        kekurangan: calc.kekuranganMuhafadzoh !== null ? `${calc.kekuranganMuhafadzoh}` : '-',
        alasan: calc.alasanRekomendasi,
      });
    }
  });

  const tableHeaders = ['NIS', 'Nama', 'Kelas', 'Nilai Akhir', 'Kehadiran', 'Muhafadzoh', 'Kekurangan', 'Alasan'];
  const tableRows = atRiskList.slice(0, 30).map(item => [
    item.siswa.nis,
    item.siswa.nama,
    item.siswa.kelas,
    item.nilaiAkhir,
    item.kehadiran,
    item.muhafadzoh,
    item.kekurangan,
    item.alasan,
  ]);

  return {
    query: rawQuery,
    category: 'Pencarian Siswa Bermasalah',
    summaryTitle: `Daftar Siswa Belum Memenuhi Syarat (${atRiskList.length} Siswa)`,
    sections: [
      {
        type: 'callout',
        calloutType: 'warning',
        title: 'Kriteria Pemeriksaan Siswa Bermasalah',
        content:
          'Siswa dimasukkan ke daftar ini apabila: Nilai Akhir < 50, ATAU Kehadiran < 80%, ATAU Capaian Muhafadzoh < 100%, atau kombinasi ketiganya.',
      },
      {
        type: 'table',
        title: 'Tabel Siswa yang Belum Memenuhi Syarat',
        tableHeaders,
        tableRows,
      },
    ],
    conclusion:
      atRiskList.length > 0
        ? `Ditemukan ${atRiskList.length} siswa yang belum memenuhi syarat kenaikan kelas dengan alasan spesifik tercantum pada tabel.`
        : 'Tidak ada siswa yang divonis "Belum Memenuhi Syarat" (seluruh siswa lainnya masih dalam proses pengisian data atau telah memenuhi syarat).',
    catatanData: [
      'Siswa yang belum ada nilai tidak dimasukkan ke dalam kategori tidak naik, melainkan "Belum dapat ditentukan".',
    ],
  };
}

function buildSiswaNilaiTerendahAnalysis(
  students: SiswaMuhafadzoh[],
  rawQuery: string
): QueryExecutionResult {
  const evaluated = students
    .map(s => ({ siswa: s, calc: calculateMuhafadzohDanAkademik(s) }))
    .filter(item => item.calc.nilaiAkhir !== null)
    .sort((a, b) => (a.calc.nilaiAkhir ?? 0) - (b.calc.nilaiAkhir ?? 0))
    .slice(0, 10);

  const tableHeaders = ['No', 'NIS', 'Nama Siswa', 'Kelas', 'Rata Tulis', 'Rata Lisan', 'Muhafadzoh', 'Kehadiran', 'Nilai Akhir', 'Predikat'];
  const tableRows = evaluated.map((item, idx) => [
    idx + 1,
    item.siswa.nis,
    item.siswa.nama,
    item.siswa.kelas,
    item.calc.rataUjianTulis ?? '-',
    item.calc.rataUjianLisan ?? '-',
    item.calc.nilaiMuhafadzoh ?? '-',
    item.siswa.kehadiran !== null ? `${item.siswa.kehadiran}%` : '-',
    item.calc.nilaiAkhir ?? '-',
    item.calc.predikatLabel,
  ]);

  return {
    query: rawQuery,
    category: '10 Siswa Nilai Akhir Terendah',
    summaryTitle: '10 Siswa dengan Nilai Akhir Terendah (Data Lengkap)',
    sections: [
      {
        type: 'table',
        title: 'Tabel 10 Siswa dengan Nilai Akhir Terendah',
        tableHeaders,
        tableRows,
      },
      {
        type: 'callout',
        calloutType: evaluated.length > 0 ? 'warning' : 'info',
        content:
          evaluated.length > 0
            ? 'Daftar di atas diurutkan dari nilai akhir terendah berdasarkan data yang telah memiliki seluruh komponen asesmen lengkap.'
            : 'Belum ada siswa dengan nilai akhir lengkap. Siswa yang datanya belum lengkap tidak diberi nilai 0 untuk mencegah kesimpulan yang keliru.',
      },
    ],
    conclusion:
      evaluated.length > 0
        ? `Terdapat ${evaluated.length} siswa yang memiliki nilai terendah di antara siswa yang telah lengkap nilainya.`
        : 'Perhitungan nilai akhir belum dapat dilakukan secara lengkap karena nilai semester belum diisi.',
  };
}

function buildCapaianMuhafadzohTertinggiAnalysis(
  students: SiswaMuhafadzoh[],
  rawQuery: string
): QueryExecutionResult {
  const evaluated = students
    .map(s => ({ siswa: s, calc: calculateMuhafadzohDanAkademik(s) }))
    .filter(item => item.calc.totalCapaian !== null)
    .sort((a, b) => (b.calc.persenCapaian ?? 0) - (a.calc.persenCapaian ?? 0))
    .slice(0, 15);

  const tableHeaders = ['No', 'NIS', 'Nama Siswa', 'Kelas', 'Materi', 'Target', 'Total Capaian', 'Persen Capaian', 'Nilai Muhafadzoh'];
  const tableRows = evaluated.map((item, idx) => [
    idx + 1,
    item.siswa.nis,
    item.siswa.nama,
    item.siswa.kelas,
    item.siswa.materiMuhafadzoh,
    item.siswa.targetTahunan,
    item.calc.totalCapaian ?? 0,
    `${item.calc.persenCapaian}%`,
    item.calc.nilaiMuhafadzoh ?? 0,
  ]);

  return {
    query: rawQuery,
    category: 'Capaian Muhafadzoh Tertinggi',
    summaryTitle: 'Peringkat Siswa dengan Capaian Muhafadzoh Tertinggi',
    sections: [
      {
        type: 'table',
        title: 'Tabel 15 Siswa dengan Persentase Muhafadzoh Tertinggi',
        tableHeaders,
        tableRows,
      },
    ],
    conclusion:
      evaluated.length > 0
        ? 'Daftar di atas menampilkan santri dengan dedikasi setoran hafalan tertinggi sesuai materi kelasnya masing-masing.'
        : 'Data setoran muhafadzoh masih menunggu input dari guru pengampu.',
  };
}

function buildLaporanMuhafadzoh1Sampai6(
  students: SiswaMuhafadzoh[],
  rawQuery: string
): QueryExecutionResult {
  const tableHeaders = [
    'Tingkat',
    'Materi Hafalan',
    'Target Tahunan',
    'Satuan',
    'Jumlah Siswa',
    'Target Terpenuhi',
    'Belum Terpenuhi / Belum Lengkap',
  ];

  const tableRows: (string | number)[][] = [];

  [1, 2, 3, 4, 5, 6].forEach(tingkat => {
    const rule = TARGET_MUHAFADZOH_RULES[tingkat];
    const matched = students.filter(s => s.tingkat === tingkat);
    let terpenuhiCount = 0;
    let belumCount = 0;

    matched.forEach(s => {
      const calc = calculateMuhafadzohDanAkademik(s);
      if (calc.persenCapaian !== null && calc.persenCapaian >= 100) {
        terpenuhiCount++;
      } else {
        belumCount++;
      }
    });

    tableRows.push([
      `Kelas ${tingkat}`,
      rule.namaMateri,
      rule.targetTahunan,
      rule.satuan,
      matched.length,
      terpenuhiCount,
      belumCount,
    ]);
  });

  return {
    query: rawQuery,
    category: 'Laporan Hasil Muhafadzoh Kelas 1-6',
    summaryTitle: 'Laporan Hasil Muhafadzoh Terpadu Tingkat 1 sampai Tingkat 6',
    sections: [
      {
        type: 'table',
        title: 'Tabel Rekapitulasi Capaian Muhafadzoh Per Tingkat',
        tableHeaders,
        tableRows,
      },
      {
        type: 'callout',
        calloutType: 'info',
        title: 'Keterangan Distribusi Target',
        content:
          'Kelas 1: 53 Wazan (Tashrif Tsulatsi Mujarrod)\nKelas 2: 55 Wazan (Tashrif Lughowi)\nKelas 3: 130 Bait (Nadzom Imrithi)\nKelas 4: 124 Bait (Nadzom Imrithi)\nKelas 5: 82 Bait (Nadzom Qowaidus Shorfiyah Jilid 1)\nKelas 6: 8 Surat dan Wirid',
      },
    ],
    conclusion:
      'Laporan muhafadzoh mencakup seluruh 247 siswa. Rincian target telah disesuaikan secara presisi dengan kurikulum salafiyah madrasah.',
  };
}
