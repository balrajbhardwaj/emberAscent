/**
 * Study Plan Generator
 * 
 * Generates personalized weekly study plans based on child's performance.
 * Prioritizes weak areas while maintaining subject balance.
 * 
 * @module lib/analytics/studyPlanGenerator
 */

import { createClient } from '@/lib/supabase/server'
import type {
  StudyPlan,
  DailyPlan,
  PlannedActivity,
  FocusArea,
  StudyGoal
} from '@/types/analytics'

// =============================================================================
// TYPES
// =============================================================================

export interface PlanOptions {
  /** Target practice minutes per day */
  dailyMinutes?: number
  /** Which days to include (0 = Sunday) */
  activeDays?: number[]
  /** Maximum activities per day */
  maxActivitiesPerDay?: number
  /** Focus on weak areas vs balanced */
  focusMode?: 'weak_areas' | 'balanced' | 'review'
}

export interface SessionResult {
  subject: string
  topic: string
  questionsAttempted: number
  correctAnswers: number
  timeMinutes: number
}

interface TopicWeight {
  topic: string
  subject: string
  currentAccuracy: number
  priority: number
  importance: number
  lastPracticed: Date | null
  suggestedQuestions: number
}

// =============================================================================
// CONSTANTS
// =============================================================================

const DEFAULT_DAILY_MINUTES = 20
const DEFAULT_ACTIVE_DAYS = [1, 2, 3, 4, 5, 6] // Mon-Sat
const DEFAULT_MAX_ACTIVITIES = 3
const WEAK_THRESHOLD = 70 // Below this is considered weak
const MASTERY_TARGET = 85 // Target accuracy
const MINUTES_PER_QUESTION = 1.5

// Topic importance weights (how critical for 11+ exams)
const TOPIC_IMPORTANCE: Record<string, number> = {
  // Verbal Reasoning - High importance
  'Synonyms & Antonyms': 10,
  'Analogies': 10,
  'Odd One Out': 9,
  'Word Codes': 9,
  'Letter Series': 8,
  'Number Series': 8,
  
  // English - High importance
  'Reading Comprehension': 10,
  'Grammar': 9,
  'Vocabulary': 9,
  'Spelling': 8,
  'Punctuation': 8,
  
  // Mathematics - High importance
  'Fractions': 10,
  'Percentages': 10,
  'Ratio & Proportion': 9,
  'Algebra': 9,
  'Word Problems': 10,
  'Geometry': 8,
  'Data Handling': 7
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get topic importance score (1-10)
 */
function getTopicImportance(topic: string): number {
  // Check for exact match or partial match
  const exactMatch = TOPIC_IMPORTANCE[topic]
  if (exactMatch) return exactMatch

  // Check for partial match
  for (const [key, value] of Object.entries(TOPIC_IMPORTANCE)) {
    if (topic.toLowerCase().includes(key.toLowerCase()) ||
        key.toLowerCase().includes(topic.toLowerCase())) {
      return value
    }
  }

  return 5 // Default importance
}

/**
 * Calculate priority score for a topic
 * Higher score = needs more attention
 */
function calculatePriority(
  accuracy: number,
  importance: number,
  daysSinceLastPractice: number | null
): number {
  // Base priority from weakness (0-100 where 100 is weakest)
  const weaknessPriority = Math.max(0, MASTERY_TARGET - accuracy)
  
  // Importance multiplier (1-2)
  const importanceMultiplier = 1 + (importance / 10)
  
  // Recency penalty (topics not practiced recently get boost)
  let recencyBoost = 0
  if (daysSinceLastPractice !== null) {
    if (daysSinceLastPractice > 14) recencyBoost = 20
    else if (daysSinceLastPractice > 7) recencyBoost = 10
    else if (daysSinceLastPractice > 3) recencyBoost = 5
  } else {
    recencyBoost = 30 // Never practiced
  }

  return (weaknessPriority * importanceMultiplier) + recencyBoost
}

/**
 * Get the day name from day number
 */
function getDayName(dayNumber: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[dayNumber] || 'Day'
}

/**
 * Generate a unique activity ID
 */
function generateActivityId(): string {
  return `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Get suggested question count based on accuracy
 */
function getSuggestedQuestions(accuracy: number): number {
  if (accuracy < 50) return 15 // More practice needed
  if (accuracy < 70) return 12
  if (accuracy < 85) return 10
  return 8 // Just review
}

// =============================================================================
// MAIN FUNCTIONS
// =============================================================================

/**
 * Generate a weekly study plan for a child
 * 
 * @param childId - The child's ID
 * @param options - Plan generation options
 * @returns Generated study plan
 * 
 * @example
 * const plan = await generateWeeklyPlan(childId, {
 *   dailyMinutes: 30,
 *   activeDays: [1, 2, 3, 4, 5],
 *   focusMode: 'weak_areas'
 * })
 */
export async function generateWeeklyPlan(
  childId: string,
  options: PlanOptions = {}
): Promise<StudyPlan | null> {
  const supabase = await createClient()
  
  const {
    dailyMinutes = DEFAULT_DAILY_MINUTES,
    activeDays = DEFAULT_ACTIVE_DAYS,
    maxActivitiesPerDay = DEFAULT_MAX_ACTIVITIES,
    focusMode = 'weak_areas'
  } = options

  // Fetch topic performance data
  const { data: performanceData, error } = await supabase.rpc('get_weakness_heatmap', {
    p_child_id: childId
  })

  if (error || !performanceData) {
    console.error('Error fetching performance data:', error)
    return null
  }

  // Transform to TopicWeight array
  const topicWeights: TopicWeight[] = (performanceData.cells || []).map((cell: any) => {
    const importance = getTopicImportance(cell.topic)
    const daysSince = cell.last_practiced_at 
      ? Math.floor((Date.now() - new Date(cell.last_practiced_at).getTime()) / (1000 * 60 * 60 * 24))
      : null

    return {
      topic: cell.topic,
      subject: cell.subject,
      currentAccuracy: cell.accuracy || 0,
      priority: calculatePriority(cell.accuracy || 0, importance, daysSince),
      importance,
      lastPracticed: cell.last_practiced_at ? new Date(cell.last_practiced_at) : null,
      suggestedQuestions: getSuggestedQuestions(cell.accuracy || 0)
    }
  })

  // Sort by priority (highest first)
  topicWeights.sort((a, b) => b.priority - a.priority)

  // Identify weak areas (top priority topics)
  const weakAreas = topicWeights
    .filter(t => t.currentAccuracy < WEAK_THRESHOLD)
    .slice(0, 5)

  // Generate focus areas
  const focusAreas: FocusArea[] = weakAreas.slice(0, 3).map(topic => ({
    topic: topic.topic,
    subject: topic.subject,
    reason: topic.currentAccuracy < 50 
      ? `Needs significant improvement (${topic.currentAccuracy}% accuracy)`
      : `Below target mastery (${topic.currentAccuracy}% vs ${MASTERY_TARGET}% target)`,
    currentAccuracy: topic.currentAccuracy,
    targetAccuracy: MASTERY_TARGET,
    importance: topic.importance,
    suggestedQuestions: topic.suggestedQuestions,
    priority: topic.priority > 60 ? 'high' : topic.priority > 35 ? 'medium' : 'low'
  }))

  // Calculate week dates
  const today = new Date()
  const dayOfWeek = today.getDay()
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - dayOfWeek + 1) // Start on Monday
  weekStart.setHours(0, 0, 0, 0)
  
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)

  const planReasoning = focusAreas.length
    ? `Prioritising ${focusAreas.map(area => `${area.topic} (${area.subject}) at ${area.currentAccuracy.toFixed(0)}%`).join(', ')} because they sit below the ${WEAK_THRESHOLD}% mastery threshold and are high-weight topics this term.`
    : 'All tracked topics are above the mastery target, so this week balances maintenance practice across core subjects.'

  // Generate daily plans
  const dailyPlans: DailyPlan[] = []
  
  let topicIndex = 0
  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(weekStart)
    dayDate.setDate(weekStart.getDate() + i)
    const dayNumber = dayDate.getDay()
    
    // Skip inactive days
    if (!activeDays.includes(dayNumber)) {
      continue
    }

    const activities: PlannedActivity[] = []
    let remainingMinutes = dailyMinutes
    const usedSubjects = new Set<string>()

    // Add activities for this day
    while (
      activities.length < maxActivitiesPerDay &&
      remainingMinutes > 5 &&
      topicIndex < topicWeights.length
    ) {
      const topic = topicWeights[topicIndex]
      
      // In balanced mode, try to vary subjects
      if (focusMode === 'balanced' && usedSubjects.has(topic.subject)) {
        // Find next topic with different subject
        let found = false
        for (let j = topicIndex + 1; j < topicWeights.length; j++) {
          if (!usedSubjects.has(topicWeights[j].subject)) {
            // Swap topics
            const temp = topicWeights[topicIndex]
            topicWeights[topicIndex] = topicWeights[j]
            topicWeights[j] = temp
            found = true
            break
          }
        }
        if (!found) {
          // Use current topic anyway
        }
      }

      const activityMinutes = Math.min(
        remainingMinutes,
        topic.suggestedQuestions * MINUTES_PER_QUESTION
      )
      const questionCount = Math.round(activityMinutes / MINUTES_PER_QUESTION)

      activities.push({
        id: generateActivityId(),
        type: topic.currentAccuracy < 50 ? 'practice' : 
              topic.currentAccuracy < 80 ? 'practice' : 'review',
        subject: topic.subject,
        topic: topic.topic,
        difficulty: topic.currentAccuracy < 50 ? 'foundation' : 'standard',
        questionCount,
        estimatedMinutes: activityMinutes,
        reason: `Priority: ${Math.round(topic.priority)} - ${
          topic.currentAccuracy < WEAK_THRESHOLD 
            ? 'Needs improvement' 
            : 'Maintain mastery'
        }`,
        priority: topic.priority > 50 ? 'high' : topic.priority > 25 ? 'medium' : 'low',
        completed: false
      })

      remainingMinutes -= activityMinutes
      usedSubjects.add(topic.subject)
      topicIndex++

      // Cycle back to start for variety
      if (topicIndex >= topicWeights.length) {
        topicIndex = 0
      }
    }

    dailyPlans.push({
      date: dayDate,
      dayOfWeek: getDayName(dayNumber),
      activities,
      recommendedMinutes: dailyMinutes - remainingMinutes,
      completed: false
    })
  }

  // Generate weekly goals
  const weeklyGoals: StudyGoal[] = [
    {
      id: 'goal_questions',
      description: 'Complete practice questions',
      targetValue: dailyPlans.reduce((sum, day) => 
        sum + day.activities.reduce((s, a) => s + a.questionCount, 0), 0
      ),
      currentValue: 0,
      unit: 'questions',
      progress: 0,
      deadline: weekEnd
    },
    {
      id: 'goal_accuracy',
      description: 'Achieve target accuracy',
      targetValue: 75,
      currentValue: 0,
      unit: '%',
      progress: 0,
      deadline: weekEnd
    },
    {
      id: 'goal_streak',
      description: 'Practice every active day',
      targetValue: activeDays.length,
      currentValue: 0,
      unit: 'days',
      progress: 0,
      deadline: weekEnd
    }
  ]

  return {
    childId,
    weekOf: weekStart,
    weekStart,
    weekEnd,
    generatedAt: new Date(),
    reasoning: planReasoning,
    dailyPlans,
    focusAreas,
    weeklyGoals,
    totalRecommendedMinutes: dailyPlans.reduce((sum, day) => sum + day.recommendedMinutes, 0)
  }
}

/**
 * Get today's recommended activities
 * 
 * @param childId - The child's ID
 * @returns Today's study plan or null
 */
export async function getDailyRecommendation(
  childId: string,
  date: Date = new Date()
): Promise<DailyPlan | null> {
  const plan = await generateWeeklyPlan(childId)
  if (!plan) return null

  const dateString = date.toISOString().split('T')[0]
  
  return plan.dailyPlans.find(day => 
    day.date.toISOString().split('T')[0] === dateString
  ) || null
}

/**
 * Adjust the study plan after a completed session
 * Marks activities as complete and adjusts future recommendations
 * 
 * @param childId - The child's ID
 * @param sessionResult - Results from the completed session
 */
export async function adjustPlanAfterSession(
  _childId: string,
  _sessionResult: SessionResult
): Promise<void> {
  // In a full implementation, this would:
  // 1. Mark the matching activity as completed
  // 2. Update the child's stored plan in the database
  // 3. Potentially regenerate future days if significant improvement
  // 4. Track progress toward weekly goals

  // For now, plans are regenerated fresh each time.
  // Future enhancement: persist plans in database and update records here.
}

/**
 * Get quick recommendations for immediate practice
 * Used when user wants to practice now without full plan
 * 
 * @param childId - The child's ID
 * @param minutes - Available practice time
 * @returns Array of recommended activities
 */
export async function getQuickRecommendations(
  childId: string,
  minutes: number = 15
): Promise<PlannedActivity[]> {
  const supabase = await createClient()
  
  // Get weakness data
  const { data } = await supabase.rpc('get_weakness_heatmap', {
    p_child_id: childId
  })

  if (!data?.cells || data.cells.length === 0) {
    // Return default recommendations if no data
    return [
      {
        id: generateActivityId(),
        type: 'practice',
        subject: 'verbal_reasoning',
        topic: 'General Practice',
        difficulty: 'standard',
        questionCount: Math.round(minutes / MINUTES_PER_QUESTION),
        estimatedMinutes: minutes,
        reason: 'Start building your performance data',
        priority: 'medium',
        completed: false
      }
    ]
  }

  // Find weakest topics
  const weakTopics = (data.cells as any[])
    .sort((a, b) => (a.accuracy || 0) - (b.accuracy || 0))
    .slice(0, 3)

  const activities: PlannedActivity[] = []
  let remainingMinutes = minutes

  for (const topic of weakTopics) {
    if (remainingMinutes <= 0) break

    const activityMinutes = Math.min(remainingMinutes, 8)
    activities.push({
      id: generateActivityId(),
      type: 'practice',
      subject: topic.subject,
      topic: topic.topic,
      difficulty: (topic.accuracy || 0) < 50 ? 'foundation' : 'standard',
      questionCount: Math.round(activityMinutes / MINUTES_PER_QUESTION),
      estimatedMinutes: activityMinutes,
      reason: `${topic.accuracy || 0}% accuracy - needs practice`,
      priority: (topic.accuracy || 0) < 50 ? 'high' : 'medium',
      completed: false
    })

    remainingMinutes -= activityMinutes
  }

  return activities
}

export default {
  generateWeeklyPlan,
  getDailyRecommendation,
  adjustPlanAfterSession,
  getQuickRecommendations
}
