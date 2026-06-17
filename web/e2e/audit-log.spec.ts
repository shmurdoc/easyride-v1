import { test, expect } from '@playwright/test';

test.describe('Audit Log', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('[name="email"]', 'admin@easyryde.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
  });

  test('loads audit log entries', async ({ page }) => {
    await page.goto('/admin/audit-log');
    await expect(page.locator('h2')).toContainText('Audit Log');
  });

  test('expands detail row on click', async ({ page }) => {
    await page.goto('/admin/audit-log');
    const row = page.locator('table tr').first();
    if (await row.isVisible()) {
      await row.click();
      await expect(page.locator('text=Old Values')).toBeVisible();
    }
  });

  test('filters by action type', async ({ page }) => {
    await page.goto('/admin/audit-log');
    await page.selectOption('select >> nth=0', 'create');
    await page.waitForResponse(/admin\/audit-logs/);
  });

  test('exports CSV', async ({ page }) => {
    await page.goto('/admin/audit-log');
    await page.click('text=Export CSV');
  });
});
