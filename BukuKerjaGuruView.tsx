import React, { useState } from 'react';
import {
  BookMarked,
  Eye,
  Download,
  Printer,
  FileCheck,
  CheckCircle2,
  Calendar,
  FileText,
  Clock,
  ShieldCheck,
  Layers
} from 'lucide-react';
import { BUKU_KERJA_GURU_ITEMS } from '../data/mockData';
import { PdfPreviewModal } from '../components/PdfPreviewModal';

import { UserProfile } from '../types';

interface BukuKerjaGuruProps {
  currentUser?: UserProfile;
  userRole?: string;
}

export const BukuKerjaGuruView: React.FC<BukuKerjaGuruProps> = ({
  currentUser,
  userRole = 'Guru',
}) => {
  const isSiswa = userRole.toLowerCase() === 'siswa';

  const [selectedItemForPdf, setSelectedItemForPdf] = useState<{
    no: number;
    title: string;
    desc: string;
    kode: string;
    status: string;
  } | null>(null);

  if (isSiswa) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-rose-200 shadow-sm max-w-lg mx-auto my-12">
        <h2 className="text-xl font-black text-slate-900 mb-2">Akses Khusus Asatidz / Guru</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Dokumen Buku Kerja Guru hanya diperuntukkan bagi asatidz dan pendidik madrasah.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BookMarked className="w-6 h-6 text-emerald-700" />
            <span>Buku Kerja Guru (Asatidz)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            12 Dokumen kelengkapan administrasi dan akreditasi standar pendidik Madrasah Diniyah Takmiliyah
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Terverifikasi Kurikulum Pesantren 2025/2026</span>
        </div>
      </div>

      {/* Grid of 12 Standar Dokumen Guru */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {BUKU_KERJA_GURU_ITEMS.map((item) => (
          <div
            key={item.no}
            className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-emerald-300 hover:shadow-lg transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-8 h-8 rounded-xl bg-emerald-800 text-white font-bold text-xs flex items-center justify-center font-mono">
                  {item.no < 10 ? `0${item.no}` : item.no}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{item.status}</span>
                </span>
              </div>

              <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-emerald-950 transition-colors leading-snug">
                {item.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {item.desc}
              </p>
              <div className="mt-2 text-[10px] font-mono text-slate-400">
                Kode Arsip: {item.kode}
              </div>
            </div>

            {/* Actions: Dilihat, Didownload PDF, Dicetak */}
            <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-1.5 text-xs">
              <button
                onClick={() => setSelectedItemForPdf(item)}
                className="flex items-center justify-center gap-1 py-1.5 px-2 bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-900 rounded-xl font-semibold transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Lihat</span>
              </button>
              <button
                onClick={() => setSelectedItemForPdf(item)}
                className="flex items-center justify-center gap-1 py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl font-semibold transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
              <button
                onClick={() => setSelectedItemForPdf(item)}
                className="flex items-center justify-center gap-1 py-1.5 px-2 bg-slate-50 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* PDF Modal */}
      {selectedItemForPdf && (
        <PdfPreviewModal
          isOpen={!!selectedItemForPdf}
          onClose={() => setSelectedItemForPdf(null)}
          type="buku_guru"
          title={`Buku Kerja Guru: ${selectedItemForPdf.title}`}
          data={selectedItemForPdf}
        />
      )}

    </div>
  );
};
