-- Migration: Add user profile fields (full_name, bio, avatar_url)
-- Created: 2025-11-29
-- Description: Adds missing user profile fields for enhanced user profiles and leaderboard

-- Add full_name column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);

-- Add bio column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add avatar_url column for custom profile pictures
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500);

-- Add index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Add index on rejection_count for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_users_rejection_count ON users(rejection_count DESC);

-- Update existing users to have NULL values (they can update their profiles later)
-- No data migration needed since these are optional fields
