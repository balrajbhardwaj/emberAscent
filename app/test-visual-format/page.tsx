/**
 * Visual Format Test Page
 * 
 * Demonstrates the TARGET format for visual illustrations
 * using colored LEGO blocks and intuitive diagrams.
 * 
 * Use this as reference to finalize the Claude prompt.
 */

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export default function TestVisualFormatPage() {
  const [activeExample, setActiveExample] = useState<'subtraction' | 'division' | 'fraction'>('subtraction')

  // Example: 47 - 26 = 21
  const subtractionVisual = `🟦🟦🟦🟦 🟦🟦🟦🟦 🟦🟦  (4 tens + 7 ones = 47)
🟦🟦🟦🟦 🟦🟦🟦   🔴🔴🔴🔴🔴🔴🔴  

We need to take away 26:
🟦🟦 🟦🟦🟦🟦 = 2 tens + 6 ones

Cross out 2 tens and 6 ones:
🟦🟦❌❌ 🟦🟦🟦🟦 ❌❌❌❌❌❌ 🔴

What's left:
🟦🟦 🟦🟦🟦🟦🟦🟦🟦🟦 🔴 = 2 tens + 1 one = 21`

  // Example: 24 ÷ 6 = 4
  const divisionVisual = `We have 24 blocks: 🟩🟩🟩🟩🟩🟩 🟩🟩🟩🟩🟩🟩 🟩🟩🟩🟩🟩🟩 🟩🟩🟩🟩🟩🟩

Divide into groups of 6:

Group 1: 🟩🟩🟩🟩🟩🟩  ✓
Group 2: 🟩🟩🟩🟩🟩🟩  ✓
Group 3: 🟩🟩🟩🟩🟩🟩  ✓
Group 4: 🟩🟩🟩🟩🟩🟩  ✓

We made 4 groups! So 24 ÷ 6 = 4`

  // Example: 3/4 + 1/4 = 4/4 = 1
  const fractionVisual = `Pizza 1 (3/4 eaten):
┌─────┬─────┐
│ 🍕  │ 🍕  │  3 slices eaten
├─────┼─────┤
│ 🍕  │ ⬜  │  1 slice left
└─────┴─────┘

Pizza 2 (1/4 eaten):
┌─────┬─────┐
│ 🍕  │ ⬜  │  1 slice eaten
├─────┼─────┤
│ ⬜  │ ⬜  │  3 slices left
└─────┴─────┘

Total eaten: 🍕🍕🍕 + 🍕 = 🍕🍕🍕🍕 = 4/4 = 1 whole pizza!`

  const examples = {
    subtraction: {
      title: 'Subtraction (47 - 26)',
      visual: subtractionVisual,
      description: 'Using colored blocks to show tens and ones, with crossing out'
    },
    division: {
      title: 'Division (24 ÷ 6)',
      visual: divisionVisual,
      description: 'Using LEGO blocks grouped together with checkmarks'
    },
    fraction: {
      title: 'Fractions (3/4 + 1/4)',
      visual: fractionVisual,
      description: 'Using pizza slices in ASCII box grid'
    }
  }

  const currentExample = examples[activeExample]

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">🎨 Visual Format Examples</h1>
        <p className="text-muted-foreground">
          Reference designs for Claude AI to generate intuitive visual illustrations
        </p>
      </div>

      {/* Example Selector */}
      <div className="flex gap-2">
        <Button 
          variant={activeExample === 'subtraction' ? 'default' : 'outline'}
          onClick={() => setActiveExample('subtraction')}
        >
          Subtraction
        </Button>
        <Button 
          variant={activeExample === 'division' ? 'default' : 'outline'}
          onClick={() => setActiveExample('division')}
        >
          Division
        </Button>
        <Button 
          variant={activeExample === 'fraction' ? 'default' : 'outline'}
          onClick={() => setActiveExample('fraction')}
        >
          Fractions
        </Button>
      </div>

      {/* Visual Display */}
      <Card>
        <CardHeader>
          <CardTitle>{currentExample.title}</CardTitle>
          <CardDescription>{currentExample.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border-2 border-blue-200">
            <pre className="text-base text-slate-800 whitespace-pre-wrap font-mono leading-relaxed">
              {currentExample.visual}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Design Principles */}
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader>
          <CardTitle className="text-purple-900">Design Principles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <h3 className="font-semibold text-purple-800 mb-2">1. Use Colored Emojis/Blocks</h3>
            <div className="space-y-1 text-purple-700">
              <p>• 🟦 Blue squares = Tens (base-10 blocks)</p>
              <p>• 🟩 Green squares = Items to count/divide</p>
              <p>• 🟨 Yellow squares = Hundreds</p>
              <p>• 🟥 Red squares = Ones/singles</p>
              <p>• 🟪 Purple squares = Fractions</p>
              <p>• ⬜ White squares = Empty/taken away</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-purple-800 mb-2">2. Show Grouping Clearly</h3>
            <p className="text-purple-700">Use spaces between groups of 5 or 10 for easy counting</p>
          </div>

          <div>
            <h3 className="font-semibold text-purple-800 mb-2">3. Use Simple ASCII Borders</h3>
            <div className="space-y-1 text-purple-700">
              <p>• Box characters: ┌ ─ ┐ │ ├ ┤ └ ┘ ┬ ┴ ┼</p>
              <p>• Arrows: → ← ↑ ↓</p>
              <p>• Checkmarks: ✓ ✗ ❌</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-purple-800 mb-2">4. Label Each Section</h3>
            <p className="text-purple-700">Add short labels like "Group 1:", "What's left:", "Total:"</p>
          </div>

          <div>
            <h3 className="font-semibold text-purple-800 mb-2">5. Topic-Specific Emojis</h3>
            <div className="space-y-1 text-purple-700">
              <p>• Arithmetic: 🟦 blocks, 🔢 numbers</p>
              <p>• Fractions: 🍕 pizza, 🍰 cake, 🎂 pie</p>
              <p>• Measurement: 📏 ruler, ⚖️ scale, ⏰ clock</p>
              <p>• Money: 💷 pound, 💰 coins</p>
              <p>• Geometry: ⬛ square, 🔺 triangle, ⭕ circle</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prompt Template Preview */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-900">Updated Prompt Template</CardTitle>
          <CardDescription>Based on these examples, here's the improved prompt structure</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-white p-4 rounded border border-green-300 font-mono text-xs space-y-2">
            <p className="text-green-800 font-bold">2. **Visual Illustration**:</p>
            <p className="text-slate-700 ml-4">Create a VISUAL DIAGRAM using colored emoji blocks and ASCII art:</p>
            <ul className="ml-8 space-y-1 text-slate-600">
              <li>• Use colored squares: 🟦 (tens), 🟩 (items), 🟥 (ones), 🟨 (hundreds)</li>
              <li>• Show grouping with spaces between every 5-10 items</li>
              <li>• Use topic-specific emojis: 🍕 for fractions, 💷 for money, 📏 for measurement</li>
              <li>• Add ASCII borders for grids: ┌─┬─┐ │ │ └─┴─┘</li>
              <li>• Include arrows (→ ← ↑ ↓) to show flow</li>
              <li>• Label each section clearly</li>
              <li>• Use ✓ or ❌ to show checked/crossed items</li>
            </ul>
            <p className="text-slate-700 ml-4 mt-2">Must be a visual diagram, NOT a text description!</p>
          </div>
        </CardContent>
      </Card>

      {/* Clear Cache Button */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-amber-900">Testing Cache</h3>
              <p className="text-sm text-amber-700">Explanations are cached in localStorage to avoid repeated API calls</p>
            </div>
            <Button 
              variant="outline"
              onClick={() => {
                localStorage.clear()
                alert('Cache cleared! Next generation will call the API.')
              }}
            >
              Clear Cache
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
