ALTER TABLE attendance
  ADD COLUMN import_row_id BIGINT UNSIGNED NULL AFTER source,
  ADD CONSTRAINT fk_attendance_import_row FOREIGN KEY(import_row_id) REFERENCES import_attendance_rows(id);
CREATE UNIQUE INDEX uq_attendance_import_row ON attendance(import_row_id);
