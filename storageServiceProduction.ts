import type { SesiAbsensi } from './types';

/**
 * Compatibility storage layer.
 *
 * This file restores the missing module required by the current UI so the
 * production-cleanup branch can be migrated incrementally to the server API.
 * It intentionally contains NO demo/default student records. Empty data stays
 * empty until it is supplied by validated institutional data or the API.
 */
const KEYS = {
  students: 'annajiyah_prod_students',
  tahunAjaran: 'annajiyah_prod_tahun_ajaran',
  semester: 'annajiyah_prod_semester',
  signatures: 'annajiyah_prod_signatures',
  muhafadzoh: 'annajiyah_prod_muhafadzoh',
  absensiSession: 'annajiyah_prod_absensi_session',
} as const;

const read = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const write = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

export interface ProductionStudent {
  nis: string;
  nama: string;
  kelas: string;
  [key: string]: unknown;
}

export interface ProductionSignatures {
  namaKepalaMadrasah?: string;
  titimangsaRaport?: string;
  titimangsaIjazah?: string;
  namaPengasuh?: string;
  musrifPerKelas?: Record<string, string>;
  [key: string]: unknown;
}

export interface ProductionMuhafadzoh {
  nis: string;
  materiMuhafadzoh?: string;
  kitabMuhafadzoh?: string;
  targetTahunan?: string;
  targetBait?: string | number;
  nilaiUjianMuhafadzoh?: number | null;
  nilaiMuhafadzoh?: number | null;
  [key: string]: unknown;
}

export const storageService = {
  getStudents(): ProductionStudent[] {
    return read<ProductionStudent[]>(KEYS.students, []);
  },
  saveStudents(students: ProductionStudent[]): void {
    write(KEYS.students, students);
  },
  getTahunAjaran(): string {
    return read<string>(KEYS.tahunAjaran, '');
  },
  saveTahunAjaran(value: string): void {
    write(KEYS.tahunAjaran, value.trim());
  },
  getSemester(): 'Ganjil' | 'Genap' {
    return read<'Ganjil' | 'Genap'>(KEYS.semester, 'Ganjil');
  },
  saveSemester(value: 'Ganjil' | 'Genap'): void {
    write(KEYS.semester, value);
  },
  getSignaturesAndMusrif(): ProductionSignatures {
    return read<ProductionSignatures>(KEYS.signatures, {});
  },
  saveSignaturesAndMusrif(value: ProductionSignatures): void {
    write(KEYS.signatures, value);
  },
  getMuhafadzohList(): ProductionMuhafadzoh[] {
    return read<ProductionMuhafadzoh[]>(KEYS.muhafadzoh, []);
  },
  saveMuhafadzohList(value: ProductionMuhafadzoh[]): void {
    write(KEYS.muhafadzoh, value);
  },
  getAbsensiSession(): SesiAbsensi {
    return read<SesiAbsensi>(KEYS.absensiSession, {} as SesiAbsensi);
  },
  saveAbsensiSession(value: SesiAbsensi): void {
    write(KEYS.absensiSession, value);
  },
};
