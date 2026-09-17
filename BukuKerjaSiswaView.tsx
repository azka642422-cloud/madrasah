import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCheck,
  Printer,
  Shield,
  Clock,
  Sparkles,
  Download
} from 'lucide-react';
import { TATA_TERTIB_DATA } from '../data/madinData';

export const BukuKerjaSiswaView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('semua');

  // Filter only Santri rules from CSV
  const santriRules = TATA_TERTIB_DATA.filter((r) => r.subjek === 'Santri');

  const akanMasuk = santriRules.filter(
    (r) => r.kategori === 'Kewajiban' && r.pasalBagian === 'Akan Masuk Kelas'
  );
  const diDalam = santriRules.filter(
    (r) => r.kategori === 'Kewajiban' && r.pasalBagian === 'Di Dalam Kelas'
  );
  const diLuar = santriRules.filter(
    (r) => r.kategori === 'Kewajiban' && r.pasalBagian === 'Di Luar Kelas'
  );
  const larangan = santriRules.filter((r) => r.kategori === 'Larangan');
  const sanksi = santriRules.filter((r) => r.kategori === 'Sanksi');
  const aturanTambahan = santriRules.filter((r) => r.kategori === 'Aturan Tambahan');

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-700" />
            <span>Buku Santri: Peraturan & Tata Tertib</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Madrasah Diniyah Takmiliyah Annajiyah 2 Bahrul Ulum Tambakberas Jombang
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Buku Santri</span>
        </button>
      </div>

      {/* Nav Tabs */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex items-center gap-2 overflow-x-auto">
        {[
          { id: 'semua', label: 'Semua Ketentuan' },
          { id: 'masuk', label: 'Akan Masuk Kelas' },
          { id: 'dalam', label: 'Di Dalam Kelas' },
          { id: 'luar', label: 'Di Luar Kelas' },
          { id: 'larangan', label: 'Larangan (8 Poin)' },
          { id: 'sanksi', label: 'Sanksi (4 Tingkat)' },
          { id: 'tambahan', label: 'Aturan Tambahan' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              activeSection === tab.id
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. Ketentuan Akan Masuk Kelas */}
      {(activeSection === 'semua' || activeSection === 'masuk') && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                Kewajiban Santri: Ketentuan Akan Masuk Kelas
              </h3>
              <p className="text-[11px] text-slate-500">
                Kedisiplinan awal sebelum KBM Madrasah Diniyah dimulai
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {akanMasuk.map((item) => (
              <div
                key={item.nomor}
                className="p-3.5 bg-emerald-50/40 rounded-2xl border border-emerald-100 flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0 font-mono mt-0.5">
                  {item.nomor}
                </div>
                <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                  {item.ketentuan}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Ketentuan Di Dalam Kelas */}
      {(activeSection === 'semua' || activeSection === 'dalam') && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                Kewajiban Santri: Ketentuan Di Dalam Kelas
              </h3>
              <p className="text-[11px] text-slate-500">
                Adab thalabul ilmi, kebersihan kelas, dan ketertiban KBM
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {diDalam.map((item) => (
              <div
                key={item.nomor}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-800 text-amber-300 flex items-center justify-center text-xs font-bold shrink-0 font-mono mt-0.5">
                  {item.nomor}
                </div>
                <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                  {item.ketentuan}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Ketentuan Di Luar Kelas */}
      {(activeSection === 'semua' || activeSection === 'luar') && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold">
              3
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                Kewajiban Santri: Ketentuan Di Luar Kelas
              </h3>
              <p className="text-[11px] text-slate-500">
                Menjaga marwah pesantren, sholat berjamaah di musholla, dan tata krama
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {diLuar.map((item) => (
              <div
                key={item.nomor}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-800 text-amber-300 flex items-center justify-center text-xs font-bold shrink-0 font-mono mt-0.5">
                  {item.nomor}
                </div>
                <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                  {item.ketentuan}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Larangan Santri (8 Butir) */}
      {(activeSection === 'semua' || activeSection === 'larangan') && (
        <div className="bg-rose-50/50 rounded-3xl border border-rose-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-rose-200 pb-3">
            <div className="w-8 h-8 rounded-xl bg-rose-200 text-rose-900 flex items-center justify-center font-bold">
              <XCircle className="w-5 h-5 text-rose-800" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-rose-950">
                Larangan Bagi Santri (8 Butir Larangan)
              </h3>
              <p className="text-[11px] text-rose-800">
                Perilaku yang dilarang keras selama masa pendidikan diniyah
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {larangan.map((item) => (
              <div
                key={item.nomor}
                className="p-3.5 bg-white rounded-2xl border border-rose-200 flex items-start gap-3 shadow-2xs"
              >
                <div className="w-6 h-6 rounded-full bg-rose-800 text-white flex items-center justify-center text-xs font-bold shrink-0 font-mono mt-0.5">
                  {item.nomor}
                </div>
                <p className="text-xs font-bold text-slate-800 leading-relaxed">
                  {item.ketentuan}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Sanksi & Aturan Tambahan */}
      {(activeSection === 'semua' || activeSection === 'sanksi' || activeSection === 'tambahan') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sanksi */}
          <div className="bg-amber-50/60 rounded-3xl border border-amber-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3 border-b border-amber-200 pb-3">
              <AlertTriangle className="w-6 h-6 text-amber-800" />
              <div>
                <h3 className="font-extrabold text-sm text-amber-950">
                  Tingkatan Sanksi
                </h3>
                <p className="text-[11px] text-amber-800">
                  Penegakan disiplin secara berjenjang
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {sanksi.map((item) => (
                <div
                  key={item.nomor}
                  className="p-3 bg-white rounded-xl border border-amber-200 flex items-center gap-3 shadow-2xs"
                >
                  <span className="w-6 h-6 rounded-full bg-amber-800 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">
                    {item.nomor}
                  </span>
                  <span className="text-xs font-bold text-slate-900">{item.ketentuan}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Aturan Tambahan */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <Shield className="w-6 h-6 text-emerald-800" />
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  Aturan Tambahan
                </h3>
                <p className="text-[11px] text-slate-500">
                  Ketentuan kenaikan kelas dan kebijakan madrasah
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {aturanTambahan.map((item) => (
                <div
                  key={item.nomor}
                  className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                    {item.ketentuan}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
