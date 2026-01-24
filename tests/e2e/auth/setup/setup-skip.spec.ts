/**
 * E2E Test: Skip Child Setup
 * 
 * Module: Authentication
 * Feature: Onboarding
 * Functionality: User can skip setup and add child later
 * 
 * Test IDs: E2E-AUTH-SETUP-010, E2E-AUTH-SETUP-011
 * Priority: P1 (High)
 */

import { test, expect } from '@playwright/test';
import { AuthHelper } from '@/tests/helpers/auth-helpers';

test.describe('Authentication - Skip Child Setup', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
  });

  test('E2E-AUTH-SETUP-010: should skip setup and go to practice', async ({ page }) => {
    // Arrange - Create new user
    const timestamp = Date.now();
    const testUser = {
      fullName: 'Test Skip User',
      email: `test.skip${timestamp}@emberascent.dev`,
      password: 'TestPass123!',
    };

    // Act - Signup
    await authHelper.goToSignup();
    await page.fill('input[name="fullName"]', testUser.fullName);
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.fill('input[name="confirmPassword"]', testUser.password);
    await page.check('input[name="agreedToTerms"]');
    await page.click('button[type="submit"]');
    
    // Wait for redirect
    await page.waitForURL(/\/(setup|practice)/, { timeout: 15000 });
    
    // If not on setup, navigate there
    if (!page.url().includes('/setup')) {
      await page.goto('/setup');
    }

    // Click "Skip for now" link
    const skipLink = page.locator('text=/Skip for now/i');
    await expect(skipLink).toBeVisible();
    await skipLink.click();

    // Assert
    // Should redirect to practice
    await expect(page).toHaveURL(/\/practice/, { timeout: 10000 });
    
    // User should still be authenticated
    const isAuthenticated = await authHelper.isAuthenticated();
    expect(isAuthenticated).toBe(true);
  });

  test.skip('E2E-AUTH-SETUP-011: can add child later from settings', async ({ page }) => {
    // TODO: Implement test for adding child after skipping
    // This requires:
    // 1. Skip setup
    // 2. Navigate to settings
    // 3. Add child from settings page
    // 4. Verify child was created
  });
});
