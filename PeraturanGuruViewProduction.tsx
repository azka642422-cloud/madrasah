import React, { useState } from 'react';
import { FileText, Save } from 'lucide-react';
import { UserProfile } from '../types';

const KEY='annajiyah_v2_peraturan_guru_production';
interface Props{currentUser?:UserProfile;userRole?:string}
export const PeraturanGuruView:React.FC<Props>=({userRole='Guru'})=>{
 const isAdmin=userRole.toLowerCase()==='admin';
 const [text,setText]=useState(()=>{try{return localStorage.getItem(KEY)||''}catch{return''}});
 const [edit,setEdit]=useState(text);
 const [editing,setEditing]=useState(false);
 const save=()=>{localStorage.setItem(KEY,edit.trim());setText(edit.trim());setEditing(false)};
 if(userRole.toLowerCase()==='siswa')return <div className="mx-auto my-12 max-w-lg rounded-3xl border bg-white p-8 text-center"><h2 className="font-black">Akses Khusus Guru</h2><p className="mt-2 text-xs text-slate-500">Dokumen ini diperuntukkan bagi pengelola dan asatidz.</p></div>;
 return <div className="space-y-5 pb-12"><div className="flex items-end justify-between"><div><h1 className="flex items-center gap-2 text-2xl font-black"><FileText className="h-6 w-6 text-emerald-700"/>Peraturan & Disiplin Guru</h1><p className="mt-1 text-xs text-slate-500">Tidak ada aturan contoh yang ditampilkan sebagai ketentuan resmi.</p></div>{isAdmin&&!editing&&<button onClick={()=>{setEdit(text);setEditing(true)}} className="rounded-xl bg-emerald-800 px-4 py-2 text-xs font-bold text-white">Kelola Dokumen</button>}</div>{editing?<div className="rounded-3xl border bg-white p-5"><textarea rows={18} value={edit} onChange={e=>setEdit(e.target.value)} placeholder="Tempel atau ketik peraturan guru resmi di sini..." className="w-full rounded-2xl border p-4 text-sm leading-relaxed"/><div className="mt-3 flex justify-end gap-2"><button onClick={()=>setEditing(false)} className="px-4 py-2 text-xs font-bold">Batal</button><button onClick={save} className="flex items-center gap-2 rounded-xl bg-emerald-800 px-4 py-2 text-xs font-bold text-white"><Save className="h-4 w-4"/>Simpan</button></div></div>:text?<div className="whitespace-pre-wrap rounded-3xl border bg-white p-6 text-sm leading-relaxed">{text}</div>:<div className="rounded-2xl border border-dashed bg-white p-10 text-center text-sm text-slate-500">Belum ada dokumen peraturan guru resmi yang dimasukkan.</div>}</div>;
};