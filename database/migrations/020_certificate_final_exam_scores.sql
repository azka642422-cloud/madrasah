CREATE TABLE certificate_final_exam_scores (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  student_id BIGINT UNSIGNED NOT NULL,
  academic_year_id BIGINT UNSIGNED NOT NULL,
  subject_code ENUM('TASAWWUF','FIQIH','TAUHID','ASWAJA','BACA_KITAB','BACA_AL_QURAN','MUHAFADLOH') NOT NULL,
  score DECIMAL(5,2) NULL,
  created_by BIGINT UNSIGNED NULL,
  updated_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_certificate_final_exam_score (student_id,academic_year_id,subject_code),
  KEY idx_certificate_final_exam_year (academic_year_id),
  CONSTRAINT fk_certificate_final_exam_student FOREIGN KEY (student_id) REFERENCES students(id),
  CONSTRAINT fk_certificate_final_exam_year FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
  CONSTRAINT fk_certificate_final_exam_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_certificate_final_exam_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT chk_certificate_final_exam_score CHECK (score IS NULL OR (score >= 0 AND score <= 100))
) ENGINE=InnoDB;
