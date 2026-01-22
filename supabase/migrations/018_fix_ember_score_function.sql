-- Migration: Fix update_all_ember_scores() and calculate_ember_score()
-- Date: 2026-01-22
-- Description: 
--   1. Fix column reference "question_id" ambiguity in update_all_ember_scores()
--   2. Fix calculate_ember_score() to respect valid_ember_score constraint (>= 60)

-- First, fix calculate_ember_score to ensure minimum score of 60
DROP FUNCTION IF EXISTS calculate_ember_score(UUID);

CREATE OR REPLACE FUNCTION calculate_ember_score(
  p_question_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_curriculum_score INTEGER := 0;
  v_exam_pattern_score INTEGER := 0;
  v_community_score INTEGER := 0;
  v_technical_score INTEGER := 0;
  v_total_score INTEGER := 0;
  
  -- Metrics for calculation
  v_has_curriculum_ref BOOLEAN;
  v_has_curriculum_alignment BOOLEAN;
  v_helpful_count INTEGER;
  v_not_helpful_count INTEGER;
  v_total_attempts INTEGER;
  v_avg_time_seconds NUMERIC;
  v_has_complete_explanations BOOLEAN;
BEGIN
  -- Check if question exists
  IF NOT EXISTS (SELECT 1 FROM questions WHERE id = p_question_id) THEN
    RETURN 60; -- Return minimum valid score
  END IF;
  
  -- Get question data
  SELECT 
    curriculum_reference IS NOT NULL AND curriculum_reference != '',
    (explanations->>'step_by_step' IS NOT NULL AND explanations->>'step_by_step' != '')
      AND (explanations->>'visual' IS NOT NULL OR explanations->>'worked_example' IS NOT NULL)
  INTO v_has_curriculum_ref, v_has_complete_explanations
  FROM questions
  WHERE id = p_question_id;
  
  -- Check for curriculum alignment
  SELECT EXISTS(
    SELECT 1 FROM question_curriculum_alignment qca WHERE qca.question_id = p_question_id
  ) INTO v_has_curriculum_alignment;
  
  -- Get community feedback metrics
  SELECT 
    COUNT(*) FILTER (WHERE is_helpful = true),
    COUNT(*) FILTER (WHERE is_helpful = false)
  INTO v_helpful_count, v_not_helpful_count
  FROM question_feedback
  WHERE question_id = p_question_id;
  
  -- Get usage metrics
  SELECT 
    COUNT(*),
    AVG(time_taken_seconds)
  INTO v_total_attempts, v_avg_time_seconds
  FROM question_attempts
  WHERE question_id = p_question_id;
  
  -- =============================================================================
  -- CURRICULUM ALIGNMENT SCORE (0-25 points)
  -- =============================================================================
  IF v_has_curriculum_alignment THEN
    v_curriculum_score := 25;
  ELSIF v_has_curriculum_ref THEN
    v_curriculum_score := 20;
  ELSE
    v_curriculum_score := 15; -- Increased minimum to ensure >= 60 total
  END IF;
  
  -- =============================================================================
  -- EXAM PATTERN SCORE (0-25 points)
  -- Based on question structure and metadata
  -- =============================================================================
  v_exam_pattern_score := 20; -- Increased base score
  
  -- Bonus for complete explanations
  IF v_has_complete_explanations THEN
    v_exam_pattern_score := v_exam_pattern_score + 5;
  END IF;
  
  -- =============================================================================
  -- COMMUNITY SCORE (0-15 points)
  -- Based on user feedback
  -- =============================================================================
  IF v_helpful_count + v_not_helpful_count > 0 THEN
    v_community_score := LEAST(15, ROUND(
      (v_helpful_count::NUMERIC / (v_helpful_count + v_not_helpful_count)) * 15
    ));
  ELSE
    -- No feedback yet, give neutral score
    v_community_score := 10;
  END IF;
  
  -- =============================================================================
  -- TECHNICAL SCORE (0-10 points)
  -- Based on usage patterns and answer distribution
  -- =============================================================================
  v_technical_score := 8; -- Base score for valid structure
  
  -- Bonus if question has been attempted and has reasonable time
  IF v_total_attempts > 10 AND v_avg_time_seconds BETWEEN 5 AND 300 THEN
    v_technical_score := 10;
  END IF;
  
  -- =============================================================================
  -- TOTAL SCORE (minimum 60, maximum 100)
  -- =============================================================================
  v_total_score := v_curriculum_score + v_exam_pattern_score + v_community_score + v_technical_score;
  
  -- Ensure minimum score of 60 (required by valid_ember_score constraint)
  v_total_score := GREATEST(60, v_total_score);
  
  -- Cap at 100
  v_total_score := LEAST(100, v_total_score);
  
  RETURN v_total_score;
END;
$$;

COMMENT ON FUNCTION calculate_ember_score IS 'Calculates ember_score for a question (60-100) based on curriculum alignment, exam pattern, community feedback, and technical metrics';

-- Now fix update_all_ember_scores with proper column references
DROP FUNCTION IF EXISTS update_all_ember_scores();

CREATE OR REPLACE FUNCTION update_all_ember_scores()
RETURNS TABLE (
  question_id UUID,
  old_score INTEGER,
  new_score INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH score_updates AS (
    SELECT 
      q.id,
      q.ember_score as old_score,
      calculate_ember_score(q.id) as new_score
    FROM questions q
    WHERE q.is_published = true
  )
  UPDATE questions q
  SET 
    ember_score = su.new_score,
    ember_score_breakdown = jsonb_build_object(
      'curriculum', CASE 
        WHEN EXISTS(
          SELECT 1 
          FROM question_curriculum_alignment qca
          WHERE qca.question_id = q.id
        ) THEN 25 
        ELSE 15 
      END,
      'exam_pattern', 25,
      'community', 10,
      'technical', 8,
      'calculated_at', NOW()
    ),
    updated_at = NOW()
  FROM score_updates su
  WHERE q.id = su.id
  RETURNING q.id, su.old_score::INTEGER, su.new_score::INTEGER;
END;
$$;

COMMENT ON FUNCTION update_all_ember_scores() IS 'Recalculates ember_score for all published questions using calculate_ember_score function. Fixed ambiguous column reference issue.';
