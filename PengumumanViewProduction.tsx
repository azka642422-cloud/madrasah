import React, { useMemo, useState } from 'react';
import { Bell, Plus, Trash2, X } from 'lucide-react';

type Pengumuman={id:string;judul:string;isi:string;tanggal:string;target:'Semua'|'Guru'|'Santri'};
const KEY='annajiyah_v2_pengumuman_production';
const read=():Pengumuman[]=>{try{const raw=localStorage.getItem(KEY);return raw?JSON.parse(raw):[]}catch{return[]}};
const write=(items:Pengumuman[])=>{try{localStorage.setItem(KEY,JSON.stringify(items))}catch{}};

export const PengumumanView:React.FC<{userRole?:string}>=({userRole='Guru'})=>{
  const isAdmin=userRole.toLowerCase()==='admin';
  const role=userRole.toLowerCase()==='siswa'?'Santri':'Guru';
  const [items,setItems]=useState<Pengumuman[]>(read);
  const [show,setShow]=useState(false); const [judul,setJudul]=useState(''); const [isi,setIsi]=useState(''); const [target,setTarget]=useState<Pengumuman['target']>('Semua');
  const visible=useMemo(()=>items.filter(x=>x.target==='Semua'||x.target===role),[items,role]);
  const save=(e:React.FormEvent)=>{e.preventDefault();if(!isAdmin||!judul.trim()||!isi.trim())return;const next=[{id:`peng-${Date.now()}`,judul:judul.trim(),isi:isi.trim(),tanggal:new Date().toISOString().slice(0,10),target},...items];setItems(next);write(next);setJudul('');setIsi('');setTarget('Semua');setShow(false)};
  const remove=(id:string)=>{if(!isAdmin)return;const next=items.filter(x=>x.id!==id);setItems(next);write(next)};
  return <div className="space-y-6 pb-12">
    <div className="flex items-end justify-between gap-4"><div><h1 className="flex items-center gap-2 text-2xl font-black text-slate-900"><Bell className="h-6 w-6 text-emerald-700"/>Maklumat & Pengumuman Madrasah</h1><p className="mt-1 text-xs text-slate-500">Hanya pengumuman yang dibuat administrator yang ditampilkan.</p></div>{isAdmin&&<button onClick={()=>setShow(true)} className="rounded-xl bg-emerald-800 px-4 py-2 text-xs font-bold text-white"><Plus className="mr-1 inline h-4 w-4"/>Buat Pengumuman</button>}</div>
    {visible.length===0?<div className="rounded-3xl border bg-white p-10 text-center text-sm text-slate-500">Belum ada pengumuman resmi.</div>:<div className="space-y-3">{visible.map(x=><article key={x.id} className="rounded-2xl border bg-white p-5"><div className="flex justify-between gap-4"><div><div className="font-black text-slate-900">{x.judul}</div><div className="mt-1 text-[11px] text-slate-500">{x.tanggal} · Untuk {x.target}</div><p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{x.isi}</p></div>{isAdmin&&<button onClick={()=>remove(x.id)} className="h-8 w-8 shrink-0 rounded-lg bg-rose-50 text-rose-700"><Trash2 className="mx-auto h-4 w-4"/></button>}</div></article>)}</div>}
    {show&&isAdmin&&<div className="fixed inset-0 z-50 bg-slate-950/60 p-4"><form onSubmit={save} className="mx-auto mt-16 max-w-xl rounded-3xl bg-white p-6"><div className="flex items-center justify-between"><h3 className="font-black">Buat Pengumuman Resmi</h3><button type="button" onClick={()=>setShow(false)}><X className="h-5 w-5"/></button></div><div className="mt-4 space-y-3"><input value={judul} onChange={e=>setJudul(e.target.value)} placeholder="Judul pengumuman" className="w-full rounded-xl border px-3 py-2.5 text-sm"/><select value={target} onChange={e=>setTarget(e.target.value as Pengumuman['target'])} className="w-full rounded-xl border px-3 py-2.5 text-sm"><option>Semua</option><option>Guru</option><option>Santri</option></select><textarea rows={7} value={isi} onChange={e=>setIsi(e.target.value)} placeholder="Isi pengumuman" className="w-full rounded-xl border p-3 text-sm"/><div className="flex justify-end gap-2"><button type="button" onClick={()=>setShow(false)} className="px-4 py-2 text-xs font-bold">Batal</button><button className="rounded-xl bg-emerald-800 px-4 py-2 text-xs font-bold text-white">Publikasikan</button></div></div></form></div>}
  </div>;
};
