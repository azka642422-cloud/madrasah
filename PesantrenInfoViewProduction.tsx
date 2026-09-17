import React from 'react';
import { Landmark } from 'lucide-react';

export const PesantrenInfoView:React.FC=()=> <div className="space-y-6 pb-12">
  <div><h1 className="flex items-center gap-2 text-2xl font-black"><Landmark className="h-6 w-6 text-emerald-700"/>Profil Madrasah</h1><p className="mt-1 text-xs text-slate-500">Identitas yang ditampilkan dibatasi pada data yang didukung dokumen sumber.</p></div>
  <section className="rounded-3xl border bg-white p-6 sm:p-8">
    <div className="flex flex-col items-center text-center"><img src="/logo.png" alt="Logo Madrasah" className="h-24 w-24 object-contain"/><h2 className="mt-4 text-xl font-black text-emerald-950">MADRASAH DINIYAH TAKMILIYAH AN-NAJIYAH 2</h2><p className="mt-1 text-sm font-bold text-slate-700">Pondok Pesantren Bahrul Ulum Tambakberas Jombang</p></div>
    <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-900">Riwayat pendirian, nama tokoh, fasilitas, kapasitas, nomor telepon, situs web, visi, dan misi tidak ditampilkan apabila belum tersedia secara eksplisit pada sumber yang dipakai untuk finalisasi ini. Dengan demikian aplikasi tidak mempresentasikan data profil hasil contoh AI sebagai fakta madrasah.</div>
  </section>
</div>;
