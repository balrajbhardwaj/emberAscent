/**
 * Dashboard Context
 * 
 * Provides global state management for the dashboard, including:
 * - Current authenticated user
 * - Selected child profile
 * - List of all children for the parent
 * - Functions to switch between children and refetch data
 * 
 * This context wraps the entire dashboard layout and makes user/child
 * data available to all dashboard components without prop drilling.
 * 
 * @module contexts/DashboardContext
 */
"use client"

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import type { User } from "@supabase/supabase-js"

// Dashboard context state
interface DashboardContextState {
  user: User | null
  selectedChild: Child | null
  children: Child[]
  setSelectedChild: (child: Child) => void
  refetchChildren: () => Promise<void>
  isLoading: boolean
}

// Child profile type (simplified for context)
interface Child {
  id: string
  name: string
  year_group: number | null
  avatar_url: string | null
  target_school: string | null
}

const DashboardContext = createContext<DashboardContextState | undefined>(undefined)

interface DashboardProviderProps {
  user: User
  initialChildren: Child[]
  initialSelectedChild: Child | null
  children: ReactNode
}

/**
 * Dashboard Provider Component
 * 
 * Wraps the dashboard layout and provides user/child state to all children.
 * Manages the currently selected child and provides functions to update it.
 * 
 * @param user - Authenticated user from Supabase
 * @param initialChildren - List of children fetched from database
 * @param initialSelectedChild - Initially selected child (first child by default)
 * @param children - React children to wrap with context
 */
export function DashboardProvider({
  user,
  initialChildren,
  initialSelectedChild,
  children: childrenProp,
}: DashboardProviderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // Get childId from URL, or use initial selected child, or fall back to first child
  const childIdFromUrl = searchParams.get('childId')
  const initialChild = childIdFromUrl 
    ? initialChildren.find(c => c.id === childIdFromUrl) || initialSelectedChild || initialChildren[0]
    : initialSelectedChild || initialChildren[0]
  
  const [selectedChild, setSelectedChildState] = useState<Child | null>(initialChild || null)
  const [childrenList] = useState<Child[]>(initialChildren)
  const [isLoading, setIsLoading] = useState(false)

  // Sync state when URL childId changes (e.g., browser back/forward)
  useEffect(() => {
    if (childIdFromUrl) {
      const childFromUrl = initialChildren.find(c => c.id === childIdFromUrl)
      if (childFromUrl && childFromUrl.id !== selectedChild?.id) {
        setSelectedChildState(childFromUrl)
      }
    }
  }, [childIdFromUrl, initialChildren, selectedChild?.id])

  const setSelectedChild = useCallback((child: Child) => {
    setSelectedChildState(child)
    // Update URL with selected child ID, preserving current pathname
    router.push(`${pathname}?childId=${child.id}`, { scroll: false })
  }, [router, pathname])

  const refetchChildren = useCallback(async () => {
    setIsLoading(true)
    try {
      // Refetch children from API
      // This will be implemented when we add the API route
      router.refresh()
    } finally {
      setIsLoading(false)
    }
  }, [router])

  const value: DashboardContextState = {
    user,
    selectedChild,
    children: childrenList,
    setSelectedChild,
    refetchChildren,
    isLoading,
  }

  return (
    <DashboardContext.Provider value={value}>
      {childrenProp}
    </DashboardContext.Provider>
  )
}

/**
 * Hook to access dashboard context
 * 
 * Must be used within a DashboardProvider.
 * Throws error if used outside provider.
 * 
 * @returns Dashboard context state
 * 
 * @example
 * function MyComponent() {
 *   const { selectedChild, setSelectedChild } = useDashboard()
 *   return <div>{selectedChild?.name}</div>
 * }
 */
export function useDashboard() {
  const context = useContext(DashboardContext)
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider")
  }
  return context
}
