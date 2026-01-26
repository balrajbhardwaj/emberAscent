-- =============================================================================
-- CLEANUP SCRIPT: Remove All Y3 Questions and Related Data
-- =============================================================================
-- Purpose: Clean slate for Y3 question reimport
-- Date: 2026-01-26
-- 
-- WARNING: This will DELETE all Y3 questions and related data
-- ALWAYS backup data before running this script
-- =============================================================================

-- =============================================================================
-- 1. Check Current Y3 Data
-- =============================================================================
SELECT 
  'questions' as table_name,
  COUNT(*) as record_count,
  MIN(q.created_at) as oldest_record,
  MAX(q.created_at) as newest_record
FROM questions q
WHERE q.year_group = 3

UNION ALL

SELECT 
  'question_attempts' as table_name,
  COUNT(*) as record_count,
  MIN(qa.created_at) as oldest_record,
  MAX(qa.created_at) as newest_record
FROM question_attempts qa
JOIN questions q ON q.id = qa.question_id
WHERE q.year_group = 3

UNION ALL

SELECT 
  'child_question_history' as table_name,
  COUNT(*) as record_count,
  MIN(cqh.created_at) as oldest_record,
  MAX(cqh.created_at) as newest_record
FROM child_question_history cqh
JOIN questions q ON q.id = cqh.question_id
WHERE q.year_group = 3

UNION ALL

SELECT 
  'question_feedback' as table_name,
  COUNT(*) as record_count,
  MIN(qf.created_at) as oldest_record,
  MAX(qf.created_at) as newest_record
FROM question_feedback qf
JOIN questions q ON q.id = qf.question_id
WHERE q.year_group = 3;

-- =============================================================================
-- 2. Backup Y3 Questions (Optional - For Safety)
-- =============================================================================
-- Run this query and save the results as CSV if you want a backup

/*
SELECT 
  id,
  external_id,
  subject,
  topic,
  subtopic,
  question_text,
  options,
  correct_answer,
  explanations,
  difficulty,
  year_group,
  curriculum_reference,
  exam_board,
  ember_score,
  is_published,
  created_at,
  updated_at
FROM questions
WHERE year_group = 3
ORDER BY external_id;
*/

-- =============================================================================
-- 3. Delete Related Data (CASCADING)
-- =============================================================================
-- The foreign key constraints should handle cascading deletes automatically
-- But we'll do it explicitly for clarity and logging

-- Step 3a: Delete question feedback
DO $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM question_feedback qf
  WHERE qf.question_id IN (
    SELECT id FROM questions WHERE year_group = 3
  );
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % question_feedback records', deleted_count;
END $$;

-- Step 3b: Delete child question history
DO $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM child_question_history cqh
  WHERE cqh.question_id IN (
    SELECT id FROM questions WHERE year_group = 3
  );
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % child_question_history records', deleted_count;
END $$;

-- Step 3c: Delete question attempts
DO $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM question_attempts qa
  WHERE qa.question_id IN (
    SELECT id FROM questions WHERE year_group = 3
  );
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % question_attempts records', deleted_count;
END $$;

-- Step 3d: Delete error reports
DO $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM error_reports er
  WHERE er.question_id IN (
    SELECT id FROM questions WHERE year_group = 3
  );
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % error_reports records', deleted_count;
END $$;

-- =============================================================================
-- 4. Delete Y3 Questions
-- =============================================================================
DO $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM questions
  WHERE year_group = 3;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % Y3 questions', deleted_count;
END $$;

-- =============================================================================
-- 5. Verify Cleanup
-- =============================================================================
SELECT 
  'Verification Check' as step,
  COUNT(*) as remaining_y3_questions
FROM questions
WHERE year_group = 3;

-- Should return 0 if cleanup was successful

-- =============================================================================
-- 6. Reset Sequences (If Needed)
-- =============================================================================
-- Sequences are not affected since we use UUIDs, not serial integers
-- No action needed

-- =============================================================================
-- NEXT STEPS AFTER CLEANUP
-- =============================================================================
/*
1. Run the cleanup queries above
2. Verify all Y3 data is removed
3. Place Y3 JSON files in: data/questions/y3/
4. Update import script with duplicate detection (use duplicate-detection-utils.ts)
5. Run: npx tsx scripts/import-y3-questions.ts
6. Verify import results
7. Run ember score calculation: SELECT * FROM update_all_ember_scores();
*/

-- =============================================================================
-- ROLLBACK PROTECTION
-- =============================================================================
-- Wrap in transaction if you want to test first:
/*
BEGIN;
  -- Run delete statements here
  -- Check results
ROLLBACK;  -- Or COMMIT; when satisfied
*/
