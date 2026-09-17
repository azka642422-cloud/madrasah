import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Eye,
  Download,
  Printer,
  Search,
  Filter,
  FileSpreadsheet,
  FileCode,
  FileCheck,
  Plus,
  X,
  Sparkles
} from 'lucide-react';
import { MOCK_MATERI } from '../data/mockData';
import { MateriItem } from '../types';
import { PdfPreviewModal } from '../components/PdfPreviewModal';

export const MateriView: React.FC = () => {
  const [materiList, setMateriList] = useState<MateriItem[]>(MOCK_MATERI);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMapel, setSelectedMapel] = useState<string>('Semua');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedPdfMateri, setSelectedPdfMateri] = useState<MateriItem | null>(null);

  // New Upload Form state
  const [newJudul, setNewJudul] = useState('');
  const [newMapel, setNewMapel] = useState('Bahasa Arab');
  const [newKelas, setNewKelas] = useState('Kelas 5A');
  const [newGuru, setNewGuru] = useState('Ustadz Ahmad Fauzi, Lc.');
  const [newJenis, setNewJenis] = useState<'PDF' | 'Word' | 'PPT'>('PDF');
  const [newUkuran, setNewUkuran] = useState('2.4 MB');
  const [uploadToast, setUploadToast] = useState(false);

  // Filtered
  const filteredMateri = materiList.filter(m => {
    const matchSearch = m.judul.toLowerCase().includes(searchQuery.toLowerCase()) || m.guru.toLowerCase().includes(searchQuery.toLowerCase());
    const matchMapel = selectedMapel === 'Semua' || m.mataPelajaran === selectedMapel;
    return matchSearch && matchMapel;
  });

  const handleCreateMateri = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJudul) return;

    const newEntry: MateriItem = {
      id: `materi-${Date.now()}`,
      judul: newJudul,
      mataPelajaran: newMapel,
      guru: newGuru,
      kelas: newKelas,
      jenisFile: newJenis,
      ukuranFile: newUkuran,
      tanggalUpload: '06 Sep 2026',
      deskripsi: 'Modul materi ajar digital baru santri Pesantren Terpadu.',
    };

    setMateriList([newEntry, ...materiList]);
    setShowUploadModal(false);
    setNewJudul('');
    setUploadToast(true);
    setTimeout(() => setUploadToast(false), 3500);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-700" />
            <span>Materi Pembelajaran & Kitab Digital</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pustaka modul kurikulum Madin, kitab kuning, bahan tayang presentasi, dan lembar kerja santri
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          id="btn-upload-materi-baru"
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition-all shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Materi Baru</span>
        </button>
      </div>

      {uploadToast && (
        <div className="bg-emerald-800 text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Materi pembelajaran berhasil diunggah dan dibagikan ke santri.</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari judul materi, guru, atau kitab..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-500 font-medium mr-1 hidden sm:inline">Mapel:</span>
          {['Semua', 'Bahasa Arab', 'Fiqih', "Tajwid & Qur'an", 'Hadits'].map(mapel => (
            <button
              key={mapel}
              onClick={() => setSelectedMapel(mapel)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                selectedMapel === mapel
                  ? 'bg-emerald-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {mapel}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMateri.map((item) => {
          let fileBadgeBg = 'bg-rose-100 text-rose-800 border-rose-200';
          if (item.jenisFile === 'Word') fileBadgeBg = 'bg-blue-100 text-blue-800 border-blue-200';
          if (item.jenisFile === 'PPT') fileBadgeBg = 'bg-orange-100 text-orange-800 border-orange-200';

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-emerald-300 hover:shadow-lg transition-all flex flex-col justify-between group"
            >
              <div>
                {/* File format & Size */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${fileBadgeBg}`}>
                    {item.jenisFile}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {item.ukuranFile}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-emerald-950 transition-colors leading-snug">
                  {item.judul}
                </h3>

                {/* Teacher & Class */}
                <div className="mt-2 space-y-1 text-xs text-slate-500">
                  <p className="font-medium text-slate-700">Guru: {item.guru}</p>
                  <p className="text-[11px]">Sasaran: <span className="font-semibold text-emerald-800">{item.kelas}</span> • {item.mataPelajaran}</p>
                </div>

                {item.deskripsi && (
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
                    {item.deskripsi}
                  </p>
                )}
              </div>

              {/* Action Buttons: Preview, Download, Cetak */}
              <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-1.5 text-xs">
                <button
                  onClick={() => setSelectedPdfMateri(item)}
                  className="flex items-center justify-center gap-1 py-1.5 px-2 bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-900 rounded-xl font-semibold transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>
                <button
                  onClick={() => setSelectedPdfMateri(item)}
                  className="flex items-center justify-center gap-1 py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl font-semibold transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => setSelectedPdfMateri(item)}
                  className="flex items-center justify-center gap-1 py-1.5 px-2 bg-slate-50 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upload Modal Form */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-emerald-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-700" />
                <span>Unggah Materi Pembelajaran Baru</span>
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMateri} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Judul Materi / Modul</label>
                <input
                  type="text"
                  placeholder="Contoh: Modul Kaidah Nahwu Bab Manshubat"
                  value={newJudul}
                  onChange={(e) => setNewJudul(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mata Pelajaran</label>
                  <select
                    value={newMapel}
                    onChange={(e) => setNewMapel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Bahasa Arab">Bahasa Arab</option>
                    <option value="Fiqih">Fiqih Muamalah</option>
                    <option value="Tajwid & Qur'an">Tajwid &amp; Madrasatul Qur&apos;an</option>
                    <option value="Hadits">Kajian Hadits</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Kelas</label>
                  <select
                    value={newKelas}
                    onChange={(e) => setNewKelas(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Kelas 5A">Kelas 5A</option>
                    <option value="Kelas 5B">Kelas 5B</option>
                    <option value="Kelas 6">Kelas 6</option>
                    <option value="Semua Kelas">Semua Kelas</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Format Berkas</label>
                  <select
                    value={newJenis}
                    onChange={(e) => setNewJenis(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="PDF">Dokumen PDF (.pdf)</option>
                    <option value="Word">Microsoft Word (.docx)</option>
                    <option value="PPT">PowerPoint Presentation (.pptx)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Perkiraan Ukuran</label>
                  <input
                    type="text"
                    value={newUkuran}
                    onChange={(e) => setNewUkuran(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Upload Drag-and-drop simulated box */}
              <div className="border-2 border-dashed border-emerald-200 hover:border-emerald-500 rounded-2xl p-4 text-center bg-emerald-50/40 cursor-pointer">
                <Upload className="w-6 h-6 text-emerald-700 mx-auto mb-1" />
                <p className="font-bold text-emerald-950">Klik atau seret file dokumen Anda ke sini</p>
                <p className="text-[10px] text-slate-500">Maksimal ukuran file: 25 MB (PDF, DOCX, PPTX)</p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl shadow-md"
                >
                  Unggah Berkas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview PDF Modal */}
      {selectedPdfMateri && (
        <PdfPreviewModal
          isOpen={!!selectedPdfMateri}
          onClose={() => setSelectedPdfMateri(null)}
          type="materi"
          title={`Materi: ${selectedPdfMateri.judul}`}
          data={selectedPdfMateri}
        />
      )}

    </div>
  );
};
