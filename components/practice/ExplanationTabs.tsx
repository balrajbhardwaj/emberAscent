/**
 * Explanation Tabs Component
 * 
 * Reusable tab interface for switching between different explanation styles:
 * - Step by Step: Detailed walkthrough
 * - Visual/Analogy: Conceptual understanding
 * - Worked Example: Practical demonstration
 * 
 * @module components/practice/ExplanationTabs
 */
"use client"

import { List, Lightbulb, FileText } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export type ExplanationStyle = "step-by-step" | "visual" | "example"

interface ExplanationTabsProps {
  activeTab: ExplanationStyle
  onTabChange: (tab: ExplanationStyle) => void
}

/**
 * Explanation Style Tabs
 * 
 * Allows users to switch between different explanation formats.
 * 
 * @param activeTab - Currently selected explanation style
 * @param onTabChange - Handler when tab is changed
 */
export function ExplanationTabs({
  activeTab,
  onTabChange,
}: ExplanationTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as ExplanationStyle)}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="step-by-step" className="flex items-center gap-2">
          <List className="h-4 w-4" />
          <span className="hidden sm:inline">Step by Step</span>
          <span className="sm:hidden">Steps</span>
        </TabsTrigger>
        <TabsTrigger value="visual" className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4" />
          <span className="hidden sm:inline">Visual</span>
          <span className="sm:hidden">Visual</span>
        </TabsTrigger>
        <TabsTrigger value="example" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Worked Example</span>
          <span className="sm:hidden">Example</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
