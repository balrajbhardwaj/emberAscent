/**
 * Supabase Service Role Client
 * 
 * Creates a Supabase client with service role privileges.
 * Use ONLY for server-side operations that need to bypass RLS,
 * such as webhook handlers that update user data.
 * 
 * WARNING: This client bypasses Row Level Security.
 * Never expose this to client-side code.
 * 
 * @module lib/supabase/service
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

/**
 * Creates a Supabase client with service role privileges
 * 
 * @returns Supabase client with admin access
 * @throws Error if environment variables are not configured
 * 
 * @example
 * // In webhook handler:
 * const supabase = createServiceClient()
 * await supabase.from('profiles').update({ ... }).eq('id', userId)
 */
export function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
  }

  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
