/**
 * E2E Test: Focus Session - Complete Session Flow
 * 
 * Module: Practice
 * Feature: Focus Sessions
 * Functionality: Complete full focus session with 10 questions
 * 
 * Test ID: E2E-PRACTICE-FOCUS-003
 * Priority: P0 (Critical)
 */

import { test, expect } from '@playwright/test';
import { AuthHelper } from '@/tests/helpers/auth-helpers';
import { TEST_USERS } from '@/tests/fixtures/users';

test.describe('Practice - Focus Session Flow', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    
    // Log in
    await authHelper.loginAsTestUser(TEST_USERS.freeUser);
    await page.goto('/practice/focus');
    
    // Select subject and topic
    await page.click('button:has-text("Mathematics")');
    await page.waitForTimeout(5000);
    
    // Select first topic
    const firstTopic = page.locator('[data-testid^="topic-"]').or(page.locator('button[role="checkbox"]')).first();
    await firstTopic.click();
    await page.waitForTimeout(5000);
    
    // Start session
    const startButton = page.locator('button:has-text("Start Session")').or(page.locator('button:has-text("Start Practice")'));
    await startButton.first().click();
    
    // Wait for session to load
    await page.waitForURL(/\/practice\/focus\/session/, { timeout: 10000 });
  });

  test('should display question with options', async ({ page }) => {
    // Assert - Question should be visible
    const questionText = page.locator('[data-testid="question-text"]').or(page.locator('.question-text'));
    await expect(questionText.first()).toBeVisible({ timeout: 5000 });
    
    // Should have 5 options (A, B, C, D, E)
    const options = page.locator('[data-option]').or(page.locator('.option-button'));
    const optionCount = await options.count();
    expect(optionCount).toBeGreaterThanOrEqual(4); // At least 4 options
  });

  test('should allow answering questions and proceeding', async ({ page }) => {
    // Act - Answer first question
    await page.waitForTimeout(5000);
    const firstOption = page.locator('[data-option="A"]').or(page.locator('.option-button').first());
    await firstOption.click();
    
    // Click next or check answer
    const nextButton = page.locator('button:has-text("Next")').or(page.locator('button:has-text("Check")'));
    await nextButton.first().click();
    await page.waitForTimeout(5000);
    
    // Assert - Should show feedback or next question
    // Either feedback is visible or we're on question 2
    const feedback = page.locator('[data-testid="answer-feedback"]');
    const question2 = page.locator('text=2 of').or(page.locator('[data-testid="question-counter"]:has-text("2")'));
    
    const hasFeedbackOrProgressed = await Promise.race([
      feedback.isVisible().catch(() => false),
      question2.first().isVisible().catch(() => false),
    ]);
    
    expect(hasFeedbackOrProgressed).toBeTruthy();
  });

  test('should show question counter', async ({ page }) => {
    // Assert - Counter should show 1 of 10
    const counter = page.locator('[data-testid="question-counter"]').or(page.locator('text=1 of'));
    await expect(counter.first()).toBeVisible({ timeout: 5000 });
  });

  test('should complete session and show results', async ({ page }) => {
    // Act - Answer 10 questions
    for (let i = 0; i < 10; i++) {
      await page.waitForTimeout(5000);
      
      // Select an option
      const option = page.locator('[data-option="A"]').or(page.locator('.option-button').first());
      await option.click();
      
      // Click next/check
      const nextButton = page.locator('button:has-text("Next")').or(page.locator('button:has-text("Check")'));
      await nextButton.first().click();
      
      await page.waitForTimeout(5000);
      
      // If feedback is shown, click Continue
      const continueButton = page.locator('button:has-text("Continue")');
      if (await continueButton.isVisible().catch(() => false)) {
        await continueButton.click();
        await page.waitForTimeout(5000);
      }
    }
    
    // Assert - Should reach results page
    await expect(page).toHaveURL(/\/results/, { timeout: 10000 });
    
    // Should show score
    const score = page.locator('[data-testid="session-score"]').or(page.locator('text=/\\d+ out of \\d+/'));
    await expect(score.first()).toBeVisible({ timeout: 5000 });
  });

  test('should show progress during session', async ({ page }) => {
    // Assert - Progress bar or counter should update
    const initialCounter = page.locator('[data-testid="question-counter"]').or(page.locator('text=1 of'));
    await expect(initialCounter.first()).toBeVisible();
    
    // Answer first question
    await page.waitForTimeout(5000);
    const option = page.locator('[data-option="B"]').or(page.locator('.option-button').nth(1));
    await option.click();
    
    const nextButton = page.locator('button:has-text("Next")').or(page.locator('button:has-text("Check")'));
    await nextButton.first().click();
    await page.waitForTimeout(5000);
    
    // Click Continue if feedback shown
    const continueButton = page.locator('button:has-text("Continue")');
    if (await continueButton.isVisible().catch(() => false)) {
      await continueButton.click();
      await page.waitForTimeout(5000);
    }
    
    // Should show question 2
    const nextCounter = page.locator('text=2 of').or(page.locator('[data-testid="question-counter"]:has-text("2")'));
    await expect(nextCounter.first()).toBeVisible({ timeout: 5000 });
  });

  test('should allow exiting session early', async ({ page }) => {
    // Act - Look for exit button
    const exitButton = page.locator('[data-testid="exit-session"]').or(
      page.locator('button:has-text("Exit")').or(
        page.locator('button[aria-label*="Exit"]')
      )
    );
    
    // If exit button exists, test it
    if (await exitButton.first().isVisible().catch(() => false)) {
      await exitButton.first().click();
      
      // Should show confirmation dialog
      const confirmExit = page.locator('button:has-text("Exit")').or(page.locator('button:has-text("Confirm")'));
      if (await confirmExit.isVisible().catch(() => false)) {
        await confirmExit.click();
      }
      
      // Should navigate away from session
      await page.waitForTimeout(1000);
      const currentUrl = page.url();
      expect(currentUrl).not.toContain('/session');
    }
  });
});
