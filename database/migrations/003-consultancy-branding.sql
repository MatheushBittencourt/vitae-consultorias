-- Migration: Add branding customization to consultancies
-- Date: 2026-01-22

-- Add primary_color column for consultancy branding
ALTER TABLE consultancies 
ADD COLUMN IF NOT EXISTS primary_color VARCHAR(7) DEFAULT '#84CC16';

-- primary_color stores hex color code (e.g., #84CC16 for lime-500)
