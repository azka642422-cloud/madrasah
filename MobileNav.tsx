import React from 'react';
import { Home, ClipboardCheck, FileSpreadsheet, GraduationCap, FolderOpen, Bell, User } from 'lucide-react';
import { NavPage } from './Sidebar';
import { UserRole } from '../types';

interface MobileNavProps {
  currentPage: NavPage;
  onNavigate: (page: NavPage) => void;
  unreadCount: number;
  userRole?: UserRole;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentPage,
  onNavigate,
  unreadCount,
  userRole = 'Guru',
}) => {
  const isSiswa = userRole.toLowerCase() === 'siswa';

  if (isSiswa) {
    return (
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-emerald-100 py-1.5 px-2 flex items-center justify-around lg:hidden shadow-lg">
        {/* 1. Dashboard Santri */}
        <button
          onClick={() => onNavigate('dashboard')}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-colors ${
            currentPage === 'dashboard' ? 'text-emerald-800 font-bold' : 'text-slate-500 hover:text-emerald-700'
          }`}
        >
          <Home className={`w-5 h-5 ${currentPage === 'dashboard' ? 'text-emerald-700 stroke-[2.5]' : ''}`} />
          <span className="text-[10px]">Santri</span>
        </button>

        {/* 2. Absensi */}
        <button
          onClick={() => onNavigate('absensi')}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-colors ${
            currentPage === 'absensi' ? 'text-emerald-800 font-bold' : 'text-slate-500 hover:text-emerald-700'
          }`}
        >
          <ClipboardCheck className={`w-5 h-5 ${currentPage === 'absensi' ? 'text-emerald-700 stroke-[2.5]' : ''}`} />
          <span className="text-[10px]">Absensi</span>
        </button>

        {/* 3. Nilai */}
        <button
          onClick={() => onNavigate('nilai')}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-colors ${
            currentPage === 'nilai' ? 'text-emerald-800 font-bold' : 'text-slate-500 hover:text-emerald-700'
          }`}
        >
          <FileSpreadsheet className={`w-5 h-5 ${currentPage === 'nilai' ? 'text-emerald-700 stroke-[2.5]' : ''}`} />
          <span className="text-[10px]">Nilai</span>
        </button>

        {/* 4. Muhafadloh */}
        <button
          onClick={() => onNavigate('muhafadzoh')}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-colors ${
            currentPage === 'muhafadzoh' ? 'text-emerald-800 font-bold' : 'text-slate-500 hover:text-emerald-700'
          }`}
        >
          <span className="text-base leading-none">⭐</span>
          <span className="text-[10px]">Muhafadloh</span>
        </button>

        {/* 5. Raport / Ijazah */}
        <button
          onClick={() => onNavigate('raport')}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-colors ${
            currentPage === 'raport' || currentPage === 'ijazah' ? 'text-emerald-800 font-bold' : 'text-slate-500 hover:text-emerald-700'
          }`}
        >
          <GraduationCap className={`w-5 h-5 ${currentPage === 'raport' || currentPage === 'ijazah' ? 'text-emerald-700 stroke-[2.5]' : ''}`} />
          <span className="text-[10px]">Raport/Ijazah</span>
        </button>
      </nav>
    );
  }

  const isHome = currentPage === 'dashboard';
  const isAkademik = ['jadwal', 'absensi', 'nilai', 'silabus', 'soal', 'raport', 'ijazah'].includes(currentPage);
  const isDokumen = ['buku_guru', 'buku_siswa', 'materi', 'guru_kerja'].includes(currentPage);
  const isNotifikasi = currentPage === 'notifikasi' || currentPage === 'pengumuman';
  const isProfil = currentPage === 'pesantren_info' || currentPage === 'pengaturan' || currentPage === 'siswa';

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-emerald-100 py-1.5 px-3 flex items-center justify-around lg:hidden shadow-lg">
      {/* 1. Home */}
      <button
        onClick={() => onNavigate('dashboard')}
        className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${
          isHome ? 'text-emerald-800 font-bold' : 'text-slate-500 hover:text-emerald-700'
        }`}
      >
        <Home className={`w-5 h-5 ${isHome ? 'text-emerald-700 stroke-[2.5]' : ''}`} />
        <span className="text-[10px]">Home</span>
      </button>

      {/* 2. Akademik */}
      <button
        onClick={() => onNavigate('absensi')}
        className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${
          isAkademik ? 'text-emerald-800 font-bold' : 'text-slate-500 hover:text-emerald-700'
        }`}
      >
        <GraduationCap className={`w-5 h-5 ${isAkademik ? 'text-emerald-700 stroke-[2.5]' : ''}`} />
        <span className="text-[10px]">Akademik</span>
      </button>

      {/* 3. Dokumen */}
      <button
        onClick={() => onNavigate('materi')}
        className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${
          isDokumen ? 'text-emerald-800 font-bold' : 'text-slate-500 hover:text-emerald-700'
        }`}
      >
        <FolderOpen className={`w-5 h-5 ${isDokumen ? 'text-emerald-700 stroke-[2.5]' : ''}`} />
        <span className="text-[10px]">Dokumen</span>
      </button>

      {/* 4. Notifikasi */}
      <button
        onClick={() => onNavigate('notifikasi')}
        className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors relative ${
          isNotifikasi ? 'text-emerald-800 font-bold' : 'text-slate-500 hover:text-emerald-700'
        }`}
      >
        <div className="relative">
          <Bell className={`w-5 h-5 ${isNotifikasi ? 'text-emerald-700 stroke-[2.5]' : ''}`} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-rose-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
        <span className="text-[10px]">Notifikasi</span>
      </button>

      {/* 5. Profil */}
      <button
        onClick={() => onNavigate('pesantren_info')}
        className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${
          isProfil ? 'text-emerald-800 font-bold' : 'text-slate-500 hover:text-emerald-700'
        }`}
      >
        <User className={`w-5 h-5 ${isProfil ? 'text-emerald-700 stroke-[2.5]' : ''}`} />
        <span className="text-[10px]">Profil</span>
      </button>
    </nav>
  );
};
