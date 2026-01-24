/**
 * Test Page for AI-Enhanced Explanation System
 * 
 * Access at: http://localhost:3000/test-explanations
 * Tests the Claude AI explanation generation feature
 */

'use client'

import { useState } from 'react'
import { EnhancedExplanationPanel } from '@/components/practice/EnhancedExplanationPanel'

export default function TestExplanationsPage() {
  const [testQuestionId, setTestQuestionId] = useState('')
  const [showPanel, setShowPanel] = useState(false)
  const [apiStatus, setApiStatus] = useState<'idle' | 'checking' | 'ok' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  // Check API endpoint health
  const checkApiHealth = async () => {
    setApiStatus('checking')
    try {
      const response = await fetch('/api/explanations/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: 'health-check',
          questionText: 'Test',
          correctAnswer: '1',
          topic: 'Test',
          difficulty: 'Foundation'
        })
      })
      
      if (response.status === 401) {
        setApiStatus('error')
        setErrorMessage('Not authenticated. Please log in first.')
      } else if (response.ok || response.status === 404) {
        // 404 is ok for health check (no question in DB)
        setApiStatus('ok')
        setErrorMessage('')
      } else {
        const data = await response.json()
        setApiStatus('error')
        setErrorMessage(data.error || 'API error')
      }
    } catch (error) {
      setApiStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Network error')
    }
  }

  // Sample question data for testing
  const sampleQuestion = {
    id: 'test-question-001',
    question_text: 'Calculate: 47 - 26 = ?',
    correct_answer: 'a',
    options: {
      a: '21',
      b: '3',
      c: '6',
      d: '13',
      e: '11'
    },
    explanations: {
      step_by_step: [
        'Start with 47',
        'Subtract 26',
        '47 - 26 = 21'
      ]
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h1 className="text-3xl font-bold text-purple-600 mb-2">
            🤖 AI Explanation Test Page
          </h1>
          <p className="text-gray-600 mb-6">
            Test the Claude AI-powered explanation generation feature
          </p>

          {/* Environment Check */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Environment Setup</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ EnhancedExplanationPanel component imported</li>
              <li>✓ API endpoint: /api/explanations/generate</li>
              <li className="mt-2">
                <button
                  onClick={checkApiHealth}
                  disabled={apiStatus === 'checking'}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50"
                >
                  {apiStatus === 'checking' ? 'Checking...' : 'Test API Connection'}
                </button>
                {apiStatus === 'ok' && <span className="ml-2 text-green-600">✓ API Ready</span>}
                {apiStatus === 'error' && <span className="ml-2 text-red-600">✗ {errorMessage}</span>}
              </li>
              <li className="text-xs text-gray-600 mt-2">
                Note: ANTHROPIC_API_KEY is checked server-side (not exposed to browser)
              </li>
            </ul>
          </div>

          {/* Instructions */}
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
            <h3 className="font-semibold text-yellow-900 mb-2">How to Test:</h3>
            <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
              <li>Make sure ANTHROPIC_API_KEY is set in .env.local</li>
              <li>Click "Load Test Question" below</li>
              <li>Wait for the explanation panel to appear</li>
              <li>Click "Generate all explanation types" button</li>
              <li>You should see AI-generated content in 2-5 seconds</li>
              <li>Switch between tabs to see different explanation styles</li>
              <li><strong>Note:</strong> Results are cached - click "Clear Cache" below to regenerate</li>
            </ol>
          </div>

          {/* Cache Management */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Cache Management</h3>
                <p className="text-sm text-blue-700">
                  Explanations are cached to avoid repeated API calls during testing
                </p>
              </div>
              <button
                onClick={() => {
                  localStorage.clear()
                  alert('✅ Cache cleared! Next generation will use new prompt templates.')
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                Clear Cache
              </button>
            </div>
          </div>

          {/* Test Controls */}
          <div className="space-y-4">
            <button
              onClick={() => setShowPanel(true)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              📚 Load Test Question
            </button>

            {showPanel && (
              <div className="mt-6">
                <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6 mb-4">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Sample Question
                  </h2>
                  <div className="bg-white p-4 rounded border border-gray-300 mb-4">
                    <p className="text-lg font-medium text-gray-700">
                      {sampleQuestion.question_text}
                    </p>
                  </div>

                  <div className="space-y-2 mb-4">
                    {Object.entries(sampleQuestion.options).map(([key, value]) => (
                      <div
                        key={key}
                        className={`p-3 rounded border ${
                          key === sampleQuestion.correct_answer
                            ? 'bg-green-100 border-green-400'
                            : 'bg-gray-50 border-gray-300'
                        }`}
                      >
                        <span className="font-semibold">{key.toUpperCase()}.</span> {value}
                        {key === sampleQuestion.correct_answer && (
                          <span className="ml-2 text-green-600 font-bold">✓ Correct</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Enhanced Explanation Panel */}
                <EnhancedExplanationPanel
                  questionId={sampleQuestion.id}
                  questionText={sampleQuestion.question_text}
                  correctAnswer={sampleQuestion.correct_answer}
                  topic="Arithmetic"
                  difficulty="Foundation"
                  explanations={{
                    stepByStep: sampleQuestion.explanations.step_by_step,
                    visual: null,
                    workedExample: null
                  }}
                  isCorrect={true}
                  onExplanationsUpdated={(updated) => {
                    console.log('✅ Explanations updated:', updated)
                  }}
                />

                {/* Debug Info */}
                <div className="mt-6 bg-gray-800 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <div className="font-bold mb-2">Debug Console:</div>
                  <div>Question ID: {sampleQuestion.id}</div>
                  <div>Check browser console (F12) for detailed logs</div>
                  <div>Check Network tab for API calls to /api/explanations/generate</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* API Test Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            🔧 Direct API Test
          </h2>
          <p className="text-gray-600 mb-4">
            Test the API endpoint directly without UI:
          </p>

          <div className="bg-gray-900 text-white p-4 rounded-lg overflow-x-auto">
            <pre className="text-sm">{`// Open browser console (F12) and paste:

fetch('/api/explanations/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    questionId: 'test-question-001',
    questionText: 'Calculate: 47 - 26 = ?',
    correctAnswer: '21',
    existingExplanation: ['Start with 47', 'Subtract 26', '47 - 26 = 21'],
    topic: 'Subtraction',
    difficulty: 'Foundation'
  })
})
.then(r => r.json())
.then(data => {
  console.log('✅ API Response:', data)
  if (data.success) {
    console.log('Step-by-Step:', data.explanations.stepByStep)
    console.log('Visual:', data.explanations.visualIllustration)
    console.log('Worked Example:', data.explanations.workedExample)
  }
})
.catch(err => console.error('❌ Error:', err))`}</pre>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="mt-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <h3 className="font-semibold text-red-900 mb-2">Troubleshooting:</h3>
          <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
            <li><strong>No response:</strong> Check ANTHROPIC_API_KEY in .env.local</li>
            <li><strong>401 Unauthorized:</strong> Make sure you're logged in</li>
            <li><strong>500 Error:</strong> Check server console for error details</li>
            <li><strong>Slow response:</strong> Normal - AI generation takes 2-5 seconds</li>
            <li><strong>Generation fails:</strong> Check Anthropic API status and rate limits</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
