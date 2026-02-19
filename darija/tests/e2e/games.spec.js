// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Daily Game Session', () => {
  test.beforeEach(async ({ page }) => {
    // Login via demo mode
    await page.goto('/login');
    await page.locator('button:has-text("Try Demo")').click();
    await expect(page).toHaveURL('/dashboard');
  });

  test('can start a game session from dashboard', async ({ page }) => {
    // Click "Start Today's Session" CTA on dashboard
    await page.locator('text=Start Today\'s Session').click();

    // Verify the session page loaded
    await expect(page).toHaveURL('/session');

    // Wait for the session to load (it shows "Preparing your session..." spinner first)
    await expect(page.locator('text=Game 1 of')).toBeVisible({ timeout: 10000 });
  });

  test('session shows progress indicator', async ({ page }) => {
    // Navigate to session
    await page.goto('/session');

    // Wait for session to load
    await expect(page.locator('text=Game 1 of')).toBeVisible({ timeout: 10000 });

    // Verify the progress indicator shows game count (e.g., "Game 1 of 6")
    const progressText = page.locator('text=/Game 1 of \\d+/');
    await expect(progressText).toBeVisible();
  });

  test('can interact with multiple choice game', async ({ page }) => {
    await page.goto('/session');

    // Wait for the first game to load
    await expect(page.locator('text=Game 1 of')).toBeVisible({ timeout: 10000 });

    // The first game in the mock session is "Quick Quiz" (multiple choice)
    await expect(page.locator('text=Quick Quiz')).toBeVisible();

    // Click one of the answer options (the first option button in the game area)
    const options = page.locator('main button').filter({ hasText: /Choukran|La|Bslama|Wakha/ });
    const firstOption = options.first();
    await expect(firstOption).toBeVisible();
    await firstOption.click();

    // After answering, a "Next" button should appear
    await expect(page.locator('button:has-text("Next")')).toBeVisible({ timeout: 5000 });
  });

  test('can exit session back to dashboard', async ({ page }) => {
    await page.goto('/session');

    // Wait for session to load
    await expect(page.locator('text=Game 1 of')).toBeVisible({ timeout: 10000 });

    // Click the exit/back button
    await page.locator('text=Exit Session').click();

    // Should navigate back to dashboard
    await expect(page).toHaveURL('/dashboard');
  });
});
