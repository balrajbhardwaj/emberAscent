/**
 * Validation results summary box
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ValidationResultsProps {
  total: number
  valid: number
  invalidItems: { index: number; message: string }[]
}

export function ValidationResults({ total, valid, invalidItems }: ValidationResultsProps) {
  const invalid = invalidItems.length
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Validation summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p>Total questions detected: {total}</p>
        <p className="text-emerald-600">Valid rows: {valid}</p>
        <p className="text-rose-600">Invalid rows: {invalid}</p>
        {invalid > 0 && (
          <div className="max-h-48 overflow-auto rounded border border-rose-100 bg-rose-50 p-2 text-xs text-rose-700">
            {invalidItems.slice(0, 5).map((issue) => (
              <p key={issue.index}>
                Row {issue.index + 1}: {issue.message}
              </p>
            ))}
            {invalidItems.length > 5 && <p>…and more</p>}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
