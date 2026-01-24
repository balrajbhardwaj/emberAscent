-- ============================================================================
-- Admin Access Fix
-- ============================================================================
-- This migration adds admin bypass policies to allow super_admin/admin users
-- to view all data in the admin panel.
--
-- ISSUES FIXED:
-- 1. Admin users can't see all users in /admin/users (RLS blocking)
-- 2. Admin queries fail due to profiles RLS SELECT policy
--
-- SECURITY:
-- - Only users with role='admin' or role='super_admin' can bypass RLS
-- - Regular users still only see their own data
-- - Uses function to avoid infinite recursion
-- ============================================================================

-- =============================================================================
-- HELPER FUNCTION: Check if user is admin
-- =============================================================================

-- Function to check if current user is admin (avoids recursion in policies)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- ADMIN BYPASS POLICIES FOR PROFILES
-- =============================================================================

-- Admin users can view all profiles
CREATE POLICY "profiles_admin_view_all"
    ON profiles FOR SELECT
    TO authenticated
    USING (is_admin());

-- Admin users can update any profile (for support)
CREATE POLICY "profiles_admin_update_all"
    ON profiles FOR UPDATE
    TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

-- =============================================================================
-- ADMIN BYPASS POLICIES FOR CHILDREN
-- =============================================================================

-- Admin users can view all children
CREATE POLICY "children_admin_view_all"
    ON children FOR SELECT
    TO authenticated
    USING (is_admin());

-- =============================================================================
-- ADMIN BYPASS POLICIES FOR PRACTICE SESSIONS
-- =============================================================================

-- Admin users can view all practice sessions
CREATE POLICY "sessions_admin_view_all"
    ON practice_sessions FOR SELECT
    TO authenticated
    USING (is_admin());

-- =============================================================================
-- ADMIN BYPASS POLICIES FOR QUESTION ATTEMPTS
-- =============================================================================

-- Admin users can view all question attempts
CREATE POLICY "attempts_admin_view_all"
    ON question_attempts FOR SELECT
    TO authenticated
    USING (is_admin());

-- =============================================================================
-- ADMIN BYPASS POLICIES FOR ERROR REPORTS
-- =============================================================================

-- Admin users can view all error reports
CREATE POLICY "error_reports_admin_view_all"
    ON error_reports FOR SELECT
    TO authenticated
    USING (is_admin());

-- Admin users can update error reports (change status, add notes)
CREATE POLICY "error_reports_admin_update_all"
    ON error_reports FOR UPDATE
    TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

-- =============================================================================
-- VERIFY POLICIES
-- =============================================================================

-- Check all policies for profiles table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;
