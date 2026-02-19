// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Lesson Browsing', () => {
  test.beforeEach(async ({ page }) => {
    // Login via demo mode
    await page.goto('/login');
    await page.locator('button:has-text("Try Demo")').click();
    await expect(page).toHaveURL('/dashboard');
  });

  test('lessons page shows level tabs', async ({ page }) => {
    // Navigate to lessons
    await page.locator('aside >> a:has-text("Lessons")').click();
    await expect(page).toHaveURL('/lessons');

    // Verify level tabs are visible
    await expect(page.locator('button:has-text("A2 Elementary")')).toBeVisible();
    await expect(page.locator('button:has-text("B1 Intermediate")')).toBeVisible();
    await expect(page.locator('button:has-text("B2 Upper Intermediate")')).toBeVisible();
  });

  test('can switch between level tabs', async ({ page }) => {
    await page.goto('/lessons');

    // A2 should be active by default, showing "Greetings & Basics" module
    await expect(page.locator('text=Greetings & Basics')).toBeVisible();

    // Click B1 tab
    await page.locator('button:has-text("B1 Intermediate")').click();

    // B1 modules should appear
    await expect(page.locator('text=Daily Routines')).toBeVisible();

    // A2 modules should no longer be visible
    await expect(page.locator('text=Greetings & Basics')).not.toBeVisible();

    // Click B2 tab
    await page.locator('button:has-text("B2 Upper Intermediate")').click();

    // B2 modules should appear
    await expect(page.locator('text=Conversations & Opinions')).toBeVisible();
  });

  test('modules show lesson lists', async ({ page }) => {
    await page.goto('/lessons');

    // Verify lesson items within the "Greetings & Basics" module
    await expect(page.locator('text=Hello & Goodbye')).toBeVisible();
    await expect(page.locator('text=Introducing Yourself')).toBeVisible();
    await expect(page.locator('text=How Are You?')).toBeVisible();
    await expect(page.locator('text=Please & Thank You')).toBeVisible();
  });

  test('clicking a lesson navigates to lesson view', async ({ page }) => {
    await page.goto('/lessons');

    // Click on "How Are You?" lesson (status: available)
    await page.locator('a:has-text("How Are You?")').click();

    // Should navigate to lesson view
    await expect(page).toHaveURL(/\/lesson\/\d+/);

    // Verify lesson view loads with the lesson title
    await expect(page.locator('h1')).toContainText('Greetings & Introductions');
  });

  test('lesson view has content tabs', async ({ page }) => {
    // Navigate to a lesson directly
    await page.goto('/lesson/1');

    // Verify the tabs are visible
    await expect(page.locator('button:has-text("Vocabulary")')).toBeVisible();
    await expect(page.locator('button:has-text("Grammar")')).toBeVisible();
    await expect(page.locator('button:has-text("Phrases")')).toBeVisible();
    await expect(page.locator('button:has-text("Exercises")')).toBeVisible();
  });

  test('can switch between lesson tabs', async ({ page }) => {
    await page.goto('/lesson/1');

    // Vocabulary tab should be active by default, showing vocab items
    await expect(page.locator('text=Hello / Peace')).toBeVisible();

    // Click Grammar tab
    await page.locator('button:has-text("Grammar")').click();
    await expect(page.locator('text=Basic Sentence Structure')).toBeVisible();

    // Click Phrases tab
    await page.locator('button:has-text("Phrases")').click();
    await expect(page.locator('text=Casual greeting')).toBeVisible();

    // Click Exercises tab
    await page.locator('button:has-text("Exercises")').click();
    await expect(page.locator('text=Good morning')).toBeVisible();
    await expect(page.locator('button:has-text("Complete Lesson")')).toBeVisible();
  });

  test('back button returns to lessons list', async ({ page }) => {
    await page.goto('/lesson/1');

    // Click "Back to Lessons" button
    await page.locator('text=Back to Lessons').click();

    // Should navigate back to lessons page
    await expect(page).toHaveURL('/lessons');
  });
});
