/**
 * Marketing Showcase Demo Page
 * 
 * Preview of the explainability showcase component
 * for landing page integration.
 */

import { ExplainabilityShowcase } from '@/components/marketing/ExplainabilityShowcase'

export default function MarketingDemoPage() {
  return (
    <div className="min-h-screen">
      <ExplainabilityShowcase />
      
      {/* Integration Instructions */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-slate-100 p-8 rounded-lg">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">
            📋 Integration Instructions
          </h2>
          <div className="space-y-4 text-slate-700">
            <p>
              <strong>To add this to the landing page:</strong>
            </p>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>
                Import the component:
                <code className="block mt-1 bg-white p-2 rounded text-sm">
                  import {'{ ExplainabilityShowcase }'} from '@/components/marketing/ExplainabilityShowcase'
                </code>
              </li>
              <li>
                Add it to your landing page layout:
                <code className="block mt-1 bg-white p-2 rounded text-sm">
                  {'<ExplainabilityShowcase />'}
                </code>
              </li>
              <li>
                Recommended placement: Between hero section and features/pricing
              </li>
            </ol>
            
            <div className="mt-6 pt-6 border-t border-slate-300">
              <p className="font-semibold mb-2">Component Features:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>✅ Fully responsive (mobile, tablet, desktop)</li>
                <li>✅ Animated transitions between modes</li>
                <li>✅ Ember Ascent brand colors (purple/blue gradient)</li>
                <li>✅ Interactive mode selector with hover effects</li>
                <li>✅ Real examples matching actual AI output format</li>
                <li>✅ Professional marketing copy included</li>
              </ul>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-300">
              <p className="font-semibold mb-2">Customization Options:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Change example questions in component props</li>
                <li>Adjust colors via Tailwind classes</li>
                <li>Modify copy/messaging for different audiences</li>
                <li>Add more explanation modes if needed</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
