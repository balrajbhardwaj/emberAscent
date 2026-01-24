'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { bulkDeleteQuestions, bulkUpdateQuestions } from '@/app/admin/questions/actions'
import { useAdminAuth } from '@/hooks/useAdminAuth'

interface BulkActionsProps {
  selectedIds: string[]
  clearSelection: () => void
}

export function BulkActions({ selectedIds, clearSelection }: BulkActionsProps) {
  const { user } = useAdminAuth()
  const [isPending, startTransition] = useTransition()
  const hasSelection = selectedIds.length > 0

  const runAction = (action: () => Promise<{ success: boolean; error?: string } | { success: boolean }>) => {
    startTransition(async () => {
      const result: any = await action()
      if (!result.success) {
        toast.error(result.error ?? 'Unable to process bulk action')
      } else {
        toast.success('Bulk action applied')
        clearSelection()
      }
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm">
      <p className="text-slate-600">
        {hasSelection ? `${selectedIds.length} selected` : 'Select rows to run bulk actions'}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="secondary"
          disabled={!hasSelection || isPending}
          onClick={() =>
            runAction(() => bulkUpdateQuestions(selectedIds, { is_published: true }, user.id))
          }
        >
          Publish
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={!hasSelection || isPending}
          onClick={() =>
            runAction(() => bulkUpdateQuestions(selectedIds, { is_published: false }, user.id))
          }
        >
          Unpublish
        </Button>
        <Button
          size="sm"
          variant="destructive"
          disabled={!hasSelection || isPending}
          onClick={() => runAction(() => bulkDeleteQuestions(selectedIds, user.id))}
        >
          Remove from catalog
        </Button>
      </div>
    </div>
  )
}
