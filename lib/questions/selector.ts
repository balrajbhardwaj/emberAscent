/**
 * Question Selection Logic
 * 
 * Intelligent question selection for practice sessions based on:
 * - Session type (quick, focus, mock)
 * - Child's performance history
 * - Adaptive difficulty
 * - Topic distribution
 * - Question freshness (avoid recently seen)
 * 
 * @module lib/questions/selector
 */

import { createClient } from "@/lib/supabase/server"

export interface QuestionCriteria {
  childId: string
  sessionType: "quick" | "focus" | "mock"
  subject?: string
  topics?: string[]
  difficulty?: "foundation" | "standard" | "challenge"
  count: number
}

export interface SelectedQuestion {
  id: string
  question_text: string
  subject: string
  topic: string | null
  difficulty: string
  ember_score: number
  curriculum_reference: string | null
  correct_answer: string
  options: Array<{
    id: string
    text: string
  }>
  explanations: {
    step_by_step: string
    visual: string | null
    worked_example: string | null
  }
}

/**
 * Select questions for a practice session
 * 
 * Uses intelligent algorithm to pick appropriate questions based on:
 * 1. Child's recent performance (adaptive difficulty)
 * 2. Topic coverage (distribute across selected topics)
 * 3. Question freshness (avoid recent repeats)
 * 4. Difficulty progression (easier → harder)
 * 
 * @param criteria - Selection criteria including child ID, session type, and preferences
 * @returns Array of selected questions
 */
export async function selectQuestions(
  criteria: QuestionCriteria
): Promise<SelectedQuestion[]> {
  const supabase = await createClient()

  // Base query - questions table has options and explanations as JSONB columns
  let query = supabase
    .from("questions")
    .select(`
      id,
      question_text,
      subject,
      topic,
      difficulty,
      ember_score,
      curriculum_reference,
      correct_answer,
      options,
      explanations
    `)
    .eq("is_published", true)

  // Apply subject filter
  if (criteria.subject) {
    query = query.eq("subject", criteria.subject)
  }

  // Apply topic filter
  if (criteria.topics && criteria.topics.length > 0) {
    query = query.in("topic", criteria.topics)
  }

  // Apply difficulty filter
  if (criteria.difficulty) {
    query = query.eq("difficulty", criteria.difficulty)
  }

  // Get questions
  const { data: questions, error } = await query

  if (error) {
    console.error("Error fetching questions:", error)
    return []
  }

  if (!questions || questions.length === 0) {
    return []
  }

  // Get child's recent attempts to avoid repeats
  const { data: recentAttempts } = await supabase
    .from("question_attempts")
    .select("question_id")
    .eq("child_id", criteria.childId)
    .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
    .order("created_at", { ascending: false })
    .limit(50)

  const recentQuestionIds = new Set(
    recentAttempts?.map((a) => a.question_id) || []
  )

  // Filter out recently seen questions
  const freshQuestions = questions.filter(
    (q) => !recentQuestionIds.has(q.id)
  )

  // If not enough fresh questions, include some recent ones
  const availableQuestions =
    freshQuestions.length >= criteria.count ? freshQuestions : questions

  // Get child's performance to determine adaptive difficulty
  const { data: performanceData } = await supabase
    .from("question_attempts")
    .select("is_correct")
    .eq("child_id", criteria.childId)
    .order("created_at", { ascending: false })
    .limit(20)

  const recentCorrectRate =
    performanceData && performanceData.length > 0
      ? performanceData.filter((a) => a.is_correct).length / performanceData.length
      : 0.5

  // Determine difficulty distribution based on performance
  let difficultyWeights: Record<string, number>
  
  if (recentCorrectRate > 0.8) {
    // Performing well - more challenging questions
    difficultyWeights = { foundation: 0.2, standard: 0.3, challenge: 0.5 }
  } else if (recentCorrectRate > 0.6) {
    // Average performance - balanced mix
    difficultyWeights = { foundation: 0.3, standard: 0.4, challenge: 0.3 }
  } else {
    // Struggling - more foundational questions
    difficultyWeights = { foundation: 0.5, standard: 0.4, challenge: 0.1 }
  }

  // Group questions by difficulty
  const byDifficulty: Record<string, typeof availableQuestions> = {
    foundation: [],
    standard: [],
    challenge: [],
  }

  availableQuestions.forEach((q) => {
    if (byDifficulty[q.difficulty]) {
      byDifficulty[q.difficulty].push(q)
    }
  })

  // Select questions according to difficulty distribution
  const selected: typeof availableQuestions = []

  Object.entries(difficultyWeights).forEach(([difficulty, weight]) => {
    const targetCount = Math.round(criteria.count * weight)
    const pool = byDifficulty[difficulty] || []
    
    // Shuffle and take
    const shuffled = pool.sort(() => Math.random() - 0.5)
    selected.push(...shuffled.slice(0, targetCount))
  })

  // If we don't have enough, fill with random questions
  if (selected.length < criteria.count) {
    const remaining = availableQuestions
      .filter((q) => !selected.includes(q))
      .sort(() => Math.random() - 0.5)
    selected.push(...remaining.slice(0, criteria.count - selected.length))
  }

  // Shuffle final selection and trim to exact count
  const final = selected.sort(() => Math.random() - 0.5).slice(0, criteria.count)

  // Transform to expected format
  return final.map((q) => {
    // Parse options - stored as JSONB array with {id, text} format
    const options = Array.isArray(q.options) 
      ? q.options.map((opt: any) => ({
          id: opt.id,
          text: opt.text,
        }))
      : []

    // Parse explanations - stored as JSONB object
    const explanations = q.explanations && typeof q.explanations === 'object'
      ? {
          step_by_step: (q.explanations as any).step_by_step || "Explanation not available.",
          visual: (q.explanations as any).visual || null,
          worked_example: (q.explanations as any).worked_example || null,
        }
      : {
          step_by_step: "Explanation not available.",
          visual: null,
          worked_example: null,
        }

    return {
      id: q.id,
      question_text: q.question_text,
      subject: q.subject,
      topic: q.topic,
      difficulty: q.difficulty,
      ember_score: q.ember_score ?? 75,
      curriculum_reference: q.curriculum_reference || null,
      correct_answer: q.correct_answer,
      options,
      explanations,
    }
  })
}

/**
 * Get recommended difficulty for a child
 * 
 * @param childId - Child identifier
 * @param subject - Optional subject filter
 * @returns Recommended difficulty level
 */
export async function getRecommendedDifficulty(
  childId: string,
  subject?: string
): Promise<"foundation" | "standard" | "challenge"> {
  const supabase = await createClient()

  let query = supabase
    .from("question_attempts")
    .select("is_correct, questions(subject)")
    .eq("child_id", childId)
    .order("created_at", { ascending: false })
    .limit(30)

  const { data: attempts } = await query

  if (!attempts || attempts.length < 5) {
    return "standard" // Default for new users
  }

  // Filter by subject if specified
  const relevantAttempts = subject
    ? attempts.filter((a: any) => a.questions?.subject === subject)
    : attempts

  if (relevantAttempts.length === 0) {
    return "standard"
  }

  const correctRate =
    relevantAttempts.filter((a) => a.is_correct).length / relevantAttempts.length

  if (correctRate > 0.8) return "challenge"
  if (correctRate > 0.6) return "standard"
  return "foundation"
}
