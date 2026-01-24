/**
 * Admin Audit Log Utilities
 *
 * Provides helper functions for recording and retrieving admin activity.
 * All functions run on the server and rely on Supabase RLS to enforce access.
 *
 * @module lib/admin/auditLog
 */

import { createClient } from '@/lib/supabase/server'

export type AdminRole = 'user' | 'reviewer' | 'admin' | 'super_admin'

export interface AuditLogEntry {
  id: string
  adminId: string
  action: string
  entityType: string
  entityId: string | null
  changes: Record<string, unknown> | null
  ipAddress: string | null
  createdAt: string
}

export interface LogAdminActionArgs {
  adminId: string
  action: string
  entityType: string
  entityId?: string | null
  changes?: Record<string, unknown> | null
  ipAddress?: string | null
}

/**
 * Records an admin action to the audit log table.
 */
export async function logAdminAction({
  adminId,
  action,
  entityType,
  entityId = null,
  changes = null,
  ipAddress = null,
}: LogAdminActionArgs): Promise<void> {
  try {
    const supabase = await createClient()
    await supabase.from('admin_audit_log').insert({
      admin_id: adminId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      changes,
      ip_address: ipAddress,
    } as any)
  } catch (error) {
    console.error('Failed to log admin action', error)
  }
}

export interface AuditLogFilters {
  adminId?: string
  entityType?: string
  limit?: number
  before?: string
}

export interface AuditLogResult {
  entries: AuditLogEntry[]
  hasMore: boolean
  nextCursor: string | null
}

/**
 * Fetches audit log entries with simple cursor pagination.
 */
export async function getAuditLog({
  adminId,
  entityType,
  limit = 20,
  before,
}: AuditLogFilters = {}): Promise<AuditLogResult> {
  const supabase = await createClient()
  let query = supabase
    .from('admin_audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit + 1)

  if (adminId) {
    query = query.eq('admin_id', adminId)
  }

  if (entityType) {
    query = query.eq('entity_type', entityType)
  }

  if (before) {
    query = query.lt('created_at', before)
  }

  const { data, error } = await query

  if (error || !data) {
    console.error('Failed to fetch audit log', error)
    return { entries: [], hasMore: false, nextCursor: null }
  }

  const hasMore = data.length > limit
  const entries = data.slice(0, limit).map((entry: any) => ({
    id: entry.id,
    adminId: entry.admin_id,
    action: entry.action,
    entityType: entry.entity_type,
    entityId: entry.entity_id,
    changes: entry.changes,
    ipAddress: entry.ip_address,
    createdAt: entry.created_at,
  }))

  const nextCursor = hasMore ? entries[entries.length - 1]?.createdAt ?? null : null

  return { entries, hasMore, nextCursor }
}
