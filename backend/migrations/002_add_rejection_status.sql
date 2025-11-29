-- Migration: Add status column to rejections table
-- Created: 2025-11-29
-- Description: Adds status field to track rejection lifecycle (pending, converted_to_success, etc.)

-- Add status column with default value
ALTER TABLE rejections 
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';

-- Add index on status for filtering queries
CREATE INDEX IF NOT EXISTS idx_rejections_status ON rejections(status);

-- Possible status values:
-- 'active' - default state, still a rejection
-- 'converted_to_success' - rejection that led to eventual success
-- 'archived' - user archived this rejection
-- 'pending' - rejection in progress (e.g., waiting for response)

COMMENT ON COLUMN rejections.status IS 'Status of the rejection: active, converted_to_success, archived, or pending';
