/**
 * E2E Test: Quick Byte Session Flow
 * 
 * Module: Practice
 * Feature: Quick Byte
 * Functionality: Complete a full Quick Byte session
 * 
 * Test ID: E2E-PRACTICE-QB-001
 * Priority: P0 (Critical)
 */

import { test, expect } from '@playwright/test';
import { AuthHelper } from '@/tests/helpers/auth-helpers';
import { NavigationHelper } from '@/tests/helpers/navigation-helpers';
import { TEST_USERS } from '@/tests/fixtures/users';

test.describe('Practice - Quick Byte Session', () => {
  let authHelper: AuthHelper;
  let navHelper: NavigationHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    navHelper = new NavigationHelper(page);
    
    // Log in as test user with children
    await authHelper.loginAsTestUser(TEST_USERS.freeUser);
  });

  test('should start and complete a Quick Byte session', async ({ page }) => {
    // Act - Start Quick Byte
    await navHelper.startQuickByte('mathematics');

    // Assert - Session started
    await expect(page).toHaveURL(/\/practice\/quick-byte\/session/);
    
    // Should see question
    const questionText = page.locator('[data-testid="question-text"]');
    await expect(questionText).toBeVisible();
    
    // Should see 5 questions counter
    const questionCounter = page.locator('[data-testid="question-counter"]');
    await expect(questionCounter).toContainText('1 of 5');

    // Answer all 5 questions
    for (let i = 0; i < 5; i++) {
      // Select an answer (option A)
      await page.click('[data-option="A"]');
      
      // Click next
      await page.click('button:has-text("Next")');
      
      // Wait for next question or results
      await page.waitForTimeout(500);
    }

    // Assert - Results page
    await expect(page).toHaveURL(/\/practice\/quick-byte\/results/);
    
    // Should see score
    const score = page.locator('[data-testid="session-score"]');
    await expect(score).toBeVisible();
    
    // Should see Ember Score update
    const emberScore = page.locator('[data-testid="ember-score"]');
    await expect(emberScore).toBeVisible();
  });

  test('should show instant feedback after each answer', async ({ page }) => {
    // Arrange
    await navHelper.startQuickByte('english');

    // Act - Answer first question
    await page.click('[data-option="B"]');

    // Assert - Should see feedback
    const feedback = page.locator('[data-testid="answer-feedback"]');
    await expect(feedback).toBeVisible({ timeout: 2000 });
    
    // Should show correct/incorrect indicator
    const feedbackStatus = page.locator('[data-testid="feedback-status"]');
    await expect(feedbackStatus).toBeVisible();
    
    // Should show explanation
    const explanation = page.locator('[data-testid="explanation"]');
    await expect(explanation).toBeVisible();
  });

  test('should allow exit and resume later', async ({ page }) => {
    // Arrange
    await navHelper.startQuickByte('mathematics');
    
    // Answer first question
    await page.click('[data-option="A"]');
    await page.click('button:has-text("Next")');

    // Act - Exit session
    await page.click('[data-testid="exit-session"]');
    
    // Confirm exit
    await page.click('button:has-text("Exit")');

    // Assert - Back to practice dashboard
    await expect(page).toHaveURL('/practice');
    
    // Should see "Resume" option
    const resumeButton = page.locator('button:has-text("Resume")');
    await expect(resumeButton).toBeVisible();
  });
});
