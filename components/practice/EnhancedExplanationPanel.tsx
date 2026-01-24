/**
 * Enhanced Explanation Panel Component
 * 
 * Displays question explanations in three modes:
 * 1. Step-by-Step: Procedural breakdown
 * 2. Visual: Conceptual/illustrated explanation
 * 3. Example: Worked example with similar problem
 * 
 * Features:
 * - Tab-based interface for switching modes
 * - AI generation on-demand if explanations missing
 * - Loading states and error handling
 * - Preference persistence (localStorage)
 * 
 * @module components/practice/EnhancedExplanationPanel
 */

"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Lightbulb, ListOrdered, Eye, BookOpen, Loader2, Sparkles } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export interface ExplanationData {
  stepByStep?: string | null
  visual?: string | null
  workedExample?: string | null
}

export interface EnhancedExplanationPanelProps {
  questionId: string
  explanations: ExplanationData
  isCorrect: boolean
  // Optional: Provide question context for testing/fallback
  questionText?: string
  correctAnswer?: string
  topic?: string
  difficulty?: 'Foundation' | 'Standard' | 'Challenge'
  onExplanationsUpdated?: (explanations: ExplanationData) => void
}

type ExplanationType = 'step-by-step' | 'visual' | 'example'

/**
 * Enhanced Explanation Panel with AI-generated content
 * 
 * Shows three types of explanations in a tabbed interface.
 * Automatically generates missing explanations using Claude AI.
 */
export function EnhancedExplanationPanel({
  questionId,
  explanations,
  isCorrect,
  questionText,
  correctAnswer,
  topic,
  difficulty,
  onExplanationsUpdated
}: EnhancedExplanationPanelProps) {
  const [activeTab, setActiveTab] = useState<ExplanationType>('step-by-step')
  const [generatedExplanations, setGeneratedExplanations] = useState<ExplanationData>(explanations)
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasRequestedGeneration, setHasRequestedGeneration] = useState(false)
  const { toast } = useToast()

  // Load preferred explanation mode from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('preferred-explanation-mode')
    if (saved && ['step-by-step', 'visual', 'example'].includes(saved)) {
      setActiveTab(saved as ExplanationType)
    }
  }, [])

  // Save preferred mode when changed
  const handleTabChange = (value: string) => {
    setActiveTab(value as ExplanationType)
    localStorage.setItem('preferred-explanation-mode', value)
  }

  // Determine which explanations are missing
  const missingExplanations = {
    stepByStep: !generatedExplanations.stepByStep,
    visual: !generatedExplanations.visual,
    workedExample: !generatedExplanations.workedExample
  }

  const hasMissingExplanations = Object.values(missingExplanations).some(missing => missing)

  /**
   * Generate missing explanations using Claude AI
   */
  const handleGenerateExplanations = async () => {
    setIsGenerating(true)
    setHasRequestedGeneration(true)

    try {
      // Check cache first (for testing - avoid repeated API calls)
      const cacheKey = `explanations_${questionId}`
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        console.log('📦 Using cached explanations')
        const cachedData = JSON.parse(cached)
        setGeneratedExplanations(cachedData)
        onExplanationsUpdated?.(cachedData)
        toast({
          title: 'Loaded from cache',
          description: 'Using previously generated explanations (clear cache to regenerate)'
        })
        setIsGenerating(false)
        return
      }

      // Build request body with question context
      const requestBody: any = { questionId }
      
      // Add optional test data if provided
      if (questionText) requestBody.questionText = questionText
      if (correctAnswer) requestBody.correctAnswer = correctAnswer
      if (topic) requestBody.topic = topic
      if (difficulty) requestBody.difficulty = difficulty
      if (generatedExplanations.stepByStep) {
        requestBody.existingExplanation = Array.isArray(generatedExplanations.stepByStep)
          ? generatedExplanations.stepByStep
          : [generatedExplanations.stepByStep]
      }

      const response = await fetch('/api/explanations/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to generate explanations')
      }

      const data = await response.json()

      if (data.success && data.explanations) {
        const updated: ExplanationData = {
          stepByStep: data.explanations.stepByStep,
          visual: data.explanations.visualIllustration,
          workedExample: data.explanations.workedExample
        }

        // Cache for testing (clear localStorage to regenerate)
        const cacheKey = `explanations_${questionId}`
        localStorage.setItem(cacheKey, JSON.stringify(updated))
        console.log('💾 Cached explanations for', questionId)

        setGeneratedExplanations(updated)
        onExplanationsUpdated?.(updated)

        toast({
          title: 'Explanations generated!',
          description: 'AI-powered explanations are now available.',
          duration: 3000
        })
      } else {
        throw new Error(data.error || 'Generation failed')
      }

    } catch (error) {
      console.error('Failed to generate explanations:', error)
      toast({
        title: 'Generation failed',
        description: 'Could not generate explanations. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card className={isCorrect ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lightbulb className={`h-5 w-5 ${isCorrect ? 'text-green-600' : 'text-amber-600'}`} />
          {isCorrect ? 'Well Done!' : 'Learn from this'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="step-by-step" className="flex items-center gap-1.5">
              <ListOrdered className="h-4 w-4" />
              <span className="hidden sm:inline">Step-by-Step</span>
              <span className="sm:hidden">Steps</span>
            </TabsTrigger>
            <TabsTrigger value="visual" className="flex items-center gap-1.5">
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Illustration</span>
              <span className="sm:hidden">Visual</span>
            </TabsTrigger>
            <TabsTrigger value="example" className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Example</span>
              <span className="sm:hidden">Example</span>
            </TabsTrigger>
          </TabsList>

          {/* Step-by-Step Tab */}
          <TabsContent value="step-by-step" className="mt-4">
            {generatedExplanations.stepByStep ? (
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-600 mb-3">Follow these steps:</p>
                <div className="space-y-3">
                  {(Array.isArray(generatedExplanations.stepByStep) 
                    ? generatedExplanations.stepByStep 
                    : generatedExplanations.stepByStep.split(/\n/)
                  ).map((step, idx) => {
                    const stepText = typeof step === 'string' ? step : String(step)
                    if (!stepText.trim()) return null
                    const isStep = stepText.trim().match(/^Step \d+:/i)
                    
                    return (
                      <div key={idx} className="flex gap-3">
                        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold">
                          {idx + 1}
                        </div>
                        <p className="text-sm text-slate-700 flex-1 pt-0.5">
                          {isStep ? stepText.replace(/^Step \d+:\s*/i, '') : stepText}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <ExplanationPlaceholder
                type="Step-by-step explanation"
                onGenerate={handleGenerateExplanations}
                isGenerating={isGenerating}
                hasRequested={hasRequestedGeneration}
              />
            )}
          </TabsContent>

          {/* Visual Illustration Tab */}
          <TabsContent value="visual" className="mt-4">
            {generatedExplanations.visual ? (
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-600 mb-3">Visual Diagram:</p>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border-2 border-blue-200">
                  <pre className="text-sm text-slate-800 whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto">
                    {generatedExplanations.visual}
                  </pre>
                </div>
              </div>
            ) : (
              <ExplanationPlaceholder
                type="Visual illustration"
                onGenerate={handleGenerateExplanations}
                isGenerating={isGenerating}
                hasRequested={hasRequestedGeneration}
              />
            )}
          </TabsContent>

          {/* Worked Example Tab */}
          <TabsContent value="example" className="mt-4">
            {generatedExplanations.workedExample ? (
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-600 mb-3">Similar Example with Color Mapping:</p>
                <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border-2 border-amber-200 space-y-3">
                  {generatedExplanations.workedExample.split(/\n\n/).map((paragraph, idx) => (
                    <div key={idx} className="text-sm leading-relaxed">
                      {paragraph.split(/\n/).map((line, lineIdx) => {
                        // Style lines starting with color markers
                        const isColorLine = line.match(/[🔵🟢🟡🔴🟣🟠]/)
                        return (
                          <p key={lineIdx} className={`${
                            line.startsWith('Problem:') ? 'font-bold text-purple-700 text-base mb-2' :
                            line.startsWith('Solution:') ? 'font-bold text-green-700 text-base mb-2 mt-3' :
                            line.startsWith('Answer:') ? 'font-bold text-blue-700 mt-2' :
                            isColorLine ? 'ml-4 text-slate-800' :
                            'text-slate-700'
                          }`}>
                            {line}
                          </p>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <ExplanationPlaceholder
                type="Worked example"
                onGenerate={handleGenerateExplanations}
                isGenerating={isGenerating}
                hasRequested={hasRequestedGeneration}
              />
            )}
          </TabsContent>
        </Tabs>

        {/* Generate All Button (if some missing) */}
        {hasMissingExplanations && !hasRequestedGeneration && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <Button
              onClick={handleGenerateExplanations}
              disabled={isGenerating}
              variant="outline"
              size="sm"
              className="w-full flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating explanations...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate all explanation types
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Placeholder shown when explanation type is not available
 */
function ExplanationPlaceholder({
  type,
  onGenerate,
  isGenerating,
  hasRequested
}: {
  type: string
  onGenerate: () => void
  isGenerating: boolean
  hasRequested: boolean
}) {
  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-3" />
        <p className="text-sm text-slate-600">
          Generating {type.toLowerCase()} with AI...
        </p>
        <p className="text-xs text-slate-500 mt-1">
          This may take a few seconds
        </p>
      </div>
    )
  }

  if (hasRequested) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-sm text-slate-600">
          {type} will be available shortly.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <Sparkles className="h-10 w-10 text-blue-500 mb-3" />
      <p className="text-sm text-slate-600 mb-3">
        {type} not available yet
      </p>
      <Button
        onClick={onGenerate}
        variant="default"
        size="sm"
        className="flex items-center gap-2"
      >
        <Sparkles className="h-4 w-4" />
        Generate with AI
      </Button>
    </div>
  )
}
