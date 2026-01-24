/**
 * E2E Test: Signup Validation
 * 
 * Module: Authentication
 * Feature: User Registration
 * Functionality: Form validation for signup
 * 
 * Test IDs: E2E-AUTH-SIGNUP-004 through E2E-AUTH-SIGNUP-009
 * Priority: P1 (High)
 */

import { test, expect } from '@playwright/test';
import { AuthHelper } from '@/tests/helpers/auth-helpers';

test.describe('Authentication - Signup Validation', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    await authHelper.goToSignup();
  });

  test('E2E-AUTH-SIGNUP-006: should reject weak password', async ({ page }) => {
    // Arrange
    const weakPasswords = [
      'short',           // Too short
      'alllowercase',    // No uppercase
      'ALLUPPERCASE',    // No lowercase
      'NoNumbers',       // No numbers
    ];

    for (const password of weakPasswords) {
      // Act
      await page.fill('input[name="fullName"]', 'Test User');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', password);
      await page.fill('input[name="confirmPassword"]', password);
      
      // Try to submit
      await page.click('button[type="submit"]');

      // Assert
      // Should show password validation error
      const errorMessage = page.locator('text=/Password must|characters|uppercase|lowercase|number/i');
      await expect(errorMessage).toBeVisible({ timeout: 3000 });
      
      // Reload page for next test
      await page.reload();
    }
  });

  test('E2E-AUTH-SIGNUP-007: should reject mismatched passwords', async ({ page }) => {
    // Act
    await page.fill('input[name="fullName"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'TestPass123!');
    await page.fill('input[name="confirmPassword"]', 'DifferentPass123!');
    await page.check('input[name="agreedToTerms"]');
    await page.click('button[type="submit"]');

    // Assert
    const errorMessage = page.locator('text=/Passwords.*match/i');
    await expect(errorMessage).toBeVisible({ timeout: 3000 });
  });

  test('E2E-AUTH-SIGNUP-008: should require terms agreement', async ({ page }) => {
    // Act
    await page.fill('input[name="fullName"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'TestPass123!');
    await page.fill('input[name="confirmPassword"]', 'TestPass123!');
    // Don't check terms box
    await page.click('button[type="submit"]');

    // Assert
    const errorMessage = page.locator('text=/agree.*terms/i');
    await expect(errorMessage).toBeVisible({ timeout: 3000 });
  });

  test.skip('E2E-AUTH-SIGNUP-004: should reject short full name', async ({ page }) => {
    // TODO: Implement
  });

  test.skip('E2E-AUTH-SIGNUP-005: should reject invalid email format', async ({ page }) => {
    // TODO: Implement
  });

  test.skip('E2E-AUTH-SIGNUP-009: should reject duplicate email', async ({ page }) => {
    // TODO: Implement - requires existing test user
  });
});
