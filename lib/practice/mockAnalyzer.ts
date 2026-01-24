/**
 * Mock Analyzer Library
 *
 * Functions for analyzing mock test results and generating insights
 */

import { createClient } from '@/lib/supabase/server'

export interface MockAnalysis {
  overview: {
    score: number
    totalQuestions: number
    correctAnswers: number
    percentage: number
    timeTaken: number
    timeLimit: number
  }
  bySubject: {
    subject: string
    correct: number
    total: number
    percentage: number
    avgTime: number
  }[]
  byDifficulty: {
    difficulty: string
    correct: number
    total: number
    percentage: number
  }[]
  byTopic: {
    topic: string
    subject: string
    correct: number
    total: number
    percentage: number
  }[]
  questions: {
    questionId: string
    questionText: string
    subject: string
    topic: string
    difficulty: string
    yourAnswer: string | null
    correctAnswer: string
    isCorrect: boolean
    timeTaken: number | null
    flagged: boolean
  }[]
  timeAnalysis: {
    avgTimePerQuestion: number
    fastestQuestion: number
    slowestQuestion: number
    timeBySubject: Record<string, number>
  }
  comparison?: {
    previousBestScore: number
    improvement: number
    averageForLevel: number
  }
}

export interface Recommendation {
  type: 'strength' | 'weakness' | 'focus' | 'timing'
  title: string
  description: string
  topics?: string[]
  priority: 'high' | 'medium' | 'low'
}

/**
 * Analyze mock test results
 */
export async function analyzeMockResults(sessionId: string): Promise<MockAnalysis | null> {
  const supabase = await createClient()

  // Get session
  const { data: session } = await supabase
    .from('practice_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('is_mock_test', true)
    .single()

  if (!session) return null

  // Get all responses with questions
  const { data: responses } = await supabase
    .from('session_responses')
    .select(`
      *,
      question:questions (
        id,
        subject,
        topic,
        question_text,
        correct_answer,
        difficulty
      )
    `)
    .eq('session_id', sessionId)
    .order('display_order')

  if (!responses) return null

  // Overview
  const totalQuestions = responses.length
  const correctAnswers = responses.filter((r) => r.is_correct).length
  const percentage = (correctAnswers / totalQuestions) * 100

  // By Subject
  const bySubject: Record<string, { correct: number; total: number; totalTime: number }> = {}
  const byDifficulty: Record<string, { correct: number; total: number }> = {}
  const byTopic: Record<string, { correct: number; total: number; subject: string }> = {}

  let totalTime = 0
  let questionCount = 0

  responses.forEach((r) => {
    const q = Array.isArray(r.question) ? r.question[0] : r.question
    if (!q) return

    // Subject
    if (!bySubject[q.subject]) {
      bySubject[q.subject] = { correct: 0, total: 0, totalTime: 0 }
    }
    bySubject[q.subject].total++
    if (r.is_correct) bySubject[q.subject].correct++
    if (r.time_taken_seconds) {
      bySubject[q.subject].totalTime += r.time_taken_seconds
      totalTime += r.time_taken_seconds
      questionCount++
    }

    // Difficulty
    if (!byDifficulty[q.difficulty]) {
      byDifficulty[q.difficulty] = { correct: 0, total: 0 }
    }
    byDifficulty[q.difficulty].total++
    if (r.is_correct) byDifficulty[q.difficulty].correct++

    // Topic
    if (!byTopic[q.topic]) {
      byTopic[q.topic] = { correct: 0, total: 0, subject: q.subject }
    }
    byTopic[q.topic].total++
    if (r.is_correct) byTopic[q.topic].correct++
  })

  // Time analysis
  const times = responses
    .map((r) => r.time_taken_seconds)
    .filter((t): t is number => t !== null)
  const avgTimePerQuestion = questionCount > 0 ? totalTime / questionCount : 0
  const fastestQuestion = times.length > 0 ? Math.min(...times) : 0
  const slowestQuestion = times.length > 0 ? Math.max(...times) : 0

  const timeBySubject: Record<string, number> = {}
  Object.entries(bySubject).forEach(([subject, data]) => {
    timeBySubject[subject] = data.total > 0 ? data.totalTime / data.total : 0
  })

  // Format questions
  const questions = responses.map((r) => {
    const q = Array.isArray(r.question) ? r.question[0] : r.question
    return {
      questionId: r.question_id,
      questionText: q?.question_text || '',
      subject: q?.subject || '',
      topic: q?.topic || '',
      difficulty: q?.difficulty || '',
      yourAnswer: r.answer_given,
      correctAnswer: q?.correct_answer || '',
      isCorrect: r.is_correct || false,
      timeTaken: r.time_taken_seconds,
      flagged: r.flagged_for_review || false,
    }
  })

  return {
    overview: {
      score: correctAnswers,
      totalQuestions,
      correctAnswers,
      percentage,
      timeTaken: session.time_taken_seconds || 0,
      timeLimit: session.time_limit_seconds || 0,
    },
    bySubject: Object.entries(bySubject).map(([subject, data]) => ({
      subject,
      correct: data.correct,
      total: data.total,
      percentage: (data.correct / data.total) * 100,
      avgTime: data.total > 0 ? data.totalTime / data.total : 0,
    })),
    byDifficulty: Object.entries(byDifficulty).map(([difficulty, data]) => ({
      difficulty,
      correct: data.correct,
      total: data.total,
      percentage: (data.correct / data.total) * 100,
    })),
    byTopic: Object.entries(byTopic)
      .map(([topic, data]) => ({
        topic,
        subject: data.subject,
        correct: data.correct,
        total: data.total,
        percentage: (data.correct / data.total) * 100,
      }))
      .sort((a, b) => a.percentage - b.percentage), // Weakest first
    questions,
    timeAnalysis: {
      avgTimePerQuestion,
      fastestQuestion,
      slowestQuestion,
      timeBySubject,
    },
  }
}

/**
 * Generate recommendations based on analysis
 */
export function generateRecommendations(analysis: MockAnalysis): Recommendation[] {
  const recommendations: Recommendation[] = []

  // Check for strengths
  const strongSubjects = analysis.bySubject.filter((s) => s.percentage >= 80)
  if (strongSubjects.length > 0) {
    recommendations.push({
      type: 'strength',
      title: 'Strong Performance',
      description: `Excellent work in ${strongSubjects.map((s) => s.subject).join(', ')}! Keep practicing to maintain this level.`,
      priority: 'low',
    })
  }

  // Check for weaknesses (subjects < 60%)
  const weakSubjects = analysis.bySubject.filter((s) => s.percentage < 60)
  if (weakSubjects.length > 0) {
    const topics = analysis.byTopic
      .filter((t) => weakSubjects.some((s) => s.subject === t.subject) && t.percentage < 60)
      .slice(0, 3)
      .map((t) => t.topic)

    recommendations.push({
      type: 'weakness',
      title: 'Areas Needing Focus',
      description: `Focus on improving ${weakSubjects.map((s) => s.subject).join(', ')}. These subjects need more practice.`,
      topics,
      priority: 'high',
    })
  }

  // Check weakest topics overall
  const weakestTopics = analysis.byTopic.filter((t) => t.percentage < 50).slice(0, 3)
  if (weakestTopics.length > 0) {
    recommendations.push({
      type: 'focus',
      title: 'Priority Topics',
      description: `Practice these specific topics: ${weakestTopics.map((t) => t.topic).join(', ')}`,
      topics: weakestTopics.map((t) => t.topic),
      priority: 'high',
    })
  }

  // Check difficulty levels
  const weakDifficulty = analysis.byDifficulty.find(
    (d) => d.difficulty === 'Challenge' && d.percentage < 40
  )
  if (weakDifficulty) {
    recommendations.push({
      type: 'focus',
      title: 'Challenge Questions',
      description: 'Practice more Challenge-level questions to build confidence with harder material.',
      priority: 'medium',
    })
  }

  // Check timing
  if (analysis.timeAnalysis.avgTimePerQuestion > 90) {
    recommendations.push({
      type: 'timing',
      title: 'Speed Up',
      description: `Your average time per question (${Math.round(analysis.timeAnalysis.avgTimePerQuestion)}s) is above target. Practice with a timer to improve speed.`,
      priority: 'medium',
    })
  }

  // Check for slow subjects
  const slowSubjects = Object.entries(analysis.timeAnalysis.timeBySubject)
    .filter(([, time]) => time > 100)
    .map(([subject]) => subject)

  if (slowSubjects.length > 0) {
    recommendations.push({
      type: 'timing',
      title: 'Time Management',
      description: `You're spending too long on ${slowSubjects.join(', ')}. Try to answer more quickly and move on if stuck.`,
      priority: 'medium',
    })
  }

  return recommendations
}

/**
 * Compare to previous mock tests
 */
export async function compareToPreviousMocks(childId: string, currentScore: number) {
  const supabase = await createClient()

  const { data: previousMocks } = await supabase
    .from('practice_sessions')
    .select('correct_answers, total_questions, completed_at')
    .eq('child_id', childId)
    .eq('is_mock_test', true)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(10)

  if (!previousMocks || previousMocks.length === 0) {
    return null
  }

  const scores = previousMocks.map((m) => (m.correct_answers / m.total_questions) * 100)
  const previousBestScore = Math.max(...scores.slice(1)) // Exclude current
  const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length

  return {
    previousBestScore,
    improvement: currentScore - previousBestScore,
    averageForLevel: averageScore,
    totalMocks: previousMocks.length,
  }
}
