/**
 * Adaptive Difficulty Engine
 * 
 * Core algorithm for adjusting question difficulty based on learner performance.
 * Uses a rolling window to track recent performance and makes intelligent
 * difficulty adjustments with cooldown to prevent thrashing.
 * 
 * Algorithm:
 * - >75% accuracy: increase difficulty
 * - <45% accuracy: decrease difficulty
 * - 45-75%: maintain current level
 * - Cooldown: minimum 3 questions between adjustments
 * 
 * @module lib/adaptive/difficultyEngine
 */

import type {
  DifficultyLevel,
  DifficultyAdjustment,
  PerformanceWindow,
  ChildPerformanceTracker,
  AdaptiveConfig,
} from '@/types/adaptive'

/**
 * Default adaptive configuration
 */
const DEFAULT_CONFIG: AdaptiveConfig = {
  increaseThreshold: 0.75, // 75% accuracy
  decreaseThreshold: 0.45, // 45% accuracy
  windowSize: 5, // Last 5 questions
  cooldownQuestions: 3, // Wait 3 questions before next adjustment
  minQuestionsBeforeAdjust: 3, // Need at least 3 questions
}

/**
 * Difficulty level ordering for progression
 */
const DIFFICULTY_ORDER: DifficultyLevel[] = ['foundation', 'standard', 'challenge']

/**
 * Calculate performance metrics from recent attempts
 * 
 * @param correct - Number of correct answers
 * @param incorrect - Number of incorrect answers
 * @returns Performance window with accuracy
 */
export function calculatePerformance(
  correct: number,
  incorrect: number
): PerformanceWindow {
  const total = correct + incorrect
  const accuracy = total > 0 ? correct / total : 0

  return {
    correct,
    incorrect,
    total,
    accuracy,
  }
}

/**
 * Determine if difficulty adjustment is needed
 * 
 * @param tracker - Current performance tracker
 * @param config - Adaptive configuration (optional)
 * @returns Difficulty adjustment recommendation
 * 
 * @example
 * const adjustment = determineAdjustment(tracker)
 * if (adjustment.shouldAdjust) {
 *   console.log(`Adjust from ${adjustment.currentLevel} to ${adjustment.recommendedLevel}`)
 * }
 */
export function determineAdjustment(
  tracker: ChildPerformanceTracker,
  config: AdaptiveConfig = DEFAULT_CONFIG
): DifficultyAdjustment {
  const { currentDifficulty, recentPerformance, questionsSinceLastAdjustment } = tracker
  const { increaseThreshold, decreaseThreshold, cooldownQuestions, minQuestionsBeforeAdjust } = config

  // Default: no adjustment
  const noAdjustment: DifficultyAdjustment = {
    currentLevel: currentDifficulty,
    recommendedLevel: currentDifficulty,
    shouldAdjust: false,
    reason: 'No adjustment needed',
    confidence: 0,
  }

  // Check: Enough questions attempted?
  if (recentPerformance.total < minQuestionsBeforeAdjust) {
    return {
      ...noAdjustment,
      reason: `Need ${minQuestionsBeforeAdjust} questions before adjusting (have ${recentPerformance.total})`,
    }
  }

  // Check: Cooldown period?
  if (questionsSinceLastAdjustment < cooldownQuestions) {
    return {
      ...noAdjustment,
      reason: `Cooldown: ${cooldownQuestions - questionsSinceLastAdjustment} more questions needed`,
    }
  }

  const { accuracy } = recentPerformance

  // Performance too low: decrease difficulty
  if (accuracy < decreaseThreshold) {
    const newLevel = getAdjacentDifficulty(currentDifficulty, 'down')
    
    if (newLevel !== currentDifficulty) {
      return {
        currentLevel: currentDifficulty,
        recommendedLevel: newLevel,
        shouldAdjust: true,
        reason: `Low accuracy (${(accuracy * 100).toFixed(1)}%) - making questions easier`,
        confidence: 1 - accuracy, // Higher confidence when accuracy is lower
      }
    } else {
      return {
        ...noAdjustment,
        reason: 'Already at easiest difficulty',
      }
    }
  }

  // Performance excellent: increase difficulty
  if (accuracy > increaseThreshold) {
    const newLevel = getAdjacentDifficulty(currentDifficulty, 'up')
    
    if (newLevel !== currentDifficulty) {
      return {
        currentLevel: currentDifficulty,
        recommendedLevel: newLevel,
        shouldAdjust: true,
        reason: `High accuracy (${(accuracy * 100).toFixed(1)}%) - increasing challenge`,
        confidence: accuracy, // Higher confidence when accuracy is higher
      }
    } else {
      return {
        ...noAdjustment,
        reason: 'Already at hardest difficulty',
      }
    }
  }

  // Performance in target range: maintain current level
  return {
    ...noAdjustment,
    reason: `Accuracy (${(accuracy * 100).toFixed(1)}%) is in target range`,
    confidence: 0.5,
  }
}

/**
 * Get adjacent difficulty level
 * 
 * @param current - Current difficulty level
 * @param direction - Direction to move ('up' or 'down')
 * @returns New difficulty level (or same if at boundary)
 */
function getAdjacentDifficulty(
  current: DifficultyLevel,
  direction: 'up' | 'down'
): DifficultyLevel {
  const currentIndex = DIFFICULTY_ORDER.indexOf(current)
  
  if (direction === 'up') {
    const newIndex = Math.min(currentIndex + 1, DIFFICULTY_ORDER.length - 1)
    return DIFFICULTY_ORDER[newIndex]
  } else {
    const newIndex = Math.max(currentIndex - 1, 0)
    return DIFFICULTY_ORDER[newIndex]
  }
}

/**
 * Calculate rolling performance window from recent attempts
 * 
 * @param attempts - Array of recent attempts (true = correct, false = incorrect)
 * @param windowSize - Number of recent attempts to consider
 * @returns Performance window
 * 
 * @example
 * const performance = calculateRollingPerformance([true, true, false, true, true])
 * console.log(performance.accuracy) // 0.8 (80%)
 */
export function calculateRollingPerformance(
  attempts: boolean[],
  windowSize: number = DEFAULT_CONFIG.windowSize
): PerformanceWindow {
  // Take only the most recent attempts
  const recentAttempts = attempts.slice(-windowSize)
  
  const correct = recentAttempts.filter(a => a).length
  const incorrect = recentAttempts.filter(a => !a).length
  
  return calculatePerformance(correct, incorrect)
}

/**
 * Initialize performance tracker for new topic
 * 
 * @param childId - Child's unique ID
 * @param topicId - Topic unique ID
 * @param initialDifficulty - Starting difficulty level (default: foundation)
 * @returns New performance tracker
 */
export function initializeTracker(
  childId: string,
  topicId: string,
  initialDifficulty: DifficultyLevel = 'foundation'
): ChildPerformanceTracker {
  return {
    childId,
    topicId,
    currentDifficulty: initialDifficulty,
    recentPerformance: calculatePerformance(0, 0),
    questionsSinceLastAdjustment: 0,
    totalQuestionsInTopic: 0,
    lastAdjustmentAt: undefined,
  }
}

/**
 * Update performance tracker after question attempt
 * 
 * @param tracker - Current performance tracker
 * @param correct - Was the answer correct?
 * @param config - Adaptive configuration (optional)
 * @returns Updated tracker and adjustment recommendation
 * 
 * @example
 * const { tracker: updated, adjustment } = updateTrackerAfterAttempt(tracker, true)
 * if (adjustment.shouldAdjust) {
 *   await applyDifficultyAdjustment(updated)
 * }
 */
export function updateTrackerAfterAttempt(
  tracker: ChildPerformanceTracker,
  correct: boolean,
  config: AdaptiveConfig = DEFAULT_CONFIG
): { tracker: ChildPerformanceTracker; adjustment: DifficultyAdjustment } {
  // Update performance metrics
  const newCorrect = tracker.recentPerformance.correct + (correct ? 1 : 0)
  const newIncorrect = tracker.recentPerformance.incorrect + (correct ? 0 : 1)
  
  // Calculate rolling window (keep only last N questions)
  const totalAttempts = newCorrect + newIncorrect
  let adjustedCorrect = newCorrect
  let adjustedIncorrect = newIncorrect
  
  if (totalAttempts > config.windowSize) {
    // Keep proportions but limit to window size
    const ratio = config.windowSize / totalAttempts
    adjustedCorrect = Math.round(newCorrect * ratio)
    adjustedIncorrect = config.windowSize - adjustedCorrect
  }
  
  const updatedTracker: ChildPerformanceTracker = {
    ...tracker,
    recentPerformance: calculatePerformance(adjustedCorrect, adjustedIncorrect),
    questionsSinceLastAdjustment: tracker.questionsSinceLastAdjustment + 1,
    totalQuestionsInTopic: tracker.totalQuestionsInTopic + 1,
  }
  
  // Determine if adjustment needed
  const adjustment = determineAdjustment(updatedTracker, config)
  
  // Apply adjustment if recommended
  if (adjustment.shouldAdjust) {
    return {
      tracker: {
        ...updatedTracker,
        currentDifficulty: adjustment.recommendedLevel,
        questionsSinceLastAdjustment: 0, // Reset cooldown
        lastAdjustmentAt: new Date(),
      },
      adjustment,
    }
  }
  
  return { tracker: updatedTracker, adjustment }
}

/**
 * Get difficulty display name
 * 
 * @param difficulty - Difficulty level
 * @returns Human-readable name
 */
export function getDifficultyName(difficulty: DifficultyLevel): string {
  const names: Record<DifficultyLevel, string> = {
    foundation: 'Foundation',
    standard: 'Standard',
    challenge: 'Challenge',
  }
  return names[difficulty]
}

/**
 * Get difficulty color (Tailwind CSS classes)
 * 
 * @param difficulty - Difficulty level
 * @returns Tailwind color classes
 */
export function getDifficultyColor(difficulty: DifficultyLevel): string {
  const colors: Record<DifficultyLevel, string> = {
    foundation: 'text-green-600 bg-green-50 border-green-200',
    standard: 'text-blue-600 bg-blue-50 border-blue-200',
    challenge: 'text-purple-600 bg-purple-50 border-purple-200',
  }
  return colors[difficulty]
}
