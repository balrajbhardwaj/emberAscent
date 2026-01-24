/**
 * Vitest Configuration for Ember Ascent
 * 
 * Unit and component test configuration with:
 * - JSDOM environment for React components
 * - Coverage reporting
 * - Test globals
 */

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // Use jsdom environment for React components
    environment: 'jsdom',
    
    // Setup files
    setupFiles: ['./tests/setup.ts'],
    
    // Include test files
    include: [
      'tests/component/**/*.test.{ts,tsx}',
      'tests/unit/**/*.test.{ts,tsx}',
      'lib/**/*.test.{ts,tsx}',
      'components/**/*.test.{ts,tsx}',
    ],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './tests/reports/coverage',
      include: [
        'lib/**/*.{ts,tsx}',
        'components/**/*.{ts,tsx}',
        'app/**/*.{ts,tsx}',
        'hooks/**/*.{ts,tsx}',
      ],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/types/**',
        '**/*.d.ts',
      ],
      // Target 80% coverage thresholds
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
    
    // Globals (optional, allows using test functions without importing)
    globals: true,
    
    // Test timeout
    testTimeout: 10000,
    
    // Reporters
    reporters: ['verbose', 'html', 'json'],
    outputFile: {
      html: './tests/reports/vitest-report/index.html',
      json: './tests/reports/vitest-results.json',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
