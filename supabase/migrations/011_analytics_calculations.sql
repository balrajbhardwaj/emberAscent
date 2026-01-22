-- =============================================================================
-- ANALYTICS CALCULATION FUNCTIONS
-- Purpose: Move all analytics calculations to database for performance
-- All functions return pre-computed data; API just fetches and returns
-- =============================================================================

-- =============================================================================
-- 1. COMPREHENSIVE ANALYTICS
-- Returns total questions, accuracy, subject breakdown, difficulty breakdown
-- =============================================================================
CREATE OR REPLACE FUNCTION public.get_comprehensive_analytics(
  p_child_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  v_start_date TIMESTAMPTZ;
  v_total_attempts INT;
  v_overall_accuracy NUMERIC;
BEGIN
  v_start_date := CURRENT_DATE - (p_days || ' days')::INTERVAL;

  -- Get overall stats
  SELECT 
    COUNT(*),
    ROUND(AVG(CASE WHEN is_correct THEN 100.0 ELSE 0.0 END), 1)
  INTO v_total_attempts, v_overall_accuracy
  FROM question_attempts qa
  WHERE qa.child_id = p_child_id
    AND qa.created_at >= v_start_date;

  -- Build complete response
  SELECT json_build_object(
    'totalQuestions', COALESCE(v_total_attempts, 0),
    'accuracy', COALESCE(v_overall_accuracy, 0),
    'subjectBreakdown', (
      SELECT COALESCE(json_agg(subject_data), '[]'::json)
      FROM (
        SELECT 
          q.subject,
          COUNT(*) as total,
          SUM(CASE WHEN qa.is_correct THEN 1 ELSE 0 END) as correct,
          ROUND(AVG(CASE WHEN qa.is_correct THEN 100.0 ELSE 0.0 END), 1) as accuracy
        FROM question_attempts qa
        JOIN questions q ON q.id = qa.question_id
        WHERE qa.child_id = p_child_id
          AND qa.created_at >= v_start_date
        GROUP BY q.subject
      ) subject_data
    ),
    'difficultyBreakdown', (
      SELECT COALESCE(json_agg(diff_data), '[]'::json)
      FROM (
        SELECT 
          q.difficulty,
          COUNT(*) as total,
          SUM(CASE WHEN qa.is_correct THEN 1 ELSE 0 END) as correct,
          ROUND(AVG(CASE WHEN qa.is_correct THEN 100.0 ELSE 0.0 END), 1) as accuracy
        FROM question_attempts qa
        JOIN questions q ON q.id = qa.question_id
        WHERE qa.child_id = p_child_id
          AND qa.created_at >= v_start_date
        GROUP BY q.difficulty
      ) diff_data
    ),
    'subjects', (
      SELECT COUNT(DISTINCT q.subject)
      FROM question_attempts qa
      JOIN questions q ON q.id = qa.question_id
      WHERE qa.child_id = p_child_id
        AND qa.created_at >= v_start_date
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- =============================================================================
-- 2. WEAKNESS HEATMAP (Replacing generate_weakness_heatmap)
-- Returns topic-based performance grouped by subject
-- =============================================================================
CREATE OR REPLACE FUNCTION public.get_weakness_heatmap_v2(
  p_child_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  v_start_date TIMESTAMPTZ;
BEGIN
  v_start_date := CURRENT_DATE - (p_days || ' days')::INTERVAL;

  SELECT COALESCE(json_agg(heatmap_data), '[]'::json)
  INTO result
  FROM (
    SELECT 
      q.topic,
      q.subject,
      COUNT(*) as total_attempts,
      SUM(CASE WHEN qa.is_correct THEN 1 ELSE 0 END) as correct_attempts,
      ROUND(AVG(CASE WHEN qa.is_correct THEN 100.0 ELSE 0.0 END), 1) as accuracy,
      CASE 
        WHEN AVG(CASE WHEN qa.is_correct THEN 100.0 ELSE 0.0 END) >= 80 THEN 'mastered'
        WHEN AVG(CASE WHEN qa.is_correct THEN 100.0 ELSE 0.0 END) >= 60 THEN 'progressing'
        ELSE 'needs-work'
      END as mastery_level,
      CASE 
        WHEN AVG(CASE WHEN qa.is_correct THEN 100.0 ELSE 0.0 END) < 60 THEN true
        ELSE false
      END as needs_focus
    FROM question_attempts qa
    JOIN questions q ON q.id = qa.question_id
    WHERE qa.child_id = p_child_id
      AND qa.created_at >= v_start_date
      AND q.topic IS NOT NULL
    GROUP BY q.topic, q.subject
    HAVING COUNT(*) >= 3
    ORDER BY accuracy ASC, total_attempts DESC
  ) heatmap_data;

  RETURN result;
END;
$$;

-- =============================================================================
-- 3. LEARNING HEALTH METRICS
-- Returns rush factor, fatigue drop-off, stagnant topics
-- =============================================================================
CREATE OR REPLACE FUNCTION public.calculate_learning_health_v2(
  p_child_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  v_start_date TIMESTAMPTZ;
  v_rush_factor NUMERIC := 0;
  v_fatigue_dropoff NUMERIC := 0;
  v_stagnant_topics INT := 0;
  v_total_sessions INT;
  v_fast_sessions INT;
BEGIN
  v_start_date := CURRENT_DATE - (p_days || ' days')::INTERVAL;

  -- Calculate Rush Factor: % of sessions with < 15 sec per question
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE 
      EXTRACT(EPOCH FROM (completed_at - started_at)) / NULLIF(total_questions, 0) < 15
    )
  INTO v_total_sessions, v_fast_sessions
  FROM practice_sessions
  WHERE child_id = p_child_id
    AND completed_at IS NOT NULL
    AND started_at >= v_start_date;

  IF v_total_sessions > 0 THEN
    v_rush_factor := ROUND((v_fast_sessions::NUMERIC / v_total_sessions) * 100);
  END IF;

  -- Calculate Fatigue: Average accuracy decline within sessions
  WITH session_analysis AS (
    SELECT 
      session_id,
      COUNT(*) as total_q,
      AVG(CASE WHEN rn <= total_q / 2 THEN 
        CASE WHEN is_correct THEN 100.0 ELSE 0.0 END 
      END) as first_half_acc,
      AVG(CASE WHEN rn > total_q / 2 THEN 
        CASE WHEN is_correct THEN 100.0 ELSE 0.0 END 
      END) as second_half_acc
    FROM (
      SELECT 
        session_id,
        is_correct,
        ROW_NUMBER() OVER (PARTITION BY session_id ORDER BY created_at) as rn,
        COUNT(*) OVER (PARTITION BY session_id) as total_q
      FROM question_attempts
      WHERE child_id = p_child_id
        AND session_id IS NOT NULL
        AND created_at >= v_start_date
    ) ranked
    GROUP BY session_id
    HAVING COUNT(*) >= 8
  )
  SELECT COALESCE(ROUND(AVG(GREATEST(0, first_half_acc - second_half_acc))), 0)
  INTO v_fatigue_dropoff
  FROM session_analysis;

  -- Calculate Stagnant Topics: Topics with >= 5 attempts and < 50% accuracy
  SELECT COUNT(*)
  INTO v_stagnant_topics
  FROM (
    SELECT q.topic
    FROM question_attempts qa
    JOIN questions q ON q.id = qa.question_id
    WHERE qa.child_id = p_child_id
      AND qa.created_at >= v_start_date
      AND q.topic IS NOT NULL
    GROUP BY q.topic
    HAVING COUNT(*) >= 5 
      AND AVG(CASE WHEN qa.is_correct THEN 1.0 ELSE 0.0 END) < 0.5
  ) stagnant;

  SELECT json_build_object(
    'rushFactor', v_rush_factor,
    'fatigueDropOff', v_fatigue_dropoff,
    'stagnantTopics', v_stagnant_topics
  ) INTO result;

  RETURN result;
END;
$$;

-- =============================================================================
-- 4. IMPROVED READINESS SCORE
-- Returns all components needed for readiness display
-- =============================================================================
CREATE OR REPLACE FUNCTION public.calculate_readiness_score_v2(
  p_child_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  v_start_date TIMESTAMPTZ;
  v_overall_accuracy NUMERIC;
  v_total_attempts INT;
  v_unique_topics INT;
  v_days_active INT;
  v_accuracy_score NUMERIC;
  v_coverage_score NUMERIC;
  v_consistency_score NUMERIC;
  v_speed_score NUMERIC;
  v_overall_score NUMERIC;
BEGIN
  v_start_date := CURRENT_DATE - (p_days || ' days')::INTERVAL;

  -- Get basic metrics
  SELECT 
    COUNT(*),
    ROUND(AVG(CASE WHEN is_correct THEN 100.0 ELSE 0.0 END), 1),
    COUNT(DISTINCT DATE(created_at))
  INTO v_total_attempts, v_overall_accuracy, v_days_active
  FROM question_attempts
  WHERE child_id = p_child_id
    AND created_at >= v_start_date;

  -- Get unique topics
  SELECT COUNT(DISTINCT q.topic)
  INTO v_unique_topics
  FROM question_attempts qa
  JOIN questions q ON q.id = qa.question_id
  WHERE qa.child_id = p_child_id
    AND qa.created_at >= v_start_date
    AND q.topic IS NOT NULL;

  -- Calculate component scores (out of their max points)
  v_accuracy_score := LEAST(40, ROUND((COALESCE(v_overall_accuracy, 0) / 100) * 40));
  v_coverage_score := LEAST(20, ROUND((COALESCE(v_unique_topics, 0)::NUMERIC / 10) * 20));
  v_consistency_score := LEAST(15, ROUND((COALESCE(v_days_active, 0)::NUMERIC / 20) * 15));
  v_speed_score := LEAST(15, ROUND((COALESCE(v_total_attempts, 0)::NUMERIC / (GREATEST(p_days, 1) * 10)) * 15));

  v_overall_score := v_accuracy_score + v_coverage_score + v_consistency_score + v_speed_score;

  -- Return scores as percentages for direct display
  SELECT json_build_object(
    'overallScore', ROUND(v_overall_score),
    'accuracyPercent', ROUND((v_accuracy_score / 40) * 100),
    'coveragePercent', ROUND((v_coverage_score / 20) * 100),
    'consistencyPercent', ROUND((v_consistency_score / 15) * 100),
    'speedPercent', ROUND((v_speed_score / 15) * 100),
    'improvementPercent', 0
  ) INTO result;

  RETURN result;
END;
$$;

-- =============================================================================
-- 5. BENCHMARKING CALCULATIONS
-- Returns percentile rankings vs cohort
-- =============================================================================
CREATE OR REPLACE FUNCTION public.calculate_benchmark_percentiles(
  p_child_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  v_start_date TIMESTAMPTZ;
  v_year_group TEXT;
  v_child_accuracy NUMERIC;
  v_overall_percentile INT;
BEGIN
  v_start_date := CURRENT_DATE - (p_days || ' days')::INTERVAL;

  -- Get child's year group and accuracy
  SELECT 
    c.year_group::TEXT,
    ROUND(AVG(CASE WHEN qa.is_correct THEN 100.0 ELSE 0.0 END), 1)
  INTO v_year_group, v_child_accuracy
  FROM children c
  LEFT JOIN question_attempts qa ON qa.child_id = c.id 
    AND qa.created_at >= v_start_date
  WHERE c.id = p_child_id
  GROUP BY c.year_group;

  -- Calculate overall percentile
  WITH cohort_accuracies AS (
    SELECT 
      qa.child_id,
      AVG(CASE WHEN qa.is_correct THEN 100.0 ELSE 0.0 END) as accuracy
    FROM question_attempts qa
    JOIN children c ON c.id = qa.child_id
    WHERE c.year_group = v_year_group
      AND qa.created_at >= v_start_date
    GROUP BY qa.child_id
    HAVING COUNT(*) >= 10
  )
  SELECT ROUND((COUNT(*) FILTER (WHERE accuracy <= v_child_accuracy)::NUMERIC / NULLIF(COUNT(*), 0)) * 100)
  INTO v_overall_percentile
  FROM cohort_accuracies;

  -- Calculate subject percentiles
  WITH subject_percentiles AS (
    SELECT 
      q.subject,
      ROUND(AVG(CASE WHEN qa.is_correct THEN 100.0 ELSE 0.0 END), 1) as child_accuracy,
      (
        SELECT ROUND((COUNT(*) FILTER (WHERE acc <= ROUND(AVG(CASE WHEN qa.is_correct THEN 100.0 ELSE 0.0 END), 1))::NUMERIC / NULLIF(COUNT(*), 0)) * 100)
        FROM (
          SELECT 
            qa2.child_id,
            AVG(CASE WHEN qa2.is_correct THEN 100.0 ELSE 0.0 END) as acc
          FROM question_attempts qa2
          JOIN questions q2 ON q2.id = qa2.question_id
          JOIN children c2 ON c2.id = qa2.child_id
          WHERE c2.year_group = v_year_group
            AND q2.subject = q.subject
            AND qa2.created_at >= v_start_date
          GROUP BY qa2.child_id
          HAVING COUNT(*) >= 5
        ) cohort
      ) as percentile
    FROM question_attempts qa
    JOIN questions q ON q.id = qa.question_id
    WHERE qa.child_id = p_child_id
      AND qa.created_at >= v_start_date
    GROUP BY q.subject
  )
  SELECT json_build_object(
    'overallPercentile', COALESCE(v_overall_percentile, 50),
    'subjectPercentiles', COALESCE(json_agg(
      json_build_object(
        'subject', subject,
        'accuracy', child_accuracy,
        'percentile', COALESCE(percentile, 50)
      )
    ), '[]'::json),
    'cohortSize', (
      SELECT COUNT(DISTINCT child_id)
      FROM question_attempts qa
      JOIN children c ON c.id = qa.child_id
      WHERE c.year_group = v_year_group
        AND qa.created_at >= v_start_date
    )
  ) INTO result
  FROM subject_percentiles;

  RETURN result;
END;
$$;

-- =============================================================================
-- GRANT PERMISSIONS
-- =============================================================================
GRANT EXECUTE ON FUNCTION public.get_comprehensive_analytics(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_weakness_heatmap_v2(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_learning_health_v2(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_readiness_score_v2(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_benchmark_percentiles(UUID, INTEGER) TO authenticated;

-- =============================================================================
-- COMMENTS
-- =============================================================================
COMMENT ON FUNCTION public.get_comprehensive_analytics IS 'Returns comprehensive analytics: total questions, accuracy, subject/difficulty breakdowns';
COMMENT ON FUNCTION public.get_weakness_heatmap_v2 IS 'Returns topic-based performance heatmap with mastery levels';
COMMENT ON FUNCTION public.calculate_learning_health_v2 IS 'Calculates rush factor, fatigue drop-off, and stagnant topics';
COMMENT ON FUNCTION public.calculate_readiness_score_v2 IS 'Calculates exam readiness score with all component breakdowns';
COMMENT ON FUNCTION public.calculate_benchmark_percentiles IS 'Calculates percentile rankings vs same year group cohort';
