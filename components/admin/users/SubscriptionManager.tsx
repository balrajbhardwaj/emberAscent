'use client'

/**
 * Subscription Manager Component
 *
 * Admin controls for managing user subscriptions:
 * - View subscription details
 * - Extend trial period
 * - Apply discounts
 * - Cancel subscription
 * - View billing history
 */

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { extendTrial, cancelSubscription } from '@/app/admin/users/actions'
import { useAdminAuth } from '@/hooks/useAdminAuth'

interface SubscriptionManagerProps {
  profile: {
    id: string
    email: string
    subscription_tier: string
    subscription_status: string
    subscription_period_end: string | null
    stripe_customer_id: string | null
    stripe_subscription_id: string | null
  }
}

export default function SubscriptionManager({
  profile,
}: SubscriptionManagerProps) {
  const { toast } = useToast()
  const { user: adminUser } = useAdminAuth()
  const [trialDays, setTrialDays] = useState('7')
  const [cancelReason, setCancelReason] = useState('')
  const [loading, setLoading] = useState(false)

  const handleExtendTrial = async () => {
    if (!adminUser) return

    setLoading(true)
    const result = await extendTrial(profile.id, parseInt(trialDays), adminUser.id)
    setLoading(false)

    if (result.success) {
      toast({
        title: 'Trial Extended',
        description: `Trial extended by ${trialDays} days`,
      })
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to extend trial',
        variant: 'destructive',
      })
    }
  }

  const handleCancelSubscription = async () => {
    if (!adminUser || !cancelReason.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a cancellation reason',
        variant: 'destructive',
      })
      return
    }

    if (
      !confirm(
        `Are you sure you want to cancel this subscription? Reason: ${cancelReason}`
      )
    ) {
      return
    }

    setLoading(true)
    const result = await cancelSubscription(
      profile.id,
      cancelReason,
      adminUser.id
    )
    setLoading(false)

    if (result.success) {
      toast({
        title: 'Subscription Cancelled',
        description: 'The subscription has been cancelled',
      })
      setCancelReason('')
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to cancel subscription',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <CardTitle>Current Subscription</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="text-sm text-gray-500">Tier</div>
            <Badge className="capitalize">{profile.subscription_tier}</Badge>
          </div>
          <div>
            <div className="text-sm text-gray-500">Status</div>
            <Badge
              variant={
                profile.subscription_status === 'active'
                  ? 'default'
                  : 'secondary'
              }
              className="capitalize"
            >
              {profile.subscription_status.replace('_', ' ')}
            </Badge>
          </div>
          {profile.subscription_period_end && (
            <div>
              <div className="text-sm text-gray-500">Period End</div>
              <div>
                {new Date(profile.subscription_period_end).toLocaleDateString()}
              </div>
            </div>
          )}
          {profile.stripe_customer_id && (
            <div>
              <div className="text-sm text-gray-500">Stripe Customer ID</div>
              <div className="font-mono text-xs">
                {profile.stripe_customer_id}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Extend Trial */}
      <Card>
        <CardHeader>
          <CardTitle>Extend Trial</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="trialDays">Days to Add</Label>
            <Input
              id="trialDays"
              type="number"
              min="1"
              max="90"
              value={trialDays}
              onChange={(e) => setTrialDays(e.target.value)}
            />
          </div>
          <Button
            onClick={handleExtendTrial}
            disabled={loading}
            className="w-full"
          >
            Extend Trial
          </Button>
        </CardContent>
      </Card>

      {/* Cancel Subscription */}
      {profile.subscription_status !== 'cancelled' &&
        profile.subscription_tier !== 'free' && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-destructive">
                Cancel Subscription
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cancelReason">Cancellation Reason</Label>
                <Input
                  id="cancelReason"
                  placeholder="Enter reason for cancellation..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
              </div>
              <Button
                onClick={handleCancelSubscription}
                disabled={loading || !cancelReason.trim()}
                variant="destructive"
                className="w-full"
              >
                Cancel Subscription
              </Button>
            </CardContent>
          </Card>
        )}
    </div>
  )
}
