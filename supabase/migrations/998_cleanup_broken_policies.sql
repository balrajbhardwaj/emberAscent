-- ============================================================================
-- Cleanup Broken Admin Policies
-- ============================================================================
-- Removes the recursively broken admin policies before applying the fixed ones.
-- Run this BEFORE 999_admin_access_fix.sql
-- ============================================================================

-- Drop all the broken admin policies
DROP POLICY IF EXISTS "profiles_admin_view_all" ON profiles;
DROP POLICY IF EXISTS "profiles_admin_update_all" ON profiles;
DROP POLICY IF EXISTS "children_admin_view_all" ON children;
DROP POLICY IF EXISTS "sessions_admin_view_all" ON practice_sessions;
DROP POLICY IF EXISTS "attempts_admin_view_all" ON question_attempts;
DROP POLICY IF EXISTS "error_reports_admin_view_all" ON error_reports;
DROP POLICY IF EXISTS "error_reports_admin_update_all" ON error_reports;

-- Drop the is_admin function if it exists
DROP FUNCTION IF EXISTS is_admin();

-- Verify policies are removed
SELECT 
    schemaname,
    tablename,
    policyname
FROM pg_policies
WHERE policyname LIKE '%admin%'
ORDER BY tablename, policyname;
