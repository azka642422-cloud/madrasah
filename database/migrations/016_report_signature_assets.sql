-- Private signature assets used for Raport publication.
-- PDF remains the authoritative uploaded source. Published reports lock asset ids/checksums in snapshot_json.
CREATE TABLE report_signature_assets (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  signer_role ENUM('KEPALA_MADRASAH','WALI_KELAS') NOT NULL,
  signer_name VARCHAR(150) NOT NULL,
  signer_title VARCHAR(150) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  mime_type VARCHAR(100) NOT NULL DEFAULT 'application/pdf',
  file_size BIGINT UNSIGNED NOT NULL,
  sha256 CHAR(64) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  uploaded_by BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_report_signature_uploader FOREIGN KEY(uploaded_by) REFERENCES users(id),
  INDEX idx_report_signature_role_active(signer_role,active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
