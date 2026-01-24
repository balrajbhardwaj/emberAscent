/**
 * Import Progress Indicator
 *
 * Shows a quick summary of how many questions have been inserted during
 * an admin import run and surfaces validation/import errors inline.
 */

interface ImportProgressProps {
  inserted: number
  total: number
  errors: string[]
}

export function ImportProgress({ inserted, total, errors }: ImportProgressProps) {
  const percentage = total > 0 ? Math.round((inserted / total) * 100) : 0
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
      <p className="font-semibold text-slate-800">Import progress</p>
      <p className="mt-1 text-slate-600">
        Inserted {inserted} of {total} ({percentage}%)
      </p>
      {errors.length > 0 && (
        <div className="mt-3 rounded border border-rose-100 bg-rose-50 p-2 text-xs text-rose-700">
          {errors.map((error, index) => (
            <p key={`${error}-${index}`}>{error}</p>
          ))}
        </div>
      )}
    </div>
  )
}
