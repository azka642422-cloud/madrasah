import React from 'react';
import { BookOpen, Calendar, ClipboardCheck, FileSpreadsheet, FileText, GraduationCap, Users } from 'lucide-react';
import { NavPage } from './Sidebar';
import { SesiAbsensi, UserProfile } from './types';
import { storageService } from './storageServiceProduction';

interface DashboardGuruProps {
  user: UserProfile;
  onNavigate: (page: NavPage) => void;
  absensiSession?: SesiAbsensi;
}

export const DashboardGuru: React.FC<DashboardGuruProps> = ({ user, onNavigate, absensiSession }) => {
  const tahun = storageService.getTahunAjaran();
  const semester = storageService.getSemester();
  const kelasAmpu = (user.kelas || '').replace(/^Kelas\s+/i, '');
  const students = storageService.getStudents();
  const jumlahSantri = kelasAmpu ? students.filter((s) => s.kelas === kelasAmpu).length : null;

  const menu: {page: NavPage; title: string; desc: string; icon: React.ReactNode}[] = [
    { page:'absensi', title:'Absensi', desc:'Isi dan periksa kehadiran santri', icon:<ClipboardCheck className="h-5 w-5"/> },
    { page:'nilai', title:'Nilai Santri', desc:'Input nilai semester yang sebenarnya', icon:<FileSpreadsheet className="h-5 w-5"/> },
    { page:'muhafadzoh', title:'Muhafadloh', desc:'Muhafadloh M1–M8', icon:<BookOpen className="h-5 w-5"/> },
    { page:'raport', title:'Raport', desc:'Laporan hasil belajar santri', icon:<GraduationCap className="h-5 w-5"/> },
    { page:'jadwal', title:'Jadwal', desc:'Jadwal dan ruang pembelajaran', icon:<Calendar className="h-5 w-5"/> },
    { page:'silabus', title:'Silabus', desc:'Target pembelajaran dan kitab', icon:<BookOpen className="h-5 w-5"/> },
    { page:'materi', title:'Materi', desc:'Materi pembelajaran', icon:<FileText className="h-5 w-5"/> },
    { page:'soal', title:'Ujian & Soal', desc:'Bank soal dan evaluasi', icon:<FileText className="h-5 w-5"/> },
  ];

  return <div className="space-y-6 pb-12">
    <section className="rounded-3xl bg-gradient-to-br from-emerald-950 to-teal-950 p-6 text-white shadow-xl sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="text-xs font-bold uppercase tracking-widest text-emerald-300">Portal Guru</div><h1 className="mt-2 text-2xl font-black">Ahlan wa Sahlan, {user.name}</h1><p className="mt-1 text-xs text-emerald-200">{user.roleTitle}</p></div><div className="rounded-2xl border border-emerald-800 bg-emerald-900/50 px-4 py-3 text-xs"><div>Tahun Ajaran <b>{tahun}</b></div><div className="mt-1">Semester <b>{semester}</b></div></div></div>
    </section>

    <section className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-2xl border bg-white p-4"><div className="text-[10px] font-bold uppercase text-slate-400">Kelas Terhubung</div><div className="mt-1 text-lg font-black">{kelasAmpu || 'Belum ditetapkan'}</div></div>
      <div className="rounded-2xl border bg-white p-4"><div className="text-[10px] font-bold uppercase text-slate-400">Jumlah Santri Kelas</div><div className="mt-1 flex items-center gap-2 text-lg font-black"><Users className="h-5 w-5 text-emerald-700"/>{jumlahSantri ?? '—'}</div></div>
      <div className="rounded-2xl border bg-white p-4"><div className="text-[10px] font-bold uppercase text-slate-400">Status Absensi Terakhir</div><div className="mt-1 text-lg font-black">{absensiSession?.isCompleted ? 'Tersimpan' : 'Belum tersimpan'}</div></div>
    </section>

    {!absensiSession?.isCompleted && <section className="flex flex-col gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="text-xs font-black text-amber-900">Absensi belum disimpan</div><p className="mt-1 text-xs text-amber-800">Buka modul absensi untuk memeriksa sesi yang aktif. Sistem tidak menampilkan detail sesi contoh.</p></div><button onClick={()=>onNavigate('absensi')} className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white">Buka Absensi</button></section>}

    <section><div className="mb-3"><h2 className="font-black text-slate-900">Menu Guru</h2><p className="text-xs text-slate-500">Akses modul akademik tanpa statistik buatan.</p></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{menu.map((item)=><button key={item.page} onClick={()=>onNavigate(item.page)} className="rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:border-emerald-300 hover:shadow-md"><div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">{item.icon}</div><div className="text-sm font-black text-slate-900">{item.title}</div><div className="mt-1 text-xs text-slate-500">{item.desc}</div></button>)}</div></section>
  </div>;
};
