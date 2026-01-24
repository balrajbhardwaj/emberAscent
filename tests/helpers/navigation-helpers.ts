/**
 * Navigation Test Helpers
 * 
 * Common navigation patterns for E2E tests
 */

import { Page, expect } from '@playwright/test';

export class NavigationHelper {
  constructor(private page: Page) {}

  /**
   * Navigate to practice dashboard
   */
  async goToPractice() {
    await this.page.goto('/practice');
    await expect(this.page).toHaveURL('/practice');
  }

  /**
   * Start a Quick Byte session
   */
  async startQuickByte(subject?: string) {
    await this.goToPractice();
    
    // Click Quick Byte card
    await this.page.click('[data-testid="quick-byte-card"]');
    
    // If subject specified, select it
    if (subject) {
      await this.page.click(`[data-subject="${subject}"]`);
    } else {
      // Click first subject
      await this.page.click('[data-subject]');
    }
    
    // Wait for session to start
    await this.page.waitForURL(/\/practice\/quick-byte\/session/);
  }

  /**
   * Navigate to analytics dashboard (Ascent only)
   */
  async goToAnalytics() {
    await this.page.goto('/analytics');
    await expect(this.page).toHaveURL('/analytics');
  }

  /**
   * Switch active child
   */
  async switchChild(childName: string) {
    // Open child selector
    await this.page.click('[data-testid="child-selector"]');
    
    // Select child
    await this.page.click(`text=${childName}`);
    
    // Wait for dashboard to update
    await this.page.waitForTimeout(500);
  }

  /**
   * Navigate to settings
   */
  async goToSettings() {
    await this.page.goto('/settings');
    await expect(this.page).toHaveURL('/settings');
  }

  /**
   * Navigate to home/marketing page
   */
  async goToHome() {
    await this.page.goto('/');
    await expect(this.page).toHaveURL('/');
  }

  /**
   * Start a mock test
   */
  async startMockTest(type: '11plus' | 'CEM' | 'GL' = '11plus') {
    await this.goToPractice();
    
    // Click Mock Tests card
    await this.page.click('[data-testid="mock-tests-card"]');
    
    // Select exam type
    await this.page.click(`[data-exam-type="${type}"]`);
    
    // Click Start Test
    await this.page.click('button:has-text("Start Test")');
    
    // Wait for test to start
    await this.page.waitForURL(/\/practice\/mock-tests\/session/);
  }

  /**
   * Navigate to curriculum browser
   */
  async goToCurriculum() {
    await this.page.goto('/curriculum');
    await expect(this.page).toHaveURL('/curriculum');
  }

  /**
   * Navigate back
   */
  async goBack() {
    await this.page.goBack();
  }

  /**
   * Wait for page load
   */
  async waitForLoad() {
    await this.page.waitForLoadState('networkidle');
  }
}
