-- =============================================================================
-- GENERATE TEST USERS FOR DEVELOPMENT
-- =============================================================================
-- Purpose: Create test user accounts with premium and free subscriptions
-- Run in: Supabase SQL Editor
-- URL: https://supabase.com/dashboard/project/cmujulpwvmfvpyypcfaa/sql/new
-- Note: Safe to re-run - uses ON CONFLICT to update existing records
-- =============================================================================

-- =============================================================================
-- 1. CREATE TEST AUTH USERS AND PROFILES
-- =============================================================================
-- Note: We need to create auth.users first, then profiles (or let trigger handle it)

-- Optional: Clean up existing test users (comment out if you want to preserve data)
-- Uncomment these lines if you want to start fresh:
/*
DELETE FROM children WHERE parent_id IN (
  SELECT id FROM profiles WHERE email LIKE 'test.%@emberascent.dev'
);
DELETE FROM profiles WHERE email LIKE 'test.%@emberascent.dev';
DELETE FROM auth.users WHERE email LIKE 'test.%@emberascent.dev';
*/

-- =============================================================================
-- FREE TIER TEST USERS (2 users)
-- =============================================================================

-- Test User 1: Free Tier - Sarah Thompson
-- Create auth.users entry first
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud
) VALUES (
  'b1111111-1111-1111-1111-111111111111'::UUID,
  '00000000-0000-0000-0000-000000000000'::UUID,
  'test.sarah@emberascent.dev',
  crypt('TestPassword123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Sarah Thompson"}'::jsonb,
  false,
  'authenticated',
  'authenticated'
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  updated_at = NOW();

-- Update/Insert profile (trigger should create it, but we'll ensure correct data)
INSERT INTO profiles (
  id,
  email,
  full_name,
  subscription_tier,
  subscription_status,
  stripe_customer_id,
  created_at
) VALUES (
  'b1111111-1111-1111-1111-111111111111'::UUID,
  'test.sarah@emberascent.dev',
  'Sarah Thompson',
  'free',
  'active',
  NULL,
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  subscription_tier = EXCLUDED.subscription_tier,
  updated_at = NOW();

-- Add children for Sarah
INSERT INTO children (
  id,
  parent_id,
  name,
  year_group,
  target_school,
  avatar_url,
  is_active,
  created_at
) VALUES
  (
    'c1111111-1111-1111-1111-111111111111'::UUID,
    'b1111111-1111-1111-1111-111111111111'::UUID,
    'Emma',
    5,
    'Reading Grammar School',
    '👧',
    true,
    NOW()
  ),
  (
    'c1111111-1111-1111-1111-111111111112'::UUID,
    'b1111111-1111-1111-1111-111111111111'::UUID,
    'Oliver',
    3,
    NULL,
    '👦',
    true,
    NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  year_group = EXCLUDED.year_group,
  updated_at = NOW();

-- Test User 2: Free Tier - Rajesh Patel
-- Create auth.users entry first
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud
) VALUES (
  'b2222222-2222-2222-2222-222222222222'::UUID,
  '00000000-0000-0000-0000-000000000000'::UUID,
  'test.rajesh@emberascent.dev',
  crypt('TestPassword123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Rajesh Patel"}'::jsonb,
  false,
  'authenticated',
  'authenticated'
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  updated_at = NOW();

-- Update/Insert profile
INSERT INTO profiles (
  id,
  email,
  full_name,
  subscription_tier,
  subscription_status,
  stripe_customer_id,
  created_at
) VALUES (
  'b2222222-2222-2222-2222-222222222222'::UUID,
  'test.rajesh@emberascent.dev',
  'Rajesh Patel',
  'free',
  'active',
  NULL,
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  subscription_tier = EXCLUDED.subscription_tier,
  updated_at = NOW();

-- Add children for Rajesh
INSERT INTO children (
  id,
  parent_id,
  name,
  year_group,
  target_school,
  avatar_url,
  is_active,
  created_at
) VALUES
  (
    'c2222222-2222-2222-2222-222222222221'::UUID,
    'b2222222-2222-2222-2222-222222222222'::UUID,
    'Aisha',
    4,
    'Tiffin Girls School',
    '👧',
    true,
    NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  year_group = EXCLUDED.year_group,
  updated_at = NOW();

-- =============================================================================
-- PREMIUM TIER TEST USERS (2 users)
-- =============================================================================

-- Test User 3: Ascent Tier - James Wilson
-- Create auth.users entry first
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud
) VALUES (
  'b3333333-3333-3333-3333-333333333333'::UUID,
  '00000000-0000-0000-0000-000000000000'::UUID,
  'test.james@emberascent.dev',
  crypt('TestPassword123!', gen_salt('bf')),
  NOW() - INTERVAL '30 days',
  NOW() - INTERVAL '30 days',
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"James Wilson"}'::jsonb,
  false,
  'authenticated',
  'authenticated'
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  updated_at = NOW();

-- Update/Insert profile
INSERT INTO profiles (
  id,
  email,
  full_name,
  subscription_tier,
  subscription_status,
  stripe_customer_id,
  stripe_subscription_id,
  created_at
) VALUES (
  'b3333333-3333-3333-3333-333333333333'::UUID,
  'test.james@emberascent.dev',
  'James Wilson',
  'ascent',
  'active',
  'cus_test_ascent_001',
  'sub_test_ascent_001',
  NOW() - INTERVAL '30 days'
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  subscription_tier = EXCLUDED.subscription_tier,
  subscription_status = EXCLUDED.subscription_status,
  updated_at = NOW();

-- Add children for James
INSERT INTO children (
  id,
  parent_id,
  name,
  year_group,
  target_school,
  avatar_url,
  is_active,
  created_at
) VALUES
  (
    'c3333333-3333-3333-3333-333333333331'::UUID,
    'b3333333-3333-3333-3333-333333333333'::UUID,
    'Sophia',
    6,
    'St Paul''s Girls'' School',
    '👧',
    true,
    NOW() - INTERVAL '30 days'
  ),
  (
    'c3333333-3333-3333-3333-333333333332'::UUID,
    'b3333333-3333-3333-3333-333333333333'::UUID,
    'Harry',
    4,
    'Westminster Under School',
    '👦',
    true,
    NOW() - INTERVAL '30 days'
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  year_group = EXCLUDED.year_group,
  updated_at = NOW();

-- Test User 4: Summit Tier - Priya Sharma
-- Create auth.users entry first
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud
) VALUES (
  'b4444444-4444-4444-4444-444444444444'::UUID,
  '00000000-0000-0000-0000-000000000000'::UUID,
  'test.priya@emberascent.dev',
  crypt('TestPassword123!', gen_salt('bf')),
  NOW() - INTERVAL '60 days',
  NOW() - INTERVAL '60 days',
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Priya Sharma"}'::jsonb,
  false,
  'authenticated',
  'authenticated'
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  updated_at = NOW();

-- Update/Insert profile
INSERT INTO profiles (
  id,
  email,
  full_name,
  subscription_tier,
  subscription_status,
  stripe_customer_id,
  stripe_subscription_id,
  created_at
) VALUES (
  'b4444444-4444-4444-4444-444444444444'::UUID,
  'test.priya@emberascent.dev',
  'Priya Sharma',
  'summit',
  'active',
  'cus_test_summit_001',
  'sub_test_summit_001',
  NOW() - INTERVAL '60 days'
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  subscription_tier = EXCLUDED.subscription_tier,
  subscription_status = EXCLUDED.subscription_status,
  updated_at = NOW();

-- Add children for Priya
INSERT INTO children (
  id,
  parent_id,
  name,
  year_group,
  target_school,
  avatar_url,
  is_active,
  created_at
) VALUES
  (
    'c4444444-4444-4444-4444-444444444441'::UUID,
    'b4444444-4444-4444-4444-444444444444'::UUID,
    'Arjun',
    5,
    'King Edward''s School',
    '👦',
    true,
    NOW() - INTERVAL '60 days'
  ),
  (
    'c4444444-4444-4444-4444-444444444442'::UUID,
    'b4444444-4444-4444-4444-444444444444'::UUID,
    'Lily',
    3,
    NULL,
    '👧',
    true,
    NOW() - INTERVAL '45 days'
  ),
  (
    'c4444444-4444-4444-4444-444444444443'::UUID,
    'b4444444-4444-4444-4444-444444444444'::UUID,
    'Noah',
    6,
    'Eton College',
    '👦',
    true,
    NOW() - INTERVAL '60 days'
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  year_group = EXCLUDED.year_group,
  updated_at = NOW();

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Check all test profiles
SELECT 
  p.email,
  p.full_name,
  p.subscription_tier,
  p.subscription_status,
  COUNT(c.id) as child_count,
  STRING_AGG(c.name || ' (Y' || c.year_group || ')', ', ' ORDER BY c.name) as children
FROM profiles p
LEFT JOIN children c ON c.parent_id = p.id
WHERE p.email LIKE 'test.%@emberascent.dev'
GROUP BY p.id, p.email, p.full_name, p.subscription_tier, p.subscription_status
ORDER BY p.subscription_tier DESC, p.email;

-- Summary by tier
SELECT 
  subscription_tier,
  COUNT(*) as user_count,
  SUM((SELECT COUNT(*) FROM children WHERE parent_id = profiles.id)) as total_children
FROM profiles
WHERE email LIKE 'test.%@emberascent.dev'
GROUP BY subscription_tier
ORDER BY 
  CASE subscription_tier
    WHEN 'summit' THEN 1
    WHEN 'ascent' THEN 2
    WHEN 'free' THEN 3
  END;

-- =============================================================================
-- TEST USER CREDENTIALS SUMMARY
-- =============================================================================
-- Copy this for documentation:

/*
TEST USERS CREATED:

FREE TIER:
1. Email: test.sarah@emberascent.dev
   Password: TestPassword123!
   Name: Sarah Thompson
   Children: Emma (Y5), Oliver (Y3)

2. Email: test.rajesh@emberascent.dev
   Password: TestPassword123!
   Name: Rajesh Patel
   Children: Aisha (Y4)

PREMIUM TIER (ASCENT):
3. Email: test.james@emberascent.dev
   Password: TestPassword123!
   Name: James Wilson
   Children: Sophia (Y6), Harry (Y4)
   Subscription: Active (Ascent tier)

PREMIUM TIER (SUMMIT):
4. Email: test.priya@emberascent.dev
   Password: TestPassword123!
   Name: Priya Sharma
   Children: Arjun (Y5), Lily (Y3), Noah (Y6)
   Subscription: Active (Summit tier)

Note: All users can now login with their email and password: TestPassword123!
The auth.users entries are created with encrypted passwords using bcrypt.
*/
