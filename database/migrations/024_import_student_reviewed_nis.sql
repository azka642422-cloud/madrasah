-- Preserve the immutable NIS from the source document while allowing an audited
-- reviewed NIS to be used for reconciliation/apply. NULL means no correction.
ALTER TABLE import_student_rows
  ADD COLUMN reviewed_nis VARCHAR(50) NULL AFTER source_nis;
