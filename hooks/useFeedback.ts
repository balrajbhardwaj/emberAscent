'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { createClient } from '@/lib/supabase/client'
import type {
  DifficultyAccuracy,
  ExplanationClarity,
  NpsTriggerReason,
} from '@/lib/feedback/collector'
import { useToast } from '@/hooks/use-toast'

interface QuestionFeedbackPayload {
  questionId: string
  isHelpful: boolean
  explanationClarity?: ExplanationClarity
  explanationStyle?: string
  difficultyAccuracy?: DifficultyAccuracy
  detail?: string
  extraContext?: Record<string, unknown>
  sessionId?: string
}

interface SessionFeedbackPayload {
  sessionId: string
  rating: number
  comment?: string
  tags?: string[]
}

interface NpsPayload {
  score: number
  followUp?: string
  triggerReason: NpsTriggerReason
  childId?: string
}

interface UseFeedbackConfig {
  childId?: string
}

interface FeedbackStateMap {
  question: boolean
  session: boolean
  nps: boolean
}

const defaultState: FeedbackStateMap = {
  question: false,
  session: false,
  nps: false,
}

export function useFeedback({ childId }: UseFeedbackConfig) {
  const supabase = useMemo(() => createClient(), [])
  const { toast } = useToast()
  const [parentId, setParentId] = useState<string | null>(null)
  const [loading, setLoading] = useState<FeedbackStateMap>(defaultState)
  const [questionSubmissions, setQuestionSubmissions] = useState<Set<string>>(() => new Set())
  const [sessionSubmissions, setSessionSubmissions] = useState<Set<string>>(() => new Set())
  const [hasSubmittedNps, setHasSubmittedNps] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setParentId(data.user?.id ?? null))
  }, [supabase])

  const ensureParent = useCallback(() => {
    if (!parentId) {
      throw new Error('Parent session missing')
    }
    return parentId
  }, [parentId])

  const ensureChild = useCallback(() => {
    if (!childId) {
      throw new Error('Child context missing')
    }
    return childId
  }, [childId])

  const setLoadingState = useCallback((key: keyof FeedbackStateMap, value: boolean) => {
    setLoading((prev) => ({ ...prev, [key]: value }))
  }, [])

  const addQuestionSubmission = useCallback((questionId: string) => {
    setQuestionSubmissions((prev) => {
      const next = new Set(prev)
      next.add(questionId)
      return next
    })
  }, [])

  const removeQuestionSubmission = useCallback((questionId: string) => {
    setQuestionSubmissions((prev) => {
      const next = new Set(prev)
      next.delete(questionId)
      return next
    })
  }, [])

  const addSessionSubmission = useCallback((sessionId: string) => {
    setSessionSubmissions((prev) => {
      const next = new Set(prev)
      next.add(sessionId)
      return next
    })
  }, [])

  const removeSessionSubmission = useCallback((sessionId: string) => {
    setSessionSubmissions((prev) => {
      const next = new Set(prev)
      next.delete(sessionId)
      return next
    })
  }, [])

  const submitQuestionFeedback = useCallback(
    async (payload: QuestionFeedbackPayload) => {
      const currentParent = ensureParent()
      const currentChild = ensureChild()

      if (questionSubmissions.has(payload.questionId)) {
        toast({
          title: 'Already received',
          description: 'Thanks! You already sent feedback for this question.',
        })
        return
      }

      setLoadingState('question', true)
      addQuestionSubmission(payload.questionId)

      try {
        const { error } = await supabase
          .from('question_feedback')
          .upsert(
            {
              question_id: payload.questionId,
              child_id: currentChild,
              parent_id: currentParent,
              session_id: payload.sessionId ?? null,
              is_helpful: payload.isHelpful,
              explanation_clarity: payload.explanationClarity ?? null,
              explanation_style: payload.explanationStyle ?? null,
              difficulty_accuracy: payload.difficultyAccuracy ?? null,
              feedback_text: payload.detail ?? null,
              extra_context: payload.extraContext ?? null,
            },
            { onConflict: 'question_id,child_id' }
          )

        if (error) {
          removeQuestionSubmission(payload.questionId)
          toast({
            title: 'Could not save feedback',
            description: 'Please try again in a moment.',
            variant: 'destructive',
          })
          throw error
        }

        toast({
          title: 'Thanks for the insight',
          description: 'Your feedback helps improve every question.',
        })
      } finally {
        setLoadingState('question', false)
      }
    },
    [addQuestionSubmission, ensureChild, ensureParent, questionSubmissions, removeQuestionSubmission, setLoadingState, supabase, toast]
  )

  const submitSessionFeedback = useCallback(
    async (payload: SessionFeedbackPayload) => {
      const currentParent = ensureParent()
      const currentChild = ensureChild()

      if (sessionSubmissions.has(payload.sessionId)) {
        toast({ title: 'Appreciate it', description: 'Session feedback already captured.' })
        return
      }

      setLoadingState('session', true)
      addSessionSubmission(payload.sessionId)

      try {
        const { data, error } = await supabase
          .from('session_feedback')
          .upsert(
            {
              session_id: payload.sessionId,
              child_id: currentChild,
              parent_id: currentParent,
              rating: payload.rating,
              comment: payload.comment ?? null,
            },
            { onConflict: 'session_id' }
          )
          .select()
          .single()

        if (error || !data) {
          toast({
            title: 'Session feedback failed',
            description: 'Please retry.',
            variant: 'destructive',
          })
          throw error
        }

        if (payload.tags?.length) {
          await supabase.from('session_feedback_tags').delete().eq('session_feedback_id', data.id)
          const { data: tagRows } = await supabase
            .from('feedback_tags')
            .select('id, slug')
            .in('slug', payload.tags)

          const tagPayload = (tagRows ?? []).map((tag) => ({
            session_feedback_id: data.id,
            tag_id: tag.id,
          }))

          if (tagPayload.length) {
            await supabase
              .from('session_feedback_tags')
              .upsert(tagPayload, { onConflict: 'session_feedback_id,tag_id' })
          }
        }

        toast({
          title: 'Feedback saved',
          description: 'Thanks for helping us tune future sessions.',
        })
      } catch (error) {
        removeSessionSubmission(payload.sessionId)
        throw error
      } finally {
        setLoadingState('session', false)
      }
    },
    [addSessionSubmission, ensureChild, ensureParent, removeSessionSubmission, sessionSubmissions, setLoadingState, supabase, toast]
  )

  const submitNpsResponse = useCallback(
    async (payload: NpsPayload) => {
      const currentParent = ensureParent()
      if (hasSubmittedNps) {
        return
      }

      setLoadingState('nps', true)

      try {
        const { error } = await supabase
          .from('nps_responses')
          .insert({
            parent_id: currentParent,
            child_id: payload.childId ?? null,
            score: payload.score,
            follow_up: payload.followUp ?? null,
            trigger_reason: payload.triggerReason,
          })

        if (error) {
          toast({
            title: 'Unable to send survey',
            description: 'Please try again later.',
            variant: 'destructive',
          })
          throw error
        }

        setHasSubmittedNps(true)
        toast({ title: 'Thank you!', description: 'Your response helps shape Ember Ascent.' })
      } finally {
        setLoadingState('nps', false)
      }
    },
    [ensureParent, hasSubmittedNps, setLoadingState, supabase, toast]
  )

  const checkNpsEligibility = useCallback(async () => {
    const currentParent = ensureParent()

    const { data: children } = await supabase
      .from('children')
      .select('id')
      .eq('parent_id', currentParent)

    if (!children?.length) {
      return false
    }

    const childIds = children.map((child) => child.id)
    if (!childIds.length) {
      return false
    }

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
      .eq('parent_id', currentParent)
      .order('responded_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!lastResponse?.responded_at) {
      return true
    }

    const lastResponseDate = new Date(lastResponse.responded_at)
    return Date.now() - lastResponseDate.getTime() >= ninetyDaysMs
  }, [ensureParent, supabase])

  return {
    submitQuestionFeedback,
    submitSessionFeedback,
    submitNpsResponse,
    checkNpsEligibility,
    loading,
    hasQuestionFeedback: (questionId: string) => questionSubmissions.has(questionId),
    hasSessionFeedback: (sessionId: string) => sessionSubmissions.has(sessionId),
    hasSubmittedNps,
    isReady: Boolean(parentId),
  }
}
