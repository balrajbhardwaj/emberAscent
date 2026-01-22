-- =============================================================================
-- DATABASE SCHEMA EXTRACTION SCRIPT
-- =============================================================================
-- Purpose: Extract complete schema definitions with comments for all tables
-- Run in: Supabase Dashboard SQL Editor
-- URL: https://supabase.com/dashboard/project/cmujulpwvmfvpyypcfaa/sql/new
-- =============================================================================

-- 1. TABLE DEFINITIONS WITH COMMENTS
-- =============================================================================
SELECT 
  '=== TABLE: ' || c.relname || ' ===' as section,
  obj_description(c.oid, 'pg_class') as table_comment
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' 
  AND c.relkind = 'r'
  AND c.relname NOT LIKE 'pg_%'
  AND c.relname NOT LIKE '_prisma_%'
ORDER BY c.relname;

-- 2. DETAILED COLUMN DEFINITIONS
-- =============================================================================
SELECT 
  t.table_name,
  c.column_name,
  c.data_type,
  c.character_maximum_length,
  c.numeric_precision,
  c.is_nullable,
  c.column_default,
  col_description(
    (SELECT oid FROM pg_class WHERE relname = t.table_name AND relnamespace = 'public'::regnamespace),
    c.ordinal_position
  ) as column_comment
FROM information_schema.tables t
JOIN information_schema.columns c 
  ON t.table_name = c.table_name 
  AND t.table_schema = c.table_schema
WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
  AND t.table_name NOT LIKE 'pg_%'
  AND t.table_name NOT LIKE '_prisma_%'
ORDER BY t.table_name, c.ordinal_position;

-- 3. PRIMARY KEYS AND UNIQUE CONSTRAINTS
-- =============================================================================
SELECT 
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
WHERE tc.table_schema = 'public'
  AND tc.constraint_type IN ('PRIMARY KEY', 'UNIQUE')
ORDER BY tc.table_name, tc.constraint_type, kcu.ordinal_position;

-- 4. FOREIGN KEY RELATIONSHIPS
-- =============================================================================
SELECT
  tc.table_name as from_table,
  kcu.column_name as from_column,
  ccu.table_name as to_table,
  ccu.column_name as to_column,
  tc.constraint_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- 5. CHECK CONSTRAINTS
-- =============================================================================
SELECT 
  tc.table_name,
  tc.constraint_name,
  cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc
  ON tc.constraint_name = cc.constraint_name
  AND tc.constraint_schema = cc.constraint_schema
WHERE tc.table_schema = 'public'
  AND tc.constraint_type = 'CHECK'
  AND tc.constraint_name NOT LIKE '%_not_null'
ORDER BY tc.table_name, tc.constraint_name;

-- 6. INDEXES
-- =============================================================================
SELECT
  tablename as table_name,
  indexname as index_name,
  indexdef as index_definition
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename NOT LIKE 'pg_%'
ORDER BY tablename, indexname;

-- 7. TRIGGERS
-- =============================================================================
SELECT 
  event_object_table as table_name,
  trigger_name,
  event_manipulation as trigger_event,
  action_timing as trigger_timing,
  action_statement as trigger_action
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 8. RLS POLICIES
-- =============================================================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 9. FUNCTIONS (stored procedures)
-- =============================================================================
SELECT 
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments,
  pg_get_function_result(p.oid) as return_type,
  CASE p.prosecdef 
    WHEN true THEN 'SECURITY DEFINER'
    ELSE 'SECURITY INVOKER'
  END as security,
  d.description as function_comment
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
LEFT JOIN pg_description d ON p.oid = d.objoid
WHERE n.nspname = 'public'
  AND p.prokind = 'f'
ORDER BY p.proname;

-- 10. ENUMS (custom types)
-- =============================================================================
SELECT 
  t.typname as enum_name,
  e.enumlabel as enum_value,
  e.enumsortorder as sort_order
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
JOIN pg_namespace n ON t.typnamespace = n.oid
WHERE n.nspname = 'public'
ORDER BY t.typname, e.enumsortorder;
