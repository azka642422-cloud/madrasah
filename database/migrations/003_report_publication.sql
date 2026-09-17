ALTER TABLE reports
 ADD COLUMN published_at DATETIME NULL AFTER snapshot_json,
 ADD COLUMN published_by BIGINT UNSIGNED NULL AFTER published_at,
 ADD COLUMN created_by BIGINT UNSIGNED NULL AFTER published_by,
 ADD COLUMN updated_by BIGINT UNSIGNED NULL AFTER created_by,
 ADD CONSTRAINT fk_reports_published_by FOREIGN KEY(published_by) REFERENCES users(id),
 ADD CONSTRAINT fk_reports_created_by FOREIGN KEY(created_by) REFERENCES users(id),
 ADD CONSTRAINT fk_reports_updated_by FOREIGN KEY(updated_by) REFERENCES users(id);
