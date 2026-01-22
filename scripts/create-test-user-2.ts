/**
 * Create Second Test User Script
 * 
 * Creates a second test user account with premium (ascent) subscription.
 * This user will have access to all analytics features.
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

console.log('Environment check:')
console.log('Supabase URL:', !!supabaseUrl)
console.log('Service Key:', !!supabaseServiceKey)

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables')
  console.error('Make sure .env.local contains:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createTestUser2() {
  console.log('🔧 Creating second test user account (Premium)...\n')

  const testUser = {
    email: 'premium@emberascent.com',
    password: 'Premium123!',
    fullName: 'Sarah Williams',
    emailConfirm: true
  }

  try {
    // Create the user with confirmed email
    const { data: user, error: authError } = await supabase.auth.admin.createUser({
      email: testUser.email,
      password: testUser.password,
      email_confirm: true,
      user_metadata: {
        full_name: testUser.fullName
      }
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('✅ Test user already exists!')
        
        // Get existing user
        const { data: { users } } = await supabase.auth.admin.listUsers()
        const existingUser = users.find(u => u.email === testUser.email)
        
        if (existingUser) {
          // Confirm email
          await supabase.auth.admin.updateUserById(
            existingUser.id,
            { email_confirm: true }
          )
          console.log('✅ Email confirmed for existing user!')
        }
      } else {
        console.error('❌ Error creating user:', authError.message)
        return
      }
    } else {
      console.log('✅ Test user created successfully!')
      console.log('   User ID:', user.user?.id)
    }

    // Get the user ID
    const { data: { users } } = await supabase.auth.admin.listUsers()
    const currentUser = users.find(u => u.email === testUser.email)
    
    if (!currentUser) {
      console.error('❌ Could not find created user')
      return
    }

    // Create/update profile with Ascent subscription
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', currentUser.id)
      .single()

    if (existingProfile) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: testUser.fullName,
          subscription_tier: 'ascent',
          subscription_status: 'active'
        })
        .eq('id', currentUser.id)

      if (updateError) {
        console.log('⚠️  Note: Could not update profile:', updateError.message)
      } else {
        console.log('✅ Profile updated with Ascent subscription!')
      }
    } else {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: currentUser.id,
          full_name: testUser.fullName,
          subscription_tier: 'ascent',
          subscription_status: 'active'
        })

      if (profileError) {
        console.log('⚠️  Note: Could not create profile:', profileError.message)
      } else {
        console.log('✅ Profile created with Ascent subscription!')
      }
    }

    // Create test child profiles
    const children = [
      {
        name: 'Oliver',
        year_group: 5,
        avatar: 'boy-1'
      },
      {
        name: 'Sophie',
        year_group: 4,
        avatar: 'girl-1'
      }
    ]

    for (const child of children) {
      const { data: existingChild } = await supabase
        .from('children')
        .select('id')
        .eq('name', child.name)
        .eq('parent_id', currentUser.id)
        .single()

      if (!existingChild) {
        const { error: childError } = await supabase
          .from('children')
          .insert({
            name: child.name,
            year_group: child.year_group,
            avatar: child.avatar,
            parent_id: currentUser.id
          })

        if (childError) {
          console.log(`⚠️  Note: Could not create child profile for ${child.name}`)
        } else {
          console.log(`✅ Child profile created: ${child.name}`)
        }
      } else {
        console.log(`ℹ️  Child profile already exists: ${child.name}`)
      }
    }

    console.log('\n✅ Setup complete!')
    console.log('\n📋 Login credentials:')
    console.log('Email:', testUser.email)
    console.log('Password:', testUser.password)
    console.log('Subscription:', 'Ascent (Premium)')
    console.log('Children:', 'Oliver (Year 5), Sophie (Year 4)')
    console.log('\n🔗 Navigate to: http://localhost:3000/login')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Run the script
createTestUser2()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
