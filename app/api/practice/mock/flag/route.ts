/**
 * Mock Test Flag API
 *
 * Toggles flag status for a question in mock test
 */

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const flagSchema = z.object({
  sessionId: z.string().uuid(),
  questionId: z.string().uuid(),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check auth
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check subscription tier
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()

    const isAscent = profile?.subscription_tier === 'ascent' || profile?.subscription_tier === 'summit'
    if (!isAscent) {
      return NextResponse.json(
        { error: 'Mock tests require Ascent subscription' },
        { status: 403 }
      )
    }

    // Parse and validate request
    const body = await request.json()
    const { sessionId, questionId } = flagSchema.parse(body)

    // Verify session belongs to user's child
    const { data: session } = await supabase
      .from('practice_sessions')
      .select('child_id, children!inner(parent_id)')
      .eq('id', sessionId)
      .single()

    if (!session || (session.children as any).parent_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get current flag status
    const { data: response } = await supabase
      .from('session_responses')
      .select('flagged_for_review')
      .eq('session_id', sessionId)
      .eq('question_id', questionId)
      .single()

    if (!response) {
      return NextResponse.json({ error: 'Response not found' }, { status: 404 })
    }

    // Toggle flag
    const newFlagStatus = !response.flagged_for_review

    const { error: updateError } = await supabase
      .from('session_responses')
      .update({
        flagged_for_review: newFlagStatus,
      })
      .eq('session_id', sessionId)
      .eq('question_id', questionId)

    if (updateError) {
      console.error('Error updating flag:', updateError)
      return NextResponse.json({ error: 'Failed to update flag' }, { status: 500 })
    }

    return NextResponse.json({ success: true, flagged: newFlagStatus })
  } catch (error) {
    console.error('Error in flag API:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
