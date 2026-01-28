/**
 * Question Generator using Claude API
 * 
 * Generates questions in batches using Claude Sonnet 4.5.
 * Each API call generates 25 questions to stay within token limits.
 * 
 * Features:
 * - Automatic answer distribution balancing
 * - JSON validation before saving
 * - Progress tracking and resumption
 * - Rate limiting (60 requests/minute)
 * 
 * @module scripts/question-generation/generate-questions
 */

import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

import Anthropic from '@anthropic-ai/sdk'
import * as fs from 'fs'
import { BatchConfig } from './batch-config.js'

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const MODEL = 'claude-sonnet-4-5-20250929'
const QUESTIONS_PER_API_CALL = 25  // Keep under token limits
const RATE_LIMIT_DELAY_MS = 1100   // ~55 requests/minute to stay under 60/min limit

/**
 * Question structure matching our database schema
 */
interface Question {
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
  correct_option: 'a' | 'b' | 'c' | 'd' | 'e'
  explanations: {
    step_by_step: string
    illustration: {
      text: string
      visual_spec: object | null
    }
    worked_example: string
  }
  curriculum_reference: string
  exam_board: string
  verification: string
}

/**
 * Build the generation prompt for a batch
 */
function buildPrompt(batch: BatchConfig, startIndex: number, count: number): string {
  const startId = startIndex + 1
  const endId = startIndex + count
  
  // Determine which answer positions to use for balanced distribution
  const answerPositions = ['a', 'b', 'c', 'd', 'e']
  const distributionHint = answerPositions.map((pos, i) => {
    const questionsForThisPos = Math.ceil(count / 5)
    const startQ = i * Math.ceil(count / 5) + 1
    const endQ = Math.min((i + 1) * Math.ceil(count / 5), count)
    return `Questions ${startQ}-${endQ}: correct_option should be "${pos}"`
  }).join('\n')

  return `You are an expert 11+ exam question generator for Ember Ascent, a UK exam preparation platform.

## GENERATION PARAMETERS

**This Batch Details:**
- Subject: ${batch.subject}
- Topic: ${batch.topic}
- Subtopic: ${batch.subtopic}
- Difficulty: ${batch.difficulty}
- Year Group: Year ${batch.yearGroup}
- Starting question_id: ${batch.subjectCode}-${batch.topicCode}-${batch.subtopicCode}-${batch.difficultyCode}-Y${batch.yearGroup}-${String(startId).padStart(5, '0')}
- Output: ${count} questions in JSON array format

**Quality Requirements:**
- Age-appropriate for ${batch.yearGroup === 5 ? '9-10' : '10-11'} year olds
- UK National Curriculum aligned
- Clear, unambiguous correct answers
- Plausible but distinctly wrong distractors
- Educational explanations that teach concepts

**🚨 CRITICAL: Answer Distribution**
To ensure balanced answer distribution, follow this pattern:
${distributionHint}

**🚨 CRITICAL: Non-Repetition**
- Generate UNIQUE questions only
- Vary question scenarios, contexts, and numbers
- Each question must be distinguishable from all others

## EXACT JSON FORMAT REQUIRED

Return ONLY a valid JSON array with ${count} questions. Each question must follow this structure:

\`\`\`json
{
  "question_id": "${batch.subjectCode}-${batch.topicCode}-${batch.subtopicCode}-${batch.difficultyCode}-Y${batch.yearGroup}-XXXXX",
  "subject": "${batch.subject}",
  "topic": "${batch.topic}",
  "subtopic": "${batch.subtopic}",
  "difficulty": "${batch.difficulty}",
  "year_group": "Year ${batch.yearGroup}",
  "question_text": "...",
  "question_type": "multiple_choice",
  "computed_answer": "...",
  "options": {
    "a": "...",
    "b": "...",
    "c": "...",
    "d": "...",
    "e": "..."
  },
  "correct_option": "a|b|c|d|e",
  "explanations": {
    "step_by_step": "1. First step\\n2. Second step\\n3. Third step\\n4. Answer: ...",
    "illustration": {
      "text": "Visual description...",
      "visual_spec": null
    },
    "worked_example": "Example: Similar problem...\\n1. Step 1\\n2. Step 2\\nAnswer: ..."
  },
  "curriculum_reference": "NC-Y${batch.yearGroup}-${batch.subjectCode}-${batch.topicCode}-001",
  "exam_board": "generic",
  "verification": "ai_generated"
}
\`\`\`

**REQUIREMENTS:**
1. EXACTLY 5 options (a, b, c, d, e) - no more, no less
2. ALL 3 explanation types required (step_by_step, illustration, worked_example)
3. Sequential question_id from ${String(startId).padStart(5, '0')} to ${String(endId).padStart(5, '0')}
4. Follow the answer distribution pattern above
5. Return ONLY the JSON array, no other text

Generate ${count} unique, high-quality ${batch.subject} questions now:`
}

/**
 * Parse JSON from Claude response, handling markdown code blocks
 */
function parseResponse(content: string): Question[] {
  // Remove markdown code blocks if present
  let jsonStr = content.trim()
  if (jsonStr.startsWith('```json')) {
    jsonStr = jsonStr.slice(7)
  } else if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.slice(3)
  }
  if (jsonStr.endsWith('```')) {
    jsonStr = jsonStr.slice(0, -3)
  }
  
  return JSON.parse(jsonStr.trim())
}

/**
 * Validate questions have correct structure and quality
 * Based on READY-TO-USE-CLAUDE-PROMPT.md requirements
 */
function validateQuestions(
  questions: Question[], 
  batch: BatchConfig, 
  startIndex: number
): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []
  const seenQuestionTexts = new Set<string>()
  const seenQuestionIds = new Set<string>()
  
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i]
    const expectedId = `${batch.subjectCode}-${batch.topicCode}-${batch.subtopicCode}-${batch.difficultyCode}-Y${batch.yearGroup}-${String(startIndex + i + 1).padStart(5, '0')}`
    const prefix = `Q${i + 1} (${q.question_id || 'NO_ID'}):`
    
    // ============================================
    // CRITICAL VALIDATIONS (Errors - Block Save)
    // ============================================
    
    // 1. Required fields
    if (!q.question_id) errors.push(`${prefix} Missing question_id`)
    if (!q.question_text) errors.push(`${prefix} Missing question_text`)
    if (!q.computed_answer) errors.push(`${prefix} Missing computed_answer`)
    if (!q.subject) errors.push(`${prefix} Missing subject`)
    if (!q.topic) errors.push(`${prefix} Missing topic`)
    if (!q.subtopic) errors.push(`${prefix} Missing subtopic`)
    if (!q.difficulty) errors.push(`${prefix} Missing difficulty`)
    if (!q.year_group) errors.push(`${prefix} Missing year_group`)
    
    // 2. Options validation (MUST have exactly 5: a, b, c, d, e)
    if (!q.options) {
      errors.push(`${prefix} Missing options object`)
    } else {
      const optionKeys = Object.keys(q.options).sort()
      if (optionKeys.length !== 5) {
        errors.push(`${prefix} Must have exactly 5 options, found ${optionKeys.length}`)
      }
      if (!['a', 'b', 'c', 'd', 'e'].every(k => k in q.options)) {
        errors.push(`${prefix} Options must be exactly a, b, c, d, e`)
      }
      // Check for empty options
      for (const key of ['a', 'b', 'c', 'd', 'e'] as const) {
        if (q.options[key] !== undefined && !q.options[key]?.toString().trim()) {
          errors.push(`${prefix} Option ${key} is empty`)
        }
      }
    }
    
    // 3. correct_option validation
    if (!q.correct_option) {
      errors.push(`${prefix} Missing correct_option`)
    } else if (!['a', 'b', 'c', 'd', 'e'].includes(q.correct_option)) {
      errors.push(`${prefix} Invalid correct_option: ${q.correct_option}`)
    }
    
    // 4. Verify computed_answer matches the selected option
    if (q.options && q.correct_option && q.computed_answer) {
      const selectedOption = q.options[q.correct_option]
      // Normalize for comparison (trim whitespace, lowercase for text comparison)
      const normalizedComputed = q.computed_answer.toString().trim().toLowerCase()
      const normalizedOption = selectedOption?.toString().trim().toLowerCase()
      if (normalizedComputed !== normalizedOption) {
        errors.push(`${prefix} computed_answer "${q.computed_answer}" doesn't match correct option ${q.correct_option}: "${selectedOption}"`)
      }
    }
    
    // 5. Explanations validation (ALL THREE REQUIRED)
    if (!q.explanations) {
      errors.push(`${prefix} Missing explanations object`)
    } else {
      if (!q.explanations.step_by_step || !q.explanations.step_by_step.trim()) {
        errors.push(`${prefix} Missing or empty step_by_step explanation`)
      }
      if (!q.explanations.illustration) {
        errors.push(`${prefix} Missing illustration explanation`)
      } else if (!q.explanations.illustration.text || !q.explanations.illustration.text.trim()) {
        errors.push(`${prefix} Missing illustration.text`)
      }
      if (!q.explanations.worked_example || !q.explanations.worked_example.trim()) {
        errors.push(`${prefix} Missing or empty worked_example explanation`)
      }
    }
    
    // 6. Duplicate detection within batch
    if (q.question_text) {
      const normalizedText = q.question_text.toLowerCase().trim()
      if (seenQuestionTexts.has(normalizedText)) {
        errors.push(`${prefix} Duplicate question text within batch`)
      }
      seenQuestionTexts.add(normalizedText)
    }
    
    // 7. Duplicate question_id detection
    if (q.question_id) {
      if (seenQuestionIds.has(q.question_id)) {
        errors.push(`${prefix} Duplicate question_id within batch`)
      }
      seenQuestionIds.add(q.question_id)
    }
    
    // ============================================
    // QUALITY WARNINGS (Don't block, but log)
    // ============================================
    
    // 8. Question ID format validation
    if (q.question_id && q.question_id !== expectedId) {
      warnings.push(`${prefix} ID mismatch - expected ${expectedId}, got ${q.question_id}`)
    }
    
    // 9. Subject/Topic consistency
    if (q.subject && q.subject !== batch.subject) {
      warnings.push(`${prefix} Subject mismatch - expected ${batch.subject}, got ${q.subject}`)
    }
    if (q.topic && q.topic !== batch.topic) {
      warnings.push(`${prefix} Topic mismatch - expected ${batch.topic}, got ${q.topic}`)
    }
    if (q.difficulty && q.difficulty !== batch.difficulty) {
      warnings.push(`${prefix} Difficulty mismatch - expected ${batch.difficulty}, got ${q.difficulty}`)
    }
    if (q.year_group && q.year_group !== `Year ${batch.yearGroup}`) {
      warnings.push(`${prefix} Year group mismatch - expected Year ${batch.yearGroup}, got ${q.year_group}`)
    }
    
    // 10. Content quality checks
    if (q.question_text && q.question_text.length < 15) {
      warnings.push(`${prefix} Question text very short (${q.question_text.length} chars)`)
    }
    if (q.question_text && q.question_text.length > 2000) {
      warnings.push(`${prefix} Question text very long (${q.question_text.length} chars)`)
    }
    
    // 11. step_by_step should have numbered steps
    if (q.explanations?.step_by_step && !q.explanations.step_by_step.includes('1.')) {
      warnings.push(`${prefix} step_by_step may be missing numbered steps`)
    }
    
    // 12. worked_example should include "Example"
    if (q.explanations?.worked_example && 
        !q.explanations.worked_example.toLowerCase().includes('example')) {
      warnings.push(`${prefix} worked_example may be missing "Example:" prefix`)
    }
    
    // 13. Check for curriculum_reference
    if (!q.curriculum_reference) {
      warnings.push(`${prefix} Missing curriculum_reference`)
    }
  }
  
  return { 
    valid: errors.length === 0, 
    errors, 
    warnings 
  }
}

/**
 * Balance answer distribution by swapping options
 */
function balanceAnswerDistribution(questions: Question[]): Question[] {
  const answerCycle = ['a', 'b', 'c', 'd', 'e'] as const
  
  return questions.map((q, i) => {
    const targetOption = answerCycle[i % 5]
    const currentOption = q.correct_option
    
    if (targetOption === currentOption) {
      return q
    }
    
    // Swap the options
    const newOptions = { ...q.options }
    const temp = newOptions[targetOption]
    newOptions[targetOption] = newOptions[currentOption]
    newOptions[currentOption] = temp
    
    return {
      ...q,
      options: newOptions,
      correct_option: targetOption
    }
  })
}

/**
 * Generate questions for a single API call
 */
async function generateQuestionsBatch(
  batch: BatchConfig, 
  startIndex: number, 
  count: number,
  retries: number = 3
): Promise<Question[]> {
  const prompt = buildPrompt(batch, startIndex, count)
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`  API call ${startIndex + 1}-${startIndex + count} (attempt ${attempt}/${retries})...`)
      
      const response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 16000,
        messages: [
          { role: 'user', content: prompt }
        ]
      })
      
      const content = response.content[0]
      if (content.type !== 'text') {
        throw new Error('Unexpected response type')
      }
      
      const questions = parseResponse(content.text)
      const validation = validateQuestions(questions, batch, startIndex)
      
      // Log warnings (but don't block)
      if (validation.warnings.length > 0) {
        console.log(`  ⚠️ Warnings (${validation.warnings.length}):`, validation.warnings.slice(0, 3).join('; '))
      }
      
      if (!validation.valid) {
        console.error(`  ❌ Validation errors (${validation.errors.length}):`)
        validation.errors.slice(0, 5).forEach(e => console.error(`     - ${e}`))
        if (attempt < retries) {
          console.log(`  Retrying...`)
          await sleep(2000)
          continue
        }
      }
      
      // Balance answer distribution
      const balancedQuestions = balanceAnswerDistribution(questions)
      
      console.log(`  ✓ Generated ${balancedQuestions.length} questions`)
      return balancedQuestions
      
    } catch (error) {
      console.error(`  ❌ Error:`, error instanceof Error ? error.message : error)
      if (attempt < retries) {
        console.log(`  Retrying in 5 seconds...`)
        await sleep(5000)
      } else {
        throw error
      }
    }
  }
  
  throw new Error(`Failed after ${retries} retries`)
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Ensure directory exists
 */
function ensureDirectoryExists(filePath: string): void {
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

/**
 * Generate all questions for a batch
 */
export async function generateBatch(batch: BatchConfig): Promise<Question[]> {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`📦 BATCH ${batch.batchNumber}: ${batch.subject} - ${batch.topic} - ${batch.subtopic}`)
  console.log(`   Year ${batch.yearGroup} | ${batch.difficulty} | ${batch.questionsPerBatch} questions`)
  console.log(`${'='.repeat(60)}`)
  
  const allQuestions: Question[] = []
  const totalQuestions = batch.questionsPerBatch
  let generated = 0
  
  while (generated < totalQuestions) {
    const remaining = totalQuestions - generated
    const batchSize = Math.min(QUESTIONS_PER_API_CALL, remaining)
    
    const questions = await generateQuestionsBatch(batch, generated, batchSize)
    allQuestions.push(...questions)
    generated += questions.length
    
    console.log(`   Progress: ${generated}/${totalQuestions} (${Math.round(generated/totalQuestions*100)}%)`)
    
    // Rate limiting
    if (generated < totalQuestions) {
      await sleep(RATE_LIMIT_DELAY_MS)
    }
  }
  
  // Save to file
  const filePath = path.join(process.cwd(), batch.filePath)
  ensureDirectoryExists(filePath)
  fs.writeFileSync(filePath, JSON.stringify(allQuestions, null, 2))
  
  console.log(`\n✅ Batch ${batch.batchNumber} complete: ${allQuestions.length} questions`)
  console.log(`   Saved to: ${batch.filePath}`)
  
  // Verify distribution
  const dist = { a: 0, b: 0, c: 0, d: 0, e: 0 }
  allQuestions.forEach(q => dist[q.correct_option]++)
  console.log(`   Answer distribution:`, dist)
  
  return allQuestions
}

/**
 * Main entry point for CLI usage
 */
async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.log(`
Usage: npx ts-node scripts/question-generation/generate-questions.ts <batch_number>

Examples:
  npx ts-node scripts/question-generation/generate-questions.ts 47
  npx ts-node scripts/question-generation/generate-questions.ts 1-10
  npx ts-node scripts/question-generation/generate-questions.ts all
`)
    process.exit(1)
  }
  
  // Dynamic import to avoid circular dependency
  const { BATCH_CONFIGS, getBatch } = await import('./batch-config.js')
  
  const batchArg = args[0]
  
  if (batchArg === 'all') {
    console.log(`🚀 Starting generation of ALL ${BATCH_CONFIGS.length} batches...`)
    for (const batch of BATCH_CONFIGS) {
      await generateBatch(batch)
    }
  } else if (batchArg.includes('-')) {
    const [start, end] = batchArg.split('-').map(Number)
    console.log(`🚀 Starting generation of batches ${start}-${end}...`)
    for (let i = start; i <= end; i++) {
      const batch = getBatch(i)
      if (batch) {
        await generateBatch(batch)
      } else {
        console.error(`❌ Batch ${i} not found`)
      }
    }
  } else {
    const batchNumber = parseInt(batchArg)
    const batch = getBatch(batchNumber)
    if (!batch) {
      console.error(`❌ Batch ${batchNumber} not found`)
      process.exit(1)
    }
    await generateBatch(batch)
  }
  
  console.log('\n🎉 Generation complete!')
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error)
}

export { Question, buildPrompt, validateQuestions, balanceAnswerDistribution }
