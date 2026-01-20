-- Remove Duplicate Questions
-- Keep exactly 50 mathematics and 50 verbal reasoning questions
-- Run this in Supabase SQL Editor

-- First, let's see what we have
SELECT 
  CASE 
    WHEN subject ILIKE '%math%' OR topic ILIKE '%frac%' THEN 'Mathematics'
    WHEN subject ILIKE '%verbal%' OR topic ILIKE '%synonym%' THEN 'Verbal Reasoning'
    ELSE 'Other'
  END as question_type,
  COUNT(*) as count
FROM questions 
GROUP BY 
  CASE 
    WHEN subject ILIKE '%math%' OR topic ILIKE '%frac%' THEN 'Mathematics'
    WHEN subject ILIKE '%verbal%' OR topic ILIKE '%synonym%' THEN 'Verbal Reasoning'
    ELSE 'Other'
  END
ORDER BY question_type;

-- Create a temporary view to identify questions to keep
WITH questions_to_keep AS (
  -- Keep first 50 mathematics questions (oldest first)
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) as row_num
    FROM questions 
    WHERE subject ILIKE '%math%' OR topic ILIKE '%frac%'
  ) math_ranked 
  WHERE row_num <= 50

  UNION ALL

  -- Keep first 50 verbal reasoning questions (oldest first)
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) as row_num
    FROM questions 
    WHERE subject ILIKE '%verbal%' OR topic ILIKE '%synonym%'
  ) verbal_ranked 
  WHERE row_num <= 50

  UNION ALL

  -- Keep all other questions (not math or verbal reasoning)
  SELECT id 
  FROM questions 
  WHERE NOT (subject ILIKE '%math%' OR topic ILIKE '%frac%')
    AND NOT (subject ILIKE '%verbal%' OR topic ILIKE '%synonym%')
),

-- Identify questions to delete
questions_to_delete AS (
  SELECT id, subject, topic, created_at
  FROM questions 
  WHERE id NOT IN (SELECT id FROM questions_to_keep)
)

-- Show what will be deleted (run this first to verify)
SELECT 
  CASE 
    WHEN subject ILIKE '%math%' OR topic ILIKE '%frac%' THEN 'Mathematics'
    WHEN subject ILIKE '%verbal%' OR topic ILIKE '%synonym%' THEN 'Verbal Reasoning'
    ELSE 'Other'
  END as question_type,
  COUNT(*) as will_be_deleted
FROM questions_to_delete
GROUP BY 
  CASE 
    WHEN subject ILIKE '%math%' OR topic ILIKE '%frac%' THEN 'Mathematics'
    WHEN subject ILIKE '%verbal%' OR topic ILIKE '%synonym%' THEN 'Verbal Reasoning'
    ELSE 'Other'
  END
ORDER BY question_type;

-- UNCOMMENT THE LINES BELOW TO ACTUALLY DELETE THE DUPLICATES
-- (After verifying the count above looks correct)


-- Delete the duplicate questions
WITH questions_to_keep AS (
  -- Keep first 50 mathematics questions (oldest first)
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) as row_num
    FROM questions 
    WHERE subject ILIKE '%math%' OR topic ILIKE '%frac%'
  ) math_ranked 
  WHERE row_num <= 50

  UNION ALL

  -- Keep first 50 verbal reasoning questions (oldest first)
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) as row_num
    FROM questions 
    WHERE subject ILIKE '%verbal%' OR topic ILIKE '%synonym%'
  ) verbal_ranked 
  WHERE row_num <= 50

  UNION ALL

  -- Keep all other questions (not math or verbal reasoning)
  SELECT id 
  FROM questions 
  WHERE NOT (subject ILIKE '%math%' OR topic ILIKE '%frac%')
    AND NOT (subject ILIKE '%verbal%' OR topic ILIKE '%synonym%')
)

DELETE FROM questions 
WHERE id NOT IN (SELECT id FROM questions_to_keep);

-- Verify final counts
SELECT 
  CASE 
    WHEN subject ILIKE '%math%' OR topic ILIKE '%frac%' THEN 'Mathematics'
    WHEN subject ILIKE '%verbal%' OR topic ILIKE '%synonym%' THEN 'Verbal Reasoning'
    ELSE 'Other'
  END as question_type,
  COUNT(*) as final_count
FROM questions 
GROUP BY 
  CASE 
    WHEN subject ILIKE '%math%' OR topic ILIKE '%frac%' THEN 'Mathematics'
    WHEN subject ILIKE '%verbal%' OR topic ILIKE '%synonym%' THEN 'Verbal Reasoning'
    ELSE 'Other'
  END
ORDER BY question_type;
