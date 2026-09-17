import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  Lock,
  Users,
  Database,
  Save,
  CheckCircle2,
  Building,
  KeyRound,
  Sparkles,
  Calendar,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  FileJson,
  Check,
  ArrowUpRight,
  Award,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Edit2,
  Sliders,
  Compass,
  CheckSquare,
  Square,
  FileText,
  UserPlus
} from 'lucide-react';
import { PESANTREN_INFO } from '../data/mockData';
import { UserRole, UserProfile, AppUserAccount, NavMenuItemConfig } from '../types';
import { storageService, SignaturesConfig } from '../services/storageService';

interface PengaturanViewProps {
  onSwitchRole: (role: UserRole) => void;
  currentRole: UserRole;
  currentUser?: UserProfile;
}

export const PengaturanView: React.FC<PengaturanViewProps> = ({
  onSwitchRole,
  currentRole,
  currentUser,
}) => {
  const isAdmin = currentRole.toLowerCase() === 'admin';

  // Tabs for Admin
  const [adminTab, setAdminTab] = useState<
    'nav_menus' | 'user_management' | 'admin_password' | 'tanda_tangan' | 'tahun_ajaran' | 'sistem'
  >('nav_menus');

  // Feedback notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // ==========================================
  // 1. STATE FOR GURU & SISWA: CHANGE PASSWORD
  // ==========================================
  const [oldPasswordUser, setOldPasswordUser] = useState('');
  const [newPasswordUser, setNewPasswordUser] = useState('');
  const [confirmPasswordUser, setConfirmPasswordUser] = useState('');
  const [showPasswordUser, setShowPasswordUser] = useState(false);

  const handleUserChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPasswordUser || newPasswordUser.length < 5) {
      showNotification('Kata sandi baru minimal harus 5 karakter.');
      return;
    }
    if (newPasswordUser !== confirmPasswordUser) {
      showNotification('Konfirmasi kata sandi tidak cocok. Harap periksa kembali.');
      return;
    }

    // Update in storageService
    const identifier = currentUser?.nipOrNis?.replace(/[^0-9a-zA-Z]/g, '') || currentUser?.name || '';
    const success = storageService.changeUserPassword(identifier, newPasswordUser) ||
                    storageService.changeUserPassword(currentUser?.id || '', newPasswordUser);

    if (success) {
      showNotification('Kata sandi Anda berhasil diperbarui! Gunakan sandi baru ini pada login berikutnya.');
      setOldPasswordUser('');
      setNewPasswordUser('');
      setConfirmPasswordUser('');
    } else {
      // Create or update account directly
      const accounts = storageService.getUserAccounts();
      const existing = accounts.find(a => a.name.toLowerCase() === (currentUser?.name || '').toLowerCase());
      if (existing) {
        storageService.updateUserAccount(existing.id, { password: newPasswordUser });
        showNotification('Kata sandi Anda berhasil diperbarui!');
      } else {
        showNotification('Kata sandi berhasil disimpan ke profil Anda.');
      }
      setOldPasswordUser('');
      setNewPasswordUser('');
      setConfirmPasswordUser('');
    }
  };

  // ==========================================
  // 2. STATE FOR ADMIN: MENU MANAGEMENT
  // ==========================================
  const [navMenus, setNavMenus] = useState<NavMenuItemConfig[]>(() => storageService.getNavMenus());
  const [editingMenu, setEditingMenu] = useState<NavMenuItemConfig | null>(null);
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);
  const [newMenuTitle, setNewMenuTitle] = useState('');
  const [newMenuPage, setNewMenuPage] = useState('');
  const [newMenuCategory, setNewMenuCategory] = useState<'utama' | 'akademik' | 'dokumen' | 'evaluasi' | 'kustom'>('kustom');
  const [newMenuForAdmin, setNewMenuForAdmin] = useState(true);
  const [newMenuForGuru, setNewMenuForGuru] = useState(true);
  const [newMenuForSiswa, setNewMenuForSiswa] = useState(false);

  const handleToggleMenuRole = (menuId: string, role: 'admin' | 'guru' | 'siswa') => {
    storageService.toggleMenuVisibility(menuId, role);
    setNavMenus(storageService.getNavMenus());
    showNotification('Visibilitas menu navigasi berhasil diperbarui.');
  };

  const handleSaveEditMenu = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMenu) return;
    storageService.updateMenuItem(editingMenu.id, {
      title: editingMenu.title.trim(),
      badge: editingMenu.badge?.trim() || undefined,
    });
    setNavMenus(storageService.getNavMenus());
    setEditingMenu(null);
    showNotification('Judul menu navigasi berhasil diubah!');
  };

  const handleAddCustomMenu = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMenuTitle.trim()) {
      showNotification('Judul menu wajib diisi.');
      return;
    }
    const pageId = newMenuPage.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_') || `page_${Date.now()}`;
    storageService.addCustomMenuItem({
      title: newMenuTitle.trim(),
      page: pageId,
      category: newMenuCategory,
      visibleForAdmin: newMenuForAdmin,
      visibleForGuru: newMenuForGuru,
      visibleForSiswa: newMenuForSiswa,
      iconName: 'Compass',
    });
    setNavMenus(storageService.getNavMenus());
    setShowAddMenuModal(false);
    setNewMenuTitle('');
    setNewMenuPage('');
    showNotification('Menu baru berhasil ditambahkan ke navigasi!');
  };

  const handleDeleteMenu = (id: string, title: string) => {
    if (window.confirm(`Hapus menu "${title}" secara permanen?`)) {
      storageService.deleteMenuItem(id);
      setNavMenus(storageService.getNavMenus());
      showNotification(`Menu "${title}" telah dihapus.`);
    }
  };

  const handleResetMenus = () => {
    if (window.confirm('Kembalikan seluruh menu ke pengaturan awal standar?')) {
      storageService.resetNavMenus();
      setNavMenus(storageService.getNavMenus());
      showNotification('Seluruh menu navigasi berhasil direset ke standar.');
    }
  };

  // ==========================================
  // 3. STATE FOR ADMIN: USER & RBAC MANAGEMENT
  // ==========================================
  const [userAccounts, setUserAccounts] = useState<AppUserAccount[]>(() => storageService.getUserAccounts());
  const [userSearch, setUserSearch] = useState('');
  const [userFilterRole, setUserFilterRole] = useState<'Semua' | 'admin' | 'guru' | 'siswa'>('Semua');
  const [editingAccount, setEditingAccount] = useState<AppUserAccount | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});

  // Add User Form State
  const [addName, setAddName] = useState('');
  const [addUsername, setAddUsername] = useState('');
  const [addPassword, setAddPassword] = useState('');
  const [addRole, setAddRole] = useState<'admin' | 'guru' | 'siswa'>('guru');
  const [addNipNis, setAddNipNis] = useState('');
  const [addKelas, setAddKelas] = useState('');
  const [addRoleTitle, setAddRoleTitle] = useState('');

  const filteredUsers = userAccounts.filter((u) => {
    const matchRole = userFilterRole === 'Semua' || u.role === userFilterRole;
    const matchSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.nipOrNis.toLowerCase().includes(userSearch.toLowerCase());
    return matchRole && matchSearch;
  });

  const toggleRevealPassword = (id: string) => {
    setRevealedPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;
    storageService.updateUserAccount(editingAccount.id, {
      name: editingAccount.name.trim(),
      username: editingAccount.username.trim(),
      password: editingAccount.password.trim(),
      role: editingAccount.role,
      roleTitle: editingAccount.roleTitle.trim(),
      nipOrNis: editingAccount.nipOrNis.trim(),
      kelas: editingAccount.kelas?.trim() || undefined,
      status: editingAccount.status,
      permissions: editingAccount.permissions,
    });
    setUserAccounts(storageService.getUserAccounts());
    setEditingAccount(null);
    showNotification('Data akun pengguna & kredensial berhasil disimpan!');
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim() || !addUsername.trim() || !addPassword.trim()) {
      showNotification('Lengkapi nama, username, dan kata sandi.');
      return;
    }
    const newAcc: AppUserAccount = {
      id: `usr-${Date.now()}`,
      name: addName.trim(),
      username: addUsername.trim(),
      password: addPassword.trim(),
      role: addRole,
      roleTitle: addRoleTitle.trim() || (addRole === 'admin' ? 'Administrator' : addRole === 'guru' ? 'Guru Pengampu' : 'Santri'),
      nipOrNis: addNipNis.trim() || (addRole === 'siswa' ? `NIS. ${addUsername}` : `NIP. ${Date.now()}`),
      kelas: addKelas.trim() || undefined,
      status: 'Aktif',
      permissions: addRole === 'admin' ? ['admin_full'] : addRole === 'guru' ? ['kbm', 'absensi', 'nilai', 'muhafadzoh'] : ['santri_portal'],
    };
    storageService.addUserAccount(newAcc);
    setUserAccounts(storageService.getUserAccounts());
    setShowAddUserModal(false);
    setAddName('');
    setAddUsername('');
    setAddPassword('');
    setAddNipNis('');
    setAddKelas('');
    setAddRoleTitle('');
    showNotification(`Akun ${newAcc.name} (${newAcc.role}) berhasil ditambahkan!`);
  };

  const handleDeleteUser = (id: string, name: string) => {
    if (window.confirm(`Hapus akun pengguna "${name}" secara permanen? Pengguna tidak akan dapat login kembali.`)) {
      storageService.deleteUserAccount(id);
      setUserAccounts(storageService.getUserAccounts());
      showNotification(`Akun "${name}" telah dihapus.`);
    }
  };

  // ==========================================
  // 4. STATE FOR ADMIN: CHANGE ADMIN PASSWORD
  // ==========================================
  const [oldAdminPass, setOldAdminPass] = useState('');
  const [newAdminPass, setNewAdminPass] = useState('');
  const [confirmAdminPass, setConfirmAdminPass] = useState('');
  const [showAdminPass, setShowAdminPass] = useState(false);

  const handleAdminChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminPass || newAdminPass.length < 5) {
      showNotification('Kata sandi baru admin minimal harus 5 karakter.');
      return;
    }
    if (newAdminPass !== confirmAdminPass) {
      showNotification('Konfirmasi kata sandi admin tidak sesuai.');
      return;
    }

    storageService.changeUserPassword('admin.mahfudz', newAdminPass);
    storageService.changeUserPassword('usr-admin', newAdminPass);
    setUserAccounts(storageService.getUserAccounts());
    setOldAdminPass('');
    setNewAdminPass('');
    setConfirmAdminPass('');
    showNotification('Kata sandi Administrator Utama berhasil diubah secara permanen!');
  };

  // ==========================================
  // 5. STATE FOR ADMIN: TANDA TANGAN & CETAK
  // ==========================================
  const [sigConfig, setSigConfig] = useState<SignaturesConfig>(() => storageService.getSignaturesAndMusrif());

  const handleSaveSignatures = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.saveSignaturesAndMusrif(sigConfig);
    showNotification('Parameter cetak Raport & Ijazah berhasil disimpan permanen!');
  };

  // ==========================================
  // 6. STATE FOR ADMIN: TAHUN AJARAN & ROLLOVER
  // ==========================================
  const [tahunAjaran, setTahunAjaran] = useState(() => storageService.getTahunAjaran());
  const [semester, setSemester] = useState<'Ganjil' | 'Genap'>(() => storageService.getSemester());
  const [daftarTahun, setDaftarTahun] = useState<string[]>(() => storageService.getDaftarTahunAjaran());
  const [newTahunInput, setNewTahunInput] = useState('');
  const [showAddTahun, setShowAddTahun] = useState(false);
  const [showRolloverConfirm, setShowRolloverConfirm] = useState(false);
  const [promoteStudents, setPromoteStudents] = useState(true);
  const [resetAttendance, setResetAttendance] = useState(true);

  const handleSaveTahunAjaran = () => {
    storageService.saveTahunAjaran(tahunAjaran);
    storageService.saveSemester(semester);
    showNotification('Tahun ajaran dan semester aktif berhasil diaktifkan.');
  };

  const handleAddTahun = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTahunInput.trim() || !newTahunInput.includes('/')) {
      showNotification('Format tahun harus Tahun/Tahun (Contoh: 2026/2027).');
      return;
    }
    const updated = [...daftarTahun, newTahunInput.trim()];
    storageService.saveDaftarTahunAjaran(updated);
    setDaftarTahun(updated);
    setTahunAjaran(newTahunInput.trim());
    storageService.saveTahunAjaran(newTahunInput.trim());
    setNewTahunInput('');
    setShowAddTahun(false);
    showNotification(`Tahun ajaran baru ${newTahunInput.trim()} berhasil ditambahkan!`);
  };

  const handleExecuteRollover = () => {
    const parts = tahunAjaran.split('/');
    let nextTahun = '2026/2027';
    if (parts.length === 2) {
      const y1 = parseInt(parts[0], 10) + 1;
      const y2 = parseInt(parts[1], 10) + 1;
      nextTahun = `${y1}/${y2}`;
    }
    storageService.advanceAcademicYear(nextTahun, {
      promoteStudents,
      resetAttendance,
    });
    setTahunAjaran(nextTahun);
    setSemester('Ganjil');
    setDaftarTahun(storageService.getDaftarTahunAjaran());
    setShowRolloverConfirm(false);
    showNotification(`Siklus tahun baru ${nextTahun} aktif! Kenaikan kelas santri telah diproses.`);
  };

  // ==========================================
  // 7. STATE FOR ADMIN: SISTEM & DATABASE
  // ==========================================
  const [settings, setSettings] = useState(() => storageService.getAppSettings());
  const [namaPesantren, setNamaPesantren] = useState(settings.namaPesantren);
  const [alamat, setAlamat] = useState(settings.alamat);
  const [nspp, setNspp] = useState(settings.nspp);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSaveProfil = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = { namaPesantren, nspp, alamat };
    setSettings(updated);
    storageService.saveAppSettings(updated);
    showNotification('Identitas lembaga berhasil diperbarui.');
  };

  // =========================================================================
  // VIEW FOR GURU & SISWA: FOCUSED PASSWORD CHANGE ONLY (USER REQUIREMENT)
  // =========================================================================
  if (!isAdmin) {
    const isGuru = currentRole.toLowerCase() === 'guru';
    return (
      <div className="max-w-2xl mx-auto space-y-6 pb-12">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-3 border border-slate-700 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-xs space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900">
              {isGuru ? 'Akun Dewan Guru' : 'Akun Portal Santri'}
            </span>
            <span className="text-xs font-semibold text-emerald-800">Keamanan & Kredensial</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <KeyRound className="w-6 h-6 text-emerald-700" />
            <span>Pengaturan Akun & Ubah Kata Sandi</span>
          </h1>
          <p className="text-xs text-slate-500">
            Perbarui kata sandi Anda secara berkala untuk menjaga kerahasiaan data nilai, absensi, dan profil madrasah.
          </p>
        </div>

        {/* User Identity Card */}
        <div className="bg-gradient-to-br from-emerald-950 to-slate-900 text-white rounded-3xl p-6 shadow-md border border-emerald-800/40 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-emerald-600/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-800/80 border border-emerald-600/50 flex items-center justify-center text-white font-bold text-lg shadow-inner">
              {currentUser?.name?.slice(0, 2).toUpperCase() || (isGuru ? 'GR' : 'ST')}
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-extrabold text-white">{currentUser?.name || 'Pengguna Terdaftar'}</h2>
              <p className="text-xs text-emerald-300 font-medium">{currentUser?.roleTitle || (isGuru ? 'Guru Pengampu' : 'Santri')}</p>
              <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-300 font-mono">
                <span>{currentUser?.nipOrNis || 'ID: Terdaftar'}</span>
                {currentUser?.kelas && (
                  <>
                    <span>•</span>
                    <span className="text-amber-300 font-bold">{currentUser.kelas}</span>
                  </>
                )}
                <span>•</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Aktif
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-700" />
              <span>Formulir Ganti Password Baru</span>
            </h3>
            <button
              type="button"
              onClick={() => setShowPasswordUser(!showPasswordUser)}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
            >
              {showPasswordUser ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showPasswordUser ? 'Sembunyikan' : 'Tampilkan Sandi'}</span>
            </button>
          </div>

          <form onSubmit={handleUserChangePassword} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Kata Sandi Saat Ini (Lama)
              </label>
              <input
                type={showPasswordUser ? 'text' : 'password'}
                value={oldPasswordUser}
                onChange={(e) => setOldPasswordUser(e.target.value)}
                placeholder="Masukkan kata sandi lama Anda"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Kata Sandi Baru <span className="text-rose-500">*</span>
              </label>
              <input
                type={showPasswordUser ? 'text' : 'password'}
                required
                value={newPasswordUser}
                onChange={(e) => setNewPasswordUser(e.target.value)}
                placeholder="Minimal 5 karakter"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Ulangi Kata Sandi Baru <span className="text-rose-500">*</span>
              </label>
              <input
                type={showPasswordUser ? 'text' : 'password'}
                required
                value={confirmPasswordUser}
                onChange={(e) => setConfirmPasswordUser(e.target.value)}
                placeholder="Ketik ulang kata sandi baru untuk verifikasi"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                id="btn-simpan-password-user"
                className="w-full py-3 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
              >
                <Save className="w-4 h-4" />
                <span>Simpan & Perbarui Kata Sandi Saya</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW FOR ADMIN: SUPERADMIN & WEB ARCHITECT STUDIO (FULL CONTROL)
  // =========================================================================
  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Web Architect Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white rounded-3xl p-6 sm:p-8 border border-emerald-800/50 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-emerald-950 shadow-xs flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-950" />
                Web Architect & Superadmin Mode
              </span>
              <span className="text-xs font-bold text-emerald-300">
                Pusat Kendali Aplikasi Penuh
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <Sliders className="w-7 h-7 text-amber-400" />
              <span>Pusat Kendali & Pengaturan Web Madrasah</span>
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Sebagai Administrator Utama (Web Builder), Anda memiliki kuasa penuh untuk mengubah, menambah, atau menghilangkan menu navigasi, mengatur username/password semua siswa & guru, mengubah parameter cetak ijazah & raport, serta mengelola siklus madrasah.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setAdminTab('admin_password')}
              id="btn-quick-ganti-password-admin"
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black rounded-xl text-xs shadow-md transition-all cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>Ganti Password Admin</span>
            </button>
            <button
              onClick={() => storageService.downloadBackupFile()}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/20 transition-colors"
            >
              <Download className="w-4 h-4 text-emerald-300" />
              <span>Cadangkan Database</span>
            </button>
          </div>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-xs flex flex-wrap gap-1.5 text-xs">
        <button
          onClick={() => setAdminTab('nav_menus')}
          id="tab-admin-nav-menus"
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all ${
            adminTab === 'nav_menus'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-900'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>1. Manajemen Menu & Navigasi</span>
        </button>

        <button
          onClick={() => setAdminTab('user_management')}
          id="tab-admin-user-management"
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all ${
            adminTab === 'user_management'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>2. Akun & Hak Akses Pengguna</span>
        </button>

        <button
          onClick={() => setAdminTab('admin_password')}
          id="tab-admin-password"
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all ${
            adminTab === 'admin_password'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-900'
          }`}
        >
          <KeyRound className="w-4 h-4 text-amber-500" />
          <span>3. Ubah Password Admin</span>
        </button>

        <button
          onClick={() => setAdminTab('tanda_tangan')}
          id="tab-admin-signatures"
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all ${
            adminTab === 'tanda_tangan'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-900'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>4. Format Cetak Raport & Ijazah</span>
        </button>

        <button
          onClick={() => setAdminTab('tahun_ajaran')}
          id="tab-admin-tahun-ajaran"
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all ${
            adminTab === 'tahun_ajaran'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>5. Siklus & Tahun Ajaran</span>
        </button>

        <button
          onClick={() => setAdminTab('sistem')}
          id="tab-admin-sistem"
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all ${
            adminTab === 'sistem'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-900'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>6. Profil Lembaga & Master DB</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MANAJEMEN MENU & NAVIGASI (UBAH, TAMBAH, HILANGKAN MENU)          */}
      {/* ========================================================================= */}
      {adminTab === 'nav_menus' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Compass className="w-5 h-5 text-emerald-700" />
                <span>Pengaturan Menu & Navigasi Aplikasi (Admin Web Builder)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Centang/hapus centang untuk menampilkan atau menghilangkan menu dari masing-masing peran. Klik edit untuk mengubah nama menu.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddMenuModal(true)}
                id="btn-tambah-menu-kustom"
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Menu Baru</span>
              </button>
              <button
                onClick={handleResetMenus}
                className="flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Standar</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <th className="p-3 w-12 text-center">No</th>
                  <th className="p-3">Judul Menu Navigasi</th>
                  <th className="p-3">Kategori & ID Halaman</th>
                  <th className="p-3 text-center">Tampil di Admin</th>
                  <th className="p-3 text-center">Tampil di Guru</th>
                  <th className="p-3 text-center">Tampil di Siswa</th>
                  <th className="p-3 text-right">Aksi Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {navMenus.map((menu, idx) => (
                  <tr key={menu.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 text-center font-mono text-slate-400">{idx + 1}</td>
                    <td className="p-3">
                      <div className="font-extrabold text-slate-900 flex items-center gap-2">
                        <span>{menu.title}</span>
                        {menu.badge && (
                          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-900 rounded text-[9px] font-black">
                            {menu.badge}
                          </span>
                        )}
                        {menu.isCustom && (
                          <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[9px] font-bold">
                            Kustom
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-mono text-[10px] mr-1">
                        {menu.page}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">({menu.category})</span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleToggleMenuRole(menu.id, 'admin')}
                        className={`p-1.5 rounded-lg border transition-all ${
                          menu.visibleForAdmin
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                            : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`}
                        title="Klik untuk tampilkan/sembunyikan di Admin"
                      >
                        {menu.visibleForAdmin ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleToggleMenuRole(menu.id, 'guru')}
                        className={`p-1.5 rounded-lg border transition-all ${
                          menu.visibleForGuru
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                            : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`}
                        title="Klik untuk tampilkan/sembunyikan di Guru"
                      >
                        {menu.visibleForGuru ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleToggleMenuRole(menu.id, 'siswa')}
                        className={`p-1.5 rounded-lg border transition-all ${
                          menu.visibleForSiswa
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                            : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`}
                        title="Klik untuk tampilkan/sembunyikan di Siswa"
                      >
                        {menu.visibleForSiswa ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditingMenu(menu)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 rounded-lg font-bold transition-colors flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Ubah</span>
                        </button>
                        {menu.isCustom && (
                          <button
                            onClick={() => handleDeleteMenu(menu.id, menu.title)}
                            className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Hapus Menu"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MANAJEMEN AKUN & HAK AKSES (SEMUA GURU, SANTRI, ADMIN)             */}
      {/* ========================================================================= */}
      {adminTab === 'user_management' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-700" />
                <span>Manajemen Akun & Hak Akses Pengguna (Guru, Santri, & Admin)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Admin dapat mengatur username, password, kelas, hak akses, dan status aktif untuk setiap akun yang login.
              </p>
            </div>

            <button
              onClick={() => setShowAddUserModal(true)}
              id="btn-tambah-user-baru"
              className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah Akun Baru</span>
            </button>
          </div>

          {/* Filter and Search */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Cari berdasarkan nama, username, atau NIS/NIP..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              {(['Semua', 'admin', 'guru', 'siswa'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setUserFilterRole(r)}
                  className={`flex-1 py-1.5 rounded-lg capitalize transition-all ${
                    userFilterRole === r ? 'bg-white text-emerald-950 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <th className="p-3">Nama Lengkap & NIP/NIS</th>
                  <th className="p-3">Username Login</th>
                  <th className="p-3">Kata Sandi</th>
                  <th className="p-3">Peran & Kelas</th>
                  <th className="p-3">Hak Akses</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const isRevealed = revealedPasswords[u.id];
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3">
                        <div className="font-extrabold text-slate-900">{u.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{u.nipOrNis}</div>
                      </td>
                      <td className="p-3 font-mono font-bold text-emerald-950">{u.username}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                            {isRevealed ? u.password : '••••••••'}
                          </span>
                          <button
                            onClick={() => toggleRevealPassword(u.id)}
                            className="text-slate-400 hover:text-slate-700"
                            title="Tampilkan / Sembunyikan Sandi"
                          >
                            {isRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                        </div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            u.role === 'admin'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : u.role === 'guru'
                              ? 'bg-blue-100 text-blue-900'
                              : 'bg-emerald-100 text-emerald-900'
                          }`}
                        >
                          {u.role}
                        </span>
                        {u.kelas && <span className="ml-1 text-[10px] font-bold text-slate-600">({u.kelas})</span>}
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {(u.permissions || ['standard']).map((perm) => (
                            <span key={perm} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-mono">
                              {perm}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            u.status === 'Aktif' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setEditingAccount(u)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 rounded-lg font-bold transition-colors flex items-center gap-1"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          {u.role !== 'admin' && (
                            <button
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Hapus Akun"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: UBAH PASSWORD ADMIN KHUSUS                                         */}
      {/* ========================================================================= */}
      {adminTab === 'admin_password' && (
        <div className="max-w-xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-400 text-emerald-950">
                Superadmin Security
              </span>
            </div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-amber-500" />
              <span>Ganti Kata Sandi Administrator Utama</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ubah kata sandi untuk akun administrator (Ust. Ach. Aldyansyah / admin.mahfudz).
            </p>
          </div>

          <form onSubmit={handleAdminChangePassword} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Username Admin</label>
              <input
                type="text"
                disabled
                value="admin.mahfudz"
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl font-mono text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Kata Sandi Baru Admin <span className="text-rose-500">*</span></label>
              <input
                type={showAdminPass ? 'text' : 'password'}
                required
                value={newAdminPass}
                onChange={(e) => setNewAdminPass(e.target.value)}
                placeholder="Masukkan kata sandi baru (minimal 5 karakter)"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Konfirmasi Kata Sandi Baru <span className="text-rose-500">*</span></label>
              <input
                type={showAdminPass ? 'text' : 'password'}
                required
                value={confirmAdminPass}
                onChange={(e) => setConfirmAdminPass(e.target.value)}
                placeholder="Ketik ulang kata sandi baru"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="toggle-show-admin-pass"
                checked={showAdminPass}
                onChange={(e) => setShowAdminPass(e.target.checked)}
                className="rounded border-slate-300 text-emerald-700 focus:ring-emerald-600"
              />
              <label htmlFor="toggle-show-admin-pass" className="font-semibold text-slate-700 cursor-pointer">
                Tampilkan teks kata sandi
              </label>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                id="btn-submit-ganti-password-admin"
                className="w-full py-3 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Password Baru Admin</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: FORMAT CETAK & PARAMETER RAPORT & IJAZAH (TANGGAL, PENGASUH, DLL)   */}
      {/* ========================================================================= */}
      {adminTab === 'tanda_tangan' && (
        <form onSubmit={handleSaveSignatures} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-700" />
              <span>Pengaturan Tanggal Cetak, Nama Pengasuh, & Musrif Dokumen</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Admin dapat mengubah seluruh tanggal cetak (Masehi & Hijriah), nama Pengasuh, Kepala Madrasah, nomor ijazah, dan wali kelas secara langsung.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Raport Parameters */}
            <div className="space-y-4 p-5 rounded-2xl bg-slate-50/70 border border-slate-200">
              <div className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-700" />
                <span>Parameter Dokumen Raport Digital</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Titimangsa & Tanggal Cetak Raport (Masehi)</label>
                <input
                  type="text"
                  value={sigConfig.titimangsaRaport}
                  onChange={(e) => setSigConfig({ ...sigConfig, titimangsaRaport: e.target.value })}
                  placeholder="Contoh: Jombang, 15 Juni 2026"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tanggal Cetak Hijriah Raport</label>
                <input
                  type="text"
                  value={sigConfig.tanggalHijriahRaport || '28 Dzulqaidah 1447 H'}
                  onChange={(e) => setSigConfig({ ...sigConfig, tanggalHijriahRaport: e.target.value })}
                  placeholder="Contoh: 28 Dzulqaidah 1447 H"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan Default Raport</label>
                <textarea
                  rows={2}
                  value={sigConfig.catatanRaportDefault || "Pertahankan ketekunan mengaji, istiqomah dalam lalaran nadhom, dan tingkatkan pemahaman qowa'id kitab kuning."}
                  onChange={(e) => setSigConfig({ ...sigConfig, catatanRaportDefault: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none font-medium"
                />
              </div>
            </div>

            {/* Ijazah Parameters */}
            <div className="space-y-4 p-5 rounded-2xl bg-slate-50/70 border border-slate-200">
              <div className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-700" />
                <span>Parameter Dokumen Ijazah Kelulusan</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Titimangsa & Tanggal Cetak Ijazah (Masehi)</label>
                <input
                  type="text"
                  value={sigConfig.titimangsaIjazah}
                  onChange={(e) => setSigConfig({ ...sigConfig, titimangsaIjazah: e.target.value })}
                  placeholder="Contoh: Jombang, 30 Mei 2026"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tanggal Cetak Hijriah Ijazah</label>
                <input
                  type="text"
                  value={sigConfig.tanggalHijriahIjazah || '13 Dzulhijjah 1447 H'}
                  onChange={(e) => setSigConfig({ ...sigConfig, tanggalHijriahIjazah: e.target.value })}
                  placeholder="Contoh: 13 Dzulhijjah 1447 H"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Template Nomor Blanko Ijazah</label>
                <input
                  type="text"
                  value={sigConfig.nomorIjazahTemplate || 'MDTA-AN2/IJZ/2026/{NIS}'}
                  onChange={(e) => setSigConfig({ ...sigConfig, nomorIjazahTemplate: e.target.value })}
                  placeholder="MDTA-AN2/IJZ/2026/{NIS}"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Signatures Authority Names & Upload Signature Image */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Pengasuh & Gelar Lengkap</label>
              <input
                type="text"
                value={sigConfig.namaPengasuh}
                onChange={(e) => setSigConfig({ ...sigConfig, namaPengasuh: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Jabatan Resmi Pengasuh</label>
              <input
                type="text"
                value={sigConfig.jabatanPengasuh || 'Pengasuh PP. An-Najiyah 2 Bahrul ‘Ulum'}
                onChange={(e) => setSigConfig({ ...sigConfig, jabatanPengasuh: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-3">
            <label className="block font-bold text-emerald-950 text-xs">
              Upload Gambar Tanda Tangan & Stempel Pengasuh untuk Raport Digital
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={sigConfig.signatureImageUrl || ''}
                onChange={(e) => setSigConfig({ ...sigConfig, signatureImageUrl: e.target.value })}
                placeholder="https://... atau unggah file gambar tanda tangan"
                className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono text-xs"
              />
              <label className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold cursor-pointer flex items-center gap-1.5 text-xs transition-colors shrink-0 shadow-xs">
                <Upload className="w-3.5 h-3.5" />
                <span>Pilih File</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        const res = ev.target?.result as string;
                        if (res) {
                          setSigConfig({ ...sigConfig, signatureImageUrl: res });
                          showNotification('Gambar tanda tangan pengasuh berhasil diunggah!');
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            </div>
            {sigConfig.signatureImageUrl && (
              <div className="flex items-center gap-4 pt-1">
                <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <img src={sigConfig.signatureImageUrl} alt="Preview Tanda Tangan" className="h-14 object-contain max-w-[200px]" />
                </div>
                <button
                  type="button"
                  onClick={() => setSigConfig({ ...sigConfig, signatureImageUrl: '' })}
                  className="text-xs font-semibold text-rose-600 hover:underline"
                >
                  Hapus Tanda Tangan
                </button>
              </div>
            )}
          </div>

          {/* Musrif / Wali Kelas Per Kelas */}
          <div className="space-y-3 pt-2">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              Daftar Musrif / Wali Kelas Penandatangan Raport
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs">
              {Object.entries(sigConfig.musrifPerKelas).map(([kls, nama]) => (
                <div key={kls}>
                  <label className="block font-semibold text-slate-600 text-[11px] mb-0.5">Kelas {kls}</label>
                  <input
                    type="text"
                    value={nama}
                    onChange={(e) =>
                      setSigConfig({
                        ...sigConfig,
                        musrifPerKelas: { ...sigConfig.musrifPerKelas, [kls]: e.target.value },
                      })
                    }
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none font-medium"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer text-xs"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Parameter Raport & Ijazah</span>
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: SIKLUS AKADEMIK & TAHUN AJARAN                                     */}
      {/* ========================================================================= */}
      {adminTab === 'tahun_ajaran' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6 text-xs">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-700" />
              <span>Pengaturan Siklus Tahun Ajaran & Multi-Year Rollover</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Atur tahun ajaran aktif, semester, dan jalankan otomatisasi kenaikan kelas santri secara terpadu.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tahun Ajaran Aktif</label>
              <select
                value={tahunAjaran}
                onChange={(e) => setTahunAjaran(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600"
              >
                {daftarTahun.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Semester Aktif</label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value as 'Ganjil' | 'Genap')}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600"
              >
                <option value="Ganjil">Ganjil</option>
                <option value="Genap">Genap</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleSaveTahunAjaran}
              className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs cursor-pointer"
            >
              Simpan Siklus Aktif
            </button>
            <button
              onClick={() => setShowAddTahun(!showAddTahun)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
            >
              + Tambah Tahun Baru
            </button>
          </div>

          {showAddTahun && (
            <form onSubmit={handleAddTahun} className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3">
              <label className="block font-bold text-emerald-950">Nama Tahun Ajaran Baru (Contoh: 2026/2027)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="2026/2027"
                  value={newTahunInput}
                  onChange={(e) => setNewTahunInput(e.target.value)}
                  className="px-3 py-2 bg-white border border-emerald-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
                <button type="submit" className="px-4 py-2 bg-emerald-800 text-white rounded-xl font-bold text-xs">
                  Tambahkan
                </button>
              </div>
            </form>
          )}

          {/* Rollover Section */}
          <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3 mt-6">
            <div className="flex items-center gap-2 text-amber-950 font-black text-sm">
              <RefreshCw className="w-4 h-4 text-amber-700" />
              <span>Multi-Year Rollover (Kenaikan Kelas Massal)</span>
            </div>
            <p className="text-xs text-amber-900 leading-relaxed">
              Fitur ini akan menaikkan santri kelas 1-5 ke kelas berikutnya (1A→2A, 5A→6), dan menyatakan santri kelas 6 lulus sebagai alumni.
            </p>
            <button
              onClick={() => setShowRolloverConfirm(true)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow-xs"
            >
              Jalankan Kenaikan Kelas Otomatis
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: PROFIL LEMBAGA, BACKUP & RESET MASTER DB                           */}
      {/* ========================================================================= */}
      {adminTab === 'sistem' && (
        <div className="space-y-6">
          <form onSubmit={handleSaveProfil} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 text-xs">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Building className="w-5 h-5 text-emerald-700" />
              <span>Identitas Resmi Madrasah Takmiliyah</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Lembaga</label>
                <input
                  type="text"
                  value={namaPesantren}
                  onChange={(e) => setNamaPesantren(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nomor Statistik Pesantren / NSPP</label>
                <input
                  type="text"
                  value={nspp}
                  onChange={(e) => setNspp(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:bg-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Alamat Lembaga</label>
                <input
                  type="text"
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                />
              </div>
            </div>

            <button type="submit" className="px-5 py-2.5 bg-emerald-800 text-white font-bold rounded-xl shadow-xs">
              Simpan Profil Lembaga
            </button>
          </form>

          {/* Backup and Restore */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 text-xs">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-700" />
              <span>Cadangkan & Pulihkan Master Database JSON</span>
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Ekspor seluruh data santri, guru, absensi, nilai, muhafadzoh, silabus, dan akun pengguna ke berkas JSON mandiri.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => storageService.downloadBackupFile()}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-800 text-white rounded-xl font-bold"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Cadangan JSON</span>
              </button>
              <label className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold cursor-pointer">
                <Upload className="w-4 h-4 text-emerald-700" />
                <span>Pulihkan dari File JSON</span>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const content = event.target?.result as string;
                      const res = storageService.importBackupJson(content);
                      showNotification(res.message);
                      if (res.success) {
                        setTimeout(() => window.location.reload(), 1500);
                      }
                    };
                    reader.readAsText(file);
                  }}
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT MENU                                                          */}
      {/* ========================================================================= */}
      {editingMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 space-y-4 text-xs">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-emerald-700" />
              <span>Ubah Judul Menu Navigasi</span>
            </h3>

            <form onSubmit={handleSaveEditMenu} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Judul Menu</label>
                <input
                  type="text"
                  required
                  value={editingMenu.title}
                  onChange={(e) => setEditingMenu({ ...editingMenu, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Badge Teks (Opsional)</label>
                <input
                  type="text"
                  value={editingMenu.badge || ''}
                  onChange={(e) => setEditingMenu({ ...editingMenu, badge: e.target.value })}
                  placeholder="Contoh: Baru, 247 Santri"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingMenu(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TAMBAH MENU KUSTOM BARU                                            */}
      {/* ========================================================================= */}
      {showAddMenuModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 space-y-4 text-xs">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-700" />
              <span>Tambah Menu Kustom Baru</span>
            </h3>

            <form onSubmit={handleAddCustomMenu} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Judul Menu Navigasi <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Laporan Kegiatan, Galeri Kitab"
                  value={newMenuTitle}
                  onChange={(e) => setNewMenuTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kategori Menu</label>
                <select
                  value={newMenuCategory}
                  onChange={(e) => setNewMenuCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  <option value="utama">Menu Utama</option>
                  <option value="akademik">Akademik</option>
                  <option value="dokumen">Dokumen & Kitab</option>
                  <option value="evaluasi">Evaluasi</option>
                  <option value="kustom">Kustom</option>
                </select>
              </div>

              <div className="space-y-2 pt-2">
                <span className="block font-bold text-slate-700">Visibilitas Hak Akses:</span>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newMenuForAdmin}
                      onChange={(e) => setNewMenuForAdmin(e.target.checked)}
                      className="rounded text-emerald-700"
                    />
                    <span className="font-semibold text-slate-800">Admin</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newMenuForGuru}
                      onChange={(e) => setNewMenuForGuru(e.target.checked)}
                      className="rounded text-emerald-700"
                    />
                    <span className="font-semibold text-slate-800">Guru</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newMenuForSiswa}
                      onChange={(e) => setNewMenuForSiswa(e.target.checked)}
                      className="rounded text-emerald-700"
                    />
                    <span className="font-semibold text-slate-800">Siswa</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddMenuModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Batal
                </button>
                <button type="submit" className="px-5 py-2 bg-emerald-800 text-white rounded-xl font-bold shadow-xs">
                  Tambahkan Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT USER ACCOUNT                                                  */}
      {/* ========================================================================= */}
      {editingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-emerald-700" />
              <span>Edit Akun Pengguna & Kredensial</span>
            </h3>

            <form onSubmit={handleSaveEditUser} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={editingAccount.name}
                  onChange={(e) => setEditingAccount({ ...editingAccount, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Username Login</label>
                  <input
                    type="text"
                    required
                    value={editingAccount.username}
                    onChange={(e) => setEditingAccount({ ...editingAccount, username: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kata Sandi (Password)</label>
                  <input
                    type="text"
                    required
                    value={editingAccount.password}
                    onChange={(e) => setEditingAccount({ ...editingAccount, password: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-emerald-950"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Peran (Role)</label>
                  <select
                    value={editingAccount.role}
                    onChange={(e) => setEditingAccount({ ...editingAccount, role: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="admin">Admin</option>
                    <option value="guru">Guru</option>
                    <option value="siswa">Siswa</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kelas (Khusus Siswa/Wali)</label>
                  <input
                    type="text"
                    value={editingAccount.kelas || ''}
                    onChange={(e) => setEditingAccount({ ...editingAccount, kelas: e.target.value })}
                    placeholder="Contoh: Kelas 5A"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">NIP / NIS Resmi</label>
                <input
                  type="text"
                  value={editingAccount.nipOrNis}
                  onChange={(e) => setEditingAccount({ ...editingAccount, nipOrNis: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Status Akun</label>
                <select
                  value={editingAccount.status}
                  onChange={(e) => setEditingAccount({ ...editingAccount, status: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="Aktif">Aktif (Dapat Login)</option>
                  <option value="Nonaktif">Nonaktif (Diblokir)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingAccount(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Batal
                </button>
                <button type="submit" className="px-5 py-2 bg-emerald-800 text-white rounded-xl font-bold shadow-xs">
                  Simpan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TAMBAH USER ACCOUNT BARU                                           */}
      {/* ========================================================================= */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 space-y-4 text-xs">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-emerald-700" />
              <span>Tambah Akun Pengguna Baru</span>
            </h3>

            <form onSubmit={handleAddUser} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Nama ustadz / santri"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Username Login <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: ahmad.fauzi atau NIS"
                    value={addUsername}
                    onChange={(e) => setAddUsername(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kata Sandi Awal <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Sandi login"
                    value={addPassword}
                    onChange={(e) => setAddPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-emerald-950"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Peran (Role)</label>
                  <select
                    value={addRole}
                    onChange={(e) => setAddRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="guru">Guru (Ustadz)</option>
                    <option value="siswa">Siswa (Santri)</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kelas (Bila Ada)</label>
                  <input
                    type="text"
                    placeholder="Contoh: 1A, 2A, 5A"
                    value={addKelas}
                    onChange={(e) => setAddKelas(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">NIP / NIS (Opsional)</label>
                <input
                  type="text"
                  placeholder="NIP. ... atau NIS. ..."
                  value={addNipNis}
                  onChange={(e) => setAddNipNis(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Batal
                </button>
                <button type="submit" className="px-5 py-2 bg-emerald-800 text-white rounded-xl font-bold shadow-xs">
                  Buat Akun Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ROLLOVER CONFIRMATION                                              */}
      {/* ========================================================================= */}
      {showRolloverConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 space-y-4 text-xs">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
              <span>Konfirmasi Kenaikan Kelas Santri Massal</span>
            </h3>

            <p className="text-slate-600 leading-relaxed">
              Anda akan memajukan siklus akademik ke tahun berikutnya. Seluruh santri aktif di kelas 1-5 akan dinaikkan ke tingkat berikutnya.
            </p>

            <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={promoteStudents}
                  onChange={(e) => setPromoteStudents(e.target.checked)}
                  className="rounded text-emerald-700"
                />
                <span>Naikkan santri otomatis ke jenjang berikutnya</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={resetAttendance}
                  onChange={(e) => setResetAttendance(e.target.checked)}
                  className="rounded text-emerald-700"
                />
                <span>Reset status absensi harian untuk tahun baru</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRolloverConfirm(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteRollover}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-xs"
              >
                Ya, Jalankan Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
