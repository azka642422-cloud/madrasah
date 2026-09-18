-- A source file may have several staging attempts, but only one approved/imported
-- lifecycle for the same type and checksum. Existing conflicts intentionally stop
-- this migration for human review instead of silently choosing a winning batch.
ALTER TABLE import_batches
  ADD COLUMN approved_checksum_key VARCHAR(191)
    GENERATED ALWAYS AS (
      CASE
        WHEN source_checksum IS NOT NULL
          AND TRIM(source_checksum) <> ''
          AND status IN ('APPROVED','IMPORTED')
        THEN CONCAT(source_type, ':', LOWER(TRIM(source_checksum)))
        ELSE NULL
      END
    ) STORED,
  ADD UNIQUE KEY uq_import_approved_checksum (approved_checksum_key);
