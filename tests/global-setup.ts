/**
 * Playwright Global Setup
 * 
 * Runs once before all tests
 */

import { chromium, FullConfig } from '@playwright/test';
import { verifyTestDatabase } from './helpers/db-helpers';

async function globalSetup(config: FullConfig) {
  console.log('🔧 Running global test setup...');
  
  // 1. Verify test database connection
  console.log('📊 Verifying test database connection...');
  const dbConnected = await verifyTestDatabase();
  
  if (!dbConnected) {
    console.error('❌ Test database connection failed!');
    console.error('Make sure TEST_SUPABASE_URL and TEST_SUPABASE_SERVICE_KEY are set in .env.test.local');
    process.exit(1);
  }
  
  console.log('✅ Test database connected');
  
  // 2. Verify test environment variables
  const requiredEnvVars = [
    'TEST_SUPABASE_URL',
    'TEST_SUPABASE_SERVICE_KEY',
    'TEST_SUPABASE_ANON_KEY',
  ];
  
  const missingVars = requiredEnvVars.filter(v => !process.env[v]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(v => console.error(`   - ${v}`));
    console.error('\nCreate .env.test.local with test database credentials');
    process.exit(1);
  }
  
  console.log('✅ Environment variables verified');
  
  // 3. Create browser for state setup
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Store auth states if needed
  await page.close();
  await browser.close();
  
  console.log('✅ Global setup complete\n');
}

export default globalSetup;
