/**
 * Feedback Collection Service
 *
 * Provides server-side helpers for recording and aggregating feedback data.
 * - Question feedback (helpfulness, clarity, difficulty alignment)
 * - Session feedback (rating + quick tags)
 * - Net Promoter Score responses
 *
 * @module lib/feedback/collector
 */

import { createClient } from "@/lib/supabase/server"

export type ExplanationClarity = 'clear' | 'mixed' | 'confusing'
export type DifficultyAccuracy = 'too_easy' | 'just_right' | 'too_hard'
export type NpsTriggerReason = 'two_weeks_active' | 'ninety_day_interval' | 'manual' | 'prompted'

interface QuestionFeedbackInput {
  questionId: string
  childId: string
  parentId: string
  isHelpful: boolean
  explanationClarity?: ExplanationClarity
  explanationStyle?: string
  difficultyAccuracy?: DifficultyAccuracy
  detail?: string
  extraContext?: Record<string, unknown>
  sessionId?: string
}

interface SessionFeedbackInput {
  sessionId: string
  childId: string
  parentId: string
  rating: number
  comment?: string
  tags?: string[] // feedback tag slugs
}

interface NpsResponseInput {
  parentId: string
  childId?: string
  score: number
  followUp?: string
  triggerReason: NpsTriggerReason
}

export interface FeedbackStats {
  questionId: string
  totalFeedback: number
  helpfulCount: number
  notHelpfulCount: number
  helpfulPercentage: number
  clarityBreakdown: Record<string, number>
  difficultyBreakdown: Record<string, number>
}

export async function submitQuestionFeedback(input: QuestionFeedbackInput) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('question_feedback')
    .upsert(
      {
        question_id: input.questionId,
        child_id: input.childId,
        parent_id: input.parentId,
        session_id: input.sessionId ?? null,
        is_helpful: input.isHelpful,
        explanation_clarity: input.explanationClarity ?? null,
        explanation_style: input.explanationStyle ?? null,
        difficulty_accuracy: input.difficultyAccuracy ?? null,
        feedback_text: input.detail ?? null,
        extra_context: input.extraContext ?? null,
      },
      { onConflict: 'question_id,child_id' }
    )
    .select()
    .single()

  if (error) {
    console.error('submitQuestionFeedback failed')
    throw error
  }

  return data
}

export async function submitSessionFeedback(input: SessionFeedbackInput) {
  const supabase = await createClient()

  const { data: feedback, error } = await supabase
    .from('session_feedback')
    .upsert(
      {
        session_id: input.sessionId,
        child_id: input.childId,
        parent_id: input.parentId,
        rating: input.rating,
        comment: input.comment ?? null,
      },
      { onConflict: 'session_id' }
    )
    .select()
    .single()

  if (error || !feedback) {
    console.error('submitSessionFeedback failed')
    throw error
  }

  if (input.tags) {
    await supabase
      .from('session_feedback_tags')
      .delete()
      .eq('session_feedback_id', feedback.id)

    if (input.tags.length) {
      const { data: tagRows, error: tagError } = await supabase
        .from('feedback_tags')
        .select('id, slug')
        .in('slug', input.tags)

      if (tagError) {
        console.error('session feedback tag lookup failed')
        throw tagError
      }

      const tagPayload = (tagRows ?? []).map((tag) => ({
        session_feedback_id: feedback.id,
        tag_id: tag.id,
      }))

      if (tagPayload.length) {
        const { error: tagInsertError } = await supabase
          .from('session_feedback_tags')
          .upsert(tagPayload, { onConflict: 'session_feedback_id,tag_id' })

        if (tagInsertError) {
          console.error('session feedback tag insert failed')
          throw tagInsertError
        }
      }
    }
  }

  return feedback
}

export async function submitNpsResponse(input: NpsResponseInput) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('nps_responses')
    .insert({
      parent_id: input.parentId,
      child_id: input.childId ?? null,
      score: input.score,
      follow_up: input.followUp ?? null,
      trigger_reason: input.triggerReason,
    })
    .select()
    .single()

  if (error) {
    console.error('submitNpsResponse failed')
    throw error
  }

  return data
}

export async function shouldShowNpsSurvey(userId: string): Promise<boolean> {
  const supabase = await createClient()

  const { data: children, error: childError } = await supabase
    .from('children')
    .select('id')
    .eq('parent_id', userId)

  if (childError || !children?.length) {
    return false
  }

  const childIds = children.map((child) => child.id)

  const { data: firstSession } = await supabase
    .from('practice_sessions')
    .select('started_at')
    .in('child_id', childIds)
    .order('started_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!firstSession?.started_at) {
    return false
  }

  const firstSessionDate = new Date(firstSession.started_at)
  const twoWeeksMs = 14 * 24 * 60 * 60 * 1000
  const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000

  if (Date.now() - firstSessionDate.getTime() < twoWeeksMs) {
    return false
  }

  const { data: lastResponse } = await supabase
    .from('nps_responses')
    .select('responded_at')
    .eq('parent_id', userId)
    .order('responded_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!lastResponse?.responded_at) {
    return true
  }

  const lastResponseDate = new Date(lastResponse.responded_at)
  return Date.now() - lastResponseDate.getTime() >= ninetyDaysMs
}

export async function getFeedbackStats(questionId: string): Promise<FeedbackStats | null> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('get_question_feedback_summary', {
    question_uuid: questionId,
  })

  if (error || !data?.[0]) {
    return null
  }

  const payload = data[0] as {
    total_feedback: number
    helpful_count: number
    not_helpful_count: number
    helpful_percentage: number
    clarity_breakdown?: Record<string, number>
    difficulty_breakdown?: Record<string, number>
  }

  return {
    questionId,
    totalFeedback: payload.total_feedback ?? 0,
    helpfulCount: payload.helpful_count ?? 0,
    notHelpfulCount: payload.not_helpful_count ?? 0,
    helpfulPercentage: Number(payload.helpful_percentage ?? 0),
    clarityBreakdown: payload.clarity_breakdown ?? {},
    difficultyBreakdown: payload.difficulty_breakdown ?? {},
  }
}
