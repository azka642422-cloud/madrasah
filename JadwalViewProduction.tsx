import React, { useState } from 'react';
import { Calendar, Camera, Plus, Save, Trash2, X } from 'lucide-react';
import { JadwalSlotItem, GuruJadwal } from './types';

interface JadwalViewProps { userRole?: string; }
const SLOT_KEY='annajiyah_v2_schedule_prod';
const GURU_KEY='annajiyah_v2_teachers_prod';
const HARI:JadwalSlotItem['hari'][]=["Jum'at",'Sabtu','Minggu','Selasa','Rabu'];
const KELAS=['1A','1B','2A','2B','3A','3B','3C','4A','4B','5A','5B','6'];
const GURU_RESMI:GuruJadwal[]=[
  {kode:1,nama:'Ust. M. Irham S. Pd.I.',warnaBadge:'bg-emerald-700 text-white'},
  {kode:2,nama:'Ust. Shidqi Fadli',warnaBadge:'bg-emerald-700 text-white'},
  {kode:3,nama:'Ust. Abdullah Faqih',warnaBadge:'bg-emerald-700 text-white'},
  {kode:4,nama:'Ust. Zainurrohim, M.pd.',warnaBadge:'bg-emerald-700 text-white'},
  {kode:5,nama:'Ust. M. Faza Azkannasr, M.p.d.',warnaBadge:'bg-emerald-700 text-white'},
  {kode:6,nama:'Ust. Rois Sekti Aji, S.Pd.',warnaBadge:'bg-emerald-700 text-white'},
  {kode:7,nama:'M. Firjaun Asrof Shiatsi, S.Ag.',warnaBadge:'bg-emerald-700 text-white'},
  {kode:8,nama:'Ust. Ach. Aldyansyah, S.Pd.',warnaBadge:'bg-emerald-700 text-white'},
  {kode:9,nama:'Ust. Fandany Riko, S.kom.',warnaBadge:'bg-emerald-700 text-white'},
  {kode:10,nama:'Ust. Wanto, S.Pd.I.',warnaBadge:'bg-emerald-700 text-white'},
  {kode:11,nama:'Ust. Dio Taufiqur Rohman',warnaBadge:'bg-emerald-700 text-white'},
  {kode:12,nama:'Ust. M. Fauzi Syahputra',warnaBadge:'bg-emerald-700 text-white'},
  {kode:13,nama:'Ust. Khairuddin',warnaBadge:'bg-emerald-700 text-white'},
  {kode:14,nama:'Nabiha Ahmad',warnaBadge:'bg-emerald-700 text-white'},
  {kode:15,nama:'M. Jalaluddin Al-Hasuni',warnaBadge:'bg-emerald-700 text-white'},
  {kode:16,nama:'M. Al-Fatih Pasya',warnaBadge:'bg-emerald-700 text-white'},
  {kode:17,nama:'Azka Muhammad Satria',warnaBadge:'bg-emerald-700 text-white'},
  {kode:18,nama:"Faiz Askiya'",warnaBadge:'bg-emerald-700 text-white'},
  {kode:19,nama:'Naufal Farel Alfaruq',warnaBadge:'bg-emerald-700 text-white'},
  {kode:20,nama:'Mahzumi Abdillah',warnaBadge:'bg-emerald-700 text-white'},
  {kode:21,nama:'Syahril Nasrullah Z.',warnaBadge:'bg-emerald-700 text-white'},
];
const load=<T,>(key:string,fallback:T):T=>{try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):fallback}catch{return fallback}};
const save=(key:string,value:unknown)=>{try{localStorage.setItem(key,JSON.stringify(value))}catch{}};
const loadGurus=():GuruJadwal[]=>{const saved=load<GuruJadwal[]>(GURU_KEY,[]);const byKode=new Map(saved.map(g=>[g.kode,g]));return GURU_RESMI.map(g=>({...g,...byKode.get(g.kode),kode:g.kode,nama:g.nama})).concat(saved.filter(g=>!GURU_RESMI.some(r=>r.kode===g.kode)));};

export const JadwalView:React.FC<JadwalViewProps>=({userRole='Guru'})=>{
  const isAdmin=userRole.toLowerCase()==='admin';
  const [slots,setSlots]=useState<JadwalSlotItem[]>(()=>load(SLOT_KEY,[]));
  const [gurus,setGurus]=useState<GuruJadwal[]>(loadGurus);
  const [showSlot,setShowSlot]=useState(false); const [showGuru,setShowGuru]=useState(false);
  const [kelas,setKelas]=useState('1A'); const [hari,setHari]=useState<JadwalSlotItem['hari']>("Jum'at"); const [kitab,setKitab]=useState(''); const [fan,setFan]=useState(''); const [guruKode,setGuruKode]=useState(0);
  const [guruNama,setGuruNama]=useState(''); const [kodeBaru,setKodeBaru]=useState(22);

  const persistGurus=(next:GuruJadwal[])=>{setGurus(next);save(GURU_KEY,next)};
  const addSlot=(e:React.FormEvent)=>{e.preventDefault();if(!kitab.trim()||!fan.trim()||!guruKode)return;const next=[...slots,{id:`jadwal-${Date.now()}`,kelas,hari,kitab:kitab.trim(),fanIlmu:fan.trim(),kodeGuru:guruKode}];setSlots(next);save(SLOT_KEY,next);setShowSlot(false);setKitab('');setFan('')};
  const addGuru=(e:React.FormEvent)=>{e.preventDefault();if(!guruNama.trim()||gurus.some(g=>g.kode===kodeBaru))return;persistGurus([...gurus,{kode:kodeBaru,nama:guruNama.trim(),warnaBadge:'bg-emerald-700 text-white'}]);setGuruNama('');setKodeBaru(kodeBaru+1)};
  const removeSlot=(id:string)=>{const next=slots.filter(s=>s.id!==id);setSlots(next);save(SLOT_KEY,next)};
  const uploadFoto=(kode:number,file?:File)=>{if(!file)return;const reader=new FileReader();reader.onload=()=>persistGurus(gurus.map(g=>g.kode===kode?{...g,foto:String(reader.result||'')}:g));reader.readAsDataURL(file)};
  const removeFoto=(kode:number)=>persistGurus(gurus.map(g=>g.kode===kode?{...g,foto:''}:g));

  return <div className="space-y-6 pb-12">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><h1 className="text-2xl font-black flex items-center gap-2"><Calendar className="w-6 h-6 text-emerald-700"/>Jadwal Pelajaran</h1><p className="text-xs text-slate-500 mt-1">Master guru mengikuti daftar pada dokumen resmi. Jadwal hanya muncul setelah dimasukkan admin.</p></div>{isAdmin&&<div className="flex gap-2"><button onClick={()=>setShowGuru(true)} className="border rounded-xl px-3 py-2 text-xs font-bold">Kelola Guru</button><button onClick={()=>setShowSlot(true)} className="bg-emerald-800 text-white rounded-xl px-3 py-2 text-xs font-bold flex items-center gap-1"><Plus className="w-4 h-4"/>Tambah Jadwal</button></div>}</div>
    {slots.length===0?<div className="rounded-3xl border bg-white p-10 text-center text-sm text-slate-500">Belum ada jadwal resmi yang dimasukkan.</div>:<div className="overflow-x-auto rounded-2xl border bg-white"><table className="min-w-[800px] w-full text-xs border-collapse"><thead className="bg-slate-100"><tr><th className="border p-2">Kelas</th><th className="border p-2">Hari</th><th className="border p-2">Fan Ilmu</th><th className="border p-2">Kitab</th><th className="border p-2">Guru</th>{isAdmin&&<th className="border p-2">Aksi</th>}</tr></thead><tbody>{[...slots].sort((a,b)=>a.kelas.localeCompare(b.kelas)||HARI.indexOf(a.hari)-HARI.indexOf(b.hari)).map(s=><tr key={s.id}><td className="border p-2 text-center font-bold">{s.kelas}</td><td className="border p-2 text-center">{s.hari}</td><td className="border p-2">{s.fanIlmu}</td><td className="border p-2">{s.kitab}</td><td className="border p-2">{gurus.find(g=>g.kode===s.kodeGuru)?.nama||'Belum ditetapkan'}</td>{isAdmin&&<td className="border p-2 text-center"><button onClick={()=>removeSlot(s.id)} className="text-rose-700"><Trash2 className="w-4 h-4 inline"/></button></td>}</tr>)}</tbody></table></div>}

    {showSlot&&<div className="fixed inset-0 z-50 bg-slate-950/60 p-4"><form onSubmit={addSlot} className="max-w-lg mx-auto mt-20 rounded-3xl bg-white p-6 space-y-3"><div className="flex justify-between"><h3 className="font-black">Tambah Jadwal</h3><button type="button" onClick={()=>setShowSlot(false)}><X className="w-5 h-5"/></button></div><select value={kelas} onChange={e=>setKelas(e.target.value)} className="w-full border rounded-xl p-2">{KELAS.map(k=><option key={k}>{k}</option>)}</select><select value={hari} onChange={e=>setHari(e.target.value as JadwalSlotItem['hari'])} className="w-full border rounded-xl p-2">{HARI.map(h=><option key={h}>{h}</option>)}</select><input value={fan} onChange={e=>setFan(e.target.value)} placeholder="Fan ilmu" className="w-full border rounded-xl p-2"/><input value={kitab} onChange={e=>setKitab(e.target.value)} placeholder="Nama kitab" className="w-full border rounded-xl p-2"/><select value={guruKode} onChange={e=>setGuruKode(Number(e.target.value))} className="w-full border rounded-xl p-2"><option value={0}>Pilih guru</option>{gurus.map(g=><option key={g.kode} value={g.kode}>{g.kode}. {g.nama}</option>)}</select><button className="w-full bg-emerald-800 text-white rounded-xl py-2 font-bold flex justify-center gap-2"><Save className="w-4 h-4"/>Simpan</button></form></div>}

    {showGuru&&<div className="fixed inset-0 z-50 bg-slate-950/60 p-4 overflow-y-auto"><div className="max-w-3xl mx-auto my-10 rounded-3xl bg-white p-6"><div className="flex justify-between items-center"><div><h3 className="font-black">Master Guru</h3><p className="text-xs text-slate-500 mt-1">Kode 1–21 mengikuti daftar guru pada dokumen sumber. Foto dapat ditambahkan admin untuk kebutuhan identitas.</p></div><button onClick={()=>setShowGuru(false)}><X className="w-5 h-5"/></button></div><div className="mt-4 grid gap-2 sm:grid-cols-2">{gurus.map(g=><div key={g.kode} className="flex items-center gap-3 rounded-xl border p-3"><div className="h-12 w-12 overflow-hidden rounded-xl bg-slate-100 flex items-center justify-center">{g.foto?<img src={g.foto} alt={g.nama} className="h-full w-full object-cover"/>:<Camera className="w-5 h-5 text-slate-400"/>}</div><div className="min-w-0 flex-1"><div className="text-xs font-black">{g.kode}. {g.nama}</div>{isAdmin&&<div className="mt-1 flex gap-2"><label className="cursor-pointer text-[10px] font-bold text-emerald-700">{g.foto?'Ganti foto':'Tambah foto'}<input type="file" accept="image/*" className="hidden" onChange={e=>uploadFoto(g.kode,e.target.files?.[0])}/></label>{g.foto&&<button onClick={()=>removeFoto(g.kode)} className="text-[10px] font-bold text-rose-700">Hapus foto</button>}</div>}</div></div>)}</div><form onSubmit={addGuru} className="mt-5 border-t pt-4 grid gap-3 sm:grid-cols-[100px_1fr_auto]"><input type="number" min={22} value={kodeBaru} onChange={e=>setKodeBaru(Number(e.target.value)||22)} className="border rounded-xl p-2 text-sm"/><input value={guruNama} onChange={e=>setGuruNama(e.target.value)} placeholder="Nama guru tambahan" className="border rounded-xl p-2 text-sm"/><button className="bg-emerald-800 text-white rounded-xl px-4 py-2 text-xs font-bold">Tambah</button></form></div></div>}
  </div>;
};
