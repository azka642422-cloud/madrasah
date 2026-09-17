CREATE TABLE import_grade_rows (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 batch_id BIGINT UNSIGNED NOT NULL,
 source_row_number INT UNSIGNED NOT NULL,
 source_nis VARCHAR(100) NULL COMMENT 'Reference only; never overwrites official Word NIS',
 source_name VARCHAR(255) NULL,
 source_class VARCHAR(50) NULL,
 source_subject VARCHAR(150) NOT NULL,
 semester ENUM('GANJIL','GENAP') NOT NULL,
 score DECIMAL(5,2) NULL,
 notes TEXT NULL,
 matched_student_id BIGINT UNSIGNED NULL,
 matched_subject_id BIGINT UNSIGNED NULL,
 match_status ENUM('UNMATCHED','EXACT_OFFICIAL','REVIEW_REQUIRED','AMBIGUOUS','APPROVED') NOT NULL DEFAULT 'UNMATCHED',
 review_note VARCHAR(500) NULL,
 UNIQUE KEY uq_import_grade_row(batch_id,source_row_number),
 CONSTRAINT fk_import_grade_batch FOREIGN KEY(batch_id) REFERENCES import_batches(id) ON DELETE CASCADE,
 CONSTRAINT fk_import_grade_student FOREIGN KEY(matched_student_id) REFERENCES students(id),
 CONSTRAINT fk_import_grade_subject FOREIGN KEY(matched_subject_id) REFERENCES subjects(id),
 CONSTRAINT chk_import_grade_score CHECK(score IS NULL OR(score>=0 AND score<=100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE grades
 ADD COLUMN import_row_id BIGINT UNSIGNED NULL AFTER notes,
 ADD CONSTRAINT fk_grade_import_row FOREIGN KEY(import_row_id) REFERENCES import_grade_rows(id);
CREATE UNIQUE INDEX uq_grade_import_row ON grades(import_row_id);
