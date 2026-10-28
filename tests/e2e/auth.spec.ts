import { test, expect } from '@playwright/test';
import { USERS } from './helpers';

test.describe('Authentication & Access Control', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('login page renders properly with all required elements', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page).toHaveTitle(/Admin/);
    await expect(page.locator('#admin-email')).toBeVisible();
    await expect(page.locator('#admin-password')).toBeVisible();
    await expect(page.locator('#admin-login-submit')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Darshana Optical');
  });

  test('unauthenticated access to /admin/dashboard redirects to /admin/login', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('unauthenticated access to /admin/staff redirects to /admin/login', async ({ page }) => {
    await page.goto('/admin/staff');
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('login fails with invalid password', async ({ page }) => {
    await page.goto('/admin/login');
    await page.locator('#admin-email').fill(USERS.admin.email);
    await page.locator('#admin-password').fill('wrongPassword123');
    await page.locator('#admin-login-submit').click();

    const errorAlert = page.locator('div:has-text("Invalid email or password"), div:has-text("Login failed")');
    await expect(errorAlert.first()).toBeVisible({ timeout: 10_000 });
    expect(page.url()).toContain('/admin/login');
  });

  test('login fails with non-existent user email', async ({ page }) => {
    await page.goto('/admin/login');
    await page.locator('#admin-email').fill('nonexistent@darshana.com');
    await page.locator('#admin-password').fill('randompass123');
    await page.locator('#admin-login-submit').click();

    const errorAlert = page.locator('div:has-text("Invalid email or password"), div:has-text("Login failed")');
    await expect(errorAlert.first()).toBeVisible({ timeout: 10_000 });
  });

  test('password visibility toggle changes input type between password and text', async ({ page }) => {
    await page.goto('/admin/login');
    const passwordInput = page.locator('#admin-password');
    await expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleBtn = page.locator('button[type="button"]').filter({ has: page.locator('svg') });
    await toggleBtn.click();
    await expect(passwordInput).toHaveAttribute('type', 'text');

    await toggleBtn.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });
});
