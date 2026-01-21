require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function check() {
  // Check question subjects
  const { data: questions } = await supabase
    .from('questions')
    .select('subject')
    .limit(100)
  
  const questionSubjects = [...new Set(questions?.map(q => q.subject))]
  console.log('Question subjects in DB:', questionSubjects)

  // Check question_attempts for Emma
  const childId = 'dd25c842-e20a-44e4-96e4-34a180e7f703'
  
  const { data: attempts, error } = await supabase
    .from('question_attempts')
    .select('id, is_correct, question_id, created_at')
    .eq('child_id', childId)
    .limit(10)
  
  console.log('\nQuestion attempts for Emma:', attempts?.length, 'sample records')
  if (error) console.log('Error:', error)
  
  // Check if attempts have valid question_ids
  if (attempts && attempts.length > 0) {
    const questionIds = attempts.map(a => a.question_id)
    const { data: linkedQuestions } = await supabase
      .from('questions')
      .select('id, subject')
      .in('id', questionIds)
    
    console.log('\nLinked questions subjects:', linkedQuestions?.map(q => q.subject))
  }

  // Check practice_sessions status
  const { data: sessions } = await supabase
    .from('practice_sessions')
    .select('id, status, correct_answers, total_questions')
    .eq('child_id', childId)
    .limit(10)
  
  console.log('\nPractice sessions:', sessions?.map(s => ({ status: s.status, correct: s.correct_answers, total: s.total_questions })))
}

check().catch(console.error)
