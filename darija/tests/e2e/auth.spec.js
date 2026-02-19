// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('landing page shows hero content', async ({ page }) => {
    await page.goto('/');

    // Verify the brand name is visible
    await expect(page.locator('text=Darija')).toBeVisible();
    await expect(page.locator('text=Lingo')).toBeVisible();

    // Verify hero heading
    await expect(page.locator('h1')).toContainText('Moroccan Darija');

    // Verify CTA buttons exist
    await expect(page.locator('text=Start Learning Free')).toBeVisible();
    await expect(page.locator('text=Try Demo').first()).toBeVisible();
  });

  test('can navigate to register page', async ({ page }) => {
    await page.goto('/');

    // Click the "Get Started" button in the nav
    await page.locator('nav >> text=Get Started').click();

    // Verify we are on the register page
    await expect(page).toHaveURL('/register');
    await expect(page.locator('h2')).toContainText('Sign Up');
  });

  test('register page has required form fields', async ({ page }) => {
    await page.goto('/register');

    // Verify form fields exist
    await expect(page.locator('label:has-text("Display Name")')).toBeVisible();
    await expect(page.locator('label:has-text("Email")')).toBeVisible();
    await expect(page.locator('label:has-text("Password")')).toBeVisible();
    await expect(page.locator('label:has-text("Confirm Password")')).toBeVisible();

    // Verify submit button
    await expect(page.locator('button:has-text("Create Account")')).toBeVisible();

    // Verify demo login button
    await expect(page.locator('button:has-text("Try Demo")')).toBeVisible();
  });

  test('demo login redirects to dashboard', async ({ page }) => {
    await page.goto('/login');

    // Click the demo login button
    await page.locator('button:has-text("Try Demo")').click();

    // Verify redirect to dashboard
    await expect(page).toHaveURL('/dashboard');

    // Verify the welcome message with the demo user name
    await expect(page.locator('h1')).toContainText('Youssef');
  });

  test('demo login from landing page works', async ({ page }) => {
    await page.goto('/');

    // Click "Try Demo" on the landing page (first occurrence in the hero)
    await page.locator('section >> button:has-text("Try Demo")').first().click();

    // Verify redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Youssef');
  });

  test('user name appears in header after login', async ({ page }) => {
    await page.goto('/login');
    await page.locator('button:has-text("Try Demo")').click();
    await expect(page).toHaveURL('/dashboard');

    // The header should show the user initial avatar (Y for Youssef)
    await expect(page.locator('header')).toContainText('Y');
  });

  test('can navigate to settings after login', async ({ page }) => {
    // Login via demo
    await page.goto('/login');
    await page.locator('button:has-text("Try Demo")').click();
    await expect(page).toHaveURL('/dashboard');

    // Click user menu to open dropdown
    await page.locator('header button:has-text("Y")').click();

    // Click Settings link in dropdown
    await page.locator('a:has-text("Settings")').click();

    // Verify settings page loaded
    await expect(page).toHaveURL('/settings');
    await expect(page.locator('h1')).toContainText('Settings');
  });

  test('logout redirects to landing page', async ({ page }) => {
    // Login via demo
    await page.goto('/login');
    await page.locator('button:has-text("Try Demo")').click();
    await expect(page).toHaveURL('/dashboard');

    // Open user menu
    await page.locator('header button:has-text("Y")').click();

    // Click Log Out
    await page.locator('button:has-text("Log Out")').click();

    // Verify redirect to landing page
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1')).toContainText('Moroccan Darija');
  });

  test('protected routes redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL('/login');
  });
});
