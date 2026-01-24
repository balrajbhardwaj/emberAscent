-- ============================================================================
-- Create Admin User Script
-- ============================================================================
-- This script creates an admin user account for accessing the admin dashboard.
-- 
-- INSTRUCTIONS:
-- 1. Run this in Supabase Dashboard → SQL Editor
-- 2. Replace the email/password with your desired credentials
-- 3. The user will be created with 'admin' role
--
-- ADMIN ACCESS:
-- - URL: http://localhost:3000/admin
-- - Login with the email/password you set below
-- ============================================================================

-- Set your admin credentials here
DO $$
DECLARE
  admin_email TEXT := 'support@emberdatalabs.co.uk';  -- CHANGE THIS
  admin_password TEXT := '-Cr3at3d@dmin';       -- CHANGE THIS
  admin_full_name TEXT := 'Support User';         -- CHANGE THIS
  target_role TEXT := 'super_admin';            -- 'admin' or 'super_admin'
  new_user_id UUID;
  existing_user_id UUID;
  user_exists BOOLEAN;
BEGIN
  -- Check if user already exists
  SELECT id INTO existing_user_id
  FROM auth.users
  WHERE email = admin_email
  LIMIT 1;

  IF existing_user_id IS NOT NULL THEN
    -- User exists, just update the profile role
    RAISE NOTICE 'User already exists with email: %', admin_email;
    RAISE NOTICE 'Updating profile to % role...', target_role;
    
    -- Update or insert profile
    INSERT INTO profiles (
      id,
      email,
      full_name,
      role,
      subscription_tier,
      subscription_status
    ) VALUES (
      existing_user_id,
      admin_email,
      admin_full_name,
      target_role,
      'free',
      'active'
    )
    ON CONFLICT (id) DO UPDATE
    SET 
      role = target_role,
      full_name = admin_full_name,
      updated_at = NOW();
    
    new_user_id := existing_user_id;
    RAISE NOTICE 'Profile updated successfully!';
  ELSE
    -- Create new auth user
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      admin_email,
      crypt(admin_password, gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('full_name', admin_full_name),
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    )
    RETURNING id INTO new_user_id;

    -- Create profile with admin role (or update if exists)
    INSERT INTO profiles (
      id,
      email,
      full_name,
      role,
      subscription_tier,
      subscription_status
    ) VALUES (
      new_user_id,
      admin_email,
      admin_full_name,
      target_role,
      'free',
      'active'
    )
    ON CONFLICT (id) DO UPDATE
    SET 
      role = target_role,
      full_name = admin_full_name,
      email = admin_email,
      updated_at = NOW();
    
    RAISE NOTICE 'Admin user created successfully!';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '=== ADMIN USER READY ===';
  RAISE NOTICE 'User ID: %', new_user_id;
  RAISE NOTICE 'Email: %', admin_email;
  RAISE NOTICE 'Role: %', target_role;
  RAISE NOTICE '';
  RAISE NOTICE 'Login at: http://localhost:3000/login';
  RAISE NOTICE 'Then navigate to: http://localhost:3000/admin';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- VERIFY ADMIN USER
-- ============================================================================
-- Check the admin user was created
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.role,
  p.created_at
FROM profiles p
WHERE p.role IN ('admin', 'super_admin')
ORDER BY p.created_at DESC;
