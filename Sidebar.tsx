import React from 'react';
import { BookOpen, Calendar, ClipboardCheck, FileSpreadsheet, GraduationCap, Home, Settings, Users, X } from 'lucide-react';
import type { UserRole } from './types';

export type NavPage = 'dashboard'|'absensi'|'nilai'|'jadwal'|'silabus'|'materi'|'buku_guru'|'guru_kerja'|'buku_siswa'|'pesantren_info'|'soal'|'raport'|'ijazah'|'hari_libur'|'kritik_saran'|'peraturan_guru'|'siswa'|'muhafadzoh'|'pengumuman'|'notifikasi'|'pengaturan';

interface Props { currentPage: NavPage; onNavigate: (page: NavPage) => void; userRole: UserRole; isOpen?: boolean; onClose?: () => void; }
const base = [
  ['dashboard','Dashboard',Home],['absensi','Absensi',ClipboardCheck],['nilai','Nilai',FileSpreadsheet],['muhafadzoh','Muhafadloh',BookOpen],['jadwal','Jadwal',Calendar],['raport','Raport',GraduationCap],
] as const;
export const Sidebar: React.FC<Props> = ({currentPage,onNavigate,userRole,isOpen=false,onClose=()=>{}}) => {
  const role = String(userRole).toLowerCase();
  const extra: Array<[NavPage,string,React.ComponentType<{className?:string}>]> = role==='admin' ? [['siswa','Database Santri',Users],['ijazah','Ijazah',GraduationCap],['pengaturan','Pengaturan',Settings]] : role==='siswa' ? [] : [['silabus','Silabus',BookOpen],['materi','Materi',BookOpen]];
  const items = [...base,...extra];
  return <><div onClick={onClose} className={`fixed inset-0 z-40 bg-slate-950/40 lg:hidden ${isOpen?'block':'hidden'}`}/><aside className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-emerald-900 bg-emerald-950 text-white transition-transform lg:translate-x-0 ${isOpen?'translate-x-0':'-translate-x-full'}`}><div className="flex h-20 items-center gap-3 border-b border-emerald-900 px-5"><img src="/logo.png" alt="Logo Madrasah" className="h-11 w-11 object-contain"/><div className="min-w-0"><div className="truncate text-sm font-black">MT. ANNAJIYAH 2</div><div className="text-[10px] text-emerald-300">Administrasi Madrasah</div></div><button onClick={onClose} className="ml-auto lg:hidden"><X className="h-5 w-5"/></button></div><nav className="space-y-1 p-3">{items.map(([page,label,Icon])=><button key={page} onClick={()=>onNavigate(page)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-bold ${currentPage===page?'bg-emerald-800 text-white':'text-emerald-100 hover:bg-emerald-900'}`}><Icon className="h-4 w-4"/>{label}</button>)}</nav></aside></>;
};
