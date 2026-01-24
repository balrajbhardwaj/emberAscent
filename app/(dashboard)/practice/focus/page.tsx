/**
 * Focus Session Configuration Page
 * 
 * Subject and topic selection flow for Focus Sessions.
 * Two-step process: choose subject, then select topics.
 * 
 * @module app/(dashboard)/practice/focus
 */
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { SubjectSelector } from "@/components/practice/SubjectSelector"
import { TopicBrowser } from "@/components/practice/TopicBrowser"
import { useTopicProgress } from "@/hooks/useTopicProgress"
import { TOPIC_TAXONOMY, getSubject } from "@/lib/content/topics"
import { ArrowRight, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { createFocusSession } from "./actions"

type Step = "subject" | "topics"

export default function FocusSessionPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [currentStep, setCurrentStep] = useState<Step>("subject")
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [showWeakAreasOnly, setShowWeakAreasOnly] = useState(false)
  const [childId, setChildId] = useState<string | null>(null)
  const [isStarting, setIsStarting] = useState(false)

  // Fetch active child
  useEffect(() => {
    const fetchChild = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: children } = await supabase
          .from("children")
          .select("id")
          .eq("parent_id", user.id)
          .eq("is_active", true)
          .limit(1)
          .single()

        if ((children as any)?.id) {
          setChildId((children as any).id)
        }
      }
    }

    fetchChild()
  }, [])

  // Load topic progress
  const { subjectMastery, isLoading } = useTopicProgress(childId)

  // Load last selection from localStorage
  useEffect(() => {
    if (!childId) return

    const savedSelection = localStorage.getItem(`focus_selection_${childId}`)
    if (savedSelection) {
      try {
        const parsed = JSON.parse(savedSelection)
        if (parsed.subject) {
          setSelectedSubject(parsed.subject)
        }
        if (parsed.topics && Array.isArray(parsed.topics)) {
          setSelectedTopics(parsed.topics)
        }
      } catch (err) {
        console.error("Error loading saved selection:", err)
      }
    }
  }, [childId])

  // Save selection to localStorage
  useEffect(() => {
    if (!childId) return

    localStorage.setItem(
      `focus_selection_${childId}`,
      JSON.stringify({
        subject: selectedSubject,
        topics: selectedTopics,
      })
    )
  }, [childId, selectedSubject, selectedTopics])

  // Prepare subject options
  const subjectOptions = TOPIC_TAXONOMY.map((subject) => ({
    id: subject.id,
    name: subject.name,
    color: subject.color,
    icon: subject.icon,
    topicsCount: subject.topics.length,
    mastery: subjectMastery[subject.name]?.mastery || 0,
  }))

  // Get current subject data
  const currentSubject = selectedSubject ? getSubject(selectedSubject) : null

  // Handle subject selection
  const handleSelectSubject = (subjectId: string) => {
    setSelectedSubject(subjectId)
    setSelectedTopics([]) // Reset topic selection
    setCurrentStep("topics")
  }

  // Handle back to subject selection
  const handleBack = () => {
    setCurrentStep("subject")
  }

  // Handle start session
  const handleStart = async () => {
    if (!selectedSubject) {
      toast({
        title: "Select a subject",
        description: "Please choose a subject to practice.",
        variant: "destructive",
      })
      return
    }

    if (selectedTopics.length === 0) {
      toast({
        title: "Select topics",
        description: "Please select at least one topic to practice.",
        variant: "destructive",
      })
      return
    }

    if (!childId) {
      toast({
        title: "Child not found",
        description: "Please select a child profile.",
        variant: "destructive",
      })
      return
    }

    // Create focus session via server action
    const subject = getSubject(selectedSubject)
    if (!subject) {
      toast({
        title: "Invalid subject",
        description: "Please select a valid subject.",
        variant: "destructive",
      })
      return
    }

    setIsStarting(true)
    try {
      const result = await createFocusSession({
        childId,
        subject: subject.name,
        topics: selectedTopics,
      })

      if (!result.success) {
        toast({
          title: "Failed to start session",
          description: result.error || "Could not create focus session.",
          variant: "destructive",
        })
        return
      }

      // Navigate to the session page
      router.push(`/practice/session/${result.sessionId}`)
    } catch {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsStarting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your progress...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Focus Session</h1>
          <p className="text-slate-600 mt-2">
            Choose a subject and topics for focused practice
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
              currentStep === "subject"
                ? "bg-blue-500 text-white"
                : "bg-green-500 text-white"
            }`}
          >
            {currentStep === "subject" ? "1" : "✓"}
          </div>
          <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full bg-blue-500 transition-all duration-300 ${
                currentStep === "topics" ? "w-full" : "w-0"
              }`}
            />
          </div>
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
              currentStep === "topics"
                ? "bg-blue-500 text-white"
                : "bg-slate-200 text-slate-600"
            }`}
          >
            2
          </div>
        </div>

        {/* Step Content */}
        {currentStep === "subject" ? (
          <SubjectSelector
            subjects={subjectOptions}
            selectedSubject={selectedSubject}
            onSelectSubject={handleSelectSubject}
          />
        ) : (
          <>
            {currentSubject && (
              <TopicBrowser
                subjectName={currentSubject.name}
                topics={currentSubject.topics}
                topicMastery={
                  subjectMastery[currentSubject.name]?.topicsMastery || {}
                }
                selectedTopics={selectedTopics}
                onTopicsChange={setSelectedTopics}
                showWeakAreasOnly={showWeakAreasOnly}
                onToggleWeakAreas={setShowWeakAreasOnly}
              />
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                className="flex-1"
                size="lg"
                onClick={handleStart}
                disabled={selectedTopics.length === 0 || isStarting}
              >
                {isStarting ? "Starting..." : "Start Practice"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
