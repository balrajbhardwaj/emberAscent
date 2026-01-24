/**
 * Mock Test Generator
 *
 * Functions for generating and managing mock test question sets
 */

import { createClient } from '@/lib/supabase/server'

export interface MockTestTemplate {
  id: string
  name: string
  description: string | null
  style: string
  total_questions: number
  time_limit_minutes: number
  difficulty_distribution: Record<string, number>
  subject_distribution: Record<string, number>
  year_groups: number[]
}

export interface MockTestConfig {
  templateId: string
  childId: string
  subjects?: string[]
  totalQuestions?: number
  timeLimitMinutes?: number
}

/**
 * Get all active mock test templates
 */
export async function getMockTestTemplates(): Promise<MockTestTemplate[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('mock_test_templates')
    .select('*')
    .eq('is_active', true)
    .order('total_questions')

  if (error) {
    console.error('Error fetching mock test templates:', error)
    return []
  }

  return data || []
}

/**
 * Get a specific template by ID
 */
export async function getMockTestTemplate(templateId: string): Promise<MockTestTemplate | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('mock_test_templates')
    .select('*')
    .eq('id', templateId)
    .single()

  if (error) {
    console.error('Error fetching mock test template:', error)
    return null
  }

  return data
}

/**
 * Generate mock test question set using database function
 */
export async function generateMockTestQuestions(
  templateId: string,
  childId: string
): Promise<{ question_id: string; display_order: number }[]> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('generate_mock_test_questions', {
    p_template_id: templateId,
    p_child_id: childId,
  })

  if (error) {
    console.error('Error generating mock test questions:', error)
    return []
  }

  return data || []
}

/**
 * Create a mock test session
 */
export async function createMockTestSession(config: MockTestConfig) {
  const supabase = await createClient()

  // Get template
  const template = await getMockTestTemplate(config.templateId)
  if (!template) {
    return { success: false, error: 'Template not found' }
  }

  // Generate question set
  const questions = await generateMockTestQuestions(config.templateId, config.childId)
  if (questions.length === 0) {
    return { success: false, error: 'Could not generate questions' }
  }

  // Create session
  const { data: session, error: sessionError } = await supabase
    .from('practice_sessions')
    .insert({
      child_id: config.childId,
      session_type: 'mock_test',
      is_mock_test: true,
      status: 'in_progress',
      started_at: new Date().toISOString(),
      mock_test_config: {
        template_id: config.templateId,
        template_name: template.name,
        style: template.style,
      },
      time_limit_seconds: (config.timeLimitMinutes || template.time_limit_minutes) * 60,
      flagged_questions: [],
    })
    .select()
    .single()

  if (sessionError) {
    console.error('Error creating mock test session:', sessionError)
    return { success: false, error: 'Could not create session' }
  }

  // Create session_responses for all questions (pre-allocated)
  const responses = questions.map((q) => ({
    session_id: session.id,
    question_id: q.question_id,
    display_order: q.display_order,
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
    // Clean up session
    await supabase.from('practice_sessions').delete().eq('id', session.id)
    return { success: false, error: 'Could not initialize questions' }
  }

  return { success: true, sessionId: session.id }
}

/**
 * Get mock test session with all questions and responses
 */
export async function getMockTestSession(sessionId: string, childId: string) {
  const supabase = await createClient()

  // Get session
  const { data: session, error: sessionError } = await supabase
    .from('practice_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('child_id', childId)
    .eq('is_mock_test', true)
    .single()

  if (sessionError || !session) {
    return null
  }

  // Get all responses with questions
  const { data: responses, error: responsesError } = await supabase
    .from('session_responses')
    .select(`
      *,
      question:questions (
        id,
        subject,
        topic,
        question_text,
        option_a,
        option_b,
        option_c,
        option_d,
        option_e,
        correct_answer,
        explanation,
        difficulty,
        ember_score
      )
    `)
    .eq('session_id', sessionId)
    .order('display_order')

  if (responsesError) {
    return null
  }

  return {
    ...session,
    responses: responses || [],
  }
}

/**
 * Submit mock test (mark as completed)
 */
export async function submitMockTest(sessionId: string, childId: string, timeTakenSeconds: number) {
  const supabase = await createClient()

  // Calculate score
  const { data: responses } = await supabase
    .from('session_responses')
    .select('is_correct')
    .eq('session_id', sessionId)
    .not('answer_given', 'is', null)

  const totalAnswered = responses?.length || 0
  const correctAnswers = responses?.filter((r) => r.is_correct).length || 0

  // Update session
  const { error } = await supabase
    .from('practice_sessions')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      time_taken_seconds: timeTakenSeconds,
      total_questions: totalAnswered,
      correct_answers: correctAnswers,
    })
    .eq('id', sessionId)
    .eq('child_id', childId)

  if (error) {
    console.error('Error submitting mock test:', error)
    return { success: false, error: 'Could not submit test' }
  }

  return { success: true, correctAnswers, totalAnswered }
}
