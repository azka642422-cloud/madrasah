-- Wali Kelas signature assets must be linked to a stable teacher id, never matched by mutable display name.
-- Existing legacy WALI_KELAS rows remain NULL and are intentionally not guessed/migrated by name.
ALTER TABLE report_signature_assets
  ADD COLUMN teacher_id BIGINT UNSIGNED NULL AFTER signer_role,
  ADD CONSTRAINT fk_report_signature_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id),
  ADD INDEX idx_report_signature_teacher_active (signer_role,teacher_id,active);
