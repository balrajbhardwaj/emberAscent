/**
 * Intelligent Question Selection Service
 * 
 * Selects optimal questions using weighted criteria:
 * - Difficulty match (40%): Prefer questions matching current difficulty
 * - Topic coverage (25%): Balance coverage across subtopics
 * - Recency avoidance (20%): Avoid recently attempted questions
 * - Weak area focus (15%): Prioritize areas needing improvement
 * 
 * @module lib/adaptive/questionSelector
 */

import { createClient } from '@/lib/supabase/server'
import type {
  QuestionSelectionCriteria,
  QuestionSelectionWeights,
  ScoredQuestion,
  DifficultyLevel,
} from '@/types/adaptive'

/**
 * Default selection weights
 */
const DEFAULT_WEIGHTS: QuestionSelectionWeights = {
  difficultyMatch: 0.40, // 40%
  topicCoverage: 0.25, // 25%
  recencyAvoidance: 0.20, // 20%
  weakAreaFocus: 0.15, // 15%
}

/**
 * Recency penalty configuration (in days)
 */
const RECENCY_CONFIG = {
  TODAY: 0, // 0% score if attempted today
  YESTERDAY: 0.3, // 30% score if attempted yesterday
  WEEK_AGO: 0.7, // 70% score if attempted this week
  OLDER: 1.0, // 100% score if older than a week
}

/**
 * Select optimal next question using weighted scoring
 * 
 * @param criteria - Selection criteria
 * @returns Selected question ID or null if none available
 * 
 * @example
 * const questionId = await selectNextQuestion({
 *   childId: 'child_123',
 *   topicId: 'topic_456',
 *   currentDifficulty: 'standard',
 *   excludeQuestionIds: ['q1', 'q2']
 * })
 */
export async function selectNextQuestion(
  criteria: QuestionSelectionCriteria
): Promise<string | null> {
  const candidates = await getCandidateQuestions(criteria)
  
  if (candidates.length === 0) {
    return null
  }
  
  const weights = { ...DEFAULT_WEIGHTS, ...criteria.weights }
  const scoredCandidates = await scoreQuestions(candidates, criteria, weights)
  
  // Sort by score descending
  scoredCandidates.sort((a, b) => b.score - a.score)
  
  // Return top question
  return scoredCandidates[0]?.questionId || null
}

/**
 * Get multiple question recommendations
 * 
 * @param criteria - Selection criteria with limit
 * @returns Array of question IDs ordered by score
 * 
 * @example
 * const questions = await selectMultipleQuestions({
 *   childId: 'child_123',
 *   topicId: 'topic_456',
 *   currentDifficulty: 'standard',
 *   limit: 5
 * })
 */
export async function selectMultipleQuestions(
  criteria: QuestionSelectionCriteria
): Promise<string[]> {
  const candidates = await getCandidateQuestions(criteria)
  
  if (candidates.length === 0) {
    return []
  }
  
  const weights = { ...DEFAULT_WEIGHTS, ...criteria.weights }
  const scoredCandidates = await scoreQuestions(candidates, criteria, weights)
  
  // Sort by score descending
  scoredCandidates.sort((a, b) => b.score - a.score)
  
  // Return top N
  const limit = criteria.limit || 5
  return scoredCandidates.slice(0, limit).map(c => c.questionId)
}

/**
 * Fetch candidate questions from database
 * 
 * @param criteria - Selection criteria
 * @returns Array of candidate questions with metadata
 */
async function getCandidateQuestions(
  criteria: QuestionSelectionCriteria
): Promise<ScoredQuestion[]> {
  const supabase = await createClient()
  const { topicId, excludeQuestionIds = [] } = criteria
  
  // Query questions with recent attempt history from child_question_history
  let query = supabase
    .from('questions')
    .select(`
      id,
      difficulty,
      topic,
      subtopic
    `)
    .eq('is_published', true)
  
  // Only filter by topic if not 'general' (which means all topics)
  if (topicId && topicId !== 'general') {
    query = query.ilike('topic', `%${topicId}%`)
  }
  
  if (excludeQuestionIds.length > 0) {
    query = query.not('id', 'in', `(${excludeQuestionIds.join(',')})`)
  }
  
  const { data: questions, error } = await query.order('created_at', { ascending: false })
  
  if (error || !questions) {
    console.error('Error fetching candidate questions:', error)
    return []
  }
  
  // Get recent attempts for these questions from child_question_history
  const questionIds = questions.map(q => q.id)
  const { data: recentAttempts } = await supabase
    .from('child_question_history')
    .select('question_id, attempted_at')
    .eq('child_id', criteria.childId)
    .in('question_id', questionIds)
    .order('attempted_at', { ascending: false })
  
  // Create a map of question_id -> last attempt date
  const attemptMap = new Map<string, Date>()
  recentAttempts?.forEach(attempt => {
    if (!attemptMap.has(attempt.question_id)) {
      attemptMap.set(attempt.question_id, new Date(attempt.attempted_at))
    }
  })
  
  // Transform to ScoredQuestion format
  return questions.map(q => ({
    questionId: q.id,
    score: 0, // Will be calculated later
    difficulty: q.difficulty as DifficultyLevel,
    topicId: q.topic || topicId,
    subtopicName: q.subtopic || null,
    lastAttemptedAt: attemptMap.get(q.id) || null,
  }))
}



/**
 * Score all candidate questions using weighted criteria
 * 
 * @param candidates - Candidate questions
 * @param criteria - Selection criteria
 * @param weights - Scoring weights
 * @returns Scored questions
 */
async function scoreQuestions(
  candidates: ScoredQuestion[],
  criteria: QuestionSelectionCriteria,
  weights: QuestionSelectionWeights
): Promise<ScoredQuestion[]> {
  const { childId, currentDifficulty } = criteria
  
  // Get child's performance data for weak area calculation
  const weakAreas = await getChildWeakAreas(childId, criteria.topicId)
  const subtopicAttempts = await getSubtopicAttemptCounts(childId, criteria.topicId)
  
  return candidates.map(candidate => {
    const difficultyScore = calculateDifficultyScore(candidate.difficulty, currentDifficulty)
    const coverageScore = calculateCoverageScore(candidate.subtopicName, subtopicAttempts)
    const recencyScore = calculateRecencyScore(candidate.lastAttemptedAt)
    const weakAreaScore = calculateWeakAreaScore(candidate.subtopicName, weakAreas)
    
    // Weighted total
    const totalScore =
      difficultyScore * weights.difficultyMatch +
      coverageScore * weights.topicCoverage +
      recencyScore * weights.recencyAvoidance +
      weakAreaScore * weights.weakAreaFocus
    
    return {
      ...candidate,
      score: totalScore,
    }
  })
}

/**
 * Calculate difficulty match score (0-1)
 * 
 * Perfect match = 1.0
 * Adjacent level = 0.5
 * Two levels away = 0.1
 */
function calculateDifficultyScore(
  questionDifficulty: DifficultyLevel,
  targetDifficulty: DifficultyLevel
): number {
  if (questionDifficulty === targetDifficulty) {
    return 1.0 // Perfect match
  }
  
  const order: DifficultyLevel[] = ['foundation', 'standard', 'challenge']
  const questionIndex = order.indexOf(questionDifficulty)
  const targetIndex = order.indexOf(targetDifficulty)
  const distance = Math.abs(questionIndex - targetIndex)
  
  if (distance === 1) {
    return 0.5 // Adjacent level
  }
  
  return 0.1 // Too far
}

/**
 * Calculate topic coverage score (0-1)
 * 
 * Prioritizes subtopics with fewer attempts to ensure balanced coverage
 */
function calculateCoverageScore(
  subtopicName: string | null,
  subtopicAttempts: Map<string, number>
): number {
  if (!subtopicName) {
    return 0.5 // Neutral score for questions without subtopic
  }
  
  const attempts = subtopicAttempts.get(subtopicName) || 0
  
  // Never attempted = highest score
  if (attempts === 0) {
    return 1.0
  }
  
  // Diminishing returns: 1 / (1 + log(attempts + 1))
  return 1 / (1 + Math.log10(attempts + 1))
}

/**
 * Calculate recency avoidance score (0-1)
 * 
 * Recent questions get lower scores to avoid repetition
 */
function calculateRecencyScore(lastAttemptedAt: Date | null): number {
  if (!lastAttemptedAt) {
    return RECENCY_CONFIG.OLDER // Never attempted = highest score
  }
  
  const now = new Date()
  const daysSince = (now.getTime() - lastAttemptedAt.getTime()) / (1000 * 60 * 60 * 24)
  
  if (daysSince < 1) {
    return RECENCY_CONFIG.TODAY // Attempted today
  } else if (daysSince < 2) {
    return RECENCY_CONFIG.YESTERDAY // Attempted yesterday
  } else if (daysSince < 7) {
    return RECENCY_CONFIG.WEEK_AGO // Attempted this week
  } else {
    return RECENCY_CONFIG.OLDER // Older than a week
  }
}

/**
 * Calculate weak area focus score (0-1)
 * 
 * Prioritizes subtopics where child is struggling
 */
function calculateWeakAreaScore(
  subtopicName: string | null,
  weakAreas: Map<string, number>
): number {
  if (!subtopicName) {
    return 0.5 // Neutral score
  }
  
  const accuracy = weakAreas.get(subtopicName)
  
  if (accuracy === undefined) {
    return 0.7 // Moderate priority for unexplored areas
  }
  
  // Lower accuracy = higher priority
  // 0% accuracy = 1.0 score
  // 50% accuracy = 0.5 score
  // 100% accuracy = 0.0 score
  return 1.0 - accuracy
}

/**
 * Get child's weak areas (subtopics with low accuracy)
 * 
 * @param childId - Child's unique ID
 * @param topicId - Topic ID to analyze
 * @returns Map of subtopic name to accuracy (0-1)
 */
async function getChildWeakAreas(
  childId: string,
  topicId: string
): Promise<Map<string, number>> {
  const supabase = await createClient()
  
  // Get attempts from child_question_history
  const { data: history } = await supabase
    .from('child_question_history')
    .select('subtopic_name, is_correct')
    .eq('child_id', childId)
    .ilike('topic_id', `%${topicId}%`)
  
  if (!history || history.length === 0) {
    return new Map()
  }
  
  // Group by subtopic and calculate accuracy
  const subtopicStats = new Map<string, { correct: number; total: number }>()
  
  history.forEach((attempt: any) => {
    const subtopic = attempt.subtopic_name
    if (!subtopic) return
    
    const stats = subtopicStats.get(subtopic) || { correct: 0, total: 0 }
    stats.total++
    if (attempt.is_correct) {
      stats.correct++
    }
    subtopicStats.set(subtopic, stats)
  })
  
  // Convert to accuracy map
  const weakAreas = new Map<string, number>()
  subtopicStats.forEach((stats, subtopic) => {
    const accuracy = stats.correct / stats.total
    weakAreas.set(subtopic, accuracy)
  })
  
  return weakAreas
}

/**
 * Get attempt counts per subtopic for coverage calculation
 * 
 * @param childId - Child's unique ID
 * @param topicId - Topic ID to analyze
 * @returns Map of subtopic name to attempt count
 */
async function getSubtopicAttemptCounts(
  childId: string,
  topicId: string
): Promise<Map<string, number>> {
  const supabase = await createClient()
  
  // Get attempts from child_question_history
  const { data: history } = await supabase
    .from('child_question_history')
    .select('subtopic_name')
    .eq('child_id', childId)
    .ilike('topic_id', `%${topicId}%`)
  
  if (!history || history.length === 0) {
    return new Map()
  }
  
  // Count attempts per subtopic
  const counts = new Map<string, number>()
  history.forEach((attempt: any) => {
    const subtopic = attempt.subtopic_name
    if (!subtopic) return
    
    counts.set(subtopic, (counts.get(subtopic) || 0) + 1)
  })
  
  return counts
}

/**
 * Explain selection scoring for debugging
 * 
 * @param questionId - Question ID to analyze
 * @param criteria - Selection criteria
 * @returns Detailed scoring breakdown
 */
export async function explainQuestionScore(
  questionId: string,
  criteria: QuestionSelectionCriteria
): Promise<{
  questionId: string
  totalScore: number
  breakdown: {
    difficultyMatch: { score: number; weight: number; weighted: number }
    topicCoverage: { score: number; weight: number; weighted: number }
    recencyAvoidance: { score: number; weight: number; weighted: number }
    weakAreaFocus: { score: number; weight: number; weighted: number }
  }
} | null> {
  const candidates = await getCandidateQuestions(criteria)
  const question = candidates.find(c => c.questionId === questionId)
  
  if (!question) {
    return null
  }
  
  const weights = { ...DEFAULT_WEIGHTS, ...criteria.weights }
  const weakAreas = await getChildWeakAreas(criteria.childId, criteria.topicId)
  const subtopicAttempts = await getSubtopicAttemptCounts(criteria.childId, criteria.topicId)
  
  const difficultyScore = calculateDifficultyScore(question.difficulty, criteria.currentDifficulty)
  const coverageScore = calculateCoverageScore(question.subtopicName, subtopicAttempts)
  const recencyScore = calculateRecencyScore(question.lastAttemptedAt)
  const weakAreaScore = calculateWeakAreaScore(question.subtopicName, weakAreas)
  
  const totalScore =
    difficultyScore * weights.difficultyMatch +
    coverageScore * weights.topicCoverage +
    recencyScore * weights.recencyAvoidance +
    weakAreaScore * weights.weakAreaFocus
  
  return {
    questionId,
    totalScore,
    breakdown: {
      difficultyMatch: {
        score: difficultyScore,
        weight: weights.difficultyMatch,
        weighted: difficultyScore * weights.difficultyMatch,
      },
      topicCoverage: {
        score: coverageScore,
        weight: weights.topicCoverage,
        weighted: coverageScore * weights.topicCoverage,
      },
      recencyAvoidance: {
        score: recencyScore,
        weight: weights.recencyAvoidance,
        weighted: recencyScore * weights.recencyAvoidance,
      },
      weakAreaFocus: {
        score: weakAreaScore,
        weight: weights.weakAreaFocus,
        weighted: weakAreaScore * weights.weakAreaFocus,
      },
    },
  }
}
