/**
 * QuestionPreview Component
 */

interface QuestionPreviewProps {
  question: any
}

export function QuestionPreview({ question }: QuestionPreviewProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">Preview</p>
      <h3 className="mt-2 text-lg font-semibold text-slate-900">{question.question_text}</h3>
      <div className="mt-4 space-y-2">
        {(question.options || []).map((option: any, idx: number) => (
          <p key={option.id ?? idx} className="flex items-start gap-2 text-sm text-slate-700">
            <span className="font-semibold text-slate-500">{option.id ?? String.fromCharCode(65 + idx)}.</span>
            {option.text ?? option}
          </p>
        ))}
      </div>
      <p className="mt-4 text-sm font-medium text-emerald-600">
        Correct answer: {question.correct_answer}
      </p>
    </div>
  )
}
