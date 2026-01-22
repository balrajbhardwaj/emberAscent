/**
 * Mobile Bottom Navigation
 * 
 * Fixed bottom navigation bar for mobile devices.
 * Shows icon-only navigation with active state indicators.
 * 
 * Features:
 * - Fixed to bottom of screen
 * - Icon-only (no labels to save space)
 * - Active state with color and indicator bar
 * - Safe area padding for iOS notches
 * 
 * Hidden on desktop (uses Sidebar instead)
 * 
 * @module components/dashboard/MobileNav
 */
"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { PlayCircle, BarChart, Bookmark, Settings, Sparkles } from "lucide-react"
import { useDashboard } from "@/contexts/DashboardContext"
import { cn } from "@/lib/utils"

// Navigation items (same as sidebar but icons only)
const navItems = [
  {
    href: "/practice",
    label: "Practice",
    icon: PlayCircle,
  },
  {
    href: "/progress",
    label: "Progress",
    icon: BarChart,
  },
  {
    href: "/analytics2",
    label: "Analytics",
    icon: Sparkles,
  },
  {
    href: "/bookmarks",
    label: "Bookmarks",
    icon: Bookmark,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
  },
]

/**
 * Mobile Navigation Bar
 * 
 * Bottom navigation with icon-only links.
 * Only visible on mobile/tablet screens.
 */
export function MobileNav() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { selectedChild } = useDashboard()
  
  // Build URL with childId if available
  const getHref = (basePath: string) => {
    const childId = searchParams.get('childId') || selectedChild?.id
    if (childId) {
      return `${basePath}?childId=${childId}`
    }
    return basePath
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white lg:hidden">
      <div className="flex items-center justify-around px-4 py-2 safe-area-padding-bottom">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={getHref(item.href)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg px-4 py-2 transition-colors",
                isActive ? "text-orange-600" : "text-slate-600"
              )}
              aria-label={item.label}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs font-medium">{item.label}</span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 h-1 w-8 -translate-x-1/2 rounded-t-full bg-orange-600" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
