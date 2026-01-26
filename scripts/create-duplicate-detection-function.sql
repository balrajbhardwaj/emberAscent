-- =============================================================================
-- CREATE DUPLICATE DETECTION FUNCTION
-- =============================================================================
-- Purpose: Reusable function to detect and analyze duplicate questions
-- Usage: SELECT * FROM find_duplicate_questions(3);
-- Date: 2026-01-26
-- =============================================================================

-- Drop function if exists
DROP FUNCTION IF EXISTS find_duplicate_questions(INTEGER);

-- =============================================================================
-- Main Function: find_duplicate_questions
-- =============================================================================
CREATE OR REPLACE FUNCTION find_duplicate_questions(
  target_year_group INTEGER DEFAULT NULL
)
RETURNS TABLE (
  duplicate_type TEXT,
  question_1_id UUID,
  question_1_external_id VARCHAR,
  question_2_id UUID,
  question_2_external_id VARCHAR,
  question_text TEXT,
  similarity_score NUMERIC,
  topic_1 TEXT,
  topic_2 TEXT,
  difficulty_1 TEXT,
  difficulty_2 TEXT,
  created_1 TIMESTAMPTZ,
  created_2 TIMESTAMPTZ,
  recommendation TEXT
) AS $$
BEGIN
  RETURN QUERY
  
  -- Exact text duplicates
  WITH exact_duplicates AS (
    SELECT DISTINCT
      'EXACT_TEXT' as dup_type,
      q1.id as q1_id,
      q1.external_id as q1_ext_id,
      q2.id as q2_id,
      q2.external_id as q2_ext_id,
      q1.question_text as q_text,
      1.0::NUMERIC as sim_score,
      q1.topic as t1,
      q2.topic as t2,
      q1.difficulty as d1,
      q2.difficulty as d2,
      q1.created_at as c1,
      q2.created_at as c2,
      CASE 
        WHEN q1.created_at < q2.created_at THEN 
          'Keep question_1 (older), delete question_2'
        ELSE 
          'Keep question_2 (older), delete question_1'
      END as rec
    FROM questions q1
    JOIN questions q2 
      ON q1.id < q2.id
      AND q1.question_text = q2.question_text
    WHERE 
      (target_year_group IS NULL OR q1.year_group = target_year_group)
      AND (target_year_group IS NULL OR q2.year_group = target_year_group)
      AND q1.is_published = true
      AND q2.is_published = true
  ),
  
  -- Identical content (text + options + answer)
  identical_content AS (
    SELECT DISTINCT
      'IDENTICAL_CONTENT' as dup_type,
      q1.id as q1_id,
      q1.external_id as q1_ext_id,
      q2.id as q2_id,
      q2.external_id as q2_ext_id,
      q1.question_text as q_text,
      1.0::NUMERIC as sim_score,
      q1.topic as t1,
      q2.topic as t2,
      q1.difficulty as d1,
      q2.difficulty as d2,
      q1.created_at as c1,
      q2.created_at as c2,
      CASE 
        WHEN q1.created_at < q2.created_at THEN 
          'Keep question_1 (older), delete question_2 after migrating attempts'
        ELSE 
          'Keep question_2 (older), delete question_1 after migrating attempts'
      END as rec
    FROM questions q1
    JOIN questions q2 
      ON q1.id < q2.id
      AND q1.question_text = q2.question_text
      AND q1.correct_answer = q2.correct_answer
      AND q1.options = q2.options
    WHERE 
      (target_year_group IS NULL OR q1.year_group = target_year_group)
      AND (target_year_group IS NULL OR q2.year_group = target_year_group)
      AND q1.is_published = true
      AND q2.is_published = true
      AND q1.id NOT IN (SELECT q1_id FROM exact_duplicates)  -- Avoid double-counting
  )
  
  SELECT * FROM exact_duplicates
  UNION ALL
  SELECT * FROM identical_content
  ORDER BY dup_type, c1;
  
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION find_duplicate_questions IS 
  'Detects duplicate questions in the question bank. Pass year_group (e.g., 3) or NULL for all years.';

-- =============================================================================
-- Helper Function: get_duplicate_summary
-- =============================================================================
DROP FUNCTION IF EXISTS get_duplicate_summary(INTEGER);

CREATE OR REPLACE FUNCTION get_duplicate_summary(
  target_year_group INTEGER DEFAULT NULL
)
RETURNS TABLE (
  year_group INTEGER,
  total_questions BIGINT,
  unique_question_texts BIGINT,
  duplicate_groups BIGINT,
  total_duplicates BIGINT,
  questions_to_clean BIGINT,
  duplicate_percent NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    q.year_group,
    COUNT(*) as total_questions,
    COUNT(DISTINCT q.question_text) as unique_question_texts,
    COUNT(*) FILTER (
      WHERE q.question_text IN (
        SELECT question_text 
        FROM questions 
        WHERE year_group = q.year_group 
          AND is_published = true
        GROUP BY question_text 
        HAVING COUNT(*) > 1
      )
    ) as duplicate_groups,
    (COUNT(*) - COUNT(DISTINCT q.question_text)) as total_duplicates,
    (COUNT(*) - COUNT(DISTINCT q.question_text)) as questions_to_clean,
    ROUND(
      (COUNT(*) - COUNT(DISTINCT q.question_text))::numeric / 
      NULLIF(COUNT(*), 0) * 100, 
      2
    ) as duplicate_percent
  FROM questions q
  WHERE 
    (target_year_group IS NULL OR q.year_group = target_year_group)
    AND q.is_published = true
  GROUP BY q.year_group
  ORDER BY q.year_group;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_duplicate_summary IS 
  'Returns summary statistics of duplicate questions by year group.';

-- =============================================================================
-- Helper Function: get_duplicate_impact
-- =============================================================================
DROP FUNCTION IF EXISTS get_duplicate_impact(UUID[]);

CREATE OR REPLACE FUNCTION get_duplicate_impact(
  question_ids_to_delete UUID[]
)
RETURNS TABLE (
  metric TEXT,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  
  -- Count attempts that would be affected
  SELECT 
    'Question Attempts' as metric,
    COUNT(*) as count
  FROM question_attempts qa
  WHERE qa.question_id = ANY(question_ids_to_delete)
  
  UNION ALL
  
  -- Count children affected
  SELECT 
    'Children Affected' as metric,
    COUNT(DISTINCT qa.child_id) as count
  FROM question_attempts qa
  WHERE qa.question_id = ANY(question_ids_to_delete)
  
  UNION ALL
  
  -- Count sessions affected
  SELECT 
    'Sessions Affected' as metric,
    COUNT(DISTINCT qa.session_id) as count
  FROM question_attempts qa
  WHERE qa.question_id = ANY(question_ids_to_delete)
  
  UNION ALL
  
  -- Count history records
  SELECT 
    'History Records' as metric,
    COUNT(*) as count
  FROM child_question_history cqh
  WHERE cqh.question_id = ANY(question_ids_to_delete)
  
  UNION ALL
  
  -- Count feedback records
  SELECT 
    'Feedback Records' as metric,
    COUNT(*) as count
  FROM question_feedback qf
  WHERE qf.question_id = ANY(question_ids_to_delete);
  
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_duplicate_impact IS 
  'Analyzes the impact of deleting specified questions (attempts, children, sessions affected).';

-- =============================================================================
-- Example Usage
-- =============================================================================
-- Find all Y3 duplicates:
-- SELECT * FROM find_duplicate_questions(3);

-- Get summary for Y3:
-- SELECT * FROM get_duplicate_summary(3);

-- Get summary for all year groups:
-- SELECT * FROM get_duplicate_summary(NULL);

-- Check impact before deleting questions:
-- SELECT * FROM get_duplicate_impact(ARRAY[
--   'uuid-of-question-1'::UUID,
--   'uuid-of-question-2'::UUID
-- ]);

-- =============================================================================
-- GRANT PERMISSIONS
-- =============================================================================
GRANT EXECUTE ON FUNCTION find_duplicate_questions TO authenticated;
GRANT EXECUTE ON FUNCTION get_duplicate_summary TO authenticated;
GRANT EXECUTE ON FUNCTION get_duplicate_impact TO authenticated;
