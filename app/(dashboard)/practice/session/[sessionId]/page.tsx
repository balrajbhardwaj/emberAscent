/**
 * Practice Session Page
 * 
 * Active practice session where users answer questions.
 * Handles question flow, timing, and progress tracking.
 * 
 * Features adaptive difficulty for quick/focus sessions.
 * Uses fixed difficulty distribution for mock tests.
 * 
 * @module app/(dashboard)/practice/session/[sessionId]/page
 */

"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, XCircle, Lightbulb } from "lucide-react"
import { EmberScore } from "@/components/practice/EmberScore"
import { CurriculumBadge } from "@/components/curriculum/CurriculumReference"
import { ProvenancePanel } from "@/components/ember-score/ProvenancePanel"
import { useAdaptiveSession, getDifficultyDisplay } from "@/hooks/useAdaptiveSession"
import { useToast } from "@/hooks/use-toast"
import type { DifficultyLevel } from "@/types/adaptive"

interface QuestionOption {
  id: string
  text: string
}

interface Question {
  id: string
  question_text: string
  subject: string
  topic: string | null
  difficulty: string
  options: QuestionOption[]
  correct_answer: string
  explanations: {
    step_by_step: string
    visual: string
    worked_example: string
  } | null
  ember_score: number
  year_group: number | null
  curriculum_reference: string | null
  is_published: boolean
  created_at: string
  created_by: string | null
}

interface PracticeSession {
  id: string
  child_id: string
  session_type: string
  subject: string | null
  topic: string | null
  total_questions: number
  started_at: string
  completed_at: string | null
  correct_answers: number
  created_at: string
}

export default function PracticeSessionPage() {
  const router = useRouter()
  const params = useParams()
  const sessionId = params?.sessionId as string
  const { toast } = useToast()

  const [session, setSession] = useState<PracticeSession | null>(null)
  const [childId, setChildId] = useState<string>('')
  const [topicId, setTopicId] = useState<string>('')
  
  // For mock tests: pre-load all questions
  const [mockQuestions, setMockQuestions] = useState<Question[]>([])
  const [currentMockIndex, setCurrentMockIndex] = useState(0)
  
  // Common state
  const [questionsAnswered, setQuestionsAnswered] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now())
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [showProvenancePanel, setShowProvenancePanel] = useState(false)
  
  // Adaptive session hook (for quick/focus sessions)
  const isAdaptiveSession = session?.session_type === 'quick' || session?.session_type === 'focus'
  const {
    currentQuestion: adaptiveQuestion,
    adaptiveInfo,
    isLoading: isLoadingQuestion,
    fetchNextQuestion,
    submitAnswer: submitAdaptiveAnswer,
    isExhausted
  } = useAdaptiveSession({
    childId: childId,
    topicId: topicId,
    sessionId: sessionId,
    onDifficultyAdjust: (adjustment) => {
      if (adjustment.shouldAdjust) {
        const diffDisplay = getDifficultyDisplay(adjustment.recommendedDifficulty as DifficultyLevel)
        toast({
          title: "Difficulty Adjusted! " + diffDisplay.icon,
          description: adjustment.adjustmentReason,
          duration: 4000,
        })
      }
    }
  })
  
  // Current question (either adaptive or mock)
  const currentQuestion = isAdaptiveSession 
    ? adaptiveQuestion 
    : mockQuestions[currentMockIndex]

  useEffect(() => {
    if (!sessionId) return
    loadSession()
  }, [sessionId])

  // Start question timing when question loads
  useEffect(() => {
    if (currentQuestion && !hasSubmitted) {
      setQuestionStartTime(Date.now())
    }
  }, [currentQuestion, hasSubmitted])

  // Timer effect for timed sessions
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          handleFinishSession()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeRemaining])

  async function loadSession() {
    try {
      const supabase = createClient()
      
      // Load session details
      const { data: sessionData, error: sessionError } = await supabase
        .from('practice_sessions')
        .select('*')
        .eq('id', sessionId)
        .single()

      if (sessionError || !sessionData) {
        console.error('Session not found:', sessionError)
        router.push('/practice')
        return
      }

      setSession(sessionData as any)
      setChildId(sessionData.child_id)
      
      // Get topic ID if specified
      if (sessionData.topic) {
        setTopicId(sessionData.topic)
      } else if (sessionData.subject) {
        // Use subject as topic for now (may need refinement)
        setTopicId(sessionData.subject)
      } else {
        setTopicId('general')
      }
      
      // For mock tests: pre-load all questions with fixed distribution
      if (sessionData.session_type === 'mock') {
        await loadMockQuestions(supabase, sessionData)
      }
      // For adaptive sessions: fetch first question
      else if (sessionData.session_type === 'quick' || sessionData.session_type === 'focus') {
        // Will be handled by useAdaptiveSession hook
        setIsLoading(false)
      } else {
        // Fallback for other session types
        setIsLoading(false)
      }
      
    } catch (error) {
      console.error('Failed to load session:', error)
      router.push('/practice')
    }
  }
  
  async function loadMockQuestions(supabase: any, sessionData: any) {
    try {
      const totalQuestions = sessionData.total_questions || 20
      
      // Mock test distribution: 25% foundation, 50% standard, 25% challenge
      const foundationCount = Math.round(totalQuestions * 0.25)
      const challengeCount = Math.round(totalQuestions * 0.25)
      const standardCount = totalQuestions - foundationCount - challengeCount
      
      const loadedQuestions: Question[] = []
      
      // Load each difficulty level
      for (const { difficulty, count } of [
        { difficulty: 'foundation', count: foundationCount },
        { difficulty: 'standard', count: standardCount },
        { difficulty: 'challenge', count: challengeCount }
      ]) {
        let query = supabase
          .from('questions')
          .select('*')
          .eq('is_published', true)
          .eq('difficulty', difficulty)
          .limit(count * 2) // Get extra for randomization
        
        if (sessionData.subject && sessionData.subject !== 'mixed') {
          query = query.ilike('subject', `%${sessionData.subject}%`)
        }
        
        if (sessionData.topic) {
          query = query.ilike('topic', `%${sessionData.topic}%`)
        }
        
        const { data, error } = await query
        
        if (error) {
          console.error(`Error loading ${difficulty} questions:`, error)
          continue
        }
        
        // Shuffle and take required count
        const shuffled = (data || []).sort(() => Math.random() - 0.5)
        loadedQuestions.push(...shuffled.slice(0, count) as Question[])
      }
      
      // Final shuffle to mix difficulties
      const finalQuestions = loadedQuestions.sort(() => Math.random() - 0.5)
      setMockQuestions(finalQuestions)
      
      // Set timer for mock tests (e.g., 40 minutes for 20 questions)
      const timeLimit = totalQuestions * 120 // 2 minutes per question
      setTimeRemaining(timeLimit)
      
    } catch (error) {
      console.error('Failed to load mock questions:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Fetch first adaptive question when ready
  useEffect(() => {
    if (isAdaptiveSession && childId && topicId && !isLoading) {
      fetchNextQuestion()
    }
  }, [isAdaptiveSession, childId, topicId, isLoading])

  function handleAnswerSelect(answerId: string) {
    if (hasSubmitted) return
    setSelectedAnswer(answerId)
  }

  async function handleSubmitAnswer() {
    if (!selectedAnswer || hasSubmitted || !currentQuestion) return

    const timeSpent = Math.max(1, Math.floor((Date.now() - questionStartTime) / 1000))
    const isCorrect = selectedAnswer === currentQuestion.correct_answer
    
    if (isCorrect) {
      setCorrectCount(prev => prev + 1)
    }
    
    setQuestionsAnswered(prev => prev + 1)
    setHasSubmitted(true)

    // Record attempt in database
    try {
      const supabase = createClient()
      await supabase
        .from('question_attempts')
        .insert({
          session_id: sessionId,
          question_id: currentQuestion.id,
          child_id: childId,
          selected_answer: selectedAnswer,
          is_correct: isCorrect,
          time_taken_seconds: timeSpent,
        })
      
      // For adaptive sessions: submit to adaptive system
      if (isAdaptiveSession) {
        await submitAdaptiveAnswer(currentQuestion.id, isCorrect, timeSpent)
      }
    } catch (error) {
      console.error('Error recording attempt:', error)
    }
  }

  function handleNextQuestion() {
    if (!session) return
    
    setSelectedAnswer('')
    setHasSubmitted(false)
    
    // Check if session is complete
    if (questionsAnswered >= session.total_questions) {
      handleFinishSession()
      return
    }
    
    // Load next question based on session type
    if (isAdaptiveSession) {
      // Fetch next adaptive question
      fetchNextQuestion()
    } else {
      // Move to next mock question
      if (currentMockIndex < mockQuestions.length - 1) {
        setCurrentMockIndex(prev => prev + 1)
      } else {
        handleFinishSession()
      }
    }
  }

  async function handleFinishSession() {
    if (!session) return

    try {
      const supabase = createClient()

      // Update session
      await supabase
        .from('practice_sessions')
        .update({
          correct_answers: correctCount,
          completed_at: new Date().toISOString()
        })
        .eq('id', sessionId)

      // Navigate to results
      router.push(`/practice/session/${sessionId}/results`)
      
    } catch (error) {
      console.error('Error finishing session:', error)
      toast({
        title: "Error",
        description: "Failed to save session. Please try again.",
        variant: "destructive"
      })
    }
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (isLoading || (isAdaptiveSession && isLoadingQuestion && !currentQuestion)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading practice session...</p>
        </div>
      </div>
    )
  }

  if (!session || !currentQuestion) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 mb-4">
          {isExhausted 
            ? "No more questions available. Great work!" 
            : "Session not found or no questions available."}
        </p>
        <Button onClick={() => router.push('/practice')}>
          Return to Practice
        </Button>
      </div>
    )
  }

  const progressPercentage = session.total_questions > 0
    ? (questionsAnswered / session.total_questions) * 100
    : 0

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {session.session_type.charAt(0).toUpperCase() + session.session_type.slice(1)} Practice
          </h1>
          <p className="text-slate-600 capitalize">{session.subject}</p>
        </div>
        
        {timeRemaining !== null && (
          <div className="flex items-center space-x-2 text-lg font-mono">
            <Clock className="h-5 w-5 text-slate-600" />
            <span className={timeRemaining < 300 ? 'text-red-600' : 'text-slate-900'}>
              {formatTime(timeRemaining)}
            </span>
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">
            Question {questionsAnswered + 1} of {session.total_questions}
          </span>
          <span className="text-slate-900 font-medium">
            {Math.round(progressPercentage)}% Complete
          </span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>
      
      {/* Adaptive Difficulty Indicator */}
      {isAdaptiveSession && adaptiveInfo && (
        <div className="flex items-center gap-2 text-sm">
          <Badge variant="outline" className={getDifficultyDisplay(adaptiveInfo.currentDifficulty).color}>
            {getDifficultyDisplay(adaptiveInfo.currentDifficulty).icon} {getDifficultyDisplay(adaptiveInfo.currentDifficulty).name}
          </Badge>
          <span className="text-slate-600">
            Recent: {Math.round(adaptiveInfo.recentAccuracy * 100)}% • Streak: {adaptiveInfo.currentStreak}
          </span>
        </div>
      )}

      {/* Question Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="capitalize">
                {currentQuestion.subject}
              </Badge>
              {currentQuestion.curriculum_reference && (
                <CurriculumBadge 
                  code={currentQuestion.curriculum_reference}
                  showTooltip
                />
              )}
            </div>
            <EmberScore 
              score={currentQuestion.ember_score}
              questionId={currentQuestion.id}
              showDetails={true}
              onOpenProvenance={() => setShowProvenancePanel(true)}
              breakdown={{
                curriculumAlignment: currentQuestion.curriculum_reference ? 100 : 0,
                expertVerified: false,
                communityRating: 0,
                generatedBy: "AI Generated",
                reviewedBy: "",
                curriculumReference: currentQuestion.curriculum_reference || "",
              }}
            />
          </div>
          <CardTitle className="text-xl leading-relaxed">
            {currentQuestion.question_text}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Answer Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option) => {
              const isCorrect = option.id === currentQuestion.correct_answer
              const isSelected = selectedAnswer === option.id

              let optionClass = 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              let circleClass = 'border-slate-300 text-slate-600'

              if (hasSubmitted) {
                if (isCorrect) {
                  optionClass = 'border-green-500 bg-green-50'
                  circleClass = 'border-green-500 bg-green-500 text-white'
                } else if (isSelected && !isCorrect) {
                  optionClass = 'border-red-500 bg-red-50'
                  circleClass = 'border-red-500 bg-red-500 text-white'
                }
              } else if (isSelected) {
                optionClass = 'border-blue-500 bg-blue-50'
                circleClass = 'border-blue-500 bg-blue-500 text-white'
              }

              return (
                <button
                  key={option.id}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${optionClass} ${hasSubmitted ? 'cursor-default' : ''}`}
                  onClick={() => handleAnswerSelect(option.id)}
                  disabled={hasSubmitted}
                >
                  <div className="flex items-center space-x-3">
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full border-2 text-sm font-medium ${circleClass}`}>
                      {hasSubmitted && isCorrect ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : hasSubmitted && isSelected && !isCorrect ? (
                        <XCircle className="h-4 w-4" />
                      ) : (
                        option.id
                      )}
                    </span>
                    <span className="text-slate-900">{option.text}</span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Result feedback + Next Button (MOVED UP - appears immediately after options) */}
          {hasSubmitted && (
            <div className={`mt-4 p-4 rounded-lg flex items-center justify-between ${
              selectedAnswer === currentQuestion.correct_answer
                ? 'bg-green-100 border border-green-200'
                : 'bg-red-100 border border-red-200'
            }`}>
              <div className="flex items-center space-x-2">
                {selectedAnswer === currentQuestion.correct_answer ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-700" />
                    <span className="font-semibold text-green-800">Correct!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-700" />
                    <span className="font-semibold text-red-800">
                      Incorrect. The correct answer is {currentQuestion.correct_answer}.
                    </span>
                  </>
                )}
              </div>
              <Button
                onClick={handleNextQuestion}
                size="lg"
              >
                {questionsAnswered >= session.total_questions - 1 ? 'Finish Session' : 'Next Question'}
              </Button>
            </div>
          )}

          {/* Submit Answer button (only before submission) */}
          {!hasSubmitted && (
            <div className="flex justify-end pt-4">
              <Button
                onClick={handleSubmitAnswer}
                disabled={!selectedAnswer}
                size="lg"
              >
                Submit Answer
              </Button>
            </div>
          )}

          {/* Explanation Panel (NOW BELOW the result - optional viewing) */}
          {hasSubmitted && currentQuestion.explanations && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <Lightbulb className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-3">
                  <h4 className="font-semibold text-amber-900">Explanation</h4>

                  {currentQuestion.explanations.step_by_step && (
                    <div>
                      <p className="text-sm font-medium text-amber-800">Step by Step:</p>
                      <p className="text-sm text-amber-900">{currentQuestion.explanations.step_by_step}</p>
                    </div>
                  )}

                  {currentQuestion.explanations.worked_example && (
                    <div>
                      <p className="text-sm font-medium text-amber-800">Worked Example:</p>
                      <p className="text-sm text-amber-900">{currentQuestion.explanations.worked_example}</p>
                    </div>
                  )}

                  {currentQuestion.explanations.visual && (
                    <div>
                      <p className="text-sm font-medium text-amber-800">Visual Aid:</p>
                      <p className="text-sm text-amber-900">{currentQuestion.explanations.visual}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Provenance Panel - Non-obstructive slide-in */}
      <ProvenancePanel
        isOpen={showProvenancePanel}
        onClose={() => setShowProvenancePanel(false)}
        questionId={currentQuestion.id}
        questionData={{
          subject: currentQuestion.subject,
          topic: currentQuestion.topic || 'General',
          emberScore: currentQuestion.ember_score,
          curriculumReference: currentQuestion.curriculum_reference || undefined,
          createdAt: new Date(currentQuestion.created_at),
        }}
      />
    </div>
  )
}