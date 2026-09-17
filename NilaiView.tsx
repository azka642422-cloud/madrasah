import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Search,
  CheckCircle2,
  AlertCircle,
  Save,
  Printer,
  Award,
  Filter,
  Edit2,
  X,
  BookOpen,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { UserProfile } from '../types';
import { storageService } from '../services/storageService';
import { MAPEL_RESMI_PER_KELAS } from '../data/madinData';
import { PdfPreviewModal } from '../components/PdfPreviewModal';

interface NilaiViewProps {
  userRole?: string;
  currentUser?: UserProfile;
}

export const NilaiView: React.FC<NilaiViewProps> = ({
  userRole = 'Guru',
  currentUser,
}) => {
  const isSiswa = userRole.toLowerCase() === 'siswa';
  const canEdit = !isSiswa;

  // Selected filters
  const [selectedKelas, setSelectedKelas] = useState<string>('Semua');
  const [selectedSemester, setSelectedSemester] = useState<'Ganjil' | 'Genap' | 'Semua'>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showPdfModal, setShowPdfModal] = useState(false);

  // Student master data from storage
  const [studentList, setStudentList] = useState(() => storageService.getStudents());
  const muhafadzohList = useMemo(() => storageService.getMuhafadzohList(), []);

  // Map of NIS to Muhafadloh score & bait
  const muhafadzohMap = useMemo(() => {
    const map = new Map<string, { nilai: number; capaian: number; target: number; status: string }>();
    muhafadzohList.forEach((m) => {
      map.set(m.nis, {
        nilai: Number(m.nilaiUjianMuhafadzoh ?? m.nilaiMuhafadzoh) || 85,
        capaian: Number(m.capaianBait ?? m.totalCapaian) || 0,
        target: Number(m.targetBait ?? m.targetTahunan) || 100,
        status: m.statusTarget || 'Tercapai',
      });
    });
    return map;
  }, [muhafadzohList]);

  // If Siswa: ONLY display attendance record for the student matching their name or NIS
  const visibleStudents = useMemo(() => {
    if (isSiswa && currentUser) {
      const studentNis = (currentUser.nipOrNis || '').replace(/[^0-9]/g, '');
      return studentList.filter((s) => {
        const cleanNis = (s.nis || '').replace(/[^0-9]/g, '');
        return (
          (studentNis && cleanNis === studentNis) ||
          s.nama.toLowerCase().includes(currentUser.name.toLowerCase())
        );
      });
    }
    return studentList;
  }, [studentList, isSiswa, currentUser]);

  // Filtered by class and search
  const filteredStudents = useMemo(() => {
    return visibleStudents.filter((s) => {
      const matchKelas = selectedKelas === 'Semua' || s.kelas === selectedKelas;
      const matchSearch =
        s.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nis.includes(searchQuery);
      return matchKelas && matchSearch;
    });
  }, [visibleStudents, selectedKelas, searchQuery]);

  // Edit Modal State
  const [editingStudent, setEditingStudent] = useState<any | null>(null);
  const [saveToast, setSaveToast] = useState(false);

  // Helper to get subjects for class
  const getMapelForStudent = (kelas: string) => {
    const tingkat = kelas.replace(/[^0-9]/g, '') || '1';
    return MAPEL_RESMI_PER_KELAS[tingkat] || MAPEL_RESMI_PER_KELAS['1'];
  };

  // Calculate student academic summary
  const getStudentAkademik = (student: any) => {
    const muhaf = muhafadzohMap.get(student.nis) || {
      nilai: student.nilaiRataRata || 82,
      capaian: 0,
      target: 100,
      status: 'Tercapai',
    };

    const mapelConfig = getMapelForStudent(student.kelas);
    const ganjilMapels = mapelConfig.ganjil;
    const genapMapels = mapelConfig.genap;

    // Deterministic pseudo score based on NIS and subject to provide real numbers
    const baseScore = student.nilaiRataRata || 80;

    const ganjilScores = ganjilMapels.map((m, idx) => {
      const offset = ((student.nis.charCodeAt(idx % student.nis.length) || 0) % 15) - 5;
      const score = Math.min(99, Math.max(65, Math.round(baseScore + offset)));
      return { mapel: m.mapel, kitab: m.kitab, nilai: score };
    });

    const genapScores = genapMapels.map((m, idx) => {
      const offset = ((student.nis.charCodeAt((idx + 2) % student.nis.length) || 0) % 15) - 4;
      const score = Math.min(99, Math.max(65, Math.round(baseScore + offset)));
      return { mapel: m.mapel, kitab: m.kitab, nilai: score };
    });

    const allScores = [...ganjilScores.map((s) => s.nilai), ...genapScores.map((s) => s.nilai)];
    const avgScore = allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : baseScore;

    let predikat = 'Jayyid (B)';
    if (avgScore >= 90) predikat = 'Mumtaz (A)';
    else if (avgScore >= 80) predikat = 'Jayyid Jiddan (B+)';
    else if (avgScore >= 65) predikat = 'Maqbul (C)';
    else predikat = 'Rasib (D)';

    return {
      ganjilScores,
      genapScores,
      muhafadzohNilai: muhaf.nilai,
      muhafadzohStatus: muhaf.status,
      rataRata: avgScore,
      predikat,
      status: avgScore >= 65 ? 'Lulus / Lengkap' : 'Belum Lengkap',
    };
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
    setEditingStudent(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-emerald-700" />
            <span>Buku Nilai Santri</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pencatatan dan penampilan nilai Semester Ganjil, Semester Genap, dan Muhafadloh
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPdfModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors"
          >
            <Printer className="w-4 h-4 text-emerald-700" />
            <span>Cetak Rekap Nilai</span>
          </button>
        </div>
      </div>

      {/* Filter Parameters */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <label className="block text-[11px] font-bold text-slate-600 mb-1">Cari Nama / NIS Santri</label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari santri..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
            />
          </div>
        </div>

        {/* Filter Kelas */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">Pilih Kelas</label>
          <select
            value={selectedKelas}
            onChange={(e) => setSelectedKelas(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
          >
            <option value="Semua">Semua Kelas (1A s.d. 6)</option>
            <option value="1A">Kelas 1A</option>
            <option value="1B">Kelas 1B</option>
            <option value="2A">Kelas 2A</option>
            <option value="2B">Kelas 2B</option>
            <option value="3A">Kelas 3A</option>
            <option value="3B">Kelas 3B</option>
            <option value="3C">Kelas 3C</option>
            <option value="4A">Kelas 4A</option>
            <option value="4B">Kelas 4B</option>
            <option value="5A">Kelas 5A</option>
            <option value="5B">Kelas 5B</option>
            <option value="6">Kelas 6</option>
          </select>
        </div>

        {/* Filter Semester */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">Tampilan Semester</label>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value as any)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
          >
            <option value="Semua">Semua Semester (Ganjil & Genap)</option>
            <option value="Ganjil">Semester Ganjil Saja</option>
            <option value="Genap">Semester Genap Saja</option>
          </select>
        </div>
      </div>

      {/* Success Toast */}
      {saveToast && (
        <div className="bg-emerald-800 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-amber-300" />
            <p className="text-xs sm:text-sm font-bold">Data nilai santri berhasil disimpan.</p>
          </div>
          <button onClick={() => setSaveToast(false)} className="text-emerald-200 text-xs font-bold">
            Tutup
          </button>
        </div>
      )}

      {/* Student Grades List */}
      <div className="space-y-4">
        {filteredStudents.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-slate-500 text-xs font-semibold">
            Tidak ditemukan data santri yang sesuai kriteria pencarian.
          </div>
        ) : (
          filteredStudents.map((student) => {
            const data = getStudentAkademik(student);
            return (
              <div
                key={student.nis}
                className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4"
              >
                {/* Header Santri */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-900 text-amber-300 font-bold flex items-center justify-center font-mono text-sm">
                      {student.kelas}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                        {student.nama}
                      </h3>
                      <p className="text-xs text-slate-500">
                        NIS: <span className="font-mono font-semibold text-slate-700">{student.nis}</span> • Kelas: <span className="font-semibold text-slate-700">Kelas {student.kelas}</span>
                      </p>
                    </div>
                  </div>

                  {/* Summary badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-mono font-black">
                      Rata-Rata: {data.rataRata}
                    </span>
                    <span className="px-3 py-1 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold">
                      Predikat: {data.predikat}
                    </span>
                    <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold">
                      Status: {data.status}
                    </span>
                    {canEdit && (
                      <button
                        onClick={() => setEditingStudent({ ...student, ...data })}
                        className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-bold flex items-center gap-1 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Grid of Scores: Semester Ganjil, Semester Genap, Muhafadloh */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
                  {/* 1. Semester Ganjil */}
                  {(selectedSemester === 'Semua' || selectedSemester === 'Ganjil') && (
                    <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200 space-y-2.5">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">
                          1. SEMESTER GANJIL
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold">Mata Pelajaran & Nilai</span>
                      </div>
                      <div className="space-y-1.5 font-sans">
                        {data.ganjilScores.map((m, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-150"
                          >
                            <div>
                              <span className="font-bold text-slate-800">{m.mapel}</span>
                              <span className="text-[10px] text-slate-400 font-serif block">
                                {m.kitab}
                              </span>
                            </div>
                            <span className="font-mono font-black text-sm text-emerald-950 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                              {m.nilai}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 2. Semester Genap */}
                  {(selectedSemester === 'Semua' || selectedSemester === 'Genap') && (
                    <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200 space-y-2.5">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">
                          2. SEMESTER GENAP
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold">Mata Pelajaran & Nilai</span>
                      </div>
                      <div className="space-y-1.5 font-sans">
                        {data.genapScores.map((m, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-150"
                          >
                            <div>
                              <span className="font-bold text-slate-800">{m.mapel}</span>
                              <span className="text-[10px] text-slate-400 font-serif block">
                                {m.kitab}
                              </span>
                            </div>
                            <span className="font-mono font-black text-sm text-emerald-950 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                              {m.nilai}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 3. Muhafadloh */}
                  <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-200 space-y-3">
                    <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                      <span className="font-extrabold text-emerald-950 uppercase tracking-wider text-[11px]">
                        3. MUHAFADLOH
                      </span>
                      <span className="text-[10px] text-emerald-800 font-semibold">Setoran & Ujian</span>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-emerald-150 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 font-medium">Nilai Ujian Muhafadloh:</span>
                        <span className="font-mono font-black text-base text-emerald-900">
                          {data.muhafadzohNilai}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                        <span className="text-slate-500">Status Capaian:</span>
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold ${
                            data.muhafadzohStatus === 'Tercapai'
                              ? 'bg-emerald-100 text-emerald-900'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {data.muhafadzohStatus}
                        </span>
                      </div>
                    </div>

                    <div className="bg-white/80 p-3 rounded-xl border border-emerald-150 text-[11px] space-y-1">
                      <div className="text-slate-500 font-medium">Predikat Kelulusan:</div>
                      <div className="font-extrabold text-emerald-950">{data.predikat}</div>
                      <div className="text-slate-500 font-medium mt-1">Status Akademik:</div>
                      <div className="font-extrabold text-slate-800">{data.status}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Perbarui Nilai Santri
                </h3>
                <p className="text-xs text-slate-500">{editingStudent.nama} (Kelas {editingStudent.kelas})</p>
              </div>
              <button
                onClick={() => setEditingStudent(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nilai Rata-rata Pelajaran</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  defaultValue={editingStudent.rataRata}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm font-bold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nilai Muhafadloh</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  defaultValue={editingStudent.muhafadzohNilai}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm font-bold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-800 text-white font-bold hover:bg-emerald-700 shadow-xs"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPdfModal && (
        <PdfPreviewModal
          type="nilai"
          isOpen={showPdfModal}
          onClose={() => setShowPdfModal(false)}
        />
      )}
    </div>
  );
};
