/**
 * Subscription Types
 * 
 * TypeScript type definitions for Stripe subscription management.
 * Covers checkout sessions, webhooks, and subscription state.
 * 
 * @module types/subscription
 */

import type { SubscriptionTier, SubscriptionStatus } from './database'

/**
 * Billing period options
 */
export type BillingPeriod = 'monthly' | 'yearly'

/**
 * Checkout session request payload
 */
export interface CheckoutRequest {
  tier: Exclude<SubscriptionTier, 'free'>
  billingPeriod: BillingPeriod
  successUrl?: string
  cancelUrl?: string
}

/**
 * Checkout session response
 */
export interface CheckoutResponse {
  sessionId: string
  url: string
}

/**
 * Billing portal session response
 */
export interface BillingPortalResponse {
  url: string
}

/**
 * Subscription details for display
 */
export interface SubscriptionDetails {
  tier: SubscriptionTier
  status: SubscriptionStatus
  periodStart: Date | null
  periodEnd: Date | null
  cancelAtPeriodEnd: boolean
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
}

/**
 * Subscription event from database
 */
export interface SubscriptionEvent {
  id: string
  profileId: string
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  stripeEventId: string
  eventType: string
  eventData: Record<string, unknown>
  processedAt: Date | null
  errorMessage: string | null
  createdAt: Date
}

/**
 * Subscription history entry
 */
export interface SubscriptionHistoryEntry {
  id: string
  profileId: string
  previousTier: SubscriptionTier
  newTier: SubscriptionTier
  changeReason: 'upgrade' | 'downgrade' | 'cancelled' | 'renewed' | 'trial_started' | 'trial_ended' | 'changed'
  stripeSubscriptionId: string | null
  effectiveAt: Date
  createdAt: Date
}

/**
 * Stripe webhook event types we handle
 */
export type StripeWebhookEventType = 
  | 'checkout.session.completed'
  | 'customer.subscription.created'
  | 'customer.subscription.updated'
  | 'customer.subscription.deleted'
  | 'invoice.paid'
  | 'invoice.payment_failed'

/**
 * Webhook processing result
 */
export interface WebhookResult {
  success: boolean
  eventId: string
  eventType: string
  error?: string
}

/**
 * Price display info for UI
 */
export interface PriceDisplay {
  monthly: {
    amount: number
    formatted: string
  }
  yearly: {
    amount: number
    formatted: string
    monthlyEquivalent: string
    savings: string
    savingsPercent: number
  }
}

/**
 * Feature availability by tier
 */
export interface TierFeatures {
  tier: SubscriptionTier
  name: string
  description: string
  features: string[]
  limitations?: string[]
  highlighted?: boolean
}

/**
 * Upgrade/downgrade flow state
 */
export interface SubscriptionFlowState {
  loading: boolean
  error: string | null
  currentTier: SubscriptionTier
  targetTier: SubscriptionTier | null
  billingPeriod: BillingPeriod
}

/**
 * Database row types for subscription tables
 */
export interface SubscriptionEventRow {
  id: string
  profile_id: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  stripe_event_id: string
  event_type: string
  event_data: Record<string, unknown>
  processed_at: string | null
  error_message: string | null
  created_at: string
}

export interface SubscriptionHistoryRow {
  id: string
  profile_id: string
  previous_tier: string
  new_tier: string
  change_reason: string
  stripe_subscription_id: string | null
  effective_at: string
  created_at: string
}

/**
 * Transform database row to SubscriptionEvent
 */
export function toSubscriptionEvent(row: SubscriptionEventRow): SubscriptionEvent {
  return {
    id: row.id,
    profileId: row.profile_id || '',
    stripeCustomerId: row.stripe_customer_id,
    stripeSubscriptionId: row.stripe_subscription_id,
    stripeEventId: row.stripe_event_id,
    eventType: row.event_type,
    eventData: row.event_data,
    processedAt: row.processed_at ? new Date(row.processed_at) : null,
    errorMessage: row.error_message,
    createdAt: new Date(row.created_at)
  }
}

/**
 * Transform database row to SubscriptionHistoryEntry
 */
export function toSubscriptionHistoryEntry(row: SubscriptionHistoryRow): SubscriptionHistoryEntry {
  return {
    id: row.id,
    profileId: row.profile_id,
    previousTier: row.previous_tier as SubscriptionTier,
    newTier: row.new_tier as SubscriptionTier,
    changeReason: row.change_reason as SubscriptionHistoryEntry['changeReason'],
    stripeSubscriptionId: row.stripe_subscription_id,
    effectiveAt: new Date(row.effective_at),
    createdAt: new Date(row.created_at)
  }
}
