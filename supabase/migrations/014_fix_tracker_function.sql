-- Migration 014: Fix ambiguous column reference in get_child_performance_tracker
-- 
-- Fixes the "column reference 'child_id' is ambiguous" error by renaming
-- return table columns to avoid conflicts with function parameters
--
-- Created: 2026-01-22

-- Drop existing function
DROP FUNCTION IF EXISTS get_child_performance_tracker(UUID, TEXT);

-- Recreate with non-ambiguous column names
CREATE OR REPLACE FUNCTION get_child_performance_tracker(
  p_child_id UUID,
  p_topic_id TEXT
)
RETURNS TABLE(
  tracker_child_id UUID,
  tracker_topic_id TEXT,
  current_difficulty TEXT,
  recent_correct INTEGER,
  recent_incorrect INTEGER,
  recent_total INTEGER,
  recent_accuracy DECIMAL,
  questions_since_last_adjustment INTEGER,
  total_questions_in_topic INTEGER,
  last_adjustment_at TIMESTAMPTZ,
  total_correct INTEGER,
  total_incorrect INTEGER,
  overall_accuracy DECIMAL,
  current_streak INTEGER,
  best_streak INTEGER,
  last_attempted_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create tracker if doesn't exist
  INSERT INTO child_topic_performance (child_id, topic_id)
  VALUES (p_child_id, p_topic_id)
  ON CONFLICT (child_id, topic_id) DO NOTHING;
  
  -- Return tracker
  RETURN QUERY
  SELECT 
    ctp.child_id,
    ctp.topic_id,
    ctp.current_difficulty,
    ctp.recent_correct,
    ctp.recent_incorrect,
    ctp.recent_total,
    ctp.recent_accuracy,
    ctp.questions_since_last_adjustment,
    ctp.total_questions_in_topic,
    ctp.last_adjustment_at,
    ctp.total_correct,
    ctp.total_incorrect,
    ctp.overall_accuracy,
    ctp.current_streak,
    ctp.best_streak,
    ctp.last_attempted_at
  FROM child_topic_performance ctp
  WHERE ctp.child_id = p_child_id AND ctp.topic_id = p_topic_id;
END;
$$;
