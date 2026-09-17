ALTER TABLE certificates
  ADD COLUMN final_exam_start_date DATE NULL AFTER hijri_issue_date,
  ADD COLUMN final_exam_end_date DATE NULL AFTER final_exam_start_date,
  ADD COLUMN caretaker_name VARCHAR(150) NULL AFTER final_exam_end_date,
  ADD COLUMN caretaker_title VARCHAR(200) NULL AFTER caretaker_name;
