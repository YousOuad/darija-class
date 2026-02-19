// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Login via demo mode before each test
    await page.goto('/login');
    await page.locator('button:has-text("Try Demo")').click();
    await expect(page).toHaveURL('/dashboard');
  });

  test('sidebar links navigate to correct pages', async ({ page }) => {
    // Dashboard (already here)
    await expect(page.locator('h1')).toContainText('Welcome back');

    // Lessons
    await page.locator('aside >> a:has-text("Lessons")').click();
    await expect(page).toHaveURL('/lessons');
    await expect(page.locator('h1')).toContainText('Lessons');

    // Roadmap
    await page.locator('aside >> a:has-text("Roadmap")').click();
    await expect(page).toHaveURL('/roadmap');

    // Progress
    await page.locator('aside >> a:has-text("Progress")').click();
    await expect(page).toHaveURL('/progress');
    await expect(page.locator('h1')).toContainText('Your Progress');

    // Leaderboard
    await page.locator('aside >> a:has-text("Leaderboard")').click();
    await expect(page).toHaveURL('/leaderboard');
    await expect(page.locator('h1')).toContainText('Leaderboard');

    // Settings
    await page.locator('aside >> a:has-text("Settings")').click();
    await expect(page).toHaveURL('/settings');
    await expect(page.locator('h1')).toContainText('Settings');

    // Dashboard again
    await page.locator('aside >> a:has-text("Dashboard")').click();
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Welcome back');
  });

  test('mobile hamburger menu works', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });

    // The desktop sidebar should not be visible on mobile
    // The hamburger menu button should be visible
    const hamburger = page.locator('header button').first();
    await expect(hamburger).toBeVisible();

    // Click hamburger to open mobile sidebar
    await hamburger.click();

    // Wait for mobile sidebar animation to appear
    await expect(page.locator('nav >> a:has-text("Lessons")')).toBeVisible();

    // Click Lessons link in mobile sidebar
    await page.locator('nav >> a:has-text("Lessons")').click();

    // Verify navigation happened
    await expect(page).toHaveURL('/lessons');
    await expect(page.locator('h1')).toContainText('Lessons');
  });

  test('active sidebar link is highlighted', async ({ page }) => {
    // Navigate to lessons
    await page.locator('aside >> a:has-text("Lessons")').click();
    await expect(page).toHaveURL('/lessons');

    // The Lessons link in sidebar should have the active styling (bg-teal-500)
    const activeLink = page.locator('aside >> a:has-text("Lessons")');
    await expect(activeLink).toHaveClass(/bg-teal-500/);
  });
});
