ALTER TABLE certificates
 ADD COLUMN created_by BIGINT UNSIGNED NULL AFTER issued_by,
 ADD COLUMN updated_by BIGINT UNSIGNED NULL AFTER created_by,
 ADD COLUMN voided_at DATETIME NULL AFTER updated_by,
 ADD COLUMN voided_by BIGINT UNSIGNED NULL AFTER voided_at,
 ADD CONSTRAINT fk_certificates_created_by FOREIGN KEY(created_by) REFERENCES users(id),
 ADD CONSTRAINT fk_certificates_updated_by FOREIGN KEY(updated_by) REFERENCES users(id),
 ADD CONSTRAINT fk_certificates_voided_by FOREIGN KEY(voided_by) REFERENCES users(id);
