-- Signature PDF management is an operational Admin/Super Admin capability.
-- Guru may consume a locked signature through report publication scope, but may not upload/replace assets.
INSERT INTO permissions(code,description)
VALUES('report.signatures.manage','Kelola aset PDF tanda tangan Raport')
ON DUPLICATE KEY UPDATE description=VALUES(description);

INSERT IGNORE INTO role_permissions(role_id,permission_id)
SELECT r.id,p.id FROM roles r JOIN permissions p ON p.code='report.signatures.manage'
WHERE r.code IN('SUPER_ADMIN','ADMIN');
