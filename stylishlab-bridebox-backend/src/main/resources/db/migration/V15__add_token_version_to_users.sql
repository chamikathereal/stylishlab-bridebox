-- Migration to add token_version to users table for Force Logout feature
ALTER TABLE users ADD COLUMN token_version INT NOT NULL DEFAULT 0;
