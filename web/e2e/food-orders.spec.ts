import { test, expect } from '@playwright/test';

test.describe('Food Orders Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('[name="email"]', 'admin@easyryde.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
  });

  test('loads food orders list', async ({ page }) => {
    await page.goto('/admin/food/orders');
    await expect(page.locator('h2')).toContainText('Food Orders');
  });

  test('filters orders by status', async ({ page }) => {
    await page.goto('/admin/food/orders');
    await page.selectOption('select', 'preparing');
    await page.waitForResponse(/admin\/food\/orders/);
  });

  test('shows delivery status badges', async ({ page }) => {
    await page.goto('/admin/food/orders');
    await expect(page.locator('.status-badge').first()).toBeVisible();
  });
});
