/**
 * Admin User Management Page
 *
 * Main user management interface with:
 * - User list table with sorting and pagination
 * - Filter sidebar for search and filtering
 * - Quick actions for common tasks
 */

import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import UserManagementClient from './UserManagementClient'

export const metadata = {
  title: 'User Management | Admin',
  description: 'Manage users and subscriptions',
}

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-gray-500">
          View and manage user accounts, subscriptions, and support
        </p>
      </div>

      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-12" />
            <Skeleton className="h-96" />
          </div>
        }
      >
        <UserManagementClient />
      </Suspense>
    </div>
  )
}
