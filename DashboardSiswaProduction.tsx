import React, { useMemo } from 'react';
import { BookOpen, CheckCircle2, FileSpreadsheet, GraduationCap, Printer, User } from 'lucide-react';
import { NavPage } from './Sidebar';
import { storageService } from './storageServiceProduction';
import { UserProfile } from './types';

interface DashboardSiswaProps {
  user: UserProfile;
  onNavigate: (page: NavPage) => void;
}

export const DashboardSiswa: React.FC<DashboardSiswaProps> = ({ user, onNavigate }) => {
  const students = storageService.getStudents();
  const santri = useMemo(() => {
    const nis = (user.nipOrNis || '').replace(/\D/g, '');
    return students.find((s) => s.nis.replace(/\D/g, '') === nis || s.nama.toLowerCase() === user.name.toLowerCase()) || null;
  }, [students, user]);

  if (!santri) {
    return <div className="rounded-3xl border bg-white p-8 text-center"><User className="mx-auto h-10 w-10 text-slate-300"/><h2 className="mt-3 font-black text-slate-900">Data santri tidak ditemukan</h2><p className="mt-1 text-xs text-slate-500">Akun ini belum terhubung ke NIS pada master santri resmi. Hubungi administrator.</p></div>;
  }

  const isKelas6 = String(santri.kelas).replace(/^Kelas\s+/i, '') === '6';
  const menu = [
    ['absensi','Absensi Saya','Riwayat kehadiran santri'],
    ['nilai','Nilai Pelajaran','Nilai semester yang telah diinput'],
    ['muhafadzoh','Nilai Muhafadloh','Muhafadloh M1–M8 dan rekap tahunan'],
    ['raport','Raport Santri','Laporan hasil belajar'],
    ['buku_siswa','Buku Santri','Panduan dan dokumen santri'],
    ['soal','Ujian & Soal','Evaluasi pembelajaran'],
    ['pengumuman','Pengumuman','Informasi madrasah'],
    ...(isKelas6 ? [['ijazah','Ijazah Kelulusan','Dokumen ijazah kelas 6']] : []),
  ] as [NavPage,string,string][];

  return <div className="space-y-6 pb-12">
    <section className="rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 p-6 text-white shadow-xl">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {santri.foto ? <img src={santri.foto} alt={santri.nama} className="h-20 w-20 rounded-2xl border-2 border-amber-400 object-cover"/> : <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-emerald-700 bg-emerald-900"><User className="h-8 w-8 text-emerald-300"/></div>}
          <div><div className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">Profil Santri</div><h1 className="mt-1 text-2xl font-black">{santri.nama}</h1><p className="mt-1 text-xs text-emerald-200">NIS {santri.nis} · Kelas {santri.kelas} · Status {String(santri.status)}</p></div>
        </div>
        <div className="rounded-2xl border border-emerald-700 bg-emerald-900/60 px-4 py-3 text-xs"><CheckCircle2 className="mr-2 inline h-4 w-4 text-emerald-300"/>Data identitas mengikuti master resmi</div>
      </div>
    </section>

    {isKelas6 && <section className="flex flex-col gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="text-xs font-black text-amber-900">Menu Ijazah tersedia untuk Kelas 6</div><p className="mt-1 text-xs text-amber-800">Ijazah tetap hanya menampilkan data yang sudah ditetapkan administrator; nilai kosong tidak dibuat otomatis.</p></div><button onClick={()=>onNavigate('ijazah')} className="rounded-xl bg-emerald-800 px-4 py-2 text-xs font-bold text-white"><Printer className="mr-1 inline h-4 w-4"/>Buka Ijazah</button></section>}

    <section>
      <div className="mb-3"><h2 className="font-black text-slate-900">Menu Santri</h2><p className="text-xs text-slate-500">Akses data akademik sesuai akun dan NIS Anda.</p></div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">{menu.map(([nav,title,desc])=><button key={nav} onClick={()=>onNavigate(nav)} className="rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:border-emerald-300 hover:shadow-md"><div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">{nav==='nilai'?<FileSpreadsheet className="h-5 w-5"/>:nav==='raport'||nav==='ijazah'?<GraduationCap className="h-5 w-5"/>:<BookOpen className="h-5 w-5"/>}</div><div className="text-sm font-black text-slate-900">{title}</div><div className="mt-1 text-xs text-slate-500">{desc}</div></button>)}</div>
    </section>
  </div>;
};
