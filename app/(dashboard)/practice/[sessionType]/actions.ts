/**
 * Practice Session Server Actions
 * 
 * Server-side operations for session management:
 * - Create new session
 * - Fetch questions
 * - Submit attempts
 * - Complete session
 * 
 * @module app/(dashboard)/practice/[sessionType]/actions
 */
"use server"

import { createClient } from "@/lib/supabase/server"
import { selectQuestions, QuestionCriteria } from "@/lib/questions/selector"
import { SessionType, SessionState, SessionQuestion } from "@/hooks/usePracticeSession"
import { revalidatePath } from "next/cache"

/**
 * Create a new practice session
 * 
 * Creates session record in database, selects appropriate questions,
 * and returns initialized session state.
 * 
 * @param sessionType - Type of session (quick/focus/mock)
 * @param options - Optional session configuration (subject, topics)
 * @returns Initialized session state
 */
export async function createSession(
  sessionType: SessionType,
  options?: {
    subject?: string
    topics?: string[]
  }
): Promise<SessionState | null> {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      throw new Error("Not authenticated")
    }

    // Get user's children - use first active child
    const { data: children } = await supabase
      .from("children")
      .select("id")
      .eq("parent_id", user.id)
      .eq("is_active", true)
      .limit(1)
      .single()

    if (!(children as any)?.id) {
      throw new Error("No active child found")
    }

    const childId = (children as any).id

    // Determine question count based on session type
    const questionCount = sessionType === "quick" ? 10 : sessionType === "focus" ? 25 : 50

    // Build question criteria
    const criteria: QuestionCriteria = {
      childId,
      sessionType,
      count: questionCount,
    }

    // Add subject/topic filters for focus mode
    if (sessionType === "focus" && options?.subject) {
      criteria.subject = options.subject
      if (options.topics && options.topics.length > 0) {
        criteria.topics = options.topics
      }
    }

    // Select questions
    const selectedQuestions = await selectQuestions(criteria)

    if (selectedQuestions.length === 0) {
      throw new Error("No questions available for this criteria")
    }

    // Create session record
    const { data: sessionData, error: sessionError } = await supabase
      .from("practice_sessions")
      .insert({
        child_id: childId,
        session_type: sessionType,
        total_questions: selectedQuestions.length,
        started_at: new Date().toISOString(),
      } as any)
      .select()
      .single()

    if (sessionError || !sessionData) {
      throw new Error("Failed to create session")
    }

    // Transform questions for client
    const questions: SessionQuestion[] = selectedQuestions.map((q) => ({
      id: q.id,
      questionText: q.question_text,
      subject: q.subject,
      topic: q.topic,
      difficulty: q.difficulty,
      emberScore: q.ember_score,
      curriculumReference: q.curriculum_reference,
      options: q.options.map((opt) => ({
        id: opt.id,
        text: opt.text,
      })),
      correctAnswerId: q.correct_answer,
      explanations: {
        stepByStep: q.explanations.step_by_step,
        visual: q.explanations.visual,
        example: q.explanations.worked_example,
      },
    }))

    // Build session state
    const sessionState: SessionState = {
      sessionId: (sessionData as any).id,
      childId: childId,
      type: sessionType,
      questions,
      currentIndex: 0,
      answers: {},
      questionStartTimes: {},
      questionTimings: {},
      startedAt: new Date((sessionData as any).started_at),
      timeElapsed: 0,
      timeLimit: sessionType === "mock" ? 45 * 60 : undefined, // 45 minutes for mock
      isPaused: false,
      isComplete: false,
    }

    return sessionState
  } catch (error) {
    console.error("Error creating session:", error)
    return null
  }
}

/**
 * Load an existing session
 * 
 * Retrieves session data from database if resuming.
 * 
 * @param sessionId - Session ID to load
 * @returns Session state or null
 */
export async function loadSession(sessionId: string): Promise<SessionState | null> {
  try {
    const supabase = await createClient()

    // Get session
    const { data: sessionData, error } = await supabase
      .from("practice_sessions")
      .select("*")
      .eq("id", sessionId)
      .single()

    if (error || !sessionData) {
      return null
    }

    // Get attempts for this session
    const { data: attempts } = await supabase
      .from("question_attempts")
      .select("question_id, selected_answer")
      .eq("session_id", sessionId)

    // Build answers map
    const answers: Record<string, string> = {}
    attempts?.forEach((attempt: any) => {
      answers[attempt.question_id] = attempt.selected_answer
    })

    // TODO: Reconstruct full session state with questions
    // For now, return null and force new session
    return null
  } catch (error) {
    console.error("Error loading session:", error)
    return null
  }
}

/**
 * Submit an answer attempt
 * 
 * Records answer in database for analytics.
 * 
 * @param sessionId - Session ID
 * @param childId - Child ID
 * @param questionId - Question ID
 * @param answerId - Selected answer ID
 * @param correctAnswerId - Correct answer ID
 * @param timeSpent - Seconds spent on question
 * @returns Success boolean
 */
export async function submitAttempt(
  sessionId: string,
  childId: string,
  questionId: string,
  answerId: string,
  correctAnswerId: string,
  timeSpent: number
): Promise<boolean> {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from("question_attempts").insert({
      session_id: sessionId,
      child_id: childId,
      question_id: questionId,
      selected_answer: answerId,
      is_correct: answerId === correctAnswerId,
      time_taken_seconds: timeSpent,
    } as any)

    if (error) {
      console.error("Error submitting attempt:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error submitting attempt:", error)
    return false
  }
}

/**
 * Complete a practice session
 * 
 * Finalizes session, calculates score, updates statistics.
 * 
 * @param sessionId - Session ID
 * @returns Success boolean
 */
export async function completeSession(
  sessionId: string
): Promise<boolean> {
  try {
    const supabase = await createClient()

    // Get session attempts
    const { data: attempts, error: attemptsError } = await supabase
      .from("question_attempts")
      .select("is_correct")
      .eq("session_id", sessionId)

    if (attemptsError) {
      console.error("Error fetching attempts:", attemptsError)
      return false
    }

    if (!attempts || attempts.length === 0) {
      console.warn("No attempts found for session:", sessionId)
      // Still update the session as complete with 0 answers
    }

    const correctCount = attempts ? attempts.filter((a: any) => a.is_correct).length : 0
    const totalCount = attempts ? attempts.length : 0

    console.log("Completing session:", { sessionId, correctCount, totalCount, attemptsFound: attempts?.length })

    // Update session - only update completed_at and correct_answers
    // Don't update total_questions as it was set during creation
    const { data, error } = await (supabase
      .from("practice_sessions") as any)
      .update({
        completed_at: new Date().toISOString(),
        correct_answers: correctCount,
      })
      .eq("id", sessionId)
      .select()

    if (error) {
      console.error("Error completing session:", error)
      console.error("Error details:", JSON.stringify(error, null, 2))
      console.error("Update data:", { completed_at: new Date().toISOString(), correct_answers: correctCount })
      console.error("Session ID:", sessionId)
      // Don't return false - allow navigation to results even if update fails
      // The results page will calculate from attempts anyway
    } else {
      console.log("Session updated successfully:", data)
    }

    // Revalidate practice pages
    revalidatePath("/practice")
    revalidatePath("/progress")

    return true
  } catch (error) {
    console.error("Error completing session:", error)
    // Return true anyway - results page will calculate from attempts
    return true
  }
}
