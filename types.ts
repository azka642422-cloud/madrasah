export type UserRole = 'Admin' | 'Guru' | 'Siswa';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  roleTitle?: string;
  nipOrNis?: string;
  avatar?: string;
  email?: string;
  kelas?: string;
  unreadNotifications?: number;
  [key: string]: unknown;
}

export interface AppUserAccount {
  id: string;
  name: string;
  role: UserRole | string;
  roleTitle?: string;
  nipOrNis?: string;
  email?: string;
  kelas?: string;
  [key: string]: unknown;
}

export interface NotifikasiItem {
  id: string;
  judul: string;
  pesan: string;
  dibaca: boolean;
  tautan?: string;
  tanggal?: string;
  [key: string]: unknown;
}

/**
 * Transitional attendance-session contract.
 * Attendance matrix persistence will move behind the production API/MySQL layer.
 */
export interface SesiAbsensi {
  id?: string;
  kelas?: string;
  tanggal?: string;
  tahunAjaran?: string;
  semester?: 'Ganjil' | 'Genap';
  [key: string]: unknown;
}
