/**
 * Mock Test Results Page
 *
 * Comprehensive analysis and feedback after completing a mock test
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { analyzeMockResults, generateRecommendations, compareToPreviousMocks } from '@/lib/practice/mockAnalyzer'
import MockResults from './MockResults'

export default async function MockTestResultsPage({
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

  // Verify session belongs to child and is completed
  const { data: session } = await supabase
    .from('practice_sessions')
    .select('id, child_id, status, is_mock_test')
    .eq('id', params.sessionId)
    .eq('child_id', profile.active_child_id)
    .eq('is_mock_test', true)
    .single()

  if (!session) {
    redirect('/practice/mock')
  }

  if (session.status !== 'completed') {
    redirect(`/practice/mock/${params.sessionId}`)
  }

  // Analyze results
  const analysis = await analyzeMockResults(params.sessionId)
  if (!analysis) {
    redirect('/practice/mock')
  }

  // Generate recommendations
  const recommendations = generateRecommendations(analysis)

  // Get comparison data
  const comparison = await compareToPreviousMocks(
    profile.active_child_id,
    analysis.overview.percentage
  )

  return (
    <MockResults
      sessionId={params.sessionId}
      analysis={analysis}
      recommendations={recommendations}
      comparison={comparison}
    />
  )
}
