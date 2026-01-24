/**
 * E2E Test: Mock Test - Template Selection
 * 
 * Module: Practice
 * Feature: Mock Tests
 * Functionality: Select mock test template and configure
 * 
 * Test ID: E2E-PRACTICE-MOCK-001
 * Priority: P0 (Critical)
 */

import { test, expect } from '@playwright/test';
import { AuthHelper } from '@/tests/helpers/auth-helpers';
import { TEST_USERS } from '@/tests/fixtures/users';

test.describe('Practice - Mock Test Template Selection', () => {
  let authHelper: AuthHelper;

  test.describe('Free Tier User - Paywall', () => {
    test.beforeEach(async ({ page }) => {
      authHelper = new AuthHelper(page);
      
      // Log in as FREE tier user
      await authHelper.loginAsTestUser(TEST_USERS.freeUser);
      await page.goto('/practice/mock');
    });

    test('should show paywall for free tier users', async ({ page }) => {
      // Assert - Paywall heading should be visible
      await expect(page.getByRole('heading', { name: 'Mock Tests' })).toBeVisible({ timeout: 5000 });
      
      // Should show description about feature being locked
      await expect(page.locator('text=/exam conditions|timed test/i')).toBeVisible();
      
      // Should not show template cards
      const templateCards = page.locator('[data-testid^="template-"]');
      expect(await templateCards.count()).toBe(0);
    });

    test('should not allow starting mock test', async ({ page }) => {
      // Assert - No test templates should be accessible
      const startButton = page.locator('button:has-text("Start Test")');
      expect(await startButton.count()).toBe(0);
    });
  });

  test.describe('Ascent Tier User - Full Access', () => {
    test.beforeEach(async ({ page }) => {
      authHelper = new AuthHelper(page);
      
      // Log in as ASCENT tier user
      await authHelper.loginAsTestUser(TEST_USERS.ascentUser);
      await page.goto('/practice/mock');
    });

    test('should display all mock test templates', async ({ page }) => {
      // Assert - Should see "Choose a Test" heading
      await expect(page.getByRole('heading', { name: 'Choose a Test' })).toBeVisible({ timeout: 5000 });
      
      // Should have multiple template cards
      await page.waitForTimeout(5000);
      const cards = page.locator('[class*="cursor-pointer"]').filter({ hasText: /questions/ });
      const count = await cards.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should show template details', async ({ page }) => {
      await page.waitForTimeout(5000);
      
      // Assert - Templates should show question count and time limit
      await expect(page.locator('text=/\d+ questions/')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('text=/\d+ min/')).toBeVisible({ timeout: 5000 });
    });

    test('should allow selecting a template', async ({ page }) => {
      await page.waitForTimeout(5000);
      
      // Act - Click on first template card that has "questions" text
      const firstTemplate = page.locator('[class*="cursor-pointer"]').filter({ hasText: /questions/ }).first();
      await firstTemplate.click();
      await page.waitForTimeout(5000);
      
      // Assert - Card should be highlighted with blue ring
      await expect(firstTemplate).toHaveClass(/ring-blue-500/);
    });

    test('should start mock test', async ({ page }) => {
      await page.waitForTimeout(5000);
      
      // Act - Select first template
      const firstTemplate = page.locator('[class*="cursor-pointer"]').filter({ hasText: /questions/ }).first();
      await firstTemplate.click();
      await page.waitForTimeout(5000);
      
      // Click Start Test button
      await page.getByRole('button', { name: 'Start Test' }).click();
      await page.waitForTimeout(5000);
      
      // Assert - Should navigate to mock test interface
      await expect(page).toHaveURL(/\/practice\/mock\//, { timeout: 10000 });
    });

    test('should show template badges and styles', async ({ page }) => {
      await page.waitForTimeout(5000);
      
      // Assert - Templates should have visual elements (badges, icons)
      const badge = page.locator('[class*=\"badge\"]').or(page.locator('text=/Standard|Quick|Focus/'));
      await expect(badge.first()).toBeVisible({ timeout: 5000 });
    });
  });
});
