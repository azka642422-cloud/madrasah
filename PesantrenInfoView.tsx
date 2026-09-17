import React, { useState } from 'react';
import {
  Landmark,
  Award,
  Users,
  Building,
  HeartHandshake,
  Compass,
  CheckCircle2,
  Printer,
  Sparkles,
  Camera
} from 'lucide-react';
import { PESANTREN_INFO } from '../data/mockData';
import { PdfPreviewModal } from '../components/PdfPreviewModal';

export const PesantrenInfoView: React.FC = () => {
  const [showPdfModal, setShowPdfModal] = useState(false);

  const fasilitas = [
    { nama: "Masjid Jami' Baiturrahman", kapasitas: '2.000 Jamaah', icon: Landmark, desc: 'Pusat shalat fardhu berjamaah, kajian ba’da Shubuh, dan khutbah Jum’at.' },
    { nama: 'Gedung Madrasah Terpadu 4 Lantai', kapasitas: '24 Ruang Kelas Modern', icon: Building, desc: 'Ruang belajar santri dengan ventilasi alami, meja belajar rapi, dan fasilitas multimedia lengkap.' },
    { nama: 'Perpustakaan Kitab Turats & Modern', kapasitas: '15.000 Judul Kitab', icon: Landmark, desc: 'Koleksi manuskrip kitab kuning, tafsir mu’tabarah, serta referensi sains kontemporer.' },
    { nama: 'Laboratorium Bahasa Arab & Inggris', kapasitas: '48 Bilik Komputer Multimedia', icon: Building, desc: 'Fasilitas digital interaktif untuk melatih listening, pronunciation, dan muhadatsah.' },
    { nama: 'Klinik Kesehatan Santri (Poskestren)', kapasitas: 'Dokter Jaga & Paramedis 24 Jam', icon: Landmark, desc: 'Pelayanan kesehatan preventif dan kuratif gratis untuk seluruh warga pesantren.' },
    { nama: 'Sarana Olahraga & Seni Bela Diri', kapasitas: 'Lapangan Futsal, Basket, Tapak Suci', icon: Building, desc: 'Penyaluran minat bakat fisik santri demi mewujudkan jiwa yang sehat (Al-’Aqlus Salimu fil Jismis Salim).' },
  ];

  const fotoKegiatan = [
    {
      judul: 'Halaqah Muhafadloh & Qur’an Pagi',
      waktu: 'Ba’da Shubuh Berjamaah',
      url: 'https://images.unsplash.com/photo-1584281722572-8a9d1844bca1?w=600&auto=format&fit=crop&q=80',
      caption: 'Setoran hafalan nadhom santri di serambi bersama ustadz pembina.',
    },
    {
      judul: 'Muhadatsah & Percakapan Dwibahasa',
      waktu: 'Setiap Pagi Sebelum Masuk Kelas',
      url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=600&auto=format&fit=crop&q=80',
      caption: 'Praktik percakapan bahasa Arab dan Inggris santri di lingkungan madrasah.',
    },
    {
      judul: 'Kajian Kitab Kuning Bersama Pengasuh',
      waktu: 'Ba’da Maghrib Setiap Hari',
      url: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=600&auto=format&fit=crop&q=80',
      caption: 'Sorogan dan wetonan kitab Fathul Qorib bersama K.H. Ahmad Dahlan Masyhuri.',
    },
    {
      judul: 'Upacara Disiplin & Pidato Tiga Bahasa',
      waktu: 'Malam Ahad (Khutbatul Arsy)',
      url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80',
      caption: 'Latihan kepemimpinan dan orasi santri dalam Bahasa Arab, Inggris, dan Indonesia.',
    },
  ];

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Landmark className="w-6 h-6 text-emerald-700" />
            <span>Profil & Sejarah Madrasah Takmiliyah</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Sejarah Madrasah, visi misi madrasah takmiliyah
          </p>
        </div>

        <button
          onClick={() => setShowPdfModal(true)}
          id="btn-cetak-profil-pesantren"
          className="flex items-center gap-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Dokumen Profil PDF</span>
        </button>
      </div>

      {/* Hero Brand Identity Box */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden border border-emerald-800">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold mb-3 border border-amber-400/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Unit Diniyah Formal • PP. Bahrul Ulum Tambakberas</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {PESANTREN_INFO.namaLengkap}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-200 mt-2 font-serif italic">
              &ldquo;{PESANTREN_INFO.tagline}&rdquo;
            </p>
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-emerald-300">
              <span>📍 {PESANTREN_INFO.alamat}</span>
              <span>📞 {PESANTREN_INFO.telepon}</span>
              <span>🌐 {PESANTREN_INFO.website}</span>
            </div>
          </div>
          <div className="shrink-0 bg-white/10 p-3 rounded-2xl border border-white/20 backdrop-blur-xs">
            <img
              src="/logo.png"
              alt="Logo Madrasah Takmiliyah Annajiyah 2"
              className="w-24 h-24 sm:w-28 sm:h-28 object-contain drop-shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* 1. Sejarah Pendirian & 2. Tokoh Pendiri */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Landmark className="w-5 h-5 text-emerald-700" />
            <span>1. Sejarah Singkat Pendirian</span>
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed">
            {PESANTREN_INFO.sejarah}
          </p>
          <p className="text-xs text-slate-700 leading-relaxed">
            Dalam perkembangannya, Madrasah Takmiliyah menyelenggarakan masa belajar berjenjang kelas 1 hingga kelas 6, memadukan kurikulum kitab kuning salaf dan penguatan muhafadloh nadhom secara terpadu.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-700" />
            <span>2. Tokoh Pendiri & Masyayikh</span>
          </h3>
          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
            <div className="font-bold text-emerald-950 text-sm">{PESANTREN_INFO.tokohPendiri}</div>
            <div className="text-[11px] text-emerald-800 font-semibold mt-0.5">Pendiri & Pengasuh Utama (2004 - Sekarang)</div>
            
          </div>
          
        </div>
      </div>

      {/* 3. Visi & Misi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-emerald-900 text-white rounded-3xl p-6 shadow-md border border-emerald-950">
          <div className="flex items-center gap-2 mb-3">
            <Compass className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Visi Pesantren</h3>
          </div>
          <p className="text-sm font-serif italic text-emerald-100 leading-relaxed bg-emerald-800/60 p-4 rounded-2xl border border-emerald-700/60">
            &ldquo;{PESANTREN_INFO.visi}&rdquo;
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            <h3 className="text-base font-bold text-slate-900">Misi Pesantren</h3>
          </div>
          <ul className="space-y-2 text-xs text-slate-700">
            {PESANTREN_INFO.misi.map((m, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-snug">{m}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 4. Nilai dan Panca Jiwa Pesantren */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <div className="mb-4">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-emerald-700" />
            <span>4. Nilai & Panca Jiwa Pesantren</span>
          </h3>
          <p className="text-xs text-slate-500">Lima prinsip filosofis yang mengakar dalam setiap helaan nafas kehidupan santri</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {PESANTREN_INFO.pancaJiwa.map((item, idx) => (
            <div key={idx} className="bg-slate-50 hover:bg-emerald-50/50 p-4 rounded-2xl border border-slate-200 transition-colors">
              <span className="text-[10px] font-mono text-emerald-800 font-bold block mb-1">
                JIWA 0{idx + 1}
              </span>
              <h4 className="text-sm font-bold text-slate-900 mb-1">
                {item.nama}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {item.makna}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Struktur Organisasi */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <h3 className="text-base font-extrabold text-slate-900 mb-4 flex items-center gap-2">
          <Building className="w-5 h-5 text-emerald-700" />
          <span>5. Struktur Organisasi Pesantren</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="bg-emerald-800 text-white p-4 rounded-2xl shadow-xs">
            <div className="text-[10px] uppercase font-bold text-amber-300">Pimpinan Pesantren</div>
            <div className="text-sm font-extrabold mt-1">Pengasuh</div>
            <div className="text-xs text-emerald-200 mt-0.5">{PESANTREN_INFO.tokohPendiri}</div>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="text-[10px] uppercase font-bold text-slate-400">Bidang Kurikulum</div>
            <div className="text-sm font-extrabold text-slate-900 mt-1">Koordinator Kurikulum Madin</div>
            <div className="text-xs text-slate-600 mt-0.5">Ustadz Drs. H. Mahfudz Siddiq, M.Pd.I</div>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="text-[10px] uppercase font-bold text-slate-400">Bidang Kesantrian</div>
            <div className="text-sm font-extrabold text-slate-900 mt-1">Pengasuhan Santri</div>
            <div className="text-xs text-slate-600 mt-0.5">Ustadz Ahmad Fauzi, Lc., M.Ag.</div>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="text-[10px] uppercase font-bold text-slate-400">Bidang Al-Qur&apos;an &amp; Nadhom</div>
            <div className="text-sm font-extrabold text-slate-900 mt-1">Madrasatul Qur&apos;an &amp; Muhafadloh</div>
            <div className="text-xs text-slate-600 mt-0.5">Ustadz Dr. KH. Luqman Hakim</div>
          </div>
        </div>
      </div>

      

      

      {/* PDF Modal */}
      <PdfPreviewModal
        isOpen={showPdfModal}
        onClose={() => setShowPdfModal(false)}
        type="profil_pesantren"
        title="Buku Profil & Sejarah Pesantren Terpadu"
        data={PESANTREN_INFO}
      />

    </div>
  );
};
