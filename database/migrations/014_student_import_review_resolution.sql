-- Explicit Admin/Super Admin decisions for ambiguous Word student master reconciliation.
ALTER TABLE import_student_rows
  MODIFY match_status ENUM(
    'UNMATCHED',
    'EXACT_OFFICIAL_NIS',
    'EXACT_NAME_REVIEW',
    'AMBIGUOUS',
    'REVIEW',
    'RESOLVED_MATCH',
    'RESOLVED_NEW',
    'RESOLVED_HISTORICAL',
    'APPROVED'
  ) NOT NULL DEFAULT 'UNMATCHED';

ALTER TABLE import_student_rows
  ADD COLUMN reviewed_by BIGINT UNSIGNED NULL AFTER review_note,
  ADD COLUMN reviewed_at DATETIME NULL AFTER reviewed_by,
  ADD CONSTRAINT fk_import_student_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES users(id);
