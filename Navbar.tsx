import React, { useState } from 'react';
import { Search, Bell, Menu, ShieldCheck, ChevronDown, Check, Sparkles, LogOut, BookOpen, Clock, AlertTriangle } from 'lucide-react';
import { UserProfile, UserRole, NotifikasiItem } from '../types';
import { PESANTREN_INFO, MOCK_USERS } from '../data/mockData';
import { NavPage } from './Sidebar';

interface NavbarProps {
  user?: UserProfile;
  userRole?: UserRole;
  onNavigate?: (page: NavPage) => void;
  onOpenSearch: () => void;
  onToggleSidebar?: () => void;
  onSwitchRole?: (role: UserRole) => void;
  onLogout: () => void;
  notifications?: NotifikasiItem[];
  unreadNotificationsCount?: number;
  unreadCount?: number;
  onMarkNotificationRead?: (id: string) => void;
  onSelectNotification?: (notif: NotifikasiItem) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  userRole = 'Guru',
  onNavigate,
  onOpenSearch,
  onToggleSidebar = () => {},
  onSwitchRole = (_role: UserRole) => {},
  onLogout,
  notifications = [],
  unreadNotificationsCount,
  unreadCount: propUnreadCount,
  onMarkNotificationRead = (_id: string) => {},
  onSelectNotification = (_notif: NotifikasiItem) => {},
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  // Fallback user if not passed directly
  const effectiveUser: UserProfile = user || (
    userRole ? (MOCK_USERS[userRole.toLowerCase()] || MOCK_USERS.guru) : MOCK_USERS.guru
  );

  const unreadCount = unreadNotificationsCount ?? propUnreadCount ?? (notifications?.filter(n => !n.dibaca).length ?? 0);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-6">
        
        {/* Left: Mobile Menu Toggle & Brand Identity */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onToggleSidebar}
            id="btn-mobile-sidebar-toggle"
            className="p-2 text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-xl transition-colors lg:hidden"
            aria-label="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="Logo Madrasah Takmiliyah Annajiyah 2"
              className="w-9 h-9 sm:w-11 sm:h-11 object-contain drop-shadow-xs"
            />
            <div className="hidden xs:block">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-base text-emerald-950 tracking-tight leading-tight">
                  MT. ANNAJIYAH 2
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded border border-amber-300/60 hidden md:inline-block">
                  PPBU
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-emerald-800/80 font-medium truncate max-w-[210px] sm:max-w-none">
                PP. Bahrul Ulum Tambakberas Jombang
              </p>
            </div>
          </div>
        </div>

        {/* Center: Prominent DANA-style Search Input */}
        <div className="flex-1 max-w-xl mx-2 sm:mx-4">
          <div
            onClick={onOpenSearch}
            id="btn-open-global-search"
            className="flex items-center gap-2.5 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 rounded-full cursor-pointer transition-all shadow-inner group"
          >
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 group-hover:text-emerald-700 transition-colors shrink-0" />
            <span className="text-xs sm:text-sm text-slate-400 group-hover:text-slate-600 truncate">
              Cari siswa, jadwal, materi, dokumen...
            </span>
            <span className="hidden sm:flex items-center text-[10px] font-semibold bg-white px-2 py-0.5 rounded-md text-slate-400 border border-slate-200 ml-auto shrink-0 shadow-2xs">
              Ctrl+K
            </span>
          </div>
        </div>

        {/* Right: Quick Role Switcher, Notifications, User Avatar */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          
          {/* Permanent Data Persistence Status */}
          <div
            title="Data tersimpan permanen & dapat digunakan selamanya setiap tahun ajaran"
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-900 border border-emerald-200 shadow-2xs"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            <span>Tersimpan Permanen</span>
          </div>

          {/* Quick Role Switcher Badge */}
          <div className="relative">
            <button
              onClick={() => { setShowRoleMenu(!showRoleMenu); setShowNotifMenu(false); }}
              id="btn-switch-role-menu"
              className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 transition-colors"
              title="Ganti Mode Pengguna"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              <span className="capitalize font-bold">{effectiveUser.role}</span>
              <ChevronDown className="w-3.5 h-3.5 text-emerald-700" />
            </button>

            {/* Role Switcher Dropdown */}
            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-emerald-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3.5 py-1.5 border-b border-slate-100">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Simulasi Hak Akses</p>
                  <p className="text-xs text-slate-600 font-medium">Beralih peran pengguna:</p>
                </div>

                <button
                  onClick={() => { onSwitchRole('Guru'); setShowRoleMenu(false); }}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left hover:bg-emerald-50 ${effectiveUser.role?.toLowerCase() === 'guru' ? 'bg-emerald-50/70 font-bold text-emerald-900' : 'text-slate-700'}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <div>
                      <div className="font-semibold">Guru (Ustadz)</div>
                      <div className="text-[10px] text-slate-400">Wali Kelas 5A / Pengampu</div>
                    </div>
                  </div>
                  {effectiveUser.role?.toLowerCase() === 'guru' && <Check className="w-4 h-4 text-emerald-700" />}
                </button>

                <button
                  onClick={() => { onSwitchRole('Siswa'); setShowRoleMenu(false); }}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left hover:bg-emerald-50 ${effectiveUser.role?.toLowerCase() === 'siswa' ? 'bg-emerald-50/70 font-bold text-emerald-900' : 'text-slate-700'}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <div>
                      <div className="font-semibold">Siswa (Santri)</div>
                      <div className="text-[10px] text-slate-400">Ahmad Zaki (Kelas 5A)</div>
                    </div>
                  </div>
                  {effectiveUser.role?.toLowerCase() === 'siswa' && <Check className="w-4 h-4 text-emerald-700" />}
                </button>

                <button
                  onClick={() => { onSwitchRole('Admin'); setShowRoleMenu(false); }}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left hover:bg-emerald-50 ${effectiveUser.role?.toLowerCase() === 'admin' ? 'bg-emerald-50/70 font-bold text-emerald-900' : 'text-slate-700'}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <div>
                      <div className="font-semibold">Administrator</div>
                      <div className="text-[10px] text-slate-400">Kontrol Penuh Sistem</div>
                    </div>
                  </div>
                  {effectiveUser.role?.toLowerCase() === 'admin' && <Check className="w-4 h-4 text-emerald-700" />}
                </button>
              </div>
            )}
          </div>

          {/* Notification Button & Flyout */}
          <div className="relative">
            <button
              onClick={() => { setShowNotifMenu(!showNotifMenu); setShowRoleMenu(false); }}
              id="btn-navbar-notifications"
              className="p-2 sm:p-2.5 text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-full transition-colors relative"
              aria-label="Notifikasi"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 min-w-[18px] h-[18px] px-1 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Flyout */}
            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-emerald-100 py-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center justify-between px-4 pb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-slate-900 text-sm">Notifikasi</h4>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-semibold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                        {unreadCount} baru
                      </span>
                    )}
                  </div>
                  <span
                    onClick={() => notifications.forEach(n => onMarkNotificationRead(n.id))}
                    className="text-[11px] text-emerald-800 hover:underline cursor-pointer font-medium"
                  >
                    Tandai semua dibaca
                  </span>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs">
                      Tidak ada notifikasi baru
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          onMarkNotificationRead(n.id);
                          onSelectNotification(n);
                          setShowNotifMenu(false);
                        }}
                        className={`p-3 sm:p-3.5 hover:bg-emerald-50/50 cursor-pointer transition-colors flex gap-3 ${!n.dibaca ? 'bg-amber-50/40' : ''}`}
                      >
                        <div className="shrink-0 mt-0.5">
                          {n.tipe === 'warning' ? (
                            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
                              <AlertTriangle className="w-4 h-4" />
                            </div>
                          ) : n.tipe === 'success' ? (
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                              <Check className="w-4 h-4" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center">
                              <Clock className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-slate-900 truncate">{n.judul}</p>
                            <span className="text-[10px] text-slate-400 shrink-0">{n.waktu}</span>
                          </div>
                          <p className="text-xs text-slate-600 line-clamp-2 mt-0.5 leading-snug">{n.pesan}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="px-4 pt-2.5 border-t border-slate-100 text-center">
                  <span
                    onClick={() => {
                      if (onNavigate) onNavigate('notifikasi');
                      setShowNotifMenu(false);
                    }}
                    className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 cursor-pointer"
                  >
                    Lihat Semua Notifikasi
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar & Name */}
          <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-slate-200">
            <img
              src={effectiveUser.avatar}
              alt={effectiveUser.name}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-emerald-600 shadow-2xs shrink-0"
            />
            <div className="hidden xl:block text-left">
              <p className="text-xs font-bold text-slate-900 leading-tight max-w-[140px] truncate">{effectiveUser.name}</p>
              <p className="text-[10px] text-slate-500 truncate max-w-[140px]">{effectiveUser.roleTitle}</p>
            </div>
            <button
              onClick={onLogout}
              id="btn-navbar-logout"
              title="Keluar / Ganti Akun"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-0.5 hidden sm:block"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </header>
  );
};
