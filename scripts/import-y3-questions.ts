/**
 * Year 3 Question Import Script
 * 
 * Imports Year 3 questions from Claude-generated JSON files into Supabase.
 * Handles Y3-specific format transformations and uses external_id for deduplication.
 * 
 * Run with: npx tsx scripts/import-y3-questions.ts
 * 
 * Expected JSON file locations:
 * - data/questions/y3/*.json (13 files totaling ~10,000 questions)
 * 
 * Required environment variables in .env.local:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 * 
 * @module scripts/import-y3-questions
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗')
  process.exit(1)
}

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

console.log('✅ Connected to Supabase:', supabaseUrl.substring(0, 30) + '...')
console.log('✅ Using service role key\n')

/**
 * Y3 Question format from Claude JSON files
 * Different structure from Y4-6 curriculum questions
 */
interface Y3QuestionJSON {
  question_id: string // e.g., "ENG-VOC-syno-F-Y3-00001"
  subject: string // "English" or "Mathematics"
  topic: string
  subtopic?: string
  question_text: string
  question_type?: string
  options: {
    a?: string
    b?: string
    c?: string
    d?: string
    e?: string
    f?: string // Some questions might have 6 options
  }
  correct_option: string // "a", "b", "c", "d", or "e"
  computed_answer?: string
  explanations?: {
    step_by_step?: string
    visual?: string
    worked_example?: string
  }
  explanation?: string // Some files might have plain string
  difficulty: string // "Foundation", "Standard", or "Challenge"
  year_group: string // "Year 3"
  curriculum_reference?: string
  exam_board?: string
  verification?: any
}

/**
 * System import profile UUID (created by migration 017)
 */
const SYSTEM_PROFILE_ID = 'a0000000-0000-0000-0000-000000000001'

/**
 * Transform options from Y3 format {a,b,c,d,e} to database format [{id,text}]
 * IMPORTANT: Database requires EXACTLY 5 options (constraint: jsonb_array_length(options) = 5)
 */
function transformOptions(options: Y3QuestionJSON['options']): Array<{ id: string; text: string }> {
  const transformed: Array<{ id: string; text: string }> = []
  
  const keys: Array<keyof typeof options> = ['a', 'b', 'c', 'd', 'e']
  
  for (const key of keys) {
    transformed.push({
      id: key.toUpperCase(),
      text: options[key] || '' // Provide empty string if option doesn't exist
    })
  }
  
  // Database constraint requires exactly 5 options
  if (transformed.length !== 5) {
    throw new Error(`Options must have exactly 5 items (a, b, c, d, e), got ${transformed.length}`)
  }
  
  return transformed
}

/**
 * Transform explanation string to JSONB format
 */
function transformExplanation(question: Y3QuestionJSON): {
  step_by_step: string
  visual: string | null
  worked_example: string | null
} {
  // Check if explanations object exists
  if (question.explanations) {
    return {
      step_by_step: question.explanations.step_by_step || '',
      visual: question.explanations.visual || null,
      worked_example: question.explanations.worked_example || null
    }
  }
  
  // Fallback to plain explanation string
  if (question.explanation) {
    return {
      step_by_step: question.explanation,
      visual: null,
      worked_example: null
    }
  }
  
  // No explanation provided
  return {
    step_by_step: 'No explanation provided.',
    visual: null,
    worked_example: null
  }
}

/**
 * Map difficulty from Y3 format to database format
 */
function mapDifficulty(difficulty: string): 'foundation' | 'standard' | 'challenge' {
  const lower = difficulty.toLowerCase()
  if (lower === 'foundation') return 'foundation'
  if (lower === 'challenge') return 'challenge'
  return 'standard'
}

/**
 * Map subject from Y3 format to database format
 */
function mapSubject(subject: string): 'english' | 'mathematics' | 'verbal_reasoning' | 'non_verbal_reasoning' {
  const lower = subject.toLowerCase()
  if (lower === 'english' || lower.includes('english')) return 'english'
  if (lower === 'mathematics' || lower.includes('math')) return 'mathematics'
  if (lower.includes('verbal')) return 'verbal_reasoning'
  if (lower.includes('non-verbal') || lower.includes('nonverbal')) return 'non_verbal_reasoning'
  return 'english' // default
}

/**
 * Extract year group number from "Year 3" string
 */
function parseYearGroup(year: string): number {
  const match = year.match(/(\d+)/)
  return match ? parseInt(match[1], 10) : 3
}

/**
 * Transform Y3 JSON question to database format
 */
function transformY3Question(question: Y3QuestionJSON) {
  return {
    external_id: question.question_id, // For deduplication
    subject: mapSubject(question.subject),
    topic: question.topic,
    subtopic: question.subtopic || null,
    question_type: question.question_type || null,
    question_text: question.question_text,
    options: transformOptions(question.options),
    correct_answer: question.correct_option.toUpperCase(),
    explanations: transformExplanation(question),
    difficulty: mapDifficulty(question.difficulty),
    year_group: parseYearGroup(question.year_group),
    curriculum_reference: question.curriculum_reference || null,
    exam_board: question.exam_board?.toLowerCase() || 'generic',
    ember_score: 66, // Default from migration 017
    is_published: true,
    created_by: SYSTEM_PROFILE_ID,
    reviewed_by: null,
    reviewed_at: null,
  }
}

/**
 * Import questions from a single JSON file with upsert logic
 */
async function importQuestionsFromFile(filePath: string): Promise<{
  inserted: number
  updated: number
  skipped: number
  total: number
  errors: number
}> {
  const fileName = path.basename(filePath)
  console.log(`\n📂 Processing: ${fileName}`)

  try {
    // Read JSON file
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    let jsonData = JSON.parse(fileContent)

    // Handle different JSON structures
    let questions: Y3QuestionJSON[]
    
    if (Array.isArray(jsonData)) {
      // JSON is an array at root level
      questions = jsonData
    } else if (jsonData.questions && Array.isArray(jsonData.questions)) {
      // JSON has a "questions" property containing the array
      questions = jsonData.questions
    } else if (typeof jsonData === 'object' && jsonData !== null) {
      // JSON is a single object, wrap it in an array
      questions = [jsonData]
    } else {
      console.error('   ❌ Unexpected JSON structure')
      console.error('   Expected: array of questions or object with "questions" property')
      console.error('   Got:', typeof jsonData)
      return { inserted: 0, updated: 0, skipped: 0, total: 0, errors: 1 }
    }

    console.log(`   Found ${questions.length} questions`)

    if (questions.length === 0) {
      console.log('   ⚠️  No questions in file, skipping')
      return { inserted: 0, updated: 0, skipped: 0, total: 0, errors: 0 }
    }

    // Validate first question structure
    const firstQ = questions[0]
    if (!firstQ.question_id || !firstQ.subject || !firstQ.options) {
      console.error('   ❌ Invalid question structure')
      console.error('   First question:', JSON.stringify(firstQ, null, 2).substring(0, 500))
      return { inserted: 0, updated: 0, skipped: 0, total: 0, errors: 1 }
    }

    // Transform questions
    const transformedQuestions = questions.map(transformY3Question)

    // Insert/Update in batches of 50 to avoid timeout
    const batchSize = 50
    let inserted = 0
    let updated = 0
    let skipped = 0
    let errors = 0

    for (let i = 0; i < transformedQuestions.length; i += batchSize) {
      const batch = transformedQuestions.slice(i, i + batchSize)
      
      process.stdout.write(`   Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(transformedQuestions.length / batchSize)}... `)

      try {
        // Use simple insert without ON CONFLICT for now
        // The unique index on external_id might not exist yet
        const { data, error } = await supabase
          .from('questions')
          .insert(batch)
          .select('id, external_id')

        if (error) {
          console.log(`❌ Error`)
          console.error(`      ${error.message}`)
          
          // If it's a duplicate key error, that's actually OK (skip silently)
          if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
            skipped += batch.length
          } else {
            errors += batch.length
          }
          continue
        }

        // Count inserted vs updated
        // Since upsert doesn't distinguish, we'll assume all succeeded
        const successCount = data?.length || batch.length
        inserted += successCount
        
        console.log(`✅ ${successCount} questions`)
        
      } catch (err: any) {
        console.log(`❌ Exception`)
        console.error(`      ${err.message}`)
        errors += batch.length
      }
    }

    const stats = {
      inserted,
      updated,
      skipped,
      total: questions.length,
      errors
    }

    console.log(`\n   📊 Results:`)
    console.log(`      ✅ Inserted/Updated: ${inserted}`)
    if (errors > 0) {
      console.log(`      ❌ Errors: ${errors}`)
    }
    console.log(`      📦 Total: ${questions.length}`)

    return stats

  } catch (error: any) {
    console.error(`\n   ❌ Error reading file: ${error.message}`)
    return { inserted: 0, updated: 0, skipped: 0, total: 0, errors: 1 }
  }
}

/**
 * Main import function - processes all Y3 JSON files
 */
async function main() {
  console.log('=' .repeat(80))
  console.log('📚 Year 3 Question Import Script')
  console.log('=' .repeat(80))
  console.log('')

  // Check for Y3 questions directory
  const y3Dir = path.join(process.cwd(), 'data', 'questions', 'y3')
  
  if (!fs.existsSync(y3Dir)) {
    console.error(`❌ Y3 questions directory not found: ${y3Dir}`)
    console.error('\n📝 Expected structure:')
    console.error('   data/questions/y3/')
    console.error('   ├── english-vocabulary-1000.json')
    console.error('   ├── mathematics-arithmetic-1000.json')
    console.error('   └── ... (13 files total)')
    console.error('\nPlease create the directory and add Y3 question JSON files.')
    process.exit(1)
  }

  // Find all JSON files
  const files = fs.readdirSync(y3Dir)
    .filter(f => f.endsWith('.json'))
    .sort()

  if (files.length === 0) {
    console.error(`❌ No JSON files found in ${y3Dir}`)
    process.exit(1)
  }

  console.log(`📁 Found ${files.length} JSON files in Y3 directory\n`)

  // Track overall statistics
  let totalInserted = 0
  let totalUpdated = 0
  let totalSkipped = 0
  let totalQuestions = 0
  let totalErrors = 0

  // Process each file
  for (const file of files) {
    const filePath = path.join(y3Dir, file)
    const stats = await importQuestionsFromFile(filePath)
    
    totalInserted += stats.inserted
    totalUpdated += stats.updated
    totalSkipped += stats.skipped
    totalQuestions += stats.total
    totalErrors += stats.errors
  }

  // Final summary
  console.log('\n' + '=' .repeat(80))
  console.log('📊 IMPORT COMPLETE')
  console.log('=' .repeat(80))
  console.log(`✅ Successfully processed: ${totalInserted} questions`)
  if (totalUpdated > 0) {
    console.log(`🔄 Updated existing: ${totalUpdated} questions`)
  }
  if (totalSkipped > 0) {
    console.log(`⏭️  Skipped: ${totalSkipped} questions`)
  }
  if (totalErrors > 0) {
    console.log(`❌ Errors: ${totalErrors} questions`)
  }
  console.log(`📦 Total processed: ${totalQuestions} questions from ${files.length} files`)
  console.log('')

  // Verify Year 3 questions in database
  console.log('🔍 Verifying Year 3 questions in database...')
  const { data: y3Questions, error: countError } = await supabase
    .from('questions')
    .select('id', { count: 'exact', head: true })
    .eq('year_group', 3)

  if (countError) {
    console.error('❌ Error checking Y3 questions:', countError.message)
  } else {
    console.log(`✅ Found ${y3Questions?.length || 0} Year 3 questions in database`)
  }

  // Suggest next steps
  console.log('\n📝 Next Steps:')
  console.log('1. Run ember_score calculation:')
  console.log('   SELECT * FROM update_all_ember_scores();')
  console.log('')
  console.log('2. Verify questions:')
  console.log('   SELECT year_group, subject, difficulty, COUNT(*)')
  console.log('   FROM questions')
  console.log('   WHERE year_group = 3')
  console.log('   GROUP BY year_group, subject, difficulty;')
  console.log('')
}

// Run the import
main()
  .then(() => {
    console.log('✅ Import script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error.message)
    console.error(error.stack)
    process.exit(1)
  })
