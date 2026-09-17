import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Printer,
  Download,
  Filter,
  Layers,
  BookOpen,
  Edit3,
  Plus,
  Trash2,
  Check,
  X,
  Sparkles,
  ShieldCheck,
  Search,
  UserCheck
} from 'lucide-react';
import {
  MOCK_GURU_JADWAL,
  MOCK_JADWAL_SLOTS,
  getGuruByKode
} from '../data/mockData';
import { GuruJadwal, JadwalSlotItem } from '../types';
import { PdfPreviewModal } from '../components/PdfPreviewModal';
import { storageService } from '../services/storageService';

interface JadwalViewProps {
  userRole?: string;
  scheduleSlots?: JadwalSlotItem[];
  onUpdateScheduleSlots?: (slots: JadwalSlotItem[]) => void;
  guruList?: GuruJadwal[];
  onUpdateGuruList?: (gurus: GuruJadwal[]) => void;
}

export const JadwalView: React.FC<JadwalViewProps> = ({
  userRole = 'Guru',
  scheduleSlots: propSlots,
  onUpdateScheduleSlots,
  guruList: propGurus,
  onUpdateGuruList,
}) => {
  // Local state with persistent storage fallback
  const [slots, setSlots] = useState<JadwalSlotItem[]>(() => propSlots || storageService.getJadwalSlots());
  const [gurus, setGurus] = useState<GuruJadwal[]>(() => propGurus || storageService.getGuruList());

  // Sync if prop changes
  React.useEffect(() => {
    if (propSlots) setSlots(propSlots);
  }, [propSlots]);

  React.useEffect(() => {
    if (propGurus) setGurus(propGurus);
  }, [propGurus]);

  const updateSlots = (newSlots: JadwalSlotItem[]) => {
    setSlots(newSlots);
    storageService.saveJadwalSlots(newSlots);
    if (onUpdateScheduleSlots) onUpdateScheduleSlots(newSlots);
  };

  const updateGurus = (newGurus: GuruJadwal[]) => {
    setGurus(newGurus);
    storageService.saveGuruList(newGurus);
    if (onUpdateGuruList) onUpdateGuruList(newGurus);
  };

  const isAdmin = userRole.toLowerCase() === 'admin';

  const [viewMode, setViewMode] = useState<'matriks' | 'card' | 'guru'>('matriks');
  const [selectedHari, setSelectedHari] = useState<string>('Semua');
  const [selectedKelas, setSelectedKelas] = useState<string>('Semua');
  const [selectedGuruKode, setSelectedGuruKode] = useState<number | 'Semua'>('Semua');
  const [showPdfModal, setShowPdfModal] = useState(false);

  // Admin Modals
  const [editingSlot, setEditingSlot] = useState<JadwalSlotItem | null>(null);
  const [showGuruManagerModal, setShowGuruManagerModal] = useState(false);
  const [editingGuru, setEditingGuru] = useState<GuruJadwal | null>(null);
  const [newGuruNama, setNewGuruNama] = useState('');
  const [newGuruKode, setNewGuruKode] = useState<number>(22);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const hariList: Array<'Jum\'at' | 'Sabtu' | 'Minggu' | 'Selasa' | 'Rabu'> = [
    'Jum\'at',
    'Sabtu',
    'Minggu',
    'Selasa',
    'Rabu',
  ];

  const kelasList = ['1A', '1B', '2A', '2B', '3A', '3B', '3C', '4A', '4B', '5A', '5B', '6'];

  const fanIlmuOptions = [
    'Tajwid',
    'Fiqih',
    'Shorof',
    'Hadits',
    'Tauhid',
    'Nahwu',
    'Pegon',
    'Tasawwuf',
    'Aswaja',
    'Baca Kitab',
  ];

  // Helper to find slot
  const getSlot = (kelas: string, hari: 'Jum\'at' | 'Sabtu' | 'Minggu' | 'Selasa' | 'Rabu') => {
    return slots.find(s => s.kelas === kelas && s.hari === hari);
  };

  // Helper for Guru color badge
  const getGuruBadge = (kode: number) => {
    const g = gurus.find(item => item.kode === kode);
    return g ? g.warnaBadge : 'bg-slate-700 text-white';
  };

  const getGuruNama = (kode: number) => {
    return getGuruByKode(kode, gurus);
  };

  // Save edited slot
  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot) return;

    const existingIndex = slots.findIndex(s => s.id === editingSlot.id);
    let newSlots: JadwalSlotItem[];
    if (existingIndex >= 0) {
      newSlots = slots.map(s => (s.id === editingSlot.id ? editingSlot : s));
    } else {
      newSlots = [...slots, editingSlot];
    }

    updateSlots(newSlots);
    setEditingSlot(null);
    showToast(`Jadwal Kelas ${editingSlot.kelas} hari ${editingSlot.hari} berhasil diperbarui!`);
  };

  // Guru Manager Actions
  const handleSaveGuruEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGuru) return;

    const newGurus = gurus.map(g => (g.kode === editingGuru.kode ? editingGuru : g));
    updateGurus(newGurus);
    setEditingGuru(null);
    showToast(`Data pengajar ${editingGuru.nama} berhasil disimpan!`);
  };

  const handleAddGuru = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuruNama.trim()) return;

    // determine unique code
    const kode = Number(newGuruKode) || (Math.max(...gurus.map(g => g.kode), 0) + 1);
    const existing = gurus.find(g => g.kode === kode);
    if (existing) {
      alert(`Kode guru ${kode} sudah digunakan oleh ${existing.nama}. Gunakan kode lain.`);
      return;
    }

    const newEntry: GuruJadwal = {
      kode,
      nama: newGuruNama.trim(),
      warnaBadge: 'bg-emerald-700 text-white',
    };

    updateGurus([...gurus, newEntry]);
    setNewGuruNama('');
    setNewGuruKode(kode + 1);
    showToast(`Ustadz/Guru baru "${newEntry.nama}" (Kode ${newEntry.kode}) berhasil ditambahkan!`);
  };

  // Filtered slots for Card view
  const filteredSlots = slots.filter(item => {
    const matchHari = selectedHari === 'Semua' || item.hari === selectedHari;
    const matchKelas = selectedKelas === 'Semua' || item.kelas === selectedKelas;
    const matchGuru = selectedGuruKode === 'Semua' || item.kodeGuru === selectedGuruKode;
    return matchHari && matchKelas && matchGuru;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-emerald-700 animate-in fade-in slide-in-from-bottom-5">
          <Check className="w-5 h-5 text-emerald-300 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
              Dokumen Resmi 2026/2027
            </span>
            {isAdmin && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Mode Admin: Dapat Ubah Jadwal & Guru
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2 mt-1">
            <Calendar className="w-6 h-6 text-emerald-700" />
            <span>Jadwal Pelajaran Madrasah Takmiliyah Annajiyah 2</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pondok Pesantren Bahrul Ulum Tambakberas Jombang
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-start lg:justify-end">
          {/* View Mode Switcher */}
          <div className="bg-slate-100 p-1 rounded-xl flex gap-1 border border-slate-200">
            <button
              onClick={() => setViewMode('matriks')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'matriks' ? 'bg-emerald-800 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Matriks Resmi (PDF)
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'card' ? 'bg-emerald-800 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kartu Per Kelas
            </button>
            <button
              onClick={() => setViewMode('guru')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'guru' ? 'bg-emerald-800 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Jadwal Per Pengajar
            </button>
          </div>

          {/* Admin Management Buttons */}
          {isAdmin && (
            <button
              onClick={() => setShowGuruManagerModal(true)}
              id="btn-kelola-guru-kode"
              className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-xs"
            >
              <UserCheck className="w-4 h-4" />
              <span>Kelola Guru & Kode</span>
            </button>
          )}

          <button
            onClick={() => setShowPdfModal(true)}
            id="btn-cetak-jadwal-resmi"
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Jadwal</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Matriks Resmi (Sesuai Gambar / PDF Dokumen) */}
      {viewMode === 'matriks' && (
        <div className="space-y-4">
          {isAdmin && (
            <div className="bg-amber-50/80 border border-amber-200 p-3.5 rounded-2xl flex items-center justify-between text-xs text-amber-900">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Petunjuk Admin:</strong> Klik langsung pada kotak jadwal (kitab/pelajaran) untuk mengubah kitab, mata pelajaran, atau mengganti Ustadz pengampu.
                </span>
              </div>
              <span className="text-[11px] font-bold text-amber-800 underline cursor-pointer" onClick={() => setShowGuruManagerModal(true)}>
                Ubah Nama Pengajar &rarr;
              </span>
            </div>
          )}

          {/* Table Container formatted exactly as the document */}
          <div className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden">
            {/* Document Header Banner */}
            <div className="bg-emerald-900 text-white p-4 text-center border-b border-emerald-800">
              <div className="flex items-center justify-center gap-3">
                <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain bg-white rounded-full p-1" />
                <div>
                  <h2 className="text-base sm:text-lg font-black tracking-wide uppercase">
                    JADWAL MADRASAH DINIYAH TAKMILIYAH ANNAJIYAH 2
                  </h2>
                  <p className="text-xs text-emerald-200 font-medium tracking-wider">
                    PONDOK PESANTREN BAHRUL ULUM TAMBAKBERAS JOMBANG — TAHUN AJARAN 2026/2027
                  </p>
                </div>
              </div>
            </div>

            {/* Timetable Table with overflow-x */}
            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse text-xs min-w-[1050px]">
                <thead>
                  {/* Top Header Row (Days) */}
                  <tr className="bg-emerald-800 text-white border-b border-emerald-700">
                    <th rowSpan={2} className="py-2.5 px-3 font-extrabold border-r border-emerald-700 w-16 uppercase">
                      Kelas
                    </th>
                    {hariList.map(h => (
                      <th key={h} colSpan={3} className="py-2 px-2 font-black border-r border-emerald-700 tracking-wide uppercase text-xs">
                        {h}
                      </th>
                    ))}
                  </tr>
                  {/* Sub Header Row (Kitab, Fan Ilmu, Kode) */}
                  <tr className="bg-emerald-100/80 text-emerald-950 font-bold border-b border-slate-300 text-[11px]">
                    {hariList.map(h => (
                      <React.Fragment key={`${h}-sub`}>
                        <th className="py-1 px-1 border-r border-slate-200 min-w-[95px]">Kitab</th>
                        <th className="py-1 px-1 border-r border-slate-200 min-w-[70px]">Fan Ilmu</th>
                        <th className="py-1 px-1 border-r border-emerald-300 w-12 text-center">Kode</th>
                      </React.Fragment>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {kelasList.map((k, idx) => (
                    <tr key={k} className={idx % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/60 hover:bg-slate-100/70'}>
                      {/* Class Name Column */}
                      <td className="py-2 px-2 font-black text-slate-900 border-r border-slate-300 bg-slate-100/80 text-sm">
                        {k}
                      </td>

                      {/* Day Columns */}
                      {hariList.map(h => {
                        const slot = getSlot(k, h);
                        const kode = slot ? slot.kodeGuru : 1;
                        const badgeColor = getGuruBadge(kode);
                        const guruNama = getGuruNama(kode);

                        return (
                          <React.Fragment key={`${k}-${h}`}>
                            {/* Kitab in Arabic */}
                            <td
                              onClick={() => isAdmin && slot && setEditingSlot(slot)}
                              className={`py-1.5 px-1 border-r border-slate-200 text-slate-900 font-semibold font-serif text-xs ${
                                isAdmin ? 'cursor-pointer hover:bg-amber-100/60' : ''
                              }`}
                              title={isAdmin ? 'Klik untuk mengubah jadwal ini' : undefined}
                            >
                              <div className="leading-tight truncate max-w-[110px]" dir="rtl">
                                {slot ? slot.kitab : '-'}
                              </div>
                              {slot?.kitabLatin && (
                                <div className="text-[9px] font-sans text-slate-500 font-normal leading-none mt-0.5 truncate" dir="ltr">
                                  {slot.kitabLatin}
                                </div>
                              )}
                            </td>

                            {/* Fan Ilmu */}
                            <td
                              onClick={() => isAdmin && slot && setEditingSlot(slot)}
                              className={`py-1.5 px-1 border-r border-slate-200 text-slate-700 font-medium text-[11px] ${
                                isAdmin ? 'cursor-pointer hover:bg-amber-100/60' : ''
                              }`}
                            >
                              {slot ? slot.fanIlmu : '-'}
                            </td>

                            {/* Kode Guru with colored badge */}
                            <td
                              onClick={() => isAdmin && slot && setEditingSlot(slot)}
                              className={`py-1 px-1 border-r border-emerald-200 text-center ${
                                isAdmin ? 'cursor-pointer hover:bg-amber-100/60' : ''
                              }`}
                            >
                              <span
                                className={`inline-block w-6 h-6 rounded-md text-[11px] font-black leading-6 shadow-2xs ${badgeColor}`}
                                title={`${kode}: ${guruNama}`}
                              >
                                {kode}
                              </span>
                            </td>
                          </React.Fragment>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Legend: Daftar Kode Guru & Names matching the image */}
            <div className="p-4 sm:p-5 border-t-2 border-slate-300 bg-slate-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-700" />
                  <span>Daftar Kode & Dewan Asatidz / Pengajar:</span>
                </h3>
                {isAdmin && (
                  <button
                    onClick={() => setShowGuruManagerModal(true)}
                    className="text-xs font-bold text-emerald-800 hover:text-emerald-950 underline"
                  >
                    + Edit Daftar Nama Guru
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
                {gurus.map((g) => (
                  <div
                    key={g.kode}
                    onClick={() => {
                      if (isAdmin) {
                        setEditingGuru(g);
                        setShowGuruManagerModal(true);
                      }
                    }}
                    className={`flex items-center gap-2 p-1.5 bg-white rounded-xl border border-slate-200 text-xs shadow-2xs ${
                      isAdmin ? 'cursor-pointer hover:border-amber-400 hover:bg-amber-50/40' : ''
                    }`}
                  >
                    <span className={`w-6 h-6 shrink-0 rounded-md font-black text-[11px] flex items-center justify-center ${g.warnaBadge}`}>
                      {g.kode}
                    </span>
                    <span className="font-semibold text-slate-800 truncate text-[11px]" title={g.nama}>
                      {g.nama}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Kartu Per Hari & Kelas */}
      {viewMode === 'card' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs font-bold text-slate-500 mr-1 shrink-0">Hari:</span>
              {(['Semua', ...hariList] as const).map(h => (
                <button
                  key={h}
                  onClick={() => setSelectedHari(h)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
                    selectedHari === h ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 shrink-0">Kelas:</span>
              <select
                value={selectedKelas}
                onChange={(e) => setSelectedKelas(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              >
                <option value="Semua">Semua Kelas (1A - 6)</option>
                {kelasList.map(k => (
                  <option key={k} value={k}>Kelas {k}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSlots.map(slot => {
              const guruNama = getGuruNama(slot.kodeGuru);
              const badgeColor = getGuruBadge(slot.kodeGuru);

              return (
                <div
                  key={slot.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between group relative"
                >
                  <div>
                    {/* Top Row: Day badge, Class badge, and Teacher Code */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-950 rounded-lg text-xs font-bold">
                          {slot.hari}
                        </span>
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-bold">
                          Kelas {slot.kelas}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`w-6 h-6 rounded-md text-[11px] font-black flex items-center justify-center ${badgeColor}`}>
                          {slot.kodeGuru}
                        </span>
                        {isAdmin && (
                          <button
                            onClick={() => setEditingSlot(slot)}
                            className="p-1 text-slate-400 hover:text-emerald-700 rounded-lg hover:bg-slate-100"
                            title="Edit Jadwal Ini"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Kitab & Fan */}
                    <div className="text-right font-serif text-lg font-bold text-slate-900 my-1" dir="rtl">
                      {slot.kitab}
                    </div>
                    {slot.kitabLatin && (
                      <p className="text-xs text-slate-500 font-medium">
                        Kitab: {slot.kitabLatin}
                      </p>
                    )}
                    <p className="text-sm font-extrabold text-emerald-950 mt-1">
                      Fan: {slot.fanIlmu}
                    </p>
                  </div>

                  {/* Teacher info */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <div className="flex items-center gap-1.5 font-medium truncate">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{guruNama}</span>
                    </div>
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 shrink-0">
                      19.30 WIB
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: Jadwal Per Pengajar (Memudahkan Admin menentukan jadwal guru) */}
      {viewMode === 'guru' && (
        <div className="space-y-4">
          {/* Guru Filter */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-600 shrink-0">Pilih Ustadz / Guru:</span>
              <select
                value={selectedGuruKode}
                onChange={(e) => setSelectedGuruKode(e.target.value === 'Semua' ? 'Semua' : Number(e.target.value))}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white w-full sm:w-72"
              >
                <option value="Semua">Semua Pengajar ({gurus.length} Asatidz)</option>
                {gurus.map(g => (
                  <option key={g.kode} value={g.kode}>
                    Kode {g.kode} — {g.nama}
                  </option>
                ))}
              </select>
            </div>

            {isAdmin && (
              <button
                onClick={() => setShowGuruManagerModal(true)}
                className="px-3.5 py-2 bg-emerald-800 text-white font-bold rounded-xl text-xs hover:bg-emerald-700 transition-colors"
              >
                + Kelola Dewan Guru
              </button>
            )}
          </div>

          {/* List of Teachers with their schedule */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gurus
              .filter(g => selectedGuruKode === 'Semua' || g.kode === selectedGuruKode)
              .map(guru => {
                const guruSlots = slots.filter(s => s.kodeGuru === guru.kode);

                return (
                  <div key={guru.kode} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center ${guru.warnaBadge}`}>
                          {guru.kode}
                        </span>
                        <div>
                          <h3 className="font-extrabold text-sm text-slate-900">{guru.nama}</h3>
                          <p className="text-[11px] text-slate-500">Mengampu {guruSlots.length} Sesi Pertemuan</p>
                        </div>
                      </div>

                      {isAdmin && (
                        <button
                          onClick={() => {
                            setEditingGuru(guru);
                            setShowGuruManagerModal(true);
                          }}
                          className="text-xs text-slate-500 hover:text-emerald-800 p-1 rounded hover:bg-slate-100"
                          title="Ubah Nama Guru"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Schedule Slots assigned to this Guru */}
                    <div className="space-y-2">
                      {guruSlots.length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-2">Belum ada kelas yang ditentukan untuk pengajar ini.</p>
                      ) : (
                        guruSlots.map(s => (
                          <div
                            key={s.id}
                            className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl text-xs border border-slate-200/80"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                                {s.hari}
                              </span>
                              <span className="font-bold text-slate-800">
                                Kelas {s.kelas}
                              </span>
                              <span className="text-slate-600 font-serif text-[13px] font-bold" dir="rtl">
                                {s.kitab}
                              </span>
                              <span className="text-slate-400">({s.fanIlmu})</span>
                            </div>

                            {isAdmin && (
                              <button
                                onClick={() => setEditingSlot(s)}
                                className="text-xs text-amber-700 hover:text-amber-900 font-bold px-2 py-1 rounded hover:bg-amber-100"
                              >
                                Ubah
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* MODAL: Ubah / Tentukan Jadwal (Admin) */}
      {isAdmin && editingSlot && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-emerald-700" />
                  <span>Ubah Jadwal Pelajaran (Admin)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Tentukan Kitab, Fan Ilmu, dan Guru Pengampu untuk Kelas {editingSlot.kelas} - Hari {editingSlot.hari}
                </p>
              </div>
              <button
                onClick={() => setEditingSlot(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSlot} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kelas</label>
                  <select
                    value={editingSlot.kelas}
                    onChange={(e) => setEditingSlot({ ...editingSlot, kelas: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    {kelasList.map(k => (
                      <option key={k} value={k}>Kelas {k}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hari</label>
                  <select
                    value={editingSlot.hari}
                    onChange={(e) => setEditingSlot({ ...editingSlot, hari: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    {hariList.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Kitab (Bahasa Arab / Pegon)</label>
                <input
                  type="text"
                  required
                  value={editingSlot.kitab}
                  onChange={(e) => setEditingSlot({ ...editingSlot, kitab: e.target.value })}
                  placeholder="Contoh: فتح القريب"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-serif text-sm text-right"
                  dir="rtl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Transliterasi Kitab (Latin)</label>
                  <input
                    type="text"
                    value={editingSlot.kitabLatin || ''}
                    onChange={(e) => setEditingSlot({ ...editingSlot, kitabLatin: e.target.value })}
                    placeholder="Contoh: Fathul Qorib"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fan Ilmu (Mata Pelajaran)</label>
                  <select
                    value={editingSlot.fanIlmu}
                    onChange={(e) => setEditingSlot({ ...editingSlot, fanIlmu: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                  >
                    {fanIlmuOptions.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Select Guru Pengampu */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Ustadz / Guru Pengampu (Kode Pengajar)
                </label>
                <select
                  value={editingSlot.kodeGuru}
                  onChange={(e) => setEditingSlot({ ...editingSlot, kodeGuru: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                >
                  {gurus.map(g => (
                    <option key={g.kode} value={g.kode}>
                      Kode {g.kode} — {g.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingSlot(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors shadow-xs"
                >
                  Simpan Perubahan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Kelola Daftar Guru & Kode (Admin) */}
      {isAdmin && showGuruManagerModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-700" />
                  <span>Kelola Daftar Guru & Kode Pelajaran (Admin)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Ubah nama guru, perbarui kode pengajar, atau tambah pengajar baru
                </p>
              </div>
              <button
                onClick={() => {
                  setShowGuruManagerModal(false);
                  setEditingGuru(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form to Edit selected Guru */}
            {editingGuru && (
              <form onSubmit={handleSaveGuruEdit} className="p-4 bg-amber-50 rounded-2xl border border-amber-200 mb-4 space-y-3">
                <h4 className="font-extrabold text-xs text-amber-950 flex items-center gap-1.5">
                  <Edit3 className="w-4 h-4 text-amber-700" />
                  <span>Ubah Nama Guru (Kode {editingGuru.kode})</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Nama Lengkap & Gelar</label>
                    <input
                      type="text"
                      required
                      value={editingGuru.nama}
                      onChange={(e) => setEditingGuru({ ...editingGuru, nama: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Kode Angka</label>
                    <input
                      type="number"
                      required
                      value={editingGuru.kode}
                      onChange={(e) => setEditingGuru({ ...editingGuru, kode: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingGuru(null)}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 rounded-lg text-xs font-bold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-emerald-800 text-white rounded-lg text-xs font-bold hover:bg-emerald-700"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            )}

            {/* Form to Add New Guru */}
            <form onSubmit={handleAddGuru} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 mb-4 space-y-3">
              <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-emerald-700" />
                <span>Tambah Ustadz / Pengajar Baru</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    required
                    placeholder="Nama Lengkap Ustadz / Guru..."
                    value={newGuruNama}
                    onChange={(e) => setNewGuruNama(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    required
                    placeholder="Kode"
                    value={newGuruKode}
                    onChange={(e) => setNewGuruKode(Number(e.target.value))}
                    className="w-20 px-2 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-center"
                  />
                  <button
                    type="submit"
                    className="flex-1 px-3 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                  >
                    + Tambah
                  </button>
                </div>
              </div>
            </form>

            {/* List of Teachers */}
            <div className="space-y-1.5 max-h-64 overflow-y-auto divide-y divide-slate-100">
              {gurus.map((g) => (
                <div key={g.kode} className="py-2 px-2 flex items-center justify-between text-xs hover:bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-md text-xs font-black flex items-center justify-center ${g.warnaBadge}`}>
                      {g.kode}
                    </span>
                    <span className="font-bold text-slate-800">{g.nama}</span>
                  </div>
                  <button
                    onClick={() => setEditingGuru(g)}
                    className="px-2.5 py-1 text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 rounded font-semibold text-[11px]"
                  >
                    Ubah Nama
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 mt-4">
              <button
                onClick={() => {
                  setShowGuruManagerModal(false);
                  setEditingGuru(null);
                }}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Modal */}
      <PdfPreviewModal
        isOpen={showPdfModal}
        onClose={() => setShowPdfModal(false)}
        type="jadwal"
        title="Jadwal Pelajaran Madrasah Takmiliyah Annajiyah 2"
        data={filteredSlots}
      />
    </div>
  );
};
