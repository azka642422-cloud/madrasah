-- Enforce at database level that each class/year has at most one OPEN Muhafadloh execution.
-- NULL values in a UNIQUE key remain non-conflicting, so PLANNED/CLOSED rows are unaffected.
ALTER TABLE muhafadloh_execution_targets
  ADD COLUMN open_slot TINYINT
    GENERATED ALWAYS AS (CASE WHEN status='OPEN' THEN 1 ELSE NULL END) STORED,
  ADD UNIQUE KEY uq_muhafadloh_single_open (academic_year_id,class_id,open_slot);
