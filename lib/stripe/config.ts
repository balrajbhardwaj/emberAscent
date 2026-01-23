/**
 * Stripe Configuration
 * 
 * Centralized configuration for Stripe payment integration.
 * Includes pricing, product IDs, and feature mappings.
 * 
 * @module lib/stripe/config
 */

// Pricing configuration
export const STRIPE_CONFIG = {
  // Product IDs (create these in Stripe Dashboard)
  products: {
    ascent: {
      monthly: process.env.STRIPE_ASCENT_MONTHLY_PRICE_ID || 'price_ascent_monthly',
      annual: process.env.STRIPE_ASCENT_ANNUAL_PRICE_ID || 'price_ascent_annual',
    },
    summit: {
      monthly: process.env.STRIPE_SUMMIT_MONTHLY_PRICE_ID || 'price_summit_monthly',
      annual: process.env.STRIPE_SUMMIT_ANNUAL_PRICE_ID || 'price_summit_annual',
    },
  },
  
  // Pricing display (in GBP pence)
  pricing: {
    ascent: {
      monthly: 499, // £4.99
      annual: 3999, // £39.99 (33% off)
    },
    summit: {
      monthly: 999, // £9.99
      annual: 7999, // £79.99 (33% off)
    },
  },
  
  // URLs for redirects
  urls: {
    success: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings?tab=subscription&success=true`,
    cancel: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing?cancelled=true`,
    billingPortal: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings?tab=subscription`,
  },
} as const

// Feature flags by tier
export const TIER_FEATURES = {
  free: {
    unlimitedQuestions: true,
    basicProgress: true,
    weaknessHeatmap: false,
    readinessScore: false,
    studyPlans: false,
    weeklyReports: false,
    aiTutor: false,
    prioritySupport: false,
  },
  ascent: {
    unlimitedQuestions: true,
    basicProgress: true,
    weaknessHeatmap: true,
    readinessScore: true,
    studyPlans: true,
    weeklyReports: true,
    aiTutor: false,
    prioritySupport: false,
  },
  summit: {
    unlimitedQuestions: true,
    basicProgress: true,
    weaknessHeatmap: true,
    readinessScore: true,
    studyPlans: true,
    weeklyReports: true,
    aiTutor: true,
    prioritySupport: true,
  },
} as const

export type SubscriptionTier = keyof typeof TIER_FEATURES
export type TierFeature = keyof typeof TIER_FEATURES.free

/**
 * Check if a tier has access to a specific feature
 */
export function hasFeature(tier: SubscriptionTier, feature: TierFeature): boolean {
  return TIER_FEATURES[tier]?.[feature] ?? false
}

/**
 * Get the display price for a tier and billing period
 */
export function getDisplayPrice(
  tier: 'ascent' | 'summit',
  period: 'monthly' | 'annual'
): string {
  const priceInPence = STRIPE_CONFIG.pricing[tier][period]
  const priceInPounds = priceInPence / 100
  
  if (period === 'annual') {
    const monthlyEquivalent = priceInPounds / 12
    return `£${monthlyEquivalent.toFixed(2)}/mo (billed annually)`
  }
  
  return `£${priceInPounds.toFixed(2)}/mo`
}

/**
 * Get annual savings percentage
 */
export function getAnnualSavings(tier: 'ascent' | 'summit'): number {
  const monthlyTotal = STRIPE_CONFIG.pricing[tier].monthly * 12
  const annualPrice = STRIPE_CONFIG.pricing[tier].annual
  return Math.round(((monthlyTotal - annualPrice) / monthlyTotal) * 100)
}

/**
 * Map Stripe price ID to tier
 */
export function getTierFromPriceId(priceId: string): SubscriptionTier | null {
  const { products } = STRIPE_CONFIG
  
  if (priceId === products.ascent.monthly || priceId === products.ascent.annual) {
    return 'ascent'
  }
  if (priceId === products.summit.monthly || priceId === products.summit.annual) {
    return 'summit'
  }
  
  return null
}
