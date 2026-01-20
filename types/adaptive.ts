/**
 * Adaptive Learning Type Definitions
 * 
 * Types for the adaptive difficulty engine that adjusts question
 * difficulty based on learner performance.
 * 
 * @module types/adaptive
 */

/**
 * Difficulty levels for questions
 */
export type DifficultyLevel = 'foundation' | 'standard' | 'challenge'

/**
 * Performance window for tracking recent performance
 */
export interface PerformanceWindow {
  correct: number
  incorrect: number
  total: number
  accuracy: number
}

/**
 * Difficulty adjustment decision
 */
export interface DifficultyAdjustment {
  currentLevel: DifficultyLevel
  recommendedLevel: DifficultyLevel
  shouldAdjust: boolean
  reason: string
  confidence: number // 0-1
}

/**
 * Adaptive session configuration
 */
export interface AdaptiveConfig {
  // Performance thresholds
  increaseThreshold: number // Default 0.75 (75%)
  decreaseThreshold: number // Default 0.45 (45%)
  
  // Window size for performance calculation
  windowSize: number // Default 5 questions
  
  // Cooldown to prevent rapid changes
  cooldownQuestions: number // Default 3
  
  // Minimum questions before adjustment
  minQuestionsBeforeAdjust: number // Default 3
}

/**
 * Child's performance tracking for adaptive system
 */
export interface ChildPerformanceTracker {
  childId: string
  topicId: string
  currentDifficulty: DifficultyLevel
  recentPerformance: PerformanceWindow
  questionsSinceLastAdjustment: number
  totalQuestionsInTopic: number
  lastAdjustmentAt?: Date
}

/**
 * Question selection weights
 */
export interface QuestionSelectionWeights {
  difficultyMatch: number // 0.40 (40%)
  topicCoverage: number // 0.25 (25%)
  recencyAvoidance: number // 0.20 (20%)
  weakAreaFocus: number // 0.15 (15%)
}

/**
 * Question selection criteria
 */
export interface QuestionSelectionCriteria {
  childId: string
  topicId: string
  currentDifficulty: DifficultyLevel
  excludeQuestionIds?: string[]
  weights?: Partial<QuestionSelectionWeights>
  limit?: number
}

/**
 * Scored question candidate
 */
export interface ScoredQuestion {
  questionId: string
  score: number
  difficulty: DifficultyLevel
  topicId: string
  subtopicName: string | null
  lastAttemptedAt: Date | null
}

/**
 * Topic performance statistics
 */
export interface TopicPerformance {
  topicId: string
  topicName: string
  difficulty: DifficultyLevel
  totalAttempts: number
  correctAttempts: number
  accuracy: number
  lastAttemptedAt: Date
  currentStreak: number
  bestStreak: number
}

/**
 * Weak area identification
 */
export interface WeakArea {
  topicId: string
  topicName: string
  subtopicName: string | null
  accuracy: number
  attemptsCount: number
  priority: 'high' | 'medium' | 'low'
}
