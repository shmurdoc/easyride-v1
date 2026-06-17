import { device, expect, element, by } from 'detox';

describe('Driver App Smoke', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should show login screen', async () => {
    await expect(element(by.id('login-screen'))).toBeVisible();
  });

  it('should login successfully', async () => {
    await element(by.id('email-input')).typeText('driver@test.com');
    await element(by.id('password-input')).typeText('Password1!');
    await element(by.id('login-button')).tap();
    await expect(element(by.id('driver-home-screen'))).toBeVisible();
  });

  it('should toggle online status', async () => {
    await element(by.id('online-toggle')).tap();
    await expect(element(by.id('online-status'))).toBeVisible();
  });

  it('should show ride requests', async () => {
    await expect(element(by.id('ride-requests-list'))).toBeVisible();
  });

  it('should accept a ride request', async () => {
    await element(by.id('accept-ride-button')).tap();
    await expect(element(by.id('ride-navigation'))).toBeVisible();
  });
});
