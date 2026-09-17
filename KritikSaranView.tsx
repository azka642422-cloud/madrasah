import React, { useState, useMemo } from 'react';
import {
  MessageSquare,
  Send,
  CheckCircle2,
  Inbox,
  Archive,
  Trash2,
  Eye,
  Reply,
  ShieldCheck,
  Clock,
  Filter,
  AlertCircle
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { UserProfile, KritikSaranItem } from '../types';

interface KritikSaranViewProps {
  currentUser?: UserProfile;
  userRole?: string;
}

export const KritikSaranView: React.FC<KritikSaranViewProps> = ({
  currentUser,
  userRole = 'Guru',
}) => {
  const isSiswa = userRole.toLowerCase() === 'siswa';
  const isAdmin = userRole.toLowerCase() === 'admin';
  const isGuru = userRole.toLowerCase() === 'guru';

  const [items, setItems] = useState<KritikSaranItem[]>(() =>
    storageService.getKritikSaran()
  );

  // Guru Form State
  const [judul, setJudul] = useState('');
  const [kategori, setKategori] = useState<
    'Kurikulum' | 'Kedisiplinan' | 'Fasilitas' | 'Santri' | 'Lainnya'
  >('Kurikulum');
  const [pesan, setPesan] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Admin Filter State
  const [filterKategori, setFilterKategori] = useState<string>('Semua');
  const [showArchived, setShowArchived] = useState(false);
  const [balasModalItem, setBalasModalItem] = useState<KritikSaranItem | null>(null);
  const [teksBalasan, setTeksBalasan] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  if (isSiswa) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-rose-200 shadow-sm max-w-lg mx-auto my-12">
        <ShieldCheck className="w-12 h-12 text-rose-600 mx-auto mb-3" />
        <h2 className="text-lg font-black text-slate-900 mb-2">Akses Khusus Dewan Asatidz & Admin</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Fitur Kritik & Saran merupakan saluran internal konsultasi antara Asatidz/Guru dengan Sekretaris & Administrasi Madrasah.
        </p>
      </div>
    );
  }

  // Handle submit by Guru
  const handleSubmitGuru = (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul.trim() || !pesan.trim()) {
      showToast('Harap lengkapi judul dan isi pesan saran.');
      return;
    }

    const guruName = currentUser?.name || 'Ust. Pengajar';
    const updated = storageService.addKritikSaran({
      namaGuru: guruName,
      emailGuru: currentUser?.email,
      kategori,
      judul: judul.trim(),
      pesan: pesan.trim(),
    });

    setItems(updated);
    setJudul('');
    setPesan('');
    showToast('Kritik & saran Anda berhasil dikirim secara privat ke Sekretaris & Admin.');
  };

  // Guru can ONLY view their own submissions (Privacy mandate)
  const mySubmissions = useMemo(() => {
    if (!currentUser) return [];
    const myName = currentUser.name.toLowerCase();
    return items.filter(
      (item) =>
        item.namaGuru.toLowerCase() === myName ||
        (currentUser.email && item.emailGuru === currentUser.email)
    );
  }, [items, currentUser]);

  // Admin filter items
  const adminItems = useMemo(() => {
    return items.filter((item) => {
      const matchKategori = filterKategori === 'Semua' || item.kategori === filterKategori;
      const matchArsip = showArchived ? item.arsip : !item.arsip;
      return matchKategori && matchArsip;
    });
  }, [items, filterKategori, showArchived]);

  // Admin Actions
  const handleToggleRead = (id: string) => {
    storageService.markKritikSaranRead(id);
    setItems(storageService.getKritikSaran());
  };

  const handleToggleArchive = (id: string) => {
    storageService.archiveKritikSaran(id);
    setItems(storageService.getKritikSaran());
    showToast('Status arsip berhasil diperbarui.');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Hapus kritik dan saran ini secara permanen?')) {
      storageService.deleteKritikSaran(id);
      setItems(storageService.getKritikSaran());
      showToast('Kritik/saran berhasil dihapus.');
    }
  };

  const handleSaveBalasan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!balasModalItem || !teksBalasan.trim()) return;
    storageService.balasKritikSaran(balasModalItem.id, teksBalasan.trim());
    setItems(storageService.getKritikSaran());
    setBalasModalItem(null);
    setTeksBalasan('');
    showToast('Tanggapan berhasil disimpan dan dapat dibaca oleh asatidz bersangkutan.');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-emerald-700" />
            <span>Kritik & Saran Pendidik (Privat)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isAdmin
              ? 'Kotak masuk resmi aspirasi, evaluasi, dan saran perbaikan dari Dewan Asatidz kepada Sekretaris Madrasah'
              : 'Sampaikan kritik konstruktif, evaluasi pembelajaran, atau usulan fasilitas secara langsung dan privat kepada Sekretaris & Admin'}
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-900 rounded-xl text-xs font-bold border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Privat: Terenkripsi & Hanya Terlihat Oleh Anda & Sekretaris</span>
        </div>
      </div>

      {toastMessage && (
        <div className="bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-3 border border-slate-700 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* VIEW UNTUK GURU */}
      {isGuru && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Pengiriman */}
          <div className="lg:col-span-1 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Send className="w-4 h-4 text-emerald-700" />
              <span>Kirim Kritik / Saran Baru</span>
            </h2>

            <form onSubmit={handleSubmitGuru} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Asatidz (Pengirim)</label>
                <input
                  type="text"
                  disabled
                  value={currentUser?.name || 'Ustadz Pengajar'}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-medium text-slate-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Kategori <span className="text-rose-500">*</span>
                </label>
                <select
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                >
                  <option value="Kurikulum">Kurikulum & Silabus Kitab</option>
                  <option value="Kedisiplinan">Kedisiplinan & Jam Mengajar</option>
                  <option value="Fasilitas">Fasilitas Ruang Kelas / Asrama</option>
                  <option value="Santri">Karakter & Perkembangan Santri</option>
                  <option value="Lainnya">Lainnya / Umum</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Pokok Bahasan / Judul <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  placeholder="Contoh: Usulan jam muthala'ah kitab ba'da Isya"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Uraian Pesan / Masukan <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={5}
                  value={pesan}
                  onChange={(e) => setPesan(e.target.value)}
                  placeholder="Tuliskan saran, kritik, atau evaluasi Anda dengan bahasa yang santun..."
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                id="btn-kirim-kritik-sekretaris"
                className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Kirim ke Sekretaris</span>
              </button>
            </form>
          </div>

          {/* Riwayat Pengiriman Guru */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <Inbox className="w-4 h-4 text-emerald-700" />
                <span>Riwayat Kritik & Saran Anda ({mySubmissions.length})</span>
              </h2>
              <span className="text-[11px] text-slate-400 font-medium">Hanya Anda yang dapat melihat riwayat ini</span>
            </div>

            {mySubmissions.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                Anda belum pernah mengirim kritik atau saran. Masukan Anda sangat berharga bagi kemajuan madrasah.
              </div>
            ) : (
              <div className="space-y-4">
                {mySubmissions.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2 hover:border-emerald-200 transition-colors text-xs"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded-md font-bold text-[10px]">
                          {item.kategori}
                        </span>
                        <span className="font-extrabold text-slate-900 text-sm">{item.judul}</span>
                      </div>
                      <span className="text-slate-400 font-mono text-[10px] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.tanggal}
                      </span>
                    </div>

                    <p className="text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                      {item.pesan}
                    </p>

                    {item.tanggapanPengasuh ? (
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1 mt-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-emerald-950 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                            Tanggapan Sekretaris / Admin:
                          </span>
                          <span className="text-[10px] text-emerald-800 font-mono">
                            {item.tanggalTanggapan}
                          </span>
                        </div>
                        <p className="text-emerald-900 leading-relaxed font-medium">
                          {item.tanggapanPengasuh}
                        </p>
                      </div>
                    ) : (
                      <div className="text-[10px] text-amber-700 italic flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Menunggu telaah Sekretaris / Admin...</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW UNTUK ADMIN */}
      {isAdmin && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-emerald-700" />
              <span className="font-bold text-slate-700">Filter Kategori:</span>
              <select
                value={filterKategori}
                onChange={(e) => setFilterKategori(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
              >
                <option value="Semua">Semua Kategori</option>
                <option value="Kurikulum">Kurikulum</option>
                <option value="Kedisiplinan">Kedisiplinan</option>
                <option value="Fasilitas">Fasilitas</option>
                <option value="Santri">Santri</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowArchived(!showArchived)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                  showArchived
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Archive className="w-3.5 h-3.5" />
                <span>{showArchived ? 'Menampilkan Kotak Arsip' : 'Lihat Kotak Arsip'}</span>
              </button>
            </div>
          </div>

          {/* Kotak Masuk List */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Inbox className="w-4 h-4 text-emerald-700" />
                <span>
                  {showArchived ? 'Arsip Masukan' : 'Kotak Masuk Saran Asatidz'} ({adminItems.length})
                </span>
              </h2>
            </div>

            {adminItems.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                Tidak ada pesan kritik atau saran pada folder ini.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {adminItems.map((item) => (
                  <div
                    key={item.id}
                    className={`p-5 transition-colors space-y-3 ${
                      item.dibaca ? 'bg-white' : 'bg-emerald-50/30'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-slate-900 text-sm">{item.namaGuru}</span>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded font-bold text-[10px]">
                          {item.kategori}
                        </span>
                        {!item.dibaca && (
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full font-bold text-[9px] uppercase">
                            Baru
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">{item.tanggal}</span>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-slate-800 text-xs mb-1">{item.judul}</h3>
                      <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                        {item.pesan}
                      </p>
                    </div>

                    {item.tanggapanPengasuh && (
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
                        <span className="font-bold flex items-center gap-1 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                          Tanggapan Anda:
                        </span>
                        <p className="leading-relaxed">{item.tanggapanPengasuh}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-1 text-xs">
                      {!item.dibaca && (
                        <button
                          onClick={() => handleToggleRead(item.id)}
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Tandai Dibaca</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setBalasModalItem(item);
                          setTeksBalasan(item.tanggapanPengasuh || '');
                        }}
                        className="px-3 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Reply className="w-3.5 h-3.5" />
                        <span>{item.tanggapanPengasuh ? 'Edit Tanggapan' : 'Tanggapi'}</span>
                      </button>

                      <button
                        onClick={() => handleToggleArchive(item.id)}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Archive className="w-3.5 h-3.5" />
                        <span>{item.arsip ? 'Buka Arsip' : 'Arsipkan'}</span>
                      </button>

                      <button
                        onClick={() => handleDelete(item.id)}
                        className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Balasan Admin */}
      {balasModalItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Reply className="w-4 h-4 text-emerald-700" />
              <span>Beri Tanggapan Resmi ke {balasModalItem.namaGuru}</span>
            </h3>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-800">{balasModalItem.judul}</span>
              <p className="text-slate-600 mt-1 text-[11px] line-clamp-3">{balasModalItem.pesan}</p>
            </div>

            <form onSubmit={handleSaveBalasan} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tanggapan Sekretaris / Admin <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={teksBalasan}
                  onChange={(e) => setTeksBalasan(e.target.value)}
                  placeholder="Tuliskan arahan, tindak lanjut, atau apresiasi kepada asatidz..."
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBalasModalItem(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Tanggapan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
