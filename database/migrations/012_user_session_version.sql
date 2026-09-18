-- Increment this value whenever all existing sessions for an account must be revoked.
ALTER TABLE users
  ADD COLUMN session_version INT UNSIGNED NOT NULL DEFAULT 1 AFTER must_change_password;
