-- reports.published_at and reports.published_by already exist in 001_initial_schema.sql.
-- Add only lifecycle audit columns that are not part of the initial schema.
ALTER TABLE reports
 ADD COLUMN created_by BIGINT UNSIGNED NULL AFTER published_by,
 ADD COLUMN updated_by BIGINT UNSIGNED NULL AFTER created_by,
 ADD CONSTRAINT fk_reports_created_by FOREIGN KEY(created_by) REFERENCES users(id),
 ADD CONSTRAINT fk_reports_updated_by FOREIGN KEY(updated_by) REFERENCES users(id);
