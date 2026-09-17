# Tests

Test production wajib mencakup:

- `auth/` — login/logout/session/password lifecycle.
- `authorization/` — vertical dan horizontal privilege escalation untuk SUPER_ADMIN, ADMIN, GURU, SANTRI.
- `api/` — validasi kontrak endpoint dan error handling.
- `import/` — rekonsiliasi Word/Excel, NIS resmi, santri aktif/boyong, dan data ambigu.
- `integration/` — alur Absensi → Nilai/Muhafadloh → Raport/Ijazah sesuai aturan bisnis.

Kriteria keamanan minimum: Santri tidak dapat membaca data santri lain; Guru tidak dapat membaca/mengubah data di luar assignment; Admin tidak dapat memperoleh atau mengelola privilege Super Admin; manipulasi URL/body/query tidak boleh memperluas scope.