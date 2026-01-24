'use client'

/**
 * Report Filters Component
 *
 * Filter sidebar for error reports with:
 * - Status filters
 * - Report type filters
 * - Subject filters
 * - Date range filters
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Card } from '@/components/ui/card'
import { ReportFilters as Filters } from '@/app/admin/reports/actions'

interface ReportFiltersProps {
  onFilterChange: (filters: Filters) => void
  initialFilters?: Filters
}

export default function ReportFilters({
  onFilterChange,
  initialFilters = {},
}: ReportFiltersProps) {
  const [statusFilters, setStatusFilters] = useState<string[]>(
    initialFilters.status ?? []
  )
  const [typeFilters, setTypeFilters] = useState<string[]>(
    initialFilters.reportType ?? []
  )
  const [subjectFilters, setSubjectFilters] = useState<string[]>(
    initialFilters.subject ?? []
  )
  const [dateFrom, setDateFrom] = useState(initialFilters.dateFrom ?? '')
  const [dateTo, setDateTo] = useState(initialFilters.dateTo ?? '')

  const handleApplyFilters = () => {
    onFilterChange({
      status: statusFilters.length > 0 ? statusFilters : undefined,
      reportType: typeFilters.length > 0 ? typeFilters : undefined,
      subject: subjectFilters.length > 0 ? subjectFilters : undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    })
  }

  const handleClearFilters = () => {
    setStatusFilters([])
    setTypeFilters([])
    setSubjectFilters([])
    setDateFrom('')
    setDateTo('')
    onFilterChange({})
  }

  const toggleStatus = (status: string) => {
    setStatusFilters((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    )
  }

  const toggleType = (type: string) => {
    setTypeFilters((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  const toggleSubject = (subject: string) => {
    setSubjectFilters((prev) =>
      prev.includes(subject)
        ? prev.filter((s) => s !== subject)
        : [...prev, subject]
    )
  }

  return (
    <Card className="p-4 space-y-6">
      <h3 className="font-semibold">Filter Reports</h3>

      {/* Status */}
      <div className="space-y-2">
        <Label>Status</Label>
        <div className="space-y-2">
          {['pending', 'in_progress', 'resolved', 'dismissed'].map((status) => (
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
          ))}
        </div>
      </div>

      {/* Report Type */}
      <div className="space-y-2">
        <Label>Report Type</Label>
        <div className="space-y-2">
          {[
            'incorrect_answer',
            'typo',
            'unclear_question',
            'missing_option',
            'wrong_difficulty',
            'other',
          ].map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={`type-${type}`}
                checked={typeFilters.includes(type)}
                onCheckedChange={() => toggleType(type)}
              />
              <label
                htmlFor={`type-${type}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
              >
                {type.replace(/_/g, ' ')}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Subject */}
      <div className="space-y-2">
        <Label>Subject</Label>
        <div className="space-y-2">
          {['english', 'maths', 'verbal-reasoning', 'non-verbal-reasoning'].map(
            (subject) => (
              <div key={subject} className="flex items-center space-x-2">
                <Checkbox
                  id={`subject-${subject}`}
                  checked={subjectFilters.includes(subject)}
                  onCheckedChange={() => toggleSubject(subject)}
                />
                <label
                  htmlFor={`subject-${subject}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                >
                  {subject.replace(/-/g, ' ')}
                </label>
              </div>
            )
          )}
        </div>
      </div>

      {/* Date Range */}
      <div className="space-y-2">
        <Label>Reported Date</Label>
        <div className="space-y-2">
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            placeholder="From"
          />
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
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
