import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function debugSQL() {
  const childId = 'dd25c842-e20a-44e4-96e4-34a180e7f703'

  // Run the exact SQL from the function
  const { data, error } = await supabase.rpc('sql', {
    query: `
      WITH session_data AS (
        SELECT 
          session_id,
          is_correct,
          created_at,
          ROW_NUMBER() OVER (PARTITION BY session_id ORDER BY created_at) as question_num,
          COUNT(*) OVER (PARTITION BY session_id) as total_questions
        FROM question_attempts
        WHERE child_id = '${childId}'
          AND created_at >= NOW() - interval '30 days'
      ),
      session_metrics AS (
        SELECT 
          session_id,
          AVG(CASE WHEN question_num <= 5 AND is_correct THEN 100.0
                   WHEN question_num <= 5 AND NOT is_correct THEN 0.0
              END) as first_five_accuracy,
          AVG(CASE WHEN question_num > total_questions - 5 AND is_correct THEN 100.0
                   WHEN question_num > total_questions - 5 AND NOT is_correct THEN 0.0
              END) as last_five_accuracy,
          MAX(total_questions) as total_q
        FROM session_data
        WHERE total_questions >= 10
        GROUP BY session_id
      )
      SELECT 
        session_id::text,
        first_five_accuracy,
        last_five_accuracy,
        total_q,
        (first_five_accuracy - last_five_accuracy) as dropoff
      FROM session_metrics
      WHERE first_five_accuracy IS NOT NULL 
        AND last_five_accuracy IS NOT NULL
      ORDER BY dropoff DESC
    `
  })

  console.log('SQL Debug Output:')
  console.log(JSON.stringify(data, null, 2))
  if (error) console.log('Error:', error)
}

debugSQL().catch(console.error)
