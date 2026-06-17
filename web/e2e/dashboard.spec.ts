import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('[name="email"]', 'admin@easyryde.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
  });

  test('loads metric cards', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await expect(page.locator('.metric-card')).toHaveCount(6);
  });

  test('shows activity chart', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await expect(page.locator('.activity-chart')).toBeVisible();
  });

  test('time range selector switches data', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await page.click('text=Week');
    await page.click('text=Month');
    await expect(page.locator('.range-btn.active')).toContainText('Month');
  });

  test('live connection indicator is visible', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await expect(page.locator('text=Live')).toBeVisible();
  });
});
