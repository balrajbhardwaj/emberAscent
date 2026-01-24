/**
 * Admin Impersonation Utilities
 *
 * Handles creation, validation, and lifecycle management of impersonation sessions
 * so support admins can troubleshoot user issues safely. These helpers run on the
 * server and rely on Supabase RLS + admin role checks for enforcement.
 *
 * @module lib/admin/impersonation
 */

import { randomUUID } from 'node:crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import { logAdminAction } from '@/lib/admin/auditLog'
import { IMPERSONATION_DURATION_MS } from '@/lib/admin/impersonation.constants'

export interface ImpersonationToken {
  token: string
  adminId: string
  targetUserId: string
  expiresAt: string
}

export interface ImpersonationInfo extends ImpersonationToken {
  startedAt: string
  endedAt: string | null
  reason: string | null
  targetProfile: {
    id: string
    email: string
    fullName: string | null
  }
}

type DatabaseClient = SupabaseClient

interface ProfileRecord {
  id: string
  email: string
  full_name: string | null
  role?: string | null
}

interface SessionRecord {
  id: string
  admin_id: string
  target_user_id: string
  reason: string | null
  started_at: string
  ended_at: string | null
}

function computeExpiry(startedAt: string) {
  return new Date(new Date(startedAt).getTime() + IMPERSONATION_DURATION_MS)
}

async function resolveClient(client?: DatabaseClient) {
  if (client) {
    return client
  }

  return (await createRouteHandlerClient()) as DatabaseClient
}

async function fetchTargetProfile(targetUserId: string, client: DatabaseClient) {
  const supabase = client
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role')
    .eq('id', targetUserId)
    .single()

  if (error || !data) {
    throw new Error('Target user not found')
  }

  return data as ProfileRecord
}

async function closeExistingSessions(adminId: string, client: DatabaseClient) {
  const supabase = client
  await supabase
    .from('impersonation_sessions')
    .update({ ended_at: new Date().toISOString() })
    .eq('admin_id', adminId)
    .is('ended_at', null)
}

/**
 * Starts a new impersonation session for the given admin and target user.
 */
export interface StartImpersonationOptions {
  reason?: string
  client?: DatabaseClient
}

export async function startImpersonation(
  adminId: string,
  targetUserId: string,
  options: StartImpersonationOptions = {}
): Promise<ImpersonationToken> {
  if (adminId === targetUserId) {
    throw new Error('Cannot impersonate yourself')
  }

  const { reason, client } = options

  const supabase = await resolveClient(client)
  const targetProfile = await fetchTargetProfile(targetUserId, supabase)

  if (targetProfile.role === 'admin' || targetProfile.role === 'super_admin') {
    throw new Error('Cannot impersonate another admin')
  }

  await closeExistingSessions(adminId, supabase)
  const startedAt = new Date().toISOString()
  const token = randomUUID()

  const { error } = await supabase.from('impersonation_sessions').insert({
    id: token,
    admin_id: adminId,
    target_user_id: targetUserId,
    reason: reason?.slice(0, 500) ?? null,
    started_at: startedAt,
  })

  if (error) {
    console.error('Failed to create impersonation session', error)
    throw new Error('Unable to start impersonation')
  }

  await logAdminAction({
    adminId,
    action: 'impersonation:start',
    entityType: 'profile',
    entityId: targetUserId,
    changes: { reason: reason ?? null },
  })

  const expiresAt = computeExpiry(startedAt).toISOString()

  return {
    token,
    adminId,
    targetUserId,
    expiresAt,
  }
}

/**
 * Ends an impersonation session referenced by token (if active).
 */
export interface EndImpersonationOptions {
  adminId?: string
  client?: DatabaseClient
}

export async function endImpersonation(
  token: string,
  options: EndImpersonationOptions = {}
) {
  if (!token) {
    return
  }

  const supabase = await resolveClient(options.client)
  await supabase
    .from('impersonation_sessions')
    .update({ ended_at: new Date().toISOString() })
    .eq('id', token)
    .is('ended_at', null)

  if (options.adminId) {
    await logAdminAction({
      adminId: options.adminId,
      action: 'impersonation:end',
      entityType: 'profile',
      entityId: undefined,
      changes: { token },
    })
  }
}

/**
 * Returns whether a token exists (simple helper for UI checks).
 */
export function isImpersonating(token?: string | null): boolean {
  return Boolean(token)
}

/**
 * Fetches impersonation session details for banner/middleware logic.
 */
export interface GetImpersonationInfoOptions {
  client?: DatabaseClient
}

export async function getImpersonationInfo(
  token?: string | null,
  options: GetImpersonationInfoOptions = {}
): Promise<ImpersonationInfo | null> {
  if (!token) {
    return null
  }

  const supabase = await resolveClient(options.client)
  const { data, error } = await supabase
    .from('impersonation_sessions')
    .select('*')
    .eq('id', token)
    .single()

  if (error || !data) {
    return null
  }

  const session = data as SessionRecord
  const expiresAtDate = computeExpiry(session.started_at)
  const now = new Date()

  if (session.ended_at || expiresAtDate < now) {
    // Auto-expire session if needed
    if (!session.ended_at) {
      await endImpersonation(token, { client: supabase })
    }
    return null
  }

  const targetProfile = await fetchTargetProfile(session.target_user_id, supabase)

  return {
    token,
    adminId: session.admin_id,
    targetUserId: session.target_user_id,
    reason: session.reason,
    startedAt: session.started_at,
    endedAt: session.ended_at,
    targetProfile: {
      id: targetProfile.id,
      email: targetProfile.email,
      fullName: targetProfile.full_name,
    },
    expiresAt: expiresAtDate.toISOString(),
  }
}
