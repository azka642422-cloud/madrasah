-- Madrasah Diniyah Takmiliyah An-Najiyah 2
-- Initial production schema (MySQL 8+)
-- No demo operational data is inserted by this migration.

SET NAMES utf8mb4;
SET time_zone = '+07:00';

CREATE TABLE roles (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(32) NOT NULL UNIQUE,
  name VARCHAR(64) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE permissions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE role_permissions (
  role_id BIGINT UNSIGNED NOT NULL,
  permission_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  CONSTRAINT fk_role_permissions_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  CONSTRAINT fk_role_permissions_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role_id BIGINT UNSIGNED NOT NULL,
  status ENUM('ACTIVE','INACTIVE','LOCKED') NOT NULL DEFAULT 'ACTIVE',
  must_change_password BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE academic_years (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(20) NOT NULL UNIQUE,
  starts_on DATE NULL,
  ends_on DATE NULL,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_academic_year_dates CHECK (ends_on IS NULL OR starts_on IS NULL OR ends_on >= starts_on)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE classes (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  level TINYINT UNSIGNED NOT NULL,
  name VARCHAR(100) NULL,
  room_name VARCHAR(100) NULL,
  floor_name VARCHAR(50) NULL,
  description VARCHAR(255) NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_class_level CHECK (level BETWEEN 1 AND 6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE students (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nis VARCHAR(50) NOT NULL UNIQUE COMMENT 'NIS authoritative from Word source',
  name VARCHAR(150) NOT NULL,
  birth_place VARCHAR(100) NULL,
  birth_date DATE NULL,
  photo_path VARCHAR(500) NULL,
  status ENUM('ACTIVE','BOYONG','GRADUATED','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  source_reference VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_students_name (name),
  INDEX idx_students_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE student_user_links (
  user_id BIGINT UNSIGNED NOT NULL UNIQUE,
  student_id BIGINT UNSIGNED NOT NULL UNIQUE,
  PRIMARY KEY (user_id, student_id),
  CONSTRAINT fk_student_user_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_student_user_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE student_enrollments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id BIGINT UNSIGNED NOT NULL,
  academic_year_id BIGINT UNSIGNED NOT NULL,
  class_id BIGINT UNSIGNED NOT NULL,
  status ENUM('ACTIVE','BOYONG','PROMOTED','GRADUATED','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  started_on DATE NULL,
  ended_on DATE NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_student_enrollment_year (student_id, academic_year_id),
  CONSTRAINT fk_enrollment_student FOREIGN KEY (student_id) REFERENCES students(id),
  CONSTRAINT fk_enrollment_year FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
  CONSTRAINT fk_enrollment_class FOREIGN KEY (class_id) REFERENCES classes(id),
  CONSTRAINT chk_enrollment_dates CHECK (ended_on IS NULL OR started_on IS NULL OR ended_on >= started_on)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE teachers (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  nip_or_identifier VARCHAR(100) NULL UNIQUE,
  photo_path VARCHAR(500) NULL,
  status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_teachers_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE teacher_user_links (
  user_id BIGINT UNSIGNED NOT NULL UNIQUE,
  teacher_id BIGINT UNSIGNED NOT NULL UNIQUE,
  PRIMARY KEY (user_id, teacher_id),
  CONSTRAINT fk_teacher_user_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_teacher_user_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE subjects (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  book_name VARCHAR(255) NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE teaching_assignments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  teacher_id BIGINT UNSIGNED NOT NULL,
  class_id BIGINT UNSIGNED NOT NULL,
  subject_id BIGINT UNSIGNED NOT NULL,
  academic_year_id BIGINT UNSIGNED NOT NULL,
  semester ENUM('GANJIL','GENAP') NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE KEY uq_teaching_assignment (teacher_id,class_id,subject_id,academic_year_id,semester),
  CONSTRAINT fk_assignment_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id),
  CONSTRAINT fk_assignment_class FOREIGN KEY (class_id) REFERENCES classes(id),
  CONSTRAINT fk_assignment_subject FOREIGN KEY (subject_id) REFERENCES subjects(id),
  CONSTRAINT fk_assignment_year FOREIGN KEY (academic_year_id) REFERENCES academic_years(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE homeroom_assignments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  teacher_id BIGINT UNSIGNED NOT NULL,
  class_id BIGINT UNSIGNED NOT NULL,
  academic_year_id BIGINT UNSIGNED NOT NULL,
  assignment_type ENUM('WALI_KELAS','MUSRIF') NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE KEY uq_homeroom_assignment (teacher_id,class_id,academic_year_id,assignment_type),
  CONSTRAINT fk_homeroom_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id),
  CONSTRAINT fk_homeroom_class FOREIGN KEY (class_id) REFERENCES classes(id),
  CONSTRAINT fk_homeroom_year FOREIGN KEY (academic_year_id) REFERENCES academic_years(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE schedules (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  teaching_assignment_id BIGINT UNSIGNED NOT NULL,
  day_of_week ENUM('SENIN','SELASA','RABU','KAMIS','JUMAT','SABTU','MINGGU') NOT NULL,
  starts_at TIME NULL,
  ends_at TIME NULL,
  room_name VARCHAR(100) NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_schedule_assignment FOREIGN KEY (teaching_assignment_id) REFERENCES teaching_assignments(id),
  CONSTRAINT chk_schedule_time CHECK (ends_at IS NULL OR starts_at IS NULL OR ends_at > starts_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE calendar_events (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  academic_year_id BIGINT UNSIGNED NULL,
  title VARCHAR(200) NOT NULL,
  category ENUM('KBM','UJIAN','LIBUR','PONDOK','MUHAFADLOH','LAINNYA') NOT NULL,
  starts_on DATE NOT NULL,
  ends_on DATE NOT NULL,
  description TEXT NULL,
  locks_attendance BOOLEAN NOT NULL DEFAULT FALSE,
  created_by BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_calendar_year FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
  CONSTRAINT fk_calendar_creator FOREIGN KEY (created_by) REFERENCES users(id),
  CONSTRAINT chk_calendar_dates CHECK (ends_on >= starts_on)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE attendance (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id BIGINT UNSIGNED NOT NULL,
  class_id BIGINT UNSIGNED NOT NULL,
  academic_year_id BIGINT UNSIGNED NOT NULL,
  attendance_date DATE NOT NULL,
  status ENUM('H','S','I','A') NOT NULL,
  source ENUM('IMPORT_EXCEL','MANUAL','SYSTEM') NOT NULL DEFAULT 'MANUAL',
  source_reference VARCHAR(255) NULL,
  recorded_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_attendance_student_date (student_id, attendance_date),
  INDEX idx_attendance_class_date (class_id, attendance_date),
  CONSTRAINT fk_attendance_student FOREIGN KEY (student_id) REFERENCES students(id),
  CONSTRAINT fk_attendance_class FOREIGN KEY (class_id) REFERENCES classes(id),
  CONSTRAINT fk_attendance_year FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
  CONSTRAINT fk_attendance_recorder FOREIGN KEY (recorded_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE grades (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id BIGINT UNSIGNED NOT NULL,
  subject_id BIGINT UNSIGNED NOT NULL,
  class_id BIGINT UNSIGNED NOT NULL,
  academic_year_id BIGINT UNSIGNED NOT NULL,
  semester ENUM('GANJIL','GENAP') NOT NULL,
  score DECIMAL(5,2) NULL,
  notes TEXT NULL,
  recorded_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_grade (student_id,subject_id,academic_year_id,semester),
  CONSTRAINT fk_grade_student FOREIGN KEY (student_id) REFERENCES students(id),
  CONSTRAINT fk_grade_subject FOREIGN KEY (subject_id) REFERENCES subjects(id),
  CONSTRAINT fk_grade_class FOREIGN KEY (class_id) REFERENCES classes(id),
  CONSTRAINT fk_grade_year FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
  CONSTRAINT fk_grade_recorder FOREIGN KEY (recorded_by) REFERENCES users(id),
  CONSTRAINT chk_grade_score CHECK (score IS NULL OR (score >= 0 AND score <= 100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE student_assessments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id BIGINT UNSIGNED NOT NULL,
  class_id BIGINT UNSIGNED NOT NULL,
  academic_year_id BIGINT UNSIGNED NOT NULL,
  semester ENUM('GANJIL','GENAP') NOT NULL,
  mq_kelancaran DECIMAL(5,2) NULL,
  mq_makhroj DECIMAL(5,2) NULL,
  mq_tajwid DECIMAL(5,2) NULL,
  pengajian_sore DECIMAL(5,2) NULL,
  kerajinan VARCHAR(100) NULL,
  kerapian VARCHAR(100) NULL,
  kelakuan VARCHAR(100) NULL,
  catatan TEXT NULL,
  keputusan TEXT NULL,
  recorded_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_student_assessment (student_id,academic_year_id,semester),
  CONSTRAINT fk_assessment_student FOREIGN KEY (student_id) REFERENCES students(id),
  CONSTRAINT fk_assessment_class FOREIGN KEY (class_id) REFERENCES classes(id),
  CONSTRAINT fk_assessment_year FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
  CONSTRAINT fk_assessment_recorder FOREIGN KEY (recorded_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE muhafadloh (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id BIGINT UNSIGNED NOT NULL,
  class_id BIGINT UNSIGNED NOT NULL,
  academic_year_id BIGINT UNSIGNED NOT NULL,
  m1 DECIMAL(8,2) NULL,
  m2 DECIMAL(8,2) NULL,
  m3 DECIMAL(8,2) NULL,
  m4 DECIMAL(8,2) NULL,
  m5 DECIMAL(8,2) NULL,
  m6 DECIMAL(8,2) NULL,
  m7 DECIMAL(8,2) NULL,
  m8 DECIMAL(8,2) NULL,
  notes TEXT NULL,
  recorded_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_muhafadloh_student_year (student_id,academic_year_id),
  CONSTRAINT fk_muhafadloh_student FOREIGN KEY (student_id) REFERENCES students(id),
  CONSTRAINT fk_muhafadloh_class FOREIGN KEY (class_id) REFERENCES classes(id),
  CONSTRAINT fk_muhafadloh_year FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
  CONSTRAINT fk_muhafadloh_recorder FOREIGN KEY (recorded_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE reports (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id BIGINT UNSIGNED NOT NULL,
  academic_year_id BIGINT UNSIGNED NOT NULL,
  semester ENUM('GANJIL','GENAP') NOT NULL,
  status ENUM('DRAFT','PUBLISHED','VOID') NOT NULL DEFAULT 'DRAFT',
  published_at DATETIME NULL,
  published_by BIGINT UNSIGNED NULL,
  snapshot_json JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_report_student_term (student_id,academic_year_id,semester),
  CONSTRAINT fk_report_student FOREIGN KEY (student_id) REFERENCES students(id),
  CONSTRAINT fk_report_year FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
  CONSTRAINT fk_report_publisher FOREIGN KEY (published_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE certificates (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id BIGINT UNSIGNED NOT NULL,
  academic_year_id BIGINT UNSIGNED NOT NULL,
  certificate_number VARCHAR(100) NULL UNIQUE,
  issue_place VARCHAR(150) NULL,
  issue_date DATE NULL,
  hijri_issue_date VARCHAR(100) NULL,
  graduation_status ENUM('PENDING','PASSED','NOT_PASSED') NOT NULL DEFAULT 'PENDING',
  status ENUM('DRAFT','ISSUED','VOID') NOT NULL DEFAULT 'DRAFT',
  snapshot_json JSON NULL,
  issued_at DATETIME NULL,
  issued_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_certificate_student_year (student_id,academic_year_id),
  CONSTRAINT fk_certificate_student FOREIGN KEY (student_id) REFERENCES students(id),
  CONSTRAINT fk_certificate_year FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
  CONSTRAINT fk_certificate_issuer FOREIGN KEY (issued_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE documents (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category ENUM('MATERI','BUKU_KERJA_GURU','BUKU_SANTRI','PERATURAN_GURU','SILABUS','SOAL','LAINNYA') NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  file_path VARCHAR(500) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size BIGINT UNSIGNED NOT NULL,
  audience ENUM('ALL','SUPER_ADMIN','ADMIN','GURU','SANTRI') NOT NULL DEFAULT 'ALL',
  published BOOLEAN NOT NULL DEFAULT FALSE,
  uploaded_by BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_document_uploader FOREIGN KEY (uploaded_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE announcements (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  audience ENUM('ALL','GURU','SANTRI') NOT NULL DEFAULT 'ALL',
  published_at DATETIME NULL,
  created_by BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_announcement_creator FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE notifications (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('INFO','WARNING','SUCCESS') NOT NULL DEFAULT 'INFO',
  module VARCHAR(100) NULL,
  entity_id BIGINT UNSIGNED NULL,
  read_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_notifications_user_read (user_id,read_at),
  CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE feedback (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  teacher_id BIGINT UNSIGNED NOT NULL,
  category ENUM('KURIKULUM','KEDISIPLINAN','FASILITAS','SANTRI','LAINNYA') NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  response TEXT NULL,
  responded_by BIGINT UNSIGNED NULL,
  responded_at DATETIME NULL,
  read_at DATETIME NULL,
  archived_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_feedback_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id),
  CONSTRAINT fk_feedback_responder FOREIGN KEY (responded_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE system_settings (
  setting_key VARCHAR(150) PRIMARY KEY,
  setting_value JSON NOT NULL,
  scope ENUM('OPERATIONAL','TECHNICAL') NOT NULL DEFAULT 'OPERATIONAL',
  updated_by BIGINT UNSIGNED NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_setting_updater FOREIGN KEY (updated_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE audit_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NULL,
  entity_id VARCHAR(100) NULL,
  metadata JSON NULL,
  ip_address VARCHAR(45) NULL,
  user_agent VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_user_created (user_id,created_at),
  INDEX idx_audit_entity (entity_type,entity_id),
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
