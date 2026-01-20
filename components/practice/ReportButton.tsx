/**
 * Report Button Component
 * 
 * Small, unobtrusive button that allows users to report issues with questions.
 * Opens the report modal when clicked.
 * 
 * @module components/practice/ReportButton
 */
"use client"

import { useState } from "react"
import { Flag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ReportModal } from "./ReportModal"

interface ReportButtonProps {
  questionId: string
  questionText: string
  className?: string
}

/**
 * Report Button
 * 
 * Subtle button for reporting question issues.
 * 
 * @param questionId - ID of the question to report
 * @param questionText - Text of the question for preview
 * @param className - Additional CSS classes
 */
export function ReportButton({
  questionId,
  questionText,
  className = "",
}: ReportButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsModalOpen(true)}
        className={`text-slate-500 hover:text-slate-700 transition-colors ${className}`}
        title="Report an issue with this question"
      >
        <Flag className="h-3 w-3 mr-1" />
        Report Issue
      </Button>
      
      <ReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        questionId={questionId}
        questionText={questionText}
      />
    </>
  )
}
