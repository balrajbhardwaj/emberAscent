/**
 * Quick script to check practice data for Emma
 */
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkData() {
  const childId = 'dd25c842-e20a-44e4-96e4-34a180e7f703'
  
  console.log('Checking practice data for Emma...\n')
  
  // Check question_attempts
  const { data: attempts, error: attemptsError } = await supabase
    .from('question_attempts')
    .select('id, is_correct, time_taken_seconds, created_at')
    .eq('child_id', childId)
    .limit(10)
  
  if (attemptsError) {
    console.log('Error fetching attempts:', attemptsError)
  } else {
    console.log('Question Attempts:', attempts?.length || 0, 'records found')
    if (attempts && attempts.length > 0) {
      console.log('Sample:', JSON.stringify(attempts[0], null, 2))
    }
  }
  
  // Check practice_sessions
  const { data: sessions, error: sessionsError } = await supabase
    .from('practice_sessions')
    .select('*')
    .eq('child_id', childId)
    .limit(10)
  
  if (sessionsError) {
    console.log('Error fetching sessions:', sessionsError)
  } else {
    console.log('\nPractice Sessions:', sessions?.length || 0, 'records found')
    if (sessions && sessions.length > 0) {
      console.log('Sample:', JSON.stringify(sessions[0], null, 2))
      console.log('Columns:', Object.keys(sessions[0]))
    }
  }
  
  // Check table schema for question_attempts
  const { data: columns, error: schemaError } = await supabase
    .rpc('get_table_columns', { table_name: 'question_attempts' })
    .catch(() => ({ data: null, error: 'RPC not found' }))
  
  if (!columns) {
    // Alternative: query information_schema
    console.log('\nChecking table columns via query...')
    const { data: sample } = await supabase
      .from('question_attempts')
      .select('*')
      .limit(1)
    
    if (sample && sample[0]) {
      console.log('Question Attempts columns:', Object.keys(sample[0]))
    }
  }
}

checkData().catch(console.error)
