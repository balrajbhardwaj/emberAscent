/**
 * Ascent Guide - Static Template Library
 * 
 * Pre-written templates for narrative generation.
 * Used for free tier and as fallback when LLM unavailable.
 * 
 * All templates follow growth mindset principles:
 * - Praise effort, not ability
 * - Use "not yet" framing
 * - Separate behaviour from identity
 * - Provide actionable next steps
 * 
 * @module lib/narrative/templates
 */

import type { NarrativeTemplate, ConversationStarter } from './types';

// =============================================================================
// READINESS HEADLINES
// =============================================================================

export const READINESS_TEMPLATES: NarrativeTemplate[] = [
  {
    id: 'readiness-excellent',
    category: 'readiness',
    condition: 'accuracy >= 85',
    template: '{name} is performing excellently — keep up the great work!',
    priority: 100,
  },
  {
    id: 'readiness-good',
    category: 'readiness',
    condition: 'accuracy >= 70 && accuracy < 85',
    template: '{name} is progressing well — consistent practice will get them to the summit.',
    priority: 90,
  },
  {
    id: 'readiness-developing',
    category: 'readiness',
    condition: 'accuracy >= 55 && accuracy < 70',
    template: '{name} is building strong foundations in {weakestTopic}.',
    priority: 80,
  },
  {
    id: 'readiness-needs-focus',
    category: 'readiness',
    condition: 'accuracy < 55',
    template: '{name} is working hard — let\'s focus on {weakestTopic} together.',
    priority: 70,
  },
];

// =============================================================================
// RUSH FACTOR TEMPLATES
// =============================================================================

export const RUSH_TEMPLATES: NarrativeTemplate[] = [
  {
    id: 'rush-high',
    category: 'rush',
    condition: 'rushPercent > 25',
    template: 'We noticed {name} answered {rushPercent}% of questions very quickly. Slowing down could improve accuracy.',
    priority: 85,
  },
  {
    id: 'rush-moderate',
    category: 'rush',
    condition: 'rushPercent > 15 && rushPercent <= 25',
    template: 'Some questions were answered quickly — encourage {name} to double-check before submitting.',
    priority: 75,
  },
  // No template for low rush — we don't comment on good behaviour unnecessarily
];

// =============================================================================
// FATIGUE TEMPLATES
// =============================================================================

export const FATIGUE_TEMPLATES: NarrativeTemplate[] = [
  {
    id: 'fatigue-detected',
    category: 'fatigue',
    condition: 'fatigueDetected === true',
    template: '{name}\'s accuracy dropped toward the end of the session. Shorter, focused practice bursts may help.',
    priority: 80,
  },
  {
    id: 'fatigue-long-session',
    category: 'fatigue',
    condition: 'sessionDuration > 30',
    template: 'That was a long session! {name}\'s best work often comes from 15-20 minute focused bursts.',
    priority: 70,
  },
];

// =============================================================================
// STREAK TEMPLATES
// =============================================================================

export const STREAK_TEMPLATES: NarrativeTemplate[] = [
  {
    id: 'streak-milestone-30',
    category: 'streak',
    condition: 'streakDays === 30',
    template: 'Incredible! {name} has a 30-day streak — consistency like this is the key to success.',
    priority: 100,
  },
  {
    id: 'streak-milestone-10',
    category: 'streak',
    condition: 'streakDays === 10',
    template: '{name} has been practising for 10 days straight — building great habits!',
    priority: 95,
  },
  {
    id: 'streak-milestone-5',
    category: 'streak',
    condition: 'streakDays === 5',
    template: 'Five days in a row! {name} is building excellent consistency.',
    priority: 90,
  },
  {
    id: 'streak-active',
    category: 'streak',
    condition: 'isStreakActive === true && streakDays > 2',
    template: '{name} is on a {streakDays}-day streak. Consistency builds confidence!',
    priority: 60,
  },
];

// =============================================================================
// COMPOUND TEMPLATES (behaviour + outcome)
// =============================================================================

export const COMPOUND_TEMPLATES: NarrativeTemplate[] = [
  {
    id: 'compound-rush-topic',
    category: 'compound',
    condition: 'rushPercent > 20 && topicAccuracy < 60',
    template: '{name} is rushing through {weakestTopic}, which may explain the lower accuracy. Hiding the timer for this topic could help.',
    priority: 90,
  },
  {
    id: 'compound-fatigue-topic',
    category: 'compound',
    condition: 'fatigueDetected === true && topicAccuracy < 60',
    template: '{name} tends to practise {weakestTopic} when tired. Try tackling it earlier in the day when focus is fresh.',
    priority: 85,
  },
  {
    id: 'compound-improving-topic',
    category: 'compound',
    condition: 'topicAccuracy > 70 && topicAccuracy < 85',
    template: '{weakestTopic} is improving! A few more focused sessions will cement this progress.',
    priority: 70,
  },
];

// =============================================================================
// CONVERSATION STARTERS
// =============================================================================

export const CONVERSATION_STARTERS: ConversationStarter[] = [
  // Streak-based
  {
    trigger: 'streak_active',
    question: 'I saw you\'ve been practising every day this week — which topic felt easiest?',
    context: 'Celebrates consistency and invites reflection.',
  },
  {
    trigger: 'streak_milestone',
    question: 'Amazing streak! What keeps you coming back to practise?',
    context: 'Reinforces intrinsic motivation.',
  },
  
  // Performance-based
  {
    trigger: 'high_accuracy',
    question: 'Great session today! What strategy helped you get so many right?',
    context: 'Encourages metacognition about successful strategies.',
  },
  {
    trigger: 'improvement',
    question: 'I noticed {topic} is getting easier for you — what changed?',
    context: 'Highlights growth and effort.',
  },
  
  // Challenge-based
  {
    trigger: 'difficult_topic',
    question: 'Which question today made you think the hardest?',
    context: 'Normalises challenge as part of learning.',
  },
  {
    trigger: 'low_accuracy',
    question: 'Some tricky questions today! Is there one you want to look at together?',
    context: 'Offers support without criticism.',
  },
  
  // Rush-based
  {
    trigger: 'rushing',
    question: 'You flew through those questions quickly — do you feel the timer makes you rush?',
    context: 'Opens dialogue about test anxiety.',
  },
  {
    trigger: 'speed_vs_accuracy',
    question: 'Would you rather get more questions done, or take more time on each one?',
    context: 'Helps child reflect on their approach.',
  },
  
  // Fatigue-based
  {
    trigger: 'fatigue',
    question: 'That was a long session! How are you feeling?',
    context: 'Shows care for wellbeing, not just results.',
  },
  {
    trigger: 'session_timing',
    question: 'When do you feel most focused — morning or afternoon?',
    context: 'Helps optimise practice schedule.',
  },
  
  // General engagement
  {
    trigger: 'general_positive',
    question: 'What was the most interesting thing you learned today?',
    context: 'Focuses on learning, not scores.',
  },
  {
    trigger: 'general_neutral',
    question: 'Is there a topic you wish had more questions?',
    context: 'Invites ownership of learning journey.',
  },
  {
    trigger: 'mock_test',
    question: 'How did that mock test feel compared to a real exam?',
    context: 'Opens discussion about test readiness.',
  },
  
  // Subject-specific
  {
    trigger: 'maths_focus',
    question: 'Was there a maths problem today that felt like a puzzle?',
    context: 'Reframes maths as problem-solving.',
  },
  {
    trigger: 'english_focus',
    question: 'Did any of the reading passages interest you?',
    context: 'Connects learning to curiosity.',
  },
  {
    trigger: 'verbal_reasoning',
    question: 'Verbal reasoning can be tricky — any patterns you\'ve spotted?',
    context: 'Encourages pattern recognition.',
  },
];

// =============================================================================
// FOCUS RATIONALE TEMPLATES
// =============================================================================

export const FOCUS_RATIONALE_TEMPLATES = {
  low_accuracy: '{topic} has {accuracy}% accuracy from {attempts} attempts — focused practice here will yield quick gains.',
  rushing_detected: 'Rushing was detected in {topic}. Slowing down could improve accuracy by ~{potentialGain}%.',
  stagnant: '{topic} hasn\'t improved recently. A fresh approach or worked examples might help.',
  nearly_mastered: '{topic} is at {accuracy}% — a few more correct answers will lock in mastery.',
  curriculum_gap: '{topic} is a core Year {yearGroup} skill that appears frequently in exams.',
};

// =============================================================================
// HELPER: Get all templates
// =============================================================================

export const ALL_TEMPLATES: NarrativeTemplate[] = [
  ...READINESS_TEMPLATES,
  ...RUSH_TEMPLATES,
  ...FATIGUE_TEMPLATES,
  ...STREAK_TEMPLATES,
  ...COMPOUND_TEMPLATES,
];

/**
 * Get conversation starter by trigger type
 */
export function getConversationStarter(trigger: string): ConversationStarter | null {
  return CONVERSATION_STARTERS.find(cs => cs.trigger === trigger) || null;
}

/**
 * Get a random conversation starter from a list of applicable triggers
 */
export function getRandomConversationStarter(triggers: string[]): ConversationStarter | null {
  const applicable = CONVERSATION_STARTERS.filter(cs => triggers.includes(cs.trigger));
  if (applicable.length === 0) return null;
  return applicable[Math.floor(Math.random() * applicable.length)];
}
