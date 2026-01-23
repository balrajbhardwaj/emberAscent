/**
 * Stripe Webhook Handler
 * 
 * Processes Stripe webhook events for subscription lifecycle management.
 * Handles checkout completion, subscription updates, and cancellations.
 * 
 * Security:
 * - Verifies Stripe webhook signature
 * - Uses service role for database updates
 * - Logs all events for audit trail
 * 
 * @module app/api/stripe/webhook
 */

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe, isStripeConfigured } from '@/lib/stripe/client'
import { createServiceClient } from '@/lib/supabase/service'
import { getTierFromPriceId } from '@/lib/stripe/config'

// Disable body parsing - Stripe requires raw body for signature verification
export const dynamic = 'force-dynamic'

// Type alias for service client - uses any to handle tables not yet in generated types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ServiceClient = any

/**
 * Stripe subscription status to our status mapping
 */
function mapSubscriptionStatus(stripeStatus: string): string {
  switch (stripeStatus) {
    case 'active':
    case 'trialing':
      return 'active'
    case 'past_due':
      return 'past_due'
    case 'canceled':
    case 'unpaid':
      return 'cancelled'
    default:
      return 'active'
  }
}

/**
 * POST /api/stripe/webhook
 * 
 * Handles Stripe webhook events.
 * 
 * Events handled:
 * - checkout.session.completed: Initial subscription purchase
 * - customer.subscription.updated: Plan changes, renewals
 * - customer.subscription.deleted: Cancellations
 * - invoice.payment_failed: Payment failures
 */
export async function POST(request: NextRequest) {
  try {
    // Check Stripe configuration
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: 'Webhook not configured' },
        { status: 503 }
      )
    }

    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured')
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }

    // Verify webhook signature
    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', {
        error: err instanceof Error ? err.message : 'Unknown error',
      })
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      )
    }

    // Use service role client for database updates
    const supabase = createServiceClient()

    // Log the event for audit trail
    await logWebhookEvent(supabase, event)

    // Process the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(supabase, event.data.object as Stripe.Checkout.Session)
        break

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(supabase, event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(supabase, event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(supabase, event.data.object as Stripe.Invoice)
        break

      default:
        // Log unhandled event types for monitoring
        console.log(`Unhandled Stripe event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook processing error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

/**
 * Log webhook event to database for audit trail
 */
async function logWebhookEvent(
  supabase: ServiceClient,
  event: Stripe.Event
) {
  try {
    // Extract user ID from event metadata if available
    let profileId: string | null = null
    // Type assertion through unknown to handle Stripe's complex union types
    const eventObject = event.data.object as unknown as Record<string, unknown>
    
    if (eventObject.metadata && typeof eventObject.metadata === 'object') {
      const metadata = eventObject.metadata as Record<string, string>
      profileId = metadata.supabase_user_id || null
    }

    // Use type assertion since subscription_events table may not be in generated types yet
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('subscription_events').insert({
      profile_id: profileId,
      stripe_customer_id: (eventObject.customer as string) || null,
      stripe_subscription_id: (eventObject.subscription as string) || (eventObject.id as string) || null,
      stripe_event_id: event.id,
      event_type: event.type,
      event_data: event.data.object as unknown as Record<string, unknown>,
      processed_at: new Date().toISOString(),
    })
  } catch (err) {
    // Don't fail the webhook if logging fails
    console.error('Failed to log webhook event:', err)
  }
}

/**
 * Handle checkout session completion
 * This is triggered when a customer completes the checkout flow
 */
async function handleCheckoutCompleted(
  supabase: ServiceClient,
  session: Stripe.Checkout.Session
) {
  const userId = session.metadata?.supabase_user_id
  const tier = session.metadata?.tier

  if (!userId) {
    console.error('Checkout completed without user ID in metadata')
    return
  }

  // If subscription mode, the subscription webhook will handle the update
  // We only need to ensure customer ID is saved
  if (session.customer) {
    await supabase
      .from('profiles')
      .update({
        stripe_customer_id: session.customer as string,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
  }

  console.log(`Checkout completed for user ${userId}, tier: ${tier}`)
}

/**
 * Handle subscription created/updated events
 * Updates the user's subscription tier and status
 */
async function handleSubscriptionUpdated(
  supabase: ServiceClient,
  subscription: Stripe.Subscription
) {
  const userId = subscription.metadata?.supabase_user_id

  if (!userId) {
    // Try to find user by customer ID
    const customerId = subscription.customer as string
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single()

    if (!profile) {
      console.error('Subscription updated but no matching user found:', {
        customerId,
        subscriptionId: subscription.id,
      })
      return
    }

    // Update with found profile ID
    await updateProfileSubscription(supabase, profile.id, subscription)
  } else {
    await updateProfileSubscription(supabase, userId, subscription)
  }
}

/**
 * Update profile with subscription details
 */
async function updateProfileSubscription(
  supabase: ServiceClient,
  userId: string,
  subscription: Stripe.Subscription
) {
  // Get the price ID to determine tier
  const priceId = subscription.items.data[0]?.price.id
  const tier = priceId ? getTierFromPriceId(priceId) : 'free'
  const status = mapSubscriptionStatus(subscription.status)

  // Get previous tier for history
  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', userId)
    .single()

  const previousTier = currentProfile?.subscription_tier || 'free'

  // Extract period timestamps (Stripe API v2024-12-18)
  // Access these from the subscription object which may have different shapes
  const subAny = subscription as unknown as Record<string, unknown>
  const periodStart = subAny.current_period_start as number | undefined
  const periodEnd = subAny.current_period_end as number | undefined

  // Update profile
  const { error } = await supabase
    .from('profiles')
    .update({
      subscription_tier: tier,
      subscription_status: status,
      stripe_customer_id: subscription.customer as string,
      stripe_subscription_id: subscription.id,
      subscription_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
      subscription_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) {
    console.error('Failed to update profile subscription:', error)
    return
  }

  // Record tier change in history if changed
  if (previousTier !== tier) {
    await supabase.from('subscription_history').insert({
      profile_id: userId,
      previous_tier: previousTier,
      new_tier: tier,
      change_reason: tier === 'free' ? 'cancelled' : 
                     (previousTier === 'free' ? 'upgrade' : 
                     (previousTier === 'summit' && tier === 'ascent' ? 'downgrade' : 'upgrade')),
      stripe_subscription_id: subscription.id,
      effective_at: new Date().toISOString(),
    })
  }

  console.log(`Updated subscription for user ${userId}: ${tier} (${status})`)
}

/**
 * Handle subscription deletion (cancellation)
 */
async function handleSubscriptionDeleted(
  supabase: ServiceClient,
  subscription: Stripe.Subscription
) {
  const customerId = subscription.customer as string

  // Find user by customer ID
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, subscription_tier')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!profile) {
    console.error('Subscription deleted but no matching user found:', {
      customerId,
      subscriptionId: subscription.id,
    })
    return
  }

  const previousTier = profile.subscription_tier || 'free'

  // Downgrade to free tier
  await supabase
    .from('profiles')
    .update({
      subscription_tier: 'free',
      subscription_status: 'cancelled',
      stripe_subscription_id: null,
      subscription_period_start: null,
      subscription_period_end: null,
      cancel_at_period_end: false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', profile.id)

  // Record cancellation in history
  if (previousTier !== 'free') {
    await supabase.from('subscription_history').insert({
      profile_id: profile.id,
      previous_tier: previousTier,
      new_tier: 'free',
      change_reason: 'cancelled',
      stripe_subscription_id: subscription.id,
      effective_at: new Date().toISOString(),
    })
  }

  console.log(`Subscription cancelled for user ${profile.id}`)
}

/**
 * Handle payment failure
 * Could be used to send notification or take action
 */
async function handlePaymentFailed(
  supabase: ServiceClient,
  invoice: Stripe.Invoice
) {
  const customerId = invoice.customer as string

  // Find user by customer ID
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!profile) {
    console.error('Payment failed but no matching user found:', {
      customerId,
      invoiceId: invoice.id,
    })
    return
  }

  // Update subscription status to past_due
  await supabase
    .from('profiles')
    .update({
      subscription_status: 'past_due',
      updated_at: new Date().toISOString(),
    })
    .eq('id', profile.id)

  console.log(`Payment failed for user ${profile.id}`)

  // TODO: Send email notification about failed payment
}
