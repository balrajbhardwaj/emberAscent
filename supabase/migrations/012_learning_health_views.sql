/**
 * Learning Health Check Views and Functions
 * 
 * Creates materialized views and functions to calculate behavioral indicators
 * that may affect exam performance:
 * 
 * 1. Rush Factor - Questions answered too quickly (< 10 seconds)
 * 2. Fatigue Drop-off - Accuracy decline during sessions
 * 3. Stagnant Topics - Topics with no improvement over time
 * 
 * @module supabase/migrations/012_learning_health_views
 */

-- ============================================================================
-- 1. Rush Factor: Questions answered in under 10 seconds
-- ============================================================================

/**
 * Calculates rush factor percentage for a child within a date range
 * 
 * Rush Factor = (Questions answered < 10 seconds / Total questions) * 100
 * 
 * @param p_child_id - The child's UUID
 * @param p_days - Number of days to look back (default: 30)
 * @returns Percentage of rushed questions (0-100)
 */
CREATE OR REPLACE FUNCTION calculate_rush_factor(
  p_child_id uuid,
  p_days integer DEFAULT 30
)
RETURNS numeric AS $$
DECLARE
  v_total_questions integer;
  v_rushed_questions integer;
  v_rush_percentage numeric;
BEGIN
  -- Get total questions answered in the period
  SELECT COUNT(*)
  INTO v_total_questions
  FROM question_attempts
  WHERE child_id = p_child_id
    AND created_at >= NOW() - (p_days || ' days')::interval
    AND time_taken_seconds > 0; -- Exclude invalid times
  
  -- Return 0 if no questions answered
  IF v_total_questions = 0 THEN
    RETURN 0;
  END IF;
  
  -- Count questions answered in under 10 seconds
  SELECT COUNT(*)
  INTO v_rushed_questions
  FROM question_attempts
  WHERE child_id = p_child_id
    AND created_at >= NOW() - (p_days || ' days')::interval
    AND time_taken_seconds > 0
    AND time_taken_seconds < 10;
  
  -- Calculate percentage
  v_rush_percentage := (v_rushed_questions::numeric / v_total_questions::numeric) * 100;
  
  RETURN ROUND(v_rush_percentage, 1);
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- 2. Fatigue Drop-off: Accuracy decline during sessions
-- ============================================================================

/**
 * Calculates fatigue drop-off by comparing accuracy of first vs last 5 questions
 * across recent sessions
 * 
 * Fatigue Drop-off = MAX(First 5 accuracy - Last 5 accuracy) across all sessions
 * Reports the worst case fatigue pattern, not the average
 * 
 * @param p_child_id - The child's UUID
 * @param p_days - Number of days to look back (default: 30)
 * @returns Percentage point drop in accuracy (0-100)
 */
CREATE OR REPLACE FUNCTION calculate_fatigue_dropoff(
  p_child_id uuid,
  p_days integer DEFAULT 30
)
RETURNS numeric AS $$
DECLARE
  v_max_dropoff numeric;
BEGIN
  -- Calculate accuracy drop within each session, return the maximum
  WITH session_comparisons AS (
    SELECT 
      session_id,
      -- First 5 questions accuracy
      (SELECT AVG(CASE WHEN is_correct THEN 100.0 ELSE 0.0 END)
       FROM (
         SELECT is_correct, ROW_NUMBER() OVER (ORDER BY created_at) as rn
         FROM question_attempts
         WHERE session_id = qa_outer.session_id
       ) first_five
       WHERE rn <= 5
      ) as first_five_accuracy,
      -- Last 5 questions accuracy  
      (SELECT AVG(CASE WHEN is_correct THEN 100.0 ELSE 0.0 END)
       FROM (
         SELECT is_correct, ROW_NUMBER() OVER (ORDER BY created_at DESC) as rn
         FROM question_attempts
         WHERE session_id = qa_outer.session_id
       ) last_five
       WHERE rn <= 5
      ) as last_five_accuracy
    FROM (
      SELECT DISTINCT session_id
      FROM question_attempts
      WHERE child_id = p_child_id
        AND created_at >= NOW() - (p_days || ' days')::interval
    ) qa_outer
    WHERE (
      SELECT COUNT(*) 
      FROM question_attempts 
      WHERE session_id = qa_outer.session_id
    ) >= 10  -- Only sessions with at least 10 questions
  )
  SELECT COALESCE(MAX(first_five_accuracy - last_five_accuracy), 0)
  INTO v_max_dropoff
  FROM session_comparisons
  WHERE first_five_accuracy IS NOT NULL 
    AND last_five_accuracy IS NOT NULL
    AND (first_five_accuracy - last_five_accuracy) > 0;  -- Only count drops, not improvements
  
  RETURN GREATEST(0, ROUND(v_max_dropoff, 1));
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- 3. Stagnant Topics: Topics with no improvement in recent period
-- ============================================================================

/**
 * Counts topics where accuracy has not improved (or declined) over 2 weeks
 * 
 * Compares accuracy in last 7 days vs previous 7 days.
 * A topic is stagnant if:
 * - Recent accuracy <= previous accuracy, OR
 * - Fewer than 5 attempts in recent period
 * 
 * @param p_child_id - The child's UUID
 * @returns Count of stagnant topics
 */
CREATE OR REPLACE FUNCTION calculate_stagnant_topics(
  p_child_id uuid
)
RETURNS integer AS $$
DECLARE
  v_stagnant_count integer;
BEGIN
  WITH topic_performance AS (
    SELECT 
      q.subject,
      q.topic,
      -- Recent 7 days
      COUNT(CASE WHEN qa.created_at >= NOW() - interval '7 days' THEN 1 END) as recent_attempts,
      AVG(CASE 
        WHEN qa.created_at >= NOW() - interval '7 days' AND qa.is_correct 
        THEN 100.0 
        WHEN qa.created_at >= NOW() - interval '7 days'
        THEN 0.0
      END) as recent_accuracy,
      -- Previous 7 days (8-14 days ago)
      COUNT(CASE 
        WHEN qa.created_at >= NOW() - interval '14 days' 
        AND qa.created_at < NOW() - interval '7 days' 
        THEN 1 
      END) as previous_attempts,
      AVG(CASE 
        WHEN qa.created_at >= NOW() - interval '14 days' 
        AND qa.created_at < NOW() - interval '7 days' 
        AND qa.is_correct 
        THEN 100.0
        WHEN qa.created_at >= NOW() - interval '14 days' 
        AND qa.created_at < NOW() - interval '7 days'
        THEN 0.0
      END) as previous_accuracy
    FROM question_attempts qa
    INNER JOIN questions q ON qa.question_id = q.id
    WHERE qa.child_id = p_child_id
      AND qa.created_at >= NOW() - interval '14 days'
      AND q.topic IS NOT NULL
    GROUP BY q.subject, q.topic
  )
  SELECT COUNT(*)
  INTO v_stagnant_count
  FROM topic_performance
  WHERE 
    -- Topic has been attempted in both periods
    recent_attempts >= 3
    AND previous_attempts >= 3
    -- Accuracy has not improved (or has declined)
    AND COALESCE(recent_accuracy, 0) <= COALESCE(previous_accuracy, 0);
  
  RETURN COALESCE(v_stagnant_count, 0);
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- 4. Combined Learning Health Check View
-- ============================================================================

/**
 * Get all learning health metrics for a child
 * 
 * @param p_child_id - The child's UUID
 * @param p_days - Number of days to look back (default: 30)
 * @returns JSON with all three metrics
 */
CREATE OR REPLACE FUNCTION get_learning_health_check(
  p_child_id uuid,
  p_days integer DEFAULT 30
)
RETURNS json AS $$
DECLARE
  v_result json;
BEGIN
  SELECT json_build_object(
    'rushFactor', calculate_rush_factor(p_child_id, p_days),
    'fatigueDropOff', calculate_fatigue_dropoff(p_child_id, p_days),
    'stagnantTopics', calculate_stagnant_topics(p_child_id),
    'calculatedAt', NOW()
  )
  INTO v_result;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- Grant permissions
-- ============================================================================

GRANT EXECUTE ON FUNCTION calculate_rush_factor(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_fatigue_dropoff(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_stagnant_topics(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_learning_health_check(uuid, integer) TO authenticated;

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON FUNCTION calculate_rush_factor IS 
  'Calculates percentage of questions answered in under 10 seconds';

COMMENT ON FUNCTION calculate_fatigue_dropoff IS 
  'Calculates accuracy drop between first and last 5 questions of sessions';

COMMENT ON FUNCTION calculate_stagnant_topics IS 
  'Counts topics with no improvement over 2 weeks';

COMMENT ON FUNCTION get_learning_health_check IS 
  'Returns all learning health metrics for a child in JSON format';
