import { test, expect } from '@playwright/test';

test.describe('Admin Login', () => {
  test('shows login page', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page.locator('h1')).toContainText('Sign In');
  });

  test('logs in with valid credentials', async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('[name="email"]', 'admin@easyryde.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('shows error with invalid credentials', async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('[name="email"]', 'wrong@example.com');
    await page.fill('[name="password"]', 'wrong');
    await page.click('button[type="submit"]');
    await expect(page.locator('.error-message')).toBeVisible();
  });

  test('demo account buttons prefill credentials', async ({ page }) => {
    await page.goto('/admin/login');
    await page.click('text=admin');
    await expect(page.locator('[name="email"]')).toHaveValue('admin@easyryde.com');
  });
});
