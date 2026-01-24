/**
 * Questions Management Page
 */
import { QuestionFilters } from '@/components/admin/questions/QuestionFilters'
import { QuestionTable } from '@/components/admin/questions/QuestionTable'
import { getQuestions } from './actions'

interface QuestionsPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function AdminQuestionsPage({ searchParams }: QuestionsPageProps) {
  const page = Number(searchParams.page ?? '1') || 1
  const pageSize = 25
  const toArray = (value: string | string[] | undefined) =>
    value ? (Array.isArray(value) ? value : [value]) : undefined

  const filters = {
    search: typeof searchParams.search === 'string' ? searchParams.search : undefined,
    subjects: toArray(searchParams.subject),
    difficulties: toArray(searchParams.difficulty),
    reviewStatuses: toArray(searchParams.reviewStatus),
    isPublished: searchParams.published ? searchParams.published === 'true' : undefined,
    minScore: searchParams.minScore ? Number(searchParams.minScore) : undefined,
    maxScore: searchParams.maxScore ? Number(searchParams.maxScore) : undefined,
  }

  const { data, count } = await getQuestions(filters, { page, pageSize })

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <QuestionFilters />
      <QuestionTable questions={data} total={count} page={page} pageSize={pageSize} />
    </div>
  )
}
