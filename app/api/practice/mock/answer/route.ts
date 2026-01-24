/**
 * Mock Test Answer API
 *
 * Saves answer for a question in mock test
 */

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const answerSchema = z.object({
  sessionId: z.string().uuid(),
  questionId: z.string().uuid(),
  answer: z.string(),
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
    const { sessionId, questionId, answer } = answerSchema.parse(body)

    // Verify session belongs to user's child
    const { data: session } = await supabase
      .from('practice_sessions')
      .select('child_id, children!inner(parent_id)')
      .eq('id', sessionId)
      .single()

    if (!session || (session.children as any).parent_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get the question to check correct answer
    const { data: question } = await supabase
      .from('questions')
      .select('correct_answer')
      .eq('id', questionId)
      .single()

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    const isCorrect = answer === question.correct_answer

    // Get current response to increment counter
    const { data: currentResponse } = await supabase
      .from('session_responses')
      .select('answer_changed_count')
      .eq('session_id', sessionId)
      .eq('question_id', questionId)
      .single()

    // Update response
    const { error: updateError } = await supabase
      .from('session_responses')
      .update({
        answer_given: answer,
        is_correct: isCorrect,
        answer_changed_count: (currentResponse?.answer_changed_count || 0) + 1,
      })
      .eq('session_id', sessionId)
      .eq('question_id', questionId)

    if (updateError) {
      console.error('Error updating response:', updateError)
      return NextResponse.json({ error: 'Failed to save answer' }, { status: 500 })
    }

    return NextResponse.json({ success: true, isCorrect })
  } catch (error) {
    console.error('Error in answer API:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
