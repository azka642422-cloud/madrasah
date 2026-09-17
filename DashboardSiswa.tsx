import React, { useState } from 'react';
import {
  BookOpen,
  ClipboardList,
  FileSpreadsheet,
  GraduationCap,
  BookMarked,
  FileQuestion,
  Bell,
  Award,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Printer,
  Download,
  Star,
  Check
} from 'lucide-react';
import { NavPage } from '../components/Sidebar';
import { UserProfile, Santri } from '../types';
import { MOCK_SANTRI, MOCK_USERS } from '../data/mockData';

interface DashboardSiswaProps {
  user?: UserProfile;
  onNavigate: (page: NavPage) => void;
}

export const DashboardSiswa: React.FC<DashboardSiswaProps> = ({
  user = MOCK_USERS.siswa,
  onNavigate,
}) => {
  // Default to first santri (Ahmad Zaki Mubarak), or allow switching to Kelas 6
  const [selectedSantriId, setSelectedSantriId] = useState<string>('s-1');
  const santri: Santri = MOCK_SANTRI.find(s => s.id === selectedSantriId) || MOCK_SANTRI[0];
  const isKelas6 = santri.kelas.includes('6');

  // Menu Belajar & Aktivitas Santri:
  // Absensi Saya, Nilai Pelajaran, Nilai Muhafadloh, Raport, Buku Santri, Ujian dan Soal, Pengumuman, Ijazah (Kelas 6)
  const santriCards = [
    {
      id: 'absensi',
      title: 'Absensi Saya',
      emoji: '📋',
      desc: 'Riwayat & Kehadiran Kelas Mandiri',
      badge: 'Presensi',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      color: 'from-emerald-500/10 to-teal-500/10 border-emerald-300 ring-1 ring-emerald-300/40',
      nav: 'absensi' as NavPage,
    },
    {
      id: 'nilai',
      title: 'Nilai Pelajaran',
      emoji: '📊',
      desc: 'Buku Nilai & Rata-rata Hasil Belajar',
      badge: 'Akademik',
      badgeColor: 'bg-blue-100 text-blue-800',
      color: 'from-blue-500/10 to-indigo-500/10 border-blue-300 ring-1 ring-blue-300/40',
      nav: 'nilai' as NavPage,
    },
    {
      id: 'muhafadzoh',
      title: 'Nilai Muhafadloh',
      emoji: '⭐',
      desc: 'Target Setoran, Capaian & Kenaikan Tingkat',
      badge: 'Muhafadloh',
      badgeColor: 'bg-amber-100 text-amber-900 border border-amber-300',
      color: 'from-amber-500/10 to-yellow-500/10 border-amber-300 ring-1 ring-amber-300/40',
      nav: 'muhafadzoh' as NavPage,
    },
    {
      id: 'raport',
      title: 'Raport Santri',
      emoji: '📄',
      desc: 'Laporan Hasil Evaluasi & Mutaba\'ah',
      badge: 'Resmi',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      color: 'from-emerald-500/10 to-green-500/10 border-emerald-200',
      nav: 'raport' as NavPage,
    },
    {
      id: 'buku_siswa',
      title: 'Buku Santri',
      emoji: '📖',
      desc: 'Buku Pedoman, Doa, & Akhlak Karima',
      badge: 'Panduan',
      badgeColor: 'bg-purple-100 text-purple-800',
      color: 'from-purple-500/10 to-pink-500/10 border-purple-200',
      nav: 'buku_siswa' as NavPage,
    },
    {
      id: 'ujian',
      title: 'Ujian & Soal',
      emoji: '✏️',
      desc: 'Evaluasi & Bank Soal Takmiliyah',
      badge: 'Ujian',
      badgeColor: 'bg-rose-100 text-rose-800',
      color: 'from-rose-500/10 to-red-500/10 border-rose-200',
      nav: 'soal' as NavPage,
    },
    {
      id: 'pengumuman',
      title: 'Pengumuman',
      emoji: '🔔',
      desc: 'Maklumat & Agenda Madrasah Takmiliyah',
      badge: 'Informasi',
      badgeColor: 'bg-orange-100 text-orange-800',
      color: 'from-orange-500/10 to-amber-500/10 border-orange-200',
      nav: 'pengumuman' as NavPage,
    },
    ...(isKelas6
      ? [
          {
            id: 'ijazah',
            title: 'Ijazah Kelulusan',
            emoji: '🎓',
            desc: 'Dokumen Kelulusan Resmi — Cetak & Download PDF',
            badge: 'Tersedia (PDF)',
            badgeColor: 'bg-emerald-600 text-white font-black',
            color:
              'from-emerald-600/15 via-teal-600/10 to-amber-500/10 border-emerald-400 ring-2 ring-emerald-500/50 shadow-md',
            nav: 'ijazah' as NavPage,
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Simulasi Pilih Santri (Kelas 5A vs Kelas 6 untuk Pengujian Ijazah) */}
      <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-800 shrink-0" />
          <span className="font-bold text-emerald-950">Profil Santri Aktif:</span>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedSantriId}
            onChange={(e) => setSelectedSantriId(e.target.value)}
            className="px-3 py-1.5 bg-white border border-emerald-300 rounded-xl font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-600 outline-hidden w-full sm:w-auto"
          >
            <option value="s-1">Ahmad Zaki Mubarak (Kelas 5A - NIS 202305012)</option>
            <option value="s-k6-1">Muhammad Rayhan Al-Baqir (Kelas 6 - Calon Wisudawan / Ada Ijazah)</option>
            <option value="s-k6-2">Umar Faruq As-Suyuthi (Kelas 6 - Ada Ijazah)</option>
          </select>
        </div>
      </div>

      {/* Banner Khusus Santri Kelas 6: Ijazah Siap Cetak & Download PDF */}
      {isKelas6 && (
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl border-2 border-amber-300 relative overflow-hidden animate-in fade-in slide-in-from-top-3">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center shrink-0 text-2xl shadow-md">
                🎓
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-emerald-950">
                    Santri Kelas 6 — Dokumen Kelulusan Terbit
                  </span>
                  <span className="text-emerald-200 text-xs font-mono">T.A. 2025/2026</span>
                </div>
                <h2 className="text-base sm:text-lg font-black text-white mt-0.5">
                  Ijazah Resmi Madrasah Diniyah Takmiliyah Annajiyah 2
                </h2>
                <p className="text-xs text-emerald-100 max-w-xl">
                  Selamat atas kelulusan ananda {santri.nama}! Dokumen Ijazah digital bertanda tangan Pengasuh telah siap untuk dicetak atau diunduh berupa PDF.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onNavigate('ijazah')}
                id="btn-buka-ijazah-santri"
                className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black rounded-xl text-xs transition-all shadow-md hover:scale-105"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak & Download PDF Ijazah</span>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Identity Digital Card for Santri */}
      <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-emerald-700/40 relative overflow-hidden">
        {/* Islamic Ornament Aesthetic */}
        <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-amber-400/10 blur-xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6">
          <div className="flex items-start gap-4">
            <img
              src={santri.foto}
              alt={santri.nama}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-400 shadow-md shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-amber-400/20 text-amber-300 rounded-full border border-amber-400/40">
                  KARTU DIGITAL SANTRI TERPADU
                </span>
                <span className="text-[10px] text-emerald-200 font-mono">NIS. {santri.nis}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black mt-1 tracking-tight text-white">
                {santri.nama}
              </h1>
              <p className="text-xs text-emerald-200 mt-0.5">
                Kelas {santri.kelas} • Madrasah Diniyah Takmiliyah Annajiyah 2
              </p>
              <div className="mt-2 flex items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1 text-emerald-300 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Status: {santri.status} ({isKelas6 ? 'Calon Wisudawan' : 'Santri Aktif'})
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Highlight inside Card (Hafalan 8 juz removed) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-emerald-900/60 p-3.5 rounded-2xl border border-emerald-800/60 shrink-0">
            <div className="text-center px-3">
              <span className="text-[10px] text-emerald-300 block uppercase font-bold">Kehadiran</span>
              <span className="text-lg font-black text-emerald-200 font-mono">{santri.kehadiranPercent}%</span>
              <span className="text-[9px] text-emerald-300 block">Disiplin Tinggi</span>
            </div>
            <div className="text-center px-3 border-x border-emerald-800">
              <span className="text-[10px] text-emerald-300 block uppercase font-bold">Nilai Rata-rata</span>
              <span className="text-lg font-black text-amber-300 font-mono">{santri.rataRataNilai}</span>
              <span className="text-[9px] text-emerald-300 block">Predikat Mumtaz</span>
            </div>
            <div className="text-center px-3 col-span-2 sm:col-span-1 border-t sm:border-t-0 pt-2 sm:pt-0 border-emerald-800">
              <span className="text-[10px] text-emerald-300 block uppercase font-bold">Akhlak & Adab</span>
              <span className="text-sm font-black text-amber-300 mt-1 block">Ahlus Sunnah</span>
              <span className="text-[9px] text-emerald-300 block">Sangat Baik</span>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Belajar & Aktivitas Santri */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Menu Belajar & Aktivitas Santri</h2>
            <p className="text-xs text-slate-500">Akses langsung presensi, nilai akademik, muhafadloh, buku santri, dan ijazah</p>
          </div>
          {isKelas6 && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-emerald-700" />
              <span>Akses Ijazah Kelas 6 Terbuka</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {santriCards.map((item) => (
            <div
              key={item.id}
              onClick={() => onNavigate(item.nav)}
              id={`card-santri-${item.id}`}
              className={`bg-white rounded-2xl p-4 sm:p-5 border ${item.color} hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between group`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-3xl p-2 rounded-2xl bg-slate-50 border border-slate-100 shadow-2xs group-hover:scale-110 transition-transform">
                    {item.emoji}
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-emerald-900 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {item.desc}
                </p>
              </div>

              <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-800 group-hover:text-emerald-950">
                <span>Buka</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
