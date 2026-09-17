import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, ChevronRight, FileSpreadsheet, Search, User, X } from 'lucide-react';
import { storageService } from './storageServiceProduction';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult?: (category: string, item: any) => void;
  onNavigate?: (page: any) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose, onSelectResult, onNavigate }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 30);
  }, [isOpen]);

  const q = query.trim().toLowerCase();
  const students = storageService.getStudents();
  const muhaf = storageService.getMuhafadzohList();

  const matchedStudents = useMemo(() => q ? students.filter((s) => s.nama.toLowerCase().includes(q) || s.nis.toLowerCase().includes(q)).slice(0, 12) : [], [q, students]);
  const matchedMuhaf = useMemo(() => q ? muhaf.filter((s) => s.nama.toLowerCase().includes(q) || s.nis.toLowerCase().includes(q) || (s.materiMuhafadzoh || '').toLowerCase().includes(q)).slice(0, 12) : [], [q, muhaf]);

  const go = (category: string, item: any, page: string) => {
    onSelectResult?.(category, item);
    onNavigate?.(page);
    onClose();
  };

  if (!isOpen) return null;

  return <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/60 p-4 pt-16 backdrop-blur-sm sm:pt-24">
    <div className="w-full max-w-2xl overflow-hidden rounded-2xl border bg-white shadow-2xl">
      <div className="flex items-center gap-3 border-b bg-slate-50 p-4"><Search className="h-5 w-5 text-emerald-700"/><input ref={inputRef} value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Cari nama santri, NIS, atau materi Muhafadloh..." className="flex-1 bg-transparent text-sm outline-none"/>{query&&<button onClick={()=>setQuery('')}><X className="h-4 w-4 text-slate-400"/></button>}<button onClick={onClose} className="rounded-lg bg-slate-200 px-2.5 py-1 text-xs font-bold">ESC</button></div>
      <div className="max-h-[65vh] overflow-y-auto p-4">
        {!q ? <div className="py-12 text-center text-xs text-slate-400"><Search className="mx-auto mb-2 h-10 w-10 text-slate-300"/>Ketik nama santri, NIS, atau materi Muhafadloh.</div> : matchedStudents.length===0&&matchedMuhaf.length===0 ? <div className="py-12 text-center text-xs text-slate-400">Tidak ada hasil untuk “{query}”.</div> : <div className="space-y-5">
          {matchedStudents.length>0&&<section><div className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-emerald-800"><User className="h-4 w-4"/>Database Santri</div><div className="space-y-1.5">{matchedStudents.map((s)=><button key={s.id} onClick={()=>go('siswa',s,'siswa')} className="flex w-full items-center justify-between rounded-xl border p-3 text-left hover:bg-emerald-50"><div><div className="text-sm font-black text-slate-900">{s.nama}</div><div className="mt-0.5 text-xs text-slate-500">NIS {s.nis} · Kelas {s.kelas} · {String(s.status)}</div></div><ChevronRight className="h-4 w-4 text-emerald-700"/></button>)}</div></section>}
          {matchedMuhaf.length>0&&<section><div className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-emerald-800"><BookOpen className="h-4 w-4"/>Muhafadloh</div><div className="space-y-1.5">{matchedMuhaf.map((s)=><button key={s.nis} onClick={()=>go('muhafadzoh',s,'muhafadzoh')} className="flex w-full items-center justify-between rounded-xl border p-3 text-left hover:bg-emerald-50"><div><div className="text-sm font-black text-slate-900">{s.nama}</div><div className="mt-0.5 text-xs text-slate-500">NIS {s.nis} · Kelas {s.kelas} · {s.materiMuhafadzoh}</div></div><ChevronRight className="h-4 w-4 text-emerald-700"/></button>)}</div></section>}
          <section><div className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-slate-500"><FileSpreadsheet className="h-4 w-4"/>Navigasi</div><div className="grid grid-cols-2 gap-2"><button onClick={()=>go('nilai',{},'nilai')} className="rounded-xl border p-3 text-left text-xs font-bold hover:bg-slate-50">Buku Nilai</button><button onClick={()=>go('raport',{},'raport')} className="rounded-xl border p-3 text-left text-xs font-bold hover:bg-slate-50">Raport</button></div></section>
        </div>}
      </div>
    </div>
  </div>;
};
