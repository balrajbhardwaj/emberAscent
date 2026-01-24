/**
 * Authentication Test Helpers
 * 
 * Reusable functions for authentication-related test operations
 */

import { Page, expect } from '@playwright/test';
import type { TestUser } from '../fixtures/users';

export class AuthHelper {
  constructor(private page: Page) {}

  /**
   * Navigate to login page
   */
  async goToLogin() {
    await this.page.goto('/login');
    await expect(this.page).toHaveURL('/login');
  }

  /**
   * Navigate to signup page
   */
  async goToSignup() {
    await this.page.goto('/signup');
    await expect(this.page).toHaveURL('/signup');
  }

  /**
   * Log in with credentials
   */
  async login(email: string, password: string) {
    await this.goToLogin();
    
    // Fill in credentials
    await this.page.fill('input[name="email"]', email);
    await this.page.fill('input[name="password"]', password);
    
    // Submit form
    await this.page.click('button[type="submit"]');
    
    // Wait for navigation
    await this.page.waitForURL(url => 
      url.pathname === '/practice' || 
      url.pathname === '/setup'
    );
  }

  /**
   * Sign up with new account
   */
  async signup(email: string, password: string, fullName: string) {
    await this.goToSignup();
    
    // Fill in form
    await this.page.fill('input[name="email"]', email);
    await this.page.fill('input[name="password"]', password);
    await this.page.fill('input[name="fullName"]', fullName);
    
    // Submit
    await this.page.click('button[type="submit"]');
    
    // Should redirect to setup
    await this.page.waitForURL('/setup');
  }

  /**
   * Log out
   */
  async logout() {
    // Click user menu
    await this.page.click('[data-testid="user-menu"]');
    
    // Click logout
    await this.page.click('text=Log Out');
    
    // Should redirect to login
    await this.page.waitForURL('/login');
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      await this.page.waitForSelector('[data-testid="user-menu"]', { timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Set up first child (onboarding)
   */
  async setupFirstChild(name: string, yearGroup: number, avatar: string = '👦') {
    await expect(this.page).toHaveURL('/setup');
    
    // Fill in child details
    await this.page.fill('input[name="name"]', name);
    await this.page.selectOption('select[name="yearGroup"]', yearGroup.toString());
    
    // Select avatar
    await this.page.click(`[data-avatar="${avatar}"]`);
    
    // Submit
    await this.page.click('button[type="submit"]');
    
    // Should redirect to practice
    await this.page.waitForURL('/practice');
  }

  /**
   * Quick login helper using test user
   */
  async loginAsTestUser(user: TestUser) {
    await this.login(user.email, user.password);
  }
}
