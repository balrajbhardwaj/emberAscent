/**
 * Mock Test Selection Page
 *
 * Allows children to select and configure a mock test
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getMockTestTemplates } from '@/lib/practice/mockTestGenerator'
import MockTestSelector from './MockTestSelector'
import { PaywallCard } from '@/components/common/PaywallCard'

export default async function MockTestPage() {
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
        description="Practice under real exam conditions with timed, full-length tests. Get detailed results analysis and track your exam readiness."
        benefits={[
          "Full-length timed practice exams",
          "Five different test templates (Standard, Maths Focus, English Focus, VR Focus, Quick)",
          "Realistic exam conditions with countdown timer",
          "Question flagging and navigation grid",
          "Comprehensive results analysis with recommendations",
          "Track improvement across multiple mock tests"
        ]}
      />
    )
  }

  // Get child details
  const { data: child } = await supabase
    .from('children')
    .select('id, name, year_group')
    .eq('id', profile.active_child_id)
    .single()

  if (!child) {
    redirect('/setup')
  }

  // Get available templates
  const templates = await getMockTestTemplates()

  // Get child's previous mock tests
  const { data: previousMocks } = await supabase
    .from('practice_sessions')
    .select('id, started_at, completed_at, correct_answers, total_questions, mock_test_config')
    .eq('child_id', child.id)
    .eq('is_mock_test', true)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(5)

  return (
    <MockTestSelector
      childId={child.id}
      childName={child.name}
      yearGroup={child.year_group}
      templates={templates}
      previousMocks={previousMocks || []}
    />
  )
}
