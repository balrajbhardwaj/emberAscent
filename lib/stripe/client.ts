/**
 * Stripe Client
 *
 * Server-side Stripe SDK initialization.
 * Only import this in server components and API routes.
 *
 * @module lib/stripe/client
 */

import Stripe from 'stripe'

// Lazy-initialized Stripe instance to avoid build-time errors
let stripeInstance: Stripe | null = null

/**
 * Get the Stripe client instance (lazy initialization)
 *
 * IMPORTANT: Never expose this on the client side
 */
function getStripeClient(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      console.warn('STRIPE_SECRET_KEY is not set. Stripe functionality will be disabled.')
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
      apiVersion: '2025-12-15.clover',
      typescript: true,
      appInfo: {
        name: 'Ember Ascent',
        version: '1.0.0',
        url: 'https://emberascent.co.uk',
      },
    })
  }
  return stripeInstance
}

/**
 * Stripe client instance for server-side operations
 * Uses a getter to enable lazy initialization
 */
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return getStripeClient()[prop as keyof Stripe]
  },
})

/**
 * Check if Stripe is properly configured
 */
export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY
}

/**
 * Get Stripe customer by ID
 */
export async function getStripeCustomer(customerId: string): Promise<Stripe.Customer | null> {
  if (!isStripeConfigured()) return null
  
  try {
    const customer = await stripe.customers.retrieve(customerId)
    if (customer.deleted) return null
    return customer as Stripe.Customer
  } catch (error) {
    console.error('Error fetching Stripe customer:', error)
    return null
  }
}

/**
 * Get Stripe subscription by ID
 */
export async function getStripeSubscription(subscriptionId: string): Promise<Stripe.Subscription | null> {
  if (!isStripeConfigured()) return null
  
  try {
    return await stripe.subscriptions.retrieve(subscriptionId)
  } catch (error) {
    console.error('Error fetching Stripe subscription:', error)
    return null
  }
}
