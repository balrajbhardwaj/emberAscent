/**
 * Mock Test Interface Page
 *
 * Full mock test experience with timer and navigation
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getMockTestSession } from '@/lib/practice/mockTestGenerator'
import MockTestInterface from './MockTestInterface'
import { PaywallCard } from '@/components/common/PaywallCard'

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

  // Check subscription tier
  const { data: profile } = await supabase
    .from('profiles')
    .select('active_child_id, subscription_tier')
    .eq('id', user.id)
    .single()

  if (!profile?.active_child_id) {
    redirect('/setup')
  }

  // Enforce Ascent tier for Mock Tests
  const isAscent = profile?.subscription_tier === 'ascent' || profile?.subscription_tier === 'summit'
  if (!isAscent) {
    return (
      <PaywallCard
        feature="Mock Tests"
        description="This mock test session requires an Ascent subscription."
        benefits={[
          "Full-length timed practice exams",
          "Comprehensive results analysis",
          "Track improvement across tests",
          "Plus all other Ascent features"
        ]}
      />
    )
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
