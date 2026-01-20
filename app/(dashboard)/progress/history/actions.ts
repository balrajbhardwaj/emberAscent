/**
 * Session History Server Actions
 * 
 * Fetches session history with filtering and pagination,
 * and individual session details for review.
 * 
 * @module app/(dashboard)/progress/history/actions
 */
"use server"

import { createClient } from "@/lib/supabase/server"

export interface SessionFilters {
  dateRange?: "7days" | "30days" | "all"
  subject?: string
  sessionType?: "quick" | "focus" | "mock"
}

export interface SessionHistoryItem {
  id: string
  date: string
  sessionType: "quick" | "focus" | "mock"
  subjects: string[]
  score: number
  questionsAnswered: number
  totalQuestions: number
  duration: number // seconds
}

export interface PaginatedSessions {
  sessions: SessionHistoryItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface QuestionReview {
  id: string
  questionText: string
  subject: string
  topic: string | null
  difficulty: string
  yourAnswer: string
  correctAnswer: string
  isCorrect: boolean
  timeTaken: number // seconds
  explanations: {
    stepByStep: string
    visual: string | null
    example: string | null
  }
  options: Array<{
    id: string
    text: string
    is_correct: boolean
  }>
}

export interface SessionDetail {
  id: string
  date: string
  sessionType: "quick" | "focus" | "mock"
  score: number
  questionsAnswered: number
  totalQuestions: number
  duration: number
  subjectBreakdown: Array<{
    subject: string
    correct: number
    total: number
    accuracy: number
  }>
  questions: QuestionReview[]
}

/**
 * Fetch session history with filters and pagination
 * 
 * @param childId - Child identifier
 * @param filters - Filter options
 * @param page - Page number (1-indexed)
 * @param pageSize - Items per page
 * @returns Paginated session history
 */
export async function fetchSessionHistory(
  childId: string,
  filters: SessionFilters = {},
  page: number = 1,
  pageSize: number = 20
): Promise<PaginatedSessions | null> {
  try {
    const supabase = await createClient()

    // Calculate date range
    let startDate: Date | null = null
    if (filters.dateRange === "7days") {
      startDate = new Date()
      startDate.setDate(startDate.getDate() - 7)
    } else if (filters.dateRange === "30days") {
      startDate = new Date()
      startDate.setDate(startDate.getDate() - 30)
    }

    // Build query
    let query = supabase
      .from("practice_sessions")
      .select("*, question_attempts!inner(questions!inner(subject))", { count: "exact" })
      .eq("child_id", childId)
      .eq("status", "completed")
      .order("started_at", { ascending: false })

    if (startDate) {
      query = query.gte("started_at", startDate.toISOString())
    }

    if (filters.sessionType) {
      query = query.eq("session_type", filters.sessionType)
    }

    // Get total count first
    const { count } = await query

    // Apply pagination
    const offset = (page - 1) * pageSize
    query = query.range(offset, offset + pageSize - 1)

    const { data: sessions, error } = await query

    if (error) {
      console.error("Error fetching session history:", error)
      return null
    }

    if (!sessions) {
      return {
        sessions: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0,
      }
    }

    // Transform sessions
    const transformedSessions: SessionHistoryItem[] = sessions
      .map((session: any) => {
        // Extract subjects from attempts
        const subjects = Array.from(
          new Set(
            session.question_attempts
              ?.map((a: any) => a.questions?.subject)
              .filter(Boolean) || []
          )
        ) as string[]

        // Filter by subject if specified
        if (filters.subject && !subjects.includes(filters.subject)) {
          return null
        }

        return {
          id: session.id,
          date: session.started_at,
          sessionType: session.session_type,
          subjects,
          score: session.score || 0,
          questionsAnswered: session.questions_answered || 0,
          totalQuestions: session.total_questions || 0,
          duration: session.time_spent || 0,
        }
      })
      .filter(Boolean) as SessionHistoryItem[]

    const totalPages = Math.ceil((count || 0) / pageSize)

    return {
      sessions: transformedSessions,
      total: count || 0,
      page,
      pageSize,
      totalPages,
    }
  } catch (error) {
    console.error("Error fetching session history:", error)
    return null
  }
}

/**
 * Fetch detailed session information including question review
 * 
 * @param sessionId - Session identifier
 * @returns Session detail with all questions
 */
export async function fetchSessionDetail(sessionId: string): Promise<SessionDetail | null> {
  try {
    const supabase = await createClient()

    // Fetch session
    const { data: session, error: sessionError } = await supabase
      .from("practice_sessions")
      .select("*")
      .eq("id", sessionId)
      .single()

    if (sessionError || !session) {
      console.error("Error fetching session:", sessionError)
      return null
    }

    // Fetch attempts with full question data
    const { data: attempts, error: attemptsError } = await supabase
      .from("question_attempts")
      .select(`
        id,
        selected_answer,
        is_correct,
        time_taken_seconds,
        questions!inner(
          id,
          question_text,
          subject,
          topic,
          difficulty,
          question_options(
            id,
            option_text,
            is_correct
          ),
          question_explanations(
            step_by_step,
            visual_analogy,
            worked_example
          )
        )
      `)
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true })

    if (attemptsError || !attempts) {
      console.error("Error fetching attempts:", attemptsError)
      return null
    }

    // Calculate subject breakdown
    const subjectStats: Record<string, { correct: number; total: number }> = {}

    attempts.forEach((attempt: any) => {
      const subject = attempt.questions?.subject
      if (!subject) return

      if (!subjectStats[subject]) {
        subjectStats[subject] = { correct: 0, total: 0 }
      }

      subjectStats[subject].total++
      if (attempt.is_correct) {
        subjectStats[subject].correct++
      }
    })

    const subjectBreakdown = Object.entries(subjectStats).map(([subject, stats]) => ({
      subject,
      correct: stats.correct,
      total: stats.total,
      accuracy: Math.round((stats.correct / stats.total) * 100),
    }))

    // Transform questions
    const questions: QuestionReview[] = attempts.map((attempt: any) => {
      const question = attempt.questions
      const options = Array.isArray(question.question_options) ? question.question_options : []
      const correctOption = options.find((opt: any) => opt.is_correct)
      const explanations = Array.isArray(question.question_explanations) && question.question_explanations[0]
        ? question.question_explanations[0]
        : { step_by_step: "No explanation available", visual_analogy: null, worked_example: null }

      return {
        id: question.id,
        questionText: question.question_text,
        subject: question.subject,
        topic: question.topic,
        difficulty: question.difficulty,
        yourAnswer: attempt.selected_answer || "",
        correctAnswer: correctOption?.id || "",
        isCorrect: attempt.is_correct,
        timeTaken: attempt.time_taken_seconds || 0,
        explanations: {
          stepByStep: explanations.step_by_step,
          visual: explanations.visual_analogy,
          example: explanations.worked_example,
        },
        options: options.map((opt: any) => ({
          id: opt.id,
          text: opt.option_text,
          is_correct: opt.is_correct,
        })),
      }
    })

    return {
      id: session.id,
      date: session.started_at,
      sessionType: session.session_type as "quick" | "focus" | "mock",
      score: Math.round((session.correct_answers / session.total_questions) * 100) || 0,
      questionsAnswered: session.total_questions,
      totalQuestions: session.total_questions,
      duration: 0, // Duration not available in current schema
      subjectBreakdown,
      questions,
    }
  } catch (error) {
    console.error("Error fetching session detail:", error)
    return null
  }
}
