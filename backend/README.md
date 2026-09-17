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