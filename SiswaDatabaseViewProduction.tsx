import React, { useMemo, useState } from 'react';
import { Search, User } from 'lucide-react';
import { storageService } from './storageServiceProduction';

interface Props { userRole?: string; }
export const SiswaDatabaseView: React.FC<Props> = ({userRole='Guru'}) => {
  const [query,setQuery]=useState('');
  const students=storageService.getStudents();
  const rows=useMemo(()=>{const q=query.trim().toLowerCase();return students.filter(s=>!q||s.nama.toLowerCase().includes(q)||s.nis.toLowerCase().includes(q)||s.kelas.toLowerCase().includes(q));},[students,query]);
  const isAdmin=String(userRole).toLowerCase()==='admin';
  return <div className="space-y-5"><header><h1 className="text-2xl font-black">Database Santri</h1><p className="mt-1 text-xs text-slate-500">Master identitas santri tersimpan. Data kosong tidak diisi dengan contoh.</p></header><div className="relative max-w-xl"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Cari nama, NIS, atau kelas" className="w-full rounded-xl border bg-white py-2.5 pl-9 pr-3 text-sm"/></div><div className="overflow-x-auto rounded-2xl border bg-white"><table className="w-full border-collapse text-xs"><thead><tr className="bg-slate-50"><th className="border-b p-3 text-left">Santri</th><th className="border-b p-3">NIS</th><th className="border-b p-3">Kelas</th><th className="border-b p-3">Status</th></tr></thead><tbody>{rows.length===0?<tr><td colSpan={4} className="p-8 text-center text-slate-400">Belum ada data santri yang sesuai.</td></tr>:rows.map(s=><tr key={s.nis}><td className="border-b p-3"><div className="flex items-center gap-2">{s.foto?<img src={s.foto} alt={s.nama} className="h-9 w-9 rounded-lg object-cover"/>:<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100"><User className="h-4 w-4 text-slate-400"/></div>}<span className="font-bold">{s.nama}</span></div></td><td className="border-b p-3 text-center font-mono">{s.nis}</td><td className="border-b p-3 text-center">{s.kelas}</td><td className="border-b p-3 text-center">{s.status||'—'}</td></tr>)}</tbody></table></div>{isAdmin&&<p className="text-[11px] text-slate-500">Pengeditan master akan dipindahkan ke API/MySQL; tampilan ini tidak membuat data contoh di browser.</p>}</div>;
};
