# Database

Direktori database production.

- `migrations/` — perubahan schema yang versioned dan repeatable.
- `seeds/` — hanya reference/configuration data yang sah; bukan data santri demo.
- `import/` — skrip rekonsiliasi/import sumber resmi.

## Sumber data resmi

- Master santri aktif: Word.
- NIS resmi: Word saja.
- Absensi/histori: Excel/Absensi; baris santri boyong boleh dipertahankan sebagai histori setelah identitas terverifikasi.
- Muhafadloh: dataset Muhafadloh; saat ini pelaksanaan aktual baru M1. M2–M8 tetap kosong sampai dilaksanakan.
- Nilai: data Nilai resmi.
- Raport dan Ijazah: data database + format dokumen resmi yang diberikan.

Relasi akademik memakai `student_id` internal, bukan nama atau NIS sebagai foreign key. Konflik/identity match ambigu tidak boleh diputuskan otomatis.