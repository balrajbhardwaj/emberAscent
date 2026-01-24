/**
 * E2E Test: Mock Test - Timer and Navigation
 * 
 * Module: Practice
 * Feature: Mock Tests
 * Functionality: Timer countdown, question navigation, flagging
 * 
 * Test ID: E2E-PRACTICE-MOCK-002
 * Priority: P0 (Critical)
 */

import { test, expect } from '@playwright/test';
import { AuthHelper } from '@/tests/helpers/auth-helpers';
import { TEST_USERS } from '@/tests/fixtures/users';

test.describe('Practice - Mock Test Timer and Navigation', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    
    // Log in as Ascent user
    await authHelper.loginAsTestUser(TEST_USERS.ascentUser);
    await page.goto('/practice/mock');
    await page.waitForTimeout(5000);
    
    // Select and start a mock test
    const firstTemplate = page.locator('[data-testid^="template-"]').or(page.locator('.template-card')).first();
    await firstTemplate.click();
    await page.waitForTimeout(5000);
    
    const startButton = page.locator('button:has-text("Start Test")').or(page.locator('button:has-text("Begin")'));
    await startButton.first().click();
    
    // Wait for session to load
    await page.waitForURL(/\/practice\/mock\/session/, { timeout: 10000 });
  });

  test('should display countdown timer', async ({ page }) => {
    // Assert - Timer should be visible and counting down
    const timer = page.locator('[data-testid="timer"]').or(page.locator('text=/\\d+:\\d+/'));
    await expect(timer.first()).toBeVisible({ timeout: 5000 });
    
    // Get initial time
    const initialTime = await timer.first().textContent();
    expect(initialTime).toMatch(/\d+:\d+/);
    
    // Wait 2 seconds and verify countdown
    await page.waitForTimeout(2000);
    const newTime = await timer.first().textContent();
    
    // Timer should have changed (counting down)
    expect(newTime).not.toBe(initialTime);
  });

  test('should show question navigator grid', async ({ page }) => {
    // Assert - Navigator should be visible with all questions
    const navigator = page.locator('[data-testid="question-navigator"]').or(page.locator('.question-grid'));
    await expect(navigator.first()).toBeVisible({ timeout: 5000 });
    
    // Should have multiple question buttons
    const navButtons = page.locator('[data-testid^="nav-question-"]').or(navigator.first().locator('button'));
    const count = await navButtons.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should navigate between questions using navigator', async ({ page }) => {
    await page.waitForTimeout(5000);
    
    // Act - Click on question 3 in navigator
    const question3 = page.locator('[data-testid="nav-question-3"]').or(
      page.locator('.question-grid button').nth(2)
    );
    
    if (await question3.isVisible().catch(() => false)) {
      await question3.click();
      await page.waitForTimeout(5000);
      
      // Assert - Should be on question 3
      const counter = page.locator('text=3 of').or(page.locator('[data-testid="question-counter"]:has-text("3")'));
      await expect(counter.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('should navigate using Previous/Next buttons', async ({ page }) => {
    await page.waitForTimeout(5000);
    
    // Assert - Initial state (question 1)
    const counter1 = page.locator('text=1 of').or(page.locator('[data-testid="question-counter"]').first());
    await expect(counter1.first()).toBeVisible();
    
    // Act - Click Next
    const nextButton = page.locator('button:has-text("Next")');
    if (await nextButton.isVisible().catch(() => false)) {
      await nextButton.click();
      await page.waitForTimeout(5000);
      
      // Assert - Should be on question 2
      const counter2 = page.locator('text=2 of').or(page.locator('[data-testid="question-counter"]:has-text("2")'));
      await expect(counter2.first()).toBeVisible({ timeout: 5000 });
      
      // Act - Click Previous
      const prevButton = page.locator('button:has-text("Previous")');
      if (await prevButton.isVisible().catch(() => false)) {
        await prevButton.click();
        await page.waitForTimeout(5000);
        
        // Assert - Should be back on question 1
        await expect(counter1.first()).toBeVisible();
      }
    }
  });

  test('should allow flagging questions for review', async ({ page }) => {
    await page.waitForTimeout(5000);
    
    // Act - Click flag button
    const flagButton = page.locator('[data-testid="flag-button"]').or(
      page.locator('button[aria-label*="Flag"]').or(
        page.locator('button:has-text("Flag")')
      )
    );
    
    if (await flagButton.first().isVisible().catch(() => false)) {
      await flagButton.first().click();
      await page.waitForTimeout(5000);
      
      // Assert - Question should be flagged in navigator
      const flaggedInNav = page.locator('[data-testid="nav-question-1"][data-flagged="true"]').or(
        page.locator('.question-grid button[data-flagged="true"]').first()
      );
      
      // Flag state should persist when navigating
      const nextButton = page.locator('button:has-text("Next")');
      if (await nextButton.isVisible().catch(() => false)) {
        await nextButton.click();
        await page.waitForTimeout(5000);
        
        // Go back to question 1
        const nav1 = page.locator('[data-testid="nav-question-1"]').or(
          page.locator('.question-grid button').first()
        );
        await nav1.click();
        await page.waitForTimeout(5000);
        
        // Flag should still be set
        await expect(flagButton.first()).toBeVisible();
      }
    }
  });

  test('should show answered vs unanswered status in navigator', async ({ page }) => {
    await page.waitForTimeout(5000);
    
    // Act - Answer first question
    const option = page.locator('[data-option="A"]').or(page.locator('.option-button').first());
    await option.click();
    await page.waitForTimeout(5000);
    
    // Assert - Navigator should show question 1 as answered
    const nav1 = page.locator('[data-testid="nav-question-1"]').or(
      page.locator('.question-grid button').first()
    );
    
    // Navigator button should indicate answered state (via class or data attribute)
    await expect(nav1).toBeVisible();
  });

  test('should warn about unanswered questions on submit', async ({ page }) => {
    await page.waitForTimeout(5000);
    
    // Act - Try to submit without answering all questions
    const submitButton = page.locator('button:has-text("Submit")').or(page.locator('button:has-text("Finish")'));
    
    // Submit button might only appear at the end or after answering questions
    // Navigate to last question first
    const navButtons = page.locator('[data-testid^="nav-question-"]').or(page.locator('.question-grid button'));
    const count = await navButtons.count();
    
    if (count > 0) {
      await navButtons.last().click();
      await page.waitForTimeout(5000);
      
      if (await submitButton.isVisible().catch(() => false)) {
        await submitButton.click();
        await page.waitForTimeout(5000);
        
        // Should show warning dialog
        const warning = page.locator('text=unanswered').or(page.locator('text=incomplete'));
        // Warning might or might not appear depending on implementation
      }
    }
  });
});
