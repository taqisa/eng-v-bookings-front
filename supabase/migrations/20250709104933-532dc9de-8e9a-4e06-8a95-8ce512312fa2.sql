-- Add missing Google Calendar integration columns to providers table
ALTER TABLE public.providers 
ADD COLUMN IF NOT EXISTS google_access_token TEXT,
ADD COLUMN IF NOT EXISTS google_refresh_token TEXT,
ADD COLUMN IF NOT EXISTS google_calendar_id TEXT DEFAULT 'primary',
ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMP WITH TIME ZONE;

-- Update any existing providers to have default calendar ID
UPDATE providers 
SET google_calendar_id = 'primary' 
WHERE google_calendar_id IS NULL;