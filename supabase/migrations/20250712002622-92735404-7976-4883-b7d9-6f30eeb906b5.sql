-- Add working schedule columns to providers table
ALTER TABLE providers 
ADD COLUMN working_days TEXT[] DEFAULT '{monday,tuesday,wednesday,thursday,friday,saturday,sunday}',
ADD COLUMN working_hours_start TIME DEFAULT '09:00:00',
ADD COLUMN working_hours_end TIME DEFAULT '17:00:00',
ADD COLUMN break_start TIME DEFAULT NULL,
ADD COLUMN break_end TIME DEFAULT NULL,
ADD COLUMN slot_duration INTEGER DEFAULT 30;

-- Update providers with custom schedules
UPDATE providers SET 
  working_days = '{monday,tuesday,wednesday,thursday,friday}',
  working_hours_start = '09:00:00',
  working_hours_end = '17:00:00',
  slot_duration = 30
WHERE id = 'provider_001';