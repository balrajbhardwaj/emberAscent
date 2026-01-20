-- Migration 006: Question Provenance Tracking
-- 
-- Creates audit logging system for question lifecycle:
-- - Creation, modification, review events
-- - Attribution tracking
-- - Quality changes
-- 
-- Supports OGL v3.0 compliance and transparency reporting

-- ============================================================================
-- TABLES
-- ============================================================================

-- Question provenance/audit log
CREATE TABLE IF NOT EXISTS question_provenance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  actor_id UUID REFERENCES auth.users(id),
  actor_type TEXT, -- 'system', 'admin', 'expert', 'ai'
  occurred_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT valid_event_type CHECK (event_type IN (
    'created',
    'modified',
    'reviewed',
    'published',
    'unpublished',
    'score_changed',
    'error_reported',
    'error_resolved',
    'feedback_received'
  ))
);

-- Indexes for performance
CREATE INDEX idx_question_provenance_question ON question_provenance(question_id);
CREATE INDEX idx_question_provenance_occurred ON question_provenance(occurred_at DESC);
CREATE INDEX idx_question_provenance_event_type ON question_provenance(event_type);

-- Enable RLS
ALTER TABLE question_provenance ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view provenance (transparency)
CREATE POLICY "Provenance visible to all authenticated users"
  ON question_provenance
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Only admins can insert provenance records
CREATE POLICY "Only admins can create provenance records"
  ON question_provenance
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND subscription_tier = 'summit' -- Admin tier
    )
  );

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

/**
 * Log a provenance event
 * 
 * @param p_question_id - Question ID
 * @param p_event_type - Event type
 * @param p_event_data - Event details (JSONB)
 * @param p_actor_type - Type of actor (system, admin, expert, ai)
 * @returns UUID of created log entry
 */
CREATE OR REPLACE FUNCTION log_provenance_event(
  p_question_id UUID,
  p_event_type TEXT,
  p_event_data JSONB DEFAULT '{}'::jsonb,
  p_actor_type TEXT DEFAULT 'system'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO question_provenance (
    question_id,
    event_type,
    event_data,
    actor_id,
    actor_type
  ) VALUES (
    p_question_id,
    p_event_type,
    p_event_data,
    auth.uid(),
    p_actor_type
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

/**
 * Get provenance timeline for a question
 * 
 * @param p_question_id - Question ID
 * @returns Table of provenance events
 */
CREATE OR REPLACE FUNCTION get_question_provenance(p_question_id UUID)
RETURNS TABLE (
  id UUID,
  event_type TEXT,
  event_data JSONB,
  actor_name TEXT,
  actor_type TEXT,
  occurred_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    qp.id,
    qp.event_type,
    qp.event_data,
    COALESCE(p.full_name, 'System') as actor_name,
    qp.actor_type,
    qp.occurred_at
  FROM question_provenance qp
  LEFT JOIN profiles p ON p.id = qp.actor_id
  WHERE qp.question_id = p_question_id
  ORDER BY qp.occurred_at DESC;
END;
$$;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

/**
 * Trigger function: Log question creation
 */
CREATE OR REPLACE FUNCTION trigger_log_question_creation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM log_provenance_event(
    NEW.id,
    'created',
    jsonb_build_object(
      'subject', NEW.subject,
      'topic', NEW.topic,
      'difficulty', NEW.difficulty,
      'curriculum_reference', NEW.curriculum_reference,
      'created_by', NEW.created_by
    ),
    'ai' -- Most questions created by AI
  );
  
  RETURN NEW;
END;
$$;

-- Trigger: Log question creation
CREATE TRIGGER log_question_creation
  AFTER INSERT ON questions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_log_question_creation();

/**
 * Trigger function: Log question modifications
 */
CREATE OR REPLACE FUNCTION trigger_log_question_modification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_changes JSONB;
BEGIN
  -- Build changes object
  v_changes := jsonb_build_object(
    'before', row_to_json(OLD)::jsonb,
    'after', row_to_json(NEW)::jsonb
  );
  
  -- Log review status changes
  IF OLD.review_status IS DISTINCT FROM NEW.review_status THEN
    PERFORM log_provenance_event(
      NEW.id,
      'reviewed',
      jsonb_build_object(
        'old_status', OLD.review_status,
        'new_status', NEW.review_status,
        'reviewed_by', NEW.reviewed_by
      ),
      CASE 
        WHEN NEW.review_status = 'reviewed' THEN 'expert'
        WHEN NEW.review_status = 'spot_checked' THEN 'admin'
        ELSE 'system'
      END
    );
  END IF;
  
  -- Log publication changes
  IF OLD.is_published IS DISTINCT FROM NEW.is_published THEN
    PERFORM log_provenance_event(
      NEW.id,
      CASE WHEN NEW.is_published THEN 'published' ELSE 'unpublished' END,
      jsonb_build_object(
        'reason', CASE 
          WHEN NOT NEW.is_published AND NEW.ember_score < 60 THEN 'score_below_threshold'
          ELSE 'manual'
        END
      ),
      'system'
    );
  END IF;
  
  -- Log Ember Score changes (significant changes only)
  IF OLD.ember_score IS DISTINCT FROM NEW.ember_score 
     AND ABS(OLD.ember_score - NEW.ember_score) >= 5 THEN
    PERFORM log_provenance_event(
      NEW.id,
      'score_changed',
      jsonb_build_object(
        'old_score', OLD.ember_score,
        'new_score', NEW.ember_score,
        'old_tier', 
          CASE 
            WHEN OLD.ember_score >= 90 THEN 'verified'
            WHEN OLD.ember_score >= 75 THEN 'confident'
            ELSE 'draft'
          END,
        'new_tier',
          CASE 
            WHEN NEW.ember_score >= 90 THEN 'verified'
            WHEN NEW.ember_score >= 75 THEN 'confident'
            ELSE 'draft'
          END
      ),
      'system'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger: Log question modifications
CREATE TRIGGER log_question_modification
  AFTER UPDATE ON questions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_log_question_modification();

/**
 * Trigger function: Log error reports
 */
CREATE OR REPLACE FUNCTION trigger_log_error_report()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM log_provenance_event(
      NEW.question_id,
      'error_reported',
      jsonb_build_object(
        'report_type', NEW.report_type,
        'description', NEW.description,
        'report_id', NEW.id
      ),
      'system'
    );
  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status AND NEW.status IN ('fixed', 'dismissed') THEN
    PERFORM log_provenance_event(
      NEW.question_id,
      'error_resolved',
      jsonb_build_object(
        'report_type', NEW.report_type,
        'resolution', NEW.status,
        'admin_notes', NEW.admin_notes,
        'report_id', NEW.id
      ),
      'admin'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger: Log error reports
CREATE TRIGGER log_error_report
  AFTER INSERT OR UPDATE ON error_reports
  FOR EACH ROW
  EXECUTE FUNCTION trigger_log_error_report();

-- ============================================================================
-- ATTRIBUTION DATA
-- ============================================================================

-- Create table for tracking content sources and attributions
CREATE TABLE IF NOT EXISTS content_attributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL, -- 'question', 'explanation', 'image'
  content_id UUID NOT NULL,
  source_type TEXT NOT NULL, -- 'ai_generated', 'curriculum_derived', 'expert_created'
  source_details JSONB NOT NULL DEFAULT '{}'::jsonb,
  license TEXT NOT NULL DEFAULT 'OGL-3.0', -- Open Government License v3.0
  attribution_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT valid_content_type CHECK (content_type IN ('question', 'explanation', 'image')),
  CONSTRAINT valid_source_type CHECK (source_type IN ('ai_generated', 'curriculum_derived', 'expert_created', 'community'))
);

-- Index for lookups
CREATE INDEX idx_content_attributions_content ON content_attributions(content_type, content_id);

-- Enable RLS
ALTER TABLE content_attributions ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view attributions (transparency)
CREATE POLICY "Attributions visible to all"
  ON content_attributions
  FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Create attribution records for existing questions
INSERT INTO content_attributions (content_type, content_id, source_type, source_details, attribution_text)
SELECT 
  'question',
  id,
  'ai_generated',
  jsonb_build_object(
    'model', 'Claude 3.5 Sonnet',
    'provider', 'Anthropic',
    'curriculum_aligned', curriculum_reference IS NOT NULL
  ),
  'Question generated using Claude AI (Anthropic) aligned with UK National Curriculum objectives. Licensed under OGL v3.0.'
FROM questions
ON CONFLICT DO NOTHING;

-- Create provenance records for existing questions (backfill)
INSERT INTO question_provenance (question_id, event_type, event_data, actor_type, occurred_at)
SELECT 
  id,
  'created',
  jsonb_build_object(
    'subject', subject,
    'topic', topic,
    'backfilled', true
  ),
  'ai',
  created_at
FROM questions
ON CONFLICT DO NOTHING;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT ON question_provenance TO authenticated;
GRANT SELECT ON content_attributions TO authenticated;
GRANT EXECUTE ON FUNCTION log_provenance_event TO authenticated;
GRANT EXECUTE ON FUNCTION get_question_provenance TO authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE question_provenance IS 'Audit log tracking the complete lifecycle of questions for transparency and compliance';
COMMENT ON TABLE content_attributions IS 'Tracks content sources and licensing information for OGL v3.0 compliance';
COMMENT ON FUNCTION log_provenance_event IS 'Logs a provenance event for a question';
COMMENT ON FUNCTION get_question_provenance IS 'Retrieves the complete provenance timeline for a question';
