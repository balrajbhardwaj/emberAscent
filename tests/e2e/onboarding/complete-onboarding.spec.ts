/**
 * E2E Test: Complete Onboarding Journey
 * 
 * Module: Authentication
 * Feature: Complete User Onboarding
 * Functionality: Full new user journey from signup to practice
 * 
 * Test IDs: E2E-ONBOARD-001, E2E-ONBOARD-002, E2E-ONBOARD-003
 * Priority: P1 (High)
 */

import { test, expect } from '@playwright/test';
import { AuthHelper } from '@/tests/helpers/auth-helpers';

test.describe('Complete Onboarding Journey', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    
    page.on('console', msg => console.log('BROWSER:', msg.text()));
    page.on('pageerror', error => console.error('PAGE ERROR:', error));
  });

  test('E2E-ONBOARD-001: should complete full new user onboarding', async ({ page }) => {
    // This is the GOLDEN PATH test - everything should work end-to-end
    
    // Arrange
    const timestamp = Date.now();
    const testUser = {
      fullName: 'Complete Test User',
      email: `test.complete${timestamp}@emberascent.dev`,
      password: 'TestPass123!',
    };
    
    const childData = {
      name: 'Sophie',
      yearGroup: '5',
      targetSchool: 'Reading Grammar School',
    };

    console.log('=== STEP 1: SIGNUP ===');
    // Act - Signup
    await authHelper.goToSignup();
    await page.fill('input[name="fullName"]', testUser.fullName);
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.fill('input[name="confirmPassword"]', testUser.password);
    await page.check('input[name="agreedToTerms"]');
    await page.click('button[type="submit"]');
    
    // Assert - Signup success
    await page.waitForURL(/\/(setup|practice)/, { timeout: 15000 });
    console.log('✓ Signup successful, redirected to:', page.url());

    console.log('=== STEP 2: CHILD SETUP ===');
    // Act - Setup child profile
    if (!page.url().includes('/setup')) {
      await page.goto('/setup');
    }
    
    await page.fill('input[name="name"]', childData.name);
    await page.selectOption('select[name="yearGroup"]', childData.yearGroup);
    await page.fill('input[name="targetSchool"]', childData.targetSchool);
    await page.click('button[type="submit"]');
    
    // Assert - Setup success
    await expect(page).toHaveURL(/\/practice/, { timeout: 10000 });
    console.log('✓ Child setup complete, on practice dashboard');

    console.log('=== STEP 3: VERIFY ONBOARDING COMPLETE ===');
    // Assert - User is on practice dashboard and authenticated
    const isAuthenticated = await authHelper.isAuthenticated();
    expect(isAuthenticated).toBe(true);
    console.log('✓ User authenticated');
    
    // Practice dashboard elements visible
    const dashboardContent = page.locator('h1, h2').first();
    await expect(dashboardContent).toBeVisible();
    console.log('✓ Dashboard visible');

    console.log('=== ONBOARDING JOURNEY COMPLETE ===');
  });

  test('E2E-ONBOARD-002: returning user with child should go directly to practice', async ({ page }) => {
    // This tests that users who already have children skip the setup page
    
    // Arrange - Use existing test user with child
    const existingUser = {
      email: 'test.sarah@emberascent.dev',
      password: 'Test123!',
    };

    // Act
    await authHelper.login(existingUser.email, existingUser.password);

    // Assert - Should be on practice, not setup
    await expect(page).toHaveURL(/\/practice/, { timeout: 10000 });
    
    // If user tries to navigate to setup, should redirect to practice
    await page.goto('/setup');
    await expect(page).toHaveURL(/\/practice/, { timeout: 5000 });
  });

  test('E2E-ONBOARD-003: unauthenticated user cannot access setup', async ({ page }) => {
    // Act - Try to access setup without login
    await page.goto('/setup');

    // Assert - Should redirect to login
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });
});
