-- Fix fatigue drop-off calculation - correct averaging logic

CREATE OR REPLACE FUNCTION calculate_fatigue_dropoff(
  p_child_id uuid,
  p_days integer DEFAULT 30
)
RETURNS numeric AS $$
DECLARE
  v_max_dropoff numeric;
BEGIN
  -- For each session with 10+ questions, calculate first 5 vs last 5 accuracy
  -- Return the maximum drop-off observed
  WITH session_data AS (
    SELECT 
      session_id,
      is_correct,
      ROW_NUMBER() OVER (PARTITION BY session_id ORDER BY created_at) as question_num,
      COUNT(*) OVER (PARTITION BY session_id) as total_questions
    FROM question_attempts
    WHERE child_id = p_child_id
      AND created_at >= NOW() - (p_days || ' days')::interval
  ),
  session_metrics AS (
    SELECT 
      session_id,
      MAX(total_questions) as total_q,
      -- First 5 accuracy: filter first 5, then average
      (SELECT AVG(CASE WHEN is_correct THEN 100.0 ELSE 0.0 END)
       FROM session_data sd2
       WHERE sd2.session_id = sd.session_id
         AND sd2.question_num <= 5
      ) as first_five_accuracy,
      -- Last 5 accuracy: filter last 5, then average
      (SELECT AVG(CASE WHEN is_correct THEN 100.0 ELSE 0.0 END)
       FROM session_data sd3
       WHERE sd3.session_id = sd.session_id
         AND sd3.question_num > sd3.total_questions - 5
      ) as last_five_accuracy
    FROM session_data sd
    WHERE total_questions >= 10  -- Only sessions with 10+ questions
    GROUP BY session_id
  )
  SELECT COALESCE(MAX(first_five_accuracy - last_five_accuracy), 0)
  INTO v_max_dropoff
  FROM session_metrics
  WHERE first_five_accuracy IS NOT NULL 
    AND last_five_accuracy IS NOT NULL
    AND (first_five_accuracy - last_five_accuracy) > 0;  -- Only drops, not improvements
  
  RETURN GREATEST(0, ROUND(COALESCE(v_max_dropoff, 0), 1));
END;
$$ LANGUAGE plpgsql STABLE;
