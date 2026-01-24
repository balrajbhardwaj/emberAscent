'use client'

/**
 * QuestionFilters Component
 *
 * Sidebar filters that mutate the URL search params and trigger server refreshes.
 */

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'

const SUBJECT_OPTIONS = ['english', 'maths', 'verbal_reasoning']
const DIFFICULTY_OPTIONS = ['foundation', 'standard', 'challenge']
const REVIEW_STATUS_OPTIONS = ['ai_only', 'spot_checked', 'reviewed']

export function QuestionFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const activeSubjects = useMemo(() => searchParams.getAll('subject'), [searchParams])
  const activeDifficulties = useMemo(() => searchParams.getAll('difficulty'), [searchParams])
  const activeStatuses = useMemo(() => searchParams.getAll('reviewStatus'), [searchParams])
  const isPublished = searchParams.get('published') === 'true'

  const updateParams = (mutator: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()))
    mutator(params)
    router.push(`${pathname}?${params.toString()}`)
  }

  const toggleMultiValue = (key: string, value: string) => {
    updateParams((params) => {
      const values = params.getAll(key)
      params.delete(key)
      if (values.includes(value)) {
        values.filter((item) => item !== value).forEach((item) => params.append(key, item))
      } else {
        values.forEach((item) => params.append(key, item))
        params.append(key, value)
      }
      params.set('page', '1')
    })
  }

  return (
    <aside className="rounded-xl border border-slate-200 bg-white p-4 space-y-6">
      <div className="space-y-2">
        <Label htmlFor="question-search">Search text</Label>
        <Input
          id="question-search"
          placeholder="Find question text"
          defaultValue={searchParams.get('search') ?? ''}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              const value = (event.target as HTMLInputElement).value
              updateParams((params) => {
                if (value) {
                  params.set('search', value)
                } else {
                  params.delete('search')
                }
                params.set('page', '1')
              })
            }
          }}
        />
      </div>

      <section>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Subject</p>
        <div className="mt-2 space-y-2">
          {SUBJECT_OPTIONS.map((subject) => (
            <Label key={subject} className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <Checkbox
                checked={activeSubjects.includes(subject)}
                onCheckedChange={() => toggleMultiValue('subject', subject)}
              />
              <span className="capitalize">{subject.replace('_', ' ')}</span>
            </Label>
          ))}
        </div>
      </section>

      <section>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Difficulty</p>
        <div className="mt-2 space-y-2">
          {DIFFICULTY_OPTIONS.map((difficulty) => (
            <Label key={difficulty} className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <Checkbox
                checked={activeDifficulties.includes(difficulty)}
                onCheckedChange={() => toggleMultiValue('difficulty', difficulty)}
              />
              <span className="capitalize">{difficulty}</span>
            </Label>
          ))}
        </div>
      </section>

      <section>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Review status</p>
        <div className="mt-2 space-y-2">
          {REVIEW_STATUS_OPTIONS.map((status) => (
            <Label key={status} className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <Checkbox
                checked={activeStatuses.includes(status)}
                onCheckedChange={() => toggleMultiValue('reviewStatus', status)}
              />
              <span className="capitalize">{status.replace('_', ' ')}</span>
            </Label>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <Label htmlFor="min-score">Ember score range</Label>
        <div className="flex items-center gap-3">
          <Input
            id="min-score"
            type="number"
            min={0}
            max={100}
            defaultValue={searchParams.get('minScore') ?? ''}
            placeholder="Min"
            onBlur={(event) => {
              const value = event.target.value
              updateParams((params) => {
                if (value) params.set('minScore', value)
                else params.delete('minScore')
              })
            }}
          />
          <span className="text-slate-400">—</span>
          <Input
            type="number"
            min={0}
            max={100}
            defaultValue={searchParams.get('maxScore') ?? ''}
            placeholder="Max"
            onBlur={(event) => {
              const value = event.target.value
              updateParams((params) => {
                if (value) params.set('maxScore', value)
                else params.delete('maxScore')
              })
            }}
          />
        </div>
      </section>

      <section className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-700">Published only</p>
          <p className="text-xs text-slate-500">Hide drafts</p>
        </div>
        <Switch
          checked={isPublished}
          onCheckedChange={(checked) =>
            updateParams((params) => {
              if (checked) params.set('published', 'true')
              else params.delete('published')
            })
          }
        />
      </section>

      <Button
        variant="secondary"
        size="sm"
        onClick={() =>
          updateParams((params) => {
            ['subject', 'difficulty', 'reviewStatus', 'search', 'minScore', 'maxScore', 'published'].forEach((key) =>
              params.delete(key)
            )
            params.set('page', '1')
          })
        }
      >
        Reset filters
      </Button>
    </aside>
  )
}
