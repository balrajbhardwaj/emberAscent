/**
 * Supabase Browser Client
 * 
 * Creates a Supabase client for use in Client Components.
 * Uses @supabase/ssr for proper cookie handling in the browser.
 * 
 * Usage:
 * - Import and call createClient() in any 'use client' component
 * - Client automatically manages cookies for session persistence
 * - Type-safe with generated Database types from Supabase
 * 
 * @module lib/supabase/client
 * 
 * @example
 * 'use client'
 * import { createClient } from '@/lib/supabase/client'
 * 
 * export function MyComponent() {
 *   const supabase = createClient()
 *   // Use supabase client for queries, auth, etc.
 * }
 */
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'

/**
 * Creates a Supabase client for use in browser/client components
 * This client automatically handles cookies and session management
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
