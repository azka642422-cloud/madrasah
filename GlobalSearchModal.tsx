import React, { useState, useEffect, useRef } from 'react';
import { Search, X, User, GraduationCap, FileText, Calendar, BookOpen, ChevronRight, FileSpreadsheet, Sparkles } from 'lucide-react';
import { MOCK_SANTRI, MOCK_JADWAL, MOCK_MATERI, MOCK_DOKUMEN_PESANTREN, INITIAL_NILAI_LIST } from '../data/mockData';
import { storageService } from '../services/storageService';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult?: (category: string, item: any) => void;
  onNavigate?: (page: any) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectResult,
  onNavigate,
}) => {
  const [query, setQuery] = useState('Ahmad'); // default prefilled with 'Ahmad' to immediately demonstrate requested capability!
  const inputRef = useRef<HTMLInputElement>(null);

  const handleItemClick = (category: string, item: any) => {
    if (onSelectResult) {
      onSelectResult(category, item);
    }
    if (onNavigate) {
      if (category === 'muhafadzoh') onNavigate('muhafadzoh');
      else if (category === 'siswa') onNavigate('siswa');
      else if (category === 'nilai') onNavigate('nilai');
      else if (category === 'raport') onNavigate('raport');
      else if (category === 'jadwal') onNavigate('jadwal');
      else if (category === 'materi') onNavigate('materi');
      else if (category === 'dokumen') onNavigate('pesantren_info');
      else onNavigate('dashboard');
    }
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  // Filter categorized items
  const muhafadzohList = storageService.getMuhafadzohList();
  const matchedMuhafadzoh = muhafadzohList.filter(s => s.nama.toLowerCase().includes(q) || s.nis.includes(q));
  const matchedSantri = MOCK_SANTRI.filter(s => s.nama.toLowerCase().includes(q) || s.nis.includes(q));
  const matchedNilai = INITIAL_NILAI_LIST.filter(n => n.nama.toLowerCase().includes(q) || n.nis.includes(q));
  const matchedRaport = MOCK_SANTRI.filter(s => s.nama.toLowerCase().includes(q));
  const matchedJadwal = MOCK_JADWAL.filter(j => 
    j.mataPelajaran.toLowerCase().includes(q) || 
    j.guru.toLowerCase().includes(q) || 
    j.kelas.toLowerCase().includes(q)
  );
  const matchedMateri = MOCK_MATERI.filter(m => 
    m.judul.toLowerCase().includes(q) || 
    m.mataPelajaran.toLowerCase().includes(q) ||
    m.guru.toLowerCase().includes(q)
  );
  const matchedDokumen = MOCK_DOKUMEN_PESANTREN.filter(d => 
    d.judul.toLowerCase().includes(q) || 
    d.nomorSurat.toLowerCase().includes(q)
  );

  const totalResults = matchedMuhafadzoh.length + matchedSantri.length + matchedNilai.length + matchedRaport.length + matchedJadwal.length + matchedMateri.length + matchedDokumen.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-emerald-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Search Header Bar */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/70">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <Search className="w-5 h-5 text-emerald-700" />
          </div>
          <input
            ref={inputRef}
            type="text"
            id="input-global-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari siswa, nilai, raport, jadwal, materi, dokumen..."
            className="flex-1 bg-transparent text-base sm:text-lg font-medium text-slate-800 placeholder:text-slate-400 focus:outline-hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg ml-1"
          >
            ESC
          </button>
        </div>

        {/* Search Content Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {q.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              <Search className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-medium text-slate-600">Pencarian Terpadu Cepat</p>
              <p className="text-xs text-slate-400 mt-1">Ketik kata kunci seperti &ldquo;Ahmad&rdquo;, &ldquo;Nahwu&rdquo;, &ldquo;Raport&rdquo;, atau &ldquo;Jadwal&rdquo;</p>
            </div>
          ) : totalResults === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              <p className="font-medium text-slate-600">Tidak ada hasil ditemukan untuk &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-slate-400 mt-1">Coba gunakan kata kunci nama santri, mata pelajaran, atau dokumen lain.</p>
            </div>
          ) : (
            <>
              {/* Category 0: Data 247 Siswa & Muhafadzoh */}
              {matchedMuhafadzoh.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Data Santri & Muhafadzoh ({matchedMuhafadzoh.length} Siswa)</span>
                  </div>
                  <div className="space-y-1.5">
                    {matchedMuhafadzoh.slice(0, 8).map(s => (
                      <div
                        key={s.nis}
                        onClick={() => handleItemClick('muhafadzoh', s)}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-emerald-50/80 border border-emerald-100 hover:border-emerald-300 cursor-pointer transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-xs shrink-0 font-serif">
                            {s.nama.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-800 group-hover:text-emerald-950 flex items-center gap-2">
                              <span>{s.nama}</span>
                              <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">
                                {s.kelas}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 font-mono">
                              NIS: <span className="font-bold text-emerald-800">{s.nis}</span> • Tingkat {s.tingkat} • Target: {s.targetTahunan}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-emerald-800 bg-emerald-100/70 px-2.5 py-1 rounded-lg flex items-center gap-1">
                          Analisis Muhafadzoh <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Category 1: Data Siswa */}
              {matchedSantri.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
                    <User className="w-3.5 h-3.5" />
                    <span>Database Siswa ({matchedSantri.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {matchedSantri.map(s => (
                      <div
                        key={s.id}
                        onClick={() => handleItemClick('siswa', s)}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-emerald-50/70 border border-slate-100 hover:border-emerald-200 cursor-pointer transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <img src={s.foto} alt={s.nama} className="w-8 h-8 rounded-full object-cover border border-emerald-200" />
                          <div>
                            <div className="text-sm font-semibold text-slate-800 group-hover:text-emerald-900">{s.nama}</div>
                            <div className="text-xs text-slate-500 font-mono">NIS: {s.nis} • {s.kelas} • Hafalan: {s.hafalanJuz} Juz</div>
                          </div>
                        </div>
                        <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          Buka Profil <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Category 2: Nilai Siswa */}
              {matchedNilai.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800 uppercase tracking-wider mb-2">
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Nilai Siswa ({matchedNilai.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {matchedNilai.map(n => (
                      <div
                        key={n.santriId}
                        onClick={() => handleItemClick('nilai', n)}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-teal-50/70 border border-slate-100 hover:border-teal-200 cursor-pointer transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center font-mono">
                            {n.nilaiAkhir}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-800 group-hover:text-teal-900">Nilai Santri: {n.nama}</div>
                            <div className="text-xs text-slate-500">Nilai Akhir: {n.nilaiAkhir} ({n.predikat}) • Status: {n.status}</div>
                          </div>
                        </div>
                        <span className="text-xs font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          Detail Nilai <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Category 3: Raport Siswa */}
              {matchedRaport.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Raport Digital ({matchedRaport.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {matchedRaport.map(s => (
                      <div
                        key={'rap-' + s.id}
                        onClick={() => handleItemClick('raport', s)}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-amber-50/70 border border-slate-100 hover:border-amber-200 cursor-pointer transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                            <GraduationCap className="w-4 h-4 text-amber-700" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-800 group-hover:text-amber-900">Raport Semester: {s.nama}</div>
                            <div className="text-xs text-slate-500">{s.kelas} • Predikat Akhlak: {s.akhlakPredikat}</div>
                          </div>
                        </div>
                        <span className="text-xs font-medium text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          Buka Raport <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Category 4: Jadwal Pelajaran */}
              {matchedJadwal.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Jadwal Pelajaran ({matchedJadwal.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {matchedJadwal.map(j => (
                      <div
                        key={j.id}
                        onClick={() => handleItemClick('jadwal', j)}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-blue-50/70 border border-slate-100 hover:border-blue-200 cursor-pointer transition-all group"
                      >
                        <div>
                          <div className="text-sm font-semibold text-slate-800 group-hover:text-blue-900">{j.mataPelajaran}</div>
                          <div className="text-xs text-slate-500">{j.hari}, {j.jam} • {j.guru} • {j.ruangan}</div>
                        </div>
                        <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                          {j.kelas}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Category 5: Materi Pembelajaran */}
              {matchedMateri.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-violet-800 uppercase tracking-wider mb-2">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Materi & Modul ({matchedMateri.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {matchedMateri.map(m => (
                      <div
                        key={m.id}
                        onClick={() => handleItemClick('materi', m)}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-violet-50/70 border border-slate-100 hover:border-violet-200 cursor-pointer transition-all group"
                      >
                        <div>
                          <div className="text-sm font-semibold text-slate-800 group-hover:text-violet-900">{m.judul}</div>
                          <div className="text-xs text-slate-500">{m.mataPelajaran} • {m.guru} • {m.ukuran}</div>
                        </div>
                        <span className="text-xs font-medium text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full">
                          {m.tipe}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Category 6: Dokumen Pesantren */}
              {matchedDokumen.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Dokumen Pesantren ({matchedDokumen.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {matchedDokumen.map(d => (
                      <div
                        key={d.id}
                        onClick={() => handleItemClick('dokumen', d)}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 border border-slate-100 cursor-pointer transition-all group"
                      >
                        <div>
                          <div className="text-sm font-semibold text-slate-800 group-hover:text-emerald-900">{d.judul}</div>
                          <div className="text-xs text-slate-500">{d.kategori} • No: {d.nomorSurat}</div>
                        </div>
                        <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                          {d.ukuran}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer Quick Shortcut Note */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Ketik &ldquo;Ahmad&rdquo; untuk melihat multi-kategori instan</span>
          <span className="hidden sm:inline font-mono">Gunakan ↑ ↓ untuk navigasi, ESC untuk keluar</span>
        </div>
      </div>
    </div>
  );
};
