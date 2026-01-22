-- =============================================================================
-- PREPARE DATABASE FOR YEAR 3 QUESTION IMPORT
-- =============================================================================
-- Purpose: Update schema to support Year 3 questions and add import tracking
-- =============================================================================

-- 1. Update questions table year_group constraint to include Year 3
-- =============================================================================
ALTER TABLE questions DROP CONSTRAINT IF EXISTS questions_year_group_check;
ALTER TABLE questions ADD CONSTRAINT questions_year_group_check 
  CHECK (year_group IN (3, 4, 5, 6));

COMMENT ON COLUMN questions.year_group IS 'UK school year: 3 (age 7-8), 4 (age 8-9), 5 (age 9-10), 6 (age 10-11)';

-- 2. Add external_id column for tracking source question IDs
-- =============================================================================
ALTER TABLE questions 
  ADD COLUMN IF NOT EXISTS external_id VARCHAR(50);

CREATE UNIQUE INDEX IF NOT EXISTS idx_questions_external_id 
  ON questions(external_id) 
  WHERE external_id IS NOT NULL;

COMMENT ON COLUMN questions.external_id IS 
  'Original question ID from import source (e.g., ENG-VOC-syno-F-Y3-00001). Used for deduplication during imports.';

-- 3. Create system import profile for default created_by
-- =============================================================================
-- Create auth.users entry first, then profile
DO $$
DECLARE
  system_profile_id UUID := 'a0000000-0000-0000-0000-000000000001'::UUID;
BEGIN
  -- Create auth.users entry first
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role,
    aud
  ) VALUES (
    system_profile_id,
    '00000000-0000-0000-0000-000000000000'::UUID,
    'system@edlascent.vault',
    crypt('SystemVault2026!ImportOnly', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"EDLAscent Vault - C"}'::jsonb,
    false,
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();
  
  -- Create or update profile
  INSERT INTO profiles (id, email, full_name, subscription_tier, created_at)
  VALUES (
    system_profile_id,
    'system@edlascent.vault',
    'EDLAscent Vault - C',
    'free',
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    updated_at = NOW();
  
  RAISE NOTICE 'System profile created: %', system_profile_id;
END $$;

-- 4. Update default values for questions table
-- =============================================================================
ALTER TABLE questions 
  ALTER COLUMN exam_board SET DEFAULT 'generic',
  ALTER COLUMN ember_score SET DEFAULT 66,
  ALTER COLUMN created_by SET DEFAULT 'a0000000-0000-0000-0000-000000000001'::UUID;

COMMENT ON COLUMN questions.exam_board IS 'GL Assessment, CEM, ISEB, or generic (default for imported questions)';
COMMENT ON COLUMN questions.ember_score IS '0-100 quality score: 60+ required for publishing. Default 66 for verified imports.';
COMMENT ON COLUMN questions.created_by IS 'Content creator/admin. Defaults to system import profile.';

-- 5. Create function to calculate ember_score based on existing logic
-- =============================================================================
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
    RETURN 0;
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
    SELECT 1 FROM question_curriculum_alignment WHERE question_id = p_question_id
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
    v_curriculum_score := 15;
  ELSE
    v_curriculum_score := 5;
  END IF;
  
  -- =============================================================================
  -- EXAM PATTERN SCORE (0-25 points)
  -- Based on question structure and metadata
  -- =============================================================================
  v_exam_pattern_score := 15; -- Base score for verified imports
  
  -- Bonus for complete explanations
  IF v_has_complete_explanations THEN
    v_exam_pattern_score := v_exam_pattern_score + 10;
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
  -- TOTAL SCORE
  -- =============================================================================
  v_total_score := v_curriculum_score + v_exam_pattern_score + v_community_score + v_technical_score;
  
  -- Cap at 100
  v_total_score := LEAST(100, v_total_score);
  
  RETURN v_total_score;
END;
$$;

COMMENT ON FUNCTION calculate_ember_score IS 'Calculates ember_score for a question based on curriculum alignment, exam pattern, community feedback, and technical metrics';

-- =============================================================================
-- 6. Create function to update ember_scores in batch
-- =============================================================================
CREATE OR REPLACE FUNCTION update_all_ember_scores()
RETURNS TABLE(
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
      'curriculum', CASE WHEN EXISTS(SELECT 1 FROM question_curriculum_alignment WHERE question_id = q.id) THEN 25 ELSE 15 END,
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

COMMENT ON FUNCTION update_all_ember_scores IS 'Updates ember_score for all published questions and returns changes';

-- =============================================================================
-- 7. Update children table to support Year 3
-- =============================================================================
ALTER TABLE children DROP CONSTRAINT IF EXISTS children_year_group_check;
ALTER TABLE children ADD CONSTRAINT children_year_group_check 
  CHECK (year_group IN (3, 4, 5, 6));

COMMENT ON COLUMN children.year_group IS 'UK school year: 3 (age 7-8), 4 (age 8-9), 5 (age 9-10), 6 (age 10-11)';

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================
-- Run these to verify the migration worked:

-- Check constraints
SELECT 
  tc.constraint_name,
  cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc
  ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name IN ('questions', 'children')
  AND tc.constraint_name LIKE '%year_group%';

-- Check new column
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'questions'
  AND column_name = 'external_id';

-- Check system profile
SELECT id, email, full_name, subscription_tier
FROM profiles
WHERE email = 'system@edlascent.vault';
