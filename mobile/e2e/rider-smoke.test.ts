import { device, expect, element, by } from 'detox';

describe('Rider App Smoke', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should show login screen', async () => {
    await expect(element(by.id('login-screen'))).toBeVisible();
  });

  it('should login successfully', async () => {
    await element(by.id('email-input')).typeText('rider@test.com');
    await element(by.id('password-input')).typeText('Password1!');
    await element(by.id('login-button')).tap();
    await expect(element(by.id('home-screen'))).toBeVisible();
  });

  it('should request a ride', async () => {
    await element(by.id('pickup-input')).typeText('123 Main St');
    await element(by.id('dropoff-input')).typeText('456 Oak Ave');
    await element(by.id('request-ride-button')).tap();
    await expect(element(by.id('ride-status'))).toBeVisible();
  });

  it('should cancel a ride', async () => {
    await element(by.id('cancel-ride-button')).tap();
    await element(by.id('confirm-cancel')).tap();
    await expect(element(by.id('ride-cancelled'))).toBeVisible();
  });

  it('should show wallet page', async () => {
    await element(by.id('wallet-tab')).tap();
    await expect(element(by.id('wallet-balance'))).toBeVisible();
  });
});
