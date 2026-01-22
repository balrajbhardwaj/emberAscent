import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkAllSessions() {
  const childId = 'dd25c842-e20a-44e4-96e4-34a180e7f703'

  // Get ALL sessions, not just completed ones
  const { data: sessions } = await supabase
    .from('practice_sessions')
    .select('id, created_at, completed_at')
    .eq('child_id', childId)
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false })

  console.log(`Total sessions in last 30 days: ${sessions?.length}`)

  for (const session of sessions || []) {
    const { data: attempts } = await supabase
      .from('question_attempts')
      .select('is_correct, created_at')
      .eq('session_id', session.id)
      .order('created_at', { ascending: true })

    if (!attempts || attempts.length < 10) continue

    const first5 = attempts.slice(0, 5)
    const last5 = attempts.slice(-5)
    
    const first5Acc = first5.filter(a => a.is_correct).length / 5 * 100
    const last5Acc = last5.filter(a => a.is_correct).length / 5 * 100
    const dropoff = first5Acc - last5Acc
    
    console.log(`\nSession: ${session.id.slice(0, 8)} (${session.completed_at ? 'completed' : 'active'})`)
    console.log(`  Total: ${attempts.length}`)
    console.log(`  First 5: ${first5Acc}% - ${first5.map(a => a.is_correct ? '✓' : '✗').join(' ')}`)
    console.log(`  Last 5: ${last5Acc}% - ${last5.map(a => a.is_correct ? '✓' : '✗').join(' ')}`)
    console.log(`  Drop-off: ${dropoff}%`)
  }
}

checkAllSessions().catch(console.error)
