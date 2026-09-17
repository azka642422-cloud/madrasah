# Import/Reconciliation Workflow

Urutan wajib:

1. Import Word sebagai master santri aktif dan NIS resmi.
2. Review hasil Word sebelum menetapkan master production.
3. Stage Excel Absensi. NIS Excel hanya referensi pencocokan dan tidak pernah mengubah NIS resmi.
4. Cocokkan otomatis hanya jika NIS sumber sama persis dengan NIS resmi Word.
5. Kecocokan nama/kelas hanya kandidat review (`NAME_CLASS_REVIEW`), bukan auto-match.
6. Data ambigu/unmatched berhenti di staging sampai disetujui manusia.
7. Histori santri yang sudah boyong boleh dipertahankan setelah identitas terverifikasi, tetapi tidak mengubahnya menjadi ACTIVE.
8. Stage data Muhafadloh aktual. Saat ini hanya M1 yang boleh diisi; M2-M8 tetap NULL.
9. Import nilai resmi setelah identitas santri terhubung ke `student_id`.

Tidak ada script yang boleh menggunakan keberadaan nama di Excel sebagai bukti bahwa santri masih aktif. Tidak ada fuzzy matching otomatis yang langsung menulis production.

File sumber resmi tidak disalin ke repository bila berisi data pribadi. Script membaca file pada lingkungan import/deployment dan database menyimpan provenance melalui `import_batches`/`source_reference`.
