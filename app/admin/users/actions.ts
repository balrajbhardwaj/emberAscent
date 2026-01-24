'use server'

/**
 * User Management Server Actions
 *
 * Server actions for admin user management including:
 * - Fetching and filtering users
 * - User profile management
 * - Admin notes
 * - Subscription management helpers
 *
 * @module app/admin/users/actions
 */

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { logAdminAction } from '@/lib/admin/auditLog'

export interface UserFilters {
  search?: string
  subscriptionTier?: string[]
  subscriptionStatus?: string[]
  registeredFrom?: string
  registeredTo?: string
  hasChildren?: boolean
  lastActiveFrom?: string
  lastActiveTo?: string
}

export interface PaginationOptions {
  page?: number
  pageSize?: number
  sortField?: string
  sortDirection?: 'asc' | 'desc'
}

export interface UserSummary {
  id: string
  email: string
  full_name: string | null
  subscription_tier: string
  subscription_status: string
  created_at: string
  children_count: number
  total_questions: number
  last_active: string | null
}

/**
 * Fetch users with filters and pagination
 */
export async function getUsers(
  filters: UserFilters = {},
  pagination: PaginationOptions = {}
) {
  const supabase = await createClient()
  const page = pagination.page ?? 1
  const pageSize = pagination.pageSize ?? 25
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  // Build the query
  let query = supabase
    .from('profiles')
    .select(
      `
      id,
      email,
      full_name,
      subscription_tier,
      subscription_status,
      created_at,
      updated_at
    `,
      { count: 'exact' }
    )
    .order(pagination.sortField ?? 'created_at', {
      ascending: (pagination.sortDirection ?? 'desc') === 'asc',
    })
    .range(from, to)

  // Apply filters
  if (filters.search) {
    query = query.or(
      `email.ilike.%${filters.search}%,full_name.ilike.%${filters.search}%`
    )
  }

  if (filters.subscriptionTier && filters.subscriptionTier.length > 0) {
    query = query.in('subscription_tier', filters.subscriptionTier)
  }

  if (filters.subscriptionStatus && filters.subscriptionStatus.length > 0) {
    query = query.in('subscription_status', filters.subscriptionStatus)
  }

  if (filters.registeredFrom) {
    query = query.gte('created_at', filters.registeredFrom)
  }

  if (filters.registeredTo) {
    query = query.lte('created_at', filters.registeredTo)
  }

  const { data: profiles, error, count } = await query

  if (error) {
    console.error('Failed to fetch users', error)
    return { data: [], count: 0 }
  }

  // Fetch children count and practice stats for each user
  const userIds = profiles?.map((p) => p.id) ?? []

  const { data: childrenCounts } = await supabase
    .from('children')
    .select('parent_id, id')
    .in('parent_id', userIds)
    .eq('is_active', true)

  const { data: practiceStats } = await supabase
    .from('practice_sessions')
    .select('child_id, total_questions')
    .in(
      'child_id',
      childrenCounts?.map((c) => c.id) ?? []
    )

  // Aggregate stats by parent
  const statsByParent = new Map<
    string,
    { children_count: number; total_questions: number }
  >()

  childrenCounts?.forEach((child) => {
    const existing = statsByParent.get(child.parent_id) || {
      children_count: 0,
      total_questions: 0,
    }
    existing.children_count++
    statsByParent.set(child.parent_id, existing)
  })

  practiceStats?.forEach((session) => {
    const child = childrenCounts?.find((c) => c.id === session.child_id)
    if (child) {
      const existing = statsByParent.get(child.parent_id) || {
        children_count: 0,
        total_questions: 0,
      }
      existing.total_questions += session.total_questions
      statsByParent.set(child.parent_id, existing)
    }
  })

  // Combine data
  const users: UserSummary[] = profiles?.map((profile) => {
    const stats = statsByParent.get(profile.id) || {
      children_count: 0,
      total_questions: 0,
    }
    return {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      subscription_tier: profile.subscription_tier,
      subscription_status: profile.subscription_status,
      created_at: profile.created_at,
      children_count: stats.children_count,
      total_questions: stats.total_questions,
      last_active: profile.updated_at,
    }
  }) ?? []

  return { data: users, count: count ?? 0 }
}

/**
 * Get detailed user information
 */
export async function getUser(userId: string) {
  const supabase = await createClient()

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (profileError || !profile) {
    console.error('User not found', profileError)
    return null
  }

  // Fetch children
  const { data: children } = await supabase
    .from('children')
    .select('*')
    .eq('parent_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  // Fetch practice sessions for stats
  const childIds = children?.map((c) => c.id) ?? []
  const { data: sessions } = await supabase
    .from('practice_sessions')
    .select('*')
    .in('child_id', childIds)
    .order('created_at', { ascending: false })
    .limit(10)

  return {
    profile,
    children: children ?? [],
    recent_sessions: sessions ?? [],
  }
}

/**
 * Update user profile (admin only)
 */
export async function updateUser(
  userId: string,
  updates: {
    full_name?: string
    subscription_tier?: string
    subscription_status?: string
  },
  adminId: string
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)

  if (error) {
    console.error('Failed to update user', error)
    return { success: false, error: 'Unable to update user' }
  }

  await logAdminAction({
    adminId,
    action: 'Updated user profile',
    entityType: 'profile',
    entityId: userId,
    changes: updates,
  })

  revalidatePath('/admin/users')
  revalidatePath(`/admin/users/${userId}`)

  return { success: true }
}

/**
 * Add admin note to user
 */
export async function addAdminNote(
  userId: string,
  note: string,
  adminId: string
) {
  // For now, log it to audit log
  // In future, could create a separate admin_notes table
  await logAdminAction({
    adminId,
    action: 'Added admin note',
    entityType: 'profile',
    entityId: userId,
    changes: { note },
  })

  return { success: true }
}

/**
 * Extend trial period
 */
export async function extendTrial(
  userId: string,
  days: number,
  adminId: string
) {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_period_end')
    .eq('id', userId)
    .single()

  if (!profile) {
    return { success: false, error: 'User not found' }
  }

  const currentEnd = profile.subscription_period_end
    ? new Date(profile.subscription_period_end)
    : new Date()
  const newEnd = new Date(currentEnd.getTime() + days * 24 * 60 * 60 * 1000)

  const { error } = await supabase
    .from('profiles')
    .update({
      subscription_period_end: newEnd.toISOString(),
      subscription_status: 'trialing',
    })
    .eq('id', userId)

  if (error) {
    console.error('Failed to extend trial', error)
    return { success: false, error: 'Unable to extend trial' }
  }

  await logAdminAction({
    adminId,
    action: 'Extended trial',
    entityType: 'profile',
    entityId: userId,
    changes: { days, new_end: newEnd.toISOString() },
  })

  revalidatePath('/admin/users')
  revalidatePath(`/admin/users/${userId}`)

  return { success: true }
}

/**
 * Cancel subscription (admin action)
 */
export async function cancelSubscription(
  userId: string,
  reason: string,
  adminId: string
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('profiles')
    .update({
      subscription_status: 'cancelled',
      cancel_at_period_end: true,
    })
    .eq('id', userId)

  if (error) {
    console.error('Failed to cancel subscription', error)
    return { success: false, error: 'Unable to cancel subscription' }
  }

  await logAdminAction({
    adminId,
    action: 'Cancelled subscription',
    entityType: 'profile',
    entityId: userId,
    changes: { reason },
  })

  revalidatePath('/admin/users')
  revalidatePath(`/admin/users/${userId}`)

  return { success: true }
}
