import React, { useState } from 'react';
import {
  MapPin,
  Building,
  Layers,
  Search,
  Filter,
  Users,
  Info,
  CheckCircle2,
  Navigation
} from 'lucide-react';
import { DENAH_KELAS_DATA, DenahRuangKelas } from '../data/madinData';

export const DenahKelasView: React.FC = () => {
  const [selectedLantai, setSelectedLantai] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRoom, setSelectedRoom] = useState<DenahRuangKelas | null>(null);

  const filteredData = DENAH_KELAS_DATA.filter((item) => {
    const matchLantai =
      selectedLantai === 'Semua' || item.lantai === selectedLantai;
    const matchSearch =
      item.kelas.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.namaRuang.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.lantai.toLowerCase().includes(searchQuery.toLowerCase());
    return matchLantai && matchSearch;
  });

  const lantai1Items = DENAH_KELAS_DATA.filter((i) => i.lantai === 'Lantai 1');
  const lantai2Items = DENAH_KELAS_DATA.filter((i) => i.lantai === 'Lantai 2');

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Building className="w-6 h-6 text-emerald-700" />
            <span>Denah & Lokasi Ruang Kelas</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Madrasah Diniyah Takmiliyah Annajiyah 2 Bahrul Ulum Tambakberas Jombang
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-200">
          <Layers className="w-4 h-4 text-emerald-700" />
          <span>Total 12 Kelas (Lantai 1 & Lantai 2)</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari kelas atau nama ruangan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-600">Filter Lantai:</span>
          <div className="inline-flex rounded-xl bg-slate-100 p-1">
            {['Semua', 'Lantai 1', 'Lantai 2'].map((lantai) => (
              <button
                key={lantai}
                onClick={() => setSelectedLantai(lantai)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                  selectedLantai === lantai
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lantai}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Visual Building Diagram (Lantai 2 & Lantai 1) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lantai 2 Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-900 font-bold flex items-center justify-center text-xs font-mono">
                L2
              </span>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">LANTAI 2</h3>
                <p className="text-[11px] text-slate-500">Kompleks Umar & Kompleks Utsman</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              5 Kelas
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {lantai2Items.map((item) => (
              <div
                key={item.kelas}
                onClick={() => setSelectedRoom(item)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedRoom?.kelas === item.kelas
                    ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-500'
                    : 'bg-slate-50/60 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-lg bg-emerald-900 text-amber-300 font-mono font-bold text-xs">
                    Kelas {item.kelas}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Tingkat {item.tingkat}</span>
                </div>
                <h4 className="font-extrabold text-sm text-slate-900">{item.namaRuang}</h4>
                <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-700 shrink-0" />
                  <span>{item.lantai} • {item.keterangan}</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Lantai 1 Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-xs font-mono">
                L1
              </span>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">LANTAI 1</h3>
                <p className="text-[11px] text-slate-500">Aula, Teras Abu Bakar & Musholla</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
              7 Kelas
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {lantai1Items.map((item) => (
              <div
                key={item.kelas}
                onClick={() => setSelectedRoom(item)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedRoom?.kelas === item.kelas
                    ? 'bg-amber-50 border-amber-600 ring-2 ring-amber-500'
                    : 'bg-slate-50/60 border-slate-200 hover:border-amber-300 hover:bg-amber-50/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-lg bg-emerald-900 text-amber-300 font-mono font-bold text-xs">
                    Kelas {item.kelas}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Tingkat {item.tingkat}</span>
                </div>
                <h4 className="font-extrabold text-sm text-slate-900">{item.namaRuang}</h4>
                <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-700 shrink-0" />
                  <span>{item.lantai} • {item.keterangan}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabel Rujukan Denah Kelas */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">
              Daftar Lengkap Ruang & Kelas Madrasah
            </h3>
            <p className="text-xs text-slate-500">
              Data resmi Denah_Nama_Ruang_Kelas_AI_Studio.csv
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500 font-bold">
            {filteredData.length} Ruang Kelas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="p-3.5 text-center w-16">No</th>
                <th className="p-3.5">Nama Kelas</th>
                <th className="p-3.5 text-center w-24">Tingkat</th>
                <th className="p-3.5">Nama Ruang</th>
                <th className="p-3.5">Lantai</th>
                <th className="p-3.5">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((item, idx) => (
                <tr key={item.kelas} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 text-center font-mono text-slate-400 font-bold">{idx + 1}</td>
                  <td className="p-3.5 font-bold text-slate-900">
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded-lg font-mono">
                      Kelas {item.kelas}
                    </span>
                  </td>
                  <td className="p-3.5 text-center font-mono text-slate-700 font-semibold">
                    Tingkat {item.tingkat}
                  </td>
                  <td className="p-3.5 font-extrabold text-slate-800">
                    {item.namaRuang}
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.lantai === 'Lantai 1' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                    }`}>
                      {item.lantai}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-600">
                    {item.keterangan}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
