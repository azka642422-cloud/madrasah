import React from 'react';
import {
  Bell,
  Calendar,
  Sparkles,
  Pin,
  Tag,
  ArrowRight,
  Clock,
  UserCheck
} from 'lucide-react';
import { MOCK_PENGUMUMAN } from '../data/mockData';

export const PengumumanView: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-emerald-700" />
            <span>Maklumat & Pengumuman Pesantren</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Agenda resmi majelis pengasuh, kalender ujian, maklumat wali santri, dan tata tertib pesantren
          </p>
        </div>

        <div className="text-xs text-emerald-900 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl font-semibold">
          Kategori Resmi Sekretariat Madrasah
        </div>
      </div>

      {/* Pengumuman Cards */}
      <div className="space-y-4">
        {MOCK_PENGUMUMAN.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  {item.kategori}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Sasaran: <strong className="text-slate-700">{item.sasaran}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                <span>{item.tanggal}</span>
              </div>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {item.judul}
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {item.isi}
            </p>

            <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium text-emerald-900">
                Diterbitkan oleh: Sekretariat Kulliyyatul Mu&apos;allimin Al-Islamiyyah
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
