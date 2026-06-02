import { by, device, element, expect } from 'detox';

describe('Rider App - Authentication Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should show login screen', async () => {
    await expect(element(by.id('login-email-input'))).toBeVisible();
    await expect(element(by.id('login-password-input'))).toBeVisible();
    await expect(element(by.id('login-button'))).toBeVisible();
  });

  it('should show error for invalid credentials', async () => {
    await element(by.id('login-email-input')).typeText('invalid@email.com');
    await element(by.id('login-password-input')).typeText('wrongpassword');
    await element(by.id('login-button')).tap();

    await expect(element(by.text('Invalid credentials'))).toBeVisible();
  });

  it('should navigate to register screen', async () => {
    await element(by.id('register-link')).tap();
    await expect(element(by.id('register-name-input'))).toBeVisible();
  });

  it('should register new user', async () => {
    await element(by.id('register-link')).tap();
    await element(by.id('register-name-input')).typeText('Test User');
    await element(by.id('register-email-input')).typeText('newuser@test.com');
    await element(by.id('register-phone-input')).typeText('+27123456789');
    await element(by.id('register-password-input')).typeText('Password1!');
    await element(by.id('register-button')).tap();

    await expect(element(by.id('home-screen'))).toBeVisible();
  });
});

describe('Rider App - Ride Booking Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
    await element(by.id('login-email-input')).typeText('test@example.com');
    await element(by.id('login-password-input')).typeText('Password1!');
    await element(by.id('login-button')).tap();
    await waitFor(element(by.id('home-screen'))).toBeVisible().withTimeout(5000);
  });

  it('should show home screen with map', async () => {
    await expect(element(by.id('map-view'))).toBeVisible();
    await expect(element(by.id('pickup-input'))).toBeVisible();
    await expect(element(by.id('dropoff-input'))).toBeVisible();
  });

  it('should search for pickup location', async () => {
    await element(by.id('pickup-input')).tap();
    await element(by.id('pickup-input')).typeText('Phalaborwa Mall');
    await waitFor(element(by.text('Phalaborwa Mall'))).toBeVisible().withTimeout(3000);
    await element(by.text('Phalaborwa Mall')).tap();
  });

  it('should search for dropoff location', async () => {
    await element(by.id('dropoff-input')).tap();
    await element(by.id('dropoff-input')).typeText('Phalaborwa Airport');
    await waitFor(element(by.text('Phalaborwa Airport'))).toBeVisible().withTimeout(3000);
    await element(by.text('Phalaborwa Airport')).tap();
  });

  it('should show ride options with prices', async () => {
    await element(by.id('pickup-input')).tap();
    await element(by.id('pickup-input')).typeText('Phalaborwa Mall');
    await element(by.text('Phalaborwa Mall')).tap();
    await element(by.id('dropoff-input')).tap();
    await element(by.id('dropoff-input')).typeText('Phalaborwa Airport');
    await element(by.text('Phalaborwa Airport')).tap();

    await expect(element(by.id('ride-options'))).toBeVisible();
    await expect(element(by.id('economy-option'))).toBeVisible();
    await expect(element(by.id('standard-option'))).toBeVisible();
    await expect(element(by.id('premium-option'))).toBeVisible();
  });

  it('should book standard ride', async () => {
    await element(by.id('pickup-input')).tap();
    await element(by.id('pickup-input')).typeText('Phalaborwa Mall');
    await element(by.text('Phalaborwa Mall')).tap();
    await element(by.id('dropoff-input')).tap();
    await element(by.id('dropoff-input')).typeText('Phalaborwa Airport');
    await element(by.text('Phalaborwa Airport')).tap();
    await element(by.id('standard-option')).tap();
    await element(by.id('book-ride-button')).tap();

    await expect(element(by.id('ride-tracking-screen'))).toBeVisible();
  });

  it('should show ride tracking with driver info', async () => {
    await element(by.id('pickup-input')).tap();
    await element(by.id('pickup-input')).typeText('Phalaborwa Mall');
    await element(by.text('Phalaborwa Mall')).tap();
    await element(by.id('dropoff-input')).tap();
    await element(by.id('dropoff-input')).typeText('Phalaborwa Airport');
    await element(by.text('Phalaborwa Airport')).tap();
    await element(by.id('standard-option')).tap();
    await element(by.id('book-ride-button')).tap();

    await expect(element(by.id('driver-name'))).toBeVisible();
    await expect(element(by.id('driver-eta'))).toBeVisible();
    await expect(element(by.id('ride-status'))).toBeVisible();
  });

  it('should cancel ride', async () => {
    await element(by.id('pickup-input')).tap();
    await element(by.id('pickup-input')).typeText('Phalaborwa Mall');
    await element(by.text('Phalaborwa Mall')).tap();
    await element(by.id('dropoff-input')).tap();
    await element(by.id('dropoff-input')).typeText('Phalaborwa Airport');
    await element(by.text('Phalaborwa Airport')).tap();
    await element(by.id('standard-option')).tap();
    await element(by.id('book-ride-button')).tap();

    await element(by.id('cancel-ride-button')).tap();
    await element(by.id('confirm-cancel-button')).tap();

    await expect(element(by.id('home-screen'))).toBeVisible();
  });
});

describe('Rider App - Payment Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
    await element(by.id('login-email-input')).typeText('test@example.com');
    await element(by.id('login-password-input')).typeText('Password1!');
    await element(by.id('login-button')).tap();
    await waitFor(element(by.id('home-screen'))).toBeVisible().withTimeout(5000);
  });

  it('should show payment methods', async () => {
    await element(by.id('wallet-tab')).tap();
    await expect(element(by.id('wallet-balance'))).toBeVisible();
    await expect(element(by.id('deposit-button'))).toBeVisible();
    await expect(element(by.id('withdraw-button'))).toBeVisible();
  });

  it('should deposit to wallet', async () => {
    await element(by.id('wallet-tab')).tap();
    await element(by.id('deposit-button')).tap();
    await element(by.id('deposit-amount-input')).typeText('100');
    await element(by.id('payfast-option')).tap();
    await element(by.id('confirm-deposit-button')).tap();

    await expect(element(by.id('payment-redirect'))).toBeVisible();
  });
});
