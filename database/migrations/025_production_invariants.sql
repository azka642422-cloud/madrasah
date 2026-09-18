-- Fail for review if existing data violate invariants; never choose/delete a record.
ALTER TABLE academic_years
 ADD COLUMN active_slot TINYINT GENERATED ALWAYS AS (CASE WHEN is_active=1 THEN 1 ELSE NULL END) STORED,
 ADD UNIQUE KEY uq_single_active_year(active_slot);
ALTER TABLE homeroom_assignments
 ADD COLUMN active_slot TINYINT GENERATED ALWAYS AS (CASE WHEN active=1 THEN 1 ELSE NULL END) STORED,
 ADD UNIQUE KEY uq_active_homeroom(class_id,academic_year_id,assignment_type,active_slot);
ALTER TABLE documents ADD COLUMN sha256 CHAR(64) NULL;
ALTER TABLE students ADD COLUMN photo_sha256 CHAR(64) NULL;
ALTER TABLE student_assessments
 ADD CONSTRAINT chk_assessment_scores CHECK (
 (mq_kelancaran IS NULL OR mq_kelancaran BETWEEN 0 AND 100) AND
 (mq_makhroj IS NULL OR mq_makhroj BETWEEN 0 AND 100) AND
 (mq_tajwid IS NULL OR mq_tajwid BETWEEN 0 AND 100) AND
 (pengajian_sore IS NULL OR pengajian_sore BETWEEN 0 AND 100));
