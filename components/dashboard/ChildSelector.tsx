/**
 * Child Selector Component
 * 
 * Dropdown menu for switching between child profiles in the dashboard.
 * Displays all children with their avatars and names, plus an option to add new children.
 * 
 * Features:
 * - Shows current child's avatar and name
 * - Dropdown with all children listed
 * - Visual selection indicator
 * - "Add new child" action at bottom
 * - Updates URL parameter when child is selected
 * 
 * @module components/dashboard/ChildSelector
 */
"use client"

import { UserPlus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useDashboard } from "@/contexts/DashboardContext"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

// Avatar emoji mapping
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

/**
 * Child Selector Dropdown
 * 
 * Allows parents to switch between their children's profiles.
 * Shows avatar and name for current child, with dropdown to select others.
 */
export function ChildSelector() {
  const router = useRouter()
  const { selectedChild, children, setSelectedChild } = useDashboard()

  if (!selectedChild) {
    return null
  }

  const handleAddChild = () => {
    router.push("/settings/children/new")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 border-slate-200 bg-white hover:bg-slate-50"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-amber-100 text-xl">
            {AVATAR_EMOJIS[selectedChild.avatar_url || "boy-1"] || "👤"}
          </div>
          <span className="font-medium text-slate-900">
            {selectedChild.name}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>Switch Child</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {children.map((child) => (
          <DropdownMenuItem
            key={child.id}
            onClick={() => setSelectedChild(child)}
            className={`flex items-center gap-2 ${
              selectedChild.id === child.id ? "bg-orange-50" : ""
            }`}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-amber-100 text-xl">
              {AVATAR_EMOJIS[child.avatar_url || "boy-1"] || "👤"}
            </div>
            <div className="flex flex-col">
              <span className="font-medium">{child.name}</span>
              {child.year_group && (
                <span className="text-xs text-slate-500">
                  Year {child.year_group}
                </span>
              )}
            </div>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleAddChild} className="text-primary">
          <UserPlus className="mr-2 h-4 w-4" />
          Add new child
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
