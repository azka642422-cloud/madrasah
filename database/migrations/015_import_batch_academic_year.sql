ALTER TABLE import_batches
  ADD COLUMN academic_year_id BIGINT UNSIGNED NULL AFTER source_checksum,
  ADD CONSTRAINT fk_import_batch_academic_year FOREIGN KEY(academic_year_id) REFERENCES academic_years(id);
