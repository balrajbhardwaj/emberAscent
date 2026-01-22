/**
 * Verify Y4 Question Import
 * 
 * Quick verification script to check Y4 questions in database
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function verifyImport() {
  console.log('\n🔍 Verifying Year 4 questions in database...\n')

  // Check total count
  const { count: totalCount, error: countError } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true })
    .eq('year_group', 4)

  if (countError) {
    console.error('❌ Error checking count:', countError)
    return
  }

  console.log(`✅ Total Year 4 questions: ${totalCount}`)

  // Check by subject and difficulty
  const { data: distribution, error: distError } = await supabase
    .from('questions')
    .select('year_group, subject, difficulty')
    .eq('year_group', 4)

  if (distError) {
    console.error('❌ Error checking distribution:', distError)
    return
  }

  // Count by subject
  const subjectCounts: Record<string, number> = {}
  const difficultyCounts: Record<string, number> = {}

  distribution?.forEach((q: any) => {
    subjectCounts[q.subject] = (subjectCounts[q.subject] || 0) + 1
    difficultyCounts[q.difficulty] = (difficultyCounts[q.difficulty] || 0) + 1
  })

  console.log('\n📊 By Subject:')
  Object.entries(subjectCounts)
    .sort(([, a], [, b]) => b - a)
    .forEach(([subject, count]) => {
      console.log(`   ${subject}: ${count}`)
    })

  console.log('\n📊 By Difficulty:')
  Object.entries(difficultyCounts)
    .sort(([, a], [, b]) => b - a)
    .forEach(([difficulty, count]) => {
      console.log(`   ${difficulty}: ${count}`)
    })

  // Sample a few questions
  const { data: samples, error: sampleError } = await supabase
    .from('questions')
    .select('id, external_id, subject, topic, subtopic, difficulty, question_text')
    .eq('year_group', 4)
    .limit(3)

  if (sampleError) {
    console.error('❌ Error fetching samples:', sampleError)
    return
  }

  console.log('\n📝 Sample Questions:')
  samples?.forEach((q: any, i: number) => {
    console.log(`\n${i + 1}. ${q.subject} - ${q.topic} (${q.difficulty})`)
    console.log(`   ID: ${q.id}`)
    console.log(`   External ID: ${q.external_id}`)
    console.log(`   Question: ${q.question_text.substring(0, 100)}...`)
  })

  // Check ember_scores
  const { data: scores, error: scoresError } = await supabase
    .from('questions')
    .select('ember_score')
    .eq('year_group', 4)
    .not('ember_score', 'is', null)

  if (scoresError) {
    console.error('❌ Error checking scores:', scoresError)
    return
  }

  const scoredCount = scores?.length || 0
  console.log(`\n🎯 Questions with Ember Score: ${scoredCount}/${totalCount}`)

  if (scoredCount < (totalCount || 0)) {
    console.log('\n⚠️  Some questions missing ember_score. Run:')
    console.log('   SELECT * FROM update_all_ember_scores();')
  }
}

verifyImport()
  .then(() => {
    console.log('\n✅ Verification complete\n')
    process.exit(0)
  })
  .catch((err) => {
    console.error('\n❌ Verification failed:', err)
    process.exit(1)
  })
