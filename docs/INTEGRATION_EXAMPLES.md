/**
 * Integration Example: Enhanced Explanation Panel
 * 
 * This example shows how to integrate the new AI-powered explanation panel
 * into existing practice session components.
 * 
 * Before: Old explanation panel with only step-by-step
 * After: Enhanced panel with 3 explanation types + AI generation
 */

// OPTION 1: Drop-in replacement for SessionQuestion component
// Replace the inline explanation panel in SessionQuestion.tsx

// OLD CODE (lines ~655-685 in session/[sessionId]/page.tsx):
/*
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
      </div>
    </div>
  </div>
)}
*/

// NEW CODE:
import { EnhancedExplanationPanel } from '@/components/practice/EnhancedExplanationPanel'

// In your component JSX:
/*
{hasSubmitted && (
  <EnhancedExplanationPanel
    questionId={currentQuestion.id}
    explanations={{
      stepByStep: currentQuestion.explanations?.step_by_step,
      visual: currentQuestion.explanations?.visual,
      workedExample: currentQuestion.explanations?.worked_example
    }}
    isCorrect={selectedAnswer === currentQuestion.correct_answer}
    onExplanationsUpdated={(updated) => {
      // Update local state when AI generates new explanations
      setCurrentQuestion({
        ...currentQuestion,
        explanations: {
          step_by_step: updated.stepByStep || null,
          visual: updated.visual || null,
          worked_example: updated.workedExample || null
        }
      })
    }}
  />
)}
*/

// ============================================================================

// OPTION 2: Update SessionQuestion component directly
// File: components/practice/SessionQuestion.tsx

// 1. Add import at top:
import { EnhancedExplanationPanel } from './EnhancedExplanationPanel'

// 2. Update the explanation section (replace lines ~227-252):

// OLD:
/*
{isAnswered && showExplanation && (
  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-3">
    <div className="flex items-center gap-2 text-blue-800">
      <span className="text-lg">💡</span>
      <h4 className="font-semibold">Explanation</h4>
    </div>
    <div className="space-y-4 text-slate-700">
      {question.explanations.stepByStep && (
        <div>
          <p className="text-sm font-medium text-slate-600 mb-1">Step by Step:</p>
          <p className="text-sm whitespace-pre-wrap">{question.explanations.stepByStep}</p>
        </div>
      )}
    </div>
  </div>
)}
*/

// NEW:
/*
{isAnswered && showExplanation && (
  <EnhancedExplanationPanel
    questionId={question.id}
    explanations={{
      stepByStep: question.explanations.stepByStep,
      visual: question.explanations.visual,
      workedExample: question.explanations.example
    }}
    isCorrect={question.options.find(o => o.id === selectedAnswer)?.id === 
               question.options.find(o => o.correct)?.id}
  />
)}
*/

// ============================================================================

// OPTION 3: Update the current practice session page
// File: app/(dashboard)/practice/session/[sessionId]/page.tsx

// Find the explanation panel section (around line 655) and replace:

// Step 1: Add import at top
import { EnhancedExplanationPanel } from '@/components/practice/EnhancedExplanationPanel'

// Step 2: Add state for managing explanation updates (near other useState calls)
const [updatedExplanations, setUpdatedExplanations] = useState<{[key: string]: any}>({})

// Step 3: Replace the old explanation panel with:
/*
{hasSubmitted && (
  <EnhancedExplanationPanel
    questionId={currentQuestion.id}
    explanations={{
      stepByStep: updatedExplanations[currentQuestion.id]?.step_by_step || 
                  currentQuestion.explanations?.step_by_step,
      visual: updatedExplanations[currentQuestion.id]?.visual || 
              currentQuestion.explanations?.visual,
      workedExample: updatedExplanations[currentQuestion.id]?.worked_example || 
                     currentQuestion.explanations?.worked_example
    }}
    isCorrect={selectedAnswer === currentQuestion.correct_answer}
    onExplanationsUpdated={(updated) => {
      setUpdatedExplanations(prev => ({
        ...prev,
        [currentQuestion.id]: {
          step_by_step: updated.stepByStep,
          visual: updated.visual,
          worked_example: updated.workedExample
        }
      }))
    }}
  />
)}
*/

// ============================================================================

// VALIDATION PIPELINE INTEGRATION EXAMPLE

// For content generation scripts that use Claude API:
// File: scripts/generate-y5-questions.ts (or similar)

import { validateBatch } from '@/lib/validation'
import { createClient } from '@/lib/supabase/admin'

async function generateAndValidateQuestions() {
  // 1. Generate questions using Claude API (existing code)
  const generatedQuestions = await claudeAPI.generateQuestions(...)
  
  // 2. Validate all questions before inserting
  console.log('Validating generated questions...')
  const { passed, failed, auto_corrected } = await validateBatch(generatedQuestions)
  
  console.log(`✅ Passed: ${passed.length}`)
  console.log(`❌ Failed: ${failed.length}`)
  console.log(`🔧 Auto-corrected: ${auto_corrected}`)
  
  // 3. Insert only validated questions
  const supabase = createClient()
  if (passed.length > 0) {
    const { error } = await supabase
      .from('questions')
      .insert(passed)
    
    if (error) {
      console.error('Insert error:', error)
    } else {
      console.log(`✅ Inserted ${passed.length} validated questions`)
    }
  }
  
  // 4. Report failed questions for manual review
  if (failed.length > 0) {
    console.log('\n❌ FAILED VALIDATIONS:\n')
    for (const failure of failed) {
      console.log(`Question ID: ${failure.question_id}`)
      for (const error of failure.errors) {
        console.log(`  • ${error.code}: ${error.message}`)
        if (error.suggested_fix) {
          console.log(`    💡 Fix: ${error.suggested_fix}`)
        }
      }
      console.log('')
    }
  }
}

// ============================================================================

// API VALIDATION ENDPOINT USAGE

// Use in admin dashboard or content management scripts:

async function validateQuestionBeforeApproval(questionId: string) {
  // Fetch question from database
  const question = await fetchQuestion(questionId)
  
  // Validate via API
  const response = await fetch('/api/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question })
  })
  
  const result = await response.json()
  
  if (result.success && result.result.passed) {
    console.log('✅ Question passed validation')
    // Approve for production
  } else {
    console.log('❌ Validation failed:', result.result.errors)
    // Send to review queue
  }
}

// ============================================================================

// MONITORING VALIDATION STATS

async function checkValidationHealth() {
  const response = await fetch('/api/validate')
  const { stats } = await response.json()
  
  console.log(`
Validation Statistics (Last 7 Days):
=====================================
Total Validations: ${stats.total_validations}
Pass Rate: ${stats.pass_rate}%
Needs Review: ${stats.needs_review}
Auto-corrected: ${stats.auto_corrected_count}
  `)
  
  if (stats.pass_rate < 90) {
    console.warn('⚠️  Pass rate below 90% - review generation prompts')
  }
}

export {}
