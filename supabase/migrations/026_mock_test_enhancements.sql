-- Migration 026: Mock Test Enhancements
-- Adds fields and tables for mock test mode

-- Add mock test fields to practice_sessions
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS is_mock_test boolean DEFAULT false;
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS mock_test_config jsonb; -- stores test configuration
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS time_limit_seconds integer; -- time limit for test
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS time_taken_seconds integer; -- actual time taken
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS flagged_questions uuid[]; -- question IDs flagged for review

-- Add fields to track question navigation in session_responses
ALTER TABLE session_responses ADD COLUMN IF NOT EXISTS visited_at timestamptz; -- when question was first viewed
ALTER TABLE session_responses ADD COLUMN IF NOT EXISTS flagged_for_review boolean DEFAULT false;
ALTER TABLE session_responses ADD COLUMN IF NOT EXISTS answer_changed_count integer DEFAULT 0; -- how many times answer was changed

-- Create mock test templates table
CREATE TABLE IF NOT EXISTS mock_test_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  style text NOT NULL CHECK (style IN ('GL Assessment', 'CEM', 'Mixed')),
  total_questions integer NOT NULL,
  time_limit_minutes integer NOT NULL,
  difficulty_distribution jsonb NOT NULL, -- {"Foundation": 0.25, "Standard": 0.50, "Challenge": 0.25}
  subject_distribution jsonb NOT NULL, -- {"Maths": 16, "English": 16, "VR": 18, "NVR": 0}
  year_groups integer[] NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for active templates
CREATE INDEX IF NOT EXISTS idx_mock_test_templates_active ON mock_test_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_mock ON practice_sessions(child_id, is_mock_test);

-- RLS for mock test templates
ALTER TABLE mock_test_templates ENABLE ROW LEVEL SECURITY;

-- Everyone can view active templates
CREATE POLICY "Active mock test templates are viewable by all"
  ON mock_test_templates FOR SELECT
  USING (is_active = true);

-- Admins can manage templates
CREATE POLICY "Admins can manage mock test templates"
  ON mock_test_templates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Seed default mock test templates
INSERT INTO mock_test_templates (
  name,
  description,
  style,
  total_questions,
  time_limit_minutes,
  difficulty_distribution,
  subject_distribution,
  year_groups
) VALUES
  (
    'Standard 11+ Mock Test',
    'Full-length mock test covering all subjects',
    'GL Assessment',
    50,
    45,
    '{"Foundation": 0.25, "Standard": 0.50, "Challenge": 0.25}',
    '{"Maths": 16, "English": 16, "Verbal Reasoning": 18, "Non-Verbal Reasoning": 0}',
    ARRAY[5, 6]
  ),
  (
    'Maths Focus Mock',
    'Maths-heavy practice test',
    'Mixed',
    30,
    30,
    '{"Foundation": 0.20, "Standard": 0.50, "Challenge": 0.30}',
    '{"Maths": 30, "English": 0, "Verbal Reasoning": 0, "Non-Verbal Reasoning": 0}',
    ARRAY[4, 5, 6]
  ),
  (
    'English Focus Mock',
    'English comprehension and grammar test',
    'Mixed',
    30,
    30,
    '{"Foundation": 0.20, "Standard": 0.50, "Challenge": 0.30}',
    '{"Maths": 0, "English": 30, "Verbal Reasoning": 0, "Non-Verbal Reasoning": 0}',
    ARRAY[4, 5, 6]
  ),
  (
    'Verbal Reasoning Mock',
    'Focused verbal reasoning practice',
    'Mixed',
    30,
    30,
    '{"Foundation": 0.20, "Standard": 0.50, "Challenge": 0.30}',
    '{"Maths": 0, "English": 0, "Verbal Reasoning": 30, "Non-Verbal Reasoning": 0}',
    ARRAY[4, 5, 6]
  ),
  (
    'Quick Practice Test',
    'Short 15-minute test for quick practice',
    'Mixed',
    20,
    15,
    '{"Foundation": 0.30, "Standard": 0.50, "Challenge": 0.20}',
    '{"Maths": 7, "English": 7, "Verbal Reasoning": 6, "Non-Verbal Reasoning": 0}',
    ARRAY[3, 4, 5, 6]
  )
ON CONFLICT DO NOTHING;

-- Function to generate mock test question set
CREATE OR REPLACE FUNCTION generate_mock_test_questions(
  p_template_id uuid,
  p_child_id uuid
) RETURNS TABLE(question_id uuid, display_order integer) AS $$
DECLARE
  v_template mock_test_templates;
  v_child_year_group integer;
  v_subject_key text;
  v_subject_count integer;
  v_difficulty_key text;
  v_difficulty_pct numeric;
  v_difficulty_count integer;
  v_order integer := 0;
BEGIN
  -- Get template
  SELECT * INTO v_template FROM mock_test_templates WHERE id = p_template_id;
  
  -- Get child's year group
  SELECT year_group INTO v_child_year_group FROM children WHERE id = p_child_id;
  
  -- For each subject in distribution
  FOR v_subject_key, v_subject_count IN
    SELECT key::text, value::integer
    FROM jsonb_each(v_template.subject_distribution)
    WHERE value::integer > 0
  LOOP
    -- For each difficulty level
    FOR v_difficulty_key, v_difficulty_pct IN
      SELECT key::text, value::numeric
      FROM jsonb_each(v_template.difficulty_distribution)
    LOOP
      v_difficulty_count := ROUND(v_subject_count * v_difficulty_pct);
      
      -- Return questions for this subject/difficulty combo
      RETURN QUERY
      SELECT q.id, v_order + ROW_NUMBER() OVER (ORDER BY RANDOM())::integer
      FROM questions q
      WHERE q.subject = v_subject_key
        AND q.difficulty = v_difficulty_key
        AND (q.year_group::text = v_child_year_group::text OR q.year_group::text = ANY(v_template.year_groups::text[]))
        AND q.review_status IN ('approved', 'active')
        AND q.id NOT IN (
          -- Exclude recently practiced questions (last 7 days)
          SELECT sr.question_id
          FROM session_responses sr
          JOIN practice_sessions ps ON sr.session_id = ps.id
          WHERE ps.child_id = p_child_id
            AND ps.started_at > NOW() - INTERVAL '7 days'
        )
      ORDER BY RANDOM()
      LIMIT v_difficulty_count;
      
      v_order := v_order + v_difficulty_count;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_mock_template_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_mock_test_templates_timestamp
  BEFORE UPDATE ON mock_test_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_mock_template_timestamp();
