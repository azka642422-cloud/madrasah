import React, { useMemo, useState } from 'react';
import { CheckCircle2, Edit2, GraduationCap, Printer, Save, X } from 'lucide-react';
import { MAPEL_RESMI_PER_KELAS } from './madinData';
import { storageService } from './storageServiceProduction';
import { academicGradeService, AcademicGradeRecord, AcademicMapelScore } from './academicGradeService';
import { UserProfile } from './types';

interface RaportViewProps { currentUser?: UserProfile; userRole?: string; }
const EMPTY = '—';
const val = (v?: number | null) => typeof v === 'number' ? v : EMPTY;
const numeric = (v?: number | null) => typeof v === 'number' ? v : null;
const formatAverage = (v: number) => Number.isInteger(v) ? String(v) : v.toFixed(2).replace(/0+$/, '').replace(/\.$/, '').replace('.', ',');

export const RaportView: React.FC<RaportViewProps> = ({ currentUser, userRole = 'Guru' }) => {
  const isSiswa = userRole.toLowerCase() === 'siswa';
  const canEdit = !isSiswa;
  const students = storageService.getStudents();
  const tahunAjaran = storageService.getTahunAjaran();
  const semester = storageService.getSemester();
  const signatures = storageService.getSignaturesAndMusrif();
  const [selectedNis, setSelectedNis] = useState(() => {
    if (isSiswa && currentUser) {
      const nis = (currentUser.nipOrNis || '').replace(/\D/g, '');
      return students.find(s => s.nis.replace(/\D/g, '') === nis)?.nis || '';
    }
    return students[0]?.nis || '';
  });
  const [editing, setEditing] = useState<AcademicGradeRecord | null>(null);
  const [toast, setToast] = useState('');
  const [, force] = useState(0);

  const selected = useMemo(() => {
    if (isSiswa && currentUser) {
      const nis = (currentUser.nipOrNis || '').replace(/\D/g, '');
      return students.find(s => s.nis.replace(/\D/g, '') === nis || s.nama.toLowerCase() === currentUser.name.toLowerCase()) || null;
    }
    return students.find(s => s.nis === selectedNis) || null;
  }, [students, selectedNis, isSiswa, currentUser]);

  const defaults = useMemo<AcademicMapelScore[]>(() => {
    const tingkat = selected?.kelas.replace(/\D/g, '') || '1';
    const cfg = MAPEL_RESMI_PER_KELAS[tingkat] || MAPEL_RESMI_PER_KELAS['1'];
    const list = semester === 'Ganjil' ? cfg.ganjil : cfg.genap;
    return list.map((m, i) => ({ no: i + 1, mapel: m.mapel, kitab: m.kitab, nilai: null }));
  }, [selected, semester]);

  const record = selected ? academicGradeService.get(selected.nis, tahunAjaran, semester, defaults) : null;
  const mapelNums = record?.mapelScores.map(m => numeric(m.nilai)).filter((n): n is number => n !== null) || [];
  const total = mapelNums.length ? mapelNums.reduce((a, b) => a + b, 0) : null;
  const avg = mapelNums.length ? formatAverage(mapelNums.reduce((a, b) => a + b, 0) / mapelNums.length) : null;
  const soreNums = record?.pengajianSore.map(r => numeric(r.nilai)).filter((n): n is number => n !== null) || [];
  const soreTotal = soreNums.length ? soreNums.reduce((a, b) => a + b, 0) : null;
  const soreAvg = soreNums.length ? formatAverage(soreNums.reduce((a, b) => a + b, 0) / soreNums.length) : null;
  const classCount = record?.jumlahSiswa ?? (selected ? students.filter(s => s.kelas === selected.kelas).length : null);
  const waliKelas = record?.waliKelas || signatures.musrifPerKelas?.[selected?.kelas || ''] || '';

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    academicGradeService.save(editing);
    setEditing(null);
    force(n => n + 1);
    setToast('Data raport berhasil disimpan.');
    setTimeout(() => setToast(''), 2500);
  };

  if (!selected || !record) return <div className="rounded-2xl border bg-white p-8 text-center text-sm text-slate-500">Belum ada data santri.</div>;

  return <div className="space-y-5 pb-12">
    {toast && <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-emerald-900 px-4 py-3 text-xs font-bold text-white"><CheckCircle2 className="mr-2 inline h-4 w-4" />{toast}</div>}
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
      <div><h1 className="flex items-center gap-2 text-2xl font-black"><GraduationCap className="h-6 w-6 text-emerald-700" />Raport Santri</h1><p className="text-xs text-slate-500">Format mengikuti sumber raport resmi. Data kosong tidak diisi otomatis.</p></div>
      <div className="flex gap-2">{canEdit && <button onClick={() => setEditing(JSON.parse(JSON.stringify(record)))} className="rounded-xl bg-amber-400 px-4 py-2 text-xs font-black"><Edit2 className="mr-1 inline h-4 w-4" />Edit</button>}<button onClick={() => window.print()} className="rounded-xl bg-emerald-800 px-4 py-2 text-xs font-bold text-white"><Printer className="mr-1 inline h-4 w-4" />Cetak</button></div>
    </div>
    {!isSiswa && <div className="rounded-2xl border bg-white p-4 print:hidden"><select value={selectedNis} onChange={e => setSelectedNis(e.target.value)} className="w-full rounded-xl border bg-slate-50 px-3 py-2 text-xs font-bold sm:w-96">{students.map(s => <option key={s.nis} value={s.nis}>{s.nama} — Kelas {s.kelas} — {s.nis}</option>)}</select></div>}

    <section className="raport-sheet relative mx-auto min-h-[297mm] w-full max-w-[210mm] overflow-hidden bg-white px-[14mm] py-[10mm] font-serif text-black shadow-xl print:m-0 print:min-h-[297mm] print:w-[210mm] print:max-w-none print:shadow-none">
      <div className="pointer-events-none absolute inset-0 overflow-hidden text-[10px] font-sans font-bold leading-[17px] text-emerald-700 opacity-[0.09]" aria-hidden="true">{Array.from({ length: 120 }, (_, i) => <span key={i}>MADRASAH DINIYAH TAKMILIYAH AN-NAJIYAH 2 </span>)}</div>
      <img src="/logo.png" alt="" className="pointer-events-none absolute left-1/2 top-[54%] w-[115mm] -translate-x-1/2 -translate-y-1/2 opacity-[0.13]" />
      <div className="relative z-10">
        <header className="mb-7 text-center text-[16px] leading-tight"><div className="font-bold">LAPORAN HASIL PENILAIAN PESERTA DIDIK</div><div className="font-bold">MADRASAH DINIYAH TAKMILIYAH PP. AN-NAJIYAH 2 BAHRUL ULUM</div><div className="font-bold">TAHUN AJARAN {tahunAjaran || EMPTY}</div></header>
        <div className="mb-2 grid grid-cols-2 text-[14px]"><div>Nama : <b>{selected.nama}</b></div><div className="text-right">Semester : <b>{semester === 'Ganjil' ? '1 (Ganjil)' : '2 (Genap)'}</b></div><div>Kelas : <b>{selected.kelas}</b></div></div>
        <table className="w-full border-collapse text-[13px]"><thead><tr><th className="border border-black px-1">No</th><th className="border border-black px-1">Mata Pelajaran</th><th className="border border-black px-1">Kitab</th><th className="border border-black px-1">Nilai</th></tr></thead><tbody>{record.mapelScores.map(m => <tr key={m.no}><td className="border border-black px-1 text-center">{m.no}</td><td className="border border-black px-2">{m.mapel}</td><td className="border border-black px-2 text-center">{m.kitab}</td><td className="border border-black px-1 text-center">{val(m.nilai)}</td></tr>)}<tr><td colSpan={3} className="border border-black px-2 text-center">Jumlah nilai ujian tulis</td><td className="border border-black text-center">{total ?? EMPTY}</td></tr><tr><td colSpan={3} className="border border-black px-2 text-center">Rata-rata nilai ujian tulis</td><td className="border border-black text-center">{avg ?? EMPTY}</td></tr></tbody></table>
        <div className="border-x border-black py-1 text-center text-[14px] font-bold">UJIAN MUHAFADZOH</div>
        <table className="w-full border-collapse text-[13px]"><thead><tr><th className="border border-black px-1">No</th><th className="border border-black px-1">Kitab</th><th className="border border-black px-1">Batasan</th><th className="border border-black px-1">Jumlah Nilai</th></tr></thead><tbody><tr><td className="border border-black text-center">1</td><td className="border border-black px-2 text-center">{record.muhafadzoh.kitab || EMPTY}</td><td className="border border-black px-2 text-center">{record.muhafadzoh.batasan || EMPTY}</td><td className="border border-black text-center">{val(record.muhafadzoh.jumlahNilai)}</td></tr><tr><td colSpan={3} className="border border-black text-center">Rata-rata nilai muhafadzoh</td><td className="border border-black text-center">{val(record.muhafadzoh.rataRata)}</td></tr><tr><td colSpan={4} className="border border-black text-center">Peringkat {record.ranking ? `${record.ranking} dari ${classCount || EMPTY} siswa` : EMPTY}</td></tr></tbody></table>
        <div className="mt-4 w-[50%] text-[13px]"><table className="w-full border-collapse"><thead><tr><th colSpan={3} className="border border-black py-1">UJIAN PENGAJIAN SORE</th></tr></thead><tbody>{record.pengajianSore.map(row => <tr key={row.no}><td className="border border-black text-center">{row.no}</td><td className="border border-black px-2"></td><td className="border border-black text-center">{val(row.nilai)}</td></tr>)}<tr><td colSpan={2} className="border border-black text-center">Jumlah</td><td className="border border-black text-center">{soreTotal ?? EMPTY}</td></tr><tr><td colSpan={2} className="border border-black text-center">Rata-rata</td><td className="border border-black text-center">{soreAvg ?? EMPTY}</td></tr></tbody></table></div>
        <div className="mt-4 w-[70%] text-[13px]"><div className="border border-black py-1 text-center font-bold">LAIN-LAIN</div><table className="w-full border-collapse"><tbody><tr><td className="border border-black text-center">1</td><td className="border border-black px-2">Kelakuan</td><td className="border border-black text-center">{record.kelakuan || EMPTY}</td><td className="border border-black text-center">1</td><td className="border border-black px-2">Sakit</td><td className="border border-black text-center">{record.absensi.sakit ?? EMPTY}</td></tr><tr><td className="border border-black text-center">2</td><td className="border border-black px-2">Kerajinan</td><td className="border border-black text-center">{record.kerajinan || EMPTY}</td><td className="border border-black text-center">2</td><td className="border border-black px-2">Izin</td><td className="border border-black text-center">{record.absensi.izin ?? EMPTY}</td></tr><tr><td className="border border-black text-center">3</td><td className="border border-black px-2">Kerapian</td><td className="border border-black text-center">{record.kerapian || EMPTY}</td><td className="border border-black text-center">3</td><td className="border border-black px-2">Tanpa keterangan</td><td className="border border-black text-center">{record.absensi.tanpaKeterangan ?? EMPTY}</td></tr></tbody></table></div>
        <div className="mt-4 text-[13px]"><div><b>Catatan :</b> {record.catatan || ''}</div><div className="mt-7"><b>Keputusan:</b><br />{record.keputusan || '........................................................................................................................'}</div></div>
        <div className="mt-10 grid grid-cols-3 text-center text-[13px]"><div><div>Jombang, {signatures.titimangsaRaport || '........................'}</div><div>Wali Kelas</div><div className="h-20"></div><div className="font-bold">{waliKelas || '........................'}</div></div><div><div>Mengetahui,</div><div>Kepala Madrasah</div><div className="h-20"></div><div className="font-bold">{signatures.namaKepalaMadrasah || '........................'}</div></div><div><div className="h-[18px]"></div><div>Wali Murid</div><div className="h-20"></div><div>........................</div></div></div>
      </div>
    </section>

    {editing && <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 p-4 print:hidden"><form onSubmit={save} className="mx-auto my-6 max-w-3xl rounded-3xl bg-white p-6"><div className="flex justify-between"><div><h3 className="font-black">Edit Raport — {selected.nama}</h3><p className="text-xs text-slate-500">Data kosong tetap kosong; tidak ada nilai demo otomatis.</p></div><button type="button" onClick={() => setEditing(null)}><X className="h-5 w-5" /></button></div><div className="mt-4 space-y-2 text-xs">{editing.mapelScores.map((m, i) => <label key={m.no} className="grid grid-cols-[1fr_100px] items-center gap-3"><span><b>{m.mapel}</b> — {m.kitab}</span><input type="number" min="0" max="100" value={m.nilai ?? ''} onChange={e => setEditing({ ...editing, mapelScores: editing.mapelScores.map((x, j) => j === i ? { ...x, nilai: e.target.value === '' ? null : Number(e.target.value) } : x) })} className="rounded-lg border px-2 py-1.5" /></label>)}</div><div className="mt-4 grid gap-3 sm:grid-cols-2 text-xs"><TextField label="Kitab Muhafadzoh" value={editing.muhafadzoh.kitab} set={v => setEditing({ ...editing, muhafadzoh: { ...editing.muhafadzoh, kitab: v } })} /><TextField label="Batasan Muhafadzoh" value={editing.muhafadzoh.batasan} set={v => setEditing({ ...editing, muhafadzoh: { ...editing.muhafadzoh, batasan: v } })} /><NumberField label="Jumlah Nilai Muhafadzoh" value={editing.muhafadzoh.jumlahNilai} set={v => setEditing({ ...editing, muhafadzoh: { ...editing.muhafadzoh, jumlahNilai: v } })} /><NumberField label="Rata-rata Muhafadzoh" value={editing.muhafadzoh.rataRata} set={v => setEditing({ ...editing, muhafadzoh: { ...editing.muhafadzoh, rataRata: v } })} />{editing.pengajianSore.map((row, i) => <NumberField key={row.no} label={`Pengajian Sore ${row.no}`} value={row.nilai} set={v => setEditing({ ...editing, pengajianSore: editing.pengajianSore.map((x, j) => j === i ? { ...x, nilai: v } : x) })} />)}<NumberField label="Peringkat" value={editing.ranking} set={v => setEditing({ ...editing, ranking: v })} /><NumberField label="Jumlah Siswa" value={editing.jumlahSiswa} set={v => setEditing({ ...editing, jumlahSiswa: v })} /><NumberField label="Sakit" value={editing.absensi.sakit} set={v => setEditing({ ...editing, absensi: { ...editing.absensi, sakit: v } })} /><NumberField label="Izin" value={editing.absensi.izin} set={v => setEditing({ ...editing, absensi: { ...editing.absensi, izin: v } })} /><NumberField label="Tanpa Keterangan" value={editing.absensi.tanpaKeterangan} set={v => setEditing({ ...editing, absensi: { ...editing.absensi, tanpaKeterangan: v } })} /></div><div className="mt-3 grid gap-3 sm:grid-cols-3"><TextField label="Kelakuan" value={editing.kelakuan} set={v => setEditing({ ...editing, kelakuan: v })} /><TextField label="Kerajinan" value={editing.kerajinan} set={v => setEditing({ ...editing, kerajinan: v })} /><TextField label="Kerapian" value={editing.kerapian} set={v => setEditing({ ...editing, kerapian: v })} /></div><TextField label="Wali Kelas" value={editing.waliKelas} set={v => setEditing({ ...editing, waliKelas: v })} /><label className="mt-3 block text-xs font-bold">Catatan<textarea value={editing.catatan} onChange={e => setEditing({ ...editing, catatan: e.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2" /></label><label className="mt-3 block text-xs font-bold">Keputusan<textarea value={editing.keputusan} onChange={e => setEditing({ ...editing, keputusan: e.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2" /></label><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setEditing(null)} className="rounded-xl border px-4 py-2 text-xs font-bold">Batal</button><button className="rounded-xl bg-emerald-800 px-4 py-2 text-xs font-bold text-white"><Save className="mr-1 inline h-4 w-4" />Simpan</button></div></form></div>}
    <style>{`@media print{body *{visibility:hidden}.raport-sheet,.raport-sheet *{visibility:visible}.raport-sheet{position:absolute;left:0;top:0}@page{size:A4 portrait;margin:0}}`}</style>
  </div>;
};

const NumberField = ({ label, value, set }: { label: string; value: number | null; set: (v: number | null) => void }) => <label className="font-bold">{label}<input type="number" min="0" value={value ?? ''} onChange={e => set(e.target.value === '' ? null : Number(e.target.value))} className="mt-1 w-full rounded-lg border px-3 py-2" /></label>;
const TextField = ({ label, value, set }: { label: string; value: string; set: (v: string) => void }) => <label className="mt-3 block text-xs font-bold">{label}<input value={value} onChange={e => set(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2" /></label>;
