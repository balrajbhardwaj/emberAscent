/**
 * Stripe Billing Portal API
 * 
 * Creates Stripe billing portal sessions for subscription management.
 * Allows users to update payment methods, view invoices, and cancel subscriptions.
 * 
 * Security:
 * - Requires authenticated user
 * - Requires existing Stripe customer
 * 
 * @module app/api/stripe/portal
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe, isStripeConfigured } from '@/lib/stripe/client'
import { STRIPE_CONFIG } from '@/lib/stripe/config'

/**
 * POST /api/stripe/portal
 * 
 * Creates a Stripe billing portal session for the authenticated user.
 * 
 * @returns { url: string } - Billing portal URL
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_request: NextRequest) {
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

    // Get user profile with Stripe customer ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    if (!profile.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No subscription found. Please subscribe first.' },
        { status: 400 }
      )
    }

    // Create billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: STRIPE_CONFIG.urls.billingPortal,
    })

    return NextResponse.json({
      url: session.url,
    })

  } catch (error) {
    // Log error server-side only (no PII)
    console.error('Billing portal session creation failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json(
      { error: 'Failed to create billing portal session' },
      { status: 500 }
    )
  }
}
