/**
 * Database Schema Extraction Script
 * 
 * Extracts complete schema definitions from Supabase PostgreSQL database
 * including tables, columns, constraints, indexes, RLS policies, and functions.
 * 
 * Run with: npx tsx scripts/get-db-schema.ts
 * 
 * Required environment variables in .env.local:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 * 
 * @module scripts/get-db-schema
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables')
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// =============================================================================
// FIRST: Create helper function in database (run once)
// =============================================================================

async function ensureHelperFunction() {
  // Create a helper function to execute arbitrary SQL and return JSON
  const createFunctionSql = `
    CREATE OR REPLACE FUNCTION public.exec_sql_to_json(sql_query TEXT)
    RETURNS JSONB
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    DECLARE
      result JSONB;
    BEGIN
      EXECUTE 'SELECT COALESCE(jsonb_agg(row_to_json(t)), ''[]''::jsonb) FROM (' || sql_query || ') t'
      INTO result;
      RETURN result;
    END;
    $$;
  `
  
  // Try to create the function - it may already exist
  const { error } = await supabase.rpc('exec_sql_to_json', { sql_query: 'SELECT 1' })
  
  if (error && error.message.includes('does not exist')) {
    console.log('📦 Creating helper function exec_sql_to_json...')
    console.log('   ⚠️  Please run this SQL in Supabase SQL Editor first:\n')
    console.log(createFunctionSql)
    console.log('\n   Then run this script again.')
    return false
  }
  
  return true
}

// =============================================================================
// SQL Queries for Schema Extraction
// =============================================================================

const QUERIES = {
  tables: `
    SELECT 
      c.relname as table_name,
      COALESCE(obj_description(c.oid, 'pg_class'), '') as table_comment
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' 
      AND c.relkind = 'r'
      AND c.relname NOT LIKE 'pg_%'
      AND c.relname NOT LIKE '_prisma_%'
    ORDER BY c.relname
  `,
  
  columns: `
    SELECT 
      c.table_name,
      c.column_name,
      c.data_type,
      c.character_maximum_length,
      c.numeric_precision,
      c.is_nullable,
      COALESCE(c.column_default, '') as column_default,
      COALESCE(col_description(
        (SELECT oid FROM pg_class WHERE relname = c.table_name AND relnamespace = 'public'::regnamespace),
        c.ordinal_position
      ), '') as column_comment
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
      AND c.table_name NOT LIKE 'pg_%'
    ORDER BY c.table_name, c.ordinal_position
  `,
  
  primaryKeys: `
    SELECT 
      tc.table_name,
      tc.constraint_name,
      kcu.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu 
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    WHERE tc.table_schema = 'public'
      AND tc.constraint_type = 'PRIMARY KEY'
    ORDER BY tc.table_name
  `,
  
  foreignKeys: `
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
    ORDER BY tc.table_name
  `,
  
  checkConstraints: `
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
    ORDER BY tc.table_name
  `,
  
  indexes: `
    SELECT
      tablename as table_name,
      indexname as index_name,
      indexdef as index_definition
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename NOT LIKE 'pg_%'
    ORDER BY tablename, indexname
  `,
  
  triggers: `
    SELECT 
      event_object_table as table_name,
      trigger_name,
      event_manipulation as trigger_event,
      action_timing as trigger_timing,
      action_statement as trigger_action
    FROM information_schema.triggers
    WHERE trigger_schema = 'public'
    ORDER BY event_object_table
  `,
  
  rlsPolicies: `
    SELECT 
      tablename,
      policyname,
      permissive,
      roles::text as roles,
      cmd,
      COALESCE(qual::text, '') as using_expression,
      COALESCE(with_check::text, '') as with_check_expression
    FROM pg_policies
    WHERE schemaname = 'public'
    ORDER BY tablename
  `,
  
  functions: `
    SELECT 
      p.proname as function_name,
      pg_get_function_arguments(p.oid) as arguments,
      pg_get_function_result(p.oid) as return_type,
      CASE p.prosecdef 
        WHEN true THEN 'SECURITY DEFINER'
        ELSE 'SECURITY INVOKER'
      END as security,
      COALESCE(d.description, '') as function_comment
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    LEFT JOIN pg_description d ON p.oid = d.objoid
    WHERE n.nspname = 'public'
      AND p.prokind = 'f'
    ORDER BY p.proname
  `,
  
  uniqueConstraints: `
    SELECT 
      tc.table_name,
      tc.constraint_name,
      string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) as columns
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu 
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    WHERE tc.table_schema = 'public'
      AND tc.constraint_type = 'UNIQUE'
    GROUP BY tc.table_name, tc.constraint_name
    ORDER BY tc.table_name
  `
}

async function runQuery(sql: string): Promise<any[]> {
  const { data, error } = await supabase.rpc('exec_sql_to_json', { sql_query: sql })
  
  if (error) {
    console.error(`   ❌ Query error: ${error.message}`)
    return []
  }
  
  return data || []
}

async function main() {
  console.log('🔍 Extracting Database Schema from Supabase...\n')
  console.log('='.repeat(80))

  // Check if helper function exists
  const helperExists = await ensureHelperFunction()
  if (!helperExists) {
    return
  }

  let output = `# Ember Ascent - Database Schema\n\n`
  output += `**Generated:** ${new Date().toISOString()}\n\n`
  output += `---\n\n`

  // ==========================================================================
  // 1. TABLES
  // ==========================================================================
  console.log('\n📋 Fetching tables...')
  const tables = await runQuery(QUERIES.tables)
  console.log(`   Found ${tables.length} tables`)

  output += `## Tables\n\n`
  output += `| Table | Description |\n`
  output += `|-------|-------------|\n`
  for (const t of tables) {
    output += `| \`${t.table_name}\` | ${t.table_comment || '-'} |\n`
  }
  output += `\n`

  // ==========================================================================
  // 2. COLUMNS BY TABLE
  // ==========================================================================
  console.log('📊 Fetching columns...')
  const columns = await runQuery(QUERIES.columns)
  console.log(`   Found ${columns.length} columns`)

  // Group by table
  const columnsByTable: Record<string, any[]> = {}
  for (const col of columns) {
    if (!columnsByTable[col.table_name]) {
      columnsByTable[col.table_name] = []
    }
    columnsByTable[col.table_name].push(col)
  }

  output += `## Table Definitions\n\n`
  
  for (const table of tables) {
    const tableName = table.table_name
    const tableCols = columnsByTable[tableName] || []
    
    output += `### \`${tableName}\`\n\n`
    if (table.table_comment) {
      output += `> ${table.table_comment}\n\n`
    }
    
    output += `| Column | Type | Nullable | Default | Comment |\n`
    output += `|--------|------|----------|---------|----------|\n`
    
    for (const col of tableCols) {
      let typeStr = col.data_type
      if (col.character_maximum_length) {
        typeStr += `(${col.character_maximum_length})`
      } else if (col.numeric_precision) {
        typeStr += `(${col.numeric_precision})`
      }
      
      const nullable = col.is_nullable === 'YES' ? '✓' : '✗'
      const defaultVal = col.column_default ? `\`${col.column_default.substring(0, 40)}${col.column_default.length > 40 ? '...' : ''}\`` : '-'
      const comment = col.column_comment || '-'
      
      output += `| \`${col.column_name}\` | ${typeStr} | ${nullable} | ${defaultVal} | ${comment} |\n`
    }
    output += `\n`
  }

  // ==========================================================================
  // 3. PRIMARY KEYS
  // ==========================================================================
  console.log('🔑 Fetching primary keys...')
  const primaryKeys = await runQuery(QUERIES.primaryKeys)
  console.log(`   Found ${primaryKeys.length} primary keys`)

  output += `## Primary Keys\n\n`
  output += `| Table | Column |\n`
  output += `|-------|--------|\n`
  for (const pk of primaryKeys) {
    output += `| \`${pk.table_name}\` | \`${pk.column_name}\` |\n`
  }
  output += `\n`

  // ==========================================================================
  // 4. FOREIGN KEYS
  // ==========================================================================
  console.log('🔗 Fetching foreign keys...')
  const foreignKeys = await runQuery(QUERIES.foreignKeys)
  console.log(`   Found ${foreignKeys.length} foreign keys`)

  output += `## Foreign Key Relationships\n\n`
  output += `| From Table | From Column | → | To Table | To Column |\n`
  output += `|------------|-------------|---|----------|------------|\n`
  for (const fk of foreignKeys) {
    output += `| \`${fk.from_table}\` | \`${fk.from_column}\` | → | \`${fk.to_table}\` | \`${fk.to_column}\` |\n`
  }
  output += `\n`

  // ==========================================================================
  // 5. CHECK CONSTRAINTS
  // ==========================================================================
  console.log('✅ Fetching check constraints...')
  const checkConstraints = await runQuery(QUERIES.checkConstraints)
  console.log(`   Found ${checkConstraints.length} check constraints`)

  output += `## Check Constraints\n\n`
  output += `| Table | Constraint | Check Clause |\n`
  output += `|-------|------------|---------------|\n`
  for (const cc of checkConstraints) {
    const clause = cc.check_clause.length > 60 
      ? cc.check_clause.substring(0, 60) + '...' 
      : cc.check_clause
    output += `| \`${cc.table_name}\` | ${cc.constraint_name} | \`${clause}\` |\n`
  }
  output += `\n`

  // ==========================================================================
  // 6. UNIQUE CONSTRAINTS
  // ==========================================================================
  console.log('🎯 Fetching unique constraints...')
  const uniqueConstraints = await runQuery(QUERIES.uniqueConstraints)
  console.log(`   Found ${uniqueConstraints.length} unique constraints`)

  output += `## Unique Constraints\n\n`
  output += `| Table | Constraint | Columns |\n`
  output += `|-------|------------|----------|\n`
  for (const uc of uniqueConstraints) {
    output += `| \`${uc.table_name}\` | ${uc.constraint_name} | \`${uc.columns}\` |\n`
  }
  output += `\n`

  // ==========================================================================
  // 7. INDEXES
  // ==========================================================================
  console.log('📇 Fetching indexes...')
  const indexes = await runQuery(QUERIES.indexes)
  console.log(`   Found ${indexes.length} indexes`)

  output += `## Indexes\n\n`
  for (const idx of indexes) {
    output += `- **${idx.index_name}** on \`${idx.table_name}\`\n`
    output += `  \`\`\`sql\n  ${idx.index_definition}\n  \`\`\`\n`
  }
  output += `\n`

  // ==========================================================================
  // 8. TRIGGERS
  // ==========================================================================
  console.log('⚡ Fetching triggers...')
  const triggers = await runQuery(QUERIES.triggers)
  console.log(`   Found ${triggers.length} triggers`)

  output += `## Triggers\n\n`
  output += `| Table | Trigger | Event | Timing |\n`
  output += `|-------|---------|-------|--------|\n`
  for (const tr of triggers) {
    output += `| \`${tr.table_name}\` | ${tr.trigger_name} | ${tr.trigger_event} | ${tr.trigger_timing} |\n`
  }
  output += `\n`

  // ==========================================================================
  // 9. RLS POLICIES
  // ==========================================================================
  console.log('🔒 Fetching RLS policies...')
  const rlsPolicies = await runQuery(QUERIES.rlsPolicies)
  console.log(`   Found ${rlsPolicies.length} RLS policies`)

  output += `## Row Level Security Policies\n\n`
  
  // Group by table
  const policiesByTable: Record<string, any[]> = {}
  for (const p of rlsPolicies) {
    if (!policiesByTable[p.tablename]) {
      policiesByTable[p.tablename] = []
    }
    policiesByTable[p.tablename].push(p)
  }

  for (const [tableName, policies] of Object.entries(policiesByTable)) {
    output += `### \`${tableName}\`\n\n`
    for (const p of policies) {
      output += `- **${p.policyname}** (${p.cmd}, ${p.permissive})\n`
      if (p.using_expression) {
        output += `  - USING: \`${p.using_expression.substring(0, 80)}${p.using_expression.length > 80 ? '...' : ''}\`\n`
      }
      if (p.with_check_expression) {
        output += `  - WITH CHECK: \`${p.with_check_expression.substring(0, 80)}${p.with_check_expression.length > 80 ? '...' : ''}\`\n`
      }
    }
    output += `\n`
  }

  // ==========================================================================
  // 10. FUNCTIONS
  // ==========================================================================
  console.log('🔧 Fetching functions...')
  const functions = await runQuery(QUERIES.functions)
  console.log(`   Found ${functions.length} functions`)

  output += `## Database Functions\n\n`
  output += `| Function | Arguments | Returns | Security | Comment |\n`
  output += `|----------|-----------|---------|----------|----------|\n`
  for (const fn of functions) {
    const args = fn.arguments.length > 40 
      ? fn.arguments.substring(0, 40) + '...' 
      : fn.arguments
    const comment = fn.function_comment 
      ? (fn.function_comment.length > 30 ? fn.function_comment.substring(0, 30) + '...' : fn.function_comment)
      : '-'
    output += `| \`${fn.function_name}\` | ${args || '-'} | ${fn.return_type} | ${fn.security} | ${comment} |\n`
  }
  output += `\n`

  // ==========================================================================
  // WRITE OUTPUT
  // ==========================================================================
  const outputPath = path.join(process.cwd(), 'docs', 'DATABASE_SCHEMA.md')
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, output)

  console.log('\n' + '='.repeat(80))
  console.log(`\n✅ Complete schema documentation written to: docs/DATABASE_SCHEMA.md`)
  console.log(`\n📊 Summary:`)
  console.log(`   - ${tables.length} tables`)
  console.log(`   - ${columns.length} columns`)
  console.log(`   - ${foreignKeys.length} foreign keys`)
  console.log(`   - ${checkConstraints.length} check constraints`)
  console.log(`   - ${indexes.length} indexes`)
  console.log(`   - ${triggers.length} triggers`)
  console.log(`   - ${rlsPolicies.length} RLS policies`)
  console.log(`   - ${functions.length} functions`)
}

main().catch(console.error)
