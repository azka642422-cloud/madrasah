-- Standardize Word master matching terminology with attendance and Muhafadloh staging.
ALTER TABLE import_student_rows
  MODIFY match_status ENUM('UNMATCHED','EXACT_OFFICIAL_NIS','EXACT_NAME_REVIEW','AMBIGUOUS','APPROVED') NOT NULL DEFAULT 'UNMATCHED';
