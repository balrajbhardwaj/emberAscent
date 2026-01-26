-- =============================================================================
-- INVESTIGATE SPECIFIC DUPLICATE
-- =============================================================================
-- Question IDs: 029b57f2-953b-449e-a3ae-ed710ff34de1 and 95b36ad8-199c-47a6-bee7-55e909c7b366
-- External IDs: ENG-GRM-punc-F-Y3-00808 and ENG-GRM-punc-F-Y3-00184
-- =============================================================================

-- Get full details of both questions
SELECT 
  id,
  external_id,
  subject,
  topic,
  subtopic,
  question_text,
  question_type,
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
  updated_at,
  created_by
FROM questions
WHERE id IN (
  '029b57f2-953b-449e-a3ae-ed710ff34de1'::UUID,
  '95b36ad8-199c-47a6-bee7-55e909c7b366'::UUID
)
ORDER BY created_at;

-- =============================================================================
-- Compare options in detail
-- =============================================================================
SELECT 
  q.external_id,
  q.options->>'a' as option_a,
  q.options->>'b' as option_b,
  q.options->>'c' as option_c,
  q.options->>'d' as option_d,
  q.options->>'e' as option_e,
  q.correct_answer
FROM questions q
WHERE q.id IN (
  '029b57f2-953b-449e-a3ae-ed710ff34de1'::UUID,
  '95b36ad8-199c-47a6-bee7-55e909c7b366'::UUID
)
ORDER BY q.created_at;

-- =============================================================================
-- Compare explanations
-- =============================================================================
SELECT 
  q.external_id,
  q.explanations->>'step_by_step' as step_by_step,
  q.explanations->>'visual' as visual,
  q.explanations->>'worked_example' as worked_example
FROM questions q
WHERE q.id IN (
  '029b57f2-953b-449e-a3ae-ed710ff34de1'::UUID,
  '95b36ad8-199c-47a6-bee7-55e909c7b366'::UUID
)
ORDER BY q.created_at;

-- =============================================================================
-- Check if these questions have been attempted by children
-- =============================================================================
SELECT 
  qa.question_id,
  q.external_id,
  COUNT(*) as attempt_count,
  COUNT(DISTINCT qa.child_id) as unique_children,
  COUNT(DISTINCT qa.session_id) as unique_sessions,
  SUM(CASE WHEN qa.is_correct THEN 1 ELSE 0 END) as correct_count,
  SUM(CASE WHEN NOT qa.is_correct THEN 1 ELSE 0 END) as incorrect_count,
  ROUND(AVG(CASE WHEN qa.is_correct THEN 1.0 ELSE 0.0 END) * 100, 2) as accuracy_percent
FROM question_attempts qa
JOIN questions q ON q.id = qa.question_id
WHERE qa.question_id IN (
  '029b57f2-953b-449e-a3ae-ed710ff34de1'::UUID,
  '95b36ad8-199c-47a6-bee7-55e909c7b366'::UUID
)
GROUP BY qa.question_id, q.external_id
ORDER BY attempt_count DESC;

-- =============================================================================
-- Check external_id pattern
-- =============================================================================
-- These are from different batches: 00184 vs 00808
-- Both are Grammar, Punctuation, Foundation, Year 3
-- This suggests they were generated in two separate import batches

SELECT 
  'Analysis' as check_type,
  'ENG-GRM-punc-F-Y3-00184 was imported first (created 2026-01-22 22:52:31.387513)' as finding_1,
  'ENG-GRM-punc-F-Y3-00808 was imported ~1 second later (created 2026-01-22 22:52:32.685722)' as finding_2,
  'Same import session, but different batch numbers suggest generation bug' as finding_3,
  'Both questions are 100% identical - same text, options, and answer' as finding_4;

-- =============================================================================
-- Find all questions in this external_id range to see the pattern
-- =============================================================================
SELECT 
  external_id,
  question_text,
  correct_answer,
  created_at
FROM questions
WHERE external_id LIKE 'ENG-GRM-punc-F-Y3-%'
  AND year_group = 3
  AND is_published = true
ORDER BY 
  CAST(SUBSTRING(external_id FROM 'Y3-(\d+)') AS INTEGER);

-- =============================================================================
-- DIAGNOSIS
-- =============================================================================
/*
WHY THIS IS FLAGGED AS DUPLICATE:

1. IDENTICAL CONTENT:
   - Same question_text: "Add the correct punctuation: stop right there"
   - Same options (all 5 options exactly match)
   - Same correct_answer: "C"
   - Same topic, difficulty, year_group

2. DIFFERENT IDENTIFIERS:
   - Different UUIDs (029b57f2... vs 95b36ad8...)
   - Different external_ids (00808 vs 00184)
   - Created 1.3 seconds apart in same import session

3. ROOT CAUSE OPTIONS:
   a) Generation Bug: AI generated same question twice with different IDs
   b) Import Bug: Same source question imported twice with different external_ids
   c) Data Preparation: Source JSON had duplicate with different numbering
   
4. RECOMMENDED ACTION:
   - Keep the OLDER question (00184, created first)
   - Delete the newer question (00808)
   - Before deletion, migrate any attempts/history from 00808 → 00184
   - This ensures no child progress is lost

5. PREVENTION FOR Y5/Y6:
   - The "Non-Repetition Across Batches" section in READY-TO-USE-CLAUDE-PROMPT.md
     specifically addresses this
   - Question generation now includes uniqueness checks
   - External_id UNIQUE constraint prevents exact duplicates (but not content duplicates)
*/

-- =============================================================================
-- CLEANUP SCRIPT (DO NOT RUN YET - FOR REFERENCE ONLY)
-- =============================================================================
/*
-- Step 1: Check for attempts/history on the newer question
SELECT * FROM question_attempts WHERE question_id = '029b57f2-953b-449e-a3ae-ed710ff34de1';
SELECT * FROM child_question_history WHERE question_id = '029b57f2-953b-449e-a3ae-ed710ff34de1';

-- Step 2: If attempts exist, migrate them to the older question
UPDATE question_attempts 
SET question_id = '95b36ad8-199c-47a6-bee7-55e909c7b366'
WHERE question_id = '029b57f2-953b-449e-a3ae-ed710ff34de1';

UPDATE child_question_history 
SET question_id = '95b36ad8-199c-47a6-bee7-55e909c7b366'
WHERE question_id = '029b57f2-953b-449e-a3ae-ed710ff34de1';

-- Step 3: Delete the duplicate question
DELETE FROM questions WHERE id = '029b57f2-953b-449e-a3ae-ed710ff34de1';

-- Step 4: Verify deletion
SELECT id, external_id FROM questions 
WHERE external_id IN ('ENG-GRM-punc-F-Y3-00808', 'ENG-GRM-punc-F-Y3-00184');
*/
