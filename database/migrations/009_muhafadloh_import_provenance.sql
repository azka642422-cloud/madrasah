ALTER TABLE muhafadloh
  ADD COLUMN m1_import_row_id BIGINT UNSIGNED NULL AFTER m1,
  ADD CONSTRAINT fk_muhafadloh_m1_import_row FOREIGN KEY(m1_import_row_id) REFERENCES import_muhafadloh_rows(id);
CREATE UNIQUE INDEX uq_muhafadloh_m1_import_row ON muhafadloh(m1_import_row_id);
