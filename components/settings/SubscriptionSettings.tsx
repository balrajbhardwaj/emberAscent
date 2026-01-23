'use client'

/**
 * Subscription Settings Component
 * 
 * Displays current subscription details and management options.
 * Integrates with Stripe billing portal for plan changes.
 * 
 * @module components/settings/SubscriptionSettings
 */

import { CreditCard, Calendar, AlertCircle, ExternalLink, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useSubscription, getTierDisplayName, getStatusDisplayText } from '@/hooks/useSubscription'
import type { SubscriptionTier, SubscriptionStatus } from '@/types/database'
import Link from 'next/link'

interface SubscriptionSettingsProps {
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

/**
 * Format date for display
 */
function formatDate(date: Date | null): string {
  if (!date) return 'N/A'
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Get tier badge color
 */
function getTierBadgeClass(tier: SubscriptionTier): string {
  switch (tier) {
    case 'ascent':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-100'
    case 'summit':
      return 'bg-purple-100 text-purple-800 hover:bg-purple-100'
    default:
      return 'bg-slate-100 text-slate-800 hover:bg-slate-100'
  }
}

/**
 * Get status badge color
 */
function getStatusBadgeClass(status: SubscriptionStatus): string {
  switch (status) {
    case 'active':
      return 'bg-emerald-100 text-emerald-800'
    case 'trialing':
      return 'bg-blue-100 text-blue-800'
    case 'past_due':
      return 'bg-amber-100 text-amber-800'
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-slate-100 text-slate-800'
  }
}

export function SubscriptionSettings({ profile }: SubscriptionSettingsProps) {
  const {
    tier,
    status,
    isPaid,
    isFreeTier,
    periodEnd,
    cancelAtPeriodEnd,
    openBillingPortal,
    isPortalLoading,
  } = useSubscription({ profile })

  return (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Your Subscription
          </CardTitle>
          <CardDescription>
            Manage your subscription and billing information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Plan Info */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-slate-50 rounded-lg">
            <div className="space-y-1">
              <p className="text-sm text-slate-500">Current Plan</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-slate-900">
                  {getTierDisplayName(tier)}
                </span>
                <Badge className={getTierBadgeClass(tier)}>
                  {tier.charAt(0).toUpperCase() + tier.slice(1)}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={getStatusBadgeClass(status)}>
                {getStatusDisplayText(status, cancelAtPeriodEnd)}
              </Badge>
            </div>
          </div>

          {/* Cancellation Warning */}
          {cancelAtPeriodEnd && periodEnd && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Subscription Ending</AlertTitle>
              <AlertDescription>
                Your subscription will end on {formatDate(periodEnd)}. 
                You'll lose access to premium features after this date.
              </AlertDescription>
            </Alert>
          )}

          {/* Payment Overdue Warning */}
          {status === 'past_due' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Payment Overdue</AlertTitle>
              <AlertDescription>
                Your last payment failed. Please update your payment method to continue
                your subscription.
              </AlertDescription>
            </Alert>
          )}

          {/* Billing Details (for paid users) */}
          {isPaid && periodEnd && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Next Billing Date</span>
                </div>
                <p className="font-semibold text-slate-900">
                  {cancelAtPeriodEnd ? 'N/A' : formatDate(periodEnd)}
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <CreditCard className="h-4 w-4" />
                  <span className="text-sm">Subscription ID</span>
                </div>
                <p className="font-mono text-sm text-slate-900 truncate">
                  {profile?.stripe_subscription_id || 'N/A'}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            {isPaid ? (
              <Button
                onClick={openBillingPortal}
                disabled={isPortalLoading}
                className="flex items-center gap-2"
              >
                {isPortalLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ExternalLink className="h-4 w-4" />
                )}
                Manage Subscription
              </Button>
            ) : (
              <Link href="/pricing">
                <Button className="flex items-center gap-2">
                  Upgrade to Premium
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Features Card */}
      <Card>
        <CardHeader>
          <CardTitle>Your Features</CardTitle>
          <CardDescription>
            Features included in your current plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            <FeatureCheck 
              feature="Unlimited Questions" 
              included={true} 
            />
            <FeatureCheck 
              feature="Basic Progress Tracking" 
              included={true} 
            />
            <FeatureCheck 
              feature="Weakness Heatmap" 
              included={tier !== 'free'} 
            />
            <FeatureCheck 
              feature="Exam Readiness Score" 
              included={tier !== 'free'} 
            />
            <FeatureCheck 
              feature="Personalized Study Plans" 
              included={tier !== 'free'} 
            />
            <FeatureCheck 
              feature="Weekly Reports" 
              included={tier !== 'free'} 
            />
            <FeatureCheck 
              feature="AI Tutor" 
              included={tier === 'summit'} 
            />
            <FeatureCheck 
              feature="Priority Support" 
              included={tier === 'summit'} 
            />
          </div>
          
          {isFreeTier && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Want more insights?</strong> Upgrade to Ascent for detailed 
                analytics and personalized recommendations.
              </p>
              <Link href="/pricing" className="inline-block mt-2">
                <Button variant="outline" size="sm" className="text-blue-600 border-blue-300">
                  View Plans
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Feature check display component
 */
function FeatureCheck({ feature, included }: { feature: string; included: boolean }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border">
      <div className={`w-2 h-2 rounded-full ${included ? 'bg-emerald-500' : 'bg-slate-300'}`} />
      <span className={included ? 'text-slate-900' : 'text-slate-400'}>
        {feature}
      </span>
      {!included && (
        <Badge variant="outline" className="ml-auto text-xs">
          Premium
        </Badge>
      )}
    </div>
  )
}
