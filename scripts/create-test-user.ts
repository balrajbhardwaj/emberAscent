/**
 * Create Test User Script
 * 
 * Creates a test user account for development and testing purposes.
 * Run this once to create the test account, then use the credentials to log in.
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

async function createTestUser() {
  console.log('🔧 Creating test user account...\n')

  const testUser = {
    email: 'test@emberascent.com',
    password: 'TestUser123!',
    fullName: 'Test Parent',
    emailConfirm: true
  }

  try {
    // Create the user with confirmed email
    const { data: user, error: authError } = await supabase.auth.admin.createUser({
      email: testUser.email,
      password: testUser.password,
      email_confirm: true, // This bypasses email confirmation
      user_metadata: {
        full_name: testUser.fullName
      }
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('✅ Test user already exists!')
        
        // Try to confirm the existing user's email
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          (await supabase.auth.admin.listUsers()).data.users.find(u => u.email === testUser.email)?.id || '',
          { email_confirm: true }
        )
        
        if (!updateError) {
          console.log('✅ Email confirmed for existing user!')
        }
      } else {
        console.error('❌ Error creating user:', authError.message)
        return
      }
    } else {
      console.log('✅ Test user created successfully!')
    }

    // Create a test child profile
    const { data: existingChild, error: checkError } = await supabase
      .from('children')
      .select('id')
      .eq('name', 'Emma Test')
      .single()

    if (!existingChild && !checkError) {
      const { error: childError } = await supabase
        .from('children')
        .insert({
          name: 'Emma Test',
          year_group: 5,
          avatar: '👧',
          user_id: user?.user?.id || (await supabase
            .from('auth.users')
            .select('id')
            .eq('email', testUser.email)
            .single()).data?.id
        })

      if (childError) {
        console.log('ℹ️  Note: Could not create test child profile')
      } else {
        console.log('✅ Test child profile created!')
      }
    }

    console.log('\n🎯 Test Account Details:')
    console.log('   Email:', testUser.email)
    console.log('   Password:', testUser.password)
    console.log('   Child Name: Emma Test (Year 5)')
    console.log('\n🌐 You can now log in at: http://localhost:3000/login')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

createTestUser()