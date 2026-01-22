import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function testFatigueFunction() {
  // Get Emma's ID
  const { data: children } = await supabase
    .from('children')
    .select('id')
    .eq('name', 'Emma')
    .limit(1)

  const childId = children![0].id
  console.log('Testing fatigue function for child:', childId)

  // Test the function directly
  const { data, error } = await supabase.rpc('calculate_fatigue_dropoff', {
    p_child_id: childId,
    p_days: 30
  })

  console.log('Function result:', data)
  console.log('Error:', error)

  // Test with raw SQL to debug
  const { data: rawData, error: rawError } = await supabase.rpc('sql', {
    query: `
      WITH session_comparisons AS (
        SELECT 
          qa.session_id,
          (SELECT AVG(CASE WHEN is_correct THEN 100.0 ELSE 0.0 END)
           FROM (
             SELECT is_correct, ROW_NUMBER() OVER (ORDER BY created_at) as rn
             FROM question_attempts
             WHERE session_id = qa.session_id
           ) first_five
           WHERE rn <= 5
          ) as first_five_accuracy,
          (SELECT AVG(CASE WHEN is_correct THEN 100.0 ELSE 0.0 END)
           FROM (
             SELECT is_correct, ROW_NUMBER() OVER (ORDER BY created_at DESC) as rn
             FROM question_attempts
             WHERE session_id = qa.session_id
           ) last_five
           WHERE rn <= 5
          ) as last_five_accuracy,
          (SELECT COUNT(*) FROM question_attempts WHERE session_id = qa.session_id) as total_q
        FROM (
          SELECT DISTINCT session_id
          FROM question_attempts
          WHERE child_id = '${childId}'
            AND created_at >= NOW() - interval '30 days'
        ) qa
        WHERE (SELECT COUNT(*) FROM question_attempts WHERE session_id = qa.session_id) >= 10
      )
      SELECT 
        session_id::text,
        first_five_accuracy,
        last_five_accuracy,
        total_q,
        (first_five_accuracy - last_five_accuracy) as dropoff
      FROM session_comparisons
      WHERE first_five_accuracy IS NOT NULL 
        AND last_five_accuracy IS NOT NULL
      ORDER BY dropoff DESC
    `
  })

  console.log('\nSession breakdown:', rawData)
  if (rawError) console.log('Raw error:', rawError)
}

testFatigueFunction().catch(console.error)
