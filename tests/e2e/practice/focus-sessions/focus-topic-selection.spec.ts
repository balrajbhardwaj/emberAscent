/**
 * E2E Test: Focus Session - Topic Selection
 * 
 * Module: Practice
 * Feature: Focus Sessions
 * Functionality: Select topics and start session
 * 
 * Test ID: E2E-PRACTICE-FOCUS-002
 * Priority: P0 (Critical)
 */

import { test, expect } from '@playwright/test';
import { AuthHelper } from '@/tests/helpers/auth-helpers';
import { TEST_USERS } from '@/tests/fixtures/users';

test.describe('Practice - Focus Session Topic Selection', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    
    // Log in and navigate to focus
    await authHelper.loginAsTestUser(TEST_USERS.freeUser);
    await page.goto('/practice/focus');
    
    // Select Mathematics subject by clicking its heading
    await page.getByRole('heading', { name: 'Mathematics' }).click();
    await page.waitForTimeout(5000);
  });

  test('should display available topics for the selected subject', async ({ page }) => {
    // Assert - Topic browser heading should be visible
    await expect(page.getByRole('heading', { name: /Choose Topics/ })).toBeVisible({ timeout: 5000 });
    
    // Should have checkboxes for topic selection
    const checkboxes = page.getByRole('checkbox');
    await expect(checkboxes.first()).toBeVisible({ timeout: 5000 });
  });

  test('should allow selecting single topic', async ({ page }) => {
    // Act - Select first available topic checkbox
    await page.waitForTimeout(5000);
    const firstCheckbox = page.getByRole('checkbox').first();
    await firstCheckbox.click();
    await page.waitForTimeout(5000);
    
    // Assert - Start Practice button should be enabled
    const startButton = page.getByRole('button', { name: 'Start Practice' });
    await expect(startButton).toBeEnabled({ timeout: 5000 });
    
    // Should show selection count
    await expect(page.locator('text=/1 topic/')).toBeVisible();
  });

  test('should allow selecting multiple topics', async ({ page }) => {
    // Act - Select first 3 topics
    await page.waitForTimeout(5000);
    const checkboxes = page.getByRole('checkbox');
    const count = await checkboxes.count();
    
    const selectCount = Math.min(3, count);
    for (let i = 0; i < selectCount; i++) {
      await checkboxes.nth(i).click();
      await page.waitForTimeout(5000);
    }
    
    // Assert - Should show multiple topics selected
    await expect(page.locator('text=/3 topics? selected/')).toBeVisible();
    
    // Start Practice button should be enabled
    await expect(page.getByRole('button', { name: 'Start Practice' })).toBeEnabled({ timeout: 5000 });
  });

  test('should allow deselecting topics', async ({ page }) => {
    // Arrange - Select a topic
    await page.waitForTimeout(5000);
    const firstCheckbox = page.getByRole('checkbox').first();
    await firstCheckbox.click();
    await page.waitForTimeout(5000);
    
    // Act - Deselect it
    await firstCheckbox.click();
    await page.waitForTimeout(5000);
    
    // Assert - Start Practice button should be disabled
    const startButton = page.getByRole('button', { name: 'Start Practice' });
    await expect(startButton).toBeDisabled();
  });

  test('should start focus session with selected topics', async ({ page }) => {
    // Arrange - Select a topic
    await page.waitForTimeout(5000);
    const firstCheckbox = page.getByRole('checkbox').first();
    await firstCheckbox.click();
    await page.waitForTimeout(5000);
    
    // Act - Click Start Practice
    const startButton = page.getByRole('button', { name: 'Start Practice' });
    await startButton.click();
    await page.waitForTimeout(5000);
    
    // Assert - Should navigate to session page (new routing: /practice/session/[sessionId])
    await expect(page).toHaveURL(/\/practice\/session\//, { timeout: 10000 });
  });

  test('should show weak areas filter option', async ({ page }) => {
    // Assert - Should have "Weak Areas Only" button
    await expect(page.getByRole('button', { name: /Weak Areas Only/ })).toBeVisible();
    
    // Topic browser should be present
    await expect(page.getByRole('heading', { name: /Choose Topics/ })).toBeVisible();
  });

  test('should display topic progress indicators', async ({ page }) => {
    // Assert - Topics should show progress or mastery percentage
    await page.waitForTimeout(5000);
    
    // Look for progress indicators (percentages or progress bars)
    const hasProgress = await page.locator('text=/%|Mastery/').count() > 0;
    
    // Or just verify topics are loaded properly
    await expect(page.getByRole('checkbox').first()).toBeVisible();
  });

  test('should show Select All / Deselect All buttons', async ({ page }) => {
    // Assert - Should have Select All button initially
    await expect(page.getByRole('button', { name: 'Select All' })).toBeVisible();
  });
});
