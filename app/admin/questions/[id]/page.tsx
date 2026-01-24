/**
 * Question detail + edit route
 */
import { notFound } from 'next/navigation'
import { QuestionForm } from '@/components/admin/questions/QuestionForm'
import { QuestionPreview } from '@/components/admin/questions/QuestionPreview'
import { getQuestion } from '../actions'

interface QuestionDetailPageProps {
  params: { id: string }
}

export default async function QuestionDetailPage({ params }: QuestionDetailPageProps) {
  const question = await getQuestion(params.id)

  if (!question) {
    notFound()
  }

  const optionText = (label: string) => {
    const entry = (question.options || []).find((option: any) => option.id === label)
    return entry?.text ?? ''
  }

  const initialValues = {
    subject: question.subject,
    topic: question.topic,
    difficulty: question.difficulty,
    questionText: question.question_text,
    optionA: optionText('A'),
    optionB: optionText('B'),
    optionC: optionText('C'),
    optionD: optionText('D'),
    optionE: optionText('E'),
    correctAnswer: question.correct_answer,
    yearGroup: question.year_group,
    curriculumReference: question.curriculum_reference,
    examBoard: question.exam_board,
    emberScore: question.ember_score,
    isPublished: question.is_published,
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-xl font-semibold text-slate-900">Edit question</h1>
        <p className="text-sm text-slate-500">Question ID: {question.id}</p>
        <div className="mt-6">
          <QuestionForm mode="edit" questionId={question.id} initialValues={initialValues as any} />
        </div>
      </div>

      <QuestionPreview question={question} />
    </div>
  )
}
