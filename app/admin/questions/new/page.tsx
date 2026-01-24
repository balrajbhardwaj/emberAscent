/**
 * Create Question Page
 */
import { QuestionForm } from '@/components/admin/questions/QuestionForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function CreateQuestionPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Create new question</CardTitle>
      </CardHeader>
      <CardContent>
        <QuestionForm mode="create" />
      </CardContent>
    </Card>
  )
}
