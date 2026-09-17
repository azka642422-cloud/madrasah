import React from 'react';
import { FileText, AlertCircle } from 'lucide-react';

export const MateriView: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-black text-slate-900"><FileText className="h-6 w-6 text-emerald-700"/>Materi Pembelajaran & Kitab Digital</h1>
        <p className="mt-1 text-xs text-slate-500">Pustaka materi resmi Madrasah Diniyah Takmiliyah.</p>
      </div>
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 flex gap-2">
        <AlertCircle className="h-4 w-4 shrink-0"/>
        <div><b>Belum ada berkas materi resmi pada sumber yang diberikan.</b> Data contoh lama tidak ditampilkan. Upload berkas lintas perangkat akan diaktifkan setelah penyimpanan server/backend tersedia.</div>
      </div>
      <div className="rounded-3xl border bg-white p-10 text-center text-sm text-slate-500">Belum ada materi resmi yang dipublikasikan.</div>
    </div>
  );
};
