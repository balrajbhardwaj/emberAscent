/**
 * Ascent Guide - Module Index
 * 
 * Central export point for narrative generation utilities.
 * 
 * @module lib/narrative
 */

// Types
export type {
  GuideTier,
  GuideMetrics,
  ConversationStarter,
  FocusRecommendation,
  DailyGuide,
  GatedGuide,
  NarrativeTemplate,
  TemplateContext,
  DailyGuideRow,
  DailyGuideResponse,
} from './types';

// Templates
export {
  READINESS_TEMPLATES,
  RUSH_TEMPLATES,
  FATIGUE_TEMPLATES,
  STREAK_TEMPLATES,
  COMPOUND_TEMPLATES,
  CONVERSATION_STARTERS,
  FOCUS_RATIONALE_TEMPLATES,
  ALL_TEMPLATES,
  getConversationStarter,
  getRandomConversationStarter,
} from './templates';

// Interpolation
export {
  interpolate,
  metricsToContext,
  evaluateCondition,
  findMatchingTemplates,
  generateStaticNarrative,
  truncateWithHook,
} from './interpolator';

// Triggers
export {
  getApplicableTriggers,
  selectConversationStarter,
  generateFocusRecommendation,
  detectBehavioralFlags,
} from './triggers';

// Feature Gating
export {
  gateGuideByTier,
  hasSubstantiveContent,
  getTeaserCallToAction,
  FEATURE_AVAILABILITY,
  isFeatureAvailable,
} from './featureGating';

// Prompts
export {
  SYSTEM_PROMPT,
  buildDailyGuidePrompt,
  parseGuideResponse,
  validateGeneratedContent,
} from './prompts';

// Generator
export {
  generateStaticGuide,
  generateLLMGuide,
  generateDailyGuide,
  generateGuidesInBatch,
} from './generator';
