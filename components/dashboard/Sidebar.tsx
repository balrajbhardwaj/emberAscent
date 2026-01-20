/**
 * Dashboard Sidebar Navigation
 * 
 * Desktop sidebar with navigation links and child info.
 * 
 * Features:
 * - Ember Ascent logo at top
 * - Navigation links with icons and active states
 * - Current child avatar and info
 * - Add child button at bottom
 * - Collapsible on tablet (icon-only mode)
 * 
 * Hidden on mobile (uses MobileNav instead)
 * 
 * @module components/dashboard/Sidebar
 */
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { PlayCircle, BarChart, Bookmark, Settings, UserPlus, Flame } from "lucide-react"
import { useDashboard } from "@/contexts/DashboardContext"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const AVATAR_EMOJIS: Record<string, string> = {
  "boy-1": "👦",
  "boy-2": "🧒",
  "girl-1": "👧",
  "girl-2": "🧑",
  "student-1": "🎓",
  "student-2": "📚",
  "star": "⭐",
  "rocket": "🚀",
}

// Navigation items
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
 * Sidebar Navigation Component
 * 
 * Desktop-only sidebar with full navigation and child info.
 * Shows active states and Ember Ascent branding.
 */
export function Sidebar() {
  const pathname = usePathname()
  const { selectedChild } = useDashboard()

  return (
    <aside className="hidden lg:flex h-screen w-64 flex-col border-r border-slate-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 shadow-sm">
          <Flame className="h-5 w-5 text-white" />
        </div>
        <span className="text-xl font-bold text-slate-900">Ember Ascent</span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700"
                  : "text-slate-700 hover:bg-slate-50"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "text-orange-600")} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Current Child Info */}
      {selectedChild && (
        <div className="border-t border-slate-200 p-4">
          <div className="mb-3 flex items-center gap-3 rounded-lg bg-slate-50 p-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-amber-100 text-2xl">
              {AVATAR_EMOJIS[selectedChild.avatar_url || "boy-1"] || "👤"}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate font-semibold text-slate-900">
                {selectedChild.name}
              </p>
              {selectedChild.year_group && (
                <p className="text-xs text-slate-600">Year {selectedChild.year_group}</p>
              )}
            </div>
          </div>

          {/* Add Child Button */}
          <Link href="/settings/children/new">
            <Button
              variant="outline"
              className="w-full border-slate-200 hover:bg-slate-50"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Add Child
            </Button>
          </Link>
        </div>
      )}
    </aside>
  )
}
