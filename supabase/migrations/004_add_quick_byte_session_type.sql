-- Migration: Add quick_byte session type
-- Purpose: Support Quick Byte daily feature on practice home page

-- Update the session_type CHECK constraint to include 'quick_byte'
ALTER TABLE practice_sessions 
DROP CONSTRAINT IF EXISTS practice_sessions_session_type_check;

ALTER TABLE practice_sessions 
ADD CONSTRAINT practice_sessions_session_type_check 
CHECK (session_type IN ('quick', 'focus', 'mock', 'quick_byte'));

COMMENT ON COLUMN practice_sessions.session_type IS 'quick: 10 questions | focus: topic-specific | mock: timed exam simulation | quick_byte: 4 quick questions on home page (daily)';
