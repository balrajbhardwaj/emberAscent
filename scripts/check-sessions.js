require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function check() {
  const childId = 'dd25c842-e20a-44e4-96e4-34a180e7f703'
  
  const { data } = await supabase
    .from('practice_sessions')
    .select('id, session_type, correct_answers, total_questions')
    .eq('child_id', childId)
    .limit(5)
  
  console.log('Session types:', data?.map(s => s.session_type))
  console.log('Sample:', data?.[0])
}

check().catch(console.error)
