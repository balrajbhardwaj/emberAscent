'use client'

/**
 * Pricing Cards Component
 * 
 * Client-side pricing cards with Stripe checkout integration.
 * Handles billing period toggle and checkout session creation.
 * 
 * @module components/pricing/PricingCards
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { loadStripe } from '@stripe/stripe-js'
import type { BillingPeriod } from '@/types/subscription'

// Local tier type for pricing component (matches database tier values)
type TierValue = 'free' | 'ascent' | 'summit'

// Initialize Stripe
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null

interface PricingCardsProps {
  currentTier?: TierValue
  isAuthenticated?: boolean
}

/**
 * Feature list item component
 */
function FeatureItem({ text, included }: { text: string; included: boolean }) {
  return (
    <li className="flex items-start gap-3">
      <Check
        className={`h-5 w-5 shrink-0 mt-0.5 ${
          included ? 'text-emerald-600' : 'text-slate-300'
        }`}
      />
      <span className={included ? 'text-slate-700' : 'text-slate-400'}>
        {text}
      </span>
    </li>
  )
}

/**
 * Pricing configuration
 */
const PRICING = {
  free: {
    name: 'Foundation',
    description: 'Everything your child needs to practice and improve',
    monthly: 0,
    yearly: 0,
    features: [
      'Unlimited practice questions',
      'All subjects: Verbal Reasoning, English, Maths',
      'All difficulty levels',
      'Instant feedback on answers',
      'Question bookmarks',
      'Basic progress tracking',
      'Streak counter and daily goals',
    ],
  },
  ascent: {
    name: 'Ascent',
    description: 'For parents who want to guide their child\'s preparation strategically',
    monthly: 4.99,
    yearly: 39.99,
    features: [
      'Everything in Foundation',
      'Learning Health Check',
      'Exam Readiness Score',
      'Areas of Improvement heatmap',
      'Performance analytics over time',
      'Behavioral insights (rush factor, fatigue)',
      'Personalized recommendations',
    ],
  },
  summit: {
    name: 'Summit',
    description: 'The complete package with AI-powered tutoring support',
    monthly: 9.99,
    yearly: 79.99,
    features: [
      'Everything in Ascent',
      'AI tutor assistance',
      'Adaptive study plans',
      'Priority support',
      'Mock exam simulations',
      'Detailed performance reports',
    ],
  },
}

export function PricingCards({ currentTier = 'free', isAuthenticated = false }: PricingCardsProps) {
  const router = useRouter()
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('yearly')
  const [loadingTier, setLoadingTier] = useState<string | null>(null)

  /**
   * Handle checkout for a specific tier
   */
  async function handleCheckout(tier: 'ascent' | 'summit') {
    if (!isAuthenticated) {
      // Redirect to signup with return URL
      router.push(`/signup?return_to=/pricing&tier=${tier}`)
      return
    }

    if (tier === currentTier) {
      toast.info('You are already subscribed to this plan')
      return
    }

    if (!stripePromise) {
      toast.error('Payment processing is not configured')
      return
    }

    setLoadingTier(tier)

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier,
          billingPeriod,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      const stripe = await stripePromise
      if (stripe && data.url) {
        window.location.href = data.url
      } else {
        throw new Error('Failed to load payment processor')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong')
    } finally {
      setLoadingTier(null)
    }
  }

  /**
   * Get button text based on current tier and target tier
   */
  function getButtonText(tier: TierValue): string {
    if (tier === 'free') return 'Current Plan'
    if (tier === currentTier) return 'Current Plan'
    if (currentTier === 'summit' && tier === 'ascent') return 'Downgrade'
    return isAuthenticated ? 'Upgrade Now' : 'Get Started'
  }

  /**
   * Get price display
   */
  function getPriceDisplay(tier: keyof typeof PRICING): string {
    if (tier === 'free') return 'Free'
    const price = billingPeriod === 'yearly' 
      ? PRICING[tier].yearly 
      : PRICING[tier].monthly
    const period = billingPeriod === 'yearly' ? '/year' : '/month'
    return `£${price.toFixed(2)}${period}`
  }

  /**
   * Get monthly equivalent for yearly pricing
   */
  function getMonthlyEquivalent(tier: 'ascent' | 'summit'): string {
    if (billingPeriod !== 'yearly') return ''
    const monthlyEquivalent = PRICING[tier].yearly / 12
    return `£${monthlyEquivalent.toFixed(2)}/mo`
  }

  return (
    <div className="space-y-8">
      {/* Billing Period Toggle */}
      <div className="flex items-center justify-center gap-4">
        <Label 
          htmlFor="billing-toggle" 
          className={billingPeriod === 'monthly' ? 'text-slate-900' : 'text-slate-500'}
        >
          Monthly
        </Label>
        <Switch
          id="billing-toggle"
          checked={billingPeriod === 'yearly'}
          onCheckedChange={(checked) => setBillingPeriod(checked ? 'yearly' : 'monthly')}
        />
        <Label 
          htmlFor="billing-toggle"
          className={billingPeriod === 'yearly' ? 'text-slate-900' : 'text-slate-500'}
        >
          Yearly
          <Badge variant="secondary" className="ml-2 bg-emerald-100 text-emerald-700">
            Save 33%
          </Badge>
        </Label>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* Free Tier */}
        <Card className={currentTier === 'free' ? 'border-emerald-500 border-2' : ''}>
          {currentTier === 'free' && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <Badge className="bg-emerald-600 text-white">Current Plan</Badge>
            </div>
          )}
          <CardHeader>
            <CardTitle className="text-2xl">{PRICING.free.name}</CardTitle>
            <CardDescription>{PRICING.free.description}</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold text-slate-900">Free</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              {PRICING.free.features.map((feature, i) => (
                <FeatureItem key={i} text={feature} included={true} />
              ))}
            </ul>
            <Button
              className="w-full"
              variant="outline"
              disabled={currentTier === 'free'}
              onClick={() => router.push('/signup')}
            >
              {currentTier === 'free' ? 'Current Plan' : 'Start Free'}
            </Button>
          </CardContent>
        </Card>

        {/* Ascent Tier */}
        <Card 
          className={`relative ${
            currentTier === 'ascent' 
              ? 'border-blue-500 border-2' 
              : 'border-blue-500 border-2 shadow-lg'
          }`}
        >
          {currentTier === 'ascent' ? (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <Badge className="bg-blue-600 text-white">Current Plan</Badge>
            </div>
          ) : (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <Badge className="bg-blue-600 text-white">Most Popular</Badge>
            </div>
          )}
          <CardHeader>
            <CardTitle className="text-2xl">{PRICING.ascent.name}</CardTitle>
            <CardDescription>{PRICING.ascent.description}</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold text-slate-900">
                {getPriceDisplay('ascent')}
              </span>
              {billingPeriod === 'yearly' && (
                <p className="text-sm text-slate-500 mt-1">
                  {getMonthlyEquivalent('ascent')} billed annually
                </p>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              {PRICING.ascent.features.map((feature, i) => (
                <FeatureItem key={i} text={feature} included={true} />
              ))}
            </ul>
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loadingTier === 'ascent' || currentTier === 'ascent'}
              onClick={() => handleCheckout('ascent')}
            >
              {loadingTier === 'ascent' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                getButtonText('ascent')
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Summit Tier */}
        <Card className={currentTier === 'summit' ? 'border-purple-500 border-2' : ''}>
          {currentTier === 'summit' && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <Badge className="bg-purple-600 text-white">Current Plan</Badge>
            </div>
          )}
          <CardHeader>
            <CardTitle className="text-2xl">{PRICING.summit.name}</CardTitle>
            <CardDescription>{PRICING.summit.description}</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold text-slate-900">
                {getPriceDisplay('summit')}
              </span>
              {billingPeriod === 'yearly' && (
                <p className="text-sm text-slate-500 mt-1">
                  {getMonthlyEquivalent('summit')} billed annually
                </p>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              {PRICING.summit.features.map((feature, i) => (
                <FeatureItem key={i} text={feature} included={true} />
              ))}
            </ul>
            <Button
              className="w-full"
              variant={currentTier === 'summit' ? 'outline' : 'default'}
              disabled={loadingTier === 'summit' || currentTier === 'summit'}
              onClick={() => handleCheckout('summit')}
            >
              {loadingTier === 'summit' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                getButtonText('summit')
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
