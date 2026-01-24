'use client'

/**
 * User Filters Component
 *
 * Filter sidebar for admin user management with:
 * - Search by email/name
 * - Subscription tier and status filters
 * - Date range filters
 * - Children and activity filters
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card } from '@/components/ui/card'
import { UserFilters as Filters } from '@/app/admin/users/actions'

interface UserFiltersProps {
  onFilterChange: (filters: Filters) => void
  initialFilters?: Filters
}

export default function UserFilters({
  onFilterChange,
  initialFilters = {},
}: UserFiltersProps) {
  const [search, setSearch] = useState(initialFilters.search ?? '')
  const [tierFilters, setTierFilters] = useState<string[]>(
    initialFilters.subscriptionTier ?? []
  )
  const [statusFilters, setStatusFilters] = useState<string[]>(
    initialFilters.subscriptionStatus ?? []
  )
  const [registeredFrom, setRegisteredFrom] = useState(
    initialFilters.registeredFrom ?? ''
  )
  const [registeredTo, setRegisteredTo] = useState(
    initialFilters.registeredTo ?? ''
  )

  const handleApplyFilters = () => {
    onFilterChange({
      search: search || undefined,
      subscriptionTier: tierFilters.length > 0 ? tierFilters : undefined,
      subscriptionStatus: statusFilters.length > 0 ? statusFilters : undefined,
      registeredFrom: registeredFrom || undefined,
      registeredTo: registeredTo || undefined,
    })
  }

  const handleClearFilters = () => {
    setSearch('')
    setTierFilters([])
    setStatusFilters([])
    setRegisteredFrom('')
    setRegisteredTo('')
    onFilterChange({})
  }

  const toggleTier = (tier: string) => {
    setTierFilters((prev) =>
      prev.includes(tier) ? prev.filter((t) => t !== tier) : [...prev, tier]
    )
  }

  const toggleStatus = (status: string) => {
    setStatusFilters((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    )
  }

  return (
    <Card className="p-4 space-y-6">
      <div>
        <h3 className="font-semibold mb-4">Filter Users</h3>

        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Email or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Subscription Tier */}
      <div className="space-y-2">
        <Label>Subscription Tier</Label>
        <div className="space-y-2">
          {['free', 'ascent', 'enterprise'].map((tier) => (
            <div key={tier} className="flex items-center space-x-2">
              <Checkbox
                id={`tier-${tier}`}
                checked={tierFilters.includes(tier)}
                onCheckedChange={() => toggleTier(tier)}
              />
              <label
                htmlFor={`tier-${tier}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
              >
                {tier}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Subscription Status */}
      <div className="space-y-2">
        <Label>Subscription Status</Label>
        <div className="space-y-2">
          {['active', 'trialing', 'cancelled', 'past_due', 'inactive'].map(
            (status) => (
              <div key={status} className="flex items-center space-x-2">
                <Checkbox
                  id={`status-${status}`}
                  checked={statusFilters.includes(status)}
                  onCheckedChange={() => toggleStatus(status)}
                />
                <label
                  htmlFor={`status-${status}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                >
                  {status.replace('_', ' ')}
                </label>
              </div>
            )
          )}
        </div>
      </div>

      {/* Registration Date */}
      <div className="space-y-2">
        <Label>Registered Date</Label>
        <div className="space-y-2">
          <Input
            type="date"
            value={registeredFrom}
            onChange={(e) => setRegisteredFrom(e.target.value)}
            placeholder="From"
          />
          <Input
            type="date"
            value={registeredTo}
            onChange={(e) => setRegisteredTo(e.target.value)}
            placeholder="To"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2 pt-4 border-t">
        <Button onClick={handleApplyFilters} className="w-full">
          Apply Filters
        </Button>
        <Button
          onClick={handleClearFilters}
          variant="outline"
          className="w-full"
        >
          Clear All
        </Button>
      </div>
    </Card>
  )
}
