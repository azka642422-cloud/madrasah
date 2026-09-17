-- Preserve the authoritative origin of a student's official NIS/master identity.
ALTER TABLE students
  ADD COLUMN official_source_batch_id BIGINT UNSIGNED NULL AFTER source_reference,
  ADD CONSTRAINT fk_student_official_source_batch FOREIGN KEY (official_source_batch_id) REFERENCES import_batches(id);

CREATE INDEX idx_students_official_source_batch ON students(official_source_batch_id);
