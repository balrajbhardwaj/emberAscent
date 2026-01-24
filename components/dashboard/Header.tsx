/**
 * Dashboard Header Component
 * 
 * Top navigation bar for the dashboard with:
 * - Child selector dropdown (switch between children)
 * - Live digital clock with seconds
 * - Current streak display with flame icon
 * - Parent account menu (profile, subscription, sign out)
 * 
 * Mobile responsive: stacks vertically on small screens
 * 
 * @module components/dashboard/Header
 */
"use client"

import { useState, useEffect } from "react"
import { Flame, Settings, CreditCard, LogOut, Clock } from "lucide-react"

/**
 * Live Digital Clock Component
 * Updates every second showing HH:MM:SS format
 */
function LiveClock() {
  const [time, setTime] = useState<string>("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    const updateTime = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: false 
      }))
    }

    updateTime() // Initial call
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [])

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="hidden sm:flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 min-w-[100px]">
        <Clock className="h-4 w-4 text-slate-500" />
        <span className="text-sm font-mono font-medium text-slate-600">--:--:--</span>
      </div>
    )
  }

  // Split time into hours:minutes and seconds
  const [hhmm, ss] = time ? [time.slice(0, 5), time.slice(6)] : ['--:--', '--']

  return (
    <div className="hidden sm:flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5">
      <Clock className="h-4 w-4 text-slate-500" />
      <span className="text-sm font-mono font-bold text-slate-700 tabular-nums">
        {hhmm}<span className="text-blue-500">:{ss}</span>
      </span>
    </div>
  )
}
import { useRouter } from "next/navigation"
import { signOut } from "@/app/(auth)/actions"
import { useDashboard } from "@/contexts/DashboardContext"
import { ChildSelector } from "./ChildSelector"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"

interface HeaderProps {
  currentStreak?: number
  subscriptionTier?: "free" | "ascent" | "summit"
}

/**
 * Dashboard Header
 * 
 * Displays child selector, streak counter, and parent menu.
 * 
 * @param currentStreak - Number of consecutive days with practice (optional)
 * @param subscriptionTier - Current subscription level (free, ascent, summit)
 */
export function Header({ currentStreak = 0, subscriptionTier = "free" }: HeaderProps) {
  const router = useRouter()
  const { user } = useDashboard()

  const handleSignOut = async () => {
    await signOut()
  }

  const tierLabels = {
    free: "Free",
    ascent: "Ascent",
    summit: "Summit",
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Child Selector */}
        <div className="flex items-center gap-4">
          <ChildSelector />
        </div>

        {/* Right: Clock, Streak & Account Menu */}
        <div className="flex items-center gap-3">
          {/* Live Clock */}
          <LiveClock />

          {/* Streak Display */}
          {currentStreak > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 rounded-lg bg-orange-50 px-3 py-1.5">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-semibold text-orange-700">
                {currentStreak} day{currentStreak !== 1 ? "s" : ""}
              </span>
            </div>
          )}

          {/* Account Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                data-testid="user-menu"
                variant="ghost"
                className="h-10 w-10 rounded-full p-0"
              >
                <Avatar className="h-10 w-10">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-lg font-semibold text-slate-700">
                    {user?.email?.charAt(0).toUpperCase()}
                  </div>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="text-sm">Account</span>
                  <span className="text-xs font-normal text-slate-500">
                    {user?.email}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/settings/profile")}>
                <Settings className="mr-2 h-4 w-4" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/settings/subscription")}>
                <CreditCard className="mr-2 h-4 w-4" />
                Subscription
                <span className="ml-auto text-xs text-slate-500">
                  {tierLabels[subscriptionTier]}
                </span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
