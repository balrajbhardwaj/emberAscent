'use client'

import { useMemo, useState, useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Flame, Pencil, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { BulkActions } from './BulkActions'
import { cn } from '@/lib/utils'

interface QuestionTableProps {
  questions: any[]
  total: number
  page: number
  pageSize: number
}

export function QuestionTable({ questions, total, page, pageSize }: QuestionTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const pageCount = useMemo(() => Math.ceil(total / pageSize), [total, pageSize])

  const toggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(questions.map((q) => q.id))
    } else {
      setSelectedIds([])
    }
  }

  const toggleSingle = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]))
  }

  const updatePage = (targetPage: number) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()))
    params.set('page', targetPage.toString())
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  return (
    <div className="space-y-4">
      <BulkActions selectedIds={selectedIds} clearSelection={() => setSelectedIds([])} />

      <div className="rounded-xl border border-slate-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedIds.length === questions.length && questions.length > 0}
                  onCheckedChange={(checked) => toggleAll(Boolean(checked))}
                />
              </TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Subject / Topic</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Ember score</TableHead>
              <TableHead>Review status</TableHead>
              <TableHead>Published</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questions.map((question) => (
              <TableRow key={question.id} className={cn(!question.is_published && 'opacity-70')}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(question.id)}
                    onCheckedChange={() => toggleSingle(question.id)}
                  />
                </TableCell>
                <TableCell>
                  <p className="text-xs font-mono text-slate-500">{question.id.slice(0, 8)}…</p>
                  <p className="text-sm text-slate-900 line-clamp-1">{question.question_text}</p>
                </TableCell>
                <TableCell>
                  <p className="text-sm font-medium capitalize text-slate-900">{question.subject}</p>
                  <p className="text-xs text-slate-500">{question.topic}</p>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {question.difficulty}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm font-semibold">
                    <Flame className="h-4 w-4 text-amber-500" />
                    {question.ember_score ?? '—'}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="capitalize">
                    {question.review_status?.replace('_', ' ') || 'unknown'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className={cn('text-xs font-semibold', question.is_published ? 'text-emerald-600' : 'text-slate-400')}>
                    {question.is_published ? 'Published' : 'Draft'}
                  </span>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button asChild size="icon" variant="ghost">
                    <Link href={`/admin/questions/${question.id}`} aria-label="Edit question">
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild size="icon" variant="ghost">
                    <Link href={`/practice/question/${question.id}`} aria-label="View live question">
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {questions.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-sm text-slate-500">
                  No questions match this filter set.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
        </p>
        <div className="space-x-2">
          <Button variant="outline" size="sm" disabled={page <= 1 || isPending} onClick={() => updatePage(page - 1)}>
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pageCount || isPending}
            onClick={() => updatePage(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
