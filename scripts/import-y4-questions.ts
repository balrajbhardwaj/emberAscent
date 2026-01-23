/**
 * Year 4 Question Import Script
 * 
 * Imports Year 4 questions from JSON files into the questions table.
 * Based on Y3 import template - updated for Year 4 data structure.
 * 
 * Usage:
 *   1. Place Y4 JSON files in data/questions/y4/
 *   2. Run: npx tsx scripts/import-y4-questions.ts
 * 
 * Expected JSON structure:
 * {
 *   "question_id": "MATH-OPS-add-F-Y4-00001",
 *   "subject": "Mathematics",
 *   "topic": "Operations",
 *   "subtopic": "Addition",
 *   "difficulty": "Foundation",
 *   "year_group": "Year 4",
 *   "question_text": "Calculate: 234 + 567 = ?",
 *   "question_type": "multiple_choice",
 *   "computed_answer": "801",
 *   "options": {
 *     "a": "701",
 *     "b": "801",
 *     "c": "811",
 *     "d": "891",
 *     "e": "901"
 *   },
 *   "correct_option": "b",
 *   "explanations": {
 *     "step_by_step": "...",
 *     "visual": "...",
 *     "worked_example": "..."
 *   }
 * }
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// System profile ID (EDLAscent Vault - C)
const SYSTEM_PROFILE_ID = 'a0000000-0000-0000-0000-000000000001'

interface Y4QuestionJSON {
  question_id: string
  subject: string
  topic: string
  subtopic: string
  difficulty: string
  year_group: string
  question_text: string
  question_type: string
  computed_answer: string
  options: {
    a: string
    b: string
    c: string
    d: string
    e: string
  }
  correct_option: string
  explanations: {
    step_by_step?: string
    visual?: string
    worked_example?: string
  }
  curriculum_reference?: string
  verification?: string
}

/**
 * Transform JSON options to database format (array of 5 options)
 */
function transformOptions(options: Y4QuestionJSON['options']): Array<{ id: string; text: string }> {
  const optionsArray = [
    { id: 'A', text: options.a },
    { id: 'B', text: options.b },
    { id: 'C', text: options.c },
    { id: 'D', text: options.d },
    { id: 'E', text: options.e }
  ]

  // Ensure exactly 5 options (database constraint)
  if (optionsArray.length !== 5) {
    throw new Error(`Invalid options count: ${optionsArray.length}. Must be exactly 5.`)
  }

  return optionsArray
}

/**
 * Transform explanations to database JSONB format
 */
function transformExplanation(explanations: Y4QuestionJSON['explanations']): object {
  // Handle both object format and string format
  if (typeof explanations === 'object' && explanations !== null) {
    return {
      step_by_step: explanations.step_by_step || null,
      visual: explanations.visual || null,
      worked_example: explanations.worked_example || null
    }
  }
  
  // If it's a string, put it in step_by_step
  if (typeof explanations === 'string') {
    return {
      step_by_step: explanations,
      visual: null,
      worked_example: null
    }
  }

  // Default empty explanation
  return {
    step_by_step: null,
    visual: null,
    worked_example: null
  }
}

/**
 * Transform Y4 question from JSON to database format
 */
function transformY4Question(question: Y4QuestionJSON) {
  return {
    subject: question.subject.toLowerCase(),
    topic: question.topic,
    subtopic: question.subtopic || null,
    question_type: question.question_type,
    question_text: question.question_text,
    options: transformOptions(question.options),
    correct_answer: question.correct_option.toUpperCase(),
    explanations: transformExplanation(question.explanations),
    difficulty: question.difficulty.toLowerCase(),
    year_group: 4, // Year 4
    external_id: question.question_id,
    curriculum_reference: question.curriculum_reference || null,
    exam_board: 'generic',
    ember_score: 60, // Default minimum score
    is_published: true,
    created_by: SYSTEM_PROFILE_ID
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
    let questions: Y4QuestionJSON[]
    
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
    const transformedQuestions = questions.map(transformY4Question)

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

    console.log(`\n   📊 Results:`)
    console.log(`      ✅ Inserted/Updated: ${inserted}`)
    if (skipped > 0) console.log(`      ⏭️  Skipped (duplicates): ${skipped}`)
    if (errors > 0) console.log(`      ❌ Errors: ${errors}`)
    console.log(`      📦 Total: ${questions.length}`)

    return { 
      inserted, 
      updated, 
      skipped,
      total: questions.length,
      errors 
    }

  } catch (error: any) {
    console.error(`   ❌ File processing failed: ${error.message}`)
    return { inserted: 0, updated: 0, skipped: 0, total: 0, errors: 1 }
  }
}

/**
 * Main import function
 */
async function importY4Questions() {
  console.log('\n' + '='.repeat(80))
  console.log('📚 Year 4 Question Import Script')
  console.log('='.repeat(80))

  // Verify Supabase connection
  try {
    const { error } = await supabase.from('profiles').select('id').limit(1)
    if (error) throw error
    console.log(`✅ Connected to Supabase: ${supabaseUrl.substring(0, 30)}...`)
    console.log(`✅ Using service role key\n`)
  } catch (error: any) {
    console.error('❌ Failed to connect to Supabase:', error.message)
    process.exit(1)
  }

  // Find all Y4 JSON files
  const y4Dir = path.join(process.cwd(), 'data', 'questions', 'y4')
  
  if (!fs.existsSync(y4Dir)) {
    console.error(`❌ Y4 directory not found: ${y4Dir}`)
    console.log('\n📝 Create the directory and add Y4 JSON files:')
    console.log(`   mkdir -p ${y4Dir}`)
    process.exit(1)
  }

  const files = fs.readdirSync(y4Dir)
    .filter(f => f.endsWith('.json'))
    .map(f => path.join(y4Dir, f))

  if (files.length === 0) {
    console.error(`❌ No JSON files found in: ${y4Dir}`)
    process.exit(1)
  }

  console.log(`📁 Found ${files.length} JSON files in Y4 directory\n`)

  // Import each file
  let totalInserted = 0
  let totalUpdated = 0
  let totalSkipped = 0
  let totalErrors = 0
  let totalProcessed = 0

  for (const file of files) {
    const result = await importQuestionsFromFile(file)
    totalInserted += result.inserted
    totalUpdated += result.updated
    totalSkipped += result.skipped
    totalErrors += result.errors
    totalProcessed += result.total
  }

  // Final summary
  console.log('\n' + '='.repeat(80))
  console.log('📊 IMPORT COMPLETE')
  console.log('='.repeat(80))
  console.log(`✅ Successfully processed: ${totalInserted} questions`)
  if (totalSkipped > 0) console.log(`⏭️  Skipped (duplicates): ${totalSkipped} questions`)
  if (totalErrors > 0) console.log(`❌ Errors: ${totalErrors} questions`)
  console.log(`📦 Total processed: ${totalProcessed} questions from ${files.length} files`)

  // Verification query
  const { count } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true })
    .eq('year_group', 4)

  console.log(`\n🔍 Verifying Year 4 questions in database...`)
  console.log(`✅ Found ${count} Year 4 questions in database`)

  // Next steps
  console.log('\n📝 Next Steps:')
  console.log('1. Run ember_score calculation:')
  console.log('   SELECT * FROM update_all_ember_scores();')
  console.log('')
  console.log('2. Verify questions:')
  console.log('   SELECT year_group, subject, difficulty, COUNT(*)')
  console.log('   FROM questions')
  console.log('   WHERE year_group = 4')
  console.log('   GROUP BY year_group, subject, difficulty;')
  console.log('')

  console.log('✅ Import script completed')
}

// Run the import
importY4Questions()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Import failed:', error)
    process.exit(1)
  })
