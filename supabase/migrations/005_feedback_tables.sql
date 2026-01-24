-- Migration: Feedback Collection System Refresh
-- Purpose: Define full feedback data model (question, session, NPS) and reference tags
-- NOTE: Run via Supabase Dashboard SQL Editor per architecture guidelines.

-- =====================================================
-- SAFETY: RENAME LEGACY TABLES IF NEEDED
-- =====================================================
DO $$
BEGIN
  IF to_regclass('public.nps_surveys') IS NOT NULL AND to_regclass('public.nps_responses') IS NULL THEN
    ALTER TABLE public.nps_surveys RENAME TO nps_responses;
  END IF;
END $$;

-- =====================================================
-- QUESTION FEEDBACK ENHANCEMENTS
-- =====================================================
ALTER TABLE IF EXISTS question_feedback
  ADD COLUMN IF NOT EXISTS explanation_clarity TEXT CHECK (explanation_clarity IN ('clear', 'mixed', 'confusing')),
  ADD COLUMN IF NOT EXISTS explanation_style TEXT,
  ADD COLUMN IF NOT EXISTS difficulty_accuracy TEXT CHECK (difficulty_accuracy IN ('too_easy', 'just_right', 'too_hard')),
  ADD COLUMN IF NOT EXISTS extra_context JSONB DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_question_feedback_difficulty ON question_feedback(difficulty_accuracy);
CREATE INDEX IF NOT EXISTS idx_question_feedback_clarity ON question_feedback(explanation_clarity);

-- =====================================================
-- SESSION FEEDBACK TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS session_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES practice_sessions(id) ON DELETE CASCADE,
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_session_feedback_unique ON session_feedback(session_id);
CREATE INDEX IF NOT EXISTS idx_session_feedback_rating ON session_feedback(rating);
CREATE INDEX IF NOT EXISTS idx_session_feedback_child ON session_feedback(child_id);

-- =====================================================
-- FEEDBACK TAGS + LINK TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS feedback_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    label TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('session', 'question')),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS session_feedback_tags (
    session_feedback_id UUID NOT NULL REFERENCES session_feedback(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES feedback_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (session_feedback_id, tag_id)
);

INSERT INTO feedback_tags (slug, label, category, description)
VALUES
    ('fun', 'Fun', 'session', 'Session felt enjoyable'),
    ('challenging', 'Challenging', 'session', 'Session pushed the learner'),
    ('learned-something', 'Learned something', 'session', 'Learner gained new insight'),
    ('confusing', 'Confusing', 'session', 'Session felt unclear')
ON CONFLICT (slug) DO UPDATE SET
    label = EXCLUDED.label,
    category = EXCLUDED.category,
    description = EXCLUDED.description;

-- =====================================================
-- NPS RESPONSES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS nps_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    child_id UUID REFERENCES children(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 10),
    follow_up TEXT,
    trigger_reason TEXT CHECK (trigger_reason IN ('two_weeks_active', 'ninety_day_interval', 'manual', 'prompted')),
    responded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nps_responses_parent ON nps_responses(parent_id);
CREATE INDEX IF NOT EXISTS idx_nps_responses_score ON nps_responses(score);
CREATE INDEX IF NOT EXISTS idx_nps_responses_trigger ON nps_responses(trigger_reason);

-- =====================================================
-- SUPPORTING FUNCTIONS
-- =====================================================
DROP FUNCTION IF EXISTS get_question_feedback_summary(UUID);
CREATE OR REPLACE FUNCTION get_question_feedback_summary(question_uuid UUID)
RETURNS TABLE (
    total_feedback BIGINT,
    helpful_count BIGINT,
    not_helpful_count BIGINT,
    helpful_percentage NUMERIC,
    clarity_breakdown JSONB,
    difficulty_breakdown JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT,
        COUNT(*) FILTER (WHERE is_helpful)::BIGINT,
        COUNT(*) FILTER (WHERE NOT is_helpful)::BIGINT,
        CASE WHEN COUNT(*) > 0 THEN ROUND((COUNT(*) FILTER (WHERE is_helpful)::NUMERIC / COUNT(*)::NUMERIC) * 100, 1) ELSE 0 END,
        jsonb_object_agg(clarity.explanation_clarity, clarity.count_val) FILTER (WHERE clarity.explanation_clarity IS NOT NULL),
        jsonb_object_agg(diff.difficulty_accuracy, diff.count_val) FILTER (WHERE diff.difficulty_accuracy IS NOT NULL)
    FROM question_feedback qf
    LEFT JOIN LATERAL (
        SELECT explanation_clarity, COUNT(*) AS count_val
        FROM question_feedback
        WHERE question_id = question_uuid AND explanation_clarity IS NOT NULL
        GROUP BY explanation_clarity
    ) clarity ON TRUE
    LEFT JOIN LATERAL (
        SELECT difficulty_accuracy, COUNT(*) AS count_val
        FROM question_feedback
        WHERE question_id = question_uuid AND difficulty_accuracy IS NOT NULL
        GROUP BY difficulty_accuracy
    ) diff ON TRUE
    WHERE question_id = question_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP FUNCTION IF EXISTS calculate_nps(TIMESTAMPTZ, TIMESTAMPTZ);
CREATE OR REPLACE FUNCTION calculate_nps(
    start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
    end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
    total_responses BIGINT,
    promoters BIGINT,
    passives BIGINT,
    detractors BIGINT,
    nps_score NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT,
        COUNT(*) FILTER (WHERE score >= 9)::BIGINT,
        COUNT(*) FILTER (WHERE score BETWEEN 7 AND 8)::BIGINT,
        COUNT(*) FILTER (WHERE score <= 6)::BIGINT,
        CASE WHEN COUNT(*) > 0 THEN ROUND(((COUNT(*) FILTER (WHERE score >= 9)::NUMERIC - COUNT(*) FILTER (WHERE score <= 6)::NUMERIC) / COUNT(*)::NUMERIC) * 100, 1) ELSE 0 END
    FROM nps_responses
    WHERE responded_at BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================
ALTER TABLE IF EXISTS question_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS session_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS nps_responses ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'question_feedback' AND policyname = 'question_feedback_insert'
  ) THEN
    CREATE POLICY question_feedback_insert ON question_feedback FOR INSERT TO authenticated
    WITH CHECK (
      parent_id = auth.uid() AND EXISTS (
        SELECT 1 FROM children WHERE id = question_feedback.child_id AND parent_id = auth.uid()
      )
    );
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'question_feedback' AND policyname = 'question_feedback_select'
  ) THEN
    CREATE POLICY question_feedback_select ON question_feedback FOR SELECT TO authenticated
    USING (parent_id = auth.uid());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'session_feedback' AND policyname = 'session_feedback_insert'
  ) THEN
    CREATE POLICY session_feedback_insert ON session_feedback FOR INSERT TO authenticated
    WITH CHECK (
      parent_id = auth.uid() AND EXISTS (
        SELECT 1 FROM children WHERE id = session_feedback.child_id AND parent_id = auth.uid()
      )
    );
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'session_feedback' AND policyname = 'session_feedback_select'
  ) THEN
    CREATE POLICY session_feedback_select ON session_feedback FOR SELECT TO authenticated
    USING (parent_id = auth.uid());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'nps_responses' AND policyname = 'nps_responses_insert'
  ) THEN
    CREATE POLICY nps_responses_insert ON nps_responses FOR INSERT TO authenticated
    WITH CHECK (parent_id = auth.uid());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'nps_responses' AND policyname = 'nps_responses_select'
  ) THEN
    CREATE POLICY nps_responses_select ON nps_responses FOR SELECT TO authenticated
    USING (parent_id = auth.uid());
  END IF;
END $$;

-- Session feedback tags are implicit through session_feedback (same parent)
ALTER TABLE session_feedback_tags ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'session_feedback_tags' AND policyname = 'session_feedback_tags_insert'
  ) THEN
    CREATE POLICY session_feedback_tags_insert ON session_feedback_tags FOR INSERT TO authenticated
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM session_feedback sf
        WHERE sf.id = session_feedback_tags.session_feedback_id AND sf.parent_id = auth.uid()
      )
    );
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'session_feedback_tags' AND policyname = 'session_feedback_tags_select'
  ) THEN
    CREATE POLICY session_feedback_tags_select ON session_feedback_tags FOR SELECT TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM session_feedback sf
        WHERE sf.id = session_feedback_tags.session_feedback_id AND sf.parent_id = auth.uid()
      )
    );
  END IF;
END $$;

COMMENT ON TABLE session_feedback IS 'End-of-session experience feedback and ratings';
COMMENT ON TABLE feedback_tags IS 'Reusable tags for feedback prompts (Fun, Challenging, etc.)';
COMMENT ON TABLE session_feedback_tags IS 'Join table linking session feedback to selected tags';
COMMENT ON TABLE nps_responses IS 'Net Promoter Score responses with follow-up text';
