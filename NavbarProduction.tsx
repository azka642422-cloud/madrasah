import React, { useState } from 'react';
import { Bell, Check, LogOut, Menu, Search, User } from 'lucide-react';
import { NotifikasiItem, UserProfile, UserRole } from './types';
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
  onLogout,
  notifications = [],
  unreadNotificationsCount,
  unreadCount: propUnreadCount,
  onMarkNotificationRead = () => {},
  onSelectNotification = () => {},
}) => {
  const [showNotif, setShowNotif] = useState(false);
  const unread = unreadNotificationsCount ?? propUnreadCount ?? notifications.filter((n) => !n.dibaca).length;

  return <header className="sticky top-0 z-30 border-b border-emerald-100 bg-white/95 backdrop-blur-md">
    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-3 sm:h-20 sm:px-6">
      <div className="flex shrink-0 items-center gap-3">
        <button onClick={onToggleSidebar} className="rounded-xl p-2 text-slate-600 hover:bg-emerald-50 lg:hidden" aria-label="Buka menu"><Menu className="h-5 w-5"/></button>
        <img src="/logo.png" alt="Logo Madrasah" className="h-10 w-10 object-contain"/>
        <div className="hidden sm:block"><div className="text-sm font-black text-emerald-950">MT. ANNAJIYAH 2</div><div className="text-[10px] text-emerald-700">Bahrul Ulum Tambakberas Jombang</div></div>
      </div>

      <button onClick={onOpenSearch} className="flex min-w-0 flex-1 items-center gap-2 rounded-full border bg-slate-50 px-4 py-2.5 text-left text-xs text-slate-400 sm:max-w-xl"><Search className="h-4 w-4 shrink-0"/><span className="truncate">Cari santri, jadwal, materi, dokumen...</span><span className="ml-auto hidden rounded border bg-white px-2 py-0.5 text-[10px] sm:inline">Ctrl+K</span></button>

      <div className="flex shrink-0 items-center gap-2">
        <div className="relative">
          <button onClick={()=>setShowNotif(!showNotif)} className="relative rounded-full p-2 text-slate-600 hover:bg-emerald-50" aria-label="Notifikasi"><Bell className="h-5 w-5"/>{unread>0&&<span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-bold text-white">{unread}</span>}</button>
          {showNotif && <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-2xl border bg-white shadow-2xl sm:w-96">
            <div className="flex items-center justify-between border-b px-4 py-3"><div className="text-sm font-black">Notifikasi</div>{notifications.length>0&&<button onClick={()=>notifications.forEach((n)=>onMarkNotificationRead(n.id))} className="text-[11px] font-bold text-emerald-800">Tandai dibaca</button>}</div>
            <div className="max-h-80 overflow-y-auto">{notifications.length===0?<div className="p-6 text-center text-xs text-slate-400">Tidak ada notifikasi</div>:notifications.map((n)=><button key={n.id} onClick={()=>{onMarkNotificationRead(n.id);onSelectNotification(n);setShowNotif(false)}} className={`block w-full border-b p-3 text-left hover:bg-slate-50 ${!n.dibaca?'bg-amber-50/50':''}`}><div className="flex items-center justify-between gap-2"><span className="truncate text-xs font-black text-slate-900">{n.judul}</span><span className="shrink-0 text-[10px] text-slate-400">{n.waktu}</span></div><p className="mt-1 line-clamp-2 text-xs text-slate-600">{n.pesan}</p></button>)}</div>
            {onNavigate&&<button onClick={()=>{onNavigate('notifikasi');setShowNotif(false)}} className="w-full px-4 py-3 text-xs font-bold text-emerald-800">Lihat semua notifikasi</button>}
          </div>}
        </div>

        <div className="hidden items-center gap-2 rounded-full border bg-white px-2.5 py-1.5 sm:flex">
          {user?.avatar?<img src={user.avatar} alt={user.name} className="h-7 w-7 rounded-full object-cover"/>:<div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-800"><User className="h-4 w-4"/></div>}
          <div className="max-w-32"><div className="truncate text-[11px] font-black text-slate-900">{user?.name || 'Pengguna'}</div><div className="truncate text-[9px] font-bold uppercase text-emerald-700">{String(userRole)}</div></div>
        </div>

        <button onClick={onLogout} className="rounded-full p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-700" title="Keluar"><LogOut className="h-5 w-5"/></button>
      </div>
    </div>
  </header>;
};
