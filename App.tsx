import React, { useEffect, useState } from 'react';
import { UserRole, SesiAbsensi, UserProfile, AppUserAccount, NotifikasiItem } from './types';
import { NavPage, Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { MobileNav } from './MobileNav';
import { GlobalSearchModal } from './GlobalSearchModal';
import { LoginView } from './LoginView';
import { DashboardGuru } from './DashboardGuru';
import { DashboardSiswa } from './DashboardSiswa';
import { DashboardAdmin } from './DashboardAdmin';
import { AbsensiView } from './AbsensiView';
import { NilaiView } from './NilaiView';
import { JadwalView } from './JadwalView';
import { SilabusView } from './SilabusView';
import { MateriView } from './MateriView';
import { BukuKerjaGuruView } from './BukuKerjaGuruView';
import { BukuKerjaSiswaView } from './BukuKerjaSiswaView';
import { PesantrenInfoView } from './PesantrenInfoView';
import { SoalUjianView } from './SoalUjianView';
import { RaportView } from './RaportView';
import { IjazahView } from './IjazahView';
import { SiswaDatabaseView } from './SiswaDatabaseViewProduction';
import { MuhafadzohView } from './MuhafadzohView';
import { NotifikasiView } from './NotifikasiView';
import { PengumumanView } from './PengumumanView';
import { PengaturanView } from './PengaturanView';
import { HariLiburView } from './HariLiburView';
import { KritikSaranView } from './KritikSaranView';
import { PeraturanGuruView } from './PeraturanGuruView';
import { storageService } from './storageServiceProduction';

const normalizeRole = (role: UserRole): 'Admin' | 'Guru' | 'Siswa' => {
  const value = String(role).toLowerCase();
  if (value === 'admin') return 'Admin';
  if (value === 'siswa') return 'Siswa';
  return 'Guru';
};
const accountToProfile = (account: AppUserAccount): UserProfile => ({ id:account.id,name:account.name,role:normalizeRole(account.role),roleTitle:account.roleTitle,nipOrNis:account.nipOrNis,avatar:'',email:account.email||'',kelas:account.kelas,unreadNotifications:0 });
const getSessionAccount = (): AppUserAccount | null => { try { const raw=sessionStorage.getItem('annajiyah_active_account'); return raw?JSON.parse(raw) as AppUserAccount:null; } catch { return null; } };

export default function App() {
  const [activeAccount,setActiveAccount]=useState<AppUserAccount|null>(()=>getSessionAccount());
  const [userRole,setUserRole]=useState<UserRole>(()=>activeAccount?normalizeRole(activeAccount.role):'Guru');
  const [currentPage,setCurrentPage]=useState<NavPage>('dashboard');
  const [notifications,setNotifications]=useState<NotifikasiItem[]>([]);
  const [isSearchModalOpen,setIsSearchModalOpen]=useState(false);
  const [isSidebarOpen,setIsSidebarOpen]=useState(false);
  const [absensiSession,setAbsensiSession]=useState<SesiAbsensi>(()=>storageService.getAbsensiSession());
  const handleSaveAbsensiSession=(updatedSession:SesiAbsensi)=>{setAbsensiSession(updatedSession);storageService.saveAbsensiSession(updatedSession)};

  useEffect(()=>{const handleKeyDown=(e:KeyboardEvent)=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();setIsSearchModalOpen(prev=>!prev)}};window.addEventListener('keydown',handleKeyDown);return()=>window.removeEventListener('keydown',handleKeyDown)},[]);

  const normalizedRole=normalizeRole(userRole);
  const currentUser=activeAccount?accountToProfile(activeAccount):null;
  const roleNotifications=notifications.filter(n=>normalizedRole!=='Siswa'||!(n.judul.toLowerCase().includes('absensi')||n.pesan.toLowerCase().includes('absensi')||n.tautan==='absensi'));
  const unreadCount=roleNotifications.filter(n=>!n.dibaca).length;
  const handleMarkNotificationRead=(id:string)=>setNotifications(prev=>prev.map(n=>n.id===id?{...n,dibaca:true}:n));
  const handleLogin=(role:UserRole)=>{const account=getSessionAccount();if(!account)return;setActiveAccount(account);setUserRole(normalizeRole(role));setCurrentPage('dashboard')};
  const handleLogout=()=>{try{sessionStorage.removeItem('annajiyah_active_account')}catch{}setActiveAccount(null);setCurrentPage('dashboard')};
  if(!activeAccount||!currentUser)return <LoginView onLogin={handleLogin}/>;

  const renderCurrentView=()=>{switch(currentPage){
    case 'dashboard': if(normalizedRole==='Admin')return <DashboardAdmin user={currentUser} onNavigate={setCurrentPage} onSwitchRole={()=>{}} absensiSession={absensiSession}/>; if(normalizedRole==='Siswa')return <DashboardSiswa user={currentUser} onNavigate={setCurrentPage}/>; return <DashboardGuru user={currentUser} onNavigate={setCurrentPage} absensiSession={absensiSession}/>;
    case 'absensi': return <AbsensiView session={absensiSession} onSaveSession={handleSaveAbsensiSession} userRole={normalizedRole} currentUser={currentUser}/>;
    case 'nilai': return <NilaiView userRole={normalizedRole} currentUser={currentUser}/>;
    case 'jadwal': return <JadwalView userRole={normalizedRole}/>;
    case 'silabus': return <SilabusView userRole={normalizedRole}/>;
    case 'materi': return <MateriView/>;
    case 'buku_guru': case 'guru_kerja': return <BukuKerjaGuruView userRole={normalizedRole}/>;
    case 'buku_siswa': return <BukuKerjaSiswaView userRole={normalizedRole}/>;
    case 'pesantren_info': return <PesantrenInfoView/>;
    case 'soal': return <SoalUjianView userRole={normalizedRole} currentUser={currentUser}/>;
    case 'raport': return <RaportView userRole={normalizedRole} currentUser={currentUser}/>;
    case 'ijazah': return <IjazahView userRole={normalizedRole} currentUser={currentUser}/>;
    case 'hari_libur': return <HariLiburView userRole={normalizedRole}/>;
    case 'kritik_saran': return <KritikSaranView userRole={normalizedRole} currentUser={currentUser}/>;
    case 'peraturan_guru': return <PeraturanGuruView userRole={normalizedRole} currentUser={currentUser}/>;
    case 'siswa': return <SiswaDatabaseView userRole={normalizedRole}/>;
    case 'muhafadzoh': return <MuhafadzohView userRole={normalizedRole} currentUser={currentUser}/>;
    case 'pengumuman': return <PengumumanView userRole={normalizedRole}/>;
    case 'pengaturan': return <PengaturanView currentRole={normalizedRole} currentUser={currentUser} onSwitchRole={()=>{}}/>;
    case 'notifikasi': return <NotifikasiView notifications={notifications} onMarkRead={handleMarkNotificationRead} onNavigate={setCurrentPage}/>;
    default: return normalizedRole==='Admin'?<DashboardAdmin user={currentUser} onNavigate={setCurrentPage} onSwitchRole={()=>{}} absensiSession={absensiSession}/>:normalizedRole==='Siswa'?<DashboardSiswa user={currentUser} onNavigate={setCurrentPage}/>:<DashboardGuru user={currentUser} onNavigate={setCurrentPage} absensiSession={absensiSession}/>;
  }};

  return <div className="min-h-screen bg-[#f8faf8] flex flex-col antialiased"><div className="flex-1 flex overflow-hidden"><Sidebar currentPage={currentPage} onNavigate={setCurrentPage} userRole={normalizedRole} currentUser={currentUser} isOpen={isSidebarOpen} onClose={()=>setIsSidebarOpen(false)} onLogout={handleLogout} unreadNotificationsCount={unreadCount}/><div className="flex-1 flex flex-col min-w-0 overflow-y-auto"><Navbar user={currentUser} userRole={normalizedRole} onNavigate={setCurrentPage} onOpenSearch={()=>setIsSearchModalOpen(true)} onToggleSidebar={()=>setIsSidebarOpen(prev=>!prev)} onSwitchRole={()=>{}} notifications={roleNotifications} onMarkNotificationRead={handleMarkNotificationRead} onSelectNotification={notif=>setCurrentPage((notif.tautan||'notifikasi') as NavPage)} unreadNotificationsCount={unreadCount} onLogout={handleLogout}/><main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto">{renderCurrentView()}</main></div></div><MobileNav currentPage={currentPage} onNavigate={setCurrentPage} unreadCount={unreadCount} userRole={normalizedRole}/><GlobalSearchModal isOpen={isSearchModalOpen} onClose={()=>setIsSearchModalOpen(false)} onNavigate={page=>{setCurrentPage(page);setIsSearchModalOpen(false)}}/></div>;
}
