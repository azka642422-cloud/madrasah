# Frontend

Frontend production Madrasah Diniyah menggunakan React + Vite.

Struktur target di `src/`:
- `app/` — bootstrap, routing, dan permission-aware navigation.
- `layouts/` — layout, sidebar, navbar, dan mobile navigation.
- `features/` — modul berdasarkan domain akademik/administrasi.
- `services/` — client API; tidak menyimpan database operasional di localStorage.
- `types/` — kontrak tipe frontend.
- `utils/` — utilitas murni.

Role resmi: `SUPER_ADMIN`, `ADMIN`, `GURU`, `SANTRI`.

Catatan keamanan: visibility menu hanya untuk UX. Otorisasi final wajib diputuskan backend untuk setiap request.

## Konfigurasi API

- Default production adalah same-origin: frontend memanggil `/api` pada origin yang sama melalui reverse proxy.
- `VITE_API_URL` boleh diisi origin API tanpa trailing slash bila topologi deployment memang memerlukannya.
- Upload memakai `FormData`; client tidak memaksakan header JSON untuk request multipart.
- Semua request authenticated menggunakan `credentials: include`.
