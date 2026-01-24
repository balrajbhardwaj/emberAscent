/**
 * Admin Impersonation Route
 *
 * Handles creation and termination of impersonation sessions so admins can
 * troubleshoot user accounts. All inputs validated with Zod and access gated
 * behind admin role checks.
 */
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import { startImpersonation, endImpersonation } from '@/lib/admin/impersonation'
import { IMPERSONATION_COOKIE_NAME } from '@/lib/admin/impersonation.constants'
import type { Database } from '@/types/database'

const impersonationStartSchema = z.object({
  userId: z.string().uuid(),
  reason: z
    .string()
    .trim()
    .min(4, 'Reason must be at least 4 characters')
    .max(500, 'Reason too long')
    .optional(),
})

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

function forbidden() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

async function assertAdminRole(supabase: SupabaseClient<Database>) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { user: null, isAdmin: false }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = (profile as any)?.role ?? 'user'
  const isAdmin = role === 'admin' || role === 'super_admin'

  return { user, isAdmin }
}

export async function POST(request: NextRequest) {
  const supabase = (await createRouteHandlerClient()) as SupabaseClient<Database>
  const { user, isAdmin } = await assertAdminRole(supabase)

  if (!user) {
    return unauthorized()
  }

  if (!isAdmin) {
    return forbidden()
  }

  const body = await request.json().catch(() => null)
  const parsed = impersonationStartSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid payload', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  try {
    const token = await startImpersonation(user.id, parsed.data.userId, {
      reason: parsed.data.reason,
      client: supabase,
    })

    const response = NextResponse.json({
      success: true,
      redirectTo: '/dashboard',
      expiresAt: token.expiresAt,
    })

    response.cookies.set({
      name: IMPERSONATION_COOKIE_NAME,
      value: token.token,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 30,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Failed to start impersonation', error)
    return NextResponse.json(
      { error: 'Unable to start impersonation session' },
      { status: 400 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  const supabase = (await createRouteHandlerClient()) as SupabaseClient<Database>
  const { user, isAdmin } = await assertAdminRole(supabase)

  if (!user) {
    return unauthorized()
  }

  if (!isAdmin) {
    return forbidden()
  }

  const token = request.cookies.get(IMPERSONATION_COOKIE_NAME)?.value

  if (!token) {
    return NextResponse.json({ success: true })
  }

  await endImpersonation(token, { adminId: user.id, client: supabase })

  const response = NextResponse.json({ success: true, redirectTo: '/admin/users' })
  response.cookies.set({
    name: IMPERSONATION_COOKIE_NAME,
    value: '',
    maxAge: 0,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  })

  return response
}
