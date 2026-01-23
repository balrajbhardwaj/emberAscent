'use client'

/**
 * useSubscription Hook
 * 
 * React hook for managing subscription state and actions.
 * Provides subscription details, tier checks, and billing portal access.
 * 
 * @module hooks/useSubscription
 */

import { useState, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import type { SubscriptionTier, SubscriptionStatus } from '@/types/database'
import type { BillingPeriod } from '@/types/subscription'
import { type TierFeature, hasFeature } from '@/lib/stripe/config'

interface UseSubscriptionProps {
  profile: {
    subscription_tier?: string
    subscription_status?: string
    stripe_customer_id?: string | null
    stripe_subscription_id?: string | null
    subscription_period_start?: string | null
    subscription_period_end?: string | null
    cancel_at_period_end?: boolean
  } | null
}

interface UseSubscriptionReturn {
  // Subscription state
  tier: SubscriptionTier
  status: SubscriptionStatus
  isActive: boolean
  isPaid: boolean
  isFreeTier: boolean
  periodEnd: Date | null
  cancelAtPeriodEnd: boolean
  
  // Feature checks
  hasFeature: (feature: TierFeature) => boolean
  canAccessAnalytics: boolean
  canAccessAiTutor: boolean
  
  // Actions
  openBillingPortal: () => Promise<void>
  startCheckout: (tier: 'ascent' | 'summit', billingPeriod: BillingPeriod) => Promise<void>
  
  // Loading states
  isLoading: boolean
  isPortalLoading: boolean
  isCheckoutLoading: boolean
}

/**
 * Hook for managing user subscription
 * 
 * @param props.profile - User profile with subscription fields
 * @returns Subscription state and actions
 * 
 * @example
 * const { tier, hasFeature, openBillingPortal } = useSubscription({ profile })
 * 
 * if (hasFeature('weaknessHeatmap')) {
 *   // Show analytics
 * }
 */
export function useSubscription({ profile }: UseSubscriptionProps): UseSubscriptionReturn {
  const [isPortalLoading, setIsPortalLoading] = useState(false)
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false)

  // Parse subscription state from profile
  const tier = (profile?.subscription_tier || 'free') as SubscriptionTier
  const status = (profile?.subscription_status || 'active') as SubscriptionStatus
  
  const periodEnd = profile?.subscription_period_end 
    ? new Date(profile.subscription_period_end)
    : null
    
  const cancelAtPeriodEnd = profile?.cancel_at_period_end ?? false

  // Computed properties
  const isActive = status === 'active' || status === 'trialing'
  const isPaid = tier !== 'free' && isActive
  const isFreeTier = tier === 'free'
  const isLoading = isPortalLoading || isCheckoutLoading

  // Feature access checks
  const checkFeature = useCallback(
    (feature: TierFeature) => hasFeature(tier, feature),
    [tier]
  )

  const canAccessAnalytics = useMemo(
    () => checkFeature('weaknessHeatmap'),
    [checkFeature]
  )

  const canAccessAiTutor = useMemo(
    () => checkFeature('aiTutor'),
    [checkFeature]
  )

  /**
   * Open Stripe billing portal for subscription management
   */
  const openBillingPortal = useCallback(async () => {
    if (!profile?.stripe_customer_id) {
      toast.error('No subscription found')
      return
    }

    setIsPortalLoading(true)

    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to open billing portal')
      }

      // Redirect to Stripe billing portal
      window.location.href = data.url
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong')
    } finally {
      setIsPortalLoading(false)
    }
  }, [profile?.stripe_customer_id])

  /**
   * Start checkout for a subscription upgrade
   */
  const startCheckout = useCallback(async (
    targetTier: 'ascent' | 'summit',
    billingPeriod: BillingPeriod
  ) => {
    if (tier === targetTier) {
      toast.info('You are already subscribed to this plan')
      return
    }

    setIsCheckoutLoading(true)

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: targetTier,
          billingPeriod,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong')
    } finally {
      setIsCheckoutLoading(false)
    }
  }, [tier])

  return {
    // State
    tier,
    status,
    isActive,
    isPaid,
    isFreeTier,
    periodEnd,
    cancelAtPeriodEnd,
    
    // Feature checks
    hasFeature: checkFeature,
    canAccessAnalytics,
    canAccessAiTutor,
    
    // Actions
    openBillingPortal,
    startCheckout,
    
    // Loading
    isLoading,
    isPortalLoading,
    isCheckoutLoading,
  }
}

/**
 * Get subscription tier display name
 */
export function getTierDisplayName(tier: SubscriptionTier): string {
  switch (tier) {
    case 'free':
      return 'Foundation'
    case 'ascent':
      return 'Ascent'
    case 'summit':
      return 'Summit'
    default:
      return 'Unknown'
  }
}

/**
 * Get subscription status display text
 */
export function getStatusDisplayText(status: SubscriptionStatus, cancelAtPeriodEnd: boolean): string {
  if (cancelAtPeriodEnd) {
    return 'Canceling at period end'
  }
  
  switch (status) {
    case 'active':
      return 'Active'
    case 'trialing':
      return 'Trial'
    case 'past_due':
      return 'Payment overdue'
    case 'cancelled':
      return 'Cancelled'
    default:
      return 'Unknown'
  }
}
