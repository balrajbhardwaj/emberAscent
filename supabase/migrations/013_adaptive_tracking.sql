-- Migration 013: Adaptive Difficulty Tracking
-- 
-- Creates infrastructure for tracking adaptive difficulty performance
-- and question selection history per child and topic.
--
-- Tables:
-- - child_topic_performance: Tracks current difficulty and performance per topic
-- - child_question_history: Tracks question attempts for recency avoidance
-- 
-- Functions:
-- - update_topic_performance(): Updates performance after question attempt
-- - get_child_performance_tracker(): Gets current tracker state
-- - get_topic_mastery_level(): Calculates mastery based on performance
--
-- Created: 2026-01-22
-- Author: Ember Ascent Development Team

-- Enable UUID generation
-- Note: gen_random_uuid() is built into PostgreSQL 13+

-- ============================================================================
-- TABLE: child_topic_performance
-- ============================================================================
-- Tracks adaptive difficulty and performance metrics per child per topic

CREATE TABLE IF NOT EXISTS child_topic_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  topic_id TEXT NOT NULL, -- References topics.id from questions table
  
  -- Current adaptive state
  current_difficulty TEXT NOT NULL DEFAULT 'foundation',
  CONSTRAINT valid_difficulty CHECK (current_difficulty IN ('foundation', 'standard', 'challenge')),
  
  -- Performance tracking (rolling window)
  recent_correct INTEGER NOT NULL DEFAULT 0,
  recent_incorrect INTEGER NOT NULL DEFAULT 0,
  recent_total INTEGER NOT NULL DEFAULT 0,
  recent_accuracy DECIMAL(5,4) GENERATED ALWAYS AS (
    CASE 
      WHEN recent_total > 0 THEN recent_correct::DECIMAL / recent_total
      ELSE 0
    END
  ) STORED,
  
  -- Adjustment tracking
  questions_since_last_adjustment INTEGER NOT NULL DEFAULT 0,
  total_questions_in_topic INTEGER NOT NULL DEFAULT 0,
  last_adjustment_at TIMESTAMPTZ,
  adjustment_count INTEGER NOT NULL DEFAULT 0,
  
  -- Overall performance
  total_correct INTEGER NOT NULL DEFAULT 0,
  total_incorrect INTEGER NOT NULL DEFAULT 0,
  total_attempts INTEGER GENERATED ALWAYS AS (total_correct + total_incorrect) STORED,
  overall_accuracy DECIMAL(5,4) GENERATED ALWAYS AS (
    CASE 
      WHEN (total_correct + total_incorrect) > 0 
      THEN total_correct::DECIMAL / (total_correct + total_incorrect)
      ELSE 0
    END
  ) STORED,
  
  -- Streaks
  current_streak INTEGER NOT NULL DEFAULT 0, -- Consecutive correct
  best_streak INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  first_attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(child_id, topic_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_topic_performance_child ON child_topic_performance(child_id);
CREATE INDEX IF NOT EXISTS idx_topic_performance_topic ON child_topic_performance(topic_id);
CREATE INDEX IF NOT EXISTS idx_topic_performance_difficulty ON child_topic_performance(current_difficulty);
CREATE INDEX IF NOT EXISTS idx_topic_performance_last_attempted ON child_topic_performance(last_attempted_at DESC);

-- ============================================================================
-- TABLE: child_question_history
-- ============================================================================
-- Tracks individual question attempts for recency avoidance and analysis

CREATE TABLE IF NOT EXISTS child_question_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  
  -- Attempt details
  difficulty_at_attempt TEXT NOT NULL,
  CONSTRAINT valid_attempt_difficulty CHECK (difficulty_at_attempt IN ('foundation', 'standard', 'challenge')),
  
  is_correct BOOLEAN NOT NULL,
  time_spent_seconds INTEGER, -- Optional: time to answer
  
  -- Context
  session_id UUID REFERENCES practice_sessions(id) ON DELETE SET NULL,
  topic_id TEXT NOT NULL,
  subtopic_name TEXT,
  
  -- Selection metadata
  selection_score DECIMAL(5,4), -- Score from question selector (for analysis)
  
  -- Timestamps
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Prevent duplicate attempts in same session (optional constraint)
  UNIQUE(child_id, question_id, session_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_question_history_child ON child_question_history(child_id);
CREATE INDEX IF NOT EXISTS idx_question_history_question ON child_question_history(question_id);
CREATE INDEX IF NOT EXISTS idx_question_history_session ON child_question_history(session_id);
CREATE INDEX IF NOT EXISTS idx_question_history_attempted ON child_question_history(attempted_at DESC);
CREATE INDEX IF NOT EXISTS idx_question_history_topic ON child_question_history(topic_id);
CREATE INDEX IF NOT EXISTS idx_question_history_child_topic ON child_question_history(child_id, topic_id);

-- ============================================================================
-- FUNCTION: update_topic_performance
-- ============================================================================
-- Updates child_topic_performance after a question attempt
-- Handles rolling window calculations and difficulty adjustments

CREATE OR REPLACE FUNCTION update_topic_performance(
  p_child_id UUID,
  p_topic_id TEXT,
  p_is_correct BOOLEAN,
  p_window_size INTEGER DEFAULT 5
)
RETURNS TABLE(
  current_difficulty TEXT,
  should_adjust BOOLEAN,
  recommended_difficulty TEXT,
  adjustment_reason TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_performance RECORD;
  v_new_difficulty TEXT;
  v_accuracy DECIMAL;
  v_questions_since_adjustment INTEGER;
BEGIN
  -- Get or create performance record
  INSERT INTO child_topic_performance (child_id, topic_id)
  VALUES (p_child_id, p_topic_id)
  ON CONFLICT (child_id, topic_id) DO NOTHING;
  
  -- Get current state
  SELECT * INTO v_performance
  FROM child_topic_performance
  WHERE child_id = p_child_id AND topic_id = p_topic_id;
  
  -- Update rolling window counts
  -- Add new attempt
  v_performance.recent_correct := v_performance.recent_correct + (CASE WHEN p_is_correct THEN 1 ELSE 0 END);
  v_performance.recent_incorrect := v_performance.recent_incorrect + (CASE WHEN p_is_correct THEN 0 ELSE 1 END);
  v_performance.recent_total := v_performance.recent_total + 1;
  
  -- Keep window size limited
  IF v_performance.recent_total > p_window_size THEN
    -- Scale down proportionally
    v_performance.recent_correct := ROUND(v_performance.recent_correct::DECIMAL * p_window_size / v_performance.recent_total);
    v_performance.recent_incorrect := p_window_size - v_performance.recent_correct;
    v_performance.recent_total := p_window_size;
  END IF;
  
  -- Calculate accuracy
  v_accuracy := CASE 
    WHEN v_performance.recent_total > 0 
    THEN v_performance.recent_correct::DECIMAL / v_performance.recent_total
    ELSE 0
  END;
  
  -- Update overall stats
  v_performance.total_correct := v_performance.total_correct + (CASE WHEN p_is_correct THEN 1 ELSE 0 END);
  v_performance.total_incorrect := v_performance.total_incorrect + (CASE WHEN p_is_correct THEN 0 ELSE 1 END);
  v_performance.total_questions_in_topic := v_performance.total_questions_in_topic + 1;
  v_performance.questions_since_last_adjustment := v_performance.questions_since_last_adjustment + 1;
  
  -- Update streaks
  IF p_is_correct THEN
    v_performance.current_streak := v_performance.current_streak + 1;
    IF v_performance.current_streak > v_performance.best_streak THEN
      v_performance.best_streak := v_performance.current_streak;
    END IF;
  ELSE
    v_performance.current_streak := 0;
  END IF;
  
  -- Determine difficulty adjustment
  v_new_difficulty := v_performance.current_difficulty;
  should_adjust := FALSE;
  adjustment_reason := 'No adjustment needed';
  
  -- Check if adjustment criteria met
  IF v_performance.recent_total >= 3 AND v_performance.questions_since_last_adjustment >= 3 THEN
    -- High accuracy: increase difficulty
    IF v_accuracy > 0.75 THEN
      IF v_performance.current_difficulty = 'foundation' THEN
        v_new_difficulty := 'standard';
        should_adjust := TRUE;
        adjustment_reason := 'High accuracy - increasing challenge';
      ELSIF v_performance.current_difficulty = 'standard' THEN
        v_new_difficulty := 'challenge';
        should_adjust := TRUE;
        adjustment_reason := 'High accuracy - increasing challenge';
      ELSE
        adjustment_reason := 'Already at hardest difficulty';
      END IF;
    
    -- Low accuracy: decrease difficulty
    ELSIF v_accuracy < 0.45 THEN
      IF v_performance.current_difficulty = 'challenge' THEN
        v_new_difficulty := 'standard';
        should_adjust := TRUE;
        adjustment_reason := 'Low accuracy - making questions easier';
      ELSIF v_performance.current_difficulty = 'standard' THEN
        v_new_difficulty := 'foundation';
        should_adjust := TRUE;
        adjustment_reason := 'Low accuracy - making questions easier';
      ELSE
        adjustment_reason := 'Already at easiest difficulty';
      END IF;
    
    ELSE
      adjustment_reason := 'Accuracy in target range';
    END IF;
  ELSIF v_performance.recent_total < 3 THEN
    adjustment_reason := 'Need more questions before adjusting';
  ELSE
    adjustment_reason := 'Cooldown period active';
  END IF;
  
  -- Apply adjustment if needed
  IF should_adjust THEN
    v_performance.current_difficulty := v_new_difficulty;
    v_performance.questions_since_last_adjustment := 0;
    v_performance.last_adjustment_at := NOW();
    v_performance.adjustment_count := v_performance.adjustment_count + 1;
  END IF;
  
  -- Update database
  UPDATE child_topic_performance SET
    current_difficulty = v_performance.current_difficulty,
    recent_correct = v_performance.recent_correct,
    recent_incorrect = v_performance.recent_incorrect,
    recent_total = v_performance.recent_total,
    questions_since_last_adjustment = v_performance.questions_since_last_adjustment,
    total_questions_in_topic = v_performance.total_questions_in_topic,
    total_correct = v_performance.total_correct,
    total_incorrect = v_performance.total_incorrect,
    current_streak = v_performance.current_streak,
    best_streak = v_performance.best_streak,
    last_adjustment_at = v_performance.last_adjustment_at,
    adjustment_count = v_performance.adjustment_count,
    last_attempted_at = NOW(),
    updated_at = NOW()
  WHERE child_id = p_child_id AND topic_id = p_topic_id;
  
  -- Return adjustment info
  RETURN QUERY
  SELECT 
    v_performance.current_difficulty,
    should_adjust,
    v_new_difficulty AS recommended_difficulty,
    adjustment_reason;
END;
$$;

-- ============================================================================
-- FUNCTION: get_child_performance_tracker
-- ============================================================================
-- Gets complete performance tracker state for a child and topic

CREATE OR REPLACE FUNCTION get_child_performance_tracker(
  p_child_id UUID,
  p_topic_id TEXT
)
RETURNS TABLE(
  child_id UUID,
  topic_id TEXT,
  current_difficulty TEXT,
  recent_correct INTEGER,
  recent_incorrect INTEGER,
  recent_total INTEGER,
  recent_accuracy DECIMAL,
  questions_since_last_adjustment INTEGER,
  total_questions_in_topic INTEGER,
  last_adjustment_at TIMESTAMPTZ,
  total_correct INTEGER,
  total_incorrect INTEGER,
  overall_accuracy DECIMAL,
  current_streak INTEGER,
  best_streak INTEGER,
  last_attempted_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create tracker if doesn't exist
  INSERT INTO child_topic_performance (child_id, topic_id)
  VALUES (p_child_id, p_topic_id)
  ON CONFLICT (child_id, topic_id) DO NOTHING;
  
  -- Return tracker
  RETURN QUERY
  SELECT 
    ctp.child_id,
    ctp.topic_id,
    ctp.current_difficulty,
    ctp.recent_correct,
    ctp.recent_incorrect,
    ctp.recent_total,
    ctp.recent_accuracy,
    ctp.questions_since_last_adjustment,
    ctp.total_questions_in_topic,
    ctp.last_adjustment_at,
    ctp.total_correct,
    ctp.total_incorrect,
    ctp.overall_accuracy,
    ctp.current_streak,
    ctp.best_streak,
    ctp.last_attempted_at
  FROM child_topic_performance ctp
  WHERE ctp.child_id = p_child_id AND ctp.topic_id = p_topic_id;
END;
$$;

-- ============================================================================
-- FUNCTION: get_topic_mastery_level
-- ============================================================================
-- Calculates mastery level based on performance

CREATE OR REPLACE FUNCTION get_topic_mastery_level(
  p_child_id UUID,
  p_topic_id TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_performance RECORD;
  v_mastery TEXT;
BEGIN
  -- Get performance
  SELECT * INTO v_performance
  FROM child_topic_performance
  WHERE child_id = p_child_id AND topic_id = p_topic_id;
  
  -- If no attempts, return beginner
  IF v_performance IS NULL OR v_performance.total_questions_in_topic = 0 THEN
    RETURN 'beginner';
  END IF;
  
  -- Calculate mastery based on difficulty, accuracy, and experience
  IF v_performance.current_difficulty = 'challenge' AND 
     v_performance.overall_accuracy >= 0.75 AND 
     v_performance.total_questions_in_topic >= 20 THEN
    v_mastery := 'mastered';
  
  ELSIF v_performance.current_difficulty = 'challenge' OR
        (v_performance.current_difficulty = 'standard' AND v_performance.overall_accuracy >= 0.70) THEN
    v_mastery := 'advanced';
  
  ELSIF v_performance.current_difficulty = 'standard' OR
        (v_performance.current_difficulty = 'foundation' AND v_performance.overall_accuracy >= 0.65) THEN
    v_mastery := 'progressing';
  
  ELSE
    v_mastery := 'developing';
  END IF;
  
  RETURN v_mastery;
END;
$$;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE child_topic_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_question_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Parents can view their children's performance" ON child_topic_performance;
DROP POLICY IF EXISTS "System can insert performance records" ON child_topic_performance;
DROP POLICY IF EXISTS "System can update performance records" ON child_topic_performance;
DROP POLICY IF EXISTS "Parents can view their children's history" ON child_question_history;
DROP POLICY IF EXISTS "System can insert history records" ON child_question_history;

-- child_topic_performance policies
CREATE POLICY "Parents can view their children's performance"
  ON child_topic_performance
  FOR SELECT
  USING (
    child_id IN (
      SELECT c.id FROM children c WHERE c.parent_id = auth.uid()
    )
  );

CREATE POLICY "System can insert performance records"
  ON child_topic_performance
  FOR INSERT
  WITH CHECK (
    child_id IN (
      SELECT c.id FROM children c WHERE c.parent_id = auth.uid()
    )
  );

CREATE POLICY "System can update performance records"
  ON child_topic_performance
  FOR UPDATE
  USING (
    child_id IN (
      SELECT c.id FROM children c WHERE c.parent_id = auth.uid()
    )
  );

-- child_question_history policies
CREATE POLICY "Parents can view their children's history"
  ON child_question_history
  FOR SELECT
  USING (
    child_id IN (
      SELECT c.id FROM children c WHERE c.parent_id = auth.uid()
    )
  );

CREATE POLICY "System can insert history records"
  ON child_question_history
  FOR INSERT
  WITH CHECK (
    child_id IN (
      SELECT c.id FROM children c WHERE c.parent_id = auth.uid()
    )
  );

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE child_topic_performance IS 'Tracks adaptive difficulty and performance metrics per child per topic';
COMMENT ON TABLE child_question_history IS 'Individual question attempt history for recency avoidance and analysis';

COMMENT ON FUNCTION update_topic_performance IS 'Updates performance tracker after question attempt with rolling window';
COMMENT ON FUNCTION get_child_performance_tracker IS 'Gets complete performance tracker state for a child and topic';
COMMENT ON FUNCTION get_topic_mastery_level IS 'Calculates mastery level (beginner/developing/progressing/advanced/mastered)';
