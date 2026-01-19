-- Ember Ascent - Initial Database Schema
-- Version: 1.0.0
-- Description: Core tables for UK 11+ exam preparation platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- TRIGGER FUNCTION: Update updated_at timestamp
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =============================================================================
-- TABLE: profiles
-- Purpose: Extended user profiles (links to auth.users)
-- Access: Parents/account holders only
-- =============================================================================

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'ascent', 'summit')),
    subscription_status TEXT NOT NULL DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'past_due', 'trialing')),
    stripe_customer_id TEXT UNIQUE,
    stripe_subscription_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE profiles IS 'Parent/guardian profiles - extends Supabase auth.users';
COMMENT ON COLUMN profiles.subscription_tier IS 'free: basic access | ascent: analytics dashboard | summit: AI tutor (future)';
COMMENT ON COLUMN profiles.subscription_status IS 'Stripe subscription status';

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_profiles_subscription ON profiles(subscription_tier, subscription_status);

-- =============================================================================
-- TABLE: children
-- Purpose: Child profiles (learners) - linked to parent accounts
-- Access: Via parent's profile
-- =============================================================================

CREATE TABLE children (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    year_group INTEGER CHECK (year_group IN (4, 5, 6)),
    target_school TEXT,
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_name CHECK (LENGTH(TRIM(name)) >= 2)
);

COMMENT ON TABLE children IS 'Child/learner profiles - no direct login, accessed via parent';
COMMENT ON COLUMN children.year_group IS 'UK school year: 4 (age 8-9), 5 (age 9-10), 6 (age 10-11)';
COMMENT ON COLUMN children.target_school IS 'Optional: target grammar school name';
COMMENT ON COLUMN children.is_active IS 'Soft delete flag - inactive children hidden from UI';

CREATE TRIGGER update_children_updated_at
    BEFORE UPDATE ON children
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_children_parent ON children(parent_id) WHERE is_active = true;
CREATE INDEX idx_children_year_group ON children(year_group);

-- =============================================================================
-- TABLE: questions
-- Purpose: Question bank - AI-generated and expert-reviewed
-- Access: Read-only for users, write via admin/content pipeline
-- =============================================================================

CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Classification
    subject TEXT NOT NULL CHECK (subject IN ('verbal_reasoning', 'english', 'mathematics')),
    topic TEXT NOT NULL,
    subtopic TEXT,
    question_type TEXT, -- e.g., 'synonym', 'antonym', 'algebra', 'comprehension'
    
    -- Content
    question_text TEXT NOT NULL,
    options JSONB NOT NULL, -- [{id: 'a', text: '...'}, {id: 'b', text: '...'}]
    correct_answer TEXT NOT NULL, -- option id
    explanations JSONB NOT NULL, -- {step_by_step: '...', visual: '...', worked_example: '...'}
    
    -- Metadata
    difficulty TEXT NOT NULL CHECK (difficulty IN ('foundation', 'standard', 'challenge')),
    year_group INTEGER CHECK (year_group IN (4, 5, 6)),
    curriculum_reference TEXT, -- UK National Curriculum objective code
    exam_board TEXT NOT NULL DEFAULT 'generic' CHECK (exam_board IN ('gl', 'cem', 'iseb', 'generic')),
    
    -- Quality metrics
    ember_score INTEGER NOT NULL DEFAULT 0 CHECK (ember_score >= 0 AND ember_score <= 100),
    ember_score_breakdown JSONB, -- {curriculum: 25, exam_pattern: 25, expert: 25, community: 15, technical: 10}
    is_published BOOLEAN NOT NULL DEFAULT false,
    
    -- Audit
    created_by UUID REFERENCES profiles(id), -- content creator/admin
    reviewed_by UUID REFERENCES profiles(id), -- expert reviewer
    reviewed_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Validation
    CONSTRAINT valid_ember_score CHECK (is_published = false OR ember_score >= 60),
    CONSTRAINT valid_options CHECK (jsonb_array_length(options) = 5)
    -- Note: correct_answer validation must be done at application level
    -- (PostgreSQL doesn't allow subqueries in CHECK constraints)
);

COMMENT ON TABLE questions IS 'Question bank - only questions with ember_score >= 60 are served to users';
COMMENT ON COLUMN questions.ember_score IS '0-100 quality score: 60+ required for publishing';
COMMENT ON COLUMN questions.explanations IS 'Three explanation styles for different learning preferences';
COMMENT ON COLUMN questions.exam_board IS 'GL Assessment is primary (60% market share in UK)';

CREATE TRIGGER update_questions_updated_at
    BEFORE UPDATE ON questions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Performance indexes
CREATE INDEX idx_questions_published ON questions(subject, difficulty, year_group) 
    WHERE is_published = true AND ember_score >= 60;
CREATE INDEX idx_questions_topic ON questions(topic, subtopic) WHERE is_published = true;
CREATE INDEX idx_questions_ember_score ON questions(ember_score) WHERE is_published = true;
CREATE INDEX idx_questions_review ON questions(is_published, reviewed_at);

-- =============================================================================
-- TABLE: practice_sessions
-- Purpose: Track practice sessions (grouped question attempts)
-- Access: Via child's parent account
-- =============================================================================

CREATE TABLE practice_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    
    -- Session configuration
    session_type TEXT NOT NULL CHECK (session_type IN ('quick', 'focus', 'mock')),
    subject TEXT CHECK (subject IN ('verbal_reasoning', 'english', 'mathematics')),
    topic TEXT,
    
    -- Timing
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    -- Summary stats (computed from attempts)
    total_questions INTEGER NOT NULL DEFAULT 0,
    correct_answers INTEGER NOT NULL DEFAULT 0,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE practice_sessions IS 'Practice sessions group question attempts';
COMMENT ON COLUMN practice_sessions.session_type IS 'quick: 10 questions | focus: topic-specific | mock: timed exam simulation';
COMMENT ON COLUMN practice_sessions.completed_at IS 'NULL = in progress';

CREATE INDEX idx_sessions_child ON practice_sessions(child_id, created_at DESC);
CREATE INDEX idx_sessions_active ON practice_sessions(child_id) WHERE completed_at IS NULL;
CREATE INDEX idx_sessions_subject ON practice_sessions(subject, session_type);

-- =============================================================================
-- TABLE: question_attempts
-- Purpose: Individual question answers - tracks learning progress
-- Access: Via child's parent account
-- =============================================================================

CREATE TABLE question_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES practice_sessions(id) ON DELETE CASCADE,
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    
    -- Response
    selected_answer TEXT NOT NULL, -- option id
    is_correct BOOLEAN NOT NULL,
    time_taken_seconds INTEGER NOT NULL CHECK (time_taken_seconds >= 0),
    
    -- Learning insights
    explanation_viewed TEXT CHECK (explanation_viewed IN ('step_by_step', 'visual', 'worked_example')),
    flagged_for_review BOOLEAN NOT NULL DEFAULT false,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE question_attempts IS 'Individual question answers - used for progress tracking and adaptive learning';
COMMENT ON COLUMN question_attempts.explanation_viewed IS 'Which explanation style the child viewed (if any)';
COMMENT ON COLUMN question_attempts.flagged_for_review IS 'Child marked for later review';

-- Performance indexes (high query volume)
CREATE INDEX idx_attempts_child ON question_attempts(child_id, created_at DESC);
CREATE INDEX idx_attempts_session ON question_attempts(session_id);
CREATE INDEX idx_attempts_question ON question_attempts(question_id);
CREATE INDEX idx_attempts_analytics ON question_attempts(child_id, question_id, is_correct);

-- =============================================================================
-- TABLE: error_reports
-- Purpose: Crowdsourced question quality feedback
-- Access: Authenticated users can report, admins review
-- =============================================================================

CREATE TABLE error_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    reported_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Report details
    report_type TEXT NOT NULL CHECK (report_type IN ('incorrect_answer', 'unclear', 'typo', 'inappropriate', 'other')),
    description TEXT NOT NULL,
    
    -- Admin workflow
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'fixed', 'dismissed')),
    reviewed_by UUID REFERENCES profiles(id),
    admin_notes TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT valid_description CHECK (LENGTH(TRIM(description)) >= 10)
);

COMMENT ON TABLE error_reports IS 'Community feedback on question quality - feeds into ember_score calculation';
COMMENT ON COLUMN error_reports.status IS 'pending: new | reviewed: admin seen | fixed: question updated | dismissed: not an issue';

CREATE TRIGGER update_error_reports_updated_at
    BEFORE UPDATE ON error_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_error_reports_question ON error_reports(question_id);
CREATE INDEX idx_error_reports_status ON error_reports(status, created_at);
CREATE INDEX idx_error_reports_pending ON error_reports(question_id) WHERE status = 'pending';

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_reports ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only see/edit their own profile
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Children: Parents can only access their own children
CREATE POLICY "Parents can view own children"
    ON children FOR SELECT
    USING (parent_id = auth.uid());

CREATE POLICY "Parents can insert own children"
    ON children FOR INSERT
    WITH CHECK (parent_id = auth.uid());

CREATE POLICY "Parents can update own children"
    ON children FOR UPDATE
    USING (parent_id = auth.uid());

CREATE POLICY "Parents can delete own children"
    ON children FOR DELETE
    USING (parent_id = auth.uid());

-- Questions: Published questions are readable by all authenticated users
CREATE POLICY "Published questions are viewable by all"
    ON questions FOR SELECT
    USING (auth.role() = 'authenticated' AND is_published = true AND ember_score >= 60);

-- Practice Sessions: Parents can access their children's sessions
CREATE POLICY "Parents can view children's sessions"
    ON practice_sessions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM children
            WHERE children.id = practice_sessions.child_id
            AND children.parent_id = auth.uid()
        )
    );

CREATE POLICY "Parents can create children's sessions"
    ON practice_sessions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM children
            WHERE children.id = practice_sessions.child_id
            AND children.parent_id = auth.uid()
        )
    );

CREATE POLICY "Parents can update children's sessions"
    ON practice_sessions FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM children
            WHERE children.id = practice_sessions.child_id
            AND children.parent_id = auth.uid()
        )
    );

-- Question Attempts: Parents can access their children's attempts
CREATE POLICY "Parents can view children's attempts"
    ON question_attempts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM children
            WHERE children.id = question_attempts.child_id
            AND children.parent_id = auth.uid()
        )
    );

CREATE POLICY "Parents can create children's attempts"
    ON question_attempts FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM children
            WHERE children.id = question_attempts.child_id
            AND children.parent_id = auth.uid()
        )
    );

-- Error Reports: Users can create and view their own reports
CREATE POLICY "Users can view own error reports"
    ON error_reports FOR SELECT
    USING (reported_by = auth.uid());

CREATE POLICY "Authenticated users can create error reports"
    ON error_reports FOR INSERT
    WITH CHECK (auth.uid() = reported_by);

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on auth.users insert
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- VIEWS (for common queries)
-- =============================================================================

-- View: Child progress summary
CREATE OR REPLACE VIEW child_progress_summary AS
SELECT 
    c.id AS child_id,
    c.name AS child_name,
    c.parent_id,
    COUNT(DISTINCT ps.id) AS total_sessions,
    COUNT(qa.id) AS total_questions_answered,
    COUNT(qa.id) FILTER (WHERE qa.is_correct) AS correct_answers,
    ROUND(
        100.0 * COUNT(qa.id) FILTER (WHERE qa.is_correct) / NULLIF(COUNT(qa.id), 0),
        1
    ) AS accuracy_percentage,
    MAX(ps.created_at) AS last_practice_date
FROM children c
LEFT JOIN practice_sessions ps ON ps.child_id = c.id
LEFT JOIN question_attempts qa ON qa.child_id = c.id
WHERE c.is_active = true
GROUP BY c.id, c.name, c.parent_id;

COMMENT ON VIEW child_progress_summary IS 'High-level progress metrics per child';

-- =============================================================================
-- INITIAL DATA
-- =============================================================================

-- Insert sample difficulty levels metadata (for reference)
-- This could be moved to a separate table if needed
COMMENT ON COLUMN questions.difficulty IS 'foundation: easier questions for building confidence | standard: aligned with typical exam difficulty | challenge: harder questions for stretch and extension';

-- End of migration
