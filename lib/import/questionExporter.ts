/**
 * Question Export Utilities
 */
import { createClient } from '@/lib/supabase/server'

export type ExportFormat = 'json' | 'csv'

export interface QuestionExportFilters {
  subject?: string
  difficulty?: string
  isPublished?: boolean
}

export interface ExportResult {
  filename: string
  mimeType: string
  content: string
}

export async function exportQuestions(filters: QuestionExportFilters, format: ExportFormat = 'json'): Promise<ExportResult> {
  const supabase = await createClient()
  let query = supabase.from('questions').select('*')

  if (filters.subject) {
    query = query.eq('subject', filters.subject)
  }

  if (filters.difficulty) {
    query = query.eq('difficulty', filters.difficulty)
  }

  if (typeof filters.isPublished === 'boolean') {
    query = query.eq('is_published', filters.isPublished)
  }

  const { data, error } = await query.limit(1000)

  if (error || !data) {
    throw new Error(error?.message ?? 'Unable to export questions')
  }

  if (format === 'json') {
    return {
      filename: 'questions.json',
      mimeType: 'application/json',
      content: JSON.stringify({ questions: data }, null, 2),
    }
  }

  const headers = [
    'id',
    'subject',
    'topic',
    'difficulty',
    'question_text',
    'correct_answer',
    'is_published',
    'ember_score',
  ]

  const rows = data.map((question: any) =>
    headers
      .map((header) => {
        const value = question[header] ?? ''
        return typeof value === 'string' ? value.replace(/"/g, '""') : value
      })
      .join(',')
  )

  const csv = [headers.join(','), ...rows].join('\n')

  return {
    filename: 'questions.csv',
    mimeType: 'text/csv',
    content: csv,
  }
}
