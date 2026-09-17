import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  CalendarOff,
  ShieldCheck,
  Clock,
  Info,
  Edit2,
  Save,
  X,
  Layers,
  Sparkles,
  BookOpen,
  Award
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { HariLiburItem, KalenderPendidikanItem, UserRole } from '../types';

interface HariLiburViewProps {
  userRole?: string;
}

export const HariLiburView: React.FC<HariLiburViewProps> = ({ userRole = 'Admin' }) => {
  const isAdmin = userRole.toLowerCase() === 'admin';

  const [activeTab, setActiveTab] = useState<'kalender' | 'libur'>('kalender');

  // Kalender Pendidikan Items
  const [kalenderList, setKalenderList] = useState<KalenderPendidikanItem[]>(() =>
    storageService.getKalenderPendidikan()
  );

  // Daftar Libur Resmi Kunci Absensi
  const [daftarLibur, setDaftarLibur] = useState<HariLiburItem[]>(() =>
    storageService.getDaftarLibur()
  );

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // State Form Tambah Agenda Kalender
  const [showAddAgendaModal, setShowAddAgendaModal] = useState(false);
  const [editingAgenda, setEditingAgenda] = useState<KalenderPendidikanItem | null>(null);

  const [agendaJudul, setAgendaJudul] = useState('');
  const [agendaMulai, setAgendaMulai] = useState('');
  const [agendaSelesai, setAgendaSelesai] = useState('');
  const [agendaKategori, setAgendaKategori] = useState<'kbm' | 'ujian' | 'libur' | 'pondok' | 'muhafadzoh'>('ujian');
  const [agendaKeterangan, setAgendaKeterangan] = useState('');
  const [agendaKunciAbsensi, setAgendaKunciAbsensi] = useState(false);

  // State Form Tambah Hari Libur
  const [showAddLiburForm, setShowAddLiburForm] = useState(false);
  const [liburMulai, setLiburMulai] = useState('');
  const [liburSelesai, setLiburSelesai] = useState('');
  const [liburKeterangan, setLiburKeterangan] = useState('');

  // Handle Save / Add Agenda Kalender
  const handleSaveAgenda = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agendaJudul.trim() || !agendaMulai) {
      showToast('Harap lengkapi judul agenda dan tanggal mulai.');
      return;
    }

    const end = agendaSelesai || agendaMulai;

    if (editingAgenda) {
      storageService.updateAgendaKalender(editingAgenda.id, {
        kegiatan: agendaJudul.trim(),
        tanggalMulai: agendaMulai,
        tanggalSelesai: end,
        kategori: agendaKategori,
        keterangan: agendaKeterangan.trim(),
        isLibur: agendaKunciAbsensi,
      });
      showToast(`Agenda "${agendaJudul}" berhasil diperbarui!`);
    } else {
      storageService.addAgendaKalender({
        kegiatan: agendaJudul.trim(),
        tanggalMulai: agendaMulai,
        tanggalSelesai: end,
        kategori: agendaKategori,
        keterangan: agendaKeterangan.trim(),
        isLibur: agendaKunciAbsensi,
      });

      // Jika diset sebagai libur kunci absensi, otomatis masukkan ke hari libur
      if (agendaKunciAbsensi) {
        storageService.addHariLibur({
          tanggalMulai: agendaMulai,
          tanggalSelesai: end,
          keterangan: agendaJudul.trim(),
        });
        setDaftarLibur(storageService.getDaftarLibur());
      }

      showToast(`Agenda baru "${agendaJudul}" berhasil ditambahkan ke Kalender Pendidikan!`);
    }

    setKalenderList(storageService.getKalenderPendidikan());
    setShowAddAgendaModal(false);
    setEditingAgenda(null);
    setAgendaJudul('');
    setAgendaMulai('');
    setAgendaSelesai('');
    setAgendaKeterangan('');
    setAgendaKunciAbsensi(false);
  };

  const handleDeleteAgenda = (id: string, judul: string) => {
    if (window.confirm(`Hapus agenda "${judul}" dari Kalender Pendidikan?`)) {
      storageService.deleteAgendaKalender(id);
      setKalenderList(storageService.getKalenderPendidikan());
      showToast(`Agenda "${judul}" berhasil dihapus.`);
    }
  };

  const openEditAgendaModal = (item: KalenderPendidikanItem) => {
    setEditingAgenda(item);
    setAgendaJudul(item.kegiatan);
    setAgendaMulai(item.tanggalMulai);
    setAgendaSelesai(item.tanggalSelesai || item.tanggalMulai);
    setAgendaKategori(item.kategori);
    setAgendaKeterangan(item.keterangan || '');
    setAgendaKunciAbsensi(Boolean(item.isLibur));
    setShowAddAgendaModal(true);
  };

  // Handle Add Hari Libur Kunci Absensi
  const handleAddLibur = (e: React.FormEvent) => {
    e.preventDefault();
    if (!liburMulai || !liburKeterangan.trim()) {
      showToast('Harap lengkapi tanggal mulai dan keterangan libur.');
      return;
    }

    const end = liburSelesai || liburMulai;
    if (end < liburMulai) {
      showToast('Tanggal selesai tidak boleh mendahului tanggal mulai.');
      return;
    }

    const updated = storageService.addHariLibur({
      tanggalMulai: liburMulai,
      tanggalSelesai: end,
      keterangan: liburKeterangan.trim(),
    });

    setDaftarLibur(updated);
    setLiburMulai('');
    setLiburSelesai('');
    setLiburKeterangan('');
    setShowAddLiburForm(false);
    showToast('Hari libur berhasil ditetapkan. Jadwal KBM dan absensi pada rentang tanggal tersebut otomatis dinonaktifkan.');
  };

  const handleDeleteLibur = (id: string, ket: string) => {
    if (window.confirm(`Batalkan status libur untuk "${ket}"?`)) {
      const updated = storageService.deleteHariLibur(id);
      setDaftarLibur(updated);
      showToast('Status hari libur berhasil dibatalkan. KBM dan absensi kembali dibuka.');
    }
  };

  const formatDateIndo = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        return d.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const getKategoriBadge = (kat: string) => {
    switch (kat) {
      case 'ujian':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">Ujian / Imtihan</span>;
      case 'libur':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-300">Libur Resmi</span>;
      case 'muhafadzoh':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-300">Munaqosyah Nadhom</span>;
      case 'pondok':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">Agenda Pondok</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-300">KBM Aktif</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-800 text-white">
              Tahun Ajaran 2025/2026
            </span>
            <span className="text-xs font-semibold text-emerald-800">
              Pusat Agenda Akademik & Penetapan Libur
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-emerald-700" />
            <span>Kalender Pendidikan & Hari Libur Madrasah</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Admin memiliki wewenang penuh membuat, mengubah agenda kalender pendidikan, dan menetapkan libur kunci absensi.
          </p>
        </div>

        {isAdmin && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setEditingAgenda(null);
                setAgendaJudul('');
                setAgendaMulai('');
                setAgendaSelesai('');
                setAgendaKeterangan('');
                setAgendaKunciAbsensi(false);
                setShowAddAgendaModal(true);
              }}
              id="btn-tambah-agenda-kalender"
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Buat Agenda Kalender</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('libur');
                setShowAddLiburForm(true);
              }}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-rose-800 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <CalendarOff className="w-4 h-4" />
              <span>Tetapkan Libur Absensi</span>
            </button>
          </div>
        )}
      </div>

      {/* Tabs Switcher */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-xs flex gap-2 text-xs">
        <button
          onClick={() => setActiveTab('kalender')}
          className={`flex-1 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'kalender'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>1. Agenda Kalender Pendidikan ({kalenderList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('libur')}
          className={`flex-1 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'libur'
              ? 'bg-rose-800 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CalendarOff className="w-4 h-4" />
          <span>2. Hari Libur & Kunci Absensi ({daftarLibur.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: AGENDA KALENDER PENDIDIKAN LENGKAP                                 */}
      {/* ========================================================================= */}
      {activeTab === 'kalender' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Daftar Siklus Akademik & Agenda Madrasah Diniyah
                </h3>
                <p className="text-xs text-slate-500">
                  Seluruh kegiatan belajar mengajar, ujian, lalaran kubro, dan libur pondok pesantren
                </p>
              </div>
            </div>

            {isAdmin && (
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full border border-amber-300">
                Mode Edit & Tambah Aktif
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {kalenderList.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between space-y-3 relative overflow-hidden"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    {getKategoriBadge(item.kategori)}
                    {item.isLibur && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                        <CalendarOff className="w-3 h-3 text-rose-600" />
                        Absensi Terkunci
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-black text-slate-900 leading-snug">
                    {item.kegiatan}
                  </h4>

                  <div className="flex items-center gap-1.5 text-xs text-emerald-900 font-bold font-mono">
                    <Clock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>
                      {formatDateIndo(item.tanggalMulai)}
                      {item.tanggalSelesai && item.tanggalSelesai !== item.tanggalMulai && (
                        <> s.d. {formatDateIndo(item.tanggalSelesai)}</>
                      )}
                    </span>
                  </div>

                  {item.keterangan && (
                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {item.keterangan}
                    </p>
                  )}
                </div>

                {isAdmin && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEditAgendaModal(item)}
                      className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer text-xs font-bold flex items-center gap-1"
                      title="Edit Agenda"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteAgenda(item.id, item.kegiatan)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer text-xs font-bold flex items-center gap-1"
                      title="Hapus Agenda"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MANAJEMEN HARI LIBUR & KUNCI ABSENSI                               */}
      {/* ========================================================================= */}
      {activeTab === 'libur' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 text-amber-950 text-xs space-y-1">
            <div className="flex items-center gap-2 font-black text-sm text-amber-900">
              <Info className="w-4 h-4 text-amber-700" />
              <span>Sistem Kunci Absensi Otomatis</span>
            </div>
            <p className="text-slate-700 leading-relaxed">
              Ketika suatu tanggal terdaftar sebagai hari libur di bawah ini, guru pengampu maupun santri tidak dapat membuka sesi absensi pada tanggal tersebut dan status kehadiran akan otomatis terproteksi.
            </p>
          </div>

          {/* Form Tambah Hari Libur */}
          {showAddLiburForm && isAdmin && (
            <form
              onSubmit={handleAddLibur}
              className="bg-white rounded-3xl p-6 border border-rose-200 shadow-md space-y-4 animate-in fade-in"
            >
              <div className="border-b border-rose-100 pb-3 flex items-center justify-between">
                <h2 className="text-sm font-black text-rose-950 flex items-center gap-2">
                  <CalendarOff className="w-4 h-4 text-rose-700" />
                  <span>Formulir Penetapan Hari Libur Baru</span>
                </h2>
                <button
                  type="button"
                  onClick={() => setShowAddLiburForm(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tanggal Mulai Libur <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={liburMulai}
                    onChange={(e) => setLiburMulai(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tanggal Selesai Libur (Opsional jika 1 hari)
                  </label>
                  <input
                    type="date"
                    value={liburSelesai}
                    onChange={(e) => setLiburSelesai(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none font-bold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Keterangan / Alasan Libur <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={liburKeterangan}
                    onChange={(e) => setLiburKeterangan(e.target.value)}
                    placeholder="Contoh: Maulid Nabi Muhammad SAW 1446 H"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddLiburForm(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-800 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Kunci Tanggal Libur</span>
                </button>
              </div>
            </form>
          )}

          {/* List Hari Libur */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider">
              Daftar Tanggal Libur Resmi Terdaftar ({daftarLibur.length})
            </h3>

            <div className="divide-y divide-slate-100">
              {daftarLibur.map((item) => (
                <div key={item.id} className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                      <span className="text-xs font-black text-slate-900">{item.keterangan}</span>
                    </div>
                    <p className="text-xs font-mono text-emerald-800 font-bold pl-4">
                      {formatDateIndo(item.tanggalMulai)}
                      {item.tanggalSelesai && item.tanggalSelesai !== item.tanggalMulai && (
                        <> s.d. {formatDateIndo(item.tanggalSelesai)}</>
                      )}
                    </p>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteLibur(item.id, item.keterangan)}
                      className="px-3 py-1.5 text-xs text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl font-bold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Batalkan Libur</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TAMBAH / EDIT AGENDA KALENDER PENDIDIKAN                          */}
      {/* ========================================================================= */}
      {showAddAgendaModal && isAdmin && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4 relative my-8">
            <button
              onClick={() => {
                setShowAddAgendaModal(false);
                setEditingAgenda(null);
              }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {editingAgenda ? 'Edit Agenda Kalender' : 'Buat Agenda Kalender Baru'}
                </h3>
                <p className="text-xs text-slate-500">
                  Tentukan kegiatan akademik madrasah dan atur status kunci absensi
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveAgenda} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama / Judul Kegiatan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={agendaJudul}
                  onChange={(e) => setAgendaJudul(e.target.value)}
                  placeholder="Contoh: Imtihan Akhir Sanah (Ujian Semester Genap)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tanggal Mulai <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={agendaMulai}
                    onChange={(e) => setAgendaMulai(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tanggal Selesai
                  </label>
                  <input
                    type="date"
                    value={agendaSelesai}
                    onChange={(e) => setAgendaSelesai(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Kategori Agenda <span className="text-rose-500">*</span>
                </label>
                <select
                  value={agendaKategori}
                  onChange={(e) => setAgendaKategori(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none font-bold"
                >
                  <option value="ujian">Ujian / Imtihan Madrasah</option>
                  <option value="kbm">KBM Aktif & Tatap Muka</option>
                  <option value="muhafadzoh">Munaqosyah Nadhom & Ujian Lisan</option>
                  <option value="libur">Libur Resmi Madrasah / Nasional</option>
                  <option value="pondok">Agenda Pondok Pesantren</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Keterangan Tambahan
                </label>
                <textarea
                  rows={2}
                  value={agendaKeterangan}
                  onChange={(e) => setAgendaKeterangan(e.target.value)}
                  placeholder="Catatan pelaksanaan, kitab yang diujikan, atau ketentuan santri..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3">
                <input
                  type="checkbox"
                  id="chk-kunci-absensi"
                  checked={agendaKunciAbsensi}
                  onChange={(e) => setAgendaKunciAbsensi(e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
                />
                <label htmlFor="chk-kunci-absensi" className="text-xs text-rose-950 font-bold cursor-pointer">
                  Kunci absensi harian pada rentang tanggal ini (Libur / Tidak ada KBM reguler)
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddAgendaModal(false);
                    setEditingAgenda(null);
                  }}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingAgenda ? 'Simpan Perubahan' : 'Terbitkan Agenda'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
