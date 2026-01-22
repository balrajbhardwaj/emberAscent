
-- =============================================================================
-- COMPLETE SCHEMA EXPORT - Run this in Supabase SQL Editor
-- =============================================================================

-- 1. Get all tables with comments
SELECT 
  c.relname as table_name,
  obj_description(c.oid, 'pg_class') as table_comment
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' 
  AND c.relkind = 'r'
  AND c.relname NOT LIKE 'pg_%'
ORDER BY c.relname;

-- 2. Get all columns with details
SELECT 
  t.table_name,
  c.column_name,
  c.data_type || COALESCE('(' || c.character_maximum_length || ')', '') as full_type,
  c.is_nullable,
  c.column_default,
  col_description(
    (SELECT oid FROM pg_class WHERE relname = t.table_name AND relnamespace = 'public'::regnamespace),
    c.ordinal_position
  ) as comment
FROM information_schema.tables t
JOIN information_schema.columns c 
  ON t.table_name = c.table_name 
  AND t.table_schema = c.table_schema
WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
ORDER BY t.table_name, c.ordinal_position;

-- 3. Get all constraints
SELECT 
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  COALESCE(cc.check_clause, string_agg(kcu.column_name, ', ')) as details
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.check_constraints cc
  ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public'
GROUP BY tc.table_name, tc.constraint_name, tc.constraint_type, cc.check_clause
ORDER BY tc.table_name, tc.constraint_type;

-- 4. Get foreign keys
SELECT
  tc.table_name as from_table,
  kcu.column_name as from_column,
  ccu.table_name as to_table,
  ccu.column_name as to_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- 5. Get functions
SELECT 
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments,
  pg_get_function_result(p.oid) as return_type,
  d.description as comment
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
LEFT JOIN pg_description d ON p.oid = d.objoid
WHERE n.nspname = 'public'
  AND p.prokind = 'f'
ORDER BY p.proname;
