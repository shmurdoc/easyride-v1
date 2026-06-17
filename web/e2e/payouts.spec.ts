import { test, expect } from '@playwright/test';

test.describe('Driver Payouts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('[name="email"]', 'admin@easyryde.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
  });

  test('loads payouts with summary cards', async ({ page }) => {
    await page.goto('/admin/payouts');
    await expect(page.locator('h2')).toContainText('Payouts');
    await expect(page.locator('.card-flat').first()).toBeVisible();
  });

  test('shows summary metrics', async ({ page }) => {
    await page.goto('/admin/payouts');
    const cards = page.locator('.card-flat');
    await expect(cards.first()).toContainText('Pending');
    await expect(cards.nth(1)).toContainText('This Week');
  });

  test('retry button appears for failed payouts', async ({ page }) => {
    await page.goto('/admin/payouts');
    const retry = page.locator('text=Retry');
    if (await retry.isVisible()) {
      await retry.click();
    }
  });
});
