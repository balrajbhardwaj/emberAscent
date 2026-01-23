/**
 * Stripe Checkout Session API
 * 
 * Creates Stripe checkout sessions for subscription upgrades.
 * Handles authentication and creates/retrieves Stripe customers.
 * 
 * Security:
 * - Requires authenticated user
 * - Validates tier and billing period
 * - Creates customer with user metadata
 * 
 * @module app/api/stripe/checkout
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe, isStripeConfigured } from '@/lib/stripe/client'
import { STRIPE_CONFIG } from '@/lib/stripe/config'
import { z } from 'zod'

// Request validation schema
const checkoutSchema = z.object({
  tier: z.enum(['ascent', 'summit']),
  billingPeriod: z.enum(['monthly', 'yearly']),
})

/**
 * POST /api/stripe/checkout
 * 
 * Creates a Stripe checkout session for subscription purchase.
 * 
 * @param request - Request body: { tier: 'ascent' | 'summit', billingPeriod: 'monthly' | 'yearly' }
 * @returns { sessionId: string, url: string } - Checkout session details
 */
export async function POST(request: NextRequest) {
  try {
    // Check Stripe configuration
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: 'Payment processing is not configured' },
        { status: 503 }
      )
    }

    // Authenticate user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const parseResult = checkoutSchema.safeParse(body)
    
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parseResult.error.flatten() },
        { status: 400 }
      )
    }

    const { tier, billingPeriod } = parseResult.data

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, stripe_customer_id, subscription_tier')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Check if already on the requested tier
    if (profile.subscription_tier === tier) {
      return NextResponse.json(
        { error: 'Already subscribed to this tier' },
        { status: 400 }
      )
    }

    // Get or create Stripe customer
    let customerId = profile.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: profile.full_name || undefined,
        metadata: {
          supabase_user_id: user.id,
        },
      })
      customerId = customer.id

      // Save customer ID to profile
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    // Get price ID
    const priceKey = billingPeriod === 'monthly' ? 'monthly' : 'annual'
    const priceId = STRIPE_CONFIG.products[tier][priceKey]

    if (!priceId || priceId.startsWith('price_')) {
      // Price ID not configured in environment
      return NextResponse.json(
        { error: 'Subscription pricing not configured' },
        { status: 503 }
      )
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: STRIPE_CONFIG.urls.success,
      cancel_url: STRIPE_CONFIG.urls.cancel,
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
          tier: tier,
        },
      },
      metadata: {
        supabase_user_id: user.id,
        tier: tier,
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      customer_update: {
        address: 'auto',
        name: 'auto',
      },
    })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })

  } catch (error) {
    // Log error server-side only (no PII)
    console.error('Checkout session creation failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
