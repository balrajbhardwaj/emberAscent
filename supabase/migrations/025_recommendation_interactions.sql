-- =====================================================
-- Recommendation Interactions Table
-- Tracks practice session starts, completions, and dismissals from study recommendations
-- =====================================================
-- Created: 2024
-- Purpose: Enable tracking of recommendation engagement with audit trail

-- Create the recommendation_interactions table
CREATE TABLE IF NOT EXISTS recommendation_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  
  -- Recommendation identification
  recommendation_type TEXT NOT NULL,
  subject TEXT NOT NULL,
  topic TEXT,
  difficulty TEXT,
  
  -- Interaction tracking
  interaction_type TEXT NOT NULL,
  session_id UUID REFERENCES practice_sessions(id) ON DELETE SET NULL,
  
  -- Audit trail
  performed_by UUID NOT NULL REFERENCES auth.users(id),
  performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Soft delete for dismissals
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  dismissed_reason TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints (added separately to avoid parsing issues)
  CONSTRAINT chk_recommendation_type CHECK (recommendation_type IN ('subject', 'topic', 'weakness', 'challenge')),
  CONSTRAINT chk_interaction_type CHECK (interaction_type IN ('started', 'completed', 'dismissed')),
  CONSTRAINT chk_difficulty CHECK (difficulty IS NULL OR difficulty IN ('Foundation', 'Standard', 'Challenge'))
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_rec_interactions_child_id ON recommendation_interactions(child_id);
CREATE INDEX IF NOT EXISTS idx_rec_interactions_type ON recommendation_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_rec_interactions_subject ON recommendation_interactions(subject, topic);
CREATE INDEX IF NOT EXISTS idx_rec_interactions_active ON recommendation_interactions(child_id, is_active) WHERE is_active = TRUE;

-- Enable RLS
ALTER TABLE recommendation_interactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running migration)
DROP POLICY IF EXISTS "Parents can view own children recommendation interactions" ON recommendation_interactions;
DROP POLICY IF EXISTS "Parents can insert recommendation interactions for own children" ON recommendation_interactions;
DROP POLICY IF EXISTS "Parents can update own children recommendation interactions" ON recommendation_interactions;

-- RLS Policies: Parents can only access their own children's data
CREATE POLICY "Parents can view own children recommendation interactions"
  ON recommendation_interactions FOR SELECT
  USING (
    child_id IN (
      SELECT id FROM children WHERE parent_id = auth.uid()
    )
  );

CREATE POLICY "Parents can insert recommendation interactions for own children"
  ON recommendation_interactions FOR INSERT
  WITH CHECK (
    child_id IN (
      SELECT id FROM children WHERE parent_id = auth.uid()
    )
    AND performed_by = auth.uid()
  );

CREATE POLICY "Parents can update own children recommendation interactions"
  ON recommendation_interactions FOR UPDATE
  USING (
    child_id IN (
      SELECT id FROM children WHERE parent_id = auth.uid()
    )
  )
  WITH CHECK (
    child_id IN (
      SELECT id FROM children WHERE parent_id = auth.uid()
    )
  );

-- Function to get recommendation attempt counts for a child
-- Drop first if exists with different signature
DROP FUNCTION IF EXISTS get_recommendation_stats(UUID);

CREATE OR REPLACE FUNCTION get_recommendation_stats(p_child_id UUID)
RETURNS TABLE (
  out_subject TEXT,
  out_topic TEXT,
  started_count BIGINT,
  completed_count BIGINT,
  last_attempted TIMESTAMPTZ,
  is_dismissed BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ri.subject AS out_subject,
    ri.topic AS out_topic,
    COUNT(*) FILTER (WHERE ri.interaction_type = 'started') AS started_count,
    COUNT(*) FILTER (WHERE ri.interaction_type = 'completed') AS completed_count,
    MAX(ri.performed_at) FILTER (WHERE ri.interaction_type IN ('started', 'completed')) AS last_attempted,
    BOOL_OR(ri.interaction_type = 'dismissed' AND ri.is_active = TRUE) AS is_dismissed
  FROM recommendation_interactions ri
  WHERE ri.child_id = p_child_id
  GROUP BY ri.subject, ri.topic;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_recommendation_stats(UUID) TO authenticated;

-- Updated_at trigger (drop first if exists for re-running)
DROP TRIGGER IF EXISTS update_recommendation_interactions_updated_at ON recommendation_interactions;
CREATE TRIGGER update_recommendation_interactions_updated_at
  BEFORE UPDATE ON recommendation_interactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE recommendation_interactions IS 'Tracks user interactions with study recommendations (starts, completions, dismissals)';
COMMENT ON COLUMN recommendation_interactions.recommendation_type IS 'Type: subject (whole subject), topic (specific topic), weakness (from analytics), challenge (difficulty-based)';
COMMENT ON COLUMN recommendation_interactions.interaction_type IS 'Action taken: started (began practice), completed (finished session), dismissed (removed from view)';
COMMENT ON COLUMN recommendation_interactions.is_active IS 'Soft delete flag - FALSE means the dismissal was undone';
