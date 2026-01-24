/**
 * Mock Test Selection Page
 *
 * Allows children to select and configure a mock test
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getMockTestTemplates } from '@/lib/practice/mockTestGenerator'
import MockTestSelector from './MockTestSelector'

export default async function MockTestPage() {
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
