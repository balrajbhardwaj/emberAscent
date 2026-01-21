-- ============================================================================
-- Migration: 009_analytics_views.sql
-- Description: Analytics materialized views for Ascent tier dashboard
-- 
-- Creates optimized views for:
-- - Daily performance stats per child
-- - Topic mastery tracking
-- - Weekly summaries
-- - Readiness score calculation data
--
-- Author: Ember Ascent Team
-- Date: 2026-01-20
-- ============================================================================

-- ============================================================================
-- MATERIALIZED VIEW: child_daily_stats
-- Aggregated daily performance data per child
-- ============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS child_daily_stats AS
SELECT 
    qa.child_id,
    DATE(qa.created_at) AS practice_date,
    q.subject,
    COUNT(*) AS questions_attempted,
    COUNT(*) FILTER (WHERE qa.is_correct) AS correct_answers,
    ROUND(
        COUNT(*) FILTER (WHERE qa.is_correct)::DECIMAL / 
        NULLIF(COUNT(*), 0) * 100, 
        2
    ) AS accuracy_percentage,
    ROUND(AVG(qa.time_taken_seconds), 2) AS avg_time_seconds,
    SUM(qa.time_taken_seconds) / 60.0 AS total_minutes,
    COUNT(DISTINCT qa.session_id) AS sessions_completed,
    COUNT(DISTINCT q.topic) AS topics_covered,
    array_agg(DISTINCT q.topic) AS topics_practiced
FROM question_attempts qa
JOIN questions q ON qa.question_id = q.id
GROUP BY 
    qa.child_id, 
    DATE(qa.created_at), 
    q.subject
ORDER BY 
    qa.child_id, 
    practice_date DESC;

-- Create unique index for refresh concurrency
CREATE UNIQUE INDEX IF NOT EXISTS idx_child_daily_stats_unique 
ON child_daily_stats (child_id, practice_date, subject);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_child_daily_stats_child_date 
ON child_daily_stats (child_id, practice_date);

CREATE INDEX IF NOT EXISTS idx_child_daily_stats_subject 
ON child_daily_stats (subject);


-- ============================================================================
-- MATERIALIZED VIEW: child_topic_mastery
-- Topic-level mastery tracking per child
-- ============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS child_topic_mastery AS
WITH topic_stats AS (
    SELECT 
        qa.child_id,
        q.subject,
        q.topic,
        COUNT(*) AS total_questions,
        COUNT(*) FILTER (WHERE qa.is_correct) AS correct_answers,
        ROUND(
            COUNT(*) FILTER (WHERE qa.is_correct)::DECIMAL / 
            NULLIF(COUNT(*), 0) * 100, 
            2
        ) AS accuracy,
        ROUND(AVG(qa.time_taken_seconds), 2) AS avg_time_seconds,
        MAX(qa.created_at) AS last_practiced_at,
        
        -- Difficulty breakdown
        COUNT(*) FILTER (WHERE q.difficulty = 'foundation') AS foundation_count,
        COUNT(*) FILTER (WHERE q.difficulty = 'standard') AS standard_count,
        COUNT(*) FILTER (WHERE q.difficulty = 'challenge') AS challenge_count,
        
        -- Difficulty performance
        ROUND(
            COUNT(*) FILTER (WHERE q.difficulty = 'foundation' AND qa.is_correct)::DECIMAL / 
            NULLIF(COUNT(*) FILTER (WHERE q.difficulty = 'foundation'), 0) * 100,
            2
        ) AS foundation_accuracy,
        ROUND(
            COUNT(*) FILTER (WHERE q.difficulty = 'standard' AND qa.is_correct)::DECIMAL / 
            NULLIF(COUNT(*) FILTER (WHERE q.difficulty = 'standard'), 0) * 100,
            2
        ) AS standard_accuracy,
        ROUND(
            COUNT(*) FILTER (WHERE q.difficulty = 'challenge' AND qa.is_correct)::DECIMAL / 
            NULLIF(COUNT(*) FILTER (WHERE q.difficulty = 'challenge'), 0) * 100,
            2
        ) AS challenge_accuracy
    FROM question_attempts qa
    JOIN questions q ON qa.question_id = q.id
    GROUP BY qa.child_id, q.subject, q.topic
),
recent_trend AS (
    SELECT 
        qa.child_id,
        q.subject,
        q.topic,
        ROUND(
            COUNT(*) FILTER (WHERE qa.is_correct AND qa.created_at > NOW() - INTERVAL '7 days')::DECIMAL / 
            NULLIF(COUNT(*) FILTER (WHERE qa.created_at > NOW() - INTERVAL '7 days'), 0) * 100,
            2
        ) AS recent_accuracy,
        COUNT(*) FILTER (WHERE qa.created_at > NOW() - INTERVAL '7 days') AS recent_count
    FROM question_attempts qa
    JOIN questions q ON qa.question_id = q.id
    GROUP BY qa.child_id, q.subject, q.topic
)
SELECT 
    ts.child_id,
    ts.subject,
    ts.topic,
    ts.total_questions,
    ts.correct_answers,
    ts.accuracy,
    ts.avg_time_seconds,
    ts.last_practiced_at,
    
    -- Mastery level based on accuracy
    CASE 
        WHEN ts.accuracy >= 85 THEN 'mastered'
        WHEN ts.accuracy >= 70 THEN 'proficient'
        WHEN ts.accuracy >= 55 THEN 'developing'
        ELSE 'needs_practice'
    END AS mastery_level,
    
    -- Trend based on recent vs overall
    CASE 
        WHEN rt.recent_count < 3 THEN 'stable'
        WHEN rt.recent_accuracy > ts.accuracy + 5 THEN 'up'
        WHEN rt.recent_accuracy < ts.accuracy - 5 THEN 'down'
        ELSE 'stable'
    END AS trend,
    
    -- Difficulty distribution
    ts.foundation_count,
    ts.standard_count,
    ts.challenge_count,
    ts.foundation_accuracy,
    ts.standard_accuracy,
    ts.challenge_accuracy,
    
    -- Needs focus flag
    ts.accuracy < 60 AS needs_focus,
    
    -- Recent activity
    rt.recent_accuracy,
    rt.recent_count
FROM topic_stats ts
LEFT JOIN recent_trend rt ON 
    ts.child_id = rt.child_id AND 
    ts.subject = rt.subject AND 
    ts.topic = rt.topic;

-- Create unique index for refresh concurrency
CREATE UNIQUE INDEX IF NOT EXISTS idx_child_topic_mastery_unique 
ON child_topic_mastery (child_id, subject, topic);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_child_topic_mastery_child 
ON child_topic_mastery (child_id);

CREATE INDEX IF NOT EXISTS idx_child_topic_mastery_needs_focus 
ON child_topic_mastery (child_id, needs_focus) WHERE needs_focus = true;


-- ============================================================================
-- MATERIALIZED VIEW: child_weekly_summary
-- Weekly aggregated performance data
-- ============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS child_weekly_summary AS
SELECT 
    qa.child_id,
    DATE_TRUNC('week', qa.created_at)::DATE AS week_start,
    (DATE_TRUNC('week', qa.created_at) + INTERVAL '6 days')::DATE AS week_end,
    
    -- Volume metrics
    COUNT(*) AS total_questions,
    COUNT(DISTINCT DATE(qa.created_at)) AS days_practiced,
    COUNT(DISTINCT qa.session_id) AS sessions_completed,
    
    -- Performance metrics
    COUNT(*) FILTER (WHERE qa.is_correct) AS correct_answers,
    ROUND(
        COUNT(*) FILTER (WHERE qa.is_correct)::DECIMAL / 
        NULLIF(COUNT(*), 0) * 100, 
        2
    ) AS accuracy_percentage,
    
    -- Time metrics
    SUM(qa.time_taken_seconds) / 60.0 AS total_practice_minutes,
    ROUND(AVG(qa.time_taken_seconds), 2) AS avg_time_per_question,
    
    -- Subject breakdown
    COUNT(*) FILTER (WHERE q.subject = 'mathematics') AS maths_questions,
    COUNT(*) FILTER (WHERE q.subject = 'english') AS english_questions,
    COUNT(*) FILTER (WHERE q.subject = 'verbal_reasoning') AS vr_questions,
    
    -- Difficulty breakdown
    COUNT(*) FILTER (WHERE q.difficulty = 'foundation') AS foundation_questions,
    COUNT(*) FILTER (WHERE q.difficulty = 'standard') AS standard_questions,
    COUNT(*) FILTER (WHERE q.difficulty = 'challenge') AS challenge_questions,
    
    -- Topics covered
    COUNT(DISTINCT q.topic) AS unique_topics
FROM question_attempts qa
JOIN questions q ON qa.question_id = q.id
GROUP BY 
    qa.child_id, 
    DATE_TRUNC('week', qa.created_at)
ORDER BY 
    qa.child_id, 
    week_start DESC;

-- Create unique index for refresh concurrency
CREATE UNIQUE INDEX IF NOT EXISTS idx_child_weekly_summary_unique 
ON child_weekly_summary (child_id, week_start);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_child_weekly_summary_child 
ON child_weekly_summary (child_id);


-- ============================================================================
-- MATERIALIZED VIEW: child_subject_summary
-- Subject-level performance summary
-- ============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS child_subject_summary AS
WITH subject_stats AS (
    SELECT 
        qa.child_id,
        q.subject,
        COUNT(*) AS total_questions,
        COUNT(*) FILTER (WHERE qa.is_correct) AS correct_answers,
        ROUND(
            COUNT(*) FILTER (WHERE qa.is_correct)::DECIMAL / 
            NULLIF(COUNT(*), 0) * 100, 
            2
        ) AS accuracy,
        ROUND(AVG(qa.time_taken_seconds), 2) AS avg_time_seconds,
        COUNT(DISTINCT q.topic) AS topics_practiced,
        MAX(qa.created_at) AS last_practiced_at
    FROM question_attempts qa
    JOIN questions q ON qa.question_id = q.id
    GROUP BY qa.child_id, q.subject
),
recent_stats AS (
    SELECT 
        qa.child_id,
        q.subject,
        ROUND(
            COUNT(*) FILTER (WHERE qa.is_correct)::DECIMAL / 
            NULLIF(COUNT(*), 0) * 100, 
            2
        ) AS recent_accuracy
    FROM question_attempts qa
    JOIN questions q ON qa.question_id = q.id
    WHERE qa.created_at > NOW() - INTERVAL '7 days'
    GROUP BY qa.child_id, q.subject
),
total_topics AS (
    SELECT 
        subject,
        COUNT(DISTINCT topic) AS total_available_topics
    FROM questions
    WHERE is_published = true
    GROUP BY subject
)
SELECT 
    ss.child_id,
    ss.subject,
    CASE ss.subject
        WHEN 'mathematics' THEN 'Mathematics'
        WHEN 'english' THEN 'English'
        WHEN 'verbal_reasoning' THEN 'Verbal Reasoning'
        ELSE ss.subject
    END AS subject_label,
    ss.total_questions,
    ss.correct_answers,
    ss.accuracy,
    ss.avg_time_seconds,
    ss.topics_practiced,
    COALESCE(tt.total_available_topics, 0) AS total_available_topics,
    ROUND(
        ss.topics_practiced::DECIMAL / NULLIF(tt.total_available_topics, 0) * 100,
        2
    ) AS topic_coverage_percentage,
    ss.last_practiced_at,
    
    -- Mastery level
    CASE 
        WHEN ss.accuracy >= 85 THEN 'mastered'
        WHEN ss.accuracy >= 70 THEN 'proficient'
        WHEN ss.accuracy >= 55 THEN 'developing'
        ELSE 'needs_practice'
    END AS mastery_level,
    
    -- Trend
    CASE 
        WHEN rs.recent_accuracy IS NULL THEN 'stable'
        WHEN rs.recent_accuracy > ss.accuracy + 5 THEN 'up'
        WHEN rs.recent_accuracy < ss.accuracy - 5 THEN 'down'
        ELSE 'stable'
    END AS trend,
    
    rs.recent_accuracy
FROM subject_stats ss
LEFT JOIN recent_stats rs ON ss.child_id = rs.child_id AND ss.subject = rs.subject
LEFT JOIN total_topics tt ON ss.subject = tt.subject;

-- Create unique index for refresh concurrency
CREATE UNIQUE INDEX IF NOT EXISTS idx_child_subject_summary_unique 
ON child_subject_summary (child_id, subject);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_child_subject_summary_child 
ON child_subject_summary (child_id);


-- ============================================================================
-- FUNCTION: refresh_analytics_views
-- Refreshes all analytics materialized views
-- ============================================================================

CREATE OR REPLACE FUNCTION refresh_analytics_views()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Refresh concurrently to avoid locking reads
    REFRESH MATERIALIZED VIEW CONCURRENTLY child_daily_stats;
    REFRESH MATERIALIZED VIEW CONCURRENTLY child_topic_mastery;
    REFRESH MATERIALIZED VIEW CONCURRENTLY child_weekly_summary;
    REFRESH MATERIALIZED VIEW CONCURRENTLY child_subject_summary;
END;
$$;


-- ============================================================================
-- FUNCTION: get_child_analytics
-- Returns comprehensive analytics for a child
-- ============================================================================

CREATE OR REPLACE FUNCTION get_child_analytics(
    p_child_id UUID,
    p_start_date DATE DEFAULT (CURRENT_DATE - INTERVAL '30 days')::DATE,
    p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'child_id', p_child_id,
        'date_range', json_build_object(
            'start_date', p_start_date,
            'end_date', p_end_date
        ),
        'summary', (
            SELECT json_build_object(
                'total_sessions', COUNT(DISTINCT session_id),
                'total_questions', COUNT(*),
                'correct_answers', COUNT(*) FILTER (WHERE is_correct),
                'accuracy_percentage', ROUND(
                    COUNT(*) FILTER (WHERE is_correct)::DECIMAL / 
                    NULLIF(COUNT(*), 0) * 100, 2
                ),
                'total_minutes', ROUND(SUM(time_taken_seconds) / 60.0, 2)
            )
            FROM question_attempts
            WHERE child_id = p_child_id
            AND created_at BETWEEN p_start_date AND p_end_date + INTERVAL '1 day'
        ),
        'subject_breakdown', (
            SELECT json_agg(row_to_json(s))
            FROM child_subject_summary s
            WHERE child_id = p_child_id
        ),
        'topic_mastery', (
            SELECT json_agg(row_to_json(t))
            FROM child_topic_mastery t
            WHERE child_id = p_child_id
            ORDER BY needs_focus DESC, accuracy ASC
        ),
        'daily_activity', (
            SELECT json_agg(row_to_json(d) ORDER BY practice_date DESC)
            FROM child_daily_stats d
            WHERE child_id = p_child_id
            AND practice_date BETWEEN p_start_date AND p_end_date
        ),
        'weekly_summary', (
            SELECT json_agg(row_to_json(w) ORDER BY week_start DESC)
            FROM child_weekly_summary w
            WHERE child_id = p_child_id
            AND week_start >= DATE_TRUNC('week', p_start_date::TIMESTAMP)
        )
    ) INTO result;
    
    RETURN result;
END;
$$;


-- ============================================================================
-- FUNCTION: get_weakness_heatmap
-- Returns heatmap data for weakness visualization
-- ============================================================================

CREATE OR REPLACE FUNCTION get_weakness_heatmap(p_child_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'subjects', (
            SELECT json_agg(DISTINCT subject ORDER BY subject)
            FROM child_topic_mastery
            WHERE child_id = p_child_id
        ),
        'cells', (
            SELECT json_agg(json_build_object(
                'subject', subject,
                'topic', topic,
                'accuracy', accuracy,
                'total_questions', total_questions,
                'correct_answers', correct_answers,
                'trend', trend,
                'mastery_level', mastery_level,
                'last_practiced_at', last_practiced_at,
                'needs_focus', needs_focus
            ))
            FROM child_topic_mastery
            WHERE child_id = p_child_id
        ),
        'last_updated', NOW()
    ) INTO result;
    
    RETURN result;
END;
$$;


-- ============================================================================
-- FUNCTION: calculate_readiness_score
-- Calculates the 11+ readiness score for a child
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_readiness_score(p_child_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_questions INTEGER;
    overall_accuracy DECIMAL;
    topics_covered INTEGER;
    total_topics INTEGER;
    consistency_days INTEGER;
    challenge_accuracy DECIMAL;
    improvement_rate DECIMAL;
    overall_score INTEGER;
    result JSON;
BEGIN
    -- Get overall stats
    SELECT 
        COUNT(*),
        ROUND(COUNT(*) FILTER (WHERE is_correct)::DECIMAL / NULLIF(COUNT(*), 0) * 100, 2)
    INTO total_questions, overall_accuracy
    FROM question_attempts
    WHERE child_id = p_child_id;
    
    -- Get topic coverage
    SELECT COUNT(DISTINCT topic)
    INTO topics_covered
    FROM question_attempts qa
    JOIN questions q ON qa.question_id = q.id
    WHERE qa.child_id = p_child_id;
    
    -- Get total available topics
    SELECT COUNT(DISTINCT topic)
    INTO total_topics
    FROM questions
    WHERE is_published = true;
    
    -- Get consistency (days practiced in last 30 days)
    SELECT COUNT(DISTINCT DATE(created_at))
    INTO consistency_days
    FROM question_attempts
    WHERE child_id = p_child_id
    AND created_at > NOW() - INTERVAL '30 days';
    
    -- Get challenge difficulty accuracy
    SELECT ROUND(
        COUNT(*) FILTER (WHERE is_correct)::DECIMAL / 
        NULLIF(COUNT(*), 0) * 100, 2
    )
    INTO challenge_accuracy
    FROM question_attempts qa
    JOIN questions q ON qa.question_id = q.id
    WHERE qa.child_id = p_child_id
    AND q.difficulty = 'challenge';
    
    -- Calculate improvement rate (compare last 2 weeks to previous 2 weeks)
    WITH recent AS (
        SELECT ROUND(
            COUNT(*) FILTER (WHERE is_correct)::DECIMAL / 
            NULLIF(COUNT(*), 0) * 100, 2
        ) AS acc
        FROM question_attempts
        WHERE child_id = p_child_id
        AND created_at > NOW() - INTERVAL '14 days'
    ),
    previous AS (
        SELECT ROUND(
            COUNT(*) FILTER (WHERE is_correct)::DECIMAL / 
            NULLIF(COUNT(*), 0) * 100, 2
        ) AS acc
        FROM question_attempts
        WHERE child_id = p_child_id
        AND created_at BETWEEN NOW() - INTERVAL '28 days' AND NOW() - INTERVAL '14 days'
    )
    SELECT COALESCE(recent.acc, 0) - COALESCE(previous.acc, 0)
    INTO improvement_rate
    FROM recent, previous;
    
    -- Calculate overall readiness score (weighted components)
    overall_score := LEAST(100, GREATEST(0,
        -- Accuracy score (40% weight, max 40 points)
        (COALESCE(overall_accuracy, 0) * 0.4) +
        
        -- Coverage score (20% weight, max 20 points)
        (COALESCE(topics_covered::DECIMAL / NULLIF(total_topics, 0) * 100, 0) * 0.2) +
        
        -- Consistency score (15% weight, max 15 points)
        (LEAST(consistency_days::DECIMAL / 20 * 100, 100) * 0.15) +
        
        -- Difficulty score (15% weight, max 15 points)
        (COALESCE(challenge_accuracy, 0) * 0.15) +
        
        -- Improvement score (10% weight, max 10 points - centered around 0)
        (LEAST(GREATEST(COALESCE(improvement_rate, 0) + 50, 0), 100) * 0.10)
    ))::INTEGER;
    
    -- Build result JSON
    SELECT json_build_object(
        'child_id', p_child_id,
        'calculated_at', NOW(),
        'overall_score', overall_score,
        'overall_tier', CASE 
            WHEN overall_score >= 85 THEN 'excellent'
            WHEN overall_score >= 70 THEN 'good'
            WHEN overall_score >= 55 THEN 'developing'
            ELSE 'needs_focus'
        END,
        'components', json_build_object(
            'accuracy_score', ROUND(COALESCE(overall_accuracy, 0) * 0.4, 2),
            'coverage_score', ROUND(COALESCE(topics_covered::DECIMAL / NULLIF(total_topics, 0) * 100, 0) * 0.2, 2),
            'consistency_score', ROUND(LEAST(consistency_days::DECIMAL / 20 * 100, 100) * 0.15, 2),
            'difficulty_score', ROUND(COALESCE(challenge_accuracy, 0) * 0.15, 2),
            'improvement_score', ROUND(LEAST(GREATEST(COALESCE(improvement_rate, 0) + 50, 0), 100) * 0.10, 2)
        ),
        'confidence', json_build_object(
            'level', CASE 
                WHEN total_questions >= 200 THEN 'high'
                WHEN total_questions >= 50 THEN 'medium'
                ELSE 'low'
            END,
            'questions_answered', total_questions,
            'questions_needed', GREATEST(0, 200 - total_questions)
        ),
        'subject_scores', (
            SELECT json_agg(json_build_object(
                'subject', subject,
                'subject_label', subject_label,
                'score', LEAST(100, accuracy::INTEGER),
                'tier', mastery_level,
                'topics_covered', topics_practiced,
                'total_topics', total_available_topics
            ))
            FROM child_subject_summary
            WHERE child_id = p_child_id
        ),
        'disclaimer', 'This score is an estimate based on practice performance and does not guarantee exam results.'
    ) INTO result;
    
    RETURN result;
END;
$$;


-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Note: Materialized views don't support RLS directly.
-- Access control is handled through the functions which filter by child_id.
-- Parents can only call these functions for their own children through
-- application-level checks.

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION refresh_analytics_views() TO authenticated;
GRANT EXECUTE ON FUNCTION get_child_analytics(UUID, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_weakness_heatmap(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_readiness_score(UUID) TO authenticated;


-- ============================================================================
-- INITIAL REFRESH
-- ============================================================================

-- Perform initial refresh of materialized views
-- This may take a while on large datasets
SELECT refresh_analytics_views();


-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON MATERIALIZED VIEW child_daily_stats IS 
'Aggregated daily performance statistics per child. Refreshed periodically.';

COMMENT ON MATERIALIZED VIEW child_topic_mastery IS 
'Topic-level mastery tracking including difficulty breakdown and trends.';

COMMENT ON MATERIALIZED VIEW child_weekly_summary IS 
'Weekly aggregated performance summaries for trend analysis.';

COMMENT ON MATERIALIZED VIEW child_subject_summary IS 
'Subject-level performance summary with coverage metrics.';

COMMENT ON FUNCTION refresh_analytics_views() IS 
'Refreshes all analytics materialized views. Should be called periodically.';

COMMENT ON FUNCTION get_child_analytics(UUID, DATE, DATE) IS 
'Returns comprehensive analytics JSON for a child within a date range.';

COMMENT ON FUNCTION get_weakness_heatmap(UUID) IS 
'Returns heatmap data for weakness visualization.';

COMMENT ON FUNCTION calculate_readiness_score(UUID) IS 
'Calculates 11+ readiness score with component breakdown.';
