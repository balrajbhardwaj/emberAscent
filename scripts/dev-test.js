/**
 * Dev server for testing
 * Loads test environment variables and starts Next.js dev server
 * 
 * Sets NODE_ENV=test so Next.js loads .env.test.local instead of .env.local
 */

const { spawn } = require('child_process');
const path = require('path');

// Load test environment variables
require('dotenv').config({ path: path.resolve(__dirname, '../.env.test.local') });

console.log('🧪 Starting Next.js dev server with TEST database...');
console.log('📍 Test DB:', process.env.TEST_SUPABASE_URL);

// Start Next.js dev server with NODE_ENV=test
// This makes Next.js load .env.test.local instead of .env.local
const devServer = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    NODE_ENV: 'test',
    // Map test env vars to Next.js expected names
    NEXT_PUBLIC_SUPABASE_URL: process.env.TEST_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.TEST_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.TEST_SUPABASE_SERVICE_KEY,
  }
});

devServer.on('error', (error) => {
  console.error('Failed to start dev server:', error);
  process.exit(1);
});

devServer.on('exit', (code) => {
  process.exit(code);
});

// Handle cleanup
process.on('SIGINT', () => {
  devServer.kill();
  process.exit();
});

process.on('SIGTERM', () => {
  devServer.kill();
  process.exit();
});
