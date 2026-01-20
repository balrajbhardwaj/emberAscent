-- ============================================================================
-- Migration: 005_ember_score_tracking
-- Purpose: Add Ember Score tracking columns and create feedback/stats infrastructure
-- Author: Ember Ascent Team
-- Date: 2026-01-20
-- ============================================================================

-- Add review_status column to questions table
-- This tracks the expert review state of each question
ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS review_status TEXT 
CHECK (review_status IN ('reviewed', 'spot_checked', 'ai_only'))
DEFAULT 'ai_only';

-- Update existing questions to have proper review status
-- If they have been reviewed (reviewed_at is set), mark as reviewed
UPDATE questions 
SET review_status = 'reviewed'
WHERE reviewed_at IS NOT NULL AND reviewed_by IS NOT NULL;

-- Add comment explaining the field
COMMENT ON COLUMN questions.review_status IS 'Expert review status: reviewed (full review), spot_checked (quick verification), ai_only (no human review yet)';

-- ============================================================================
-- Create question_stats view (materialized for performance)
-- Aggregates usage statistics for Ember Score community feedback component
-- ============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS question_stats AS
SELECT
    q.id AS question_id,
    COUNT(DISTINCT qa.id) AS total_attempts,
    ROUND(
        (COUNT(CASE WHEN qa.is_correct THEN 1 END)::decimal / 
        NULLIF(COUNT(qa.id), 0)) * 100, 
        2
    ) AS correct_percentage,
    ROUND(AVG(qa.time_taken_seconds), 2) AS avg_time_seconds,
    (
        SELECT COUNT(*) 
        FROM error_reports er 
        WHERE er.question_id = q.id 
        AND er.status = 'pending'
    ) AS error_report_count,
    0 AS helpful_votes, -- Placeholder until question_feedback table created in Day 9
    0 AS not_helpful_votes, -- Placeholder until question_feedback table created in Day 9
    NOW() AS last_updated
FROM 
    questions q
LEFT JOIN 
    question_attempts qa ON q.id = qa.question_id
GROUP BY 
    q.id;

-- Create indexes on the materialized view for performance
CREATE UNIQUE INDEX idx_question_stats_question_id ON question_stats(question_id);
CREATE INDEX idx_question_stats_attempts ON question_stats(total_attempts);
CREATE INDEX idx_question_stats_errors ON question_stats(error_report_count);

-- Add comment
COMMENT ON MATERIALIZED VIEW question_stats IS 'Aggregated statistics for Ember Score community feedback calculation. Refresh periodically or on-demand.';

-- ============================================================================
-- Create function to recalculate Ember Score for a question
-- This can be called via RPC from the application
-- ============================================================================

CREATE OR REPLACE FUNCTION recalculate_ember_score(question_uuid UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_curriculum_score INTEGER;
    v_expert_score INTEGER;
    v_community_score INTEGER;
    v_total_score INTEGER;
    v_stats RECORD;
    v_question RECORD;
    v_breakdown JSONB;
BEGIN
    -- Get question data
    SELECT 
        curriculum_reference,
        review_status
    INTO v_question
    FROM questions
    WHERE id = question_uuid;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Question not found: %', question_uuid;
    END IF;

    -- Get stats from materialized view
    SELECT 
        total_attempts,
        error_report_count,
        helpful_votes,
        not_helpful_votes
    INTO v_stats
    FROM question_stats
    WHERE question_id = question_uuid;

    -- If no stats record (no attempts yet), use defaults
    IF NOT FOUND THEN
        v_stats.total_attempts := 0;
        v_stats.error_report_count := 0;
        v_stats.helpful_votes := 0;
        v_stats.not_helpful_votes := 0;
    END IF;

    -- Calculate Curriculum Alignment Score (0-40)
    IF v_question.curriculum_reference IS NOT NULL 
        AND v_question.curriculum_reference ~ '^(KS[1-4]|Y[3-6]|Year [3-6])' THEN
        v_curriculum_score := 40; -- Valid NC reference
    ELSIF v_question.curriculum_reference IS NOT NULL 
        AND LENGTH(TRIM(v_question.curriculum_reference)) > 0 THEN
        v_curriculum_score := 20; -- Some reference
    ELSE
        v_curriculum_score := 0; -- No reference
    END IF;

    -- Calculate Expert Verification Score (0-40)
    v_expert_score := CASE v_question.review_status
        WHEN 'reviewed' THEN 40
        WHEN 'spot_checked' THEN 25
        ELSE 10 -- ai_only or null
    END;

    -- Calculate Community Feedback Score (0-20)
    -- Base: 16, Error penalty: -2 each, Helpful bonus: +0.5 each (max +4), Usage bonus: +0.1 per 100 attempts (max +4)
    v_community_score := 16;
    
    -- Error penalty
    v_community_score := v_community_score - (v_stats.error_report_count * 2);
    
    -- Helpful votes bonus (max +4)
    v_community_score := v_community_score + LEAST(4, v_stats.helpful_votes * 0.5);
    
    -- Usage bonus (only if no errors, max +4)
    IF v_stats.error_report_count = 0 AND v_stats.total_attempts > 0 THEN
        v_community_score := v_community_score + LEAST(4, (v_stats.total_attempts / 100.0) * 0.1);
    END IF;
    
    -- Clamp community score to 0-20 range
    v_community_score := GREATEST(0, LEAST(20, v_community_score));

    -- Calculate total score
    v_total_score := v_curriculum_score + v_expert_score + v_community_score;
    v_total_score := GREATEST(0, LEAST(100, v_total_score)); -- Clamp to 0-100

    -- Build breakdown JSON
    v_breakdown := jsonb_build_object(
        'curriculumAlignment', v_curriculum_score,
        'expertVerification', v_expert_score,
        'communityFeedback', v_community_score
    );

    -- Update question record
    UPDATE questions
    SET 
        ember_score = v_total_score,
        ember_score_breakdown = v_breakdown,
        updated_at = NOW()
    WHERE id = question_uuid;

    -- Return result
    RETURN jsonb_build_object(
        'questionId', question_uuid,
        'score', v_total_score,
        'breakdown', v_breakdown,
        'updatedAt', NOW()
    );
END;
$$;

-- Add comment
COMMENT ON FUNCTION recalculate_ember_score IS 'Recalculates Ember Score for a specific question based on current data. Returns updated score and breakdown.';

-- ============================================================================
-- Create trigger to recalculate score when error report changes
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_recalculate_ember_score_on_error()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Refresh the materialized view for this question's stats
    -- Note: This is a simplified approach. In production, consider async job queue.
    REFRESH MATERIALIZED VIEW CONCURRENTLY question_stats;
    
    -- Recalculate the score
    PERFORM recalculate_ember_score(NEW.question_id);
    
    RETURN NEW;
END;
$$;

-- Trigger on error_reports INSERT/UPDATE
DROP TRIGGER IF EXISTS after_error_report_change ON error_reports;
CREATE TRIGGER after_error_report_change
AFTER INSERT OR UPDATE OF status ON error_reports
FOR EACH ROW
EXECUTE FUNCTION trigger_recalculate_ember_score_on_error();

COMMENT ON TRIGGER after_error_report_change ON error_reports IS 'Automatically recalculates Ember Score when error report status changes';

-- ============================================================================
-- Create function to refresh question stats (call periodically via cron)
-- ============================================================================

CREATE OR REPLACE FUNCTION refresh_question_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY question_stats;
END;
$$;

COMMENT ON FUNCTION refresh_question_stats IS 'Refreshes the question_stats materialized view. Call periodically (e.g., every 15 minutes) via cron or manually after bulk data changes.';

-- ============================================================================
-- Grant permissions
-- ============================================================================

-- Allow authenticated users to read stats
GRANT SELECT ON question_stats TO authenticated;

-- Allow service role to execute recalculation functions
-- (These will be called from server-side Next.js code)
-- Note: SECURITY DEFINER means functions run with owner privileges

-- ============================================================================
-- Initial data update
-- ============================================================================

-- Refresh the stats view with current data
REFRESH MATERIALIZED VIEW question_stats;

-- Temporarily disable the valid_ember_score constraint to allow recalculation
ALTER TABLE questions DROP CONSTRAINT IF EXISTS valid_ember_score;

-- Recalculate Ember Scores for all existing questions
-- This may take a while if you have many questions
DO $$
DECLARE
    question_record RECORD;
BEGIN
    FOR question_record IN 
        SELECT id FROM questions
    LOOP
        PERFORM recalculate_ember_score(question_record.id);
    END LOOP;
END $$;

-- Unpublish questions that don't meet the 60+ score threshold
UPDATE questions
SET is_published = false
WHERE ember_score < 60 AND is_published = true;

-- Re-add the constraint
ALTER TABLE questions 
ADD CONSTRAINT valid_ember_score 
CHECK (is_published = false OR ember_score >= 60);

-- ============================================================================
-- Indexes for performance
-- ============================================================================

-- Index on review_status for filtering
CREATE INDEX IF NOT EXISTS idx_questions_review_status ON questions(review_status);

-- Composite index for Ember Score queries
CREATE INDEX IF NOT EXISTS idx_questions_ember_score_published 
ON questions(ember_score DESC, is_published) 
WHERE is_published = true;

-- ============================================================================
-- Migration complete
-- ============================================================================

-- Note: question_feedback table will be created in Day 9 migration
-- when we implement the feedback collection UI
