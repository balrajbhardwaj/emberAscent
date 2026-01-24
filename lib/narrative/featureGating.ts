/**
 * Ascent Guide - Feature Gating
 * 
 * Controls what content is shown to free vs Compass tier users.
 * Free tier sees teaser; Compass tier sees full guide.
 * 
 * @module lib/narrative/featureGating
 */

import type { DailyGuide, GatedGuide, GuideTier, GuideMetrics } from './types';
import { truncateWithHook } from './interpolator';

/**
 * Gate a daily guide based on subscription tier
 * 
 * Free tier:
 * - Shows full headline
 * - Shows truncated narrative (hook only)
 * - Hides conversation starter
 * - Hides focus rationale
 * 
 * Compass tier:
 * - Shows everything
 */
export function gateGuideByTier(guide: DailyGuide, tier: GuideTier): GatedGuide {
  if (tier === 'compass') {
    return {
      guide,
      tier,
      isLocked: false,
    };
  }
  
  // Free tier: Create teaser
  return {
    guide: {
      ...guide,
      // Clear sensitive content for free tier
      conversationStarter: null,
      focusRecommendation: guide.focusRecommendation
        ? {
            ...guide.focusRecommendation,
            rationale: '', // Hide rationale
          }
        : null,
    },
    tier,
    isLocked: true,
    teaser: {
      headline: guide.headline,
      narrativeHook: truncateWithHook(guide.narrative, 50),
    },
  };
}

/**
 * Check if a guide has meaningful content worth showing teaser for
 * Avoids showing teaser for generic/empty guides
 */
export function hasSubstantiveContent(guide: DailyGuide): boolean {
  // Must have more than generic content
  const hasPersonalizedHeadline = !guide.headline.includes('practised today');
  const hasActionableNarrative = guide.narrative.length > 30;
  const hasFocus = guide.focusRecommendation !== null;
  const hasConversation = guide.conversationStarter !== null;
  
  return hasPersonalizedHeadline || (hasActionableNarrative && (hasFocus || hasConversation));
}

/**
 * Get teaser text for upsell CTA
 */
export function getTeaserCallToAction(metrics: GuideMetrics): string {
  // Personalize CTA based on what we know
  if (metrics.rushPercent > 25) {
    return 'Unlock insights about practice speed and accuracy';
  }
  if (metrics.weakestTopicAccuracy < 50) {
    return 'See exactly where to focus for the biggest improvement';
  }
  if (metrics.isStreakActive && metrics.streakDays >= 5) {
    return 'Get personalised coaching to maintain this great momentum';
  }
  
  return 'Unlock personalised daily coaching guidance';
}

/**
 * Feature availability matrix
 */
export const FEATURE_AVAILABILITY = {
  // Headlines
  staticHeadlines: { free: true, compass: true },
  personalizedHeadlines: { free: false, compass: true },
  
  // Narrative
  fullNarrative: { free: false, compass: true },
  teaserNarrative: { free: true, compass: false }, // Only free sees teaser
  
  // Behavioral metrics
  rushFactor: { free: false, compass: true },
  fatigueAnalysis: { free: false, compass: true },
  
  // Conversation starters
  genericStarter: { free: true, compass: true },
  contextualStarter: { free: false, compass: true },
  
  // Focus recommendations
  topicList: { free: true, compass: true },
  focusRationale: { free: false, compass: true },
  
  // Delivery
  dashboardDisplay: { free: true, compass: true },
  weeklyEmail: { free: false, compass: true },
} as const;

/**
 * Check if a specific feature is available for a tier
 */
export function isFeatureAvailable(
  feature: keyof typeof FEATURE_AVAILABILITY,
  tier: GuideTier
): boolean {
  return FEATURE_AVAILABILITY[feature][tier];
}
