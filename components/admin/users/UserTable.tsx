'use client'

/**
 * User Table Component
 *
 * Table displaying user list with:
 * - Sortable columns
 * - Status badges
 * - Quick actions
 * - Pagination controls
 */

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { UserSummary } from '@/app/admin/users/actions'
import { formatDistanceToNow } from 'date-fns'

interface UserTableProps {
  users: UserSummary[]
  onSortChange?: (field: string, direction: 'asc' | 'desc') => void
  sortField?: string
  sortDirection?: 'asc' | 'desc'
}

export default function UserTable({
  users,
  onSortChange,
  sortField = 'created_at',
  sortDirection = 'desc',
}: UserTableProps) {
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

  const handleSort = (field: string) => {
    if (!onSortChange) return
    const newDirection =
      sortField === field && sortDirection === 'asc' ? 'desc' : 'asc'
    onSortChange(field, newDirection)
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort('subscription_tier')}
            >
              Tier
              {sortField === 'subscription_tier' &&
                (sortDirection === 'asc' ? ' ↑' : ' ↓')}
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort('subscription_status')}
            >
              Status
              {sortField === 'subscription_status' &&
                (sortDirection === 'asc' ? ' ↑' : ' ↓')}
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort('children_count')}
            >
              Children
              {sortField === 'children_count' &&
                (sortDirection === 'asc' ? ' ↑' : ' ↓')}
            </TableHead>
            <TableHead>Questions</TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort('created_at')}
            >
              Registered
              {sortField === 'created_at' &&
                (sortDirection === 'asc' ? ' ↑' : ' ↓')}
            </TableHead>
            <TableHead>Last Active</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {user.full_name || 'Unnamed User'}
                    </div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </TableCell>
                <TableCell>{getTierBadge(user.subscription_tier)}</TableCell>
                <TableCell>
                  {getStatusBadge(user.subscription_status)}
                </TableCell>
                <TableCell>{user.children_count}</TableCell>
                <TableCell>{user.total_questions.toLocaleString()}</TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(user.created_at), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell>
                  {user.last_active
                    ? formatDistanceToNow(new Date(user.last_active), {
                        addSuffix: true,
                      })
                    : 'Never'}
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/users/${user.id}`}>View</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
