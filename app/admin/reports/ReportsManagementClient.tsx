'use client'

/**
 * Reports Management Client Component
 *
 * Client-side wrapper for error reports that handles:
 * - Tab state (Pending, In Progress, Resolved, All)
 * - Filter state management
 * - Pagination
 * - Sorting
 * - Server action calls
 */

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ReportQueue from '@/components/admin/reports/ReportQueue'
import ReportFilters from '@/components/admin/reports/ReportFilters'
import {
  getReports,
  ReportFilters as Filters,
} from './actions'

export default function ReportsManagementClient() {
  const [reports, setReports] = useState<any[]>([])
  const [totalReports, setTotalReports] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(25)
  const [sortField, setSortField] = useState('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [filters, setFilters] = useState<Filters>({})
  const [activeTab, setActiveTab] = useState('all')
  const [loading, setLoading] = useState(true)

  const fetchReports = async () => {
    setLoading(true)
    
    // Merge tab filter with user filters
    const tabFilters: Filters = { ...filters }
    if (activeTab !== 'all') {
      tabFilters.status = [activeTab.replace('-', '_')]
    }

    const result = await getReports(tabFilters, {
      page,
      pageSize,
      sortField,
      sortDirection,
    })
    setReports(result.data)
    setTotalReports(result.count)
    setLoading(false)
  }

  useEffect(() => {
    fetchReports()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sortField, sortDirection, filters, activeTab])

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters)
    setPage(1) // Reset to first page when filters change
  }

  const handleSortChange = (field: string, direction: 'asc' | 'desc') => {
    setSortField(field)
    setSortDirection(direction)
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setPage(1)
  }

  const totalPages = Math.ceil(totalReports / pageSize)

  // Calculate counts for tabs (simplified - in production would fetch separately)
  const pendingCount = reports.filter((r) => r.status === 'pending').length
  const inProgressCount = reports.filter((r) => r.status === 'in_progress').length
  const resolvedCount = reports.filter((r) => r.status === 'resolved').length

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Desktop Filters Sidebar */}
      <div className="hidden lg:block lg:col-span-1">
        <ReportFilters
          onFilterChange={handleFilterChange}
          initialFilters={filters}
        />
      </div>

      {/* Report Queue */}
      <div className="lg:col-span-3 space-y-4">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending">
              Pending {pendingCount > 0 && `(${pendingCount})`}
            </TabsTrigger>
            <TabsTrigger value="in-progress">
              In Progress {inProgressCount > 0 && `(${inProgressCount})`}
            </TabsTrigger>
            <TabsTrigger value="resolved">
              Resolved {resolvedCount > 0 && `(${resolvedCount})`}
            </TabsTrigger>
            <TabsTrigger value="all">All ({totalReports})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {activeTab === 'all'
                        ? 'All Reports'
                        : activeTab === 'in-progress'
                        ? 'In Progress Reports'
                        : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Reports`}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {totalReports} total reports
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="py-8 text-center text-gray-500">
                    Loading reports...
                  </div>
                ) : (
                  <>
                    <ReportQueue
                      reports={reports}
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
          </TabsContent>
        </Tabs>

        {/* Mobile Filters */}
        <Card className="lg:hidden">
          <CardHeader>
            <h3 className="font-semibold">Filters</h3>
          </CardHeader>
          <CardContent>
            <ReportFilters
              onFilterChange={handleFilterChange}
              initialFilters={filters}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
