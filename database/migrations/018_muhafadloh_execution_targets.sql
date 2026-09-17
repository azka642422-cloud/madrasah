-- Official Muhafadloh target metadata is stored separately from per-student scores.
-- This migration creates structure only: it does not invent Kitab/Batasan, dates, or open M2-M8.
CREATE TABLE muhafadloh_execution_targets (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  academic_year_id BIGINT UNSIGNED NOT NULL,
  class_id BIGINT UNSIGNED NOT NULL,
  execution_no TINYINT UNSIGNED NOT NULL,
  kitab VARCHAR(255) NULL,
  batasan VARCHAR(500) NULL,
  execution_date DATE NULL,
  status ENUM('PLANNED','OPEN','CLOSED') NOT NULL DEFAULT 'PLANNED',
  created_by BIGINT UNSIGNED NULL,
  updated_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_muhafadloh_target (academic_year_id,class_id,execution_no),
  INDEX idx_muhafadloh_target_status (academic_year_id,class_id,status),
  CONSTRAINT fk_muhafadloh_target_year FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
  CONSTRAINT fk_muhafadloh_target_class FOREIGN KEY (class_id) REFERENCES classes(id),
  CONSTRAINT fk_muhafadloh_target_creator FOREIGN KEY (created_by) REFERENCES users(id),
  CONSTRAINT fk_muhafadloh_target_updater FOREIGN KEY (updated_by) REFERENCES users(id),
  CONSTRAINT chk_muhafadloh_execution_no CHECK (execution_no BETWEEN 1 AND 8)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
