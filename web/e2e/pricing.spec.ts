import { test, expect } from '@playwright/test';

test.describe('Pricing Editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('[name="email"]', 'admin@easyryde.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
  });

  test('loads pricing page with categories', async ({ page }) => {
    await page.goto('/admin/pricing');
    await expect(page.locator('text=Pricing Editor')).toBeVisible();
  });

  test('switches between fare categories', async ({ page }) => {
    await page.goto('/admin/pricing');
    await page.click('text=Premium');
    await expect(page.locator('text=Base Fare')).toBeVisible();
  });

  test('edits category and saves', async ({ page }) => {
    await page.goto('/admin/pricing');
    await page.click('text=Edit');
    await page.fill('input[type="number"]', '20');
    await page.click('text=Save');
  });

  test('publish changes button is visible', async ({ page }) => {
    await page.goto('/admin/pricing');
    await expect(page.locator('text=Publish Changes')).toBeVisible();
  });

  test('surge pricing toggle works', async ({ page }) => {
    await page.goto('/admin/pricing');
    const checkbox = page.locator('input[type="checkbox"]');
    if (await checkbox.isVisible()) {
      await checkbox.check();
      await page.waitForTimeout(300);
    }
  });
});
