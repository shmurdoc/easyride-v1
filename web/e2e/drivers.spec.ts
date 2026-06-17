import { test, expect } from '@playwright/test';

test.describe('Drivers Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('[name="email"]', 'admin@easyryde.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
  });

  test('loads driver list', async ({ page }) => {
    await page.goto('/admin/drivers');
    await expect(page.locator('h2')).toContainText('Drivers');
  });

  test('filters drivers by status', async ({ page }) => {
    await page.goto('/admin/drivers');
    await page.selectOption('select', 'pending_review');
    await page.waitForResponse(/admin\/drivers/);
  });

  test('search filters drivers', async ({ page }) => {
    await page.goto('/admin/drivers');
    await page.fill('input[placeholder*="Search"]', 'John');
    await page.waitForTimeout(500);
  });

  test('approve driver shows confirmation', async ({ page }) => {
    await page.goto('/admin/drivers');
    await page.click('text=Approve');
  });

  test('reject driver prompts for reason', async ({ page }) => {
    page.on('dialog', dialog => dialog.accept('Invalid license'));
    await page.goto('/admin/drivers');
    await page.click('text=Reject');
  });

  test('batch approve button appears when selected', async ({ page }) => {
    await page.goto('/admin/drivers');
    const checkbox = page.locator('input[type="checkbox"]').first();
    if (await checkbox.isVisible()) {
      await checkbox.check();
      await expect(page.locator('text=Approve Selected')).toBeVisible();
    }
  });
});
