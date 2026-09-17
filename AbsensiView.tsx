import React, { useMemo, useState } from 'react';
import { ClipboardCheck, Printer, Save, Search } from 'lucide-react';
import { SesiAbsensi, UserProfile } from '../types';
import { DATA_SISWA_247 } from '../data/students247Data';
import { ABSENSI_EXCEL_SEED, KodeAbsensi } from '../data/attendanceSeed';

interface AbsensiViewProps {
  session?: SesiAbsensi;
  onSaveSession?: (updatedSession: SesiAbsensi) => void;
  userRole?: string;
  currentUser?: UserProfile;
}

type CellMap = Record<string, KodeAbsensi | ''>;
const STORAGE_KEY = 'annajiyah_v2_absensi_matrix';
const kelasList = ['1A','1B','2A','2B','3A','3B','3C','4A','4B','5A','5B','6'];
const months = [
  { year: 2026, month: 7, label: 'Juli 2026' },
  { year: 2026, month: 8, label: 'Agustus 2026' },
  { year: 2026, month: 9, label: 'September 2026' },
  { year: 2026, month: 10, label: 'Oktober 2026' },
  { year: 2026, month: 11, label: 'November 2026' },
  { year: 2026, month: 12, label: 'Desember 2026' },
  { year: 2027, month: 1, label: 'Januari 2027' },
  { year: 2027, month: 2, label: 'Februari 2027' },
  { year: 2027, month: 3, label: 'Maret 2027' },
  { year: 2027, month: 4, label: 'April 2027' },
];

const keyOf = (kelas:string, year:number, month:number, day:number, nis:string) => `${kelas}|${year}|${month}|${day}|${nis}`;

const loadInitial = (): CellMap => {
  const seeded: CellMap = {};
  for (const [kelas, year, month, day, nis, status] of ABSENSI_EXCEL_SEED) {
    seeded[keyOf(kelas, year, month, day, nis)] = status;
  }
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return { ...seeded, ...saved };
  } catch {
    return seeded;
  }
};

export const AbsensiView: React.FC<AbsensiViewProps> = ({ userRole = 'Guru', currentUser }) => {
  const isSiswa = userRole.toLowerCase() === 'siswa';
  const canEdit = !isSiswa;
  const ownNis = (currentUser?.nipOrNis || '').replace(/\D/g, '');
  const ownClass = (currentUser?.kelas || '').replace(/^Kelas\s+/i, '');
  const [kelas, setKelas] = useState(ownClass && kelasList.includes(ownClass) ? ownClass : '1A');
  const [period, setPeriod] = useState(0);
  const [query, setQuery] = useState('');
  const [cells, setCells] = useState<CellMap>(loadInitial);
  const [saved, setSaved] = useState(false);

  const { year, month, label } = months[period];
  const days = new Date(year, month, 0).getDate();

  const students = useMemo(() => DATA_SISWA_247.filter((s) => {
    if (isSiswa && ownNis && s.nis.replace(/\D/g,'') !== ownNis) return false;
    if (!isSiswa && s.kelas !== kelas) return false;
    if (isSiswa && !ownNis && ownClass && s.kelas !== ownClass) return false;
    const q = query.trim().toLowerCase();
    return !q || s.nama.toLowerCase().includes(q) || s.nis.toLowerCase().includes(q);
  }), [kelas, query, isSiswa, ownNis, ownClass]);

  const setStatus = (rowClass:string, nis:string, day:number, status:KodeAbsensi|'') => {
    if (!canEdit) return;
    setCells((prev) => ({ ...prev, [keyOf(rowClass,year,month,day,nis)]: status }));
    setSaved(false);
  };

  const count = (rowClass:string, nis:string, status:KodeAbsensi) => Array.from({length:days},(_,i)=>i+1)
    .filter((d)=>cells[keyOf(rowClass,year,month,d,nis)] === status).length;

  const simpan = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cells));
    setSaved(true);
    setTimeout(()=>setSaved(false),2500);
  };

  return (
    <div className="space-y-5 pb-12">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2"><ClipboardCheck className="w-6 h-6 text-emerald-700"/>Absensi Santri</h1>
          <p className="text-sm text-slate-500 mt-1">Format bulanan mengikuti lembar kelas pada workbook administrasi akademik.</p>
        </div>
        <div className="flex gap-2">
          {canEdit && <button onClick={simpan} className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-4 py-2 text-sm font-bold text-white"><Save className="w-4 h-4"/>Simpan</button>}
          <button onClick={()=>window.print()} className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2 text-sm font-bold"><Printer className="w-4 h-4"/>Cetak</button>
        </div>
      </div>

      {saved && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">Perubahan absensi berhasil disimpan.</div>}

      <div className="rounded-2xl border bg-white p-4 grid gap-3 md:grid-cols-3">
        {!isSiswa && <select value={kelas} onChange={(e)=>setKelas(e.target.value)} className="rounded-xl border px-3 py-2.5 text-sm">{kelasList.map(k=><option key={k} value={k}>Kelas {k}</option>)}</select>}
        <select value={period} onChange={(e)=>setPeriod(Number(e.target.value))} className="rounded-xl border px-3 py-2.5 text-sm">{months.map((m,i)=><option key={m.label} value={i}>{m.label}</option>)}</select>
        <div className="relative"><Search className="absolute left-3 top-3 w-4 h-4 text-slate-400"/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Cari nama / NIS" className="w-full rounded-xl border py-2.5 pl-9 pr-3 text-sm"/></div>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
        Sel harian mengikuti isi eksplisit workbook. Rekap S, I, dan A dihitung dari kode pada sel. Kolom H mengikuti rumus workbook resmi: jumlah hari kalender pada bulan dikurangi S, I, dan A. Karena rumus sumber bekerja demikian, sel harian yang kosong tetap tampak kosong tetapi ikut terhitung pada rekap H.
      </div>

      <div className="rounded-2xl border bg-white overflow-hidden">
        <div className="px-4 py-3 border-b font-black text-slate-800">Kelas {isSiswa ? (ownClass || students[0]?.kelas || '-') : kelas} — {label}</div>
        <div className="overflow-x-auto">
          <table className="min-w-[1500px] w-full border-collapse text-[11px]">
            <thead className="bg-slate-100">
              <tr><th className="border p-2">No</th><th className="border p-2">NIS</th><th className="border p-2 text-left min-w-56">Nama</th>{Array.from({length:days},(_,i)=><th key={i} className="border p-1 min-w-10">{i+1}</th>)}<th className="border p-2">S</th><th className="border p-2">I</th><th className="border p-2">A</th><th className="border p-2">H</th></tr>
            </thead>
            <tbody>
              {students.map((s,idx)=>{
                const rowClass = isSiswa ? s.kelas : kelas;
                const sk = count(rowClass,s.nis,'S'), iz = count(rowClass,s.nis,'I'), al = count(rowClass,s.nis,'A');
                const h = Math.max(0, days - sk - iz - al);
                return <tr key={s.nis}><td className="border p-2 text-center">{idx+1}</td><td className="border p-2 text-center font-mono">{s.nis}</td><td className="border p-2 font-semibold">{s.nama}</td>{Array.from({length:days},(_,i)=>{const d=i+1; const k=keyOf(rowClass,year,month,d,s.nis); const v=cells[k]||''; return <td key={d} className="border p-0 text-center">{canEdit ? <select aria-label={`Absensi ${s.nama} tanggal ${d}`} value={v} onChange={(e)=>setStatus(rowClass,s.nis,d,e.target.value as KodeAbsensi|'')} className="w-full bg-transparent p-1 text-center font-bold"><option value=""></option><option value="H">H</option><option value="S">S</option><option value="I">I</option><option value="A">A</option></select> : <span className="font-bold">{v}</span>}</td>})}<td className="border p-2 text-center font-bold">{sk}</td><td className="border p-2 text-center font-bold">{iz}</td><td className="border p-2 text-center font-bold">{al}</td><td className="border p-2 text-center font-bold">{h}</td></tr>
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};