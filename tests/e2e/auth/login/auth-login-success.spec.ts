/**
 * E2E Test: Login Success
 * 
 * Module: Authentication
 * Feature: Login
 * Functionality: User can log in with valid credentials
 * 
 * Test ID: E2E-AUTH-LOGIN-001
 * Priority: P0 (Critical)
 */

import { test, expect } from '@playwright/test';
import { AuthHelper } from '@/tests/helpers/auth-helpers';
import { TEST_USERS } from '@/tests/fixtures/users';

test.describe('Authentication - Login Success', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    
    // Listen to browser console
    page.on('console', msg => console.log('BROWSER:', msg.text()));
    page.on('pageerror', error => console.error('PAGE ERROR:', error));
  });

  test('should successfully log in with valid credentials', async ({ page }) => {
    // Arrange
    const testUser = TEST_USERS.freeUser;

    // Act
    await authHelper.login(testUser.email, testUser.password);

    // Assert
    // Should redirect to practice dashboard
    await expect(page).toHaveURL(/\/(practice|setup)/);
    
    // User menu should be visible
    const isAuth = await authHelper.isAuthenticated();
    expect(isAuth).toBe(true);
    
    // Should see welcome message or dashboard
    const welcomeOrDashboard = page.locator('h1, h2').first();
    await expect(welcomeOrDashboard).toBeVisible();
  });

  test('should maintain session after page reload', async ({ page }) => {
    // Arrange
    const testUser = TEST_USERS.freeUser;
    await authHelper.login(testUser.email, testUser.password);

    // Act
    await page.reload();

    // Assert
    const isAuth = await authHelper.isAuthenticated();
    expect(isAuth).toBe(true);
  });

  test('should log out successfully', async ({ page }) => {
    // Arrange
    const testUser = TEST_USERS.freeUser;
    await authHelper.login(testUser.email, testUser.password);

    // Act
    await authHelper.logout();

    // Assert
    await expect(page).toHaveURL('/login');
    const isAuth = await authHelper.isAuthenticated();
    expect(isAuth).toBe(false);
  });
});
