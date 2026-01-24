/**
 * User Detail Page
 *
 * Detailed view of individual user with tabs for:
 * - Overview (account info, subscription, registration)
 * - Children (linked profiles with stats)
 * - Subscription (plan details, billing history, actions)
 * - Activity (sessions, logins, emails)
 * - Support (admin notes, actions)
 */

import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getUser } from '../actions'
import UserProfile from '@/components/admin/users/UserProfile'
import ChildrenList from '@/components/admin/users/ChildrenList'
import SubscriptionManager from '@/components/admin/users/SubscriptionManager'
import AdminNotes from '@/components/admin/users/AdminNotes'

interface PageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: PageProps) {
  const user = await getUser(params.id)
  return {
    title: `${user?.profile.full_name || user?.profile.email || 'User'} | Admin`,
    description: 'User details and management',
  }
}

export default async function UserDetailPage({ params }: PageProps) {
  const userData = await getUser(params.id)

  if (!userData) {
    notFound()
  }

  const { profile, children, recent_sessions } = userData

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {profile.full_name || 'Unnamed User'}
        </h1>
        <p className="text-gray-500">{profile.email}</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="children">
            Children ({children.length})
          </TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <Suspense fallback={<Skeleton className="h-96" />}>
            <UserProfile profile={profile} recentSessions={recent_sessions} />
          </Suspense>
        </TabsContent>

        {/* Children Tab */}
        <TabsContent value="children">
          <Suspense fallback={<Skeleton className="h-96" />}>
            <ChildrenList childrenData={children} parentId={params.id} />
          </Suspense>
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription">
          <Suspense fallback={<Skeleton className="h-96" />}>
            <SubscriptionManager profile={profile} />
          </Suspense>
        </TabsContent>

        {/* Support Tab */}
        <TabsContent value="support">
          <Suspense fallback={<Skeleton className="h-96" />}>
            <AdminNotes userId={params.id} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}
