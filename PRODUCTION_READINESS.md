# Production Readiness — Madrasah Diniyah

Status branch: `refactor/fondasi-production`

## Gate yang sudah tervalidasi CI
- TypeScript typecheck dan build frontend/backend.
- Migrasi MySQL 8.4 diuji dua kali untuk idempotensi.
- Seed role/permission dan schema kritis.
- Isolasi empat role: SUPER_ADMIN, ADMIN, GURU, SANTRI.
- Live API role/IDOR regression.
- Lifecycle Ijazah dan regression produksi.
- Konfigurasi production fail-closed, termasuk HTTPS origin, JWT secret, DB password, dan UPLOAD_ROOT persisten.
- Browser print regression untuk kontrak A4 Raport/Ijazah dan aset logo resmi Bahrul Ulum.

## Data dan workflow yang harus dipertahankan
- Data santri aktif/NIS mengikuti sumber resmi; konflik NIS 26050 tetap REVIEW dan tidak boleh ditebak.
- Muhafadloh M1–M8; nilai yang belum dilaksanakan tetap NULL.
- Tidak ada fitur hafalan Al-Qur'an terpisah.
- PDF tanda tangan Raport hanya Kepala Madrasah; Wali Kelas tetap nama yang dapat dikelola melalui penugasan dan ruang tanda tangan manual.
- Ijazah ISSUED/VOID dan Raport PUBLISHED immutable sesuai workflow.

## Gate sebelum deployment publik
1. Merge/release branch hanya setelah persetujuan eksplisit.
2. Siapkan MySQL production, kredensial, domain HTTPS, dan storage `UPLOAD_ROOT` persisten dengan backup.
3. Isi environment production tanpa placeholder.
4. Jalankan migrasi dan seed permission pada database target.
5. Deploy backend dan frontend dari commit release yang sama.
6. Smoke test login keempat role, scope data, CRUD utama, upload/download dokumen, Raport, Ijazah, dan logout di domain production.
7. Cetak satu Raport dan satu Ijazah dari browser/printer target untuk verifikasi fisik margin, border, logo, dan tanda tangan.
8. Aktifkan backup database/storage dan catat prosedur restore sebelum data operasional dimasukkan.

## Batas status
CI hijau membuktikan kontrak aplikasi yang diotomasi. Kesiapan publik final baru dapat dinyatakan setelah environment target dan smoke/print test production di atas selesai. 
