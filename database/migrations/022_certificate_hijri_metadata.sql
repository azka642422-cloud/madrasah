-- Official Ijazah Hijri metadata must be entered explicitly.
-- No automatic Gregorian/Hijri conversion and no example/default values.

ALTER TABLE certificates
  ADD COLUMN hijri_academic_year VARCHAR(50) NULL AFTER hijri_issue_date,
  ADD COLUMN hijri_final_exam_period VARCHAR(150) NULL AFTER final_exam_end_date;
