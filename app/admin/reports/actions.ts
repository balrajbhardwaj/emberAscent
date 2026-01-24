'use server'

/**
 * Error Reports Server Actions
 *
 * Server actions for admin error report management including:
 * - Fetching and filtering error reports
 * - Updating report status
 * - Resolving reports with fixes
 * - Question inline editing
 *
 * @module app/admin/reports/actions
 */

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { logAdminAction } from '@/lib/admin/auditLog'

export interface ReportFilters {
  status?: string[]
  reportType?: string[]
  subject?: string[]
  dateFrom?: string
  dateTo?: string
}

export interface PaginationOptions {
  page?: number
  pageSize?: number
  sortField?: string
  sortDirection?: 'asc' | 'desc'
}

export interface ErrorReport {
  id: string
  question_id: string
  user_id: string
  report_type: string
  description: string
  status: string
  assigned_to: string | null
  resolution_notes: string | null
  created_at: string
  updated_at: string
  resolved_at: string | null
}

/**
 * Fetch error reports with filters and pagination
 */
export async function getReports(
  filters: ReportFilters = {},
  pagination: PaginationOptions = {}
) {
  const supabase = await createClient()
  const page = pagination.page ?? 1
  const pageSize = pagination.pageSize ?? 25
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  // Build the query
  let query = supabase
    .from('error_reports')
    .select(
      `
      *,
      question:questions(id, subject, topic, question_text, difficulty, ember_score),
      reporter:profiles(id, email, full_name)
    `,
      { count: 'exact' }
    )
    .order(pagination.sortField ?? 'created_at', {
      ascending: (pagination.sortDirection ?? 'desc') === 'asc',
    })
    .range(from, to)

  // Apply filters
  if (filters.status && filters.status.length > 0) {
    query = query.in('status', filters.status)
  }

  if (filters.reportType && filters.reportType.length > 0) {
    query = query.in('report_type', filters.reportType)
  }

  if (filters.dateFrom) {
    query = query.gte('created_at', filters.dateFrom)
  }

  if (filters.dateTo) {
    query = query.lte('created_at', filters.dateTo)
  }

  const { data: reports, error, count } = await query

  if (error) {
    console.error('Failed to fetch error reports', error)
    return { data: [], count: 0 }
  }

  return { data: reports ?? [], count: count ?? 0 }
}

/**
 * Get detailed error report information
 */
export async function getReport(reportId: string) {
  const supabase = await createClient()

  const { data: report, error } = await supabase
    .from('error_reports')
    .select(
      `
      *,
      question:questions(*),
      reporter:profiles(id, email, full_name),
      assignee:profiles!error_reports_assigned_to_fkey(id, email, full_name)
    `
    )
    .eq('id', reportId)
    .single()

  if (error || !report) {
    console.error('Report not found', error)
    return null
  }

  return report
}

/**
 * Update report status
 */
export async function updateReportStatus(
  reportId: string,
  status: string,
  adminId: string,
  notes?: string
) {
  const supabase = await createClient()

  const updates: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  }

  if (notes) {
    updates.resolution_notes = notes
  }

  if (status === 'resolved') {
    updates.resolved_at = new Date().toISOString()
  }

  const { error } = await supabase
    .from('error_reports')
    .update(updates)
    .eq('id', reportId)

  if (error) {
    console.error('Failed to update report status', error)
    return { success: false, error: 'Unable to update report status' }
  }

  await logAdminAction({
    adminId,
    action: 'Updated error report status',
    entityType: 'error_report',
    entityId: reportId,
    changes: { status, notes },
  })

  revalidatePath('/admin/reports')
  revalidatePath(`/admin/reports/${reportId}`)

  return { success: true }
}

/**
 * Assign report to admin
 */
export async function assignReport(
  reportId: string,
  assigneeId: string,
  adminId: string
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('error_reports')
    .update({
      assigned_to: assigneeId,
      status: 'in_progress',
      updated_at: new Date().toISOString(),
    })
    .eq('id', reportId)

  if (error) {
    console.error('Failed to assign report', error)
    return { success: false, error: 'Unable to assign report' }
  }

  await logAdminAction({
    adminId,
    action: 'Assigned error report',
    entityType: 'error_report',
    entityId: reportId,
    changes: { assigned_to: assigneeId },
  })

  revalidatePath('/admin/reports')
  revalidatePath(`/admin/reports/${reportId}`)

  return { success: true }
}

/**
 * Update question (when fixing reported issue)
 */
export async function updateQuestion(
  questionId: string,
  updates: {
    question_text?: string
    option_a?: string
    option_b?: string
    option_c?: string
    option_d?: string
    option_e?: string
    correct_answer?: string
    explanation?: string
  },
  adminId: string,
  reportId?: string
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('questions')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', questionId)

  if (error) {
    console.error('Failed to update question', error)
    return { success: false, error: 'Unable to update question' }
  }

  await logAdminAction({
    adminId,
    action: 'Updated question from error report',
    entityType: 'question',
    entityId: questionId,
    changes: { ...updates, report_id: reportId },
  })

  revalidatePath('/admin/questions')
  if (reportId) {
    revalidatePath(`/admin/reports/${reportId}`)
  }

  return { success: true }
}

/**
 * Resolve report with optional question fix
 */
export async function resolveReport(
  reportId: string,
  resolutionNotes: string,
  adminId: string,
  questionUpdates?: {
    question_text?: string
    option_a?: string
    option_b?: string
    option_c?: string
    option_d?: string
    option_e?: string
    correct_answer?: string
    explanation?: string
  }
) {
  const supabase = await createClient()

  // Get report to find question ID
  const { data: report } = await supabase
    .from('error_reports')
    .select('question_id')
    .eq('id', reportId)
    .single()

  if (!report) {
    return { success: false, error: 'Report not found' }
  }

  // Update question if fixes provided
  if (questionUpdates && Object.keys(questionUpdates).length > 0) {
    const updateResult = await updateQuestion(
      report.question_id,
      questionUpdates,
      adminId,
      reportId
    )
    if (!updateResult.success) {
      return updateResult
    }
  }

  // Mark report as resolved
  const statusResult = await updateReportStatus(
    reportId,
    'resolved',
    adminId,
    resolutionNotes
  )

  return statusResult
}

/**
 * Bulk update report statuses
 */
export async function bulkUpdateReports(
  reportIds: string[],
  status: string,
  adminId: string
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('error_reports')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .in('id', reportIds)

  if (error) {
    console.error('Failed to bulk update reports', error)
    return { success: false, error: 'Unable to update reports' }
  }

  await logAdminAction({
    adminId,
    action: 'Bulk updated error reports',
    entityType: 'error_report',
    entityId: reportIds.join(','),
    changes: { status, count: reportIds.length },
  })

  revalidatePath('/admin/reports')

  return { success: true }
}
