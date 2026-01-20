/**
 * Session History Filters Component
 * 
 * Client component for filtering session history.
 * Manages filter state and URL params.
 * 
 * @module components/progress/SessionHistoryFilters
 */
"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { X } from "lucide-react"

interface SessionFilters {
  dateRange?: "7days" | "30days" | "all"
  subject?: string
  sessionType?: "quick" | "focus" | "mock"
}

interface SessionHistoryFiltersProps {
  currentFilters: SessionFilters
  totalSessions: number
}

/**
 * Session History Filters
 * 
 * Provides dropdown filters for date range, subject, and session type.
 * Updates URL params on filter change.
 * 
 * @param currentFilters - Current filter values from URL
 * @param totalSessions - Total number of sessions (for display)
 */
export function SessionHistoryFilters({
  currentFilters,
  totalSessions,
}: SessionHistoryFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  /**
   * Update URL with new filter value
   */
  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value && value !== "all") {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    
    // Reset to page 1 when filters change
    params.delete("page")
    
    router.push(`/progress/history?${params.toString()}`)
  }
  
  /**
   * Clear all filters
   */
  const clearFilters = () => {
    router.push("/progress/history")
  }
  
  const hasActiveFilters =
    currentFilters.dateRange ||
    currentFilters.subject ||
    currentFilters.sessionType
  
  return (
    <Card className="p-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full sm:w-auto">
          {/* Date Range */}
          <div className="w-full sm:w-40">
            <Select
              value={currentFilters.dateRange || "all"}
              onValueChange={(value: string) => updateFilter("dateRange", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All time</SelectItem>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Subject */}
          <div className="w-full sm:w-40">
            <Select
              value={currentFilters.subject || "all"}
              onValueChange={(value: string) => updateFilter("subject", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All subjects</SelectItem>
                <SelectItem value="Verbal Reasoning">Verbal Reasoning</SelectItem>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Maths">Maths</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Session Type */}
          <div className="w-full sm:w-40">
            <Select
              value={currentFilters.sessionType || "all"}
              onValueChange={(value: string) => updateFilter("sessionType", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="quick">Quick Practice</SelectItem>
                <SelectItem value="focus">Focus Mode</SelectItem>
                <SelectItem value="mock">Mock Exam</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="w-full sm:w-auto"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
        
        {/* Results Count */}
        <div className="text-sm text-slate-600 whitespace-nowrap">
          {totalSessions} {totalSessions === 1 ? "session" : "sessions"}
        </div>
      </div>
    </Card>
  )
}
