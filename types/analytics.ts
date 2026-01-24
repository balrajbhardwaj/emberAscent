/**
 * Analytics Type Definitions
 * 
 * Types for the Ascent tier analytics dashboard including:
 * - Weakness Heatmap data structures
 * - Readiness Score calculations
 * - Growth tracking metrics
 * - Study plan recommendations
 * 
 * @module types/analytics
 */

import { Subject, Difficulty } from './database'

// =============================================================================
// DATE RANGE TYPES
// =============================================================================

/**
 * Date range for analytics queries
 */
export interface DateRange {
  startDate: Date
  endDate: Date
}

/**
 * Predefined date range options
 */
export type DateRangePreset = 
  | 'last_7_days'
  | 'last_14_days'
  | 'last_30_days'
  | 'last_90_days'
  | 'this_week'
  | 'this_month'
  | 'all_time'

// =============================================================================
// CHILD ANALYTICS TYPES
// =============================================================================

/**
 * Comprehensive analytics for a single child
 */
export interface ChildAnalytics {
  childId: string
  childName: string
  dateRange: DateRange
  
  // Summary metrics
  summary: AnalyticsSummary
  
  // Performance by subject
  subjectBreakdown: SubjectPerformance[]
  
  // Performance by topic
  topicBreakdown: TopicPerformance[]
  
  // Daily activity data
  dailyActivity: DailyActivityData[]
  
  // Trending data
  trends: PerformanceTrends
}

/**
 * Summary metrics for analytics
 */
export interface AnalyticsSummary {
  totalSessions: number
  totalQuestionsAnswered: number
  totalCorrectAnswers: number
  overallAccuracy: number
  totalPracticeMinutes: number
  averageSessionLength: number
  currentStreak: number
  longestStreak: number
  lastPracticeDate: Date | null
}

/**
 * Performance data for a subject
 */
export interface SubjectPerformance {
  subject: Subject | string
  subjectLabel: string
  totalQuestions: number
  correctAnswers: number
  accuracy: number
  averageTimeSeconds: number
  masteryLevel: MasteryLevel
  trend: TrendDirection
  topicCount: number
}

/**
 * Performance data for a topic
 */
export interface TopicPerformance {
  topic: string
  subject: Subject | string
  subjectLabel: string
  totalQuestions: number
  correctAnswers: number
  accuracy: number
  averageTimeSeconds: number
  masteryLevel: MasteryLevel
  trend: TrendDirection
  lastPracticedAt: Date | null
  difficultyDistribution: DifficultyDistribution
}

/**
 * Daily activity data point
 */
export interface DailyActivityData {
  date: Date
  dateString: string // YYYY-MM-DD
  questionsAnswered: number
  correctAnswers: number
  accuracy: number
  practiceMinutes: number
  sessionsCompleted: number
}

/**
 * Performance trends over time
 */
export interface PerformanceTrends {
  accuracyTrend: TrendDirection
  volumeTrend: TrendDirection
  weekOverWeekChange: number // percentage
  fourWeekAverage: number
  currentWeekAverage: number
}

// =============================================================================
// WEAKNESS HEATMAP TYPES
// =============================================================================

/**
 * Complete heatmap data structure
 */
export interface WeaknessHeatmapData {
  subjects: string[]
  topics: HeatmapTopic[]
  cells: HeatmapCell[]
  lastUpdated: Date
}

/**
 * Topic row in the heatmap
 */
export interface HeatmapTopic {
  id: string
  name: string
  subject: string
  displayOrder: number
}

/**
 * Individual cell in the heatmap
 */
export interface HeatmapCell {
  subject: string
  topic: string
  accuracy: number
  totalQuestions: number
  correctAnswers: number
  trend: TrendDirection
  masteryLevel: MasteryLevel
  lastPracticedAt: Date | null
  needsFocus: boolean
}

/**
 * Heatmap cell styling configuration
 */
export interface HeatmapCellStyle {
  backgroundColor: string
  textColor: string
  borderColor: string
}

// =============================================================================
// READINESS SCORE TYPES
// =============================================================================

/**
 * Complete readiness score data
 */
export interface ReadinessScoreData {
  childId: string
  calculatedAt: Date
  
  // Main score
  overallScore: number // 0-100
  overallTier: ReadinessTier
  
  // Component scores
  components: ReadinessComponents
  
  // Subject breakdown
  subjectScores: SubjectReadiness[]
  
  // Confidence in the score
  confidence: ReadinessConfidence
  
  // Trend data
  trend: ReadinessTrend
  
  // Disclaimer
  disclaimer: string
}

/**
 * Readiness score components
 */
export interface ReadinessComponents {
  accuracyScore: number // Based on overall accuracy
  coverageScore: number // Based on topic coverage
  consistencyScore: number // Based on regular practice
  difficultyScore: number // Based on performance at higher difficulties
  improvementScore: number // Based on rate of improvement
}

/**
 * Subject-specific readiness
 */
export interface SubjectReadiness {
  subject: Subject | string
  subjectLabel: string
  score: number
  tier: ReadinessTier
  topicsCovered: number
  totalTopics: number
  coveragePercentage: number
  weakestAreas: string[]
  strongestAreas: string[]
}

/**
 * Confidence in the readiness score
 */
export interface ReadinessConfidence {
  level: 'low' | 'medium' | 'high'
  questionsNeeded: number // Questions needed for higher confidence
  message: string
}

/**
 * Readiness trend over time
 */
export interface ReadinessTrend {
  direction: TrendDirection
  previousScore: number
  currentScore: number
  changeAmount: number
  changePercentage: number
  periodDays: number
}

/**
 * Readiness tier classification
 */
export type ReadinessTier = 
  | 'excellent'    // 85-100: Strong preparation
  | 'good'         // 70-84: On track
  | 'developing'   // 55-69: Needs more practice
  | 'needs_focus'  // Below 55: Significant gaps

// =============================================================================
// GROWTH & VELOCITY TYPES
// =============================================================================

/**
 * Growth velocity metrics
 */
export interface GrowthVelocity {
  childId: string
  calculatedAt: Date
  
  // Weekly growth rate
  weeklyGrowthRate: number // percentage points
  
  // Improvement in accuracy
  accuracyImprovement: number
  
  // Volume growth
  volumeGrowth: number
  
  // Days since significant improvement
  daysSinceImprovement: number
  
  // Projected score (if current pace continues)
  projectedScore: number
  projectedDate: Date
}

/**
 * Score range prediction
 */
export interface ScoreRange {
  childId: string
  predictedMin: number
  predictedMax: number
  confidenceLevel: number // 0-1
  basedOnQuestions: number
  calculatedAt: Date
  
  // Factors affecting the prediction
  factors: PredictionFactor[]
}

/**
 * Factor affecting score prediction
 */
export interface PredictionFactor {
  name: string
  impact: 'positive' | 'negative' | 'neutral'
  weight: number
  description: string
}

// =============================================================================
// STUDY PLAN TYPES
// =============================================================================

/**
 * Weekly study plan
 */
export interface StudyPlan {
  childId: string
  /** ISO week anchor (Monday) for this plan */
  weekOf: Date
  weekStart: Date
  weekEnd: Date
  generatedAt: Date
  /** Narrative explaining why these areas were selected */
  reasoning: string
  
  // Daily plans
  dailyPlans: DailyPlan[]
  
  // Focus areas for the week
  focusAreas: FocusArea[]
  
  // Goals
  weeklyGoals: StudyGoal[]
  
  // Estimated time
  totalRecommendedMinutes: number
}

/**
 * Daily study plan
 */
export interface DailyPlan {
  date: Date
  dayOfWeek: string
  activities: PlannedActivity[]
  recommendedMinutes: number
  completed: boolean
  actualMinutes?: number
}

/**
 * Planned practice activity
 */
export interface PlannedActivity {
  id: string
  type: 'practice' | 'review' | 'mock'
  subject: Subject | string
  topic: string
  difficulty: Difficulty | string
  questionCount: number
  estimatedMinutes: number
  reason: string // Why this activity was recommended
  priority: 'high' | 'medium' | 'low'
  completed: boolean
  completedAt?: Date
}

/**
 * Focus area for study plan
 */
export interface FocusArea {
  topic: string
  subject: Subject | string
  reason: string
  currentAccuracy: number
  targetAccuracy: number
  importance: number // 1-10
  suggestedQuestions: number
  priority: 'high' | 'medium' | 'low'
}

/**
 * Study goal
 */
export interface StudyGoal {
  id: string
  description: string
  targetValue: number
  currentValue: number
  unit: string
  progress: number // percentage
  deadline: Date
}

// =============================================================================
// BENCHMARKING TYPES
// =============================================================================

/**
 * Benchmarking data (anonymized comparisons)
 */
export interface BenchmarkData {
  childId: string
  calculatedAt: Date
  
  // Overall percentile
  overallPercentile: number
  
  // Subject percentiles
  subjectPercentiles: SubjectPercentile[]
  
  // Comparison group info
  comparisonGroup: ComparisonGroup
}

/**
 * Subject-specific percentile
 */
export interface SubjectPercentile {
  subject: Subject | string
  percentile: number
  averageScore: number
  childScore: number
}

/**
 * Comparison group details
 */
export interface ComparisonGroup {
  description: string // e.g., "Year 5 students"
  totalStudents: number
  minDataPoints: number
  isStatisticallySignificant: boolean
}

// =============================================================================
// SHARED ENUMS & HELPERS
// =============================================================================

/**
 * Mastery level for a topic
 */
export type MasteryLevel = 
  | 'mastered'     // 85%+ accuracy
  | 'proficient'   // 70-84% accuracy
  | 'developing'   // 55-69% accuracy
  | 'needs_practice' // Below 55% accuracy

/**
 * Trend direction
 */
export type TrendDirection = 'up' | 'down' | 'stable'

/**
 * Difficulty distribution
 */
export interface DifficultyDistribution {
  foundation: number
  standard: number
  challenge: number
}

/**
 * Get mastery level from accuracy percentage
 */
export function getMasteryLevel(accuracy: number): MasteryLevel {
  if (accuracy >= 85) return 'mastered'
  if (accuracy >= 70) return 'proficient'
  if (accuracy >= 55) return 'developing'
  return 'needs_practice'
}

/**
 * Get readiness tier from score
 */
export function getReadinessTier(score: number): ReadinessTier {
  if (score >= 85) return 'excellent'
  if (score >= 70) return 'good'
  if (score >= 55) return 'developing'
  return 'needs_focus'
}

/**
 * Get color for mastery level
 */
export function getMasteryColor(level: MasteryLevel): string {
  switch (level) {
    case 'mastered': return 'text-green-600 bg-green-50'
    case 'proficient': return 'text-blue-600 bg-blue-50'
    case 'developing': return 'text-amber-600 bg-amber-50'
    case 'needs_practice': return 'text-red-600 bg-red-50'
  }
}

/**
 * Get color for readiness tier
 */
export function getReadinessColor(tier: ReadinessTier): string {
  switch (tier) {
    case 'excellent': return 'text-green-600 bg-green-50'
    case 'good': return 'text-blue-600 bg-blue-50'
    case 'developing': return 'text-amber-600 bg-amber-50'
    case 'needs_focus': return 'text-red-600 bg-red-50'
  }
}

/**
 * Get heatmap cell color based on accuracy
 */
export function getHeatmapCellColor(accuracy: number): HeatmapCellStyle {
  if (accuracy >= 80) {
    return {
      backgroundColor: 'bg-green-500',
      textColor: 'text-white',
      borderColor: 'border-green-600'
    }
  }
  if (accuracy >= 70) {
    return {
      backgroundColor: 'bg-green-300',
      textColor: 'text-green-900',
      borderColor: 'border-green-400'
    }
  }
  if (accuracy >= 60) {
    return {
      backgroundColor: 'bg-yellow-300',
      textColor: 'text-yellow-900',
      borderColor: 'border-yellow-400'
    }
  }
  if (accuracy >= 50) {
    return {
      backgroundColor: 'bg-orange-300',
      textColor: 'text-orange-900',
      borderColor: 'border-orange-400'
    }
  }
  if (accuracy >= 40) {
    return {
      backgroundColor: 'bg-orange-500',
      textColor: 'text-white',
      borderColor: 'border-orange-600'
    }
  }
  return {
    backgroundColor: 'bg-red-500',
    textColor: 'text-white',
    borderColor: 'border-red-600'
  }
}
