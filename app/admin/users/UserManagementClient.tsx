'use client'

/**
 * User Management Client Component
 *
 * Client-side wrapper for user management that handles:
 * - Filter state management
 * - Pagination
 * - Sorting
 * - Server action calls
 */

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import UserTable from '@/components/admin/users/UserTable'
import UserFilters from '@/components/admin/users/UserFilters'
import {
  getUsers,
  UserFilters as Filters,
  UserSummary,
} from './actions'

export default function UserManagementClient() {
  const [users, setUsers] = useState<UserSummary[]>([])
  const [totalUsers, setTotalUsers] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(25)
  const [sortField, setSortField] = useState('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [filters, setFilters] = useState<Filters>({})
  const [loading, setLoading] = useState(true)

  const fetchUsers = async () => {
    setLoading(true)
    const result = await getUsers(filters, {
      page,
      pageSize,
      sortField,
      sortDirection,
    })
    setUsers(result.data)
    setTotalUsers(result.count)
    setLoading(false)
  }

  useEffect(() => {
    fetchUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sortField, sortDirection, filters])

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters)
    setPage(1) // Reset to first page when filters change
  }

  const handleSortChange = (field: string, direction: 'asc' | 'desc') => {
    setSortField(field)
    setSortDirection(direction)
  }

  const totalPages = Math.ceil(totalUsers / pageSize)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Desktop Filters Sidebar */}
      <div className="hidden lg:block lg:col-span-1">
        <UserFilters
          onFilterChange={handleFilterChange}
          initialFilters={filters}
        />
      </div>

      {/* User Table */}
      <div className="lg:col-span-3 space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Users</h2>
              <p className="text-sm text-gray-500">
                {totalUsers} total users
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-gray-500">
              Loading users...
            </div>
          ) : (
            <>
              <UserTable
                users={users}
                onSortChange={handleSortChange}
                sortField={sortField}
                sortDirection={sortDirection}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="text-sm text-gray-500">
                    Page {page} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === totalPages}
                      onClick={() => setPage(page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Mobile Filters */}
      <Card className="lg:hidden">
        <CardHeader>
          <h3 className="font-semibold">Filters</h3>
        </CardHeader>
        <CardContent>
          <UserFilters
            onFilterChange={handleFilterChange}
            initialFilters={filters}
          />
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
