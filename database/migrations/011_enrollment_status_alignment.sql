-- Application flows close an active enrollment as WITHDRAWN for BOYONG/INACTIVE students.
-- Keep historical BOYONG/INACTIVE values readable while adding the canonical closed state.
ALTER TABLE student_enrollments
  MODIFY status ENUM('ACTIVE','BOYONG','PROMOTED','GRADUATED','INACTIVE','WITHDRAWN') NOT NULL DEFAULT 'ACTIVE';
