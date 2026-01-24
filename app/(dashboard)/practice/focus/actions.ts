/**
 * Focus Session Actions
 *
 * Server actions for focus session operations
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface CreateFocusSessionParams {
  childId: string
  subject: string
  topics: string[]
}

/**
 * Create a new focus session with selected subject and topics
 * 
 * @param params - Session configuration (childId, subject, topics)
 * @returns Session ID or error
 */
export async function createFocusSession(params: CreateFocusSessionParams) {
  try {
    const supabase = await createClient()
    const { childId, subject, topics } = params

    // Validate inputs
    if (!childId || !subject || !topics || topics.length === 0) {
      return { success: false, error: 'Missing required parameters' }
    }

    // Convert subject to snake_case for database query
    const subjectSnakeCase = subject.toLowerCase().replace(/\s+/g, '_')

    // Fetch questions matching the criteria
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('id')
      .eq('subject', subjectSnakeCase)
      .in('topic', topics)
      .eq('is_published', true)
      .limit(25)

    if (questionsError) {
      console.error('Error fetching questions:', questionsError)
      return { success: false, error: 'Could not fetch questions' }
    }

    if (!questions || questions.length === 0) {
      return { success: false, error: 'No questions available for selected topics' }
    }

    // Shuffle questions for randomness
    const shuffled = questions.sort(() => Math.random() - 0.5)

    // Create practice session
    const { data: session, error: sessionError } = await supabase
      .from('practice_sessions')
      .insert({
        child_id: childId,
        session_type: 'focus',
        subject: subjectSnakeCase,
        status: 'in_progress',
        started_at: new Date().toISOString(),
        focus_session_config: {
          subject: subject,
          topics: topics,
        },
        flagged_questions: [],
      })
      .select()
      .single()

    if (sessionError) {
      console.error('Error creating focus session:', sessionError)
      return { success: false, error: 'Could not create session' }
    }

    // Create session_responses for all questions
    const responses = shuffled.map((q, index) => ({
      session_id: session.id,
      question_id: q.id,
      display_order: index + 1,
      answer_given: null,
      is_correct: null,
      time_taken_seconds: null,
      flagged_for_review: false,
      answer_changed_count: 0,
    }))

    const { error: responsesError } = await supabase
      .from('session_responses')
      .insert(responses)

    if (responsesError) {
      console.error('Error creating session responses:', responsesError)
      // Delete the session since we couldn't create responses
      await supabase.from('practice_sessions').delete().eq('id', session.id)
      return { success: false, error: 'Could not initialize session' }
    }

    // Revalidate cache
    revalidatePath('/practice/focus')
    revalidatePath('/practice')
    revalidatePath('/progress')

    return { success: true, sessionId: session.id }
  } catch (error) {
    console.error('Unexpected error creating focus session:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
