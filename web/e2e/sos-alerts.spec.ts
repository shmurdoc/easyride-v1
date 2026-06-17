import { test, expect } from '@playwright/test';

test.describe('SOS Alerts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('[name="email"]', 'admin@easyryde.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
  });

  test('loads SOS alerts panel', async ({ page }) => {
    await page.goto('/admin/sos-alerts');
    await expect(page.locator('h2')).toContainText(/SOS|Alerts/);
  });

  test('resolves an alert', async ({ page }) => {
    await page.goto('/admin/sos-alerts');
    const resolveBtn = page.locator('text=Resolve').first();
    if (await resolveBtn.isVisible()) {
      await resolveBtn.click();
    }
  });

  test('shows alert details', async ({ page }) => {
    await page.goto('/admin/sos-alerts');
    const row = page.locator('table tr').first();
    if (await row.isVisible()) {
      await row.click();
    }
  });
});
