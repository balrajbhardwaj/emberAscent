/**
 * Check subscription tier for current user
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSubscription() {
  // Get all profiles with subscription info
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, email, subscription_tier, subscription_status')
  
  if (error) {
    console.error('Error:', error)
    return
  }
  
  console.log('All user profiles:')
  profiles?.forEach(profile => {
    console.log(`  Email: ${profile.email}`)
    console.log(`  Tier: ${profile.subscription_tier || 'null'}`)
    console.log(`  Status: ${profile.subscription_status || 'null'}`)
    console.log()
  })
}

checkSubscription()
