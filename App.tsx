import React, { useEffect, useState } from 'react';
import { UserRole, SesiAbsensi, UserProfile, AppUserAccount, NotifikasiItem } from './types';
import { NavPage, Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { MobileNav } from './MobileNav';
import { GlobalSearchModal } from './GlobalSearchModal';
import { LoginView } from './LoginView';
import { DashboardGuru } from './DashboardGuruProduction';
import { DashboardSiswa } from './DashboardSiswaProduction';
import { DashboardAdmin } from './DashboardAdminProduction';
import { AbsensiView } from './AbsensiView';
import { NilaiView } from './NilaiView';
import { JadwalView } from './JadwalView';
import { SilabusView } from './SilabusView';
import { MateriView } from './MateriView';
import { BukuKerjaGuruView } from './BukuKerjaGuruView';
import { BukuKerjaSiswaView } from './BukuKerjaSiswaView';
import { PesantrenInfoView } from './PesantrenInfoView';
import { SoalUjianView } from './SoalUjianView';
import { RaportView } from './RaportViewProduction';
import { IjazahView } from './IjazahViewProduction';
import { SiswaDatabaseView } from './SiswaDatabaseViewProduction';
import { MuhafadzohView } from './MuhafadzohView';
import { NotifikasiView } from './NotifikasiView';
import { PengumumanView } from './PengumumanView';
import { PengaturanView } from './PengaturanView';
import { HariLiburView } from './HariLiburView';
import { KritikSaranView } from './KritikSaranView';
import { PeraturanGuruView } from './PeraturanGuruView';
import { storageService } from './storageServiceProduction';

const normalizeRole = (role: UserRole | string): UserRole => {
  const value = String(role).toLowerCase();
  if (value === 'admin') return 'Admin';
  if (value === 'siswa' || value === 'santri') return 'Siswa';
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
    case 'dashboard': if(normalizedRole==='Admin')return <DashboardAdmin user={currentUser} onNavigate={setCurrentPage} absensiSession={absensiSession}/>; if(normalizedRole==='Siswa')return <DashboardSiswa user={currentUser} onNavigate={setCurrentPage}/>; return <DashboardGuru user={currentUser} onNavigate={setCurrentPage} absensiSession={absensiSession}/>;
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
    case 'notifikasi': return <NotifikasiView notifications={roleNotifications} onMarkRead={handleMarkNotificationRead}/>;
    case 'pengaturan': return <PengaturanView userRole={normalizedRole} currentUser={currentUser}/>;
    default: return <DashboardGuru user={currentUser} onNavigate={setCurrentPage} absensiSession={absensiSession}/>;
  }};

  return <div className="min-h-screen bg-slate-50 text-slate-900"><Sidebar currentPage={currentPage} onNavigate={p=>{setCurrentPage(p);setIsSidebarOpen(false)}} userRole={normalizedRole} isOpen={isSidebarOpen} onClose={()=>setIsSidebarOpen(false)}/><div className="lg:pl-64"><Navbar user={currentUser} unreadCount={unreadCount} onLogout={handleLogout} onOpenSearch={()=>setIsSearchModalOpen(true)} onOpenSidebar={()=>setIsSidebarOpen(true)} onNavigate={setCurrentPage}/><main className="mx-auto max-w-[1600px] p-4 pb-24 sm:p-6 lg:p-8 lg:pb-8">{renderCurrentView()}</main><MobileNav currentPage={currentPage} onNavigate={setCurrentPage} userRole={normalizedRole}/></div><GlobalSearchModal isOpen={isSearchModalOpen} onClose={()=>setIsSearchModalOpen(false)} onNavigate={setCurrentPage} userRole={normalizedRole}/></div>;
}
