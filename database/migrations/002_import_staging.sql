-- Staging area for official source reconciliation. Never treat staging rows as production records.
CREATE TABLE import_batches (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 source_type ENUM('WORD_STUDENT_MASTER','EXCEL_ATTENDANCE','MUHAFADLOH','GRADES') NOT NULL,
 source_name VARCHAR(255) NOT NULL,
 source_checksum VARCHAR(128) NULL,
 status ENUM('STAGED','REVIEW_REQUIRED','APPROVED','IMPORTED','FAILED') NOT NULL DEFAULT 'STAGED',
 created_by BIGINT UNSIGNED NULL,
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 approved_by BIGINT UNSIGNED NULL,
 approved_at DATETIME NULL,
 CONSTRAINT fk_import_batch_creator FOREIGN KEY(created_by) REFERENCES users(id),
 CONSTRAINT fk_import_batch_approver FOREIGN KEY(approved_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE import_student_rows (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 batch_id BIGINT UNSIGNED NOT NULL,
 source_row_number INT UNSIGNED NOT NULL,
 source_nis VARCHAR(100) NULL,
 source_name VARCHAR(255) NOT NULL,
 source_class VARCHAR(50) NULL,
 birth_place VARCHAR(100) NULL,
 birth_date DATE NULL,
 matched_student_id BIGINT UNSIGNED NULL,
 match_status ENUM('UNMATCHED','EXACT_NIS','EXACT_NAME_REVIEW','AMBIGUOUS','APPROVED') NOT NULL DEFAULT 'UNMATCHED',
 review_note VARCHAR(500) NULL,
 UNIQUE KEY uq_import_student_row(batch_id,source_row_number),
 CONSTRAINT fk_import_student_batch FOREIGN KEY(batch_id) REFERENCES import_batches(id) ON DELETE CASCADE,
 CONSTRAINT fk_import_student_match FOREIGN KEY(matched_student_id) REFERENCES students(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE import_attendance_rows (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 batch_id BIGINT UNSIGNED NOT NULL,
 source_row_number INT UNSIGNED NOT NULL,
 source_nis VARCHAR(100) NULL COMMENT 'Reference only; never overwrites official Word NIS',
 source_name VARCHAR(255) NULL,
 source_class VARCHAR(50) NULL,
 attendance_date DATE NOT NULL,
 attendance_status ENUM('H','S','I','A') NOT NULL,
 matched_student_id BIGINT UNSIGNED NULL,
 match_status ENUM('UNMATCHED','EXACT_OFFICIAL_NIS','NAME_CLASS_REVIEW','AMBIGUOUS','APPROVED') NOT NULL DEFAULT 'UNMATCHED',
 review_note VARCHAR(500) NULL,
 UNIQUE KEY uq_import_attendance_row(batch_id,source_row_number),
 CONSTRAINT fk_import_attendance_batch FOREIGN KEY(batch_id) REFERENCES import_batches(id) ON DELETE CASCADE,
 CONSTRAINT fk_import_attendance_student FOREIGN KEY(matched_student_id) REFERENCES students(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE import_muhafadloh_rows (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 batch_id BIGINT UNSIGNED NOT NULL,
 source_row_number INT UNSIGNED NOT NULL,
 source_nis VARCHAR(100) NULL,
 source_name VARCHAR(255) NULL,
 source_class VARCHAR(50) NULL,
 m1 DECIMAL(8,2) NULL,
 matched_student_id BIGINT UNSIGNED NULL,
 match_status ENUM('UNMATCHED','EXACT_OFFICIAL_NIS','NAME_CLASS_REVIEW','AMBIGUOUS','APPROVED') NOT NULL DEFAULT 'UNMATCHED',
 review_note VARCHAR(500) NULL,
 UNIQUE KEY uq_import_muhafadloh_row(batch_id,source_row_number),
 CONSTRAINT fk_import_muhafadloh_batch FOREIGN KEY(batch_id) REFERENCES import_batches(id) ON DELETE CASCADE,
 CONSTRAINT fk_import_muhafadloh_student FOREIGN KEY(matched_student_id) REFERENCES students(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
