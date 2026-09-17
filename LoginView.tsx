import React, { useState } from 'react';
import { Lock, User, AlertCircle, ArrowRight } from 'lucide-react';
import { UserRole } from '../types';
import { storageService } from '../services/storageService';

interface LoginViewProps {
  onLogin: (role: UserRole) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password) {
      setError('Username/NIS dan kata sandi wajib diisi.');
      return;
    }
    const account = storageService.verifyLogin(username, password);
    if (!account) {
      setError('Username/NIS atau kata sandi tidak sesuai, atau akun sedang nonaktif.');
      return;
    }
    try {
      sessionStorage.setItem('annajiyah_active_account', JSON.stringify(account));
    } catch {}
    onLogin(account.role);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-900 via-emerald-950 to-slate-950 flex flex-col text-slate-100 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:24px_24px]" />
      <header className="p-5 sm:p-7 relative z-10">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo Madrasah Takmiliyah Annajiyah 2" className="w-14 h-14 object-contain" />
          <div>
            <div className="font-black text-white tracking-tight">MADRASAH DINIYAH TAKMILIYAH ANNAJIYAH 2</div>
            <div className="text-xs text-emerald-200">PP. Bahrul Ulum Tambakberas Jombang</div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 text-slate-800 shadow-2xl border border-emerald-100">
          <div className="text-center mb-6">
            <img src="/logo.png" alt="Logo Madrasah" className="w-24 h-24 object-contain mx-auto mb-3" />
            <h1 className="text-xl font-black text-emerald-950">Sistem Administrasi Madrasah</h1>
            <p className="text-xs text-slate-500 mt-1">Masuk menggunakan akun yang telah didaftarkan admin.</p>
          </div>

          {error && <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-xs font-semibold text-rose-800 flex gap-2"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-xs font-bold text-slate-700">Username / NIS
              <div className="relative mt-1.5"><User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-700"/><input autoComplete="username" value={username} onChange={(e)=>setUsername(e.target.value)} placeholder="Masukkan username atau NIS" className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm"/></div>
            </label>
            <label className="block text-xs font-bold text-slate-700">Kata Sandi
              <div className="relative mt-1.5"><Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-700"/><input type="password" autoComplete="current-password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Masukkan kata sandi" className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm"/></div>
            </label>
            <button type="submit" className="w-full py-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-center gap-2">Masuk <ArrowRight className="w-4 h-4"/></button>
          </form>

          <div className="mt-5 p-3 rounded-2xl bg-slate-50 border text-[11px] leading-relaxed text-slate-500">
            Akun dan kata sandi dikelola oleh administrator. Sistem tidak lagi menerima login hanya berdasarkan pilihan peran.
          </div>
        </div>
      </main>
    </div>
  );
};
