/**
 * Database Test Helpers
 * 
 * Functions for setting up and tearing down test data
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.TEST_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.TEST_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

/**
 * Create Supabase admin client for test setup
 */
export function createTestClient() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Test Supabase credentials not configured');
  }
  
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Clean up test data after tests
 */
export async function cleanupTestData() {
  const supabase = createTestClient();
  
  // Delete test sessions
  await supabase
    .from('practice_sessions')
    .delete()
    .like('id', 'test-%');
  
  // Delete test children
  await supabase
    .from('children')
    .delete()
    .like('id', 'c-test-%');
  
  // Delete test profiles
  await supabase
    .from('profiles')
    .delete()
    .like('email', '%@test.emberascent.dev');
}

/**
 * Seed test questions (sample from production)
 */
export async function seedTestQuestions() {
  const supabase = createTestClient();
  
  // Get sample questions from each subject
  const { data: mathQuestions } = await supabase
    .from('questions')
    .select('*')
    .eq('subject', 'mathematics')
    .limit(50);
  
  const { data: englishQuestions } = await supabase
    .from('questions')
    .select('*')
    .eq('subject', 'english')
    .limit(50);
  
  const { data: vrQuestions } = await supabase
    .from('questions')
    .select('*')
    .eq('subject', 'verbal_reasoning')
    .limit(50);
  
  return {
    mathematics: mathQuestions || [],
    english: englishQuestions || [],
    verbal_reasoning: vrQuestions || [],
  };
}

/**
 * Create a test practice session
 */
export async function createTestSession(childId: string, type: 'quick_byte' | 'focus' | 'mock') {
  const supabase = createTestClient();
  
  const { data, error } = await supabase
    .from('practice_sessions')
    .insert({
      id: `test-session-${Date.now()}`,
      child_id: childId,
      session_type: type,
      status: 'active',
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

/**
 * Verify test database connection
 */
export async function verifyTestDatabase(): Promise<boolean> {
  try {
    const supabase = createTestClient();
    const { error } = await supabase.from('profiles').select('count').limit(1);
    return !error;
  } catch {
    return false;
  }
}
