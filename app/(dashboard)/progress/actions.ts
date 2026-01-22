/**
 * Progress Dashboard Server Actions
 * 
 * Fetches and calculates progress statistics including:
 * - Overview stats (total questions, streak, weekly practice, accuracy)
 * - Subject-specific progress
 * - Recent activity timeline
 * - Weekly practice chart data
 * - Weak areas identification
 * 
 * @module app/(dashboard)/progress/actions
 */
"use server"

import { createClient } from "@/lib/supabase/server"

export interface OverviewStats {
  totalQuestions: number
  currentStreak: number
  weeklyQuestions: number
  overallAccuracy: number
}

export interface SubjectStats {
  subject: string
  accuracy: number
  questionsAttempted: number
  trend: "up" | "down" | "neutral"
  trendValue: number // percentage change
}

export interface RecentSession {
  id: string
  date: string
  sessionType: "quick" | "focus" | "mock"
  subject: string | null
  score: number
  questionsAnswered: number
  totalQuestions: number
}

export interface DailyActivity {
  date: string
  questionsAnswered: number
  hasSession: boolean
}

export interface WeakTopic {
  topic: string
  subject: string
  accuracy: number
  questionsAttempted: number
}

/**
 * Get overview statistics
 * 
 * @param childId - Child identifier
 * @returns Overview stats
 */
export async function getOverviewStats(childId: string): Promise<OverviewStats | null> {
  try {
    const supabase = await createClient()

    // Get all attempts
    const { data: allAttempts } = await supabase
      .from("question_attempts")
      .select("is_correct, created_at")
      .eq("child_id", childId)
      .order("created_at", { ascending: false })

    const totalQuestions = allAttempts?.length || 0
    const correctAnswers = allAttempts?.filter((a) => a.is_correct).length || 0
    const overallAccuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0

    // Calculate current streak (use question_attempts dates since sessions may not have status)
    const uniqueDates = [...new Set(
      allAttempts?.map(a => new Date(a.created_at).toDateString()) || []
    )]
    const currentStreak = calculateStreakFromDates(uniqueDates)

    // Get this week's questions
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - 7)

    const { data: weeklyAttempts } = await supabase
      .from("question_attempts")
      .select("id")
      .eq("child_id", childId)
      .gte("created_at", weekStart.toISOString())

    const weeklyQuestions = weeklyAttempts?.length || 0

    return {
      totalQuestions,
      currentStreak,
      weeklyQuestions,
      overallAccuracy,
    }
  } catch (error) {
    console.error("Error fetching overview stats:", error)
    return null
  }
}

/**
 * Calculate practice streak from date strings
 * 
 * @param dateStrings - Array of date strings (from toDateString())
 * @returns Current streak in days
 */
function calculateStreakFromDates(dateStrings: string[]): number {
  if (dateStrings.length === 0) return 0

  const sortedDays = [...new Set(dateStrings)]
    .map((day) => new Date(day))
    .sort((a, b) => b.getTime() - a.getTime())

  // Check if practiced today or yesterday
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const mostRecentDay = new Date(sortedDays[0])
  mostRecentDay.setHours(0, 0, 0, 0)

  if (mostRecentDay < yesterday) {
    return 0 // Streak broken
  }

  // Count consecutive days
  let streak = 1
  let currentDay = new Date(sortedDays[0])
  currentDay.setHours(0, 0, 0, 0)

  for (let i = 1; i < sortedDays.length; i++) {
    const nextDay = new Date(sortedDays[i])
    nextDay.setHours(0, 0, 0, 0)

    const dayDifference = Math.floor(
      (currentDay.getTime() - nextDay.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (dayDifference === 1) {
      streak++
      currentDay = nextDay
    } else {
      break
    }
  }

  return streak
}

// Map display names to database subject values
const subjectDbMap: Record<string, string> = {
  "Verbal Reasoning": "verbal_reasoning",
  "English": "english", 
  "Mathematics": "mathematics"
}

/**
 * Get subject-specific statistics with trends
 * 
 * @param childId - Child identifier
 * @returns Subject stats array
 */
export async function getSubjectStats(childId: string): Promise<SubjectStats[]> {
  try {
    const supabase = await createClient()

    const subjects = ["Verbal Reasoning", "English", "Mathematics"]
    const stats: SubjectStats[] = []

    // Get last week's date for trend calculation
    const lastWeekStart = new Date()
    lastWeekStart.setDate(lastWeekStart.getDate() - 14)
    const thisWeekStart = new Date()
    thisWeekStart.setDate(thisWeekStart.getDate() - 7)

    for (const subject of subjects) {
      const dbSubject = subjectDbMap[subject]
      // Get all attempts for this subject (using database subject name)
      const { data: attempts } = await supabase
        .from("question_attempts")
        .select("is_correct, created_at, questions!inner(subject)")
        .eq("child_id", childId)
        .eq("questions.subject", dbSubject)

      const questionsAttempted = attempts?.length || 0
      const correctAnswers = attempts?.filter((a) => a.is_correct).length || 0
      const accuracy = questionsAttempted > 0 ? Math.round((correctAnswers / questionsAttempted) * 100) : 0

      // Calculate trend (this week vs last week)
      const lastWeekAttempts = attempts?.filter(
        (a) => new Date(a.created_at) >= lastWeekStart && new Date(a.created_at) < thisWeekStart
      ) || []
      const thisWeekAttempts = attempts?.filter(
        (a) => new Date(a.created_at) >= thisWeekStart
      ) || []

      const lastWeekAccuracy = lastWeekAttempts.length > 0
        ? (lastWeekAttempts.filter((a) => a.is_correct).length / lastWeekAttempts.length) * 100
        : 0
      const thisWeekAccuracy = thisWeekAttempts.length > 0
        ? (thisWeekAttempts.filter((a) => a.is_correct).length / thisWeekAttempts.length) * 100
        : 0

      let trend: "up" | "down" | "neutral" = "neutral"
      let trendValue = 0

      if (lastWeekAccuracy > 0 && thisWeekAccuracy > 0) {
        trendValue = Math.round(thisWeekAccuracy - lastWeekAccuracy)
        if (trendValue > 2) trend = "up"
        else if (trendValue < -2) trend = "down"
      }

      stats.push({
        subject,
        accuracy,
        questionsAttempted,
        trend,
        trendValue,
      })
    }

    return stats
  } catch (error) {
    console.error("Error fetching subject stats:", error)
    return []
  }
}

/**
 * Get recent practice sessions
 * 
 * @param childId - Child identifier
 * @param limit - Number of sessions to fetch (default 10, use 5 for free tier)
 * @returns Recent sessions array
 */
// Map database subject values to display names
const subjectDisplayMap: Record<string, string> = {
  "verbal_reasoning": "Verbal Reasoning",
  "english": "English", 
  "mathematics": "Mathematics"
}

/**
 * Get recent practice sessions
 * 
 * @param childId - Child identifier
 * @param limit - Number of sessions to return
 * @returns Recent sessions array
 */
export async function getRecentSessions(childId: string, limit: number = 10): Promise<RecentSession[]> {
  try {
    const supabase = await createClient()

    // Get sessions (without status filter since column may not exist)
    const { data: sessions } = await supabase
      .from("practice_sessions")
      .select(`
        id,
        session_type,
        started_at,
        correct_answers,
        total_questions
      `)
      .eq("child_id", childId)
      .not("started_at", "is", null)
      .order("started_at", { ascending: false })
      .limit(limit)

    if (!sessions) return []

    return sessions.map((session: any) => {
      const score = session.total_questions > 0 
        ? Math.round((session.correct_answers / session.total_questions) * 100)
        : 0

      return {
        id: session.id,
        date: session.started_at,
        sessionType: session.session_type,
        subject: session.subject ? subjectDisplayMap[session.subject] || session.subject : null,
        score,
        questionsAnswered: session.correct_answers || 0,
        totalQuestions: session.total_questions || 0,
      }
    })
  } catch (error) {
    console.error("Error fetching recent sessions:", error)
    return []
  }
}

/**
 * Get daily activity for the last 7 days
 * 
 * @param childId - Child identifier
 * @returns Daily activity array
 */
export async function getDailyActivity(childId: string): Promise<DailyActivity[]> {
  try {
    const supabase = await createClient()

    // Get attempts from last 7 days
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - 7)
    weekStart.setHours(0, 0, 0, 0)

    const { data: attempts } = await supabase
      .from("question_attempts")
      .select("created_at")
      .eq("child_id", childId)
      .gte("created_at", weekStart.toISOString())

    // Group by day
    const dailyCounts: Record<string, number> = {}
    const today = new Date()

    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - (6 - i))
      date.setHours(0, 0, 0, 0)
      const dateStr = date.toISOString().split("T")[0]
      dailyCounts[dateStr] = 0
    }

    attempts?.forEach((attempt) => {
      const date = new Date(attempt.created_at)
      const dateStr = date.toISOString().split("T")[0]
      if (dailyCounts[dateStr] !== undefined) {
        dailyCounts[dateStr]++
      }
    })

    return Object.entries(dailyCounts).map(([date, count]) => ({
      date,
      questionsAnswered: count,
      hasSession: count > 0,
    }))
  } catch (error) {
    console.error("Error fetching daily activity:", error)
    return []
  }
}

/**
 * Get weak areas (topics with <60% accuracy)
 * 
 * @param childId - Child identifier
 * @param limit - Number of weak topics to return
 * @returns Weak topics array
 */
export async function getWeakAreas(childId: string, limit: number = 3): Promise<WeakTopic[]> {
  try {
    const supabase = await createClient()

    const { data: attempts } = await supabase
      .from("question_attempts")
      .select(`
        is_correct,
        questions!inner(
          subject,
          topic
        )
      `)
      .eq("child_id", childId)
      .not("questions.topic", "is", null)

    if (!attempts || attempts.length === 0) return []

    // Group by topic
    const topicStats: Record<string, {
      correct: number
      total: number
      subject: string
    }> = {}

    attempts.forEach((attempt: any) => {
      const topic = attempt.questions?.topic
      const subject = attempt.questions?.subject
      if (!topic || !subject) return

      if (!topicStats[topic]) {
        topicStats[topic] = { correct: 0, total: 0, subject }
      }

      topicStats[topic].total++
      if (attempt.is_correct) {
        topicStats[topic].correct++
      }
    })

    // Filter weak areas (<60%) and sort by lowest accuracy
    const weakTopics = Object.entries(topicStats)
      .filter(([_, stats]) => stats.total >= 5) // Minimum 5 attempts
      .map(([topic, stats]) => ({
        topic,
        subject: subjectDisplayMap[stats.subject] || stats.subject,
        accuracy: Math.round((stats.correct / stats.total) * 100),
        questionsAttempted: stats.total,
      }))
      .filter((t) => t.accuracy < 60)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, limit)

    return weakTopics
  } catch (error) {
    console.error("Error fetching weak areas:", error)
    return []
  }
}
