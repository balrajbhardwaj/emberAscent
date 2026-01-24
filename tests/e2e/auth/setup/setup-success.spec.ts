/**
 * E2E Test: Child Setup Success
 * 
 * Module: Authentication
 * Feature: Onboarding
 * Functionality: Parent can create first child profile
 * 
 * Test IDs: E2E-AUTH-SETUP-001 through E2E-AUTH-SETUP-005
 * Priority: P0 (Critical)
 */

import { test, expect } from '@playwright/test';
import { AuthHelper } from '@/tests/helpers/auth-helpers';

test.describe('Authentication - Child Setup Success', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    
    page.on('console', msg => console.log('BROWSER:', msg.text()));
    page.on('pageerror', error => console.error('PAGE ERROR:', error));
  });

  test('E2E-AUTH-SETUP-001: should complete child setup with all fields', async ({ page }) => {
    // Arrange - Create new user first
    const timestamp = Date.now();
    const testUser = {
      fullName: 'Test Parent Full',
      email: `test.full${timestamp}@emberascent.dev`,
      password: 'TestPass123!',
    };
    
    const childData = {
      name: 'Emma',
      yearGroup: '5',
      targetSchool: 'King Edward VI Grammar',
      avatar: 'girl-1',
    };

    // Act - Signup
    await authHelper.goToSignup();
    await page.fill('input[name="fullName"]', testUser.fullName);
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.fill('input[name="confirmPassword"]', testUser.password);
    await page.check('input[name="agreedToTerms"]');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to setup or practice
    await page.waitForURL(/\/(setup|practice)/, { timeout: 15000 });
    
    // If on practice, navigate to setup manually (for testing)
    if (page.url().includes('/practice')) {
      console.log('User redirected to practice, navigating to setup for test');
      await page.goto('/setup');
    }

    // Complete child setup
    await page.fill('input[name="name"]', childData.name);
    await page.selectOption('select[name="yearGroup"]', childData.yearGroup);
    await page.fill('input[name="targetSchool"]', childData.targetSchool);
    
    // Select avatar (if visible)
    const avatarButton = page.locator(`button[data-avatar="${childData.avatar}"]`);
    if (await avatarButton.isVisible()) {
      await avatarButton.click();
    }
    
    // Submit form
    await page.click('button[type="submit"]');

    // Assert
    // Should show success message
    await expect(page.locator('text=/profile.*created|Success/i')).toBeVisible({ timeout: 10000 });
    
    // Should redirect to practice
    await expect(page).toHaveURL(/\/practice/, { timeout: 10000 });
  });

  test('E2E-AUTH-SETUP-002: should complete setup with minimal data', async ({ page }) => {
    // Arrange - Create new user
    const timestamp = Date.now();
    const testUser = {
      fullName: 'Test Parent Minimal',
      email: `test.minimal${timestamp}@emberascent.dev`,
      password: 'TestPass123!',
    };
    
    const childData = {
      name: 'Oliver',
      yearGroup: '4',
    };

    // Act - Signup
    await authHelper.goToSignup();
    await page.fill('input[name="fullName"]', testUser.fullName);
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.fill('input[name="confirmPassword"]', testUser.password);
    await page.check('input[name="agreedToTerms"]');
    await page.click('button[type="submit"]');
    
    await page.waitForURL(/\/(setup|practice)/, { timeout: 15000 });
    
    if (page.url().includes('/practice')) {
      await page.goto('/setup');
    }

    // Complete setup with minimal data (name + year group only)
    await page.fill('input[name="name"]', childData.name);
    await page.selectOption('select[name="yearGroup"]', childData.yearGroup);
    await page.click('button[type="submit"]');

    // Assert
    await expect(page).toHaveURL(/\/practice/, { timeout: 10000 });
  });

  test('E2E-AUTH-SETUP-004: should redirect to practice after setup', async ({ page }) => {
    // This is tested as part of SETUP-001 and SETUP-002
    // Separate test for clarity
    
    // Arrange
    const timestamp = Date.now();
    const testUser = {
      fullName: 'Test Redirect User',
      email: `test.redirect${timestamp}@emberascent.dev`,
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
    
    await page.waitForURL(/\/(setup|practice)/, { timeout: 15000 });
    
    if (page.url().includes('/practice')) {
      await page.goto('/setup');
    }

    // Complete setup
    await page.fill('input[name="name"]', 'James');
    await page.selectOption('select[name="yearGroup"]', '6');
    await page.click('button[type="submit"]');

    // Assert
    // Should be on practice page
    await expect(page).toHaveURL(/\/practice/, { timeout: 10000 });
    
    // Should see practice dashboard elements
    const dashboardHeading = page.locator('h1, h2').first();
    await expect(dashboardHeading).toBeVisible();
  });

  test.skip('E2E-AUTH-SETUP-003: should select avatar from picker', async ({ page }) => {
    // TODO: Implement avatar selection test
  });

  test.skip('E2E-AUTH-SETUP-005: should create child in database', async ({ page }) => {
    // TODO: Implement database verification
  });
});
