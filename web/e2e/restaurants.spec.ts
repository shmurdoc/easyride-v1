import { test, expect } from '@playwright/test';

test.describe('Restaurants Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('[name="email"]', 'admin@easyryde.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
  });

  test('loads restaurant list', async ({ page }) => {
    await page.goto('/admin/food/restaurants');
    await expect(page.locator('h2')).toContainText('Restaurants');
  });

  test('opens add restaurant modal', async ({ page }) => {
    await page.goto('/admin/food/restaurants');
    await page.click('text=Add Restaurant');
    await expect(page.locator('[role="dialog"]')).toBeVisible();
  });

  test('creates new restaurant', async ({ page }) => {
    await page.goto('/admin/food/restaurants');
    await page.click('text=Add Restaurant');
    await page.fill('input[placeholder*="Name"]', 'Test Restaurant');
    await page.click('text=Create');
  });

  test('edits existing restaurant', async ({ page }) => {
    await page.goto('/admin/food/restaurants');
    const editBtn = page.locator('text=Edit').first();
    if (await editBtn.isVisible()) {
      await editBtn.click();
      await expect(page.locator('[role="dialog"]')).toBeVisible();
    }
  });
});
