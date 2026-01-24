import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import {
  IMPERSONATION_COOKIE_NAME,
  IMPERSONATION_DURATION_MS,
} from '@/lib/admin/impersonation.constants'

/**
 * Updates the user's session in middleware
 * This ensures the session is refreshed on every request
 * and is available to Server Components
 */
export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const isApiRoute = pathname.startsWith('/api')
  const isAuthRoute =
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password')
  const isAdminRoute = pathname.startsWith('/admin')
  const isPublicRoute = pathname === '/'

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const impersonationToken = request.cookies.get(IMPERSONATION_COOKIE_NAME)?.value

  if (impersonationToken && user) {
    const { data: impersonation } = await supabase
      .from('impersonation_sessions')
      .select('id, admin_id, target_user_id, started_at, ended_at')
      .eq('id', impersonationToken)
      .single()

    const startedAt = impersonation?.started_at
      ? new Date(impersonation.started_at).getTime()
      : 0
    const expiresAt = startedAt + IMPERSONATION_DURATION_MS
    const expired = Date.now() > expiresAt
    const invalidAdmin = impersonation?.admin_id !== user.id
    const alreadyEnded = Boolean(impersonation?.ended_at)
    const missingSession = !impersonation

    if (expired || invalidAdmin || alreadyEnded || missingSession) {
      supabaseResponse.cookies.set({
        name: IMPERSONATION_COOKIE_NAME,
        value: '',
        maxAge: 0,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      })

      if (impersonation && !impersonation.ended_at) {
        await supabase
          .from('impersonation_sessions')
          .update({ ended_at: new Date().toISOString() })
          .eq('id', impersonationToken)
          .is('ended_at', null)
      }
    } else {
      supabaseResponse.headers.set(
        'x-impersonation-target',
        impersonation.target_user_id
      )
    }
  }

  // Protected routes logic
  if (!user && !isAuthRoute && !isApiRoute && !isPublicRoute) {
    // Redirect to login if accessing protected route without auth
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Admin-only guard: only admins and super admins may access /admin routes
  if (user && isAdminRoute) {
    const { data: profile, error: roleError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (roleError) {
      console.error('Error fetching admin role', roleError)
    }

    const role = (profile as any)?.role ?? 'user'
    const isElevated = role === 'admin' || role === 'super_admin'

    if (!isElevated) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/practice'
      return NextResponse.redirect(redirectUrl)
    }

    console.info(`[admin-access] ${user.id} -> ${pathname}`)
    
    // Admin users are allowed in admin area without children
    // Skip the setup check below
    return supabaseResponse
  }

  // Check if authenticated user needs to complete setup
  if (
    user &&
    !isAdminRoute &&
    pathname !== '/setup' &&
    !isAuthRoute &&
    !isApiRoute &&
    !isPublicRoute
  ) {
    // First check if user is admin - admins don't need children
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = (profile as any)?.role ?? 'user'
    const isAdmin = role === 'admin' || role === 'super_admin'

    // If not admin, check if user has any children (required)
    if (!isAdmin) {
      const { data: children } = await supabase
        .from('children')
        .select('id')
        .eq('parent_id', user.id)
        .eq('is_active', true)
        .limit(1)

      if (!children || children.length === 0) {
        // No children - must create one
        const url = request.nextUrl.clone()
        url.pathname = '/setup'
        return NextResponse.redirect(url)
      }
    }
  }

  // Redirect authenticated users away from auth pages
  if (user && (pathname === '/login' || pathname === '/signup')) {
    // Check if user is admin first
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = (profile as any)?.role ?? 'user'
    const isAdmin = role === 'admin' || role === 'super_admin'

    const url = request.nextUrl.clone()

    if (isAdmin) {
      // Redirect admins to admin panel
      url.pathname = '/admin'
      return NextResponse.redirect(url)
    }

    // Check if regular user needs setup
    const { data: children } = await supabase
      .from('children')
      .select('id')
      .eq('parent_id', user.id)
      .eq('is_active', true)
      .limit(1)

    url.pathname = children && children.length > 0 ? '/practice' : '/setup'
    return NextResponse.redirect(url)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}
