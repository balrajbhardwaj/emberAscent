/**
 * E2E Test: Signup Success
 * 
 * Module: Authentication
 * Feature: User Registration
 * Functionality: New user can create account and access setup
 * 
 * Test IDs: E2E-AUTH-SIGNUP-001, E2E-AUTH-SIGNUP-002, E2E-AUTH-SIGNUP-003
 * Priority: P0 (Critical)
 */

import { test, expect } from '@playwright/test';
import { AuthHelper } from '@/tests/helpers/auth-helpers';

test.describe('Authentication - Signup Success', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    
    // Listen to browser console
    page.on('console', msg => console.log('BROWSER:', msg.text()));
    page.on('pageerror', error => console.error('PAGE ERROR:', error));
  });

  test('E2E-AUTH-SIGNUP-001: should complete signup with valid data', async ({ page }) => {
    // Arrange
    const timestamp = Date.now();
    const testUser = {
      fullName: 'Test Parent',
      email: `test.parent${timestamp}@emberascent.dev`,
      password: 'TestPass123!',
    };

    // Act
    await authHelper.goToSignup();
    
    // Fill signup form
    await page.fill('input[name="fullName"]', testUser.fullName);
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.fill('input[name="confirmPassword"]', testUser.password);
    
    // Check terms and conditions
    await page.check('input[name="agreedToTerms"]');
    
    // Submit form
    await page.click('button[type="submit"]');

    // Assert
    // Should show success message
    await expect(page.locator('text=Account created')).toBeVisible({ timeout: 10000 });
    
    // Should redirect to setup or practice
    await page.waitForURL(/\/(setup|practice)/, { timeout: 10000 });
  });

  test('E2E-AUTH-SIGNUP-002: should redirect to setup after signup', async ({ page }) => {
    // Arrange
    const timestamp = Date.now();
    const testUser = {
      fullName: 'Test Parent Setup',
      email: `test.setup${timestamp}@emberascent.dev`,
      password: 'TestPass123!',
    };

    // Act
    await authHelper.goToSignup();
    await page.fill('input[name="fullName"]', testUser.fullName);
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.fill('input[name="confirmPassword"]', testUser.password);
    await page.check('input[name="agreedToTerms"]');
    await page.click('button[type="submit"]');

    // Assert
    // Wait for either setup or practice page (depends on email verification setting)
    await page.waitForURL(/\/(setup|practice)/, { timeout: 15000 });
    
    const currentUrl = page.url();
    console.log('Redirected to:', currentUrl);
    expect(currentUrl).toMatch(/\/(setup|practice)/);
  });

  test('E2E-AUTH-SIGNUP-003: should create profile in database', async ({ page }) => {
    // Note: This test requires database access to verify profile creation
    // For now, we'll verify the user is authenticated after signup
    
    // Arrange
    const timestamp = Date.now();
    const testUser = {
      fullName: 'Test Database User',
      email: `test.db${timestamp}@emberascent.dev`,
      password: 'TestPass123!',
    };

    // Act
    await authHelper.goToSignup();
    await page.fill('input[name="fullName"]', testUser.fullName);
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.fill('input[name="confirmPassword"]', testUser.password);
    await page.check('input[name="agreedToTerms"]');
    await page.click('button[type="submit"]');
    
    // Wait for redirect
    await page.waitForURL(/\/(setup|practice)/, { timeout: 15000 });

    // Assert
    // Check if user is authenticated by looking for user menu
    const isAuthenticated = await authHelper.isAuthenticated();
    expect(isAuthenticated).toBe(true);
    
    // TODO: Add database query to verify profile exists
    // const profile = await db.profiles.findOne({ email: testUser.email })
    // expect(profile).toBeTruthy()
    // expect(profile.full_name).toBe(testUser.fullName)
  });
});
