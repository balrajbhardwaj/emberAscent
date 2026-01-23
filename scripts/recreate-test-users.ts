/**
 * Recreate Test Users with Proper Auth
 * 
 * Creates test users using Supabase Admin API to ensure proper password hashing.
 * This fixes the auth login issue caused by SQL-generated password hashes.
 * 
 * Usage:
 *   npx tsx scripts/recreate-test-users.ts
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

interface TestUser {
  id: string
  email: string
  password: string
  fullName: string
  tier: 'free' | 'ascent' | 'summit'
  children: Array<{
    id: string
    name: string
    yearGroup: number
    targetSchool: string
  }>
}

const testUsers: TestUser[] = [
  {
    id: 'b1111111-1111-1111-1111-111111111111',
    email: 'test.sarah@emberascent.dev',
    password: 'TestPassword123!',
    fullName: 'Sarah Thompson',
    tier: 'free',
    children: [
      {
        id: 'c1111111-1111-1111-1111-111111111111',
        name: 'Emma',
        yearGroup: 5,
        targetSchool: 'Reading Grammar School'
      },
      {
        id: 'c1111112-1111-1111-1111-111111111111',
        name: 'Oliver',
        yearGroup: 6,
        targetSchool: 'Reading Grammar School'
      }
    ]
  },
  {
    id: 'b2222222-2222-2222-2222-222222222222',
    email: 'test.david@emberascent.dev',
    password: 'TestPassword123!',
    fullName: 'David Chen',
    tier: 'free',
    children: [
      {
        id: 'c2222221-2222-2222-2222-222222222222',
        name: 'Lucas',
        yearGroup: 4,
        targetSchool: 'St Pauls School'
      },
      {
        id: 'c2222222-2222-2222-2222-222222222222',
        name: 'Mia',
        yearGroup: 5,
        targetSchool: 'St Pauls School'
      }
    ]
  },
  {
    id: 'b3333333-3333-3333-3333-333333333333',
    email: 'test.james@emberascent.dev',
    password: 'TestPassword123!',
    fullName: 'James Wilson',
    tier: 'ascent',
    children: [
      {
        id: 'c3333331-3333-3333-3333-333333333333',
        name: 'Sophia',
        yearGroup: 6,
        targetSchool: 'Kings College School'
      },
      {
        id: 'c3333332-3333-3333-3333-333333333333',
        name: 'Harry',
        yearGroup: 4,
        targetSchool: 'Kings College School'
      }
    ]
  },
  {
    id: 'b4444444-4444-4444-4444-444444444444',
    email: 'test.priya@emberascent.dev',
    password: 'TestPassword123!',
    fullName: 'Priya Patel',
    tier: 'summit',
    children: [
      {
        id: 'c4444441-4444-4444-4444-444444444444',
        name: 'Ava',
        yearGroup: 5,
        targetSchool: 'Westminster School'
      },
      {
        id: 'c4444442-4444-4444-4444-444444444444',
        name: 'Noah',
        yearGroup: 6,
        targetSchool: 'Westminster School'
      }
    ]
  }
]

/**
 * Delete existing test user and all related data
 */
async function deleteTestUser(userId: string, email: string) {
  console.log(`  🗑️  Deleting existing user: ${email}`)
  
  try {
    // Delete children (cascade should handle this, but being explicit)
    const { error: childrenError } = await supabase
      .from('children')
      .delete()
      .eq('parent_id', userId)
    
    if (childrenError && !childrenError.message.includes('violates foreign key')) {
      console.log(`     ⚠️  Children delete: ${childrenError.message}`)
    }

    // Delete profile
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)
    
    if (profileError && !profileError.message.includes('violates foreign key')) {
      console.log(`     ⚠️  Profile delete: ${profileError.message}`)
    }

    // Delete auth user using admin API
    const { error: authError } = await supabase.auth.admin.deleteUser(userId)
    
    if (authError && !authError.message.includes('not found')) {
      console.log(`     ⚠️  Auth delete: ${authError.message}`)
    }

    console.log(`     ✅ Cleanup complete`)
  } catch (error: any) {
    // Ignore errors - user might not exist
    console.log(`     ℹ️  Cleanup skipped (${error.message})`)
  }
}

/**
 * Create test user with proper auth
 */
async function createTestUser(user: TestUser) {
  console.log(`\n📝 Creating user: ${user.fullName} (${user.email})`)
  
  // Step 1: Delete existing user
  await deleteTestUser(user.id, user.email)
  
  // Step 2: Create auth user using Admin API (proper password hashing)
  console.log(`  🔐 Creating auth user...`)
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: user.email,
    password: user.password,
    email_confirm: true, // Auto-confirm email
    user_metadata: {
      full_name: user.fullName
    }
  })

  if (authError) {
    console.error(`     ❌ Auth creation failed: ${authError.message}`)
    return false
  }

  console.log(`     ✅ Auth user created (ID: ${authData.user.id.substring(0, 8)}...)`)

  // Step 3: Update profile (should be created by trigger, but ensure correct data)
  console.log(`  👤 Updating profile...`)
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: authData.user.id,
      email: user.email,
      full_name: user.fullName,
      subscription_tier: user.tier,
      subscription_status: 'active',
      stripe_customer_id: null
    })

  if (profileError) {
    console.error(`     ❌ Profile update failed: ${profileError.message}`)
    return false
  }

  console.log(`     ✅ Profile updated (tier: ${user.tier})`)

  // Step 4: Create children
  console.log(`  👶 Creating ${user.children.length} children...`)
  for (const child of user.children) {
    const { error: childError } = await supabase
      .from('children')
      .upsert({
        id: child.id,
        parent_id: authData.user.id,
        name: child.name,
        year_group: child.yearGroup,
        target_school: child.targetSchool,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${child.name}`,
        is_active: true
      })

    if (childError) {
      console.error(`     ❌ Child creation failed (${child.name}): ${childError.message}`)
      return false
    }

    console.log(`     ✅ ${child.name} (Year ${child.yearGroup})`)
  }

  console.log(`  ✅ User complete: ${user.email}`)
  return true
}

/**
 * Main execution
 */
async function main() {
  console.log('\n' + '='.repeat(80))
  console.log('🔧 Recreating Test Users with Proper Auth')
  console.log('='.repeat(80))

  // Verify connection
  console.log(`\n🔗 Connecting to Supabase...`)
  try {
    const { error } = await supabase.from('profiles').select('id').limit(1)
    if (error) throw error
    console.log(`✅ Connected: ${supabaseUrl.substring(0, 40)}...`)
  } catch (error: any) {
    console.error('❌ Connection failed:', error.message)
    process.exit(1)
  }

  // Create users
  let successCount = 0
  let failCount = 0

  for (const user of testUsers) {
    const success = await createTestUser(user)
    if (success) {
      successCount++
    } else {
      failCount++
    }
  }

  // Summary
  console.log('\n' + '='.repeat(80))
  console.log('📊 SUMMARY')
  console.log('='.repeat(80))
  console.log(`✅ Successfully created: ${successCount} users`)
  if (failCount > 0) {
    console.log(`❌ Failed: ${failCount} users`)
  }
  console.log(`👥 Total users: ${testUsers.length}`)
  console.log(`👶 Total children: ${testUsers.reduce((sum, u) => sum + u.children.length, 0)}`)

  // Test credentials
  console.log('\n' + '='.repeat(80))
  console.log('🔑 TEST CREDENTIALS')
  console.log('='.repeat(80))
  console.log('\n1. Sarah Thompson (FREE)')
  console.log('   Email: test.sarah@emberascent.dev')
  console.log('   Password: TestPassword123!')
  console.log('   Children: Emma (Y5), Oliver (Y6)')
  
  console.log('\n2. David Chen (FREE)')
  console.log('   Email: test.david@emberascent.dev')
  console.log('   Password: TestPassword123!')
  console.log('   Children: Lucas (Y4), Mia (Y5)')
  
  console.log('\n3. James Wilson (ASCENT)')
  console.log('   Email: test.james@emberascent.dev')
  console.log('   Password: TestPassword123!')
  console.log('   Children: Sophia (Y6), Harry (Y4)')
  
  console.log('\n4. Priya Patel (SUMMIT)')
  console.log('   Email: test.priya@emberascent.dev')
  console.log('   Password: TestPassword123!')
  console.log('   Children: Ava (Y5), Noah (Y6)')
  
  console.log('\n' + '='.repeat(80))
  console.log('✅ Ready to test! Try logging in at http://localhost:3000/login')
  console.log('='.repeat(80) + '\n')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Script failed:', error)
    process.exit(1)
  })
