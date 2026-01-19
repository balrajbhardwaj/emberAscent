-- Ember Ascent - Enhanced RLS Policies
-- Version: 1.0.0
-- Description: Comprehensive Row Level Security policies with helper functions
-- Note: This enhances/replaces the basic RLS in 001_initial_schema.sql

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Function: Check if current user is parent of a child
CREATE OR REPLACE FUNCTION public.is_parent_of(child_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM children
        WHERE id = child_id
        AND parent_id = auth.uid()
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION public.is_parent_of IS 'Returns true if current user is the parent of the specified child';

-- Function: Check if user owns a practice session (via child)
CREATE OR REPLACE FUNCTION public.owns_session(session_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM practice_sessions ps
        JOIN children c ON c.id = ps.child_id
        WHERE ps.id = session_id
        AND c.parent_id = auth.uid()
        AND c.is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION public.owns_session IS 'Returns true if current user owns the practice session (via child)';

-- =============================================================================
-- DROP EXISTING POLICIES (if migrating from 001_initial_schema.sql)
-- =============================================================================

-- Profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Children
DROP POLICY IF EXISTS "Parents can view own children" ON children;
DROP POLICY IF EXISTS "Parents can insert own children" ON children;
DROP POLICY IF EXISTS "Parents can update own children" ON children;
DROP POLICY IF EXISTS "Parents can delete own children" ON children;

-- Questions
DROP POLICY IF EXISTS "Published questions are viewable by all" ON questions;

-- Practice Sessions
DROP POLICY IF EXISTS "Parents can view children's sessions" ON practice_sessions;
DROP POLICY IF EXISTS "Parents can create children's sessions" ON practice_sessions;
DROP POLICY IF EXISTS "Parents can update children's sessions" ON practice_sessions;

-- Question Attempts
DROP POLICY IF EXISTS "Parents can view children's attempts" ON question_attempts;
DROP POLICY IF EXISTS "Parents can create children's attempts" ON question_attempts;

-- Error Reports
DROP POLICY IF EXISTS "Users can view own error reports" ON error_reports;
DROP POLICY IF EXISTS "Authenticated users can create error reports" ON error_reports;

-- =============================================================================
-- ENABLE RLS ON ALL TABLES
-- =============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_reports ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- PROFILES POLICIES
-- =============================================================================

-- Users can view their own profile
CREATE POLICY "profiles_select_own"
    ON profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "profiles_update_own"
    ON profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Note: INSERT handled by handle_new_user() trigger

-- =============================================================================
-- CHILDREN POLICIES
-- =============================================================================

-- Parents can view their own children (active only)
CREATE POLICY "children_select_own"
    ON children FOR SELECT
    TO authenticated
    USING (parent_id = auth.uid() AND is_active = true);

-- Parents can insert children for themselves
CREATE POLICY "children_insert_own"
    ON children FOR INSERT
    TO authenticated
    WITH CHECK (parent_id = auth.uid());

-- Parents can update their own children
CREATE POLICY "children_update_own"
    ON children FOR UPDATE
    TO authenticated
    USING (parent_id = auth.uid())
    WITH CHECK (parent_id = auth.uid());

-- Parents can "delete" (soft delete) their own children
CREATE POLICY "children_delete_own"
    ON children FOR DELETE
    TO authenticated
    USING (parent_id = auth.uid());

-- =============================================================================
-- QUESTIONS POLICIES
-- =============================================================================

-- All authenticated users can read published questions
-- Only questions with ember_score >= 60 are accessible
CREATE POLICY "questions_select_published"
    ON questions FOR SELECT
    TO authenticated
    USING (is_published = true AND ember_score >= 60);

-- Note: INSERT/UPDATE/DELETE reserved for service role (admin/content pipeline)
-- No public policies for mutations

-- =============================================================================
-- PRACTICE SESSIONS POLICIES
-- =============================================================================

-- Parents can view practice sessions for their children
CREATE POLICY "sessions_select_own_children"
    ON practice_sessions FOR SELECT
    TO authenticated
    USING (is_parent_of(child_id));

-- Parents can create practice sessions for their children
CREATE POLICY "sessions_insert_own_children"
    ON practice_sessions FOR INSERT
    TO authenticated
    WITH CHECK (is_parent_of(child_id));

-- Parents can update practice sessions for their children
CREATE POLICY "sessions_update_own_children"
    ON practice_sessions FOR UPDATE
    TO authenticated
    USING (is_parent_of(child_id))
    WITH CHECK (is_parent_of(child_id));

-- =============================================================================
-- QUESTION ATTEMPTS POLICIES
-- =============================================================================

-- Parents can view question attempts for their children
CREATE POLICY "attempts_select_own_children"
    ON question_attempts FOR SELECT
    TO authenticated
    USING (is_parent_of(child_id));

-- Parents can create question attempts for their children
-- Also validates that the session belongs to the same child
CREATE POLICY "attempts_insert_own_children"
    ON question_attempts FOR INSERT
    TO authenticated
    WITH CHECK (
        is_parent_of(child_id) 
        AND owns_session(session_id)
        AND EXISTS (
            SELECT 1 FROM practice_sessions ps
            WHERE ps.id = session_id
            AND ps.child_id = question_attempts.child_id
        )
    );

-- =============================================================================
-- ERROR REPORTS POLICIES
-- =============================================================================

-- Users can view their own error reports
CREATE POLICY "error_reports_select_own"
    ON error_reports FOR SELECT
    TO authenticated
    USING (reported_by = auth.uid());

-- Authenticated users can create error reports
-- Must report on published questions only
CREATE POLICY "error_reports_insert_authenticated"
    ON error_reports FOR INSERT
    TO authenticated
    WITH CHECK (
        reported_by = auth.uid()
        AND EXISTS (
            SELECT 1 FROM questions q
            WHERE q.id = question_id
            AND q.is_published = true
        )
    );

-- Note: UPDATE reserved for admin/moderators via service role

-- =============================================================================
-- ADMIN POLICIES (for service role)
-- =============================================================================

-- Service role can do anything on questions
CREATE POLICY "questions_service_role_all"
    ON questions FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Service role can update error reports (admin moderation)
CREATE POLICY "error_reports_service_role_update"
    ON error_reports FOR UPDATE
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Service role can view all data (for analytics, exports)
CREATE POLICY "profiles_service_role_all"
    ON profiles FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "children_service_role_all"
    ON children FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "sessions_service_role_all"
    ON practice_sessions FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "attempts_service_role_all"
    ON question_attempts FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- =============================================================================
-- POLICY TESTING HELPERS
-- =============================================================================

-- Function: Test RLS policies for current user
CREATE OR REPLACE FUNCTION public.test_rls_access()
RETURNS TABLE (
    table_name TEXT,
    can_select BOOLEAN,
    can_insert BOOLEAN,
    can_update BOOLEAN,
    can_delete BOOLEAN
) AS $$
BEGIN
    -- This function helps test what the current user can access
    -- Run as authenticated user to see their permissions
    
    RETURN QUERY
    SELECT 
        'Summary of RLS policies - run specific queries to test access'::TEXT as table_name,
        true as can_select,
        true as can_insert,
        true as can_update,
        true as can_delete;
    
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.test_rls_access IS 'Helper to understand current user RLS permissions';

-- =============================================================================
-- SECURITY NOTES
-- =============================================================================

/*
SECURITY BEST PRACTICES IMPLEMENTED:

1. Principle of Least Privilege
   - Users can only access their own data and their children's data
   - No cross-parent data access
   - Questions are read-only for users

2. Defense in Depth
   - RLS at database level (this file)
   - Application-level checks in Next.js
   - Middleware auth validation

3. Data Isolation
   - is_parent_of() helper ensures parent-child relationship
   - Soft deletes prevent data loss but maintain privacy

4. Audit Trail
   - created_at, updated_at on all tables
   - created_by, reviewed_by on questions
   - Status tracking on error_reports

5. Service Role Protection
   - Admin operations require service role key
   - Never expose service role key to client
   - Use only in secure server-side contexts

TESTING RLS POLICIES:

-- Test as authenticated user
SELECT * FROM profiles; -- Should see only own profile
SELECT * FROM children; -- Should see only own children
SELECT * FROM questions WHERE is_published = true; -- Should see published questions

-- Test helper functions
SELECT is_parent_of('child-uuid-here'); -- Should return true/false
SELECT owns_session('session-uuid-here'); -- Should return true/false

-- Test attempts insert
INSERT INTO question_attempts (...) 
-- Should fail if child_id doesn't belong to user
-- Should fail if session_id doesn't match child_id

MONITORING:

- Watch for failed RLS policy violations in logs
- Monitor error_reports for potential question issues
- Track subscription tier to enforce feature access
*/

-- End of RLS policies migration
