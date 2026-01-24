'use server'

/**
 * Question Admin Server Actions
 */

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { logAdminAction } from '@/lib/admin/auditLog'

export interface QuestionFilters {
  search?: string
  subjects?: string[]
  difficulties?: string[]
  reviewStatuses?: string[]
  isPublished?: boolean
  minScore?: number
  maxScore?: number
}

export interface PaginationOptions {
  page?: number
  pageSize?: number
  sortField?: string
  sortDirection?: 'asc' | 'desc'
}

export interface QuestionPayload {
  subject: string
  topic: string
  difficulty: string
  question_text: string
  options: { id: string; text: string }[]
  correct_answer: string
  explanations: Record<string, string>
  year_group?: number | null
  curriculum_reference?: string | null
  exam_board?: string | null
  ember_score?: number | null
  is_published?: boolean
}

export async function getQuestions(
  filters: QuestionFilters = {},
  pagination: PaginationOptions = {}
) {
  const supabase = await createClient()
  const page = pagination.page ?? 1
  const pageSize = pagination.pageSize ?? 25
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('questions')
    .select('*', { count: 'exact' })
    .order(pagination.sortField ?? 'updated_at', {
      ascending: (pagination.sortDirection ?? 'desc') === 'asc',
    })
    .range(from, to)

  if (filters.search) {
    query = query.ilike('question_text', `%${filters.search}%`)
  }

  if (filters.subjects && filters.subjects.length > 0) {
    query = query.in('subject', filters.subjects)
  }

  if (filters.difficulties && filters.difficulties.length > 0) {
    query = query.in('difficulty', filters.difficulties)
  }

  if (filters.reviewStatuses && filters.reviewStatuses.length > 0) {
    query = query.in('review_status', filters.reviewStatuses)
  }

  if (typeof filters.isPublished === 'boolean') {
    query = query.eq('is_published', filters.isPublished)
  }

  if (typeof filters.minScore === 'number') {
    query = query.gte('ember_score', filters.minScore)
  }

  if (typeof filters.maxScore === 'number') {
    query = query.lte('ember_score', filters.maxScore)
  }

  const { data, error, count } = await query

  if (error) {
    console.error('Failed to fetch questions', error)
    return { data: [], count: 0 }
  }

  return { data: data ?? [], count: count ?? 0 }
}

export async function getQuestion(questionId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('id', questionId)
    .single()

  if (error || !data) {
    console.error('Question not found', error)
    return null
  }

  return data
}

export async function createQuestion(payload: QuestionPayload, adminId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('questions')
    .insert(payload as any)
    .select()
    .single()

  if (error || !data) {
    console.error('Failed to create question', error)
    return { success: false, error: 'Unable to create question' }
  }

  await logAdminAction({
    adminId,
    action: 'Created question',
    entityType: 'question',
    entityId: data.id,
    changes: { subject: data.subject, difficulty: data.difficulty },
  })

  revalidatePath('/admin/questions')
  return { success: true, id: data.id }
}

export async function updateQuestion(questionId: string, updates: Partial<QuestionPayload>, adminId: string) {
  const supabase = await createClient()
  const { error } = await (supabase
    .from('questions') as any)
    .update(updates)
    .eq('id', questionId)

  if (error) {
    console.error('Failed to update question', error)
    return { success: false, error: 'Unable to update question' }
  }

  await logAdminAction({
    adminId,
    action: 'Updated question',
    entityType: 'question',
    entityId: questionId,
    changes: updates,
  })

  revalidatePath('/admin/questions')
  revalidatePath(`/admin/questions/${questionId}`)
  return { success: true }
}

export async function deleteQuestion(questionId: string, adminId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('questions')
    .update({ is_published: false } as any)
    .eq('id', questionId)

  if (error) {
    console.error('Failed to soft delete question', error)
    return { success: false, error: 'Unable to delete question' }
  }

  await logAdminAction({
    adminId,
    action: 'Soft deleted question',
    entityType: 'question',
    entityId: questionId,
  })

  revalidatePath('/admin/questions')
  return { success: true }
}

export async function bulkUpdateQuestions(questionIds: string[], updates: Partial<QuestionPayload>, adminId: string) {
  const supabase = await createClient()
  const { error } = await (supabase
    .from('questions') as any)
    .update(updates)
    .in('id', questionIds)

  if (error) {
    console.error('Failed to bulk update questions', error)
    return { success: false, error: 'Unable to update selected questions' }
  }

  await logAdminAction({
    adminId,
    action: 'Bulk updated questions',
    entityType: 'question',
    changes: { questionIds, updates },
  })

  revalidatePath('/admin/questions')
  return { success: true }
}

export async function bulkDeleteQuestions(questionIds: string[], adminId: string) {
  const supabase = await createClient()
  const { error } = await (supabase
    .from('questions') as any)
    .update({ is_published: false })
    .in('id', questionIds)

  if (error) {
    console.error('Failed to bulk delete questions', error)
    return { success: false, error: 'Unable to delete selected questions' }
  }

  await logAdminAction({
    adminId,
    action: 'Bulk deleted questions',
    entityType: 'question',
    changes: { questionIds },
  })

  revalidatePath('/admin/questions')
  return { success: true }
}
