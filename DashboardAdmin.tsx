import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  GraduationCap,
  Calendar,
  ClipboardCheck,
  FileSpreadsheet,
  BookOpen,
  FileQuestion,
  Award,
  BookMarked,
  Landmark,
  Bell,
  Settings,
  ShieldCheck,
  KeyRound,
  Sparkles,
  Sliders,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Lock,
  ArrowRight,
  AlertTriangle,
  Compass,
  Download,
  Eye,
  EyeOff,
  UserPlus,
  Save,
  X,
  Layers,
  FileText,
  CalendarOff
} from 'lucide-react';
import { NavPage } from '../components/Sidebar';
import { UserProfile, UserRole, SesiAbsensi, Santri, NavMenuItemConfig } from '../types';
import { MOCK_USERS, MOCK_SESI_ABSENSI, PESANTREN_INFO } from '../data/mockData';
import { storageService, SignaturesConfig } from '../services/storageService';

interface DashboardAdminProps {
  user?: UserProfile;
  onNavigate: (page: NavPage) => void;
  onSwitchRole?: (role: UserRole) => void;
  absensiSession?: SesiAbsensi;
}

export const DashboardAdmin: React.FC<DashboardAdminProps> = ({
  user = MOCK_USERS.admin,
  onNavigate,
  onSwitchRole = () => {},
  absensiSession = MOCK_SESI_ABSENSI,
}) => {
  // Toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Nav menus live state
  const [navMenus, setNavMenus] = useState<NavMenuItemConfig[]>(() =>
    storageService.getNavMenus()
  );

  useEffect(() => {
    const handleUpdate = () => {
      setNavMenus(storageService.getNavMenus());
    };
    window.addEventListener('nav_menus_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('nav_menus_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Modal 1: Ganti Password Admin
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldAdminPass, setOldAdminPass] = useState('');
  const [newAdminPass, setNewAdminPass] = useState('');
  const [confirmAdminPass, setConfirmAdminPass] = useState('');
  const [showPassText, setShowPassText] = useState(false);

  // Modal 2: Tambah Santri Baru
  const [showAddSantriModal, setShowAddSantriModal] = useState(false);
  const [newSantriNama, setNewSantriNama] = useState('');
  const [newSantriNis, setNewSantriNis] = useState('');
  const [newSantriNisn, setNewSantriNisn] = useState('');
  const [newSantriKelas, setNewSantriKelas] = useState('1A');
  const [newSantriWali, setNewSantriWali] = useState('');
  const [newSantriHpWali, setNewSantriHpWali] = useState('0812-3456-7890');
  const [newSantriTempatLahir, setNewSantriTempatLahir] = useState('Jombang');
  const [newSantriTanggalLahir, setNewSantriTanggalLahir] = useState('15 Syawal 1433 H');
  const [newSantriAlamat, setNewSantriAlamat] = useState('Tambakberas, Jombang');

  // Modal 3: Quick Edit Format Cetak Raport & Ijazah
  const [showCetakModal, setShowCetakModal] = useState(false);
  const [signatures, setSignatures] = useState<SignaturesConfig>(() =>
    storageService.getSignaturesAndMusrif()
  );

  // Quick stats
  const students = storageService.getStudents();
  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.status === 'Aktif').length;
  const userAccounts = storageService.getUserAccounts();

  // Role permissions matrix description
  const [selectedRbacRole, setSelectedRbacRole] = useState<'Admin' | 'Pengasuh' | 'Guru' | 'Wali Kelas' | 'Santri'>('Admin');
  const rbacPermissions = {
    'Admin': {
      deskripsi: 'Akses penuh sebagai web architect: mengedit/menambah/menghilangkan semua menu, atur username/password santri & guru, buat kalender pendidikan, dan master edit raport/ijazah.',
      akses: ['Kendali Penuh Seluruh Menu', 'Ubah Password Siswa & Guru', 'Master Edit Raport & Ijazah', 'Tambah Santri & Kalender Pendidikan', 'Audit Log & Backup Database'],
      status: 'Super Administrator & Web Architect',
    },
    'Pengasuh': {
      deskripsi: 'Otorisasi tertinggi pengesahan ijazah, kebijakan kurikulum madrasah, dan supervisi raport.',
      akses: ['Tanda Tangan & Pengesahan Ijazah', 'Persetujuan Kalender Akademik', 'Laporan Kinerja Asatidz', 'Monitoring Kegiatan Madrasah'],
      status: 'PENGASUH',
    },
    'Guru': {
      deskripsi: 'Input absensi, materi, silabus, bank soal, dan evaluasi harian mata pelajaran diampu.',
      akses: ['Input Nilai Harian & Ujian', 'Pembuatan Bank Soal', 'Upload Modul & Materi', 'Absensi Jam Mengajar'],
      status: 'Tenaga Pengajar',
    },
    'Wali Kelas': {
      deskripsi: 'Mengelola raport santri satu rombel kelas, mutaba\'ah akhlak, dan komunikasi wali santri.',
      akses: ['Pencetakan & Generate Raport', 'Input Catatan Karakter Santri', 'Monitoring Kehadiran Semester', 'Legalisir Raport'],
      status: 'Pembina Kelas',
    },
    'Santri': {
      deskripsi: 'Akses presensi mandiri, melihat nilai pelajaran & muhafadloh, buku santri, serta cetak raport dan ijazah (Kelas 6).',
      akses: ['Melihat Absensi & Nilai', 'Nilai Muhafadloh', 'Buku Santri & Ujian Online', 'Cetak Raport & Ijazah (Kelas 6)'],
      status: 'Akses Santri',
    },
  };

  // Handle Change Admin Password
  const handleChangeAdminPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminPass || newAdminPass.length < 5) {
      showToast('Kata sandi baru minimal harus 5 karakter.');
      return;
    }
    if (newAdminPass !== confirmAdminPass) {
      showToast('Konfirmasi kata sandi tidak cocok. Harap periksa kembali.');
      return;
    }

    // Update in user accounts
    storageService.changeUserPassword('admin.mahfudz', newAdminPass);
    storageService.changeUserPassword('usr-admin', newAdminPass);
    setShowPasswordModal(false);
    setOldAdminPass('');
    setNewAdminPass('');
    setConfirmAdminPass('');
    showToast('Kata sandi Administrator Utama berhasil diperbarui!');
  };

  // Handle Add New Santri
  const handleCreateSantri = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSantriNama.trim()) {
      showToast('Nama santri wajib diisi.');
      return;
    }

    const generatedNis = newSantriNis.trim() || `26${String(students.length + 1).padStart(4, '0')}`;
    const newStudent: Santri = {
      id: `santri-${generatedNis}`,
      nis: generatedNis,
      nisn: newSantriNisn.trim() || `00${generatedNis}88`,
      nama: newSantriNama.trim(),
      gender: 'L',
      jenisKelamin: 'L',
      kelas: newSantriKelas,
      tahunMasuk: '2026',
      status: 'Aktif',
      tempatLahir: newSantriTempatLahir.trim(),
      tanggalLahir: newSantriTanggalLahir.trim(),
      namaWali: newSantriWali.trim() || `Wali dari ${newSantriNama.trim()}`,
      waliSantri: newSantriWali.trim() || `Wali dari ${newSantriNama.trim()}`,
      noHpWali: newSantriHpWali.trim(),
      alamat: newSantriAlamat.trim(),
      hafalanJuz: 1,
      akhlakPredikat: 'A (Sangat Baik)',
      kehadiranPercent: 100,
      rataRataNilai: 88,
      catatanWaliKelas: 'Santri baru terdaftar aktif pada sistem madrasah diniyah.',
    };

    storageService.addSantri(newStudent);
    setShowAddSantriModal(false);
    setNewSantriNama('');
    setNewSantriNis('');
    setNewSantriNisn('');
    setNewSantriWali('');
    showToast(`Santri "${newStudent.nama}" (NIS: ${newStudent.nis}) berhasil ditambahkan! Akun login otomatis dibuat: ${newStudent.nis} / sandi: santri123`);
  };

  // Handle Save Format Cetak Raport & Ijazah
  const handleSaveSignatures = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.saveSignaturesAndMusrif(signatures);
    setShowCetakModal(false);
    showToast('Pengaturan format cetak Raport & Ijazah berhasil disimpan!');
  };

  // Handle Toggle Menu Visibility directly from dashboard
  const handleToggleMenu = (menuId: string, role: 'admin' | 'guru' | 'siswa') => {
    storageService.toggleMenuVisibility(menuId, role);
    setNavMenus(storageService.getNavMenus());
    showToast('Status visibilitas menu navigasi berhasil diperbarui.');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Superadmin Web Architect Studio Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-emerald-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-emerald-950 text-xs font-black tracking-wide shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-950" />
              <span>Studio Web Architect & Superadmin Madrasah</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <Sliders className="w-7 h-7 text-amber-400" />
              <span>Panel Kontrol Administrator Terpadu</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Selamat datang, <strong>{user?.name || 'Administrator'}</strong>. Anda memegang kendali arsitektur penuh: ubah struktur menu, atur akun/password siswa & guru, kelola kalender pendidikan, dan edit format cetak raport & ijazah secara dinamis.
            </p>
          </div>

          {/* Quick Superadmin Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowPasswordModal(true)}
              id="btn-admin-ubah-password-top"
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black rounded-xl text-xs shadow-md transition-all cursor-pointer hover:scale-102"
            >
              <KeyRound className="w-4 h-4 text-emerald-950" />
              <span>Ubah Password Admin</span>
            </button>

            <button
              onClick={() => setShowAddSantriModal(true)}
              id="btn-admin-tambah-santri-top"
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all border border-emerald-700 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-emerald-300" />
              <span>Tambah Santri Baru</span>
            </button>

            <button
              onClick={() => setShowCetakModal(true)}
              id="btn-admin-edit-cetak-top"
              className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-all border border-slate-700 cursor-pointer"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>Format Raport & Ijazah</span>
            </button>
          </div>
        </div>
      </div>

      {/* Warning Alert if Attendance Incomplete */}
      {!absensiSession?.isCompleted && (
        <div className="bg-amber-50 border border-amber-300/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-amber-950 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-800" />
            </div>
            <div>
              <div className="text-sm font-bold text-amber-950 flex items-center gap-2">
                <span>⚠ Pemberitahuan Admin: Sesi absensi harian santri belum tuntas.</span>
                <span className="text-[10px] bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded font-mono font-bold">
                  Kelas 5A
                </span>
              </div>
              <p className="text-xs text-amber-800/90 mt-0.5">
                Terdapat sesi absensi yang belum disimpan oleh guru pengampu. Sebagai administrator, Anda memiliki wewenang memantau dan mengubah absensi santri.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('absensi')}
            className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold rounded-xl text-xs transition-colors shrink-0 whitespace-nowrap cursor-pointer"
          >
            Periksa & Ubah Absensi
          </button>
        </div>
      )}

      {/* Master KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Database Santri</span>
            <Users className="w-4 h-4 text-emerald-700" />
          </div>
          <span className="text-2xl font-black text-emerald-950 font-mono mt-1 block">{totalStudents} Santri</span>
          <span className="text-[10px] text-emerald-700 font-semibold">{activeStudents} Santri Berstatus Aktif</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Dewan Asatidz</span>
            <UserCheck className="w-4 h-4 text-blue-700" />
          </div>
          <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">84 Pengajar</span>
          <span className="text-[10px] text-blue-700 font-semibold">Aktif Mengajar KBM Madin</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-amber-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Menu Navigasi Aktif</span>
            <Compass className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">{navMenus.length} Menu</span>
          <span className="text-[10px] text-amber-700 font-semibold">Dapat Ditambah & Dihapus</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-purple-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Akun Login Terdaftar</span>
            <KeyRound className="w-4 h-4 text-purple-700" />
          </div>
          <span className="text-2xl font-black text-emerald-900 font-mono mt-1 block">{userAccounts.length} Akun</span>
          <span className="text-[10px] text-purple-700 font-semibold">Admin, Guru, & Santri</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6 MASTER MODULES FOR ADMIN (DISTINCTIVE ARCHITECT TOOLS)                 */}
      {/* ========================================================================= */}
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              <span>Studio Arsitek Web & Pusat Operasional Administrator</span>
            </h2>
            <p className="text-xs text-slate-500">
              Fitur khusus admin untuk memodifikasi seluruh bagian web sesuai kebutuhan
            </p>
          </div>
          <button
            onClick={() => onNavigate('pengaturan')}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-900 underline underline-offset-2 flex items-center gap-1"
          >
            <span>Buka Pengaturan Lengkap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1: Manajemen Menu Navigasi */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">
                1. Pengelola Menu & Navigasi Web
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ubah judul menu, sembunyikan menu tertentu untuk Santri atau Guru, atau tambahkan menu baru sesuai kebutuhan.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg">
                {navMenus.length} Menu Dikonfigurasi
              </span>
              <button
                onClick={() => onNavigate('pengaturan')}
                className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Atur Menu
              </button>
            </div>
          </div>

          {/* Card 2: Kelola Akun Login & Hak Akses */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-800 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">
                2. Akun Login & Hak Akses Pengguna
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Atur username & password santri dan guru, tambah akun baru, serta atur izin akses (Absensi, Nilai, Silabus, Cetak).
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg">
                {userAccounts.length} Akun Terdaftar
              </span>
              <button
                onClick={() => onNavigate('pengaturan')}
                className="px-3 py-1.5 bg-blue-800 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Atur Kredensial
              </button>
            </div>
          </div>

          {/* Card 3: Kalender Pendidikan & Hari Libur */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 hover:border-rose-400 hover:shadow-md transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-800 flex items-center justify-center font-bold">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">
                3. Kalender Pendidikan & Libur
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Buat dan kelola agenda akademik madrasah (PTS, Imtihan, Munaqosyah, Libur Maulid, Libur Semester) serta kunci absensi.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-bold text-rose-800 bg-rose-50 px-2.5 py-1 rounded-lg">
                Agenda & Libur Resmi
              </span>
              <button
                onClick={() => onNavigate('hari_libur')}
                className="px-3 py-1.5 bg-rose-800 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Buka Kalender
              </button>
            </div>
          </div>

          {/* Card 4: Format Cetak & Master Edit Ijazah */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-900 flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">
                4. Master Edit Ijazah Kelulusan
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Edit titimangsa cetak, nomor ijazah, penandatangan pengasuh, serta perbaiki nama/nilai santri bila ada yang kurang tepat.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-900 bg-amber-100 px-2.5 py-1 rounded-lg">
                Tingkat Akhir Kelas 6
              </span>
              <button
                onClick={() => onNavigate('ijazah')}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-emerald-950 rounded-xl text-xs font-black transition-colors cursor-pointer"
              >
                Buka & Edit Ijazah
              </button>
            </div>
          </div>

          {/* Card 5: Master Edit Raport Digital */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">
                5. Master Edit Raport Digital
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Edit tanggal raport, nama pengasuh & musrif per kelas, catatan kelulusan/kenaikan, dan sesuaikan nilai santri langsung.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg">
                Semester Ganjil/Genap
              </span>
              <button
                onClick={() => onNavigate('raport')}
                className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Buka & Edit Raport
              </button>
            </div>
          </div>

          {/* Card 6: Database Santri & Tambah Santri Baru */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 hover:border-teal-400 hover:shadow-md transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center font-bold">
                <UserPlus className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">
                6. Database Santri & Tambah Baru
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tambahkan santri baru dengan pembuatan akun login instan, ubah NIS/biodata santri, atau kelola kenaikan kelas.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setShowAddSantriModal(true)}
                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 rounded-xl text-xs font-black transition-colors cursor-pointer"
              >
                + Santri Baru
              </button>
              <button
                onClick={() => onNavigate('siswa')}
                className="px-3 py-1.5 bg-teal-800 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Kelola Santri
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RBAC Access Management Overview */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-emerald-100 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-700" />
              <span>Matriks Wewenang & Hak Akses Pengguna</span>
            </h2>
            <p className="text-xs text-slate-500">
              Gambaran wewenang 5 level pengguna sistem Pesantren Terpadu
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-amber-100 text-amber-900 rounded-full border border-amber-300 self-start sm:self-auto">
            Hak Akses Tertinggi: Administrator
          </span>
        </div>

        {/* Role Tabs */}
        <div className="flex flex-wrap gap-2 my-4">
          {(['Admin', 'Pengasuh', 'Guru', 'Wali Kelas', 'Santri'] as const).map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRbacRole(role)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedRbacRole === role
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-900'
              }`}
            >
              {role}
            </button>
          ))}
        </div>

        {/* Role Detail Box */}
        <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-emerald-950">
              Hak Akses: {selectedRbacRole}
            </h3>
            <span className="text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full">
              {rbacPermissions[selectedRbacRole].status}
            </span>
          </div>
          <p className="text-xs text-slate-600 mb-3">
            {rbacPermissions[selectedRbacRole].deskripsi}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {rbacPermissions[selectedRbacRole].akses.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-emerald-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-slate-800 font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: GANTI PASSWORD ADMIN                                             */}
      {/* ========================================================================= */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 relative">
            <button
              onClick={() => setShowPasswordModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Ubah Password Administrator</h3>
                <p className="text-xs text-slate-500">Perbarui kata sandi akun superadmin</p>
              </div>
            </div>

            <form onSubmit={handleChangeAdminPassword} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Kata Sandi Lama (Opsional)
                </label>
                <input
                  type={showPassText ? 'text' : 'password'}
                  value={oldAdminPass}
                  onChange={(e) => setOldAdminPass(e.target.value)}
                  placeholder="Masukkan kata sandi lama"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Kata Sandi Baru <span className="text-rose-500">*</span>
                </label>
                <input
                  type={showPassText ? 'text' : 'password'}
                  required
                  value={newAdminPass}
                  onChange={(e) => setNewAdminPass(e.target.value)}
                  placeholder="Minimal 5 karakter"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Konfirmasi Kata Sandi Baru <span className="text-rose-500">*</span>
                </label>
                <input
                  type={showPassText ? 'text' : 'password'}
                  required
                  value={confirmAdminPass}
                  onChange={(e) => setConfirmAdminPass(e.target.value)}
                  placeholder="Ketik ulang kata sandi baru"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setShowPassText(!showPassText)}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                >
                  {showPassText ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPassText ? 'Sembunyikan Sandi' : 'Tampilkan Sandi'}</span>
                </button>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 rounded-xl font-black transition-all shadow-md"
                >
                  Simpan Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: TAMBAH SANTRI BARU (AUTO ACCOUNT CREATION)                      */}
      {/* ========================================================================= */}
      {showAddSantriModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-4 relative my-8">
            <button
              onClick={() => setShowAddSantriModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-900 flex items-center justify-center">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Tambah Data Santri Baru</h3>
                <p className="text-xs text-slate-500">
                  Akun login siswa akan otomatis digenerate dengan NIS dan sandi default: <strong>santri123</strong>
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateSantri} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Nama Lengkap Santri <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newSantriNama}
                    onChange={(e) => setNewSantriNama(e.target.value)}
                    placeholder="Contoh: Muhammad Ilham Fathoni"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nomor Induk Santri (NIS)
                  </label>
                  <input
                    type="text"
                    value={newSantriNis}
                    onChange={(e) => setNewSantriNis(e.target.value)}
                    placeholder="Kosongkan untuk auto-generate (26xxxx)"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    NISN Santri
                  </label>
                  <input
                    type="text"
                    value={newSantriNisn}
                    onChange={(e) => setNewSantriNisn(e.target.value)}
                    placeholder="Contoh: 0026123488"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Penempatan Kelas <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newSantriKelas}
                    onChange={(e) => setNewSantriKelas(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none font-bold"
                  >
                    <option value="1A">Kelas 1A</option>
                    <option value="1B">Kelas 1B</option>
                    <option value="2A">Kelas 2A</option>
                    <option value="2B">Kelas 2B</option>
                    <option value="3A">Kelas 3A</option>
                    <option value="3B">Kelas 3B</option>
                    <option value="3C">Kelas 3C</option>
                    <option value="4A">Kelas 4A</option>
                    <option value="4B">Kelas 4B</option>
                    <option value="5A">Kelas 5A</option>
                    <option value="5B">Kelas 5B</option>
                    <option value="6">Kelas 6 (Tingkat Akhir)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    No. HP / WhatsApp Wali
                  </label>
                  <input
                    type="text"
                    value={newSantriHpWali}
                    onChange={(e) => setNewSantriHpWali(e.target.value)}
                    placeholder="0812-3456-7890"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nama Wali Santri
                  </label>
                  <input
                    type="text"
                    value={newSantriWali}
                    onChange={(e) => setNewSantriWali(e.target.value)}
                    placeholder="Nama bapak/ibu wali"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tempat Lahir
                  </label>
                  <input
                    type="text"
                    value={newSantriTempatLahir}
                    onChange={(e) => setNewSantriTempatLahir(e.target.value)}
                    placeholder="Jombang"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Alamat Domisili / Asal Santri
                  </label>
                  <input
                    type="text"
                    value={newSantriAlamat}
                    onChange={(e) => setNewSantriAlamat(e.target.value)}
                    placeholder="Tambakberas, Jombang"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddSantriModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-teal-800 hover:bg-teal-700 text-white rounded-xl font-bold transition-all shadow-md"
                >
                  Simpan & Buat Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: QUICK EDIT FORMAT RAPORT & IJAZAH                                */}
      {/* ========================================================================= */}
      {showCetakModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-4 relative my-8">
            <button
              onClick={() => setShowCetakModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Format Titimangsa Raport & Ijazah</h3>
                <p className="text-xs text-slate-500">Pengaturan tanda tangan dan tanggal cetak resmi</p>
              </div>
            </div>

            <form onSubmit={handleSaveSignatures} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Pengasuh Pondok Pesantren
                </label>
                <input
                  type="text"
                  required
                  value={signatures.namaPengasuh}
                  onChange={(e) => setSignatures({ ...signatures, namaPengasuh: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Kepala Madrasah Diniyah
                </label>
                <input
                  type="text"
                  value={signatures.namaKepalaMadrasah || ''}
                  onChange={(e) => setSignatures({ ...signatures, namaKepalaMadrasah: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Titimangsa Cetak Raport
                  </label>
                  <input
                    type="text"
                    required
                    value={signatures.titimangsaRaport}
                    onChange={(e) => setSignatures({ ...signatures, titimangsaRaport: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Titimangsa Cetak Ijazah
                  </label>
                  <input
                    type="text"
                    required
                    value={signatures.titimangsaIjazah}
                    onChange={(e) => setSignatures({ ...signatures, titimangsaIjazah: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Template Nomor Ijazah
                </label>
                <input
                  type="text"
                  value={signatures.nomorIjazahTemplate || 'MDTA-AN2/IJZ/2026/{NIS}'}
                  onChange={(e) => setSignatures({ ...signatures, nomorIjazahTemplate: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCetakModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-md"
                >
                  Simpan Format
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
