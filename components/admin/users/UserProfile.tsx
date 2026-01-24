'use client'

/**
 * User Profile Component
 *
 * Displays user account overview including:
 * - Account information
 * - Subscription status
 * - Registration details
 * - Recent activity
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow, format } from 'date-fns'

interface UserProfileProps {
  profile: {
    id: string
    email: string
    full_name: string | null
    subscription_tier: string
    subscription_status: string
    subscription_period_end: string | null
    created_at: string
    updated_at: string
  }
  recentSessions: Array<{
    id: string
    created_at: string
    total_questions: number
    correct_answers: number
  }>
}

export default function UserProfile({
  profile,
  recentSessions,
}: UserProfileProps) {
  const getTierBadge = (tier: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      free: 'outline',
      ascent: 'default',
      enterprise: 'secondary',
    }
    return (
      <Badge variant={variants[tier] ?? 'outline'} className="capitalize">
        {tier}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      'default' | 'secondary' | 'destructive' | 'outline'
    > = {
      active: 'default',
      trialing: 'secondary',
      cancelled: 'destructive',
      past_due: 'destructive',
      inactive: 'outline',
    }
    return (
      <Badge variant={variants[status] ?? 'outline'} className="capitalize">
        {status.replace('_', ' ')}
      </Badge>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="text-sm text-gray-500">User ID</div>
            <div className="font-mono text-sm">{profile.id}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Email</div>
            <div>{profile.email}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Full Name</div>
            <div>{profile.full_name || 'Not provided'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Last Updated</div>
            <div>
              {formatDistanceToNow(new Date(profile.updated_at), {
                addSuffix: true,
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Info */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="text-sm text-gray-500">Tier</div>
            <div>{getTierBadge(profile.subscription_tier)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Status</div>
            <div>{getStatusBadge(profile.subscription_status)}</div>
          </div>
          {profile.subscription_period_end && (
            <div>
              <div className="text-sm text-gray-500">Period End</div>
              <div>
                {format(
                  new Date(profile.subscription_period_end),
                  'PPP'
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Registration */}
      <Card>
        <CardHeader>
          <CardTitle>Registration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="text-sm text-gray-500">Registered</div>
            <div>{format(new Date(profile.created_at), 'PPP')}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Time Since Registration</div>
            <div>
              {formatDistanceToNow(new Date(profile.created_at), {
                addSuffix: true,
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {recentSessions.length === 0 ? (
            <p className="text-sm text-gray-500">No recent activity</p>
          ) : (
            <div className="space-y-2">
              {recentSessions.slice(0, 5).map((session) => (
                <div
                  key={session.id}
                  className="flex justify-between items-center text-sm border-b pb-2 last:border-0"
                >
                  <div>
                    <div>
                      {session.correct_answers}/{session.total_questions}{' '}
                      correct
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(session.created_at), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>
                  <Badge variant="outline">
                    {Math.round(
                      (session.correct_answers / session.total_questions) * 100
                    )}
                    %
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
