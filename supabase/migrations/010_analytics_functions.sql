-- Analytics Functions Migration
-- Creates PostgreSQL functions required for the analytics dashboard
-- 
-- Functions created:
-- 1. get_child_analytics - Comprehensive analytics data
-- 2. calculate_readiness_score - 11+ exam readiness calculation
-- 3. get_weakness_heatmap - Subject/topic weakness analysis

-- =============================================================================
-- GET CHILD ANALYTICS
-- =============================================================================
-- Returns comprehensive analytics data for a child within a date range

CREATE OR REPLACE FUNCTION public.get_child_analytics(
  p_child_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  v_total_questions INT;
  v_correct_answers INT;
  v_total_time INT;
  v_current_streak INT;
  v_best_streak INT;
  v_sessions_count INT;
BEGIN
  -- Get overall stats for the period
  SELECT 
    COUNT(*),
    SUM(CASE WHEN is_correct THEN 1 ELSE 0 END),
    COALESCE(SUM(time_taken_seconds), 0)
  INTO v_total_questions, v_correct_answers, v_total_time
  FROM question_attempts qa
  WHERE qa.child_id = p_child_id
    AND qa.created_at >= p_start_date
    AND qa.created_at <= p_end_date + INTERVAL '1 day';

  -- Get session count
  SELECT COUNT(*)
  INTO v_sessions_count
  FROM practice_sessions ps
  WHERE ps.child_id = p_child_id
    AND ps.created_at >= p_start_date
    AND ps.created_at <= p_end_date + INTERVAL '1 day';

  -- Calculate current streak (consecutive days with practice)
  WITH daily_practice AS (
    SELECT DISTINCT DATE(created_at) as practice_date
    FROM question_attempts
    WHERE child_id = p_child_id
    ORDER BY practice_date DESC
  ),
  streak_calc AS (
    SELECT 
      practice_date,
      practice_date - (ROW_NUMBER() OVER (ORDER BY practice_date DESC))::INT as streak_group
    FROM daily_practice
  )
  SELECT COUNT(*)
  INTO v_current_streak
  FROM streak_calc
  WHERE streak_group = (SELECT MIN(streak_group) FROM streak_calc WHERE practice_date >= CURRENT_DATE - 1);

  -- Get subject performance
  WITH subject_stats AS (
    SELECT 
      q.subject,
      COUNT(*) as total,
      SUM(CASE WHEN qa.is_correct THEN 1 ELSE 0 END) as correct,
      ROUND(AVG(CASE WHEN qa.is_correct THEN 100.0 ELSE 0.0 END), 1) as accuracy
    FROM question_attempts qa
    JOIN questions q ON q.id = qa.question_id
    WHERE qa.child_id = p_child_id
      AND qa.created_at >= p_start_date
      AND qa.created_at <= p_end_date + INTERVAL '1 day'
    GROUP BY q.subject
  ),
  -- Get daily activity
  daily_activity AS (
    SELECT 
      DATE(qa.created_at) as date,
      COUNT(*) as questions,
      SUM(CASE WHEN qa.is_correct THEN 1 ELSE 0 END) as correct,
      ROUND(AVG(CASE WHEN qa.is_correct THEN 100.0 ELSE 0.0 END), 1) as accuracy,
      COALESCE(SUM(qa.time_taken_seconds), 0) as time_spent
    FROM question_attempts qa
    WHERE qa.child_id = p_child_id
      AND qa.created_at >= p_start_date
      AND qa.created_at <= p_end_date + INTERVAL '1 day'
    GROUP BY DATE(qa.created_at)
    ORDER BY date DESC
  ),
  -- Get topic performance
  topic_stats AS (
    SELECT 
      q.subject,
      q.topic,
      COUNT(*) as total,
      SUM(CASE WHEN qa.is_correct THEN 1 ELSE 0 END) as correct,
      ROUND(AVG(CASE WHEN qa.is_correct THEN 100.0 ELSE 0.0 END), 1) as accuracy
    FROM question_attempts qa
    JOIN questions q ON q.id = qa.question_id
    WHERE qa.child_id = p_child_id
      AND qa.created_at >= p_start_date
      AND qa.created_at <= p_end_date + INTERVAL '1 day'
    GROUP BY q.subject, q.topic
    HAVING COUNT(*) >= 3
    ORDER BY accuracy ASC
  )
  SELECT json_build_object(
    'summary', json_build_object(
      'totalQuestions', COALESCE(v_total_questions, 0),
      'correctAnswers', COALESCE(v_correct_answers, 0),
      'accuracy', CASE WHEN v_total_questions > 0 
        THEN ROUND((v_correct_answers::NUMERIC / v_total_questions) * 100, 1) 
        ELSE 0 END,
      'totalTimeMinutes', ROUND(COALESCE(v_total_time, 0) / 60.0, 1),
      'sessionsCount', COALESCE(v_sessions_count, 0),
      'currentStreak', COALESCE(v_current_streak, 0),
      'averageSessionLength', CASE WHEN v_sessions_count > 0 
        THEN ROUND(v_total_questions::NUMERIC / v_sessions_count, 1) 
        ELSE 0 END
    ),
    'subjectPerformance', COALESCE((SELECT json_agg(json_build_object(
      'subject', subject,
      'total', total,
      'correct', correct,
      'accuracy', accuracy
    )) FROM subject_stats), '[]'::json),
    'dailyActivity', COALESCE((SELECT json_agg(json_build_object(
      'date', date,
      'questions', questions,
      'correct', correct,
      'accuracy', accuracy,
      'timeSpent', time_spent
    )) FROM daily_activity), '[]'::json),
    'topicPerformance', COALESCE((SELECT json_agg(json_build_object(
      'subject', subject,
      'topic', topic,
      'total', total,
      'correct', correct,
      'accuracy', accuracy
    )) FROM topic_stats), '[]'::json),
    'weakestTopics', COALESCE((SELECT json_agg(json_build_object(
      'subject', subject,
      'topic', topic,
      'accuracy', accuracy,
      'total', total
    )) FROM (SELECT * FROM topic_stats ORDER BY accuracy ASC LIMIT 5) t), '[]'::json),
    'strongestTopics', COALESCE((SELECT json_agg(json_build_object(
      'subject', subject,
      'topic', topic,
      'accuracy', accuracy,
      'total', total
    )) FROM (SELECT * FROM topic_stats ORDER BY accuracy DESC LIMIT 5) t), '[]'::json)
  ) INTO result;

  RETURN result;
END;
$$;

-- =============================================================================
-- CALCULATE READINESS SCORE
-- =============================================================================
-- Calculates a child's readiness for 11+ exams based on performance

CREATE OR REPLACE FUNCTION public.calculate_readiness_score(
  p_child_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  v_overall_score NUMERIC;
  v_verbal_score NUMERIC;
  v_english_score NUMERIC;
  v_maths_score NUMERIC;
  v_consistency_score NUMERIC;
  v_volume_score NUMERIC;
  v_total_questions INT;
  v_days_active INT;
BEGIN
  -- Get subject scores (weighted accuracy from last 30 days)
  SELECT 
    COALESCE(ROUND(AVG(CASE WHEN q.subject = 'verbal_reasoning' THEN 
      CASE WHEN qa.is_correct THEN 100.0 ELSE 0.0 END END), 1), 0),
    COALESCE(ROUND(AVG(CASE WHEN q.subject = 'english' THEN 
      CASE WHEN qa.is_correct THEN 100.0 ELSE 0.0 END END), 1), 0),
    COALESCE(ROUND(AVG(CASE WHEN q.subject = 'mathematics' THEN 
      CASE WHEN qa.is_correct THEN 100.0 ELSE 0.0 END END), 1), 0),
    COUNT(*)
  INTO v_verbal_score, v_english_score, v_maths_score, v_total_questions
  FROM question_attempts qa
  JOIN questions q ON q.id = qa.question_id
  WHERE qa.child_id = p_child_id
    AND qa.created_at >= CURRENT_DATE - INTERVAL '30 days';

  -- Calculate consistency (how regularly they practice)
  SELECT COUNT(DISTINCT DATE(created_at))
  INTO v_days_active
  FROM question_attempts
  WHERE child_id = p_child_id
    AND created_at >= CURRENT_DATE - INTERVAL '30 days';

  v_consistency_score := LEAST(100, (v_days_active::NUMERIC / 20) * 100);

  -- Volume score (target: 300 questions per month)
  v_volume_score := LEAST(100, (COALESCE(v_total_questions, 0)::NUMERIC / 300) * 100);

  -- Calculate overall score (weighted average)
  v_overall_score := ROUND(
    (COALESCE(v_verbal_score, 0) * 0.35) +
    (COALESCE(v_english_score, 0) * 0.25) +
    (COALESCE(v_maths_score, 0) * 0.25) +
    (v_consistency_score * 0.10) +
    (v_volume_score * 0.05)
  , 1);

  SELECT json_build_object(
    'overallScore', v_overall_score,
    'subjectScores', json_build_object(
      'verbal_reasoning', COALESCE(v_verbal_score, 0),
      'english', COALESCE(v_english_score, 0),
      'mathematics', COALESCE(v_maths_score, 0)
    ),
    'factors', json_build_object(
      'consistency', ROUND(v_consistency_score, 1),
      'volume', ROUND(v_volume_score, 1),
      'daysActive', v_days_active,
      'totalQuestions', v_total_questions
    ),
    'tier', CASE 
      WHEN v_overall_score >= 85 THEN 'exam_ready'
      WHEN v_overall_score >= 70 THEN 'on_track'
      WHEN v_overall_score >= 50 THEN 'developing'
      ELSE 'needs_focus'
    END,
    'recommendations', CASE 
      WHEN COALESCE(v_verbal_score, 0) < 60 THEN 'Focus on Verbal Reasoning practice'
      WHEN COALESCE(v_english_score, 0) < 60 THEN 'Strengthen English comprehension skills'
      WHEN COALESCE(v_maths_score, 0) < 60 THEN 'Work on Mathematics problem-solving'
      WHEN v_consistency_score < 50 THEN 'Try to practice more regularly'
      ELSE 'Keep up the great work!'
    END
  ) INTO result;

  RETURN result;
END;
$$;

-- =============================================================================
-- GET WEAKNESS HEATMAP
-- =============================================================================
-- Returns heatmap data showing performance by subject and topic

CREATE OR REPLACE FUNCTION public.get_weakness_heatmap(
  p_child_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  WITH topic_performance AS (
    SELECT 
      q.subject,
      q.topic,
      COUNT(*) as attempts,
      SUM(CASE WHEN qa.is_correct THEN 1 ELSE 0 END) as correct,
      ROUND(AVG(CASE WHEN qa.is_correct THEN 100.0 ELSE 0.0 END), 1) as accuracy,
      -- Calculate trend (compare last 7 days to previous 7 days)
      ROUND(AVG(CASE WHEN qa.created_at >= CURRENT_DATE - INTERVAL '7 days' 
        THEN CASE WHEN qa.is_correct THEN 100.0 ELSE 0.0 END END), 1) as recent_accuracy,
      ROUND(AVG(CASE WHEN qa.created_at < CURRENT_DATE - INTERVAL '7 days' 
        AND qa.created_at >= CURRENT_DATE - INTERVAL '14 days'
        THEN CASE WHEN qa.is_correct THEN 100.0 ELSE 0.0 END END), 1) as previous_accuracy
    FROM question_attempts qa
    JOIN questions q ON q.id = qa.question_id
    WHERE qa.child_id = p_child_id
      AND qa.created_at >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY q.subject, q.topic
    HAVING COUNT(*) >= 2
  ),
  with_trends AS (
    SELECT 
      subject,
      topic,
      attempts,
      correct,
      accuracy,
      recent_accuracy,
      previous_accuracy,
      CASE 
        WHEN recent_accuracy IS NULL OR previous_accuracy IS NULL THEN 'stable'
        WHEN recent_accuracy > previous_accuracy + 5 THEN 'improving'
        WHEN recent_accuracy < previous_accuracy - 5 THEN 'declining'
        ELSE 'stable'
      END as trend
    FROM topic_performance
  )
  SELECT json_build_object(
    'subjects', (
      SELECT json_agg(DISTINCT subject)
      FROM with_trends
    ),
    'topics', (
      SELECT json_agg(json_build_object(
        'subject', subject,
        'topic', topic,
        'attempts', attempts,
        'correct', correct,
        'accuracy', accuracy,
        'trend', trend,
        'mastery', CASE 
          WHEN accuracy >= 85 THEN 'mastered'
          WHEN accuracy >= 70 THEN 'proficient'
          WHEN accuracy >= 55 THEN 'developing'
          ELSE 'needs_focus'
        END
      ) ORDER BY subject, accuracy)
      FROM with_trends
    ),
    'summary', json_build_object(
      'totalTopics', (SELECT COUNT(*) FROM with_trends),
      'mastered', (SELECT COUNT(*) FROM with_trends WHERE accuracy >= 85),
      'proficient', (SELECT COUNT(*) FROM with_trends WHERE accuracy >= 70 AND accuracy < 85),
      'developing', (SELECT COUNT(*) FROM with_trends WHERE accuracy >= 55 AND accuracy < 70),
      'needsFocus', (SELECT COUNT(*) FROM with_trends WHERE accuracy < 55)
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_child_analytics(UUID, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_readiness_score(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_weakness_heatmap(UUID) TO authenticated;

-- Add comments
COMMENT ON FUNCTION public.get_child_analytics IS 'Returns comprehensive analytics data for a child within a date range';
COMMENT ON FUNCTION public.calculate_readiness_score IS 'Calculates 11+ exam readiness score based on performance metrics';
COMMENT ON FUNCTION public.get_weakness_heatmap IS 'Returns heatmap data showing performance by subject and topic';
