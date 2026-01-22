/**
 * Validate Emma's Analytics Data
 * 
 * Checks what data exists for Emma and tests the consolidated dashboard API
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function validateEmmaData() {
  console.log('🔍 Validating Emma\'s Analytics Data\n')

  // 1. Find Emma
  const { data: children, error: childError } = await supabase
    .from('children')
    .select('id, name, parent_id, year_group')
    .ilike('name', '%Emma%')

  if (childError) {
    console.error('❌ Error finding Emma:', childError.message)
    return
  }

  if (!children || children.length === 0) {
    console.log('❌ No child named Emma found')
    return
  }

  console.log(`✅ Found ${children.length} child(ren) named Emma:`)
  children.forEach((child, i) => {
    console.log(`   ${i + 1}. ${child.name} (ID: ${child.id.substring(0, 8)}..., Year ${child.year_group})`)
  })

  const emma = children[0]
  console.log(`\n📊 Analyzing data for: ${emma.name} (${emma.id})\n`)

  // 2. Check parent's subscription tier
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier, subscription_status')
    .eq('id', emma.parent_id)
    .single()

  console.log('👤 Parent Subscription:')
  console.log(`   Tier: ${profile?.subscription_tier || 'unknown'}`)
  console.log(`   Status: ${profile?.subscription_status || 'unknown'}\n`)

  // 3. Check question attempts
  const { data: attempts, error: attemptsError } = await supabase
    .from('question_attempts')
    .select('id, is_correct, time_spent, created_at, questions(subject, difficulty, topic)')
    .eq('child_id', emma.id)
    .order('created_at', { ascending: false })
    .limit(10)

  console.log('📝 Question Attempts:')
  if (attemptsError) {
    console.log(`   ❌ Error: ${attemptsError.message}`)
  } else if (!attempts || attempts.length === 0) {
    console.log('   ⚠️  No question attempts found for Emma')
  } else {
    console.log(`   ✅ Found ${attempts.length} recent attempts`)
    const correct = attempts.filter(a => a.is_correct).length
    console.log(`   Accuracy: ${correct}/${attempts.length} (${Math.round((correct / attempts.length) * 100)}%)`)
    
    // Show sample
    console.log('\n   Sample attempts:')
    attempts.slice(0, 3).forEach((attempt, i) => {
      const q = attempt.questions as any
      console.log(`   ${i + 1}. ${q?.subject || 'unknown'} - ${attempt.is_correct ? '✓' : '✗'} (${attempt.time_spent}s)`)
    })
  }

  // 4. Check practice sessions
  const { data: sessions } = await supabase
    .from('practice_sessions')
    .select('id, status, questions_answered, score, created_at')
    .eq('child_id', emma.id)
    .order('created_at', { ascending: false })
    .limit(5)

  console.log('\n\n🎯 Practice Sessions:')
  if (!sessions || sessions.length === 0) {
    console.log('   ⚠️  No practice sessions found')
  } else {
    console.log(`   ✅ Found ${sessions.length} recent sessions`)
    sessions.forEach((session, i) => {
      console.log(`   ${i + 1}. ${session.status} - ${session.questions_answered} questions (${session.score}%)`)
    })
  }

  // 5. Test the consolidated dashboard API
  console.log('\n\n🔌 Testing Dashboard API Endpoint...\n')
  
  try {
    const apiUrl = `http://localhost:3001/api/analytics/dashboard?childId=${emma.id}&range=last_30_days&days=30`
    console.log(`   URL: ${apiUrl}`)
    
    const response = await fetch(apiUrl)
    
    console.log(`   Status: ${response.status} ${response.statusText}`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.log(`   ❌ Error Response: ${errorText}`)
      return
    }

    const data = await response.json()
    
    console.log('\n   ✅ API Response Structure:')
    console.log(`   - success: ${data.success}`)
    console.log(`   - data: ${data.data ? 'present' : 'missing'}`)
    
    if (data.data) {
      console.log('\n   📊 Data Contents:')
      console.log(`   - comprehensive: ${data.data.comprehensive ? '✓' : '✗'}`)
      if (data.data.comprehensive) {
        console.log(`      • totalQuestions: ${data.data.comprehensive.summary?.totalQuestionsAnswered || 0}`)
        console.log(`      • overallAccuracy: ${data.data.comprehensive.summary?.overallAccuracy || 0}%`)
        console.log(`      • subjects: ${data.data.comprehensive.subjectBreakdown?.length || 0}`)
      }
      
      console.log(`   - readiness: ${data.data.readiness ? '✓' : '✗'}`)
      if (data.data.readiness) {
        console.log(`      • score: ${data.data.readiness.overallScore || 0}`)
      }
      
      console.log(`   - heatmap: ${data.data.heatmap ? '✓' : '✗'}`)
      if (data.data.heatmap) {
        console.log(`      • cells: ${data.data.heatmap.cells?.length || 0}`)
      }
      
      console.log(`   - learningHealth: ${data.data.learningHealth ? '✓' : '✗'}`)
      if (data.data.learningHealth) {
        console.log(`      • rushFactor: ${data.data.learningHealth.rushFactor || 0}%`)
        console.log(`      • fatigueDropOff: ${data.data.learningHealth.fatigueDropOff || 0}%`)
        console.log(`      • stagnantTopics: ${data.data.learningHealth.stagnantTopics || 0}`)
      }
      
      console.log(`   - benchmark: ${data.data.benchmark ? '✓' : '✗ (requires Ascent+)'}`)
      if (data.data.benchmark) {
        console.log(`      • percentile: ${data.data.benchmark.overallPercentile || 0}`)
      }
    }

  } catch (apiError: any) {
    console.log(`   ❌ API Error: ${apiError.message}`)
  }

  console.log('\n✅ Validation complete!\n')
}

validateEmmaData()
