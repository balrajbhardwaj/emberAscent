'use client'

import { useTransition } from 'react'
import {
  useForm,
  type SubmitHandler,
} from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { createQuestion, updateQuestion } from '@/app/admin/questions/actions'
import { useAdminAuth } from '@/hooks/useAdminAuth'

const schema = z.object({
  subject: z.string().min(2),
  topic: z.string().min(2),
  difficulty: z.enum(['foundation', 'standard', 'challenge']),
  questionText: z.string().min(10),
  optionA: z.string().min(1),
  optionB: z.string().min(1),
  optionC: z.string().min(1),
  optionD: z.string().min(1),
  optionE: z.string().optional(),
  correctAnswer: z.enum(['A', 'B', 'C', 'D', 'E']),
  yearGroup: z.number().min(3).max(6).optional(),
  curriculumReference: z.string().optional(),
  examBoard: z.string().optional(),
  emberScore: z.number().min(0).max(100),
  isPublished: z.boolean().optional(),
})

type FormValues = z.infer<typeof schema>

interface QuestionFormProps {
  mode: 'create' | 'edit'
  questionId?: string
  initialValues?: Partial<FormValues>
}

export function QuestionForm({ mode, questionId, initialValues }: QuestionFormProps) {
  const { user } = useAdminAuth()
  const [isPending, startTransition] = useTransition()
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      subject: initialValues?.subject || 'english',
      topic: initialValues?.topic || '',
      difficulty: (initialValues?.difficulty as FormValues['difficulty']) || 'standard',
      questionText: initialValues?.questionText || '',
      optionA: initialValues?.optionA || '',
      optionB: initialValues?.optionB || '',
      optionC: initialValues?.optionC || '',
      optionD: initialValues?.optionD || '',
      optionE: initialValues?.optionE || '',
      correctAnswer: (initialValues?.correctAnswer as FormValues['correctAnswer']) || 'A',
      yearGroup: initialValues?.yearGroup,
      curriculumReference: initialValues?.curriculumReference,
      examBoard: initialValues?.examBoard,
      emberScore: initialValues?.emberScore ?? 70,
      isPublished: initialValues?.isPublished ?? false,
    },
  })

  const onSubmit: SubmitHandler<FormValues> = (values) => {
    const payload = {
      subject: values.subject,
      topic: values.topic,
      difficulty: values.difficulty,
      question_text: values.questionText,
      options: [
        { id: 'A', text: values.optionA },
        { id: 'B', text: values.optionB },
        { id: 'C', text: values.optionC },
        { id: 'D', text: values.optionD },
        ...(values.optionE ? [{ id: 'E', text: values.optionE }] : []),
      ],
      correct_answer: values.correctAnswer,
      explanations: {
        step_by_step: 'Explain how to solve this question…',
        visual_analogy: 'Visual explanation placeholder',
        worked_example: 'Worked example placeholder',
      },
      year_group: values.yearGroup ?? null,
      curriculum_reference: values.curriculumReference ?? null,
      exam_board: values.examBoard ?? 'generic',
      ember_score: values.emberScore,
      is_published: values.isPublished ?? false,
    }

    startTransition(async () => {
      const result =
        mode === 'create'
          ? await createQuestion(payload, user.id)
          : await updateQuestion(questionId!, payload, user.id)

      if (!result.success) {
        toast.error(result.error ?? 'Something went wrong')
      } else {
        toast.success(mode === 'create' ? 'Question created' : 'Question updated')
        form.reset()
      }
    })
  }

  return (
    <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Subject</Label>
          <Input {...form.register('subject')} />
        </div>
        <div>
          <Label>Topic</Label>
          <Input {...form.register('topic')} />
        </div>
        <div>
          <Label>Difficulty</Label>
          <Input {...form.register('difficulty')} />
        </div>
        <div>
          <Label>Year group</Label>
          <Input type="number" {...form.register('yearGroup')} />
        </div>
      </div>

      <div>
        <Label>Question text</Label>
        <Textarea rows={5} {...form.register('questionText')} />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {['optionA', 'optionB', 'optionC', 'optionD', 'optionE'].map((field, index) => (
          <div key={field}>
            <Label>Option {String.fromCharCode(65 + index)}</Label>
            <Textarea rows={2} {...form.register(field as keyof FormValues)} />
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <Label>Correct answer (A-E)</Label>
          <Input maxLength={1} {...form.register('correctAnswer')} />
        </div>
        <div>
          <Label>Curriculum reference</Label>
          <Input {...form.register('curriculumReference')} />
        </div>
        <div>
          <Label>Exam board</Label>
          <Input {...form.register('examBoard')} />
        </div>
        <div>
          <Label>Ember score (0-100)</Label>
          <Input type="number" {...form.register('emberScore')} />
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div>
          <p className="text-sm font-medium text-slate-800">Publish immediately</p>
          <p className="text-xs text-slate-500">Only if score ≥ 60 and reviewed</p>
        </div>
        <Switch
          checked={form.watch('isPublished') ?? false}
          onCheckedChange={(value) => form.setValue('isPublished', value)}
        />
      </div>

      <Button type="submit" disabled={isPending}>
        {mode === 'create' ? 'Create question' : 'Save changes'}
      </Button>
    </form>
  )
}
