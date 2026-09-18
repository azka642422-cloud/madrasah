export interface AcademicMapelScore {
  no: number;
  mapel: string;
  kitab: string;
  nilai: number | null;
}

export interface PengajianSoreScore {
  no: 1 | 2 | 3;
  nilai: number | null;
}

export interface MuhafadzohReportScore {
  kitab: string;
  batasan: string;
  jumlahNilai: number | null;
  rataRata: number | null;
}

export interface AcademicGradeRecord {
  nis: string;
  tahunAjaran: string;
  semester: 'Ganjil' | 'Genap';
  mapelScores: AcademicMapelScore[];
  muhafadzoh: MuhafadzohReportScore;
  pengajianSore: PengajianSoreScore[];
  kelakuan: string;
  kerajinan: string;
  kerapian: string;
  absensi: {
    sakit: number | null;
    izin: number | null;
    tanpaKeterangan: number | null;
  };
  ranking: number | null;
  jumlahSiswa: number | null;
  catatan: string;
  keputusan: string;
  waliKelas: string;
}

const PREFIX = 'annajiyah_prod_grade_';
const key = (tahunAjaran: string, semester: 'Ganjil' | 'Genap', nis: string) =>
  `${PREFIX}${tahunAjaran}_${semester}_${nis}`;

const emptyPengajianSore = (): PengajianSoreScore[] => [
  { no: 1, nilai: null },
  { no: 2, nilai: null },
  { no: 3, nilai: null },
];

const emptyRecord = (
  nis: string,
  tahunAjaran: string,
  semester: 'Ganjil' | 'Genap',
  mapelScores: AcademicMapelScore[] = [],
): AcademicGradeRecord => ({
  nis,
  tahunAjaran,
  semester,
  mapelScores,
  muhafadzoh: { kitab: '', batasan: '', jumlahNilai: null, rataRata: null },
  pengajianSore: emptyPengajianSore(),
  kelakuan: '',
  kerajinan: '',
  kerapian: '',
  absensi: { sakit: null, izin: null, tanpaKeterangan: null },
  ranking: null,
  jumlahSiswa: null,
  catatan: '',
  keputusan: '',
  waliKelas: '',
});

/**
 * Transitional client persistence for the production-cleanup branch.
 * No sample values are generated here. This service will be replaced by the
 * authenticated API/MySQL repository before the branch is considered ready.
 */
export const academicGradeService = {
  get(
    nis: string,
    tahunAjaran: string,
    semester: 'Ganjil' | 'Genap',
    defaultMapels: AcademicMapelScore[] = [],
  ): AcademicGradeRecord {
    const base = emptyRecord(nis, tahunAjaran, semester, defaultMapels);
    try {
      const raw = localStorage.getItem(key(tahunAjaran, semester, nis));
      if (!raw) return base;

      const parsed = JSON.parse(raw) as Partial<AcademicGradeRecord>;
      const pengajianSore = Array.isArray(parsed.pengajianSore)
        ? parsed.pengajianSore.slice(0, 3).map((row, index) => ({
            no: (index + 1) as 1 | 2 | 3,
            nilai: typeof row?.nilai === 'number' ? row.nilai : null,
          }))
        : emptyPengajianSore();

      while (pengajianSore.length < 3) {
        pengajianSore.push({ no: (pengajianSore.length + 1) as 1 | 2 | 3, nilai: null });
      }

      return {
        ...base,
        ...parsed,
        nis,
        tahunAjaran,
        semester,
        mapelScores:
          Array.isArray(parsed.mapelScores) && parsed.mapelScores.length
            ? parsed.mapelScores
            : defaultMapels,
        muhafadzoh: {
          kitab: parsed.muhafadzoh?.kitab ?? '',
          batasan: parsed.muhafadzoh?.batasan ?? '',
          jumlahNilai: parsed.muhafadzoh?.jumlahNilai ?? null,
          rataRata: parsed.muhafadzoh?.rataRata ?? null,
        },
        pengajianSore,
        kelakuan: parsed.kelakuan ?? '',
        kerajinan: parsed.kerajinan ?? '',
        kerapian: parsed.kerapian ?? '',
        absensi: {
          sakit: parsed.absensi?.sakit ?? null,
          izin: parsed.absensi?.izin ?? null,
          tanpaKeterangan: parsed.absensi?.tanpaKeterangan ?? null,
        },
      };
    } catch {
      return base;
    }
  },

  save(record: AcademicGradeRecord): void {
    localStorage.setItem(
      key(record.tahunAjaran, record.semester, record.nis),
      JSON.stringify(record),
    );
  },
};
