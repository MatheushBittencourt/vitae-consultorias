-- Migration: Increase logo_url column size for base64 images
-- Date: 2026-01-22

-- Change logo_url from VARCHAR(500) to MEDIUMTEXT to support base64 encoded images
ALTER TABLE consultancies
MODIFY COLUMN logo_url MEDIUMTEXT;

-- MEDIUMTEXT can hold up to 16MB which is more than enough for any logo
