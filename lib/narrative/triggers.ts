/**
 * Ascent Guide - Pattern Triggers
 * 
 * Analyzes metrics to determine which conversation starters
 * and narrative elements are applicable.
 * 
 * @module lib/narrative/triggers
 */

import type { GuideMetrics, ConversationStarter, FocusRecommendation } from './types';
import { getRandomConversationStarter, FOCUS_RATIONALE_TEMPLATES } from './templates';
import { interpolate, metricsToContext } from './interpolator';

// =============================================================================
// THRESHOLDS (configurable)
// =============================================================================

const THRESHOLDS = {
  // Rush detection
  RUSH_HIGH: 25,          // % of questions answered <5 seconds
  RUSH_MODERATE: 15,
  
  // Accuracy levels
  ACCURACY_EXCELLENT: 85,
  ACCURACY_GOOD: 70,
  ACCURACY_DEVELOPING: 55,
  
  // Fatigue detection
  SESSION_LONG: 30,       // minutes
  ACCURACY_DROP: 15,      // % drop from session start to end
  
  // Streak milestones
  STREAK_MILESTONE_1: 5,
  STREAK_MILESTONE_2: 10,
  STREAK_MILESTONE_3: 30,
  
  // Topic focus
  TOPIC_NEEDS_FOCUS: 60,  // % accuracy threshold
  TOPIC_ATTEMPTS_MIN: 5,  // Minimum attempts before flagging
};

// =============================================================================
// TRIGGER DETECTION
// =============================================================================

/**
 * Get all applicable conversation starter triggers for given metrics
 */
export function getApplicableTriggers(metrics: GuideMetrics): string[] {
  const triggers: string[] = [];
  
  // Streak triggers
  if (metrics.streakDays === THRESHOLDS.STREAK_MILESTONE_3) {
    triggers.push('streak_milestone');
  } else if (metrics.streakDays === THRESHOLDS.STREAK_MILESTONE_2) {
    triggers.push('streak_milestone');
  } else if (metrics.streakDays === THRESHOLDS.STREAK_MILESTONE_1) {
    triggers.push('streak_milestone');
  } else if (metrics.isStreakActive && metrics.streakDays > 2) {
    triggers.push('streak_active');
  }
  
  // Performance triggers
  if (metrics.accuracy >= THRESHOLDS.ACCURACY_EXCELLENT) {
    triggers.push('high_accuracy');
  } else if (metrics.accuracy < THRESHOLDS.ACCURACY_DEVELOPING) {
    triggers.push('low_accuracy');
  }
  
  // Topic-specific triggers
  if (metrics.weakestTopicAccuracy < THRESHOLDS.TOPIC_NEEDS_FOCUS) {
    triggers.push('difficult_topic');
  }
  
  // Rush triggers
  if (metrics.rushPercent > THRESHOLDS.RUSH_HIGH) {
    triggers.push('rushing');
    triggers.push('speed_vs_accuracy');
  }
  
  // Fatigue triggers
  if (metrics.fatigueDetected) {
    triggers.push('fatigue');
  }
  if (metrics.sessionDuration > THRESHOLDS.SESSION_LONG) {
    triggers.push('session_timing');
  }
  
  // Subject-specific (if we can detect from topic)
  const topic = metrics.weakestTopic.toLowerCase();
  if (topic.includes('fraction') || topic.includes('algebra') || topic.includes('geometry')) {
    triggers.push('maths_focus');
  } else if (topic.includes('comprehension') || topic.includes('vocabulary') || topic.includes('grammar')) {
    triggers.push('english_focus');
  } else if (topic.includes('verbal')) {
    triggers.push('verbal_reasoning');
  }
  
  // General fallbacks
  if (triggers.length === 0) {
    triggers.push(metrics.accuracy >= THRESHOLDS.ACCURACY_GOOD ? 'general_positive' : 'general_neutral');
  }
  
  return triggers;
}

/**
 * Get the best conversation starter for given metrics
 */
export function selectConversationStarter(metrics: GuideMetrics): ConversationStarter | null {
  const triggers = getApplicableTriggers(metrics);
  const starter = getRandomConversationStarter(triggers);
  
  if (!starter) return null;
  
  // Interpolate any variables in the question
  const context = metricsToContext(metrics);
  return {
    ...starter,
    question: interpolate(starter.question, {
      ...context,
      topic: metrics.weakestTopic,
    }),
  };
}

// =============================================================================
// FOCUS RECOMMENDATION
// =============================================================================

/**
 * Determine the priority level for a focus recommendation
 */
function determinePriority(metrics: GuideMetrics): 'urgent' | 'recommended' | 'optional' {
  // Urgent: Very low accuracy + multiple attempts (confirmed weakness)
  if (
    metrics.weakestTopicAccuracy < 40 &&
    metrics.topicAttempts >= THRESHOLDS.TOPIC_ATTEMPTS_MIN
  ) {
    return 'urgent';
  }
  
  // Recommended: Low accuracy or rushing on topic
  if (
    metrics.weakestTopicAccuracy < THRESHOLDS.TOPIC_NEEDS_FOCUS ||
    (metrics.rushPercent > THRESHOLDS.RUSH_HIGH && metrics.weakestTopicAccuracy < THRESHOLDS.ACCURACY_GOOD)
  ) {
    return 'recommended';
  }
  
  return 'optional';
}

/**
 * Generate focus recommendation with rationale
 */
export function generateFocusRecommendation(metrics: GuideMetrics): FocusRecommendation | null {
  // Don't recommend if accuracy is already good
  if (metrics.weakestTopicAccuracy >= THRESHOLDS.ACCURACY_GOOD) {
    return null;
  }
  
  // Don't recommend if not enough attempts to be meaningful
  if (metrics.topicAttempts < 3) {
    return null;
  }
  
  const context = metricsToContext(metrics);
  const priority = determinePriority(metrics);
  
  // Select appropriate rationale template
  let rationaleTemplate: string;
  
  if (metrics.rushPercent > THRESHOLDS.RUSH_HIGH) {
    rationaleTemplate = FOCUS_RATIONALE_TEMPLATES.rushing_detected;
  } else if (metrics.weakestTopicAccuracy < 50) {
    rationaleTemplate = FOCUS_RATIONALE_TEMPLATES.low_accuracy;
  } else if (metrics.weakestTopicAccuracy >= 65) {
    rationaleTemplate = FOCUS_RATIONALE_TEMPLATES.nearly_mastered;
  } else {
    rationaleTemplate = FOCUS_RATIONALE_TEMPLATES.curriculum_gap;
  }
  
  return {
    topic: metrics.weakestTopic,
    rationale: interpolate(rationaleTemplate, {
      ...context,
      topic: metrics.weakestTopic,
      attempts: metrics.topicAttempts,
    }),
    priority,
    metrics: {
      accuracy: metrics.weakestTopicAccuracy,
      attempts: metrics.topicAttempts,
    },
  };
}

// =============================================================================
// BEHAVIORAL FLAGS
// =============================================================================

/**
 * Detect behavioral patterns that should be highlighted
 */
export interface BehavioralFlags {
  isRushing: boolean;
  isFatigued: boolean;
  hasLongSession: boolean;
  hasStreak: boolean;
  isStreakMilestone: boolean;
  isImproving: boolean;
  needsFocus: boolean;
}

export function detectBehavioralFlags(metrics: GuideMetrics): BehavioralFlags {
  return {
    isRushing: metrics.rushPercent > THRESHOLDS.RUSH_MODERATE,
    isFatigued: metrics.fatigueDetected ?? false,
    hasLongSession: metrics.sessionDuration > THRESHOLDS.SESSION_LONG,
    hasStreak: metrics.isStreakActive && metrics.streakDays > 2,
    isStreakMilestone: [5, 10, 30].includes(metrics.streakDays),
    isImproving: metrics.accuracy >= THRESHOLDS.ACCURACY_GOOD,
    needsFocus: metrics.weakestTopicAccuracy < THRESHOLDS.TOPIC_NEEDS_FOCUS,
  };
}
