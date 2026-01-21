/**
 * Analytics Data Aggregator
 * 
 * Service layer for fetching and transforming analytics data
 * for the Ascent tier dashboard.
 * 
 * This module provides functions to:
 * - Fetch comprehensive child analytics
 * - Generate weakness heatmap data
 * - Calculate readiness scores
 * - Track growth velocity
 * - Generate study recommendations
 * 
 * @module lib/analytics/aggregator
 */

import { createClient } from '@/lib/supabase/server'
import {
  getReadinessTier,
  type ChildAnalytics,
  type WeaknessHeatmapData,
  type ReadinessScoreData,
  type GrowthVelocity,
  type ScoreRange,
  type DateRange,
  type DateRangePreset,
  type MasteryLevel,
  type TrendDirection,
  type PerformanceTrends,
} from '@/types/analytics'

// =============================================================================
// DATE RANGE HELPERS
// =============================================================================

/**
 * Convert a date range preset to actual dates
 */
export function getDateRangeFromPreset(preset: DateRangePreset): DateRange {
  const endDate = new Date()
  let startDate = new Date()

  switch (preset) {
    case 'last_7_days':
      startDate.setDate(startDate.getDate() - 7)
      break
    case 'last_14_days':
      startDate.setDate(startDate.getDate() - 14)
      break
    case 'last_30_days':
      startDate.setDate(startDate.getDate() - 30)
      break
    case 'last_90_days':
      startDate.setDate(startDate.getDate() - 90)
      break
    case 'this_week':
      startDate.setDate(startDate.getDate() - startDate.getDay())
      break
    case 'this_month':
      startDate.setDate(1)
      break
    case 'all_time':
      startDate = new Date('2020-01-01')
      break
  }

  return { startDate, endDate }
}

/**
 * Format date for SQL queries
 */
function formatDateForSQL(date: Date): string {
  return date.toISOString().split('T')[0]
}

// =============================================================================
// CHILD ANALYTICS
// =============================================================================

/**
 * Fetch comprehensive analytics for a child
 * 
 * @param childId - The child's ID
 * @param dateRange - Optional date range (defaults to last 30 days)
 * @returns Complete analytics data
 * 
 * @example
 * const analytics = await getChildAnalytics(childId, {
 *   startDate: new Date('2026-01-01'),
 *   endDate: new Date()
 * })
 */
export async function getChildAnalytics(
  childId: string,
  dateRange?: DateRange
): Promise<ChildAnalytics | null> {
  const supabase = await createClient()
  
  const range = dateRange || getDateRangeFromPreset('last_30_days')
  
  // Call the database function
  const { data, error } = await supabase.rpc('get_child_analytics', {
    p_child_id: childId,
    p_start_date: formatDateForSQL(range.startDate),
    p_end_date: formatDateForSQL(range.endDate)
  })

  console.log('[Analytics] RPC response:', JSON.stringify(data, null, 2))
  console.log('[Analytics] RPC error:', error)

  if (error) {
    console.error('Error fetching child analytics:', error)
    return null
  }

  if (!data) {
    console.log('[Analytics] No data returned from RPC')
    return null
  }

  // Get child name
  const { data: child } = await supabase
    .from('children')
    .select('name')
    .eq('id', childId)
    .single()

  // Transform the data to match our types
  const result = transformAnalyticsData(data, childId, child?.name || 'Child', range)
  console.log('[Analytics] Transformed totalPracticeMinutes:', result.summary.totalPracticeMinutes)
  return result
}

/**
 * Transform raw database analytics to typed format
 */
function transformAnalyticsData(
  raw: Record<string, unknown>,
  childId: string,
  childName: string,
  dateRange: DateRange
): ChildAnalytics {
  const summary = raw.summary as Record<string, unknown> || {}
  const subjectPerformance = raw.subjectPerformance as Record<string, unknown>[] || []
  const dailyActivity = raw.dailyActivity as Record<string, unknown>[] || []
  const topicPerformance = raw.topicPerformance as Record<string, unknown>[] || []
  
  return {
    childId,
    childName,
    dateRange,
    summary: {
      totalSessions: Number(summary.sessionsCount) || 0,
      totalQuestionsAnswered: Number(summary.totalQuestions) || 0,
      totalCorrectAnswers: Number(summary.correctAnswers) || 0,
      overallAccuracy: Number(summary.accuracy) || 0,
      totalPracticeMinutes: Number(summary.totalTimeMinutes) || 0,
      averageSessionLength: Number(summary.averageSessionLength) || 0,
      currentStreak: Number(summary.currentStreak) || 0,
      longestStreak: Number(summary.currentStreak) || 0, // Using same value for now
      lastPracticeDate: dailyActivity[0] 
        ? new Date(String(dailyActivity[0].date))
        : null
    },
    subjectBreakdown: subjectPerformance.map(s => ({
      subject: String(s.subject),
      subjectLabel: formatSubjectLabel(String(s.subject)),
      totalQuestions: Number(s.total) || 0,
      correctAnswers: Number(s.correct) || 0,
      accuracy: Number(s.accuracy) || 0,
      averageTimeSeconds: 0,
      masteryLevel: getMasteryLevel(Number(s.accuracy) || 0),
      trend: 'stable' as TrendDirection,
      topicCount: 0
    })),
    topicBreakdown: topicPerformance.map(t => ({
      topic: String(t.topic),
      subject: String(t.subject),
      subjectLabel: formatSubjectLabel(String(t.subject)),
      totalQuestions: Number(t.total) || 0,
      correctAnswers: Number(t.correct) || 0,
      accuracy: Number(t.accuracy) || 0,
      averageTimeSeconds: 0,
      masteryLevel: getMasteryLevel(Number(t.accuracy) || 0),
      trend: 'stable' as TrendDirection,
      lastPracticedAt: null,
      difficultyDistribution: {
        foundation: 0,
        standard: 0,
        challenge: 0
      }
    })),
    dailyActivity: dailyActivity.map(d => ({
      date: new Date(String(d.date)),
      dateString: String(d.date),
      questionsAnswered: Number(d.questions) || 0,
      correctAnswers: Number(d.correct) || 0,
      accuracy: Number(d.accuracy) || 0,
      practiceMinutes: Math.round(Number(d.timeSpent) / 60) || 0,
      sessionsCompleted: 1
    })),
    trends: calculateTrends(dailyActivity)
  }
}

/**
 * Get mastery level based on accuracy
 */
function getMasteryLevel(accuracy: number): MasteryLevel {
  if (accuracy >= 85) return 'mastered'
  if (accuracy >= 70) return 'proficient'
  if (accuracy >= 55) return 'developing'
  return 'needs_practice'
}

/**
 * Format subject string to display label
 */
function formatSubjectLabel(subject: string): string {
  const labels: Record<string, string> = {
    'mathematics': 'Mathematics',
    'english': 'English',
    'verbal_reasoning': 'Verbal Reasoning'
  }
  return labels[subject] || subject
}

/**
 * Calculate performance trends from daily activity
 */
function calculateTrends(dailyActivity: Record<string, unknown>[]): PerformanceTrends {
  if (!dailyActivity || dailyActivity.length === 0) {
    return {
      accuracyTrend: 'stable',
      volumeTrend: 'stable',
      weekOverWeekChange: 0,
      fourWeekAverage: 0,
      currentWeekAverage: 0
    }
  }

  // Get last 7 days vs previous 7 days
  const last7 = dailyActivity.slice(0, 7)
  const prev7 = dailyActivity.slice(7, 14)

  const currentAvg = calculateAverageAccuracy(last7)
  const prevAvg = calculateAverageAccuracy(prev7)

  const currentVolume = last7.reduce((sum, d) => sum + (Number(d.questions) || 0), 0)
  const prevVolume = prev7.reduce((sum, d) => sum + (Number(d.questions) || 0), 0)

  return {
    accuracyTrend: getTrendDirection(currentAvg, prevAvg),
    volumeTrend: getTrendDirection(currentVolume, prevVolume),
    weekOverWeekChange: prevAvg > 0 ? ((currentAvg - prevAvg) / prevAvg) * 100 : 0,
    fourWeekAverage: calculateAverageAccuracy(dailyActivity.slice(0, 28)),
    currentWeekAverage: currentAvg
  }
}

/**
 * Calculate average accuracy from activity data
 */
function calculateAverageAccuracy(data: Record<string, unknown>[]): number {
  if (!data || data.length === 0) return 0
  const total = data.reduce((sum, d) => sum + (Number(d.accuracy) || 0), 0)
  return total / data.length
}

/**
 * Determine trend direction from two values
 */
function getTrendDirection(current: number, previous: number): TrendDirection {
  const diff = current - previous
  const threshold = Math.abs(previous) * 0.05 // 5% change threshold
  
  if (diff > threshold) return 'up'
  if (diff < -threshold) return 'down'
  return 'stable'
}

// =============================================================================
// WEAKNESS HEATMAP
// =============================================================================

/**
 * Fetch weakness heatmap data for visualization
 * 
 * @param childId - The child's ID
 * @returns Heatmap data with subjects, topics, and performance cells
 * 
 * @example
 * const heatmap = await getWeaknessHeatmap(childId)
 * // Use with WeaknessHeatmap component
 */
export async function getWeaknessHeatmap(
  childId: string
): Promise<WeaknessHeatmapData | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase.rpc('get_weakness_heatmap', {
    p_child_id: childId
  })

  console.log('[Heatmap] Raw RPC response:', JSON.stringify(data, null, 2))
  console.log('[Heatmap] RPC error:', error)

  if (error) {
    console.error('Error fetching heatmap data:', error)
    return null
  }

  if (!data) {
    console.log('[Heatmap] No data returned from RPC')
    return null
  }

  const transformed = transformHeatmapData(data)
  console.log('[Heatmap] Transformed data cells count:', transformed.cells.length)
  return transformed
}

/**
 * Transform raw heatmap data to typed format
 * Actual SQL function returns: { heatmapData: [...] }
 * Each item has: subject, topic, attempts, correct, accuracy, status
 */
function transformHeatmapData(raw: Record<string, unknown>): WeaknessHeatmapData {
  console.log('[Heatmap Transform] Raw keys:', Object.keys(raw))
  
  // Handle actual structure: { heatmapData: [...] }
  const heatmapData = raw.heatmapData as Record<string, unknown>[] || 
                      raw.topics as Record<string, unknown>[] || 
                      []
  
  console.log('[Heatmap Transform] heatmapData length:', heatmapData?.length)
  
  if (!heatmapData || heatmapData.length === 0) {
    return {
      subjects: [],
      topics: [],
      cells: [],
      lastUpdated: new Date()
    }
  }
  
  // Extract unique subjects
  const subjectSet = new Set<string>()
  heatmapData.forEach(item => subjectSet.add(String(item.subject)))
  const subjects = Array.from(subjectSet)
  
  // Extract unique topics
  const topicSet = new Set<string>()
  heatmapData.forEach(item => topicSet.add(String(item.topic)))
  
  const topics = Array.from(topicSet).map((name, index) => ({
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    subject: String(heatmapData.find(item => item.topic === name)?.subject || ''),
    displayOrder: index
  }))

  // Determine mastery level from status or accuracy
  const getMasteryFromData = (item: Record<string, unknown>): MasteryLevel => {
    const status = String(item.status || '')
    if (status === 'strong') return 'mastered'
    if (status === 'medium') return 'proficient'
    if (status === 'weak') return 'needs_practice'
    // Fallback to accuracy-based
    const acc = Number(item.accuracy) || 0
    if (acc >= 85) return 'mastered'
    if (acc >= 70) return 'proficient'
    if (acc >= 55) return 'developing'
    return 'needs_practice'
  }

  return {
    subjects,
    topics,
    // Map heatmapData to our 'cells' format
    cells: heatmapData.map(item => ({
      subject: String(item.subject),
      topic: String(item.topic),
      accuracy: Number(item.accuracy) || 0,
      totalQuestions: Number(item.attempts) || 0,
      correctAnswers: Number(item.correct) || 0,
      trend: 'stable' as TrendDirection,
      masteryLevel: getMasteryFromData(item),
      lastPracticedAt: null,
      needsFocus: String(item.status) === 'weak' || Number(item.accuracy) < 55
    })),
    lastUpdated: new Date()
  }
}

// =============================================================================
// READINESS SCORE
// =============================================================================

/**
 * Calculate and fetch readiness score for a child
 * 
 * @param childId - The child's ID
 * @returns Complete readiness score with components and breakdown
 * 
 * @example
 * const readiness = await getReadinessScore(childId)
 * console.log(readiness.overallScore) // e.g., 72
 * console.log(readiness.overallTier) // 'good'
 */
export async function getReadinessScore(
  childId: string
): Promise<ReadinessScoreData | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase.rpc('calculate_readiness_score', {
    p_child_id: childId
  })

  if (error) {
    console.error('Error calculating readiness score:', error)
    return null
  }

  if (!data) return null

  return transformReadinessData(data, childId)
}

/**
 * Transform raw readiness data to typed format
 */
function transformReadinessData(
  raw: Record<string, unknown>,
  childId: string
): ReadinessScoreData {
  // Handle the actual structure from the DB function
  const overallScore = Number(raw.overallScore) || 0
  const subjectScores = raw.subjectScores as Record<string, number> || {}
  const factors = raw.factors as Record<string, number> || {}
  const tier = String(raw.tier) || 'needs_focus'

  // Calculate confidence based on total questions
  const totalQuestions = Number(factors.totalQuestions) || 0
  let confidenceLevel: 'low' | 'medium' | 'high' = 'low'
  let questionsNeeded = 50
  
  if (totalQuestions >= 100) {
    confidenceLevel = 'high'
    questionsNeeded = 0
  } else if (totalQuestions >= 30) {
    confidenceLevel = 'medium'
    questionsNeeded = 100 - totalQuestions
  } else {
    questionsNeeded = 30 - totalQuestions
  }

  // Build subject scores array
  const subjectScoresArray = Object.entries(subjectScores).map(([subject, score]) => ({
    subject,
    subjectLabel: subject === 'verbal_reasoning' ? 'Verbal Reasoning' 
      : subject === 'english' ? 'English'
      : subject === 'mathematics' ? 'Mathematics'
      : subject,
    score: Number(score) || 0,
    tier: getReadinessTier(Number(score) || 0),
    topicsCovered: 0,
    totalTopics: 0,
    coveragePercentage: 0,
    weakestAreas: [] as string[],
    strongestAreas: [] as string[]
  }))

  return {
    childId,
    calculatedAt: new Date(),
    overallScore,
    overallTier: tier === 'exam_ready' ? 'excellent'
      : tier === 'on_track' ? 'good'
      : tier === 'developing' ? 'developing'
      : 'needs_focus',
    components: {
      accuracyScore: (overallScore / 100) * 40, // 40 max
      coverageScore: (Number(factors.volume) / 100) * 20, // 20 max
      consistencyScore: (Number(factors.consistency) / 100) * 15, // 15 max
      difficultyScore: 7.5, // 15 max, default to 50%
      improvementScore: 5 // 10 max, default to 50%
    },
    subjectScores: subjectScoresArray,
    confidence: {
      level: confidenceLevel,
      questionsNeeded,
      message: getConfidenceMessage(confidenceLevel, questionsNeeded)
    },
    trend: {
      direction: 'stable' as TrendDirection,
      previousScore: 0,
      currentScore: overallScore,
      changeAmount: 0,
      changePercentage: 0,
      periodDays: 7
    },
    disclaimer: String(raw.recommendations) || 
      'This score is an estimate based on practice performance and does not guarantee exam results.'
  }
}

/**
 * Get confidence message based on level
 */
function getConfidenceMessage(level: 'low' | 'medium' | 'high', questionsNeeded: number): string {
  switch (level) {
    case 'high':
      return 'High confidence based on extensive practice data.'
    case 'medium':
      return `Good confidence. Answer ${questionsNeeded} more questions to improve accuracy.`
    case 'low':
      return `Limited data. Answer ${questionsNeeded} more questions for a reliable score.`
  }
}

// =============================================================================
// GROWTH VELOCITY
// =============================================================================

/**
 * Calculate growth velocity metrics
 * 
 * @param childId - The child's ID
 * @returns Growth velocity data including improvement rates
 */
export async function getGrowthVelocity(
  childId: string
): Promise<GrowthVelocity | null> {
  const supabase = await createClient()
  
  // Get weekly summaries for trend analysis
  const { data: weeklyData, error } = await supabase
    .from('child_weekly_summary')
    .select('*')
    .eq('child_id', childId)
    .order('week_start', { ascending: false })
    .limit(8)

  if (error) {
    console.error('Error fetching growth data:', error)
    return null
  }

  if (!weeklyData || weeklyData.length < 2) {
    return {
      childId,
      calculatedAt: new Date(),
      weeklyGrowthRate: 0,
      accuracyImprovement: 0,
      volumeGrowth: 0,
      daysSinceImprovement: 0,
      projectedScore: 0,
      projectedDate: new Date()
    }
  }

  const currentWeek = weeklyData[0]
  const previousWeek = weeklyData[1]

  const accuracyImprovement = 
    (currentWeek.accuracy_percentage || 0) - (previousWeek.accuracy_percentage || 0)
  
  const volumeGrowth = previousWeek.total_questions > 0
    ? ((currentWeek.total_questions - previousWeek.total_questions) / previousWeek.total_questions) * 100
    : 0

  // Calculate weekly growth rate (average of last 4 weeks)
  const recentWeeks = weeklyData.slice(0, 4)
  let totalGrowth = 0
  for (let i = 0; i < recentWeeks.length - 1; i++) {
    const diff = (recentWeeks[i].accuracy_percentage || 0) - (recentWeeks[i + 1].accuracy_percentage || 0)
    totalGrowth += diff
  }
  const weeklyGrowthRate = recentWeeks.length > 1 
    ? totalGrowth / (recentWeeks.length - 1) 
    : 0

  return {
    childId,
    calculatedAt: new Date(),
    weeklyGrowthRate,
    accuracyImprovement,
    volumeGrowth,
    daysSinceImprovement: accuracyImprovement > 0 ? 0 : 7,
    projectedScore: Math.min(100, (currentWeek.accuracy_percentage || 0) + (weeklyGrowthRate * 4)),
    projectedDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000) // 4 weeks from now
  }
}

// =============================================================================
// SCORE RANGE PREDICTION
// =============================================================================

/**
 * Predict likely score range based on performance
 * 
 * @param childId - The child's ID
 * @returns Predicted score range with confidence
 */
export async function getPredictedScoreRange(
  childId: string
): Promise<ScoreRange | null> {
  const supabase = await createClient()
  
  // Get overall performance
  const { data: analytics, error } = await supabase.rpc('get_child_analytics', {
    p_child_id: childId,
    p_start_date: formatDateForSQL(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)),
    p_end_date: formatDateForSQL(new Date())
  })

  if (error || !analytics) {
    console.error('Error fetching analytics for prediction:', error)
    return null
  }

  const summary = analytics.summary as Record<string, unknown> || {}
  const totalQuestions = Number(summary.total_questions) || 0
  const accuracy = Number(summary.accuracy_percentage) || 0

  // Calculate confidence based on data amount
  const confidenceLevel = totalQuestions >= 200 ? 0.85 
    : totalQuestions >= 100 ? 0.7 
    : totalQuestions >= 50 ? 0.5 
    : 0.3

  // Calculate range (wider range with less data)
  const rangeWidth = 15 * (1 - confidenceLevel) + 5 // 5-20 points range
  
  return {
    childId,
    predictedMin: Math.max(0, accuracy - rangeWidth),
    predictedMax: Math.min(100, accuracy + rangeWidth / 2), // Optimistic bias
    confidenceLevel,
    basedOnQuestions: totalQuestions,
    calculatedAt: new Date(),
    factors: [
      {
        name: 'Practice Volume',
        impact: totalQuestions >= 100 ? 'positive' : 'negative',
        weight: 0.3,
        description: totalQuestions >= 100 
          ? 'Good amount of practice data' 
          : 'More practice needed for accurate prediction'
      },
      {
        name: 'Consistency',
        impact: 'neutral',
        weight: 0.2,
        description: 'Regular practice helps maintain skills'
      },
      {
        name: 'Difficulty Progression',
        impact: 'positive',
        weight: 0.3,
        description: 'Performance at challenge level'
      },
      {
        name: 'Recent Trend',
        impact: 'neutral',
        weight: 0.2,
        description: 'Performance trend over last 2 weeks'
      }
    ]
  }
}

// =============================================================================
// REFRESH UTILITIES
// =============================================================================

/**
 * Refresh analytics materialized views
 * Should be called periodically (e.g., via cron job)
 */
export async function refreshAnalyticsViews(): Promise<boolean> {
  const supabase = await createClient()
  
  const { error } = await supabase.rpc('refresh_analytics_views')

  if (error) {
    console.error('Error refreshing analytics views:', error)
    return false
  }

  return true
}
