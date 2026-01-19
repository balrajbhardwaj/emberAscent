/**
 * Avatar Picker Component
 * 
 * Displays a grid of emoji-based avatars for children to choose from during profile setup.
 * Uses emoji characters for quick implementation without image uploads.
 * 
 * Features:
 * - 8 predefined avatar options (mix of characters and symbols)
 * - Visual selection feedback with border highlighting
 * - Hidden input field for form submission
 * - Accessible button elements with aria-labels
 * 
 * @param value - Currently selected avatar ID (defaults to 'boy-1')
 * @param onChange - Callback function when avatar selection changes
 * 
 * @example
 * <AvatarPicker 
 *   value={selectedAvatar} 
 *   onChange={(id) => setSelectedAvatar(id)} 
 * />
 */
"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"

// Predefined avatar options (emoji-based for simplicity)
const AVATAR_OPTIONS = [
  { id: "boy-1", emoji: "👦", label: "Boy 1" },
  { id: "boy-2", emoji: "🧒", label: "Boy 2" },
  { id: "girl-1", emoji: "👧", label: "Girl 1" },
  { id: "girl-2", emoji: "🧑", label: "Girl 2" },
  { id: "student-1", emoji: "🎓", label: "Student 1" },
  { id: "student-2", emoji: "📚", label: "Student 2" },
  { id: "star", emoji: "⭐", label: "Star" },
  { id: "rocket", emoji: "🚀", label: "Rocket" },
]

interface AvatarPickerProps {
  value?: string
  onChange: (avatarId: string) => void
}

export function AvatarPicker({ value, onChange }: AvatarPickerProps) {
  const [selected, setSelected] = useState(value || AVATAR_OPTIONS[0].id)

  const handleSelect = (avatarId: string) => {
    setSelected(avatarId)
    onChange(avatarId)
  }

  return (
    <div className="space-y-3">
      <Label>Choose an avatar</Label>
      <div className="grid grid-cols-4 gap-3">
        {AVATAR_OPTIONS.map((avatar) => (
          <button
            key={avatar.id}
            type="button"
            onClick={() => handleSelect(avatar.id)}
            className={`flex aspect-square items-center justify-center rounded-lg border-2 text-4xl transition-all hover:scale-105 ${
              selected === avatar.id
                ? "border-primary bg-primary/10 shadow-md"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
            aria-label={avatar.label}
          >
            {avatar.emoji}
          </button>
        ))}
      </div>
      <input type="hidden" name="avatarUrl" value={selected} />
    </div>
  )
}
