-- ============================================================================
-- Promote Existing User to Admin
-- ============================================================================
-- This script promotes an existing user account to admin role.
--
-- INSTRUCTIONS:
-- 1. Run this in Supabase Dashboard → SQL Editor
-- 2. Replace the email with the user you want to promote
-- 3. Choose between 'admin' or 'super_admin' role
--
-- ROLES:
-- - 'admin': Can manage content, view reports, manage questions
-- - 'super_admin': Full access including user management
-- ============================================================================

-- Set the email of the user to promote
DO $$
DECLARE
  user_email TEXT := 'test.sarah@emberascent.dev';  -- CHANGE THIS
  target_role TEXT := 'admin';                       -- 'admin' or 'super_admin'
  user_exists BOOLEAN;
BEGIN
  -- Check if user exists
  SELECT EXISTS(SELECT 1 FROM profiles WHERE email = user_email) INTO user_exists;
  
  IF NOT user_exists THEN
    RAISE EXCEPTION 'User with email % does not exist', user_email;
  END IF;

  -- Update the user's role
  UPDATE profiles
  SET role = target_role
  WHERE email = user_email;

  RAISE NOTICE 'User promoted successfully!';
  RAISE NOTICE 'Email: %', user_email;
  RAISE NOTICE 'New Role: %', target_role;
  RAISE NOTICE '';
  RAISE NOTICE 'User can now access: http://localhost:3000/admin';
END $$;

-- ============================================================================
-- VERIFY PROMOTION
-- ============================================================================
-- Check the user's current role
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.role,
  p.updated_at
FROM profiles p
WHERE p.email = 'test.sarah@emberascent.dev'  -- CHANGE THIS TO MATCH ABOVE
LIMIT 1;
