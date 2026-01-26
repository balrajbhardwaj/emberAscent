#!/usr/bin/env node
/**
 * Y3 Question Reimport Script - Clean Import with Duplicate Detection & Rejection Tracking
 * 
 * This script:
 * 1. Reads Y3 questions from Prompts/QuestionBank/Claude/ember-ascent-Y3-question-bank/
 * 2. Uses duplicate-detection-utils to ensure quality
 * 3. Imports only unique, valid questions
 * 4. Logs rejected questions to data/questions/y3-rejected-questions.json with rejection reasons
 * 5. Reports detailed statistics
 * 
 * Run: npx tsx scripts/reimport-y3-clean.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
import {
  findDuplicateExternalIds,
  findDuplicateContent,
  removeDuplicatesFromBatch,
  getExistingExternalIds
} from './duplicate-detection-utils'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const SYSTEM_PROFILE_ID = 'a0000000-0000-0000-0000-000000000001'
const SOURCE_DIR = path.join(process.cwd(), 'Prompts', 'QuestionBank', 'Claude', 'ember-ascent-Y3-question-bank')
const REJECT_FILE = path.join(process.cwd(), 'data', 'questions', 'y3-rejected-questions.json')

// Track rejected questions
interface RejectedQuestion {
  rejection_reason: string
  question_id: string
  subject: string
  topic: string
  question_text: string
  difficulty: string
  source_file: string
  rejected_at: string
}

const rejectedQuestions: RejectedQuestion[] = []

console.log('🚀 Y3 Question Clean Reimport with Rejection Tracking')
console.log('======================================================\n')
console.log('📁 Source Directory:', SOURCE_DIR)
console.log('📝 Rejected Log:', REJECT_FILE)
console.log('✅ Connected to Supabase\n')

interface Y3QuestionJSON {
  question_id: string
  subject: string
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
  }
  correct_option: string
  explanations?: {
    step_by_step?: string
    visual?: string
    worked_example?: string
  }
  explanation?: string
  difficulty: string
  year_group: string
  curriculum_reference?: string
  exam_board?: string
}

function transformOptions(options: Y3QuestionJSON['options']): Array<{ id: string; text: string }> {
  const keys: Array<keyof typeof options> = ['a', 'b', 'c', 'd', 'e']
  return keys.map(key => ({
    id: key.toUpperCase(),
    text: options[key] || ''
  }))
}

function mapSubject(subject: string): string {
  const lower = subject.toLowerCase()
  if (lower.includes('math')) return 'mathematics'
  if (lower.includes('eng')) return 'english'
  if (lower.includes('verbal')) return 'verbal_reasoning'
  return 'mathematics'
}

function mapDifficulty(difficulty: string): string {
  const lower = difficulty.toLowerCase()
  if (lower.includes('found')) return 'foundation'
  if (lower.includes('stand')) return 'standard'
  if (lower.includes('chall')) return 'challenge'
  return 'foundation'
}

function transformExplanation(question: Y3QuestionJSON): any {
  if (question.explanations) {
    return {
      step_by_step: question.explanations.step_by_step || '',
      visual: question.explanations.visual || '',
      worked_example: question.explanations.worked_example || ''
    }
  }
  
  if (question.explanation) {
    return {
      step_by_step: question.explanation,
      visual: 'See step-by-step explanation',
      worked_example: question.explanation
    }
  }
  
  return {
    step_by_step: 'Solution steps not provided',
    visual: 'Visual explanation not provided',
    worked_example: 'Example not provided'
  }
}

function transformY3Question(question: Y3QuestionJSON) {
  return {
    external_id: question.question_id,
    subject: mapSubject(question.subject),
    topic: question.topic,
    subtopic: question.subtopic || null,
    question_type: question.question_type || null,
    question_text: question.question_text,
    options: transformOptions(question.options),
    correct_answer: question.correct_option.toUpperCase(),
    explanations: transformExplanation(question),
    difficulty: mapDifficulty(question.difficulty),
    year_group: 3,
    curriculum_reference: question.curriculum_reference || null,
    exam_board: question.exam_board?.toLowerCase() || 'generic',
    ember_score: 66,
    is_published: true,
    created_by: SYSTEM_PROFILE_ID,
    reviewed_by: null,
    reviewed_at: null,
  }
}

async function importFileWithDuplicateDetection(filePath: string): Promise<{
  inserted: number
  skipped: number
  removed: number
  errors: number
  total: number
  original: number
}> {
  const fileName = path.basename(filePath)
  console.log(`\n📂 Processing: ${fileName}`)

  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    let jsonData = JSON.parse(fileContent)

    let questions: Y3QuestionJSON[] = Array.isArray(jsonData) ? jsonData : jsonData.questions || [jsonData]
    const originalCount = questions.length

    console.log(`   Found ${questions.length} questions`)

    if (questions.length === 0) {
      console.log('   ⚠️  Empty file, skipping')
      return { inserted: 0, skipped: 0, removed: 0, errors: 0, total: 0, original: 0 }
    }

    // Duplicate detection
    const dupIds = findDuplicateExternalIds(questions)
    const dupContent = findDuplicateContent(questions)

    // Track what we've seen for rejection logging
    const seenExternalIds = new Set<string>()
    const seenContent = new Set<string>()

    if (dupIds.size > 0) {
      console.log(`   ⚠️  ${dupIds.size} duplicate external_ids found`)
      for (const [id, count] of Array.from(dupIds.entries()).slice(0, 3)) {
        console.log(`      - ${id} (×${count})`)
      }
    }

    if (dupContent.size > 0) {
      console.log(`   ⚠️  ${dupContent.size} duplicate contents found`)
    }

    // Log rejected duplicates BEFORE removing them
    for (const q of questions) {
      const isDupId = seenExternalIds.has(q.question_id)
      const optionsStr = JSON.stringify([q.options.a, q.options.b, q.options.c, q.options.d, q.options.e].sort())
      const contentKey = `${q.question_text}||${q.correct_option}||${optionsStr}`
      const isDupContent = seenContent.has(contentKey)
      
      if (isDupId || isDupContent) {
        rejectedQuestions.push({
          rejection_reason: isDupId ? 'Duplicate external_id within batch' : 'Duplicate content within batch',
          question_id: q.question_id,
          subject: q.subject,
          topic: q.topic,
          question_text: q.question_text.substring(0, 100),
          difficulty: q.difficulty,
          source_file: fileName,
          rejected_at: new Date().toISOString()
        })
      }
      
      seenExternalIds.add(q.question_id)
      seenContent.add(contentKey)
    }

    // Remove duplicates
    const { cleaned, removed } = removeDuplicatesFromBatch(questions)
    if (removed > 0) {
      console.log(`   🧹 Removed ${removed} duplicates from batch`)
      questions = cleaned
    }

    // Transform
    const transformedQuestions = questions.map(transformY3Question)

    // Check database
    const externalIds = transformedQuestions.map(q => q.external_id).filter(id => id != null)
    const existingIds = await getExistingExternalIds(supabase, externalIds)

    const newQuestions = transformedQuestions.filter(q => !existingIds.has(q.external_id))
    const skippedCount = transformedQuestions.length - newQuestions.length
    
    // Log skipped questions (already in database)
    for (const q of transformedQuestions) {
      if (existingIds.has(q.external_id)) {
        const origQ = questions.find(oq => oq.question_id === q.external_id)
        if (origQ) {
          rejectedQuestions.push({
            rejection_reason: 'Already exists in database',
            question_id: origQ.question_id,
            subject: origQ.subject,
            topic: origQ.topic,
            question_text: origQ.question_text.substring(0, 100),
            difficulty: origQ.difficulty,
            source_file: fileName,
            rejected_at: new Date().toISOString()
          })
        }
      }
    }

    // Insert in batches
    const batchSize = 50
    let inserted = 0
    let errors = 0

    for (let i = 0; i < newQuestions.length; i += batchSize) {
      const batch = newQuestions.slice(i, i + batchSize)
      process.stdout.write(`   Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(newQuestions.length / batchSize)}... `)

      try {
        const { data, error } = await supabase
          .from('questions')
          .insert(batch)
          .select('id, external_id')

        if (error) {
          console.log(`❌ ${error.message}`)
          errors += batch.length
          
          // Log database errors
          for (const q of batch) {
            const origQ = questions.find(oq => oq.question_id === q.external_id)
            if (origQ) {
              rejectedQuestions.push({
                rejection_reason: `Database error: ${error.message}`,
                question_id: origQ.question_id,
                subject: origQ.subject,
                topic: origQ.topic,
                question_text: origQ.question_text.substring(0, 100),
                difficulty: origQ.difficulty,
                source_file: fileName,
                rejected_at: new Date().toISOString()
              })
            }
          }
        } else {
          const count = data?.length || batch.length
          inserted += count
          console.log(`✅ ${count}`)
        }
      } catch (err: any) {
        console.log(`❌ ${err.message}`)
        errors += batch.length
        
        // Log exceptions
        for (const q of batch) {
          const origQ = questions.find(oq => oq.question_id === q.external_id)
          if (origQ) {
            rejectedQuestions.push({
              rejection_reason: `Exception: ${err.message}`,
              question_id: origQ.question_id,
              subject: origQ.subject,
              topic: origQ.topic,
              question_text: origQ.question_text.substring(0, 100),
              difficulty: origQ.difficulty,
              source_file: fileName,
              rejected_at: new Date().toISOString()
            })
          }
        }
      }
    }

    console.log(`\n   📊 Results:`)
    console.log(`      ✅ Inserted: ${inserted}`)
    if (skippedCount > 0) console.log(`      ⏭️  Skipped: ${skippedCount}`)
    if (removed > 0) console.log(`      🧹 Removed: ${removed}`)
    if (errors > 0) console.log(`      ❌ Errors: ${errors}`)

    return {
      inserted,
      skipped: skippedCount,
      removed,
      errors,
      total: questions.length,
      original: originalCount
    }

  } catch (error: any) {
    console.error(`   ❌ Failed: ${error.message}`)
    return { inserted: 0, skipped: 0, removed: 0, errors: 1, total: 0, original: 0 }
  }
}

async function main() {
  // Check source directory
  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`❌ Source directory not found: ${SOURCE_DIR}`)
    process.exit(1)
  }

  const mathsDir = path.join(SOURCE_DIR, 'maths-Y3')
  const englishDir = path.join(SOURCE_DIR, 'english-Y3')

  if (!fs.existsSync(mathsDir) || !fs.existsSync(englishDir)) {
    console.error('❌ Missing maths-Y3 or english-Y3 subdirectories')
    process.exit(1)
  }

  // Get all JSON files
  const mathsFiles = fs.readdirSync(mathsDir)
    .filter(f => f.endsWith('.json'))
    .map(f => path.join(mathsDir, f))

  const englishFiles = fs.readdirSync(englishDir)
    .filter(f => f.endsWith('.json'))
    .map(f => path.join(englishDir, f))

  const allFiles = [...mathsFiles, ...englishFiles]

  console.log(`📚 Found ${allFiles.length} JSON files to import`)
  console.log(`   - Maths: ${mathsFiles.length} files`)
  console.log(`   - English: ${englishFiles.length} files\n`)

  // Import each file
  let totalInserted = 0
  let totalSkipped = 0
  let totalRemoved = 0
  let totalErrors = 0
  let totalProcessed = 0
  let totalOriginal = 0

  for (const filePath of allFiles) {
    const result = await importFileWithDuplicateDetection(filePath)
    totalInserted += result.inserted
    totalSkipped += result.skipped
    totalRemoved += result.removed
    totalErrors += result.errors
    totalProcessed += result.total
    totalOriginal += result.original
  }

  // Save rejected questions to file
  if (rejectedQuestions.length > 0) {
    const rejectDir = path.dirname(REJECT_FILE)
    if (!fs.existsSync(rejectDir)) {
      fs.mkdirSync(rejectDir, { recursive: true })
    }
    
    fs.writeFileSync(REJECT_FILE, JSON.stringify(rejectedQuestions, null, 2))
    console.log(`\n📝 Saved ${rejectedQuestions.length} rejected questions to:`)
    console.log(`   ${REJECT_FILE}`)
  }

  // Final summary
  const successRate = totalProcessed > 0 ? (totalInserted / totalProcessed * 100).toFixed(1) : '0.0'
  const importRate = totalOriginal > 0 ? (totalInserted / totalOriginal * 100).toFixed(1) : '0.0'
  
  console.log('\n' + '='.repeat(60))
  console.log('📊 FINAL SUMMARY')
  console.log('='.repeat(60))
  console.log(`📥 Original Questions: ${totalOriginal}`)
  console.log(`🧹 Duplicates Removed: ${totalRemoved} (${((totalRemoved / totalOriginal) * 100).toFixed(1)}%)`)
  console.log(`📦 After Cleaning:     ${totalProcessed}`)
  console.log()
  console.log(`✅ Inserted:           ${totalInserted}`)
  console.log(`⏭️  Skipped (DB):        ${totalSkipped}`)
  console.log(`❌ Errors:             ${totalErrors}`)
  console.log(`📝 Rejected:           ${rejectedQuestions.length}`)
  console.log()
  console.log(`📈 Import Success:     ${successRate}% (${totalInserted}/${totalProcessed} cleaned)`)
  console.log(`📊 Overall Rate:       ${importRate}% (${totalInserted}/${totalOriginal} original)`)
  console.log('='.repeat(60))

  console.log('\n✅ Import complete!')
  
  if (rejectedQuestions.length > 0) {
    console.log(`\n⚠️  ${rejectedQuestions.length} questions were rejected`)
    console.log(`   Review: ${REJECT_FILE}`)
  }
  
  console.log('\n📝 Next steps:')
  console.log('   1. Run duplicate detection: scripts/find-duplicate-y3-questions.sql')
  console.log('   2. Calculate ember scores: SELECT * FROM update_all_ember_scores();')
  console.log('   3. Verify question counts and distribution')
}

main().catch(console.error)
