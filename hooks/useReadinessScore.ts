/**
 * useReadinessScore Hook
 * 
 * Custom hook for fetching and managing readiness score data.
 * Provides loading, error states, and refresh functionality.
 * 
 * @module hooks/useReadinessScore
 */
"use client"

import { useState, useEffect, useCallback } from 'react'
import type { ReadinessScoreData } from '@/types/analytics'

interface UseReadinessScoreOptions {
  /** Whether to fetch immediately on mount */
  immediate?: boolean
  /** Cache duration in ms before refetching */
  cacheDuration?: number
}

interface UseReadinessScoreReturn {
  /** The readiness score data */
  data: ReadinessScoreData | null
  /** Whether data is currently loading */
  isLoading: boolean
  /** Error message if fetch failed */
  error: string | null
  /** Manually refresh the data */
  refresh: () => Promise<void>
  /** Whether data is from cache */
  isCached: boolean
}

// Simple in-memory cache
const cache = new Map<string, { data: ReadinessScoreData; timestamp: number }>()

/**
 * Hook for fetching readiness score data
 * 
 * @param childId - The child's ID to fetch data for
 * @param options - Configuration options
 * @returns Readiness score data with loading/error states
 * 
 * @example
 * const { data, isLoading, error, refresh } = useReadinessScore(childId)
 * 
 * if (isLoading) return <Skeleton />
 * if (error) return <ErrorMessage error={error} />
 * return <ReadinessScore data={data} />
 */
export function useReadinessScore(
  childId: string | null,
  options: UseReadinessScoreOptions = {}
): UseReadinessScoreReturn {
  const { immediate = true, cacheDuration = 5 * 60 * 1000 } = options // 5 min default cache

  const [data, setData] = useState<ReadinessScoreData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCached, setIsCached] = useState(false)

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!childId) {
      setData(null)
      return
    }

    // Check cache first
    if (!forceRefresh) {
      const cached = cache.get(childId)
      if (cached && Date.now() - cached.timestamp < cacheDuration) {
        setData(cached.data)
        setIsCached(true)
        return
      }
    }

    setIsLoading(true)
    setError(null)
    setIsCached(false)

    try {
      const response = await fetch(`/api/analytics/readiness?childId=${childId}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch readiness score: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (result.error) {
        throw new Error(result.error)
      }

      // Update cache
      cache.set(childId, { data: result.data, timestamp: Date.now() })
      
      setData(result.data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(message)
      console.error('Error fetching readiness score:', err)
    } finally {
      setIsLoading(false)
    }
  }, [childId, cacheDuration])

  // Initial fetch
  useEffect(() => {
    if (immediate && childId) {
      fetchData()
    }
  }, [immediate, childId, fetchData])

  const refresh = useCallback(async () => {
    await fetchData(true)
  }, [fetchData])

  return {
    data,
    isLoading,
    error,
    refresh,
    isCached
  }
}

/**
 * Hook to get just the overall score number
 */
export function useReadinessScoreValue(childId: string | null): number | null {
  const { data } = useReadinessScore(childId)
  return data?.overallScore ?? null
}

/**
 * Hook to check readiness tier
 */
export function useReadinessTier(childId: string | null) {
  const { data, isLoading } = useReadinessScore(childId)
  
  return {
    tier: data?.overallTier ?? null,
    isLoading,
    isExcellent: data?.overallTier === 'excellent',
    isGood: data?.overallTier === 'good',
    isDeveloping: data?.overallTier === 'developing',
    needsFocus: data?.overallTier === 'needs_focus'
  }
}

export default useReadinessScore
