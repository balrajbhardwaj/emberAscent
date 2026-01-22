/**
 * Debug script to check learning health data
 * 
 * Investigates why learning health metrics are showing 0
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkLearningHealthData() {
  console.log('=== Learning Health Data Check ===\n')

  // Get Emma's child_id
  const { data: children } = await supabase
    .from('children')
    .select('id, name')
    .eq('name', 'Emma')
    .limit(1)

  if (!children || children.length === 0) {
    console.log('❌ No child named Emma found')
    return
  }

  const childId = children[0].id
  console.log(`✅ Found Emma: ${childId}\n`)

  // Check 1: Time taken data
  console.log('--- Check 1: Time Taken Data ---')
  const { data: timeData, error: timeError } = await supabase
    .from('question_attempts')
    .select('id, time_taken_seconds, created_at')
    .eq('child_id', childId)
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false })
    .limit(10)

  if (timeError) {
    console.log('❌ Error fetching time data:', timeError)
  } else {
    console.log(`Total attempts in last 30 days: ${timeData?.length || 0}`)
    if (timeData && timeData.length > 0) {
      console.log('\nSample time_taken_seconds values:')
      timeData.slice(0, 5).forEach(a => {
        console.log(`  - ${a.time_taken_seconds}s (${new Date(a.created_at).toLocaleString()})`)
      })
      
      const avgTime = timeData.reduce((sum, a) => sum + a.time_taken_seconds, 0) / timeData.length
      const rushCount = timeData.filter(a => a.time_taken_seconds > 0 && a.time_taken_seconds < 10).length
      const validCount = timeData.filter(a => a.time_taken_seconds > 0).length
      
      console.log(`\nManual calculation:`)
      console.log(`  - Avg time: ${avgTime.toFixed(1)}s`)
      console.log(`  - Rushed (<10s): ${rushCount}`)
      console.log(`  - Valid times: ${validCount}`)
      console.log(`  - Rush factor: ${validCount > 0 ? ((rushCount / validCount) * 100).toFixed(1) : 0}%`)
    }
  }

  // Check 2: Session structure (for fatigue)
  console.log('\n--- Check 2: Session Structure ---')
  const { data: sessions } = await supabase
    .from('practice_sessions')
    .select('id, created_at, completed_at')
    .eq('child_id', childId)
    .not('completed_at', 'is', null)
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false })
    .limit(5)

  if (sessions && sessions.length > 0) {
    console.log(`Found ${sessions.length} completed sessions`)
    
    for (const session of sessions.slice(0, 3)) {
      const { data: attempts } = await supabase
        .from('question_attempts')
        .select('is_correct, created_at')
        .eq('session_id', session.id)
        .order('created_at', { ascending: true })

      console.log(`\nSession ${session.id.slice(0, 8)}...`)
      console.log(`  Questions: ${attempts?.length || 0}`)
      
      if (attempts && attempts.length >= 10) {
        const first5 = attempts.slice(0, 5)
        const last5 = attempts.slice(-5)
        
        const first5Accuracy = first5.filter(a => a.is_correct).length / 5 * 100
        const last5Accuracy = last5.filter(a => a.is_correct).length / 5 * 100
        
        console.log(`  First 5 accuracy: ${first5Accuracy.toFixed(0)}%`)
        console.log(`  Last 5 accuracy: ${last5Accuracy.toFixed(0)}%`)
        console.log(`  Drop-off: ${(first5Accuracy - last5Accuracy).toFixed(0)}%`)
      }
    }
  } else {
    console.log('No completed sessions found')
  }

  // Check 3: Topic performance over time
  console.log('\n--- Check 3: Topic Performance ---')
  const { data: topicData } = await supabase
    .from('question_attempts')
    .select(`
      created_at,
      is_correct,
      questions!inner(subject, topic)
    `)
    .eq('child_id', childId)
    .gte('created_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())

  if (topicData && topicData.length > 0) {
    console.log(`Total attempts in last 14 days: ${topicData.length}`)
    
    // Group by topic
    const topicMap = new Map<string, { recent: number[], previous: number[] }>()
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    
    topicData.forEach((attempt: any) => {
      const topic = attempt.questions?.topic
      if (!topic) return
      
      const isRecent = new Date(attempt.created_at).getTime() > sevenDaysAgo
      
      if (!topicMap.has(topic)) {
        topicMap.set(topic, { recent: [], previous: [] })
      }
      
      const data = topicMap.get(topic)!
      if (isRecent) {
        data.recent.push(attempt.is_correct ? 1 : 0)
      } else {
        data.previous.push(attempt.is_correct ? 1 : 0)
      }
    })
    
    console.log(`\nUnique topics practiced: ${topicMap.size}`)
    
    let stagnantCount = 0
    topicMap.forEach((data, topic) => {
      if (data.recent.length >= 3 && data.previous.length >= 3) {
        const recentAcc = data.recent.reduce((a, b) => a + b, 0) / data.recent.length * 100
        const previousAcc = data.previous.reduce((a, b) => a + b, 0) / data.previous.length * 100
        
        if (recentAcc <= previousAcc) {
          stagnantCount++
          console.log(`  📉 ${topic}: ${previousAcc.toFixed(0)}% → ${recentAcc.toFixed(0)}%`)
        }
      }
    })
    
    console.log(`\nStagnant topics (manual count): ${stagnantCount}`)
  } else {
    console.log('No topic data found in last 14 days')
  }

  // Check 4: Call the actual functions
  console.log('\n--- Check 4: Database Function Results ---')
  const { data: healthCheck, error: healthError } = await supabase
    .rpc('get_learning_health_check', {
      p_child_id: childId,
      p_days: 30
    })

  if (healthError) {
    console.log('❌ Error calling function:', healthError)
  } else {
    console.log('Function results:', typeof healthCheck === 'string' ? JSON.parse(healthCheck) : healthCheck)
  }
}

checkLearningHealthData().catch(console.error)
