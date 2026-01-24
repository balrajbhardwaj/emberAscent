/**
 * Playwright Global Teardown
 * 
 * Runs once after all tests
 */

import { FullConfig } from '@playwright/test';
import { cleanupTestData } from './helpers/db-helpers';

async function globalTeardown(_config: FullConfig) {
  console.log('\n🧹 Running global test teardown...');
  
  // Clean up test data
  try {
    await cleanupTestData();
    console.log('✅ Test data cleaned up');
  } catch (error) {
    console.error('⚠️  Failed to clean up test data:', error);
  }
  
  console.log('✅ Global teardown complete');
}

export default globalTeardown;
