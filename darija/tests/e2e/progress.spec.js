// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Progress Page', () => {
  test.beforeEach(async ({ page }) => {
    // Login via demo mode
    await page.goto('/login');
    await page.locator('button:has-text("Try Demo")').click();
    await expect(page).toHaveURL('/dashboard');
  });

  test('progress page shows XP bar and streak counter', async ({ page }) => {
    // Navigate to progress
    await page.locator('aside >> a:has-text("Progress")').click();
    await expect(page).toHaveURL('/progress');

    // Verify heading
    await expect(page.locator('h1')).toContainText('Your Progress');

    // Verify XP-related content is visible (Total XP stat)
    await expect(page.locator('text=Total XP')).toBeVisible();

    // Verify streak stat
    await expect(page.locator('text=Streak')).toBeVisible();
  });

  test('progress page shows skill chart', async ({ page }) => {
    await page.goto('/progress');

    // Verify the XP History chart section
    await expect(page.locator('text=XP History')).toBeVisible();
  });

  test('progress page shows badge grid', async ({ page }) => {
    await page.goto('/progress');

    // Verify badge collection section
    await expect(page.locator('text=Badge Collection')).toBeVisible();
  });

  test('progress page shows overall stats', async ({ page }) => {
    await page.goto('/progress');

    // Verify all stats are visible
    await expect(page.locator('text=Total XP')).toBeVisible();
    await expect(page.locator('text=Level')).toBeVisible();
    await expect(page.locator('text=Streak')).toBeVisible();
    await expect(page.locator('text=Lessons')).toBeVisible();
    await expect(page.locator('text=Games')).toBeVisible();
  });

  test('progress page shows areas to improve', async ({ page }) => {
    await page.goto('/progress');

    // Verify weakness/improvement section
    await expect(page.locator('text=Areas to Improve')).toBeVisible();
  });
});

test.describe('Leaderboard Page', () => {
  test.beforeEach(async ({ page }) => {
    // Login via demo mode
    await page.goto('/login');
    await page.locator('button:has-text("Try Demo")').click();
    await expect(page).toHaveURL('/dashboard');
  });

  test('leaderboard page shows period tabs', async ({ page }) => {
    // Navigate to leaderboard
    await page.locator('aside >> a:has-text("Leaderboard")').click();
    await expect(page).toHaveURL('/leaderboard');

    // Verify heading
    await expect(page.locator('h1')).toContainText('Leaderboard');

    // Verify period tabs
    await expect(page.locator('button:has-text("This Week")')).toBeVisible();
    await expect(page.locator('button:has-text("This Month")')).toBeVisible();
    await expect(page.locator('button:has-text("All Time")')).toBeVisible();
  });

  test('leaderboard shows ranked entries', async ({ page }) => {
    await page.goto('/leaderboard');

    // Verify leaderboard entries are visible (mock data has names like "Fatima Z.", "Ahmed M.")
    await expect(page.locator('text=Fatima Z.')).toBeVisible();
    await expect(page.locator('text=Ahmed M.')).toBeVisible();

    // Verify current user is highlighted (Youssef O.)
    await expect(page.locator('text=Youssef O.')).toBeVisible();
  });

  test('can switch leaderboard periods', async ({ page }) => {
    await page.goto('/leaderboard');

    // Default is "This Week" - verify it is active
    const weekButton = page.locator('button:has-text("This Week")');
    await expect(weekButton).toHaveClass(/bg-teal-500/);

    // Switch to "This Month"
    await page.locator('button:has-text("This Month")').click();
    const monthButton = page.locator('button:has-text("This Month")');
    await expect(monthButton).toHaveClass(/bg-teal-500/);

    // The entries should still be visible (different XP values for monthly)
    await expect(page.locator('text=Ahmed M.')).toBeVisible();

    // Switch to "All Time"
    await page.locator('button:has-text("All Time")').click();
    const allTimeButton = page.locator('button:has-text("All Time")');
    await expect(allTimeButton).toHaveClass(/bg-teal-500/);
  });

  test('leaderboard shows podium for top 3', async ({ page }) => {
    await page.goto('/leaderboard');

    // The top 3 should be displayed in a podium format
    // Rank 1 should have a crown icon
    // Verify XP values are visible for top entries
    await expect(page.locator('text=1,850 XP').or(page.locator('text=1850 XP')).first()).toBeVisible();
  });

  test('current user entry is marked', async ({ page }) => {
    await page.goto('/leaderboard');

    // The current user (Youssef O.) should have a "You" badge
    await expect(page.locator('text=You')).toBeVisible();
  });
});
