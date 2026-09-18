# Kebijakan Import Data Resmi

Folder ini untuk script/staging import, bukan untuk menyimpan kredensial atau dump production.

## Prioritas sumber

1. Word: master santri AKTIF dan NIS resmi. NIS Excel tidak boleh menimpa NIS Word.
2. Excel Absensi: histori absensi. Baris santri boyong boleh dipertahankan bila identitas dapat dipastikan, tetapi keberadaan di Excel bukan bukti status aktif.
3. Data Muhafadloh: data aktual. Pada kondisi saat finalisasi dimulai baru M1 yang telah berjalan; M2-M8 harus NULL sampai pelaksanaan masing-masing.
4. Data Nilai resmi: sumber nilai akademik.
5. Contoh Raport dan Ijazah: sumber format dokumen, bukan sumber untuk membuat nilai/data palsu.

## Rekonsiliasi identitas

Semua data operasional akhirnya harus menunjuk ke `students.id`. NIS adalah business identifier resmi dan unik, tetapi bukan foreign key histori. Jika kecocokan sumber ambigu, baris harus masuk staging/review dan tidak boleh ditebak otomatis.

## Status santri

- ACTIVE berasal dari master aktif Word.
- BOYONG dapat ditetapkan untuk histori lama bila identitas dan statusnya dapat diverifikasi.
- GRADUATED ditetapkan melalui proses kelulusan resmi, bukan karena kelas 6 saja.

## Larangan

- Jangan import `mockData.ts`.
- Jangan membuat nilai, absensi, Muhafadloh, Raport atau Ijazah demo.
- Jangan membuat M2-M8 sebelum pelaksanaannya.
- Jangan membuat fitur hafalan Al-Qur'an 2 juz.
- Jangan menyimpan password plaintext pada seed/import.
