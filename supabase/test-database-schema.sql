-- ============================================================================
-- EMBER ASCENT - TEST DATABASE SCHEMA
-- ============================================================================
-- This file consolidates ALL migrations for easy test database setup
-- Run this entire file once in your test Supabase project SQL Editor
-- 
-- Instructions:
-- 1. Create new Supabase project for testing
-- 2. Go to SQL Editor in test project
-- 3. Copy and paste this ENTIRE file
-- 4. Click "Run" (or Ctrl+Enter)
-- 5. Wait for completion (~30 seconds)
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Profiles (Parent/Guardian accounts)
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

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE INDEX idx_profiles_subscription ON profiles(subscription_tier, subscription_status);

-- Children (Learner profiles)
CREATE TABLE children (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL CHECK (LENGTH(TRIM(name)) >= 2),
    year_group INTEGER NOT NULL CHECK (year_group IN (3, 4, 5, 6)),
    target_school TEXT,
    avatar TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_children_updated_at BEFORE UPDATE ON children
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE INDEX idx_children_parent ON children(parent_id) WHERE is_active = true;

-- Questions (Question bank)
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_id TEXT UNIQUE,
    subject TEXT NOT NULL CHECK (subject IN ('mathematics', 'english', 'verbal_reasoning', 'non_verbal_reasoning')),
    topic TEXT NOT NULL,
    subtopic TEXT,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('foundation', 'standard', 'challenge')),
    year_group INTEGER NOT NULL CHECK (year_group IN (3, 4, 5, 6)),
    question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    option_e TEXT,
    correct_answer TEXT NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D', 'E')),
    explanation TEXT NOT NULL,
    ember_score INTEGER CHECK (ember_score >= 60 AND ember_score <= 100),
    curriculum_refs TEXT[],
    tags TEXT[],
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE INDEX idx_questions_subject ON questions(subject) WHERE is_active = true;
CREATE INDEX idx_questions_difficulty ON questions(difficulty);
CREATE INDEX idx_questions_year_group ON questions(year_group);
CREATE INDEX idx_questions_topic ON questions(topic);
CREATE INDEX idx_questions_ember_score ON questions(ember_score);

-- Practice Sessions
CREATE TABLE practice_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    session_type TEXT NOT NULL CHECK (session_type IN ('quick_byte', 'focus', 'mock', 'adaptive', 'review')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
    subject TEXT CHECK (subject IN ('mathematics', 'english', 'verbal_reasoning', 'non_verbal_reasoning')),
    topic TEXT,
    difficulty TEXT CHECK (difficulty IN ('foundation', 'standard', 'challenge')),
    target_count INTEGER,
    questions_answered INTEGER NOT NULL DEFAULT 0,
    correct_count INTEGER NOT NULL DEFAULT 0,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    time_spent_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_practice_sessions_updated_at BEFORE UPDATE ON practice_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE INDEX idx_sessions_child ON practice_sessions(child_id);
CREATE INDEX idx_sessions_status ON practice_sessions(status);
CREATE INDEX idx_sessions_type ON practice_sessions(session_type);

-- Session Responses (Question attempts)
CREATE TABLE session_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES practice_sessions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    user_answer TEXT NOT NULL CHECK (user_answer IN ('A', 'B', 'C', 'D', 'E')),
    is_correct BOOLEAN NOT NULL,
    time_taken_seconds INTEGER,
    was_flagged BOOLEAN DEFAULT false,
    attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_responses_session ON session_responses(session_id);
CREATE INDEX idx_responses_child ON session_responses(child_id);
CREATE INDEX idx_responses_question ON session_responses(question_id);
CREATE INDEX idx_responses_correct ON session_responses(is_correct);

-- ============================================================================
-- EMBER SCORE TRACKING
-- ============================================================================

CREATE TABLE child_ember_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    subject TEXT NOT NULL CHECK (subject IN ('mathematics', 'english', 'verbal_reasoning', 'non_verbal_reasoning')),
    current_score INTEGER NOT NULL CHECK (current_score >= 60 AND current_score <= 100),
    previous_score INTEGER CHECK (previous_score >= 60 AND previous_score <= 100),
    total_questions_answered INTEGER NOT NULL DEFAULT 0,
    correct_answers INTEGER NOT NULL DEFAULT 0,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(child_id, subject)
);

CREATE INDEX idx_ember_scores_child ON child_ember_scores(child_id);

-- ============================================================================
-- ADAPTIVE LEARNING TRACKING
-- ============================================================================

CREATE TABLE adaptive_tracker (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    subject TEXT NOT NULL CHECK (subject IN ('mathematics', 'english', 'verbal_reasoning', 'non_verbal_reasoning')),
    topic TEXT NOT NULL,
    mastery_level NUMERIC(3,2) NOT NULL DEFAULT 0.00 CHECK (mastery_level >= 0 AND mastery_level <= 1),
    exposure_count INTEGER NOT NULL DEFAULT 0,
    correct_count INTEGER NOT NULL DEFAULT 0,
    recent_performance NUMERIC(3,2),
    confidence_level TEXT CHECK (confidence_level IN ('low', 'medium', 'high')),
    needs_reinforcement BOOLEAN NOT NULL DEFAULT false,
    last_practiced TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(child_id, subject, topic)
);

CREATE INDEX idx_adaptive_child ON adaptive_tracker(child_id);
CREATE INDEX idx_adaptive_needs_reinforcement ON adaptive_tracker(needs_reinforcement) WHERE needs_reinforcement = true;

-- ============================================================================
-- CURRICULUM TRACKING
-- ============================================================================

CREATE TABLE curriculum_objectives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    subject TEXT NOT NULL CHECK (subject IN ('mathematics', 'english', 'verbal_reasoning', 'non_verbal_reasoning')),
    year_group INTEGER NOT NULL CHECK (year_group IN (3, 4, 5, 6)),
    strand TEXT NOT NULL,
    description TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('foundation', 'standard', 'challenge')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_curriculum_subject_year ON curriculum_objectives(subject, year_group) WHERE is_active = true;

CREATE TABLE child_objective_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    objective_id UUID NOT NULL REFERENCES curriculum_objectives(id),
    mastery_level NUMERIC(3,2) NOT NULL DEFAULT 0.00 CHECK (mastery_level >= 0 AND mastery_level <= 1),
    questions_attempted INTEGER NOT NULL DEFAULT 0,
    questions_correct INTEGER NOT NULL DEFAULT 0,
    last_practiced TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(child_id, objective_id)
);

CREATE INDEX idx_objective_progress_child ON child_objective_progress(child_id);

-- ============================================================================
-- GAMIFICATION
-- ============================================================================

-- Achievements
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('practice', 'mastery', 'streak', 'special')),
    rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    icon TEXT NOT NULL,
    criteria JSONB NOT NULL,
    points INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE child_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES achievements(id),
    unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(child_id, achievement_id)
);

CREATE INDEX idx_child_achievements ON child_achievements(child_id);

-- Streaks
CREATE TABLE child_streaks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    last_practice_date DATE,
    streak_freeze_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(child_id)
);

CREATE INDEX idx_streaks_child ON child_streaks(child_id);

-- ============================================================================
-- FEEDBACK SYSTEM
-- ============================================================================

CREATE TABLE feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    feedback_type TEXT NOT NULL CHECK (feedback_type IN ('question', 'session', 'feature', 'bug', 'nps')),
    question_id UUID REFERENCES questions(id),
    session_id UUID REFERENCES practice_sessions(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    nps_score INTEGER CHECK (nps_score >= 0 AND nps_score <= 10),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_feedback_child ON feedback(child_id);
CREATE INDEX idx_feedback_type ON feedback(feedback_type);
CREATE INDEX idx_feedback_status ON feedback(status);

-- ============================================================================
-- MOCK TEST SYSTEM
-- ============================================================================

CREATE TABLE mock_test_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    exam_type TEXT NOT NULL CHECK (exam_type IN ('11plus', 'CEM', 'GL')),
    duration_minutes INTEGER NOT NULL,
    sections JSONB NOT NULL,
    total_questions INTEGER NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- ADMIN & REVIEWER SYSTEM
-- ============================================================================

CREATE TABLE admin_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'super_admin', 'content_manager', 'reviewer')),
    capabilities JSONB NOT NULL DEFAULT '[]',
    assigned_by UUID REFERENCES auth.users(id),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, role)
);

CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES auth.users(id),
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    changes JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_log_admin ON audit_log(admin_id);
CREATE INDEX idx_audit_log_created ON audit_log(created_at DESC);

CREATE TABLE impersonation_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES auth.users(id),
    target_user_id UUID NOT NULL REFERENCES auth.users(id),
    reason TEXT NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    ip_address INET
);

CREATE TABLE reviewer_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    expertise_subjects TEXT[] NOT NULL,
    total_reviews INTEGER NOT NULL DEFAULT 0,
    approved_reviews INTEGER NOT NULL DEFAULT 0,
    rejection_count INTEGER NOT NULL DEFAULT 0,
    earnings_pence INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE review_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES questions(id),
    reviewer_id UUID REFERENCES reviewer_profiles(id),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'completed', 'approved', 'rejected')),
    review_notes TEXT,
    assigned_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- STRIPE SUBSCRIPTIONS
-- ============================================================================

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    stripe_subscription_id TEXT UNIQUE NOT NULL,
    stripe_customer_id TEXT NOT NULL,
    stripe_price_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'incomplete', 'past_due', 'trialing')),
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
    canceled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_ember_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE adaptive_tracker ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_objective_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_test_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only access their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Children: Parents can only access their own children
CREATE POLICY "Parents can view own children" ON children FOR SELECT 
    USING (parent_id = auth.uid());
CREATE POLICY "Parents can insert own children" ON children FOR INSERT 
    WITH CHECK (parent_id = auth.uid());
CREATE POLICY "Parents can update own children" ON children FOR UPDATE 
    USING (parent_id = auth.uid());
CREATE POLICY "Parents can delete own children" ON children FOR DELETE 
    USING (parent_id = auth.uid());

-- Questions: Read-only for authenticated users
CREATE POLICY "Authenticated users can view active questions" ON questions FOR SELECT 
    USING (auth.role() = 'authenticated' AND is_active = true);

-- Practice Sessions: Users can only access sessions for their children
CREATE POLICY "Parents can view own children sessions" ON practice_sessions FOR SELECT 
    USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));
CREATE POLICY "Parents can create sessions for own children" ON practice_sessions FOR INSERT 
    WITH CHECK (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));
CREATE POLICY "Parents can update own children sessions" ON practice_sessions FOR UPDATE 
    USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));

-- Session Responses: Users can only access responses for their children
CREATE POLICY "Parents can view own children responses" ON session_responses FOR SELECT 
    USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));
CREATE POLICY "Parents can create responses for own children" ON session_responses FOR INSERT 
    WITH CHECK (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));

-- Ember Scores: Users can only access scores for their children
CREATE POLICY "Parents can view own children scores" ON child_ember_scores FOR SELECT 
    USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));

-- Adaptive Tracker: Users can only access data for their children
CREATE POLICY "Parents can view own children adaptive data" ON adaptive_tracker FOR SELECT 
    USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));

-- Objectives Progress: Users can only access data for their children
CREATE POLICY "Parents can view own children progress" ON child_objective_progress FOR SELECT 
    USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));

-- Curriculum: Read-only for authenticated users
CREATE POLICY "Authenticated users can view objectives" ON curriculum_objectives FOR SELECT 
    USING (auth.role() = 'authenticated' AND is_active = true);

-- Achievements: Read-only for authenticated users
CREATE POLICY "Authenticated users can view achievements" ON achievements FOR SELECT 
    USING (auth.role() = 'authenticated' AND is_active = true);

-- Child Achievements: Users can only access achievements for their children
CREATE POLICY "Parents can view own children achievements" ON child_achievements FOR SELECT 
    USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));

-- Streaks: Users can only access streaks for their children
CREATE POLICY "Parents can view own children streaks" ON child_streaks FOR SELECT 
    USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));

-- Feedback: Users can only access feedback from their children
CREATE POLICY "Parents can view own children feedback" ON feedback FOR SELECT 
    USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));
CREATE POLICY "Parents can create feedback for own children" ON feedback FOR INSERT 
    WITH CHECK (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));

-- Mock Test Templates: Read-only for authenticated users
CREATE POLICY "Authenticated users can view mock templates" ON mock_test_templates FOR SELECT 
    USING (auth.role() = 'authenticated' AND is_active = true);

-- Subscriptions: Users can only access their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR SELECT 
    USING (user_id = auth.uid());

-- ============================================================================
-- ANALYTICS VIEWS
-- ============================================================================

CREATE OR REPLACE VIEW child_performance_summary AS
SELECT 
    c.id AS child_id,
    c.name,
    c.year_group,
    COUNT(DISTINCT ps.id) AS total_sessions,
    COUNT(sr.id) AS total_questions,
    SUM(CASE WHEN sr.is_correct THEN 1 ELSE 0 END) AS correct_answers,
    ROUND(AVG(CASE WHEN sr.is_correct THEN 1.0 ELSE 0.0 END) * 100, 1) AS accuracy_percent,
    AVG(sr.time_taken_seconds) AS avg_time_per_question,
    MAX(ps.completed_at) AS last_practice_date
FROM children c
LEFT JOIN practice_sessions ps ON c.id = ps.child_id AND ps.status = 'completed'
LEFT JOIN session_responses sr ON ps.id = sr.session_id
GROUP BY c.id, c.name, c.year_group;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Update Ember Score after each response
CREATE OR REPLACE FUNCTION update_ember_score_after_response()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO child_ember_scores (child_id, subject, current_score, total_questions_answered, correct_answers)
    SELECT 
        NEW.child_id,
        q.subject,
        GREATEST(60, LEAST(100, 75 + (COUNT(*) FILTER (WHERE sr.is_correct) - COUNT(*) FILTER (WHERE NOT sr.is_correct)) * 2)),
        COUNT(*),
        COUNT(*) FILTER (WHERE sr.is_correct)
    FROM session_responses sr
    JOIN questions q ON sr.question_id = q.id
    WHERE sr.child_id = NEW.child_id AND q.subject = (SELECT subject FROM questions WHERE id = NEW.question_id)
    GROUP BY NEW.child_id, q.subject
    ON CONFLICT (child_id, subject) 
    DO UPDATE SET
        previous_score = child_ember_scores.current_score,
        current_score = EXCLUDED.current_score,
        total_questions_answered = EXCLUDED.total_questions_answered,
        correct_answers = EXCLUDED.correct_answers,
        last_updated = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ember_score_trigger
    AFTER INSERT ON session_responses
    FOR EACH ROW
    EXECUTE FUNCTION update_ember_score_after_response();

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Ember Ascent test database schema created successfully!';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Run seed data SQL (see TEST_DATABASE_SETUP.md Step 5)';
    RAISE NOTICE '2. Create auth users for test accounts';
    RAISE NOTICE '3. Import sample questions';
    RAISE NOTICE '4. Configure .env.test.local with credentials';
    RAISE NOTICE '5. Run your first test: npm run test:auth';
END $$;
