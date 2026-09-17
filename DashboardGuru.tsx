import React from 'react';
import {
  ClipboardCheck,
  FileSpreadsheet,
  Calendar,
  BookOpen,
  FileText,
  FileQuestion,
  GraduationCap,
  Award,
  BookMarked,
  Landmark,
  Bell,
  AlertTriangle,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  FolderOpen
} from 'lucide-react';
import { NavPage } from '../components/Sidebar';
import { UserProfile, SesiAbsensi } from '../types';
import { PESANTREN_INFO, MOCK_USERS, MOCK_SESI_ABSENSI } from '../data/mockData';

interface DashboardGuruProps {
  user?: UserProfile;
  onNavigate: (page: NavPage) => void;
  absensiSession?: SesiAbsensi;
}

export const DashboardGuru: React.FC<DashboardGuruProps> = ({
  user = MOCK_USERS.guru,
  onNavigate,
  absensiSession = MOCK_SESI_ABSENSI,
}) => {
  // 12 Menu Cards requested specifically by the user
  const guruMenuCards = [
    {
      id: 'absensi',
      title: 'Absensi',
      desc: 'Harian & Rekapitulasi',
      icon: ClipboardCheck,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      badge: !absensiSession.isCompleted ? 'Perlu Diisi' : 'Lengkap',
      badgeColor: !absensiSession.isCompleted ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800',
      nav: 'absensi' as NavPage,
    },
    {
      id: 'nilai',
      title: 'Nilai Santri',
      desc: 'Tugas, UH, UTS, UAS',
      icon: FileSpreadsheet,
      color: 'bg-teal-50 text-teal-700 border-teal-200',
      badge: '92% Lengkap',
      badgeColor: 'bg-amber-100 text-amber-800',
      nav: 'nilai' as NavPage,
    },
    {
      id: 'jadwal',
      title: 'Jadwal Mengajar',
      desc: 'Jadwal & Ruang Kelas',
      icon: Calendar,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      badge: '3 Sesi Hari Ini',
      badgeColor: 'bg-blue-100 text-blue-800',
      nav: 'jadwal' as NavPage,
    },
    {
      id: 'silabus',
      title: 'Silabus',
      desc: 'Target Pembelajaran & Kitab',
      icon: BookOpen,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      nav: 'silabus' as NavPage,
    },
    {
      id: 'materi',
      title: 'Materi Pembelajaran',
      desc: 'Perpustakaan Digital',
      icon: FileText,
      color: 'bg-violet-50 text-violet-700 border-violet-200',
      badge: '5 Modul Aktif',
      badgeColor: 'bg-violet-100 text-violet-800',
      nav: 'materi' as NavPage,
    },
    {
      id: 'soal',
      title: 'Soal & Ujian',
      desc: 'Bank Soal & Penilaian',
      icon: FileQuestion,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      badge: '8 Paket Soal',
      badgeColor: 'bg-amber-100 text-amber-800',
      nav: 'soal' as NavPage,
    },
    {
      id: 'raport',
      title: 'Raport',
      desc: 'Cetak & Generate Digital',
      icon: GraduationCap,
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      badge: 'Resmi',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      nav: 'raport' as NavPage,
    },
    {
      id: 'ijazah',
      title: 'Ijazah',
      desc: 'Sertifikat Kelulusan Madin',
      icon: Award,
      color: 'bg-yellow-50 text-amber-800 border-yellow-200',
      nav: 'ijazah' as NavPage,
    },
    {
      id: 'buku_guru',
      title: 'Buku Kerja Guru',
      desc: 'RPP, Panduan, & Jurnal',
      icon: BookMarked,
      color: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      nav: 'buku_guru' as NavPage,
    },
    {
      id: 'dokumen',
      title: 'Dokumen Pesantren',
      desc: 'SK & Tata Tertib Resmi',
      icon: FolderOpen,
      color: 'bg-slate-50 text-slate-700 border-slate-200',
      nav: 'materi' as NavPage,
    },
    {
      id: 'sejarah',
      title: 'Sejarah Pesantren',
      desc: 'Visi, Misi & Masyayikh',
      icon: Landmark,
      color: 'bg-rose-50 text-rose-700 border-rose-200',
      nav: 'pesantren_info' as NavPage,
    },
    {
      id: 'pengumuman',
      title: 'Pengumuman',
      desc: 'Maklumat & Agenda Santri',
      icon: Bell,
      color: 'bg-orange-50 text-orange-700 border-orange-200',
      badge: 'Baru',
      badgeColor: 'bg-rose-100 text-rose-800',
      nav: 'pengumuman' as NavPage,
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Welcome Banner with Greeting & Quick Profile */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Subtle decorative gold badge */}
        <div className="absolute right-4 -top-8 w-40 h-40 rounded-full bg-amber-400/10 blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/60 border border-emerald-600/60 text-amber-300 text-xs font-semibold mb-2">
              <span>Tahun Ajaran 2025/2026</span>
              <span>•</span>
              <span>Semester Ganjil</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Ahlan wa Sahlan, {user.name}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-200 mt-1 max-w-xl">
              Portal Guru & Wali Kelas Terpadu. Pantau kehadiran kelas, kelengkapan nilai, dan agenda pengajaran santri secara terpusat.
            </p>
          </div>

          <button
            onClick={() => onNavigate('absensi')}
            id="btn-hero-quick-absensi"
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold rounded-2xl text-xs transition-all shadow-md flex items-center gap-1.5 shrink-0"
          >
            <span>Isi Absensi Hari Ini</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Warning Alert if Attendance Incomplete (Requested explicitly in prompt) */}
      {!absensiSession.isCompleted && (
        <div className="bg-amber-50 border border-amber-300/80 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 text-amber-950 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-800" />
            </div>
            <div>
              <div className="text-sm font-bold text-amber-950 flex items-center gap-2">
                <span>⚠ Absensi hari ini belum lengkap.</span>
                <span className="text-[10px] bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded font-mono font-bold">
                  Kelas 5A
                </span>
              </div>
              <p className="text-xs text-amber-800/90 mt-0.5">
                Sesi Bahasa Arab (07.30 - 09.00 WIB) di Ruang 3 Ibnu Rusyd belum disimpan. Segera selesaikan rekapitulasi kehadiran santri.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('absensi')}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors shrink-0 shadow-xs"
          >
            Lengkapi Sekarang
          </button>
        </div>
      )}

      {/* Ringkasan Dashboard (7 Key Stats requested by user) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm sm:text-base font-extrabold text-slate-800 flex items-center gap-2">
            <span>Ringkasan Harian Asatidz</span>
          </h2>
          <span className="text-xs text-slate-400 font-medium">Diperbarui real-time</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          
          {/* Stat 1: Kehadiran Hari Ini */}
          <div
            onClick={() => onNavigate('absensi')}
            className="bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Kehadiran Hari Ini</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ClipboardCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-950 font-mono">96.4%</div>
            <p className="text-[10px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>Target minimal 95% tercapai</span>
            </p>
          </div>

          {/* Stat 2: Jumlah Siswa Diampu */}
          <div
            onClick={() => onNavigate('siswa')}
            className="bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Jumlah Santri</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">148 Santri</div>
            <p className="text-[10px] text-slate-500 mt-1">
              Di 4 Rombel Kelas
            </p>
          </div>

          {/* Stat 3: Jadwal Mengajar Hari Ini */}
          <div
            onClick={() => onNavigate('jadwal')}
            className="bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-amber-300 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Jadwal Hari Ini</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">3 Sesi</div>
            <p className="text-[10px] text-amber-700 font-medium mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Sesi 1: 07.30 - 09.00 (5A)</span>
            </p>
          </div>

          {/* Stat 4: Tugas Belum Dinilai */}
          <div
            onClick={() => onNavigate('nilai')}
            className="bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-teal-300 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Tugas Belum Dinilai</span>
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-teal-950 font-mono">14 Santri</div>
            <p className="text-[10px] text-slate-500 mt-1">
              Tugas Analisis I&apos;rab Nahwu
            </p>
          </div>

          {/* Stat 5: Nilai Belum Lengkap */}
          <div
            onClick={() => onNavigate('nilai')}
            className="bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-rose-300 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Nilai Belum Lengkap</span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-rose-900 font-mono">Kelas 5A</div>
            <p className="text-[10px] text-amber-700 font-semibold mt-1">
              92% lengkap (1 santri susulan)
            </p>
          </div>

          {/* Stat 6: Soal yang Sudah Dibuat */}
          <div
            onClick={() => onNavigate('soal')}
            className="bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Soal Dibuat</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileQuestion className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-indigo-950 font-mono">8 Paket</div>
            <p className="text-[10px] text-emerald-700 font-medium mt-1">
              5 Dipublikasikan • 3 Draft
            </p>
          </div>

          {/* Stat 7: Pengumuman Terbaru */}
          <div
            onClick={() => onNavigate('pengumuman')}
            className="bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-amber-300 hover:shadow-md transition-all cursor-pointer group col-span-2 sm:col-span-3 lg:col-span-2"
          >
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pengumuman Terbaru</span>
              <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Bell className="w-4 h-4" />
              </div>
            </div>
            <div className="text-sm font-bold text-slate-900 truncate">
              Rapat Evaluasi Asatidz Menjelang Ujian Tengah Semester (UTS)
            </div>
            <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
              Akan diselenggarakan di Aula Utama pada hari Kamis pukul 14.00 WIB bersama Majelis Pengasuh.
            </p>
          </div>

        </div>
      </div>

      {/* 12 Menu Cards (DANA Style Card Grid Requested) */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-800">
              Menu Utama Pesantren Terpadu
            </h2>
            <p className="text-xs text-slate-500">Pilih modul akademik & administrasi di bawah ini</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {guruMenuCards.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => onNavigate(item.nav)}
                id={`menu-card-${item.id}`}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 hover:border-emerald-400 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Top Row: Icon & Badge */}
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-2xs group-hover:scale-105 transition-transform ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </div>

                {/* Card Title & Description */}
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-slate-400 font-mono font-semibold">0{idx + 1}.</span>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-900 transition-colors">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                    {item.desc}
                  </p>
                </div>

                {/* Bottom Visual Indicator */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-emerald-800 group-hover:text-emerald-950">
                  <span>Buka Modul</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
