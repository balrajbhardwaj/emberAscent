-- Migration 007: Feedback Collection System
-- Purpose: Collect user feedback for continuous quality improvement
-- Features: Question feedback, session feedback, NPS surveys

-- =====================================================
-- QUESTION FEEDBACK TABLE
-- =====================================================
-- Captures immediate feedback on question quality (thumbs up/down)
CREATE TABLE IF NOT EXISTS question_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Feedback type
    is_helpful BOOLEAN NOT NULL, -- true = helpful, false = not helpful
    
    -- Optional context
    feedback_text TEXT, -- Optional written feedback
    issue_type TEXT CHECK (issue_type IN ('unclear', 'incorrect', 'too_easy', 'too_hard', 'other')),
    
    -- Metadata
    session_id UUID REFERENCES practice_sessions(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for efficient lookups
CREATE INDEX idx_question_feedback_question ON question_feedback(question_id);
CREATE INDEX idx_question_feedback_child ON question_feedback(child_id);
CREATE INDEX idx_question_feedback_created ON question_feedback(created_at DESC);

-- Prevent duplicate feedback from same child on same question
CREATE UNIQUE INDEX idx_question_feedback_unique ON question_feedback(question_id, child_id);

-- =====================================================
-- SESSION FEEDBACK TABLE
-- =====================================================
-- Post-session feedback about overall experience
CREATE TABLE IF NOT EXISTS session_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES practice_sessions(id) ON DELETE CASCADE,
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Experience rating (1-5 stars)
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    
    -- What went well / what could be better
    positive_feedback TEXT,
    improvement_suggestions TEXT,
    
    -- Specific aspects
    difficulty_appropriate BOOLEAN, -- Was difficulty level right?
    explanations_helpful BOOLEAN, -- Were explanations clear?
    would_recommend BOOLEAN, -- Would you recommend to a friend?
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_session_feedback_session ON session_feedback(session_id);
CREATE INDEX idx_session_feedback_child ON session_feedback(child_id);
CREATE INDEX idx_session_feedback_rating ON session_feedback(rating);

-- One feedback per session
CREATE UNIQUE INDEX idx_session_feedback_unique ON session_feedback(session_id);

-- =====================================================
-- NPS SURVEY TABLE
-- =====================================================
-- Net Promoter Score surveys for overall satisfaction
CREATE TABLE IF NOT EXISTS nps_surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    child_id UUID REFERENCES children(id) ON DELETE CASCADE, -- Optional: which child
    
    -- NPS Score (0-10)
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 10),
    
    -- Segment based on score
    segment TEXT GENERATED ALWAYS AS (
        CASE 
            WHEN score >= 9 THEN 'promoter'
            WHEN score >= 7 THEN 'passive'
            ELSE 'detractor'
        END
    ) STORED,
    
    -- Optional feedback
    feedback_text TEXT,
    
    -- Context
    trigger_type TEXT NOT NULL CHECK (trigger_type IN ('session_10', 'session_30', 'manual', 'prompted')),
    total_sessions_at_time INTEGER NOT NULL DEFAULT 0,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_nps_parent ON nps_surveys(parent_id);
CREATE INDEX idx_nps_score ON nps_surveys(score);
CREATE INDEX idx_nps_segment ON nps_surveys(segment);
CREATE INDEX idx_nps_created ON nps_surveys(created_at DESC);

-- =====================================================
-- UPDATE QUESTIONS TABLE
-- =====================================================
-- Add helpful count to questions (denormalized for performance)
ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS helpful_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS not_helpful_count INTEGER NOT NULL DEFAULT 0;

-- Create index for sorting by helpfulness
CREATE INDEX IF NOT EXISTS idx_questions_helpful ON questions(helpful_count DESC);

-- =====================================================
-- TRIGGER: Update question helpful counts
-- =====================================================
CREATE OR REPLACE FUNCTION update_question_helpful_counts()
RETURNS TRIGGER AS $$
BEGIN
    -- Update counts for the affected question
    UPDATE questions
    SET 
        helpful_count = (
            SELECT COUNT(*) 
            FROM question_feedback 
            WHERE question_id = COALESCE(NEW.question_id, OLD.question_id) 
            AND is_helpful = true
        ),
        not_helpful_count = (
            SELECT COUNT(*) 
            FROM question_feedback 
            WHERE question_id = COALESCE(NEW.question_id, OLD.question_id) 
            AND is_helpful = false
        ),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.question_id, OLD.question_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_helpful_counts ON question_feedback;
CREATE TRIGGER trigger_update_helpful_counts
    AFTER INSERT OR UPDATE OR DELETE ON question_feedback
    FOR EACH ROW
    EXECUTE FUNCTION update_question_helpful_counts();

-- =====================================================
-- FUNCTION: Get aggregated feedback for question
-- =====================================================
CREATE OR REPLACE FUNCTION get_question_feedback_summary(question_uuid UUID)
RETURNS TABLE (
    total_feedback BIGINT,
    helpful_count BIGINT,
    not_helpful_count BIGINT,
    helpful_percentage NUMERIC,
    common_issues JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_feedback,
        COUNT(*) FILTER (WHERE is_helpful = true)::BIGINT as helpful_count,
        COUNT(*) FILTER (WHERE is_helpful = false)::BIGINT as not_helpful_count,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND((COUNT(*) FILTER (WHERE is_helpful = true)::NUMERIC / COUNT(*)::NUMERIC) * 100, 1)
            ELSE 0
        END as helpful_percentage,
        jsonb_agg(
            DISTINCT jsonb_build_object(
                'issue_type', issue_type,
                'count', (SELECT COUNT(*) FROM question_feedback qf2 
                         WHERE qf2.question_id = question_uuid 
                         AND qf2.issue_type = qf.issue_type)
            )
        ) FILTER (WHERE issue_type IS NOT NULL) as common_issues
    FROM question_feedback qf
    WHERE question_id = question_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION: Calculate NPS score for time period
-- =====================================================
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
        COUNT(*)::BIGINT as total_responses,
        COUNT(*) FILTER (WHERE segment = 'promoter')::BIGINT as promoters,
        COUNT(*) FILTER (WHERE segment = 'passive')::BIGINT as passives,
        COUNT(*) FILTER (WHERE segment = 'detractor')::BIGINT as detractors,
        CASE 
            WHEN COUNT(*) > 0 THEN
                ROUND(
                    ((COUNT(*) FILTER (WHERE segment = 'promoter')::NUMERIC - 
                      COUNT(*) FILTER (WHERE segment = 'detractor')::NUMERIC) / 
                     COUNT(*)::NUMERIC) * 100, 
                    1
                )
            ELSE 0
        END as nps_score
    FROM nps_surveys
    WHERE created_at BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Question Feedback: Users can only see their own
ALTER TABLE question_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create feedback for their children"
    ON question_feedback FOR INSERT
    TO authenticated
    WITH CHECK (
        parent_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM children 
            WHERE id = question_feedback.child_id 
            AND parent_id = auth.uid()
        )
    );

CREATE POLICY "Users can view their own feedback"
    ON question_feedback FOR SELECT
    TO authenticated
    USING (parent_id = auth.uid());

CREATE POLICY "Users can update their own feedback"
    ON question_feedback FOR UPDATE
    TO authenticated
    USING (parent_id = auth.uid())
    WITH CHECK (parent_id = auth.uid());

-- Session Feedback: Similar to question feedback
ALTER TABLE session_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create session feedback for their children"
    ON session_feedback FOR INSERT
    TO authenticated
    WITH CHECK (
        parent_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM children 
            WHERE id = session_feedback.child_id 
            AND parent_id = auth.uid()
        )
    );

CREATE POLICY "Users can view their own session feedback"
    ON session_feedback FOR SELECT
    TO authenticated
    USING (parent_id = auth.uid());

-- NPS Surveys: Users see only their own
ALTER TABLE nps_surveys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create NPS surveys"
    ON nps_surveys FOR INSERT
    TO authenticated
    WITH CHECK (parent_id = auth.uid());

CREATE POLICY "Users can view their own NPS surveys"
    ON nps_surveys FOR SELECT
    TO authenticated
    USING (parent_id = auth.uid());

-- =====================================================
-- SEED DATA / BACKFILL
-- =====================================================
-- Note: Existing questions already have practice_count from previous migrations
-- The helpful_count and not_helpful_count start at 0 (no historical feedback data)

COMMENT ON TABLE question_feedback IS 'Individual question quality feedback (helpful/not helpful)';
COMMENT ON TABLE session_feedback IS 'Post-session experience feedback with ratings and suggestions';
COMMENT ON TABLE nps_surveys IS 'Net Promoter Score surveys for overall platform satisfaction';
