/**
 * Debug Dashboard Layout Issues
 * 
 * Run this script to check database issues that might be causing
 * the dashboard layout errors.
 */

-- Check if children table exists and has correct structure
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'children' 
ORDER BY ordinal_position;

-- Check if any children exist in the database  
SELECT 
  id,
  parent_id,
  name,
  year_group,
  is_active,
  created_at
FROM children 
ORDER BY created_at DESC
LIMIT 5;

-- Check user records
SELECT 
  id,
  email,
  email_confirmed_at IS NOT NULL as email_confirmed,
  created_at
FROM auth.users 
ORDER BY created_at DESC
LIMIT 5;