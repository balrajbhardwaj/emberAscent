-- =============================================================================
-- FIND DUPLICATE Y3 QUESTIONS
-- =============================================================================
-- Purpose: Identify duplicate questions in the Y3 question bank
-- Usage: Run in Supabase Dashboard SQL Editor
-- Date: 2026-01-26
-- =============================================================================

-- =============================================================================
-- 0. Enable pg_trgm Extension (Required for Query #3 only)
-- =============================================================================
-- Run this once to enable trigram similarity matching
-- If this fails, Query #3 will not work, but all other queries will work fine
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =============================================================================
-- 1. Exact Text Duplicates (Same question_text)
-- =============================================================================
-- Finds questions with identical text
SELECT 
  q.question_text,
  COUNT(*) as duplicate_count,
  ARRAY_AGG(q.id ORDER BY q.created_at) as question_ids,
  ARRAY_AGG(q.external_id ORDER BY q.created_at) as external_ids,
  ARRAY_AGG(q.topic ORDER BY q.created_at) as topics,
  ARRAY_AGG(q.difficulty ORDER BY q.created_at) as difficulties,
  MIN(q.created_at) as first_created,
  MAX(q.created_at) as last_created
FROM questions q
WHERE q.year_group = 3
  AND q.is_published = true
GROUP BY q.question_text
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC, q.question_text;

-- =============================================================================
-- 2. Duplicate external_id
-- =============================================================================
-- Finds questions with same external_id (should be prevented by unique index)
SELECT 
  q.external_id,
  COUNT(*) as duplicate_count,
  ARRAY_AGG(q.id ORDER BY q.created_at) as question_ids,
  ARRAY_AGG(q.question_text ORDER BY q.created_at) as question_texts,
  MIN(q.created_at) as first_created,
  MAX(q.created_at) as last_created
FROM questions q
WHERE q.year_group = 3
  AND q.external_id IS NOT NULL
GROUP BY q.external_id
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- =============================================================================
-- 3. Near-Duplicate Questions (Similar text, fuzzy matching)
-- =============================================================================
-- Uses trigram similarity to find questions with very similar text
-- REQUIRES: pg_trgm extension (enabled in section 0 above)
-- If Query #3 fails, skip it and use Query #1 and #4 instead
WITH y3_questions AS (
  SELECT 
    id,
    external_id,
    question_text,
    topic,
    subtopic,
    difficulty,
    correct_answer,
    created_at
  FROM questions
  WHERE year_group = 3
    AND is_published = true
)
SELECT 
  q1.id as question_1_id,
  q1.external_id as external_id_1,
  q2.id as question_2_id,
  q2.external_id as external_id_2,
  q1.question_text as question_1_text,
  q2.question_text as question_2_text,
  SIMILARITY(q1.question_text, q2.question_text) as similarity_score,
  q1.topic as topic_1,
  q2.topic as topic_2,
  q1.difficulty as difficulty_1,
  q2.difficulty as difficulty_2
FROM y3_questions q1
JOIN y3_questions q2 
  ON q1.id < q2.id  -- Avoid comparing same question and reverse pairs
WHERE SIMILARITY(q1.question_text, q2.question_text) > 0.8  -- 80% similar
ORDER BY similarity_score DESC, q1.created_at;

-- =============================================================================
-- 4. Duplicate Question Content (Same text, options, and answer)
-- =============================================================================
-- Finds questions that are functionally identical (same question and same correct answer)
SELECT 
  q1.id as question_1_id,
  q1.external_id as external_id_1,
  q2.id as question_2_id,
  q2.external_id as external_id_2,
  q1.question_text,
  q1.correct_answer,
  q1.topic,
  q1.difficulty as difficulty_1,
  q2.difficulty as difficulty_2,
  q1.created_at as created_1,
  q2.created_at as created_2
FROM questions q1
JOIN questions q2 
  ON q1.id < q2.id
  AND q1.question_text = q2.question_text
  AND q1.correct_answer = q2.correct_answer
  AND q1.options = q2.options  -- JSONB equality check
WHERE q1.year_group = 3
  AND q2.year_group = 3
  AND q1.is_published = true
  AND q2.is_published = true
ORDER BY q1.question_text;

-- =============================================================================
-- 5. Same Question Different Difficulty Levels
-- =============================================================================
-- Finds identical questions appearing at multiple difficulty levels
-- (This might be intentional, but worth reviewing)
SELECT 
  q.question_text,
  ARRAY_AGG(DISTINCT q.difficulty ORDER BY q.difficulty) as difficulty_levels,
  COUNT(DISTINCT q.difficulty) as difficulty_count,
  ARRAY_AGG(q.id ORDER BY q.difficulty) as question_ids,
  ARRAY_AGG(q.external_id ORDER BY q.difficulty) as external_ids,
  q.topic,
  q.subtopic
FROM questions q
WHERE q.year_group = 3
  AND q.is_published = true
GROUP BY q.question_text, q.topic, q.subtopic
HAVING COUNT(DISTINCT q.difficulty) > 1
ORDER BY difficulty_count DESC, q.question_text;

-- =============================================================================
-- 6. Duplicate Summary Statistics
-- =============================================================================
WITH duplicate_stats AS (
  SELECT 
    'Exact Text Duplicates' as duplicate_type,
    COUNT(*) as groups_with_duplicates,
    SUM(cnt) as total_duplicate_questions,
    SUM(cnt - 1) as questions_to_clean
  FROM (
    SELECT COUNT(*) as cnt
    FROM questions
    WHERE year_group = 3 AND is_published = true
    GROUP BY question_text
    HAVING COUNT(*) > 1
  ) sub
  
  UNION ALL
  
  SELECT 
    'Same Question, Different Difficulty' as duplicate_type,
    COUNT(*) as groups_with_duplicates,
    SUM(cnt) as total_duplicate_questions,
    0 as questions_to_clean  -- May be intentional
  FROM (
    SELECT COUNT(DISTINCT difficulty) as cnt
    FROM questions
    WHERE year_group = 3 AND is_published = true
    GROUP BY question_text
    HAVING COUNT(DISTINCT difficulty) > 1
  ) sub
)
SELECT 
  duplicate_type,
  groups_with_duplicates,
  total_duplicate_questions,
  questions_to_clean,
  ROUND(questions_to_clean::numeric / (SELECT COUNT(*) FROM questions WHERE year_group = 3 AND is_published = true) * 100, 2) as percent_of_y3_questions
FROM duplicate_stats
ORDER BY questions_to_clean DESC;

-- =============================================================================
-- 7. Overall Y3 Question Bank Statistics
-- =============================================================================
SELECT 
  'Total Y3 Questions' as metric,
  COUNT(*) as count
FROM questions
WHERE year_group = 3 AND is_published = true

UNION ALL

SELECT 
  'Unique question_text' as metric,
  COUNT(DISTINCT question_text) as count
FROM questions
WHERE year_group = 3 AND is_published = true

UNION ALL

SELECT 
  'Questions with external_id' as metric,
  COUNT(*) as count
FROM questions
WHERE year_group = 3 
  AND is_published = true
  AND external_id IS NOT NULL

UNION ALL

SELECT 
  'Unique external_id' as metric,
  COUNT(DISTINCT external_id) as count
FROM questions
WHERE year_group = 3 
  AND is_published = true
  AND external_id IS NOT NULL

ORDER BY metric;

-- =============================================================================
-- 8. Breakdown by Subject and Topic
-- =============================================================================
SELECT 
  q.subject,
  q.topic,
  COUNT(*) as total_questions,
  COUNT(DISTINCT q.question_text) as unique_questions,
  COUNT(*) - COUNT(DISTINCT q.question_text) as duplicate_count,
  ROUND((COUNT(*) - COUNT(DISTINCT q.question_text))::numeric / COUNT(*) * 100, 2) as duplicate_percent
FROM questions q
WHERE q.year_group = 3
  AND q.is_published = true
GROUP BY q.subject, q.topic
HAVING COUNT(*) - COUNT(DISTINCT q.question_text) > 0
ORDER BY duplicate_count DESC, q.subject, q.topic;

-- =============================================================================
-- NOTES
-- =============================================================================
-- - Query #1 (Exact Text Duplicates) is the most important for data cleaning
-- - Query #3 (Near-Duplicates) requires pg_trgm extension (enable if not present)
-- - Query #5 (Same Question Different Difficulty) may be intentional design
-- - Use question_ids arrays to identify which records to keep vs delete
-- - Always keep the question with the earliest created_at (first import)
-- - Update references in child_question_history before deleting duplicates
