-- Confirm Email for Test User
-- Run this in Supabase SQL Editor to confirm the test user's email

-- First, check if the user exists and get their confirmation status
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users 
WHERE email = 'test@emberascent.com';

-- If the user exists but email is not confirmed, run this to confirm it:
UPDATE auth.users 
SET 
  email_confirmed_at = NOW(),
  updated_at = NOW()
WHERE email = 'test@emberascent.com' 
  AND email_confirmed_at IS NULL;

-- Verify the email is now confirmed
SELECT 
  id,
  email,
  email_confirmed_at,
  'Email confirmed!' as status
FROM auth.users 
WHERE email = 'test@emberascent.com';