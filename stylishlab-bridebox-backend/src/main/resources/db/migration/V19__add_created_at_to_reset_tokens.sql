-- Add missing created_at column to password_reset_tokens table
-- This is a recovery migration in case V17 was applied without this column
ALTER TABLE password_reset_tokens ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
