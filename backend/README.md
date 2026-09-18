# Backend

Backend production menggunakan Node.js + Express dan MySQL.

Struktur target `src/`:
- `config/`
- `middleware/` — authentication, authorization, data scope, validation, error handling.
- `modules/` — auth, users, students, teachers, classes, academic-years, subjects, schedules, attendance, grades, muhafadloh, reports, certificates, documents, announcements, notifications, feedback, settings, integrations, audit.

## Prinsip otorisasi

Urutan setiap endpoint terlindungi:
1. Authentication.
2. Role/permission authorization.
3. Ownership/data-scope authorization.
4. Input validation.
5. Operasi database.

Role tidak pernah dipercaya dari body/query/header buatan frontend. Guru memperoleh scope santri dari assignment server. Santri memperoleh identitas santri dari relasi akun server. Admin tidak dapat mengelola akun Super Admin.

Role resmi: `SUPER_ADMIN`, `ADMIN`, `GURU`, `SANTRI`.

## Runtime production

- Node.js `>=22.13.0` dan MySQL 8.4.
- Jalankan `npm ci --ignore-scripts`, `npm run db:migrate`, seed permission, lalu `npm run build`.
- Backend dijalankan dengan `node backend/dist/server.js`.
- `UPLOAD_ROOT` wajib menunjuk direktori private yang persisten dan ikut dibackup; jangan letakkan di web root.
- Gunakan reverse proxy HTTPS dengan frontend dan `/api` pada origin yang sama. Ini mempertahankan cookie `HttpOnly`, pemeriksaan Origin, dan URL file private.
- `AUTH_JWT_SECRET` wajib secret acak minimal 32 karakter dan tidak boleh disimpan di repository.
- Backup MySQL dan `UPLOAD_ROOT` harus dibuat sebagai satu kebijakan pemulihan karena metadata checksum berada di database sementara byte file berada di storage private.
