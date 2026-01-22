/**
 * Apply Analytics Calculation Functions Migration
 * 
 * Applies the 011_analytics_calculations.sql migration to push all
 * analytics computations to the database layer per architecture guidelines.
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function applyMigration() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  console.log('📊 Applying analytics calculations migration...')

  const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '011_analytics_calculations.sql')
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8')

  // Split by function definitions
  const functionBlocks = migrationSQL.split(/(?=CREATE OR REPLACE FUNCTION)/)

  for (const block of functionBlocks) {
    if (block.trim().length === 0) continue

    try {
      const { error } = await supabase.rpc('exec_sql', { sql: block })
      if (error) {
        console.error('❌ Error executing block:', error.message)
      } else {
        const functionName = block.match(/FUNCTION\s+public\.(\w+)/)?.[1]
        if (functionName) {
          console.log(`✅ Applied: ${functionName}`)
        }
      }
    } catch (err) {
      console.error('❌ Failed to execute block:', err)
    }
  }

  console.log('✅ Migration complete!')
}

applyMigration().catch(console.error)
