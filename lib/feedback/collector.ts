/**
 * Feedback Collection Service
 * 
 * Service layer for managing user feedback:
 * - Question feedback (helpful/not helpful)
 * - Session feedback (ratings and experience)
 * - NPS surveys (Net Promoter Score)
 * 
 * Handles logic for when to show surveys and aggregating feedback data.
 * 
 * @module lib/feedback/collector
 */

import { createClient } from "@/lib/supabase/server"

// =====================================================
// Question Feedback
// =====================================================

interface QuestionFeedbackInput {
  questionId: string
  childId: string
  parentId: string
  isHelpful: boolean
  issueType?: 'unclear' | 'incorrect' | 'too_easy' | 'too_hard' | 'other'
  feedbackText?: string
  sessionId?: string
}

export async function submitQuestionFeedback(input: QuestionFeedbackInput) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('question_feedback')
    .insert({
      question_id: input.questionId,
      child_id: input.childId,
      parent_id: input.parentId,
      is_helpful: input.isHelpful,
      issue_type: input.issueType || null,
      feedback_text: input.feedbackText || null,
      session_id: input.sessionId || null,
    })
    .select()
    .single()

  if (error) {
    console.error('Error submitting question feedback:', error)
    throw error
  }

  return data
}

export async function getQuestionFeedbackSummary(questionId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .rpc('get_question_feedback_summary', {
      question_uuid: questionId,
    })

  if (error) {
    console.error('Error fetching feedback summary:', error)
    return null
  }

  return data?.[0] || null
}

export async function hasUserProvidedQuestionFeedback(
  questionId: string,
  childId: string
): Promise<boolean> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('question_feedback')
    .select('id')
    .eq('question_id', questionId)
    .eq('child_id', childId)
    .maybeSingle()

  if (error) {
    console.error('Error checking feedback:', error)
    return false
  }

  return !!data
}

// =====================================================
// Session Feedback
// =====================================================

interface SessionFeedbackInput {
  sessionId: string
  childId: string
  parentId: string
  rating: number // 1-5
  difficultyAppropriate?: boolean
  explanationsHelpful?: boolean
  wouldRecommend?: boolean
  positiveFeedback?: string
  improvementSuggestions?: string
}

export async function submitSessionFeedback(input: SessionFeedbackInput) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('session_feedback')
    .insert({
      session_id: input.sessionId,
      child_id: input.childId,
      parent_id: input.parentId,
      rating: input.rating,
      difficulty_appropriate: input.difficultyAppropriate ?? null,
      explanations_helpful: input.explanationsHelpful ?? null,
      would_recommend: input.wouldRecommend ?? null,
      positive_feedback: input.positiveFeedback || null,
      improvement_suggestions: input.improvementSuggestions || null,
    })
    .select()
    .single()

  if (error) {
    console.error('Error submitting session feedback:', error)
    throw error
  }

  return data
}

export async function shouldShowSessionFeedback(sessionId: string): Promise<boolean> {
  const supabase = await createClient()

  // Check if feedback already exists
  const { data, error } = await supabase
    .from('session_feedback')
    .select('id')
    .eq('session_id', sessionId)
    .maybeSingle()

  if (error) {
    console.error('Error checking session feedback:', error)
    return false
  }

  // Show feedback form if no feedback exists yet
  // Could add more logic here (e.g., only show every 5th session)
  return !data
}

// =====================================================
// NPS Surveys
// =====================================================

interface NpsSurveyInput {
  parentId: string
  childId?: string
  score: number // 0-10
  feedbackText?: string
  triggerType: 'session_10' | 'session_30' | 'manual' | 'prompted'
  totalSessionsAtTime: number
}

export async function submitNpsSurvey(input: NpsSurveyInput) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('nps_surveys')
    .insert({
      parent_id: input.parentId,
      child_id: input.childId || null,
      score: input.score,
      feedback_text: input.feedbackText || null,
      trigger_type: input.triggerType,
      total_sessions_at_time: input.totalSessionsAtTime,
    })
    .select()
    .single()

  if (error) {
    console.error('Error submitting NPS survey:', error)
    throw error
  }

  return data
}

export async function shouldShowNpsSurvey(
  parentId: string,
  totalSessions: number
): Promise<{ show: boolean; triggerType: 'session_10' | 'session_30' | null }> {
  const supabase = await createClient()

  // Check if they've completed surveys before
  const { data: surveys, error } = await supabase
    .from('nps_surveys')
    .select('trigger_type, created_at')
    .eq('parent_id', parentId)
    .order('created_at', { ascending: false })
    .limit(1)

  if (error) {
    console.error('Error checking NPS surveys:', error)
    return { show: false, triggerType: null }
  }

  const lastSurvey = surveys?.[0]

  // First survey at 10 sessions
  if (totalSessions === 10 && !lastSurvey) {
    return { show: true, triggerType: 'session_10' }
  }

  // Follow-up survey at 30 sessions
  if (totalSessions === 30 && lastSurvey?.trigger_type === 'session_10') {
    return { show: true, triggerType: 'session_30' }
  }

  // Don't show again after 30-session survey (avoid survey fatigue)
  return { show: false, triggerType: null }
}

export async function calculateNps(
  startDate?: Date,
  endDate?: Date
): Promise<{
  totalResponses: number
  promoters: number
  passives: number
  detractors: number
  npsScore: number
} | null> {
  const supabase = await createServerClient()

  const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
  const end = endDate || new Date()

  const { data, error } = await supabase.rpc('calculate_nps', {
    start_date: start.toISOString(),
    end_date: end.toISOString(),
  })

  if (error) {
    console.error('Error calculating NPS:', error)
    return null
  }

  return data?.[0] || null
}

// =====================================================
// Feedback Analytics
// =====================================================

export async function getChildFeedbackStats(childId: string) {
  const supabase = await createClient()

  // Get question feedback count
  const { count: questionFeedbackCount } = await supabase
    .from('question_feedback')
    .select('*', { count: 'exact', head: true })
    .eq('child_id', childId)

  // Get session feedback count
  const { count: sessionFeedbackCount } = await supabase
    .from('session_feedback')
    .select('*', { count: 'exact', head: true })
    .eq('child_id', childId)

  // Get average session rating
  const { data: avgRating } = await supabase
    .from('session_feedback')
    .select('rating')
    .eq('child_id', childId)

  const averageRating = avgRating?.length
    ? avgRating.reduce((sum: number, item: { rating: number }) => sum + item.rating, 0) / avgRating.length
    : null

  return {
    questionFeedbackCount: questionFeedbackCount || 0,
    sessionFeedbackCount: sessionFeedbackCount || 0,
    averageSessionRating: averageRating ? Number(averageRating.toFixed(1)) : null,
  }
}

export async function getRecentIssues(limit: number = 10) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('question_feedback')
    .select(`
      id,
      question_id,
      is_helpful,
      issue_type,
      feedback_text,
      created_at,
      questions (
        question_text,
        subject,
        topic
      )
    `)
    .eq('is_helpful', false)
    .not('issue_type', 'is', null)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching recent issues:', error)
    return []
  }

  return data || []
}
