import React, { useMemo, useState } from 'react';
import { BookMarked, Printer, Search, Save } from 'lucide-react';
import { SiswaMuhafadzoh, UserProfile } from '../types';
import { storageService } from '../services/storageService';
import { TARGET_MUHAFADZOH_RULES } from '../data/muhafadzohRules';

interface MuhafadzohViewProps {
  userRole?: string;
  currentUser?: UserProfile;
}

const capaianKeys = ['capaian1','capaian2','capaian3','capaian4','capaian5','capaian6','capaian7','capaian8'] as const;
const targetKeys = ['target1','target2','target3','target4','target5','target6','target7','target8'] as const;

const hitung = (s: SiswaMuhafadzoh) => {
  const capaian = capaianKeys.map((k) => Number(s[k] ?? 0));
  const target = targetKeys.map((k) => Number(s[k] ?? 0));
  const totalCapaian = capaian.reduce((a,b) => a + b, 0);
  const totalTarget = target.reduce((a,b) => a + b, 0);
  const persen = totalTarget > 0 ? Math.round((totalCapaian / totalTarget) * 100) : 0;
  return { totalCapaian, totalTarget, persen, status: persen >= 100 ? 'Tercapai' : 'Belum Memenuhi' };
};

export const MuhafadzohView: React.FC<MuhafadzohViewProps> = ({ userRole = 'Guru', currentUser }) => {
  const canEdit = userRole.toLowerCase() !== 'siswa';
  const [students, setStudents] = useState<SiswaMuhafadzoh[]>(() => storageService.getMuhafadzohList());
  const [kelas, setKelas] = useState('Semua');
  const [cari, setCari] = useState('');
  const [tersimpan, setTersimpan] = useState(false);

  const classList = ['1A','1B','2A','2B','3A','3B','3C','4A','4B','5A','5B','6'];

  const visibleStudents = useMemo(() => {
    return students.filter((s) => {
      if (userRole.toLowerCase() === 'siswa' && currentUser?.nipOrNis && s.nis !== currentUser.nipOrNis) return false;
      if (kelas !== 'Semua' && s.kelas !== kelas) return false;
      const q = cari.trim().toLowerCase();
      return !q || s.nama.toLowerCase().includes(q) || s.nis.toLowerCase().includes(q);
    });
  }, [students, kelas, cari, userRole, currentUser]);

  const updateCapaian = (nis: string, index: number, value: string) => {
    if (!canEdit) return;
    const n = value === '' ? null : Math.max(0, Number(value));
    setStudents((prev) => prev.map((s) => s.nis === nis ? { ...s, [capaianKeys[index]]: n } : s));
    setTersimpan(false);
  };

  const simpan = () => {
    storageService.saveMuhafadzohList(students);
    setTersimpan(true);
    window.setTimeout(() => setTersimpan(false), 2500);
  };

  const ringkasan = useMemo(() => {
    const hasil = visibleStudents.map(hitung);
    return {
      jumlah: hasil.length,
      tercapai: hasil.filter((h) => h.status === 'Tercapai').length,
      belum: hasil.filter((h) => h.status !== 'Tercapai').length,
    };
  }, [visibleStudents]);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <BookMarked className="w-6 h-6 text-emerald-700" /> Muhafadhoh
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Rekap 8 kali pelaksanaan dalam satu tahun sesuai Buku Sosialisasi Madrasah Diniyyah Takmiliyah An-Najiyah 2.
          </p>
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <button onClick={simpan} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-800 text-white text-sm font-bold">
              <Save className="w-4 h-4" /> Simpan
            </button>
          )}
          <button onClick={() => window.print()} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-700">
            <Printer className="w-4 h-4" /> Cetak
          </button>
        </div>
      </div>

      {tersimpan && <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm font-bold text-emerald-800">Data Muhafadhoh berhasil disimpan.</div>}

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border bg-white p-4"><div className="text-xs text-slate-500">Santri</div><div className="text-2xl font-black">{ringkasan.jumlah}</div></div>
        <div className="rounded-2xl border bg-white p-4"><div className="text-xs text-slate-500">Target tercapai</div><div className="text-2xl font-black text-emerald-700">{ringkasan.tercapai}</div></div>
        <div className="rounded-2xl border bg-white p-4"><div className="text-xs text-slate-500">Belum memenuhi</div><div className="text-2xl font-black text-amber-700">{ringkasan.belum}</div></div>
      </div>

      <div className="rounded-2xl border bg-white p-4 grid sm:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input value={cari} onChange={(e) => setCari(e.target.value)} placeholder="Cari nama / NIS" className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
        </div>
        <select value={kelas} onChange={(e) => setKelas(e.target.value)} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm">
          <option value="Semua">Semua kelas</option>
          {classList.map((k) => <option key={k} value={k}>Kelas {k}</option>)}
        </select>
      </div>

      <div className="rounded-2xl border bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[1500px] w-full text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th rowSpan={2} className="border p-2">No</th>
                <th rowSpan={2} className="border p-2 text-left">Nama Santri</th>
                <th rowSpan={2} className="border p-2">NIS</th>
                <th rowSpan={2} className="border p-2">Kelas</th>
                <th rowSpan={2} className="border p-2 text-left">Materi</th>
                {Array.from({length:8},(_,i) => <th key={i} colSpan={2} className="border p-2">M{i+1}</th>)}
                <th rowSpan={2} className="border p-2">Total</th>
                <th rowSpan={2} className="border p-2">%</th>
                <th rowSpan={2} className="border p-2">Status</th>
              </tr>
              <tr>{Array.from({length:8},(_,i) => <React.Fragment key={i}><th className="border p-1">Target</th><th className="border p-1">Capaian</th></React.Fragment>)}</tr>
            </thead>
            <tbody>
              {visibleStudents.map((s, idx) => {
                const h = hitung(s);
                return (
                  <tr key={s.nis} className="hover:bg-slate-50">
                    <td className="border p-2 text-center">{idx+1}</td>
                    <td className="border p-2 font-bold text-slate-900">{s.nama}</td>
                    <td className="border p-2 text-center font-mono">{s.nis}</td>
                    <td className="border p-2 text-center font-bold">{s.kelas}</td>
                    <td className="border p-2">{s.materiMuhafadzoh || TARGET_MUHAFADZOH_RULES[s.tingkat]?.namaMateri}</td>
                    {Array.from({length:8},(_,i) => (
                      <React.Fragment key={i}>
                        <td className="border p-2 text-center bg-slate-50 font-bold">{Number(s[targetKeys[i]] ?? TARGET_MUHAFADZOH_RULES[s.tingkat]?.targetPerSetoran[i] ?? 0)}</td>
                        <td className="border p-1 text-center">
                          {canEdit ? (
                            <input type="number" min={0} value={s[capaianKeys[i]] ?? ''} onChange={(e) => updateCapaian(s.nis,i,e.target.value)} className="w-16 rounded border border-slate-200 px-1.5 py-1 text-center" />
                          ) : <span>{s[capaianKeys[i]] ?? '-'}</span>}
                        </td>
                      </React.Fragment>
                    ))}
                    <td className="border p-2 text-center font-black">{h.totalCapaian}/{h.totalTarget}</td>
                    <td className="border p-2 text-center font-black">{h.persen}%</td>
                    <td className="border p-2 text-center"><span className={`px-2 py-1 rounded-full font-bold ${h.status === 'Tercapai' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{h.status}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-5 space-y-4">
        <h2 className="font-black text-slate-900">Pedoman Muhafadhoh</h2>
        <p className="text-sm text-slate-600">Pelaksanaan menggunakan sistem beregu dan disimak oleh musrif. Penilaian dititikberatkan pada bacaan, hafalan materi, dan kelancaran secara umum.</p>
        <div className="grid md:grid-cols-2 gap-3">
          {Object.values(TARGET_MUHAFADZOH_RULES).map((r) => (
            <div key={r.tingkat} className="rounded-xl border border-slate-200 p-4">
              <div className="font-black">Kelas {r.tingkat} — {r.namaMateri}</div>
              <div className="mt-2 grid grid-cols-8 gap-1">
                {r.targetPerSetoran.map((t,i) => <div key={i} className="rounded bg-slate-100 text-center py-1"><div className="text-[10px] text-slate-500">M{i+1}</div><div className="font-bold">{t}</div></div>)}
              </div>
              <div className="text-xs text-slate-600 mt-2">{r.catatanKhusus}</div>
            </div>
          ))}
        </div>
        <div className="text-xs text-slate-500 border-t pt-3">
          Catatan sumber: pada kelas 5 dokumen menuliskan “Nadzom Qowaidus Shorfiyah Jilid 1 (80 Bait)”, sementara batas bulanan 11+11+10+10+10+10+10+10 berjumlah 82. Sistem mempertahankan batas M1–M8 sebagaimana tertulis dan menampilkan perbedaan tersebut, bukan mengubahnya diam-diam.
        </div>
      </div>
    </div>
  );
};
