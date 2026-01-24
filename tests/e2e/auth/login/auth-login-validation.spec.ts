/**
 * E2E Test: Login Validation
 * 
 * Module: Authentication
 * Feature: Login
 * Functionality: Login form shows validation errors
 * 
 * Test ID: E2E-AUTH-LOGIN-002
 * Priority: P1 (High)
 */

import { test, expect } from '@playwright/test';
import { AuthHelper } from '@/tests/helpers/auth-helpers';

test.describe('Authentication - Login Validation', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    await authHelper.goToLogin();
  });

  test('should show error for invalid email format', async ({ page }) => {
    // Arrange
    await page.fill('input[name="email"]', 'not-an-email');
    await page.fill('input[name="password"]', 'SomePassword123!');

    // Act
    await page.click('button[type="submit"]');

    // Assert
    const errorMessage = page.locator('text=/invalid.*email/i');
    await expect(errorMessage).toBeVisible();
  });

  test('should show error for empty fields', async ({ page }) => {
    // Act
    await page.click('button[type="submit"]');

    // Assert
    const emailError = page.locator('[data-field="email"] + .error-message');
    const passwordError = page.locator('[data-field="password"] + .error-message');
    
    await expect(emailError).toBeVisible();
    await expect(passwordError).toBeVisible();
  });

  test('should show error for incorrect credentials', async ({ page }) => {
    // Arrange
    await page.fill('input[name="email"]', 'wrong@email.com');
    await page.fill('input[name="password"]', 'WrongPassword123!');

    // Act
    await page.click('button[type="submit"]');

    // Assert
    const errorMessage = page.locator('text=/invalid.*credentials/i');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });

  test('should disable submit button while processing', async ({ page }) => {
    // Arrange
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Password123!');

    // Act
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Assert
    await expect(submitButton).toBeDisabled();
  });
});
