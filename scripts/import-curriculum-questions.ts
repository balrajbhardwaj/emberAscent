/**
 * Curriculum-Aligned Question Import Script
 * 
 * Imports the 5,000 Gemini maths questions from JSON files into Supabase database.
 * Also links questions to curriculum_objectives table via question_curriculum_alignment.
 * 
 * Run with: npx tsx scripts/import-curriculum-questions.ts
 * 
 * Required environment variables in .env.local:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY (get from Supabase project settings)
 * 
 * @module scripts/import-curriculum-questions
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

/**
 * Question format from Gemini JSON files
 */
interface GeminiQuestionJSON {
  question_id: string
  subject: string
  topic: string
  subtopic: string
  difficulty: string // "Foundation" | "Standard" | "Challenge"
  year_group: string // "Year 3" | "Year 4" | "Year 5" | "Year 6"
  curriculum_ref: string // e.g., "Y3-MATH-NPV-01"
  question_text: string
  question_type: string
  options: Array<{ id: string; text: string }>
  correct_option_id: string
  working: Record<string, string>
  answer_format: string
  computed_answer: string
  explanation: string
  tags: string[]
}

/**
 * Cache for curriculum objectives
 */
const curriculumCache = new Map<string, string | null>()

/**
 * Load curriculum objectives into cache
 */
async function loadCurriculumObjectives() {
  console.log('📚 Loading curriculum objectives...')
  
  const { data, error } = await supabase
    .from('curriculum_objectives')
    .select('id, code')
  
  if (error) {
    console.error('❌ Error loading curriculum objectives:', error.message)
    return
  }
  
  if (data) {
    data.forEach(obj => {
      curriculumCache.set(obj.code, obj.id)
    })
    console.log(`   ✅ Loaded ${data.length} curriculum objectives\n`)
  }
}

/**
 * Map difficulty from JSON format to database format
 */
function mapDifficulty(difficulty: string): string {
  const map: Record<string, string> = {
    'Foundation': 'foundation',
    'Standard': 'standard',
    'Challenge': 'challenge',
    'foundation': 'foundation',
    'standard': 'standard',
    'challenge': 'challenge',
  }
  return map[difficulty] || 'standard'
}

/**
 * Extract year group number from string
 */
function parseYearGroup(yearGroup: string): number {
  const match = yearGroup.match(/(\d+)/)
  if (match) {
    const year = parseInt(match[1], 10)
    // Clamp to valid range (4-6 for 11+ prep)
    // Year 3 content maps to Year 4 (foundation level)
    if (year === 3) return 4
    if (year >= 4 && year <= 6) return year
  }
  return 5 // Default to Year 5
}

/**
 * Build step-by-step explanation from working steps
 */
function buildStepByStep(working: Record<string, string>): string {
  const steps: string[] = []
  
  // Process steps in order
  const keys = Object.keys(working).sort((a, b) => {
    // Sort step_1, step_2, etc. numerically
    const numA = parseInt(a.replace(/\D/g, '')) || 999
    const numB = parseInt(b.replace(/\D/g, '')) || 999
    return numA - numB
  })
  
  for (const key of keys) {
    const value = working[key]
    if (value && key !== 'computed_result') {
      // Format key nicely
      let label = key
        .replace(/_/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase())
      
      steps.push(`**${label}:** ${value}`)
    }
  }
  
  return steps.join('\n\n')
}

/**
 * Transform Gemini JSON question format to database format
 */
function transformQuestion(question: GeminiQuestionJSON) {
  const yearGroup = parseYearGroup(question.year_group)
  const stepByStep = buildStepByStep(question.working)
  
  return {
    id: randomUUID(),
    subject: 'mathematics', // All these are maths questions
    topic: question.topic,
    subtopic: question.subtopic || null,
    question_type: question.question_type || null,
    question_text: question.question_text,
    options: question.options,
    correct_answer: question.correct_option_id,
    explanations: {
      step_by_step: stepByStep,
      visual: null,
      worked_example: question.explanation,
    },
    difficulty: mapDifficulty(question.difficulty),
    year_group: yearGroup,
    curriculum_reference: question.curriculum_ref || null,
    exam_board: 'generic',
    // AI-generated questions start with a base ember score
    // +20 for valid curriculum ref format, +10 for AI baseline
    ember_score: question.curriculum_ref ? 66 : 56,
    ember_score_breakdown: {
      curriculum: question.curriculum_ref ? 20 : 0,
      expert: 10, // AI-only baseline
      community: 16, // Base community score
    },
    is_published: true,
    created_by: null,
    reviewed_by: null,
    reviewed_at: null,
    // Store original ID for reference
    metadata: {
      original_id: question.question_id,
      tags: question.tags,
      computed_answer: question.computed_answer,
      answer_format: question.answer_format,
    },
  }
}

/**
 * Import questions from a JSON file and link to curriculum objectives
 */
async function importQuestionsFromFile(filePath: string): Promise<{
  inserted: number
  skipped: number
  linked: number
  total: number
}> {
  const fileName = path.basename(filePath)
  console.log(`\n📂 Processing: ${fileName}`)

  try {
    // Read JSON file
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const questions: GeminiQuestionJSON[] = JSON.parse(fileContent)

    console.log(`   Found ${questions.length} questions`)

    // Transform questions
    const transformedQuestions = questions.map(transformQuestion)

    // Insert in batches of 50 to avoid timeout
    const batchSize = 50
    let inserted = 0
    let skipped = 0
    let linked = 0

    // Track question IDs and their curriculum refs for linking
    const questionsToLink: Array<{
      questionId: string
      curriculumRef: string
      curriculumCode: string
    }> = []

    for (let i = 0; i < transformedQuestions.length; i += batchSize) {
      const batch = transformedQuestions.slice(i, i + batchSize)
      const originalBatch = questions.slice(i, i + batchSize)

      // Remove metadata field before insert (not in DB schema)
      const dbBatch = batch.map(q => {
        const { metadata, ...rest } = q as any
        return rest
      })

      const { error } = await supabase
        .from('questions')
        .insert(dbBatch)
        .select('id')

      if (error) {
        console.error(`   ❌ Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error.message)
        skipped += batch.length
      } else {
        inserted += batch.length
        
        // Collect curriculum links
        batch.forEach((q, idx) => {
          const original = originalBatch[idx]
          if (original.curriculum_ref && curriculumCache.has(original.curriculum_ref)) {
            questionsToLink.push({
              questionId: q.id,
              curriculumRef: original.curriculum_ref,
              curriculumCode: original.curriculum_ref,
            })
          }
        })

        // Progress indicator every 5 batches
        if ((Math.floor(i / batchSize) + 1) % 5 === 0) {
          console.log(`   ✅ Inserted ${inserted}/${questions.length} questions...`)
        }
      }
    }

    console.log(`   📊 Questions: ${inserted} inserted, ${skipped} skipped`)

    // Link questions to curriculum objectives
    if (questionsToLink.length > 0) {
      console.log(`   🔗 Linking ${questionsToLink.length} questions to curriculum objectives...`)

      const alignments = questionsToLink.map(q => ({
        id: randomUUID(),
        question_id: q.questionId,
        objective_id: curriculumCache.get(q.curriculumCode),
        alignment_strength: 'primary',
        alignment_confidence: 80, // AI-generated alignment
        validated_by: 'ai',
      })).filter(a => a.objective_id) // Filter out any null objective IDs

      // Insert alignments in batches
      for (let i = 0; i < alignments.length; i += batchSize) {
        const batch = alignments.slice(i, i + batchSize)
        
        const { error } = await supabase
          .from('question_curriculum_alignment')
          .insert(batch)

        if (error) {
          console.error(`   ❌ Error linking batch:`, error.message)
        } else {
          linked += batch.length
        }
      }

      console.log(`   📊 Linked: ${linked} curriculum alignments created`)
    }

    return { inserted, skipped, linked, total: questions.length }
  } catch (error) {
    console.error(`   ❌ Error processing file:`, error)
    return { inserted: 0, skipped: 0, linked: 0, total: 0 }
  }
}

/**
 * Main import function
 */
async function main() {
  console.log('🚀 Starting Curriculum-Aligned Question Import\n')
  console.log('=' .repeat(60))

  // Load curriculum objectives first
  await loadCurriculumObjectives()

  // Find all question JSON files
  const questionBankPath = path.join(process.cwd(), 'Prompts', 'QuestionBank', 'Gemini', 'Maths')
  
  if (!fs.existsSync(questionBankPath)) {
    console.error(`❌ Question bank directory not found: ${questionBankPath}`)
    process.exit(1)
  }

  const jsonFiles = fs.readdirSync(questionBankPath)
    .filter(f => f.endsWith('.json'))
    .map(f => path.join(questionBankPath, f))
    .sort() // Process in order

  if (jsonFiles.length === 0) {
    console.error('❌ No JSON files found in question bank directory')
    process.exit(1)
  }

  console.log(`📁 Found ${jsonFiles.length} question files to process`)

  // Process each file
  let totalInserted = 0
  let totalSkipped = 0
  let totalLinked = 0
  let totalQuestions = 0

  for (const file of jsonFiles) {
    const result = await importQuestionsFromFile(file)
    totalInserted += result.inserted
    totalSkipped += result.skipped
    totalLinked += result.linked
    totalQuestions += result.total
  }

  // Print summary
  console.log('\n' + '=' .repeat(60))
  console.log('📊 IMPORT COMPLETE\n')
  console.log(`   Total questions in files:  ${totalQuestions}`)
  console.log(`   Successfully inserted:     ${totalInserted}`)
  console.log(`   Curriculum links created:  ${totalLinked}`)
  console.log(`   Skipped/Failed:            ${totalSkipped}`)
  console.log('\n' + '=' .repeat(60))

  // Verify counts in database
  const { count: questionCount } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true })
    .eq('subject', 'mathematics')

  const { count: alignmentCount } = await supabase
    .from('question_curriculum_alignment')
    .select('*', { count: 'exact', head: true })

  console.log('\n📈 Database State:')
  console.log(`   Maths questions in DB:     ${questionCount}`)
  console.log(`   Curriculum alignments:     ${alignmentCount}`)
}

// Run the import
main().catch(console.error)
