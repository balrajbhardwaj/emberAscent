-- =============================================================================
-- CLEANUP AUTH USERS
-- =============================================================================
-- Purpose: Remove test users from auth.users to allow proper recreation
-- Run in: Supabase SQL Editor
-- URL: https://supabase.com/dashboard/project/cmujulpwvmfvpyypcfaa/sql/new
-- =============================================================================

-- Check current test users in auth.users
SELECT id, email, created_at, email_confirmed_at, encrypted_password
FROM auth.users
WHERE email LIKE 'test.%@emberascent.dev'
ORDER BY email;

-- Delete test users from auth.users (this will cascade to profiles and children)
DELETE FROM auth.users WHERE email LIKE 'test.%@emberascent.dev';

-- Verify deletion
SELECT COUNT(*) as remaining_test_users
FROM auth.users
WHERE email LIKE 'test.%@emberascent.dev';

-- Expected result: 0 remaining test users
