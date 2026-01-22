import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function debugFatigue() {
  const childId = 'dd25c842-e20a-44e4-96e4-34a180e7f703'

  // Get sessions with 10+ questions
  const { data: sessions } = await supabase
    .from('practice_sessions')
    .select('id')
    .eq('child_id', childId)
    .not('completed_at', 'is', null)
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

  console.log('Total completed sessions:', sessions?.length)

  for (const session of sessions || []) {
    const { data: attempts } = await supabase
      .from('question_attempts')
      .select('is_correct, created_at')
      .eq('session_id', session.id)
      .order('created_at', { ascending: true })

    if (attempts && attempts.length >= 10) {
      const first5 = attempts.slice(0, 5)
      const last5 = attempts.slice(-5)
      
      const first5Acc = first5.filter(a => a.is_correct).length / 5 * 100
      const last5Acc = last5.filter(a => a.is_correct).length / 5 * 100
      const dropoff = first5Acc - last5Acc
      
      console.log(`\nSession: ${session.id.slice(0, 8)}`)
      console.log(`  Total questions: ${attempts.length}`)
      console.log(`  First 5: ${first5Acc}%`)
      console.log(`  Last 5: ${last5Acc}%`)
      console.log(`  Drop-off: ${dropoff}%`)
    }
  }

  // Now call the function
  console.log('\n--- Calling function ---')
  const { data: result, error } = await supabase.rpc('calculate_fatigue_dropoff', {
    p_child_id: childId,
    p_days: 30
  })

  console.log('Result:', result)
  console.log('Error:', error)
}

debugFatigue().catch(console.error)
