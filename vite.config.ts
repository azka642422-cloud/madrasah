import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

const root = __dirname;

export default defineConfig(() => ({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(root, '.') },
      { find: /^\.\/LoginView$/, replacement: path.resolve(root, 'LoginViewProduction.tsx') },
      { find: /^\.\/Navbar$/, replacement: path.resolve(root, 'NavbarProduction.tsx') },
      { find: /^\.\/GlobalSearchModal$/, replacement: path.resolve(root, 'GlobalSearchModalProduction.tsx') },
      { find: /^\.\/NilaiView$/, replacement: path.resolve(root, 'NilaiViewProduction.tsx') },
      { find: /^\.\/JadwalView$/, replacement: path.resolve(root, 'JadwalViewProduction.tsx') },
      { find: /^\.\/SilabusView$/, replacement: path.resolve(root, 'SilabusViewProduction.tsx') },
      { find: /^\.\/MateriView$/, replacement: path.resolve(root, 'MateriViewProduction.tsx') },
      { find: /^\.\/BukuKerjaGuruView$/, replacement: path.resolve(root, 'BukuKerjaGuruViewProduction.tsx') },
      { find: /^\.\/BukuKerjaSiswaView$/, replacement: path.resolve(root, 'BukuKerjaSiswaViewProduction.tsx') },
      { find: /^\.\/SoalUjianView$/, replacement: path.resolve(root, 'SoalUjianViewProduction.tsx') },
      { find: /^\.\/RaportView$/, replacement: path.resolve(root, 'RaportViewProduction.tsx') },
      { find: /^\.\/IjazahView$/, replacement: path.resolve(root, 'IjazahViewProduction.tsx') },
      { find: /^\.\/PengumumanView$/, replacement: path.resolve(root, 'PengumumanViewProduction.tsx') },
      { find: /^\.\/HariLiburView$/, replacement: path.resolve(root, 'HariLiburViewProduction.tsx') },
      { find: /^\.\/PesantrenInfoView$/, replacement: path.resolve(root, 'PesantrenInfoViewProduction.tsx') },
      { find: /^\.\/PeraturanGuruView$/, replacement: path.resolve(root, 'PeraturanGuruViewProduction.tsx') },
      { find: /^\.\/DashboardAdmin$/, replacement: path.resolve(root, 'DashboardAdminProduction.tsx') },
      { find: /^\.\/DashboardGuru$/, replacement: path.resolve(root, 'DashboardGuruProduction.tsx') },
      { find: /^\.\/DashboardSiswa$/, replacement: path.resolve(root, 'DashboardSiswaProduction.tsx') },
      { find: /^\.\/PengaturanView$/, replacement: path.resolve(root, 'PengaturanViewProduction.tsx') },
      { find: /^\.\.\/types$/, replacement: path.resolve(root, 'types.ts') },
      { find: /^\.\.\/services\/storageService$/, replacement: path.resolve(root, 'storageServiceProduction.ts') },
      { find: /^\.\.\/components\/(.+)$/, replacement: path.resolve(root, '$1') },
      { find: /^\.\.\/views\/(.+)$/, replacement: path.resolve(root, '$1') },
      { find: /^\.\.\/data\/(.+)$/, replacement: path.resolve(root, '$1') },
      { find: /^\.\.\/services\/(.+)$/, replacement: path.resolve(root, '$1') },
      { find: /^\.\.\/utils\/(.+)$/, replacement: path.resolve(root, '$1') },
    ],
  },
  server: {
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
}));
