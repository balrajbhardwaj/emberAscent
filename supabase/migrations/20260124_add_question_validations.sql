/**
 * Migration: Add Question Validations Table
 * 
 * Creates table to store validation results for AI-generated questions.
 * Supports the validation pipeline workflow for review and quality control.
 * 
 * Run this migration in Supabase Dashboard SQL Editor:
 * https://supabase.com/dashboard/project/cmujulpwvmfvpyypcfaa/sql/new
 */

-- Create question_validations table
CREATE TABLE IF NOT EXISTS question_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id TEXT NOT NULL,
  validation_run_at TIMESTAMPTZ DEFAULT NOW(),
  passed BOOLEAN NOT NULL,
  checks JSONB NOT NULL,
  errors JSONB,
  warnings JSONB,
  auto_corrected BOOLEAN DEFAULT FALSE,
  corrections_applied JSONB,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for finding failed validations
CREATE INDEX IF NOT EXISTS idx_validations_failed 
ON question_validations(passed) 
WHERE passed = FALSE;

-- Add index for question lookups
CREATE INDEX IF NOT EXISTS idx_validations_question_id 
ON question_validations(question_id);

-- Add index for validation runs by date
CREATE INDEX IF NOT EXISTS idx_validations_run_at 
ON question_validations(validation_run_at DESC);

-- Create view for review queue (failed validations needing human review)
CREATE OR REPLACE VIEW validation_review_queue AS
SELECT 
  qv.*,
  q.question_text,
  q.topic,
  q.subtopic,
  q.difficulty
FROM question_validations qv
LEFT JOIN questions q ON q.external_id = qv.question_id OR q.id::text = qv.question_id
WHERE qv.passed = FALSE 
  AND qv.reviewed_at IS NULL
ORDER BY qv.validation_run_at DESC;

-- Grant permissions (adjust based on your RLS policies)
-- Admin users should have access to validations
GRANT SELECT, INSERT, UPDATE ON question_validations TO authenticated;
GRANT SELECT ON validation_review_queue TO authenticated;

-- Add RLS policies
ALTER TABLE question_validations ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can see all validations
CREATE POLICY "Admins can view all validations" ON question_validations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Policy: Admins can insert validation results
CREATE POLICY "Admins can insert validations" ON question_validations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Policy: Admins can update validation reviews
CREATE POLICY "Admins can update validations" ON question_validations
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Add comment for documentation
COMMENT ON TABLE question_validations IS 'Stores validation results for AI-generated questions. Part of the quality control pipeline.';
COMMENT ON COLUMN question_validations.checks IS 'Array of check results from all validation layers (consistency, arithmetic, fractions)';
COMMENT ON COLUMN question_validations.errors IS 'Array of validation errors with severity and suggested fixes';
COMMENT ON COLUMN question_validations.corrections_applied IS 'Auto-corrections that were applied to pass validation';

-- Function to get validation statistics
CREATE OR REPLACE FUNCTION get_validation_stats(
  since_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '7 days'
)
RETURNS TABLE (
  total_validations BIGINT,
  passed_count BIGINT,
  failed_count BIGINT,
  auto_corrected_count BIGINT,
  pass_rate NUMERIC,
  needs_review BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_validations,
    COUNT(*) FILTER (WHERE passed = TRUE) as passed_count,
    COUNT(*) FILTER (WHERE passed = FALSE) as failed_count,
    COUNT(*) FILTER (WHERE auto_corrected = TRUE) as auto_corrected_count,
    ROUND(
      COUNT(*) FILTER (WHERE passed = TRUE)::NUMERIC / 
      NULLIF(COUNT(*), 0) * 100, 
      2
    ) as pass_rate,
    COUNT(*) FILTER (WHERE passed = FALSE AND reviewed_at IS NULL) as needs_review
  FROM question_validations
  WHERE validation_run_at >= since_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
