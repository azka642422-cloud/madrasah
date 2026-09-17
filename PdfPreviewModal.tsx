import React from 'react';
import { X, Printer, Download, CheckCircle2, ShieldCheck, Award } from 'lucide-react';
import { RaportSiswa, IjazahSiswa, SilabusItem } from '../types';
import { PESANTREN_INFO } from '../data/mockData';

export type PdfDocumentType =
  | 'raport'
  | 'ijazah'
  | 'silabus'
  | 'jadwal'
  | 'soal'
  | 'rekap_absensi'
  | 'rekap_nilai'
  | 'absensi'
  | 'nilai'
  | 'dokumen';

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: PdfDocumentType;
  title?: string;
  data?: any;
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  isOpen,
  onClose,
  type,
  title = 'Dokumen Resmi Madrasah',
  data,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const fileContent = `MADRASAH DINIYAH TAKMILIYAH ANNAJIYAH 2 BAHRUL ULUM TAMBAKBERAS JOMBANG\nDokumen: ${title}\nDicetak pada: ${new Date().toLocaleDateString('id-ID')}`;
    const file = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${title.toLowerCase().replace(/\s+/g, '_')}_resmi.pdf`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-emerald-100 print:border-none print:shadow-none print:max-h-none print:w-full">
        {/* Modal Toolbar (hidden in print) */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-emerald-900 text-white print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-800 text-amber-300 font-bold text-xs flex items-center justify-center shadow-inner">
              PDF
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">{title}</h3>
              <p className="text-[11px] text-emerald-200">Pratinjau Dokumen Cetak Standar A4</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              id="btn-print-doc"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>Cetak</span>
            </button>
            <button
              onClick={handleDownload}
              id="btn-download-pdf-doc"
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-emerald-950 rounded-xl transition-colors shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Unduh PDF</span>
            </button>
            <button
              onClick={onClose}
              id="btn-close-pdf-modal"
              className="p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-800 rounded-xl transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Content Viewport */}
        <div className="overflow-y-auto p-4 sm:p-8 bg-slate-100 flex justify-center print:p-0 print:bg-white print:overflow-visible">
          <div className="w-full max-w-[210mm] bg-white shadow-md border border-slate-200 p-6 sm:p-10 rounded-sm text-slate-800 min-h-[297mm] relative print:shadow-none print:border-none print:p-6 print:m-0">
            {type === 'raport' && <RaportPrintView data={data} />}
            {type === 'ijazah' && <IjazahPrintView data={data} />}
            {type === 'silabus' && <SilabusPrintView data={data} />}
            {(type === 'absensi' || type === 'rekap_absensi') && <AbsensiPrintView data={data} />}
            {(type === 'nilai' || type === 'rekap_nilai') && <NilaiPrintView data={data} />}
            {type === 'dokumen' && <GeneralDocPrintView title={title} data={data} />}
          </div>
        </div>
      </div>
    </div>
  );
};

// Official Header
const KopPesantren: React.FC = () => (
  <div className="border-b-2 border-emerald-900 pb-4 mb-6 flex items-center gap-4 text-center sm:text-left">
    <img
      src="/logo.png"
      alt="Logo Madin Annajiyah 2"
      className="w-16 h-16 sm:w-20 sm:h-20 object-contain shrink-0 drop-shadow-xs"
    />
    <div className="flex-1">
      <div className="text-xs font-bold text-amber-800 tracking-wider uppercase mb-0.5">
        PONDOK PESANTREN BAHRUL ULUM
      </div>
      <h1 className="text-base sm:text-lg font-black text-emerald-950 uppercase tracking-tight leading-tight">
        MADRASAH DINIYAH TAKMILIYAH ANNAJIYAH 2
      </h1>
      <p className="text-[11px] text-slate-700 leading-snug mt-0.5 font-medium">
        Tambakberas Jombang Jawa Timur 61451
      </p>
      <p className="text-[10px] text-slate-500 mt-0.5">
        Tahun Ajaran 2024/2025 • Kurikulum Salafiyah Terpadu
      </p>
    </div>
    <div className="hidden sm:block text-right border-l border-slate-200 pl-4 shrink-0">
      <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-lg text-[10px] font-bold">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
        Dokumen Sah
      </div>
    </div>
  </div>
);

// 1. Raport Print View - 100% compliant with Template_Rapot_Madin_AI_Studio.csv
const RaportPrintView: React.FC<{ data?: any }> = ({ data }) => {
  const santriNama = data?.santri?.nama || 'A. Baja Satria';
  const santriNis = data?.santri?.nis || '247001';
  const santriKelas = data?.santri?.kelas || '1A';

  return (
    <div className="text-xs space-y-4">
      {/* Header Rapot */}
      <div className="text-center space-y-1 pb-3 border-b-2 border-emerald-950">
        <h2 className="font-black text-sm tracking-wider uppercase text-slate-900">
          LAPORAN HASIL PENILAIAN PESERTA DIDIK
        </h2>
        <h3 className="font-extrabold text-base text-emerald-950 uppercase tracking-tight">
          MADRASAH DINIYAH TAKMILIYAH PP. AN-NAJIYAH 2 BAHRUL ULUM
        </h3>
        <p className="text-xs font-bold text-slate-700 font-mono">
          TAHUN AJARAN 2024/2025
        </p>
      </div>

      {/* Identitas Santri */}
      <div className="grid grid-cols-2 gap-4 text-xs font-semibold pb-2 border-b border-slate-200">
        <div>
          <span className="text-slate-500 font-normal">Nama : </span>
          <span className="font-extrabold text-slate-900 uppercase">{santriNama}</span>
        </div>
        <div className="text-right">
          <span className="text-slate-500 font-normal">Semester : </span>
          <span className="font-bold text-slate-800">2 (Genap)</span>
        </div>
        <div>
          <span className="text-slate-500 font-normal">Kelas : </span>
          <span className="font-bold font-mono text-emerald-900">Kelas {santriKelas}</span>
        </div>
        <div className="text-right">
          <span className="text-slate-500 font-normal">Nomor Induk Santri (NIS) : </span>
          <span className="font-mono font-bold text-slate-800">{santriNis}</span>
        </div>
      </div>

      {/* Tabel 1: Ujian Tulis */}
      <div className="space-y-1">
        <h4 className="font-bold text-slate-900 uppercase text-[11px]">Tabel 1: Ujian Tulis</h4>
        <table className="w-full border border-slate-300 border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
              <th className="p-2 text-center w-10 border-r border-slate-300">No</th>
              <th className="p-2 text-left border-r border-slate-300">Mata Pelajaran</th>
              <th className="p-2 text-center border-r border-slate-300 font-serif">Kitab</th>
              <th className="p-2 text-center w-20">Nilai</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            <tr>
              <td className="p-2 text-center border-r border-slate-300 font-mono">1</td>
              <td className="p-2 font-bold border-r border-slate-300">Tauhid</td>
              <td className="p-2 text-center font-serif border-r border-slate-300">عقيدة العوام</td>
              <td className="p-2 text-center font-mono font-black">95</td>
            </tr>
            <tr>
              <td className="p-2 text-center border-r border-slate-300 font-mono">2</td>
              <td className="p-2 font-bold border-r border-slate-300">Fiqih</td>
              <td className="p-2 text-center font-serif border-r border-slate-300">فصلاتن</td>
              <td className="p-2 text-center font-mono font-black">85</td>
            </tr>
            <tr>
              <td className="p-2 text-center border-r border-slate-300 font-mono">3</td>
              <td className="p-2 font-bold border-r border-slate-300">Tajwid</td>
              <td className="p-2 text-center font-serif border-r border-slate-300">شفاء الجنان</td>
              <td className="p-2 text-center font-mono font-black">84</td>
            </tr>
            <tr>
              <td className="p-2 text-center border-r border-slate-300 font-mono">4</td>
              <td className="p-2 font-bold border-r border-slate-300">Shorof</td>
              <td className="p-2 text-center font-serif border-r border-slate-300">الأمثلة التصريفية</td>
              <td className="p-2 text-center font-mono font-black">84</td>
            </tr>
            <tr>
              <td className="p-2 text-center border-r border-slate-300 font-mono">5</td>
              <td className="p-2 font-bold border-r border-slate-300">Pegon</td>
              <td className="p-2 text-center font-serif border-r border-slate-300">أبجد / Buku Pintar Pegon</td>
              <td className="p-2 text-center font-mono font-black">90</td>
            </tr>
            <tr className="bg-slate-50 font-bold border-t-2 border-slate-300">
              <td colSpan={3} className="p-2 text-left pl-3 border-r border-slate-300 uppercase">
                Jumlah nilai ujian tulis
              </td>
              <td className="p-2 text-center font-mono font-black">438</td>
            </tr>
            <tr className="bg-slate-50 font-bold">
              <td colSpan={3} className="p-2 text-left pl-3 border-r border-slate-300 uppercase">
                Rata-rata nilai ujian tulis
              </td>
              <td className="p-2 text-center font-mono font-black text-emerald-950">87.60</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Tabel 1 (Lanjutan): Ujian Muhafadzoh */}
      <div className="space-y-1">
        <table className="w-full border border-slate-300 border-collapse text-xs">
          <thead>
            <tr className="bg-emerald-900 text-white font-bold">
              <th colSpan={4} className="p-2 text-left pl-3 uppercase">
                UJIAN MUHAFADZOH
              </th>
            </tr>
            <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
              <th className="p-2 text-center w-10 border-r border-slate-300">No</th>
              <th className="p-2 text-left border-r border-slate-300">Kitab</th>
              <th className="p-2 text-left border-r border-slate-300">Batasan</th>
              <th className="p-2 text-center w-28">Jumlah Nilai</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 text-center border-r border-slate-300 font-mono">1</td>
              <td className="p-2 font-serif font-bold border-r border-slate-300">الأمثلة التصريفية</td>
              <td className="p-2 border-r border-slate-300 text-slate-700">Target 500 Bait</td>
              <td className="p-2 text-center font-mono font-black">94</td>
            </tr>
            <tr className="bg-slate-50 font-bold border-t border-slate-300">
              <td colSpan={3} className="p-2 text-left pl-3 border-r border-slate-300 uppercase">
                Rata-rata nilai muhafadzoh
              </td>
              <td className="p-2 text-center font-mono font-black text-emerald-950">94.00</td>
            </tr>
            <tr className="bg-emerald-50/50 font-bold border-t border-slate-300">
              <td colSpan={4} className="p-2 text-left pl-3 text-emerald-950">
                Peringkat 15 dari 31 santri
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Tabel 2 & 4: Madrasatul Qur'an & Lain-lain */}
      <div className="grid grid-cols-2 gap-4">
        <div className="border border-slate-300 rounded-lg overflow-hidden text-xs">
          <div className="bg-slate-800 text-white p-1.5 font-bold text-center uppercase text-[11px]">
            UJIAN MADRASATUL QUR&apos;AN
          </div>
          <table className="w-full border-collapse">
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="p-2 w-8 text-center border-r border-slate-200 font-mono">1</td>
                <td className="p-2 border-r border-slate-200 font-semibold">Kelancaran</td>
                <td className="p-2 text-center font-mono font-bold w-16">20 / 25</td>
              </tr>
              <tr>
                <td className="p-2 text-center border-r border-slate-200 font-mono">2</td>
                <td className="p-2 border-r border-slate-200 font-semibold">Makhroj</td>
                <td className="p-2 text-center font-mono font-bold">15 / 25</td>
              </tr>
              <tr>
                <td className="p-2 text-center border-r border-slate-200 font-mono">3</td>
                <td className="p-2 border-r border-slate-200 font-semibold">Tajwid</td>
                <td className="p-2 text-center font-mono font-bold">30 / 50</td>
              </tr>
              <tr className="bg-slate-50 font-bold border-t border-slate-300">
                <td colSpan={2} className="p-2 pl-3 border-r border-slate-200">Jumlah</td>
                <td className="p-2 text-center font-mono font-black">65</td>
              </tr>
              <tr className="bg-slate-50 font-bold">
                <td colSpan={2} className="p-2 pl-3 border-r border-slate-200">Rata-rata</td>
                <td className="p-2 text-center font-mono font-black text-emerald-950">65</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="border border-slate-300 rounded-lg overflow-hidden text-xs">
          <div className="bg-slate-800 text-white p-1.5 font-bold text-center uppercase text-[11px]">
            LAIN-LAIN
          </div>
          <table className="w-full border-collapse">
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="p-2 w-8 text-center border-r border-slate-200 font-mono">1</td>
                <td className="p-2 border-r border-slate-200 font-semibold">Kelakuan</td>
                <td className="p-2 text-center font-bold border-r border-slate-200 w-12">B</td>
                <td className="p-2 font-semibold">Sakit</td>
                <td className="p-2 text-center font-mono w-12">-</td>
              </tr>
              <tr>
                <td className="p-2 text-center border-r border-slate-200 font-mono">2</td>
                <td className="p-2 border-r border-slate-200 font-semibold">Kerajinan</td>
                <td className="p-2 text-center font-bold border-r border-slate-200">B</td>
                <td className="p-2 font-semibold">Izin</td>
                <td className="p-2 text-center font-mono">2 hari</td>
              </tr>
              <tr>
                <td className="p-2 text-center border-r border-slate-200 font-mono">3</td>
                <td className="p-2 border-r border-slate-200 font-semibold">Kerapian</td>
                <td className="p-2 text-center font-bold border-r border-slate-200">B</td>
                <td className="p-2 font-semibold">Tanpa Keterangan</td>
                <td className="p-2 text-center font-mono">-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Catatan & Keputusan */}
      <div className="border border-slate-300 rounded-xl p-3 bg-slate-50 space-y-1.5 text-xs">
        <div>
          <span className="font-bold">Catatan : </span>
          <span className="text-slate-700">Pertahankan prestasi belajar dan tingkatkan istiqomah hafalan nadhom.</span>
        </div>
        <div>
          <span className="font-bold">Keputusan : </span>
          <span className="font-extrabold text-emerald-950">
            Dengan mempertimbangkan hasil yang dicapai, maka siswa ini dinyatakan naik ke kelas berikutnya.
          </span>
        </div>
      </div>

      {/* Tanda Tangan: PENGASUH */}
      <div className="pt-4 text-xs">
        <div className="text-right text-slate-600 mb-4 font-mono">Jombang, 15 Juni 2024</div>
        <div className="grid grid-cols-3 gap-4 text-center items-end">
          <div className="space-y-12">
            <p className="font-semibold">Wali Kelas,</p>
            <div>
              <p className="font-bold underline text-slate-900">Ust. Rhendie Reihansyah</p>
              <p className="text-[10px] text-slate-400">Musrif Kelas {santriKelas}</p>
            </div>
          </div>
          <div className="space-y-12">
            <div>
              <p className="font-semibold">Mengetahui,</p>
              <p className="font-extrabold text-slate-900 uppercase">PENGASUH</p>
            </div>
            <div>
              <p className="font-extrabold underline text-emerald-950">
                KH. M. Salman Al Faries, Lc.,M.H.I.
              </p>
              <p className="text-[10px] text-slate-500">PP. An-Najiyah 2 Bahrul &apos;Ulum</p>
            </div>
          </div>
          <div className="space-y-12">
            <p className="font-semibold">Wali Santri,</p>
            <div>
              <p className="text-slate-400">( ................................... )</p>
              <p className="text-[10px] text-slate-400">Tanda Tangan</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. Ijazah Print View - 100% compliant with Template_Ijazah_Madin_AI_Studio.csv
const IjazahPrintView: React.FC<{ data?: any }> = ({ data }) => {
  const santriNama = data?.santri?.nama || 'A. Baja Satria';
  const santriNis = data?.santri?.nis || '247001';

  return (
    <div className="p-4 sm:p-8 border-8 border-double border-amber-600/60 rounded-2xl bg-white text-slate-900 text-xs space-y-6">
      {/* Header Arab & Lembaga */}
      <div className="text-center space-y-1">
        <p className="font-serif font-black text-xl sm:text-2xl text-emerald-950">
          المعهد الإسلامي الناجية ٢ بحر العلوم
        </p>
        <h2 className="font-serif font-black text-2xl sm:text-3xl text-amber-900 tracking-widest uppercase pt-1">
          I J A Z A H
        </h2>
        <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 uppercase">
          MADRASAH DINIYAH
        </h3>
        <h4 className="font-black text-sm sm:text-base text-emerald-950 uppercase">
          PONDOK PESANTREN AN-NAJIYAH 2 BAHRUL ‘ULUM
        </h4>
        <p className="text-[11px] font-bold text-slate-700 tracking-wider uppercase">
          TAMBAKBERAS JOMBANG JAWA TIMUR
        </p>
        <p className="text-[11px] text-slate-500 font-mono pt-1">
          Tahun Pelajaran : 1446 – 1447 H / 2025 – 2026
        </p>
        <p className="text-[11px] font-mono font-semibold text-slate-600">
          Nomor : 037/PP.ANJ2/BU/V/2026
        </p>
      </div>

      {/* Body Teks Ijazah */}
      <div className="max-w-xl mx-auto text-center space-y-3 pt-2">
        <p>
          Yang bertandatangan dibawah ini, Pengasuh Pondok Pesantren An-Najiyah 2 Bahrul ‘Ulum Tambakberas Jombang menerangkan bahwa :
        </p>
        <div className="py-2 border-y-2 border-amber-600/30 bg-amber-50/40 rounded-xl">
          <h3 className="text-lg sm:text-2xl font-serif font-black text-emerald-950 uppercase">
            {santriNama}
          </h3>
          <p className="text-xs font-mono text-slate-500">NIS: {santriNis}</p>
        </div>
        <p className="font-bold">Dinyatakan :</p>
        <div>
          <span className="inline-block px-8 py-1.5 bg-emerald-900 text-amber-300 font-serif font-extrabold text-xl rounded-xl border border-amber-400">
            L U L U S
          </span>
        </div>
        <p className="text-slate-700 leading-relaxed text-[11px] pt-1">
          Dari Pendidikan Madrasah Diniyah Takmiliyah Pondok Pesantren An-Najiyah 2 Bahrul ‘Ulum Tambakberas Jombang berdasarkan Ujian Akhir Madrasah Diniyah yang diselenggarakan pada tanggal 25 Syawal s.d. 29 Syawal 1447 H / 14 April s.d. 18 Maret 2026.
        </p>
      </div>

      {/* Tanda Tangan Pengasuh */}
      <div className="pt-4 grid grid-cols-2 items-end max-w-xl mx-auto text-xs">
        <div className="text-center sm:text-left">
          <div className="w-20 h-28 border border-slate-300 rounded flex items-center justify-center text-slate-400 font-mono text-[9px]">
            Foto 3x4 Santri
          </div>
        </div>
        <div className="text-right space-y-1">
          <p className="text-slate-600">Jombang, 13 Dzulhijjah 1447 H</p>
          <p className="text-slate-800 font-medium">30 Mei 2026</p>
          <p className="font-bold text-slate-900 uppercase text-[11px]">
            Pengasuh PP. An-Najiyah 2 Bahrul ‘Ulum
          </p>
          <div className="h-12 flex items-center justify-end">
            <span className="font-serif italic text-emerald-900 font-bold">[Tanda Tangan & Cap]</span>
          </div>
          <p className="font-black text-emerald-950 text-xs">
            KH. M. Salman Al Faries, Lc.,M.H.I.
          </p>
        </div>
      </div>
    </div>
  );
};

// 3. Silabus Print View - STRICTLY NO ALOKASI WAKTU
const SilabusPrintView: React.FC<{ data?: any }> = ({ data }) => {
  return (
    <div className="text-xs space-y-4">
      <KopPesantren />
      <div className="text-center mb-4">
        <h2 className="text-base font-bold text-emerald-950 uppercase">
          SILABUS & TARGET PEMBELAJARAN KURIKULUM MADIN
        </h2>
        <p className="text-xs text-slate-600">Madrasah Diniyah Takmiliyah Annajiyah 2 Bahrul Ulum</p>
      </div>

      <div className="space-y-3 text-xs">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <h4 className="font-bold text-emerald-900">1. Standar Kompetensi Umum</h4>
          <p className="text-slate-700 mt-1">
            Memahami, membaca, dan menguasai kaidah kitab kuning sesuai dengan tingkatan kelas.
          </p>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <h4 className="font-bold text-emerald-900">2. Indikator Pencapaian Kompetensi</h4>
          <p className="text-slate-700 mt-1">
            Santri mampu melafalkan dengan fasih, mengartikan perkata (makna gandul pegon), dan menguraikan tarkib nahwu/shorof.
          </p>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <h4 className="font-bold text-emerald-900">3. Target Pembelajaran</h4>
          <p className="text-slate-700 mt-1">
            Khatam materi pelajaran dan tuntas setoran hafalan nadhom muhafadloh sesuai jenjang tingkatan.
          </p>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <h4 className="font-bold text-emerald-900">4. Metode Pembelajaran Pesantren</h4>
          <p className="text-slate-700 mt-1">
            Bandongan, Sorogan, Lalaran Nadhom Bersama, dan Musyawarah Bahtsul Masail Kelas.
          </p>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <h4 className="font-bold text-emerald-900">5. Sumber Belajar & Kitab</h4>
          <p className="text-slate-700 mt-1">
            Kitab-kitab salaf mu&apos;tabaroh (Safinatun Naja, Aqidatul Awwam, Al-Ajurrumiyyah, Al-Amtsilah At-Tashrifiyyah, dll).
          </p>
        </div>
      </div>
    </div>
  );
};

// 4. Absensi Print View - STRICTLY NO TIME / JAM PELAJARAN
const AbsensiPrintView: React.FC<{ data?: any }> = ({ data }) => {
  return (
    <div className="text-xs space-y-4">
      <KopPesantren />
      <div className="text-center mb-4">
        <h2 className="text-base font-bold text-emerald-950 uppercase">
          REKAPITULASI PRESENSI SANTRI
        </h2>
        <p className="text-xs text-slate-600">Madrasah Diniyah Takmiliyah Annajiyah 2 Bahrul Ulum</p>
      </div>

      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-around font-bold text-xs">
        <span>Tingkat Hadir: 96%</span>
        <span className="text-emerald-800">Hadir: 238 Santri</span>
        <span className="text-blue-800">Izin: 6 Santri</span>
        <span className="text-amber-800">Sakit: 3 Santri</span>
        <span className="text-rose-800">Alpha: 0</span>
      </div>

      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-700">
        <p className="font-semibold text-slate-900">Keterangan Administrasi Presensi:</p>
        <p className="mt-1">
          Berdasarkan tata tertib Bab IV Pasal 9, santri wajib hadir tepat waktu sebelum bel masuk berbunyi. Batas maksimal ketidakhadiran tanpa izin adalah 15 hari dalam satu semester sebelum tindakan pemanggilan orang tua/wali santri.
        </p>
      </div>
    </div>
  );
};

// 5. Nilai Print View
const NilaiPrintView: React.FC<{ data?: any }> = ({ data }) => {
  return (
    <div className="text-xs space-y-4">
      <KopPesantren />
      <div className="text-center mb-4">
        <h2 className="text-base font-bold text-emerald-950 uppercase">
          REKAP BUKU NILAI & MUHAFADLOH
        </h2>
        <p className="text-xs text-slate-600">Tahun Ajaran 2024/2025 • Semester Ganjil, Genap & Muhafadloh</p>
      </div>
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700">
        <p>Rekapitulasi resmi pencatatan nilai santri Madrasah Diniyah Takmiliyah Annajiyah 2 Bahrul Ulum Tambakberas Jombang.</p>
      </div>
    </div>
  );
};

// 6. General Doc View
const GeneralDocPrintView: React.FC<{ title: string; data?: any }> = ({ title, data }) => (
  <div className="text-xs space-y-4">
    <KopPesantren />
    <div className="text-center mb-6">
      <h2 className="text-base font-bold text-emerald-950 uppercase">{title}</h2>
      <p className="text-xs text-slate-500 mt-1">
        Dokumen Resmi Madrasah Diniyah Takmiliyah Annajiyah 2 Bahrul Ulum
      </p>
    </div>
    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-slate-700">
      <p className="font-bold text-slate-900">{data?.judul || title}</p>
      <p>{data?.deskripsi || 'Dokumen resmi administrasi dan peraturan Madrasah Diniyah Takmiliyah Annajiyah 2 Bahrul Ulum Tambakberas Jombang.'}</p>
    </div>
  </div>
);
