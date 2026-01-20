/**
 * Question Import Script
 * 
 * Imports question JSON files into Supabase database
 * Run with: npm run import:questions
 * 
 * Required environment variables in .env.local:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY (get from Supabase project settings)
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
import { randomUUID } from 'crypto'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL')
  console.error('   Please add it to your .env.local file')
  process.exit(1)
}

if (!supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY')
  console.error('   This is required to bypass RLS and insert questions')
  console.error('\n📝 To get your service role key:')
  console.error('   1. Go to https://app.supabase.com')
  console.error('   2. Select your Ember Ascent project')
  console.error('   3. Navigate to Settings → API')
  console.error('   4. Copy the "service_role" key (NOT the anon key)')
  console.error('   5. Add to .env.local: SUPABASE_SERVICE_ROLE_KEY=your_key_here')
  console.error('\n⚠️  WARNING: Keep service role key secret - it bypasses all security!')
  process.exit(1)
}

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey)

console.log('✅ Connected to Supabase:', supabaseUrl.substring(0, 30) + '...')
console.log('✅ Using service role key\n')

interface QuestionJSON {
  id: string
  subject: string
  topic: string
  subtopic: string
  questionText: string
  questionType: string
  options: Array<{ id: string; text: string }>
  correctAnswer: string
  explanations: {
    stepByStep: string
    visual: string
    workedExample: string
  }
  difficulty: string
  yearGroup: number
  curriculumReference: string
  examBoard: string
  computationalVerification?: any
}

/**
 * Transform JSON question format to database format
 */
function transformQuestion(question: QuestionJSON) {
  return {
    id: randomUUID(), // Generate proper UUID instead of using custom ID
    subject: question.subject,
    topic: question.topic,
    subtopic: question.subtopic || null,
    question_type: question.questionType || null,
    question_text: question.questionText,
    options: question.options,
    correct_answer: question.correctAnswer,
    explanations: {
      step_by_step: question.explanations.stepByStep,
      visual: question.explanations.visual,
      worked_example: question.explanations.workedExample,
    },
    difficulty: question.difficulty,
    year_group: question.yearGroup,
    curriculum_reference: question.curriculumReference || null,
    exam_board: question.examBoard,
    ember_score: 75, // Default score - will be calculated later
    ember_score_breakdown: null,
    is_published: true,
    created_by: null,
    reviewed_by: null,
    reviewed_at: null,
  }
}

/**
 * Import questions from a JSON file
 */
async function importQuestionsFromFile(filePath: string) {
  const fileName = path.basename(filePath)
  console.log(`\n📂 Processing: ${fileName}`)

  try {
    // Read JSON file
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const questions: QuestionJSON[] = JSON.parse(fileContent)

    console.log(`   Found ${questions.length} questions`)

    // Transform and insert questions
    const transformedQuestions = questions.map(transformQuestion)

    // Insert in batches of 50 to avoid timeout
    const batchSize = 50
    let inserted = 0
    let skipped = 0

    for (let i = 0; i < transformedQuestions.length; i += batchSize) {
      const batch = transformedQuestions.slice(i, i + batchSize)

      const { data, error } = await supabase
        .from('questions')
        .insert(batch)

      if (error) {
        console.error(`   ❌ Error inserting batch ${i / batchSize + 1}:`, error.message)
        skipped += batch.length
      } else {
        inserted += batch.length
        console.log(`   ✅ Inserted batch ${i / batchSize + 1} (${batch.length} questions)`)
      }
    }

    console.log(`   📊 Summary: ${inserted} inserted, ${skipped} skipped`)
    return { inserted, skipped, total: questions.length }
  } catch (error) {
    console.error(`   ❌ Error processing file:`, error)
    return { inserted: 0, skipped: 0, total: 0 }
  }
}

/**
 * Main import function
 */
async function main() {
  console.log('🚀 Starting question import...\n')

  const questionsDir = path.join(process.cwd(), 'data', 'questions')

  // Check if directory exists
  if (!fs.existsSync(questionsDir)) {
    console.error(`❌ Questions directory not found: ${questionsDir}`)
    process.exit(1)
  }

  // Get all JSON files
  const files = fs
    .readdirSync(questionsDir)
    .filter((file) => file.endsWith('.json'))
    .map((file) => path.join(questionsDir, file))

  if (files.length === 0) {
    console.log('⚠️  No JSON files found in questions directory')
    process.exit(0)
  }

  console.log(`📁 Found ${files.length} question files:\n`)
  files.forEach((file) => console.log(`   - ${path.basename(file)}`))

  // Import each file
  let totalInserted = 0
  let totalSkipped = 0
  let totalQuestions = 0

  for (const file of files) {
    const result = await importQuestionsFromFile(file)
    totalInserted += result.inserted
    totalSkipped += result.skipped
    totalQuestions += result.total
  }

  // Final summary
  console.log('\n' + '='.repeat(60))
  console.log('✨ Import Complete!\n')
  console.log(`   Total Questions: ${totalQuestions}`)
  console.log(`   ✅ Inserted: ${totalInserted}`)
  console.log(`   ⏭️  Skipped: ${totalSkipped}`)
  console.log('='.repeat(60))

  // Verify import
  const { count, error } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true })

  if (error) {
    console.error('\n❌ Error verifying import:', error.message)
  } else {
    console.log(`\n📊 Total questions in database: ${count}`)
  }
}

// Run the script
main().catch((error) => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})
