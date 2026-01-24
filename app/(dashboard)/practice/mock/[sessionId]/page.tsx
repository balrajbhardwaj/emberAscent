/**
 * Mock Test Interface Page
 *
 * Full mock test experience with timer and navigation
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getMockTestSession } from '@/lib/practice/mockTestGenerator'
import MockTestInterface from './MockTestInterface'

export default async function MockTestPage({
  params,
}: {
  params: { sessionId: string }
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Get active child
  const { data: profile } = await supabase
    .from('profiles')
    .select('active_child_id')
    .eq('id', user.id)
    .single()

  if (!profile?.active_child_id) {
    redirect('/setup')
  }

  // Get session
  const session = await getMockTestSession(params.sessionId, profile.active_child_id)

  if (!session) {
    redirect('/practice/mock')
  }

  // Redirect if already completed
  if (session.status === 'completed') {
    redirect(`/practice/mock/${params.sessionId}/results`)
  }

  return <MockTestInterface session={session} />
}
