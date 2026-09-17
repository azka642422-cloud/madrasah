import React from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Check,
  Calendar,
  FileText
} from 'lucide-react';
import { NotifikasiItem } from '../types';
import { MOCK_NOTIFIKASI } from '../data/mockData';
import { NavPage } from '../components/Sidebar';

interface NotifikasiViewProps {
  notifications?: NotifikasiItem[];
  onMarkRead?: (id: string) => void;
  onNavigate?: (page: NavPage) => void;
}

export const NotifikasiView: React.FC<NotifikasiViewProps> = ({
  notifications = MOCK_NOTIFIKASI,
  onMarkRead = (_id: string) => {},
  onNavigate = (_page: NavPage) => {},
}) => {
  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-emerald-700" />
            <span>Pusat Notifikasi & Pengingat Akademik</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pemberitahuan tenggat nilai, pengingat absensi kelas, agenda mengajar, dan dokumen terbaru
          </p>
        </div>

        <button
          onClick={() => {
            notifications.forEach(n => onMarkRead(n.id));
          }}
          className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors"
        >
          Tandai Semua Telah Dibaca
        </button>
      </div>

      {/* List of Notifications */}
      <div className="bg-white rounded-3xl border border-slate-200 divide-y divide-slate-100 shadow-xs overflow-hidden">
        {notifications.map((notif) => {
          let iconBg = 'bg-blue-100 text-blue-800';
          let IconComp = Clock;
          if (notif.tipe === 'warning') {
            iconBg = 'bg-amber-100 text-amber-800';
            IconComp = AlertTriangle;
          } else if (notif.tipe === 'success') {
            iconBg = 'bg-emerald-100 text-emerald-800';
            IconComp = CheckCircle2;
          }

          return (
            <div
              key={notif.id}
              className={`p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
                !notif.dibaca ? 'bg-amber-50/30' : 'hover:bg-slate-50/60'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${iconBg}`}>
                  <IconComp className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">
                      {notif.judul}
                    </h3>
                    {!notif.dibaca && (
                      <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 max-w-2xl leading-relaxed">
                    {notif.pesan}
                  </p>
                  <span className="text-[11px] text-slate-400 font-medium mt-1 inline-block">
                    {notif.waktu}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                {!notif.dibaca && (
                  <button
                    onClick={() => onMarkRead(notif.id)}
                    className="p-2 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors text-xs flex items-center gap-1"
                    title="Tandai dibaca"
                  >
                    <Check className="w-4 h-4" />
                    <span className="hidden md:inline text-[11px]">Tandai Dibaca</span>
                  </button>
                )}
                {Boolean(notif.linkModule || notif.linkNav || notif.tautan) && (
                  <button
                    onClick={() => {
                      onMarkRead(notif.id);
                      const target = (notif.linkModule || notif.linkNav || notif.tautan) as NavPage;
                      onNavigate(target);
                    }}
                    className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <span>Buka Sekarang</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
