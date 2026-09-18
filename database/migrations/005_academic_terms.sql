-- Explicit semester periods. Dates must come from official Madrasah configuration/data.
-- No dates are inferred from the academic-year midpoint.
CREATE TABLE academic_terms (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  academic_year_id BIGINT UNSIGNED NOT NULL,
  semester ENUM('GANJIL','GENAP') NOT NULL,
  starts_on DATE NOT NULL,
  ends_on DATE NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_academic_terms_year_semester (academic_year_id,semester),
  CONSTRAINT fk_academic_terms_year FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
  CONSTRAINT chk_academic_terms_dates CHECK (ends_on >= starts_on)
) ENGINE=InnoDB;
