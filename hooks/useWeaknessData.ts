/**
 * useWeaknessData Hook
 * 
 * Custom hook for fetching and managing weakness heatmap data.
 * Provides loading, error states, and refresh functionality.
 * 
 * @module hooks/useWeaknessData
 */
"use client"

import { useState, useEffect, useCallback } from 'react'
import type { WeaknessHeatmapData } from '@/types/analytics'

interface UseWeaknessDataOptions {
  /** Whether to fetch immediately on mount */
  immediate?: boolean
  /** Polling interval in ms (0 to disable) */
  pollInterval?: number
}

interface UseWeaknessDataReturn {
  /** The heatmap data */
  data: WeaknessHeatmapData | null
  /** Whether data is currently loading */
  isLoading: boolean
  /** Error message if fetch failed */
  error: string | null
  /** Manually refresh the data */
  refresh: () => Promise<void>
  /** Timestamp of last successful fetch */
  lastUpdated: Date | null
}

/**
 * Hook for fetching weakness heatmap data
 * 
 * @param childId - The child's ID to fetch data for
 * @param options - Configuration options
 * @returns Heatmap data with loading/error states
 * 
 * @example
 * const { data, isLoading, error, refresh } = useWeaknessData(childId)
 * 
 * if (isLoading) return <Skeleton />
 * if (error) return <ErrorMessage error={error} />
 * return <WeaknessHeatmap data={data} />
 */
export function useWeaknessData(
  childId: string | null,
  options: UseWeaknessDataOptions = {}
): UseWeaknessDataReturn {
  const { immediate = true, pollInterval = 0 } = options

  const [data, setData] = useState<WeaknessHeatmapData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchData = useCallback(async () => {
    if (!childId) {
      setData(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/analytics/heatmap?childId=${childId}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch heatmap data: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (result.error) {
        throw new Error(result.error)
      }

      setData(result.data)
      setLastUpdated(new Date())
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(message)
      console.error('Error fetching weakness heatmap:', err)
    } finally {
      setIsLoading(false)
    }
  }, [childId])

  // Initial fetch
  useEffect(() => {
    if (immediate && childId) {
      fetchData()
    }
  }, [immediate, childId, fetchData])

  // Polling
  useEffect(() => {
    if (pollInterval > 0 && childId) {
      const interval = setInterval(fetchData, pollInterval)
      return () => clearInterval(interval)
    }
  }, [pollInterval, childId, fetchData])

  return {
    data,
    isLoading,
    error,
    refresh: fetchData,
    lastUpdated
  }
}

/**
 * Hook for a specific topic's performance data
 */
export function useTopicPerformance(
  childId: string | null,
  subject: string,
  topic: string
) {
  const { data, isLoading, error } = useWeaknessData(childId)

  const topicData = data?.cells.find(
    cell => cell.subject === subject && cell.topic === topic
  )

  return {
    data: topicData || null,
    isLoading,
    error
  }
}

export default useWeaknessData
