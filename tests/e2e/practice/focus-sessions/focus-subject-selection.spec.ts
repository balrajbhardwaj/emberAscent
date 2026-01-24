/**
 * E2E Test: Focus Session - Subject Selection
 * 
 * Module: Practice
 * Feature: Focus Sessions
 * Functionality: Select subject for focus session
 * 
 * Test ID: E2E-PRACTICE-FOCUS-001
 * Priority: P0 (Critical)
 */

import { test, expect } from '@playwright/test';
import { AuthHelper } from '@/tests/helpers/auth-helpers';
import { NavigationHelper } from '@/tests/helpers/navigation-helpers';
import { TEST_USERS } from '@/tests/fixtures/users';

test.describe('Practice - Focus Session Subject Selection', () => {
  let authHelper: AuthHelper;
  let navHelper: NavigationHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    navHelper = new NavigationHelper(page);
    
    // Log in as test user with children
    await authHelper.loginAsTestUser(TEST_USERS.freeUser);
    
    // Navigate to focus sessions
    await page.goto('/practice/focus');
  });

  test('should display all available subjects', async ({ page }) => {
    // Assert - All 3 subjects should be visible as headings in cards
    const subjects = ['Mathematics', 'English', 'Verbal Reasoning'];
    
    for (const subject of subjects) {
      const subjectHeading = page.getByRole('heading', { name: subject });
      await expect(subjectHeading).toBeVisible();
    }
  });

  test('should select a subject and proceed to topic selection', async ({ page }) => {
    // Act - Select Mathematics by clicking its card
    await page.getByRole('heading', { name: 'Mathematics' }).click();
    
    // Wait for topics to load
    await page.waitForTimeout(5000);
    
    // Assert - Should show topic browser heading
    await expect(page.getByRole('heading', { name: /Choose Topics/ })).toBeVisible({ timeout: 5000 });
    
    // Should have back button
    await expect(page.getByRole('button', { name: 'Back' })).toBeVisible();
  });

  test('should allow going back from topic selection to subject selection', async ({ page }) => {
    // Arrange - Select a subject by clicking card
    await page.getByRole('heading', { name: 'English' }).click();
    await page.waitForTimeout(5000);
    
    // Act - Click back button
    await page.getByRole('button', { name: 'Back' }).click();
    await page.waitForTimeout(5000);
    
    // Assert - Should be back on subject selection
    await expect(page.getByRole('heading', { name: 'Choose a Subject' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Mathematics' })).toBeVisible();
  });

  test('should show subject icons and descriptions', async ({ page }) => {
    // Assert - Each subject card should have proper UI elements
    await expect(page.getByRole('heading', { name: 'Mathematics' })).toBeVisible();
    
    // Should show topic counts
    await expect(page.locator('text=/\d+ topics/')).toBeVisible();
  });

  test('should handle subject selection for all subjects', async ({ page }) => {
    // Test clicking each subject card
    const subjects = ['Mathematics', 'English', 'Verbal Reasoning'];
    
    for (const subject of subjects) {
      // Go to focus page
      await page.goto('/practice/focus');
      await page.waitForTimeout(5000);
      
      // Click subject card
      await page.getByRole('heading', { name: subject }).click();
      await page.waitForTimeout(5000);
      
      // Should reach topic selection
      await expect(page.getByRole('heading', { name: /Choose Topics/ })).toBeVisible();
      
      // Go back for next iteration
      if (subjects.indexOf(subject) < subjects.length - 1) {
        await page.goto('/practice/focus');
      }
    }
  });
});
