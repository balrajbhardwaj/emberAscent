import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const userId = 'd1e115c4-879c-48b9-864c-9816793a84a5'
const children = [
  { name: 'Oliver', year_group: 5, avatar_url: '👦' },
  { name: 'Sophie', year_group: 4, avatar_url: '👧' }
]

async function createChildren() {
  for (const child of children) {
    const { error } = await supabase.from('children').insert({
      ...child,
      parent_id: userId
    })
    console.log(error ? `❌ ${child.name}: ${error.message}` : `✅ ${child.name} created`)
  }
}

createChildren()
