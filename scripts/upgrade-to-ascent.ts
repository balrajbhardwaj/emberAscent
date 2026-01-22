/**
 * Set Tom's subscription to Ascent tier
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function upgradeToAscent() {
  console.log('Looking for user profiles...\n')
  
  // Find the user (assuming Tom's email or first user)
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: true })
  
  if (profileError) {
    console.error('Error fetching profiles:', profileError)
    return
  }
  
  if (!profiles || profiles.length === 0) {
    console.log('No profiles found!')
    return
  }
  
  console.log(`Found ${profiles.length} profile(s)`)
  
  // Update first profile (Tom) to Ascent tier
  const tomProfile = profiles[0]
  console.log(`\nUpdating profile:`)
  console.log(`  Email: ${tomProfile.email}`)
  console.log(`  Current tier: ${tomProfile.subscription_tier}`)
  console.log(`  Current status: ${tomProfile.subscription_status}`)
  
  const { data: updated, error: updateError } = await supabase
    .from('profiles')
    .update({
      subscription_tier: 'ascent',
      subscription_status: 'active'
    })
    .eq('id', tomProfile.id)
    .select()
  
  if (updateError) {
    console.error('\nError updating:', updateError)
    return
  }
  
  console.log('\n✅ Successfully updated to Ascent tier!')
  console.log(`  Email: ${updated[0].email}`)
  console.log(`  New tier: ${updated[0].subscription_tier}`)
  console.log(`  New status: ${updated[0].subscription_status}`)
}

upgradeToAscent()
