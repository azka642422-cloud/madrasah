import React, { useMemo } from 'react';
import { BookOpen, Calendar, ClipboardCheck, FileSpreadsheet, GraduationCap, Settings, ShieldCheck, Users } from 'lucide-react';
import { NavPage } from './Sidebar';
import { SesiAbsensi, UserProfile, UserRole } from './types';
import { storageService } from './storageServiceProduction';

interface DashboardAdminProps {
  user: UserProfile;
  onNavigate: (page: NavPage) => void;
  onSwitchRole?: (role: UserRole) => void;
  absensiSession?: SesiAbsensi;
}

export const DashboardAdmin: React.FC<DashboardAdminProps> = ({ user, onNavigate, absensiSession }) => {
  const students = storageService.getStudents();
  const active = students.filter((s) => String(s.status) === 'Aktif').length;
  const keluar = students.filter((s) => String(s.status) === 'Keluar').length;
  const tahun = storageService.getTahunAjaran();
  const semester = storageService.getSemester();

  const classStats = useMemo(() => ['1A','1B','2A','2B','3A','3B','3C','4A','4B','5A','5B','6'].map((kelas) => ({ kelas, jumlah: students.filter((s) => s.kelas === kelas).length })), [students]);

  const shortcuts: {page: NavPage; title: string; desc: string; icon: React.ReactNode}[] = [
    { page: 'siswa', title: 'Database Santri', desc: 'Master data dan foto santri', icon: <Users className="h-5 w-5"/> },
    { page: 'absensi', title: 'Absensi', desc: 'Presensi dan rekap kehadiran', icon: <ClipboardCheck className="h-5 w-5"/> },
    { page: 'nilai', title: 'Buku Nilai', desc: 'Input nilai semester tanpa data otomatis', icon: <FileSpreadsheet className="h-5 w-5"/> },
    { page: 'muhafadzoh', title: 'Muhafadloh', desc: 'M1–M8 dan target tahunan', icon: <BookOpen className="h-5 w-5"/> },
    { page: 'raport', title: 'Raport', desc: 'Cetak laporan hasil belajar', icon: <GraduationCap className="h-5 w-5"/> },
    { page: 'ijazah', title: 'Ijazah', desc: 'Dokumen kelulusan kelas 6', icon: <GraduationCap className="h-5 w-5"/> },
    { page: 'hari_libur', title: 'Kalender', desc: 'Agenda dan hari libur', icon: <Calendar className="h-5 w-5"/> },
    { page: 'pengaturan', title: 'Pengaturan', desc: 'Akun, menu dan konfigurasi', icon: <Settings className="h-5 w-5"/> },
  ];

  return <div className="space-y-6 pb-12">
    <section className="rounded-3xl bg-gradient-to-br from-emerald-950 to-slate-950 p-6 text-white shadow-xl sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-300"><ShieldCheck className="h-4 w-4"/>Administrator</div><h1 className="mt-2 text-2xl font-black">{user.name}</h1><p className="mt-1 text-xs text-emerald-200">{user.roleTitle}</p></div>
        <div className="rounded-2xl border border-emerald-800 bg-emerald-900/50 px-4 py-3 text-xs"><div>Tahun Ajaran <b>{tahun}</b></div><div className="mt-1">Semester <b>{semester}</b></div></div>
      </div>
    </section>

    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <div className="rounded-2xl border bg-white p-4"><div className="text-[10px] font-bold uppercase text-slate-400">Total Santri</div><div className="mt-1 text-2xl font-black">{students.length}</div></div>
      <div className="rounded-2xl border bg-white p-4"><div className="text-[10px] font-bold uppercase text-slate-400">Aktif</div><div className="mt-1 text-2xl font-black text-emerald-800">{active}</div></div>
      <div className="rounded-2xl border bg-white p-4"><div className="text-[10px] font-bold uppercase text-slate-400">Keluar</div><div className="mt-1 text-2xl font-black text-slate-700">{keluar}</div></div>
      <div className="rounded-2xl border bg-white p-4"><div className="text-[10px] font-bold uppercase text-slate-400">Status Absensi Terakhir</div><div className="mt-1 text-sm font-black">{absensiSession?.isCompleted ? 'Tersimpan' : 'Belum tersimpan'}</div></div>
    </section>

    <section className="rounded-2xl border bg-white p-5 shadow-sm"><div className="mb-4"><h2 className="font-black text-slate-900">Jumlah Santri per Kelas</h2><p className="text-xs text-slate-500">Dihitung langsung dari master data resmi.</p></div><div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">{classStats.map((c)=><div key={c.kelas} className="rounded-xl border bg-slate-50 p-3 text-center"><div className="text-[10px] font-bold uppercase text-slate-400">Kelas {c.kelas}</div><div className="mt-1 text-lg font-black">{c.jumlah}</div></div>)}</div></section>

    <section><div className="mb-3"><h2 className="font-black text-slate-900">Akses Administrasi</h2><p className="text-xs text-slate-500">Semua angka pada dashboard berasal dari data tersimpan; tidak ada statistik contoh.</p></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{shortcuts.map((item)=><button key={item.page} onClick={()=>onNavigate(item.page)} className="rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:border-emerald-300 hover:shadow-md"><div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">{item.icon}</div><div className="text-sm font-black text-slate-900">{item.title}</div><div className="mt-1 text-xs text-slate-500">{item.desc}</div></button>)}</div></section>
  </div>;
};
