/**
 * Practice Session Page
 * 
 * Active practice session where users answer questions.
 * 
 * Logic:
 * 1. New session: Load 10x questions via API for coverage, track used questions, mix subjects
 * 2. Retry (Practice Again): Load same questions from previous session
 * 3. Questions are pre-loaded and served from pool to ensure uniqueness
 * 
 * @module app/(dashboard)/practice/session/[sessionId]/page
 */

"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, XCircle } from "lucide-react"
import { EmberScore } from "@/components/practice/EmberScore"
import { CurriculumBadge } from "@/components/curriculum/CurriculumReference"
import { ProvenancePanel } from "@/components/ember-score/ProvenancePanel"
import { EnhancedExplanationPanel } from "@/components/practice/EnhancedExplanationPanel"
import { useToast } from "@/hooks/use-toast"

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
    visual: string | null
    worked_example: string | null
  } | null
  ember_score: number
  year_group: number | null
  curriculum_reference: string | null
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
}

export default function PracticeSessionPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const sessionId = params?.sessionId as string
  const retryFromSession = searchParams?.get('retry') // 'true' if retry mode
  const { toast } = useToast()

  // Session and child state
  const [session, setSession] = useState<PracticeSession | null>(null)
  const [childId, setChildId] = useState<string>('')
  
  // Question pool and tracking
  const [questionPool, setQuestionPool] = useState<Question[]>([])
  const [usedQuestionIds, setUsedQuestionIds] = useState<Set<string>>(new Set())
  const [usedQuestionTexts, setUsedQuestionTexts] = useState<Set<string>>(new Set())
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]) // Questions shown in this session
  
  // Progress state
  const [questionsAnswered, setQuestionsAnswered] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now())
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [showProvenancePanel, setShowProvenancePanel] = useState(false)
  
  // Track last subject to alternate
  const lastSubjectRef = useRef<string>('')
  const hasLoadedRef = useRef<boolean>(false)

  /**
   * Pick next question from pool ensuring:
   * - Not already used (by ID or question_text)
   * - Alternates subjects when possible (maths -> english -> maths)
   */
  const pickNextQuestion = useCallback((
    pool: Question[],
    usedIds: Set<string>,
    usedTexts: Set<string>,
    lastSubject: string
  ): Question | null => {
    // Filter to available questions (not used by ID or text)
    const available = pool.filter(q => 
      !usedIds.has(q.id) && 
      !usedTexts.has(q.question_text.toLowerCase().trim())
    )
    
    if (available.length === 0) return null
    
    // Try to alternate subjects
    const preferredSubject = lastSubject.toLowerCase() === 'mathematics' ? 'english' : 'mathematics'
    const preferredQuestions = available.filter(q => q.subject.toLowerCase() === preferredSubject)
    
    // Pick from preferred subject if available, otherwise any available
    const candidates = preferredQuestions.length > 0 ? preferredQuestions : available
    
    // Shuffle and pick first
    const shuffled = [...candidates].sort(() => Math.random() - 0.5)
    return shuffled[0]
  }, [])

  /**
   * Load fresh questions from API for a new session
   * Loads 10x the needed count for coverage
   */
  const loadFreshQuestions = useCallback(async (sessionData: PracticeSession) => {
    try {
      const totalNeeded = sessionData.total_questions || 10
      const poolSize = totalNeeded * 10 // Load 10x for coverage
      
      const params = new URLSearchParams({
        childId: sessionData.child_id,
        sessionType: sessionData.session_type,
        count: poolSize.toString(),
      })
      
      if (sessionData.subject && sessionData.subject !== 'mixed') {
        params.append('subject', sessionData.subject)
      }
      
      const response = await fetch(`/api/practice/session-questions?${params}`)
      const data = await response.json()
      
      if (!response.ok || !data.questions || data.questions.length === 0) {
        console.error('No questions available:', data.error)
        toast({
          title: "Error",
          description: "No questions available. Please try again later.",
          variant: "destructive"
        })
        router.push('/practice')
        return
      }
      
      // Transform API response to Question format
      const questions: Question[] = data.questions.map((q: any) => ({
        id: q.id,
        question_text: q.question_text,
        subject: q.subject,
        topic: q.topic,
        difficulty: q.difficulty,
        options: q.options,
        correct_answer: q.correct_answer,
        explanations: q.explanations,
        ember_score: q.ember_score,
        year_group: null,
        curriculum_reference: q.curriculum_reference,
      }))
      
      setQuestionPool(questions)
      
      // Pick first question with subject balancing
      const firstQuestion = pickNextQuestion(questions, new Set(), new Set(), '')
      if (firstQuestion) {
        setCurrentQuestion(firstQuestion)
        setSessionQuestions([firstQuestion])
        setUsedQuestionIds(new Set([firstQuestion.id]))
        setUsedQuestionTexts(new Set([firstQuestion.question_text.toLowerCase().trim()]))
        lastSubjectRef.current = firstQuestion.subject.toLowerCase()
        setQuestionStartTime(Date.now())
      }
      
      // Set timer for mock tests - fixed 60 minutes
      if (sessionData.session_type === 'mock') {
        const timeLimit = 60 * 60 // 60 minutes fixed
        setTimeRemaining(timeLimit)
      }
      
    } catch (error) {
      console.error('Failed to load fresh questions:', error)
      toast({
        title: "Error",
        description: "Failed to load questions. Please try again.",
        variant: "destructive"
      })
      router.push('/practice')
    } finally {
      setIsLoading(false)
    }
  }, [router, toast, pickNextQuestion])

  /**
   * Load the same questions from the previous session for retry
   */
  const loadRetryQuestions = useCallback(async (supabase: any, sessionData: PracticeSession) => {
    try {
      // Get question IDs from previous attempts in this session
      const { data: attempts, error: attemptsError } = await supabase
        .from('question_attempts')
        .select('question_id')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })

      if (attemptsError || !attempts || attempts.length === 0) {
        console.error('No previous attempts found for retry:', attemptsError)
        // Fall back to new questions
        await loadFreshQuestions(sessionData)
        return
      }

      // Get unique question IDs preserving order
      const questionIds = Array.from(new Set<string>(attempts.map((a: any) => a.question_id)))

      // Load full question data
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .in('id', questionIds)

      if (questionsError || !questions || questions.length === 0) {
        console.error('Error loading retry questions:', questionsError)
        await loadFreshQuestions(sessionData)
        return
      }

      // Sort questions to match original order
      const orderedQuestions = questionIds
        .map((id: string) => questions.find((q: any) => q.id === id))
        .filter(Boolean) as Question[]

      // Set up the session with these questions
      setSessionQuestions(orderedQuestions)
      setQuestionPool(orderedQuestions)
      setCurrentQuestion(orderedQuestions[0])
      setQuestionStartTime(Date.now())
      
      // Mark all as used (they will be shown in order)
      const usedIds = new Set(orderedQuestions.map(q => q.id))
      const usedTexts = new Set(orderedQuestions.map(q => q.question_text.toLowerCase().trim()))
      setUsedQuestionIds(usedIds)
      setUsedQuestionTexts(usedTexts)
      
      toast({
        title: "Practice Again",
        description: `Retrying ${orderedQuestions.length} questions from your previous session.`,
        duration: 3000,
      })
      
    } catch (error) {
      console.error('Failed to load retry questions:', error)
      await loadFreshQuestions(sessionData)
    } finally {
      setIsLoading(false)
    }
  }, [sessionId, loadFreshQuestions, toast])

  /**
   * Load session details and questions
   */
  const loadSession = useCallback(async () => {
    if (hasLoadedRef.current) return
    hasLoadedRef.current = true
    
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

      setSession(sessionData as PracticeSession)
      setChildId(sessionData.child_id)
      
      // Check if this is a retry - load from the session we're retrying
      if (retryFromSession === 'true') {
        await loadRetryQuestions(supabase, sessionData as PracticeSession)
      } else {
        // New session - load fresh questions from API
        await loadFreshQuestions(sessionData as PracticeSession)
      }
      
    } catch (error) {
      console.error('Failed to load session:', error)
      router.push('/practice')
    }
  }, [sessionId, retryFromSession, router, loadFreshQuestions, loadRetryQuestions])

  // Load session on mount
  useEffect(() => {
    if (!sessionId) return
    loadSession()
  }, [sessionId, loadSession])

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
    
    // For retry mode, questions are in fixed order
    if (retryFromSession === 'true') {
      const nextIndex = questionsAnswered
      if (nextIndex < sessionQuestions.length) {
        setCurrentQuestion(sessionQuestions[nextIndex])
        setQuestionStartTime(Date.now())
      } else {
        handleFinishSession()
      }
      return
    }
    
    // For new session, pick next from pool
    const nextQuestion = pickNextQuestion(
      questionPool,
      usedQuestionIds,
      usedQuestionTexts,
      lastSubjectRef.current
    )
    
    if (nextQuestion) {
      setCurrentQuestion(nextQuestion)
      setSessionQuestions(prev => [...prev, nextQuestion])
      setUsedQuestionIds(prev => new Set([...prev, nextQuestion.id]))
      setUsedQuestionTexts(prev => new Set([...prev, nextQuestion.question_text.toLowerCase().trim()]))
      lastSubjectRef.current = nextQuestion.subject.toLowerCase()
      setQuestionStartTime(Date.now())
    } else {
      // No more questions available - this shouldn't happen with 10x pool
      console.warn('Question pool exhausted')
      handleFinishSession()
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

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading practice session...</p>
        </div>
      </div>
    )
  }

  // No session or question
  if (!session || !currentQuestion) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 mb-4">
          Session not found or no questions available.
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

  // Format subject for display
  const formatSubjectName = (subject: string): string => {
    return subject
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  // Get display subject based on session type:
  // - Quick practice: Always "Mixed Subjects" (intentionally mixed)
  // - Focus practice: Show session subject, or fall back to current question
  // - Mock test: Always "Mixed Subjects" (covers all subjects)
  const displaySubject = session.subject 
    ? formatSubjectName(session.subject)
    : (session.session_type === 'quick' || session.session_type === 'mock')
      ? 'Mixed Subjects'
      : currentQuestion?.subject 
        ? formatSubjectName(currentQuestion.subject)
        : 'Mixed Subjects'
  
  // Get display topic if available (only for focus sessions with explicit topic)
  const displayTopic = session.session_type === 'focus' 
    ? (session.topic || currentQuestion?.topic)
    : null

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {session.session_type.charAt(0).toUpperCase() + session.session_type.slice(1)} Practice
          </h1>
          <p className="text-slate-600">
            {displaySubject}
            {displayTopic && ` • ${displayTopic}`}
            {retryFromSession === 'true' && ' (Retry)'}
          </p>
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
      
      {/* Subject indicator */}
      <div className="flex items-center gap-2 text-sm">
        <Badge variant="outline" className="capitalize">
          {currentQuestion.subject}
        </Badge>
        <Badge variant="secondary" className="capitalize">
          {currentQuestion.difficulty}
        </Badge>
        {currentQuestion.topic && (
          <span className="text-slate-600">• {currentQuestion.topic}</span>
        )}
      </div>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
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

          {/* Result feedback + Next Button */}
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

          {/* Submit Answer button */}
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

          {/* Enhanced Explanation Panel with AI Generation */}
          {hasSubmitted && (
            <EnhancedExplanationPanel
              questionId={currentQuestion.id}
              explanations={{
                stepByStep: currentQuestion.explanations?.step_by_step || null,
                visual: currentQuestion.explanations?.visual || null,
                workedExample: currentQuestion.explanations?.worked_example || null
              }}
              isCorrect={selectedAnswer === currentQuestion.correct_answer}
              questionText={currentQuestion.question_text}
              correctAnswer={currentQuestion.correct_answer}
              topic={currentQuestion.topic || currentQuestion.subject}
              difficulty={currentQuestion.difficulty as 'Foundation' | 'Standard' | 'Challenge'}
            />
          )}
        </CardContent>
      </Card>

      {/* Provenance Panel */}
      <ProvenancePanel
        isOpen={showProvenancePanel}
        onClose={() => setShowProvenancePanel(false)}
        questionId={currentQuestion.id}
        questionData={{
          subject: currentQuestion.subject,
          topic: currentQuestion.topic || 'General',
          emberScore: currentQuestion.ember_score,
          curriculumReference: currentQuestion.curriculum_reference || undefined,
          createdAt: new Date(),
        }}
      />
    </div>
  )
}
