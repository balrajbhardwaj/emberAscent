/**
 * Question Import Utilities
 */
import { z } from 'zod'
import { chunk } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'

const optionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
})

const questionSchema = z.object({
  id: z.string().uuid().optional(),
  subject: z.string().min(2),
  topic: z.string().min(2),
  difficulty: z.enum(['foundation', 'standard', 'challenge']),
  question_text: z.string().min(10),
  options: z.array(optionSchema).min(4).max(5),
  correct_answer: z.string().min(1),
  explanations: z.record(z.string(), z.string()).optional(),
  year_group: z.number().int().min(3).max(6).optional(),
  curriculum_reference: z.string().optional(),
  exam_board: z.string().optional(),
  ember_score: z.number().min(0).max(100).optional(),
  review_status: z.string().optional(),
  is_published: z.boolean().optional(),
})

export type ImportQuestion = z.infer<typeof questionSchema>

export interface ParseResult {
  questions: unknown[]
  error?: string
}

export interface ValidationIssue {
  index: number
  message: string
}

export interface ValidationResult {
  valid: ImportQuestion[]
  invalid: ValidationIssue[]
}

export interface ImportOptions {
  publishByDefault?: boolean
  reviewStatus?: string
}

export function parseQuestionFile(contents: string): ParseResult {
  try {
    const json = JSON.parse(contents)
    if (Array.isArray(json.questions)) {
      return { questions: json.questions }
    }
    if (Array.isArray(json)) {
      return { questions: json }
    }
    return { questions: [], error: 'File must contain a questions array' }
  } catch {
    return { questions: [], error: 'Invalid JSON payload' }
  }
}

export function validateQuestions(rawQuestions: unknown[]): ValidationResult {
  const valid: ImportQuestion[] = []
  const invalid: ValidationIssue[] = []

  rawQuestions.forEach((question, index) => {
    const result = questionSchema.safeParse(question)
    if (!result.success) {
      invalid.push({ index, message: result.error.issues.map((issue) => issue.message).join(', ') })
      return
    }

    const payload = result.data
    if (!payload.options.some((option) => option.id === payload.correct_answer)) {
      invalid.push({ index, message: 'Correct answer must match an option id' })
      return
    }

    valid.push(payload)
  })

  return { valid, invalid }
}

export async function importQuestions(validQuestions: ImportQuestion[], options: ImportOptions = {}) {
  const supabase = await createClient()
  const batches = chunk(validQuestions, 50)
  const results: { inserted: number; errors: string[] } = { inserted: 0, errors: [] }

  for (const batch of batches) {
    const payload = batch.map((question) => ({
      ...question,
      is_published: question.is_published ?? options.publishByDefault ?? false,
      review_status: question.review_status ?? options.reviewStatus ?? 'ai_only',
    }))

    const { error, count } = await supabase
      .from('questions')
      .insert(payload as any, { count: 'exact' })

    if (error) {
      results.errors.push(error.message)
    } else {
      results.inserted += count ?? payload.length
    }
  }

  return results
}
