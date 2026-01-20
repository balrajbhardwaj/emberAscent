/**
 * Pagination Component
 * 
 * Reusable pagination controls for navigating pages.
 * Updates URL params while preserving filters.
 * 
 * @module components/progress/Pagination
 */
"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl: string
  filters?: Record<string, string | undefined>
}

/**
 * Pagination Controls
 * 
 * Displays page number and prev/next buttons.
 * Preserves filter params when changing pages.
 * 
 * @param currentPage - Current page number (1-indexed)
 * @param totalPages - Total number of pages
 * @param baseUrl - Base URL for pagination links
 * @param filters - Additional filter params to preserve
 */
export function Pagination({
  currentPage,
  totalPages,
  baseUrl,
  filters = {},
}: PaginationProps) {
  const router = useRouter()
  
  /**
   * Navigate to a specific page
   */
  const goToPage = (page: number) => {
    const params = new URLSearchParams()
    
    // Add page param
    if (page > 1) {
      params.set("page", page.toString())
    }
    
    // Preserve filter params
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "all") {
        params.set(key, value)
      }
    })
    
    const queryString = params.toString()
    router.push(queryString ? `${baseUrl}?${queryString}` : baseUrl)
  }
  
  const hasPrevious = currentPage > 1
  const hasNext = currentPage < totalPages
  
  return (
    <div className="flex items-center gap-2">
      {/* Previous Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => goToPage(currentPage - 1)}
        disabled={!hasPrevious}
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Previous
      </Button>
      
      {/* Page Info */}
      <div className="px-4 py-2 text-sm text-slate-700">
        Page <span className="font-semibold">{currentPage}</span> of{" "}
        <span className="font-semibold">{totalPages}</span>
      </div>
      
      {/* Next Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => goToPage(currentPage + 1)}
        disabled={!hasNext}
      >
        Next
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  )
}
