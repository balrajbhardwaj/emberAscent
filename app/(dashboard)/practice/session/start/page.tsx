/**
 * Practice Session Start Page
 * 
 * Handles starting a new practice session with the specified parameters.
 * 
 * Features:
 * - Session configuration (mode, subject, difficulty)
 * - Subject selection for focus mode
 * - Question selection and preparation
 * - Timer setup for timed sessions
 * - Progress tracking initialization
 * 
 * @module app/(dashboard)/practice/session/start/page
 */

"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Clock, Target, Zap, ArrowLeft, BookOpen, Calculator } from "lucide-react"

const sessionModes = {
  quick: {
    name: "Quick Practice",
    icon: Zap,
    questionCount: 10,
    timeLimit: null,
    description: "10 mixed questions, no time limit"
  },
  focus: {
    name: "Focus Session", 
    icon: Target,
    questionCount: 25,
    timeLimit: 30 * 60, // 30 minutes
    description: "25 questions on chosen subject"
  },
  mock: {
    name: "Mock Test",
    icon: Clock,
    questionCount: 50,
    timeLimit: 60 * 60, // 60 minutes  
    description: "Full exam simulation with time pressure"
  }
}

const subjectOptions = [
  { id: 'mathematics', name: 'Mathematics', icon: Calculator, color: 'bg-blue-100 text-blue-600' },
  { id: 'english', name: 'English', icon: BookOpen, color: 'bg-green-100 text-green-600' },
]

export default function SessionStartPage() {
  return (
    <Suspense fallback={<SessionStartSkeleton />}>
      <SessionStartContent />
    </Suspense>
  )
}

function SessionStartContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const [questions, setQuestions] = useState<any[]>([])
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  
  const childId = searchParams?.get('childId')
  const mode = (searchParams?.get('mode') || 'quick') as keyof typeof sessionModes
  const subjectParam = searchParams?.get('subject')
  
  // Use URL subject param or selected subject
  const subject = subjectParam || selectedSubject
  
  const sessionConfig = sessionModes[mode]
  const IconComponent = sessionConfig.icon
  
  // For focus mode, require subject selection
  const needsSubjectSelection = mode === 'focus' && !subject

  useEffect(() => {
    if (!childId) {
      router.push('/practice')
      return
    }
    
    // Only load questions if we have a subject (for focus) or it's not focus mode
    if (!needsSubjectSelection) {
      loadSessionQuestions()
    }
  }, [childId, mode, subject])

  async function loadSessionQuestions() {
    setIsLoading(true)
    try {
      const supabase = createClient()
      
      let query = supabase
        .from('questions')
        .select('*')
        .eq('is_published', true)
        .limit(sessionConfig.questionCount)
      
      // Filter by subject if specified
      if (subject && subject !== 'mixed') {
        query = query.eq('subject', subject)
      }
      
      const { data, error } = await query
      
      if (error) {
        console.error('Error loading questions:', error)
        return
      }
      
      if (!data || data.length === 0) {
        console.warn('No questions available')
        return
      }
      
      // Shuffle questions for randomness
      const shuffled = data.sort(() => Math.random() - 0.5)
      setQuestions(shuffled.slice(0, sessionConfig.questionCount))
      
    } catch (error) {
      console.error('Failed to load questions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function startSession() {
    if (questions.length === 0 || !childId) {
      return
    }

    setIsLoading(true)
    setIsNavigating(true)
    
    try {
      const supabase = createClient()
      
      // Create practice session record
      // subject must be null for mixed mode (database constraint only allows valid subject values)
      const { data: session, error } = await supabase
        .from('practice_sessions')
        .insert({
          child_id: childId,
          session_type: mode,
          subject: subject && subject !== 'mixed' ? subject : null,
          total_questions: questions.length,
          started_at: new Date().toISOString()
        } as any)
        .select()
        .single()

      if (error) {
        console.error('Error creating session:', error)
        setIsNavigating(false)
        return
      }

      // Navigate to the actual practice page
      router.push(`/practice/session/${session.id}`)
      
    } catch (error) {
      console.error('Failed to start session:', error)
      setIsNavigating(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Full-page loading overlay when navigating to practice */}
      {isNavigating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
              <Zap className="absolute inset-0 m-auto h-6 w-6 text-blue-600" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-slate-900">Preparing Practice Session</p>
              <p className="text-sm text-slate-500 mt-1">Loading questions just for you...</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

      {/* Session Configuration Card */}
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
            <IconComponent className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">{sessionConfig.name}</CardTitle>
          <CardDescription>{sessionConfig.description}</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Subject Selection for Focus Mode */}
          {needsSubjectSelection && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-slate-900 mb-3">Choose a Subject</h3>
                <div className="grid grid-cols-2 gap-3">
                  {subjectOptions.map((subj) => {
                    const SubjIcon = subj.icon
                    return (
                      <button
                        key={subj.id}
                        onClick={() => setSelectedSubject(subj.id)}
                        className={`p-4 rounded-lg border-2 text-left transition-all hover:shadow-md ${
                          selectedSubject === subj.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className={`inline-flex p-2 rounded-lg ${subj.color} mb-2`}>
                          <SubjIcon className="h-5 w-5" />
                        </div>
                        <p className="font-medium text-slate-900">{subj.name}</p>
                      </button>
                    )
                  })}
                </div>
              </div>
              
              {selectedSubject && (
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => {
                    // Reload with subject selected - this will trigger question loading
                    setSelectedSubject(selectedSubject)
                  }}
                >
                  Continue with {subjectOptions.find(s => s.id === selectedSubject)?.name}
                  <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                </Button>
              )}
            </div>
          )}

          {/* Session Details - show when subject is selected or not focus mode */}
          {!needsSubjectSelection && (
            <>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-slate-600">Questions:</span>
                  <p className="text-slate-900">{sessionConfig.questionCount}</p>
                </div>
                <div>
                  <span className="font-medium text-slate-600">Time Limit:</span>
                  <p className="text-slate-900">
                    {sessionConfig.timeLimit 
                      ? `${Math.floor(sessionConfig.timeLimit / 60)} minutes`
                      : 'No limit'
                    }
                  </p>
                </div>
                <div>
                  <span className="font-medium text-slate-600">Subject:</span>
                  <p className="text-slate-900 capitalize">
                    {subject || 'Mixed subjects'}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-slate-600">Available Questions:</span>
                  <p className="text-slate-900">{questions.length}</p>
                </div>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="text-center py-4">
                  <div className="inline-flex items-center text-sm text-slate-600">
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600"></div>
                    Loading questions...
                  </div>
                </div>
              )}

              {/* No Questions Warning */}
              {!isLoading && questions.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-sm text-amber-600 mb-2">
                    No questions available for this configuration.
                  </p>
                  <Button variant="outline" onClick={() => router.push('/practice')}>
                    Choose Different Options
                  </Button>
                </div>
              )}

              {/* Start Button */}
              {questions.length > 0 && (
                <div className="pt-4">
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={startSession}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                        Starting Session...
                      </>
                    ) : (
                      <>
                        Start {sessionConfig.name}
                        <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      </div>
    </>
  )
}

function SessionStartSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Skeleton className="h-10 w-24" />
      <Card>
        <CardHeader className="text-center">
          <Skeleton className="mx-auto mb-4 h-16 w-16 rounded-full" />
          <Skeleton className="mx-auto h-8 w-48" />
          <Skeleton className="mx-auto h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
          <Skeleton className="mt-6 h-12 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}