-- Global source imports are administrative operations, separate from scoped manual teaching operations.
INSERT INTO permissions(code,description) VALUES
 ('students.import.manage','Kelola rekonsiliasi master santri dari sumber Word resmi'),
 ('attendance.import.manage','Kelola import absensi Excel global'),
 ('grades.import.manage','Kelola import nilai resmi global'),
 ('muhafadloh.import.manage','Kelola import Muhafadloh resmi global')
ON DUPLICATE KEY UPDATE description=VALUES(description);

-- SUPER_ADMIN inherits every import capability.
INSERT IGNORE INTO role_permissions(role_id,permission_id)
SELECT r.id,p.id FROM roles r CROSS JOIN permissions p
WHERE r.code='SUPER_ADMIN' AND p.code IN(
 'students.import.manage','attendance.import.manage','grades.import.manage','muhafadloh.import.manage'
);

-- ADMIN may perform operational official-source imports.
INSERT IGNORE INTO role_permissions(role_id,permission_id)
SELECT r.id,p.id FROM roles r CROSS JOIN permissions p
WHERE r.code='ADMIN' AND p.code IN(
 'students.import.manage','attendance.import.manage','grades.import.manage','muhafadloh.import.manage'
);

-- Defense in depth for upgraded databases: GURU must never retain global import permissions.
DELETE rp FROM role_permissions rp
JOIN roles r ON r.id=rp.role_id
JOIN permissions p ON p.id=rp.permission_id
WHERE r.code='GURU' AND p.code IN(
 'students.import.manage','attendance.import.manage','grades.import.manage','muhafadloh.import.manage'
);
