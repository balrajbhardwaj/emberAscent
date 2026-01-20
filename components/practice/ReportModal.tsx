/**
 * Report Modal Component
 * 
 * Modal for reporting issues with questions. Includes form validation,
 * report type selection, and success/error handling.
 * 
 * @module components/practice/ReportModal
 */
"use client"

import { useState } from "react"
import { CheckCircle2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  questionId: string
  questionText: string
}

type ReportType = "incorrect_answer" | "unclear" | "typo" | "other"

interface ReportFormData {
  type: ReportType | ""
  description: string
}

const REPORT_TYPES = [
  {
    value: "incorrect_answer" as const,
    label: "Answer seems wrong",
    description: "The correct answer appears to be incorrect",
  },
  {
    value: "unclear" as const,
    label: "Question is unclear",
    description: "The question wording is confusing or ambiguous",
  },
  {
    value: "typo" as const,
    label: "Spelling/grammar error",
    description: "There's a spelling mistake or grammar error",
  },
  {
    value: "other" as const,
    label: "Other issue",
    description: "Something else is wrong with this question",
  },
]

/**
 * Report Modal
 * 
 * Form modal for submitting question issue reports.
 * 
 * @param isOpen - Whether the modal is open
 * @param onClose - Callback to close the modal
 * @param questionId - ID of the question being reported
 * @param questionText - Text of the question for preview
 */
export function ReportModal({
  isOpen,
  onClose,
  questionId,
  questionText,
}: ReportModalProps) {
  const [formData, setFormData] = useState<ReportFormData>({
    type: "",
    description: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const { toast } = useToast()

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.type) {
      toast({
        title: "Report type required",
        description: "Please select what type of issue you're reporting.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionId,
          reportType: formData.type,
          description: formData.description.trim() || null,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit report")
      }

      // Show success state
      setShowSuccess(true)
      
      // Close modal after 2 seconds
      setTimeout(() => {
        setShowSuccess(false)
        setFormData({ type: "", description: "" })
        onClose()
      }, 2000)

    } catch (error) {
      console.error("Error submitting report:", error)
      toast({
        title: "Failed to submit report",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * Handle modal close
   */
  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ type: "", description: "" })
      setShowSuccess(false)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Report Question Issue
          </DialogTitle>
        </DialogHeader>

        {showSuccess ? (
          // Success state
          <div className="text-center py-8">
            <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Thank you for your report!
            </h3>
            <p className="text-sm text-slate-600">
              Your report helps improve our questions. We'll review it soon.
            </p>
          </div>
        ) : (
          // Form state
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Question Preview */}
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2 block">
                Question
              </Label>
              <Card className="p-3 bg-slate-50 border-slate-200">
                <p className="text-sm text-slate-800 line-clamp-3">
                  {questionText}
                </p>
              </Card>
            </div>

            {/* Report Type Selection */}
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2 block">
                What's the issue? <span className="text-red-500">*</span>
              </Label>
              <div className="space-y-2">
                {REPORT_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      formData.type === type.value
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="font-medium text-slate-900 mb-1">
                      {type.label}
                    </div>
                    <div className="text-xs text-slate-600">
                      {type.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-sm font-medium text-slate-700 mb-2 block">
                Additional details (optional)
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Please provide any additional details about the issue..."
                rows={3}
                className="text-sm"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !formData.type}
                className="flex-1"
              >
                {isSubmitting ? "Submitting..." : "Submit Report"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
