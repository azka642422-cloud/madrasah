-- Structural authorization seed only. No user/password/demo account is created.

INSERT INTO roles (code,name) VALUES
('SUPER_ADMIN','Super Admin'),
('ADMIN','Admin'),
('GURU','Guru'),
('SANTRI','Santri');

INSERT INTO permissions (code,description) VALUES
('students.manage','Kelola master santri'),
('teachers.manage','Kelola master guru'),
('classes.manage','Kelola kelas'),
('schedules.manage','Kelola jadwal dan pengampu'),
('attendance.manage','Kelola absensi sesuai kewenangan'),
('grades.manage','Kelola nilai sesuai kewenangan'),
('muhafadloh.manage','Kelola Muhafadloh sesuai kewenangan'),
('reports.manage','Kelola/publikasikan raport sesuai kewenangan'),
('certificates.manage','Kelola/penerbitan ijazah'),
('documents.manage','Kelola dokumen'),
('announcements.manage','Kelola pengumuman'),
('accounts.operational.manage','Kelola akun operasional selain Super Admin'),
('settings.operational.manage','Kelola pengaturan operasional'),
('own.academic.read','Baca data akademik milik sendiri'),
('teaching.scope.read','Baca data dalam scope penugasan guru'),
('feedback.create','Kirim kritik/saran guru'),
('feedback.manage','Kelola kritik/saran'),
('system.settings.manage','Kelola konfigurasi teknis sistem'),
('integrations.manage','Kelola integrasi/API aplikasi'),
('app.configuration.manage','Kelola konfigurasi aplikasi/PWA/mobile'),
('feature.configuration.manage','Kelola konfigurasi fitur teknis'),
('system.audit.read','Baca audit sistem'),
('superadmin.accounts.manage','Kelola akun Super Admin');

-- SUPER_ADMIN receives all permissions.
INSERT INTO role_permissions (role_id,permission_id)
SELECT r.id,p.id FROM roles r CROSS JOIN permissions p WHERE r.code='SUPER_ADMIN';

-- ADMIN: operational authority only. No technical/super-admin account permissions.
INSERT INTO role_permissions (role_id,permission_id)
SELECT r.id,p.id FROM roles r JOIN permissions p ON p.code IN (
 'students.manage','teachers.manage','classes.manage','schedules.manage',
 'attendance.manage','grades.manage','muhafadloh.manage','reports.manage',
 'certificates.manage','documents.manage','announcements.manage',
 'accounts.operational.manage','settings.operational.manage','feedback.manage'
) WHERE r.code='ADMIN';

-- GURU permissions remain subject to server-side assignment/homeroom scope.
INSERT INTO role_permissions (role_id,permission_id)
SELECT r.id,p.id FROM roles r JOIN permissions p ON p.code IN (
 'teaching.scope.read','attendance.manage','grades.manage','muhafadloh.manage',
 'reports.manage','feedback.create'
) WHERE r.code='GURU';

-- SANTRI: backend must resolve user -> student; never accept arbitrary student_id as authority.
INSERT INTO role_permissions (role_id,permission_id)
SELECT r.id,p.id FROM roles r JOIN permissions p ON p.code='own.academic.read'
WHERE r.code='SANTRI';
