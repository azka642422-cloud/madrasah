import React, { useState } from 'react';
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  Clock,
  BookOpen,
  Award,
  AlertTriangle,
  Save,
  Edit2
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { UserProfile } from '../types';

interface PeraturanGuruViewProps {
  currentUser?: UserProfile;
  userRole?: string;
}

export const PeraturanGuruView: React.FC<PeraturanGuruViewProps> = ({
  currentUser,
  userRole = 'Guru',
}) => {
  const isAdmin = userRole.toLowerCase() === 'admin';
  const isSiswa = userRole.toLowerCase() === 'siswa';

  const [peraturanText, setPeraturanText] = useState(() =>
    storageService.getPeraturanGuru()
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(peraturanText);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSave = () => {
    storageService.savePeraturanGuru(editText);
    setPeraturanText(editText);
    setIsEditing(false);
    showToast('Peraturan & Disiplin Guru Pengajar berhasil diperbarui.');
  };

  const aturanKategori = [
    {
      kategori: '1. KEHADIRAN & WAKTU MENGAJAR',
      items: [
        'Jam KBM Diniyah Takmiliyah dimulai serentak pukul 20.00 WIB s/d 21.10 WIB.',
        'Asatidz wajib hadir di ruang kelas selambat-lambatnya 5 menit sebelum bel masuk berbunyi.',
        'Mengisi presensi digital santri melalui aplikasi madrasah di setiap sesi KBM.',
        'Menutup sesi pembelajaran tepat waktu dengan doa kaffaratul majelis.',
      ],
    },
    {
      kategori: '2. ADAB & PENAMPILAN BUSANA',
      items: [
        'Mengenakan pakaian rapi khas santri: berbusana muslim/baju taqwa, bersarung sopan, dan berpeci.',
        'Menjadi teladan utama (qudwah hasanah) dalam akhlak, tutur kata, dan perilaku bagi santri.',
        'Dilarang merokok atau menggunakan gawai untuk hal non-pembelajaran di dalam ruang kelas.',
      ],
    },
    {
      kategori: '3. PROSEDUR KETIDAKHADIRAN & GURU BADAL',
      items: [
        'Jika berhalangan hadir karena uzur syar\'i, wajib memberitahukan kepada Pengurus / Sekretariat Madrasah paling lambat pukul 17.00 WIB.',
        'Menyiapkan bahan ajar/tugas muthala\'ah kitab mandiri untuk santri di kelas.',
        'Berkoordinasi dengan bagian piket untuk penugasan asatidz pengganti (badal).',
      ],
    },
    {
      kategori: '4. EVALUASI, SETORAN MUHAFADLOH & RAPORT',
      items: [
        'Menyimak setoran bait muhafadzoh nadhom santri sesuai target silabus kelas masing-masing.',
        'Melakukan penilaian tugas, imtihan syyafahi (lisan), dan imtihan tahriri (tulis) secara objektif.',
        'Melengkapi nilai raport santri tepat waktu sebelum sidang pleno kelulusan dan pembagian raport.',
      ],
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-700" />
            <span>Peraturan & Disiplin Guru Pengajar</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pedoman kedisiplinan, jam mengajar KBM 20.00 - 21.10 WIB, adab busana, dan tata tertib asatidz Madrasah Diniyah Takmiliyah An-Najiyah 2
          </p>
        </div>

        {isAdmin && !isEditing && (
          <button
            onClick={() => {
              setEditText(peraturanText);
              setIsEditing(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <Edit2 className="w-4 h-4" />
            <span>Kelola Dokumen Aturan</span>
          </button>
        )}
      </div>

      {toastMessage && (
        <div className="bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-3 border border-slate-700 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Mode Edit Admin */}
      {isEditing ? (
        <div className="bg-white rounded-3xl p-6 border border-emerald-300 shadow-lg space-y-4 animate-in fade-in text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-emerald-700" />
              <span>Edit Naskah Peraturan Guru Pengajar</span>
            </h2>
            <span className="text-[11px] text-slate-400">Hak Akses: Administrator</span>
          </div>

          <textarea
            rows={14}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full p-4 bg-slate-50 border border-slate-300 rounded-2xl font-mono text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none leading-relaxed"
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Peraturan</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Highlight Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Waktu KBM Diniyah</span>
              <span className="text-lg font-black text-emerald-950 font-mono block">20.00 - 21.10 WIB</span>
              <span className="text-[11px] text-emerald-700 font-semibold">Hadir 5 Menit Lebih Awal</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Batas Izin Badal</span>
              <span className="text-lg font-black text-emerald-950 font-mono block">17.00 WIB</span>
              <span className="text-[11px] text-blue-700 font-semibold">Konfirmasi ke Pengurus</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Standar Busana</span>
              <span className="text-lg font-black text-emerald-950 block">Sarung & Peci</span>
              <span className="text-[11px] text-amber-700 font-semibold">Ciri Khas Santri</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Kewajiban Presensi</span>
              <span className="text-lg font-black text-emerald-950 block">Digital & Jurnal</span>
              <span className="text-[11px] text-teal-700 font-semibold">Tiap Hari Efektif KBM</span>
            </div>
          </div>

          {/* Rincian Butir-Butir Peraturan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aturanKategori.map((kat, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3"
              >
                <h3 className="font-black text-slate-900 text-xs sm:text-sm tracking-wide border-b border-slate-100 pb-2.5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-700"></span>
                  <span>{kat.kategori}</span>
                </h3>
                <ul className="space-y-2.5 text-xs text-slate-700">
                  {kat.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="flex items-start gap-2.5 leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Naskah Lengkap */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-700" />
              <span>Naskah Dokumen Tata Tertib Guru Pengajar (09_PERATURAN_GURU_PENGAJAR)</span>
            </h3>
            <pre className="p-4 bg-slate-50 rounded-2xl border border-slate-200 font-sans text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
              {peraturanText}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
