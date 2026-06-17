import { test, expect } from '@playwright/test';

test.describe('Rides Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('[name="email"]', 'admin@easyryde.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
  });

  test('loads ride list', async ({ page }) => {
    await page.goto('/admin/rides');
    await expect(page.locator('h2')).toContainText('Rides');
  });

  test('filters rides by status', async ({ page }) => {
    await page.goto('/admin/rides');
    await page.selectOption('select', 'completed');
    await page.waitForResponse(/admin\/rides/);
  });

  test('opens ride detail modal on click', async ({ page }) => {
    await page.goto('/admin/rides');
    const row = page.locator('table tr').first();
    if (await row.isVisible()) {
      await row.click();
      await expect(page.locator('[role="dialog"]')).toBeVisible();
    }
  });
});
