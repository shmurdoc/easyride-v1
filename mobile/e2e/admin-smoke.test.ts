import { device, expect, element, by } from 'detox';

describe('Admin App Smoke', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should show login screen', async () => {
    await expect(element(by.id('login-screen'))).toBeVisible();
  });

  it('should login successfully', async () => {
    await element(by.id('email-input')).typeText('admin@easyryde.com');
    await element(by.id('password-input')).typeText('Password1!');
    await element(by.id('login-button')).tap();
    await expect(element(by.id('admin-dashboard'))).toBeVisible();
  });

  it('should show dashboard metrics', async () => {
    await expect(element(by.id('metric-card'))).toBeVisible();
  });

  it('should navigate to drivers list', async () => {
    await element(by.id('nav-drivers')).tap();
    await expect(element(by.id('drivers-list'))).toBeVisible();
  });

  it('should navigate to rides list', async () => {
    await element(by.id('nav-rides')).tap();
    await expect(element(by.id('rides-list'))).toBeVisible();
  });
});
