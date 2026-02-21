// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Script Toggle', () => {
  test.beforeEach(async ({ page }) => {
    // Login via demo mode
    await page.goto('/login');
    await page.locator('button:has-text("Try Demo")').click();
    await expect(page).toHaveURL('/dashboard');
  });

  test('script toggle buttons are visible in header', async ({ page }) => {
    // The header should contain the script toggle with three options
    const header = page.locator('header');
    await expect(header.locator('button:has-text("Latin")')).toBeVisible();
    await expect(header.locator('button:has-text("Both")')).toBeVisible();

    // The Arabic button uses Arabic text
    await expect(header.locator('button:has-text("\\u0639\\u0631\\u0628\\u064A")')).toBeVisible();
  });

  test('clicking Latin button activates latin mode', async ({ page }) => {
    const header = page.locator('header');

    // Click the "Latin" button
    await header.locator('button:has-text("Latin")').click();

    // The Latin button should now have active styling (bg-teal-500)
    const latinButton = header.locator('button:has-text("Latin")');
    await expect(latinButton).toHaveClass(/bg-teal-500/);
  });

  test('clicking Arabic button activates arabic mode', async ({ page }) => {
    const header = page.locator('header');

    // Click the Arabic button
    await header.locator('button:has-text("\\u0639\\u0631\\u0628\\u064A")').click();

    // The Arabic button should now have active styling
    const arabicButton = header.locator('button:has-text("\\u0639\\u0631\\u0628\\u064A")');
    await expect(arabicButton).toHaveClass(/bg-teal-500/);

    // The body should have RTL class when Arabic is selected
    await expect(page.locator('body')).toHaveClass(/rtl/);
  });

  test('clicking Both button activates hybrid mode', async ({ page }) => {
    const header = page.locator('header');

    // Click the "Both" button
    await header.locator('button:has-text("Both")').click();

    // The Both button should now have active styling
    const bothButton = header.locator('button:has-text("Both")');
    await expect(bothButton).toHaveClass(/bg-teal-500/);
  });

  test('script toggle affects lesson content display', async ({ page }) => {
    const header = page.locator('header');

    // Navigate to a lesson to see content with script text
    await page.goto('/lesson/1');

    // Set Latin mode
    await header.locator('button:has-text("Latin")').click();

    // Check that Latin text is visible (e.g., "Salam")
    await expect(page.locator('text=Salam')).toBeVisible();

    // Set Arabic mode
    await header.locator('button:has-text("\\u0639\\u0631\\u0628\\u064A")').click();

    // Arabic text should be visible
    await expect(page.locator('text=\\u0633\\u0644\\u0627\\u0645')).toBeVisible();

    // Set Both mode
    await header.locator('button:has-text("Both")').click();

    // Both scripts should appear in the content
    await expect(page.locator('text=Salam')).toBeVisible();
  });

  test('script toggle is available on mobile via secondary toggle', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // The mobile script toggle should be visible below the header
    const mobileToggle = page.locator('header >> button:has-text("Latin")');
    await expect(mobileToggle).toBeVisible();

    // Click it and verify it works
    await mobileToggle.click();
    await expect(mobileToggle).toHaveClass(/bg-teal-500/);
  });
});
