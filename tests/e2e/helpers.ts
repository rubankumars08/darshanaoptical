import { Page, expect } from '@playwright/test';

export const USERS = {
  admin: {
    email: process.env.E2E_ADMIN_EMAIL || 'admin@darshana.com',
    password: process.env.E2E_ADMIN_PASSWORD || 'admin@2026',
    role: 'admin',
    name: 'Darshana Raj',
  },
  manager: {
    email: process.env.E2E_MANAGER_EMAIL || 'manager@darshana.com',
    password: process.env.E2E_MANAGER_PASSWORD || 'manager@2026',
    role: 'manager',
    name: 'Arun Kumar',
  },
  staff: {
    email: process.env.E2E_STAFF_EMAIL || 'staff@darshana.com',
    password: process.env.E2E_STAFF_PASSWORD || 'staff@2026',
    role: 'staff',
    name: 'Kumar Muthu',
  },
} as const;

export async function loginAs(page: Page, email: string, pass: string) {
  expect(email, 'Email must not be empty').not.toBe('');
  expect(pass, 'Password must not be empty').not.toBe('');
  await page.context().clearCookies();
  await page.goto('/admin/login');
  await page.locator('#admin-email').waitFor({ state: 'visible', timeout: 15_000 });

  await page.locator('#admin-email').fill(email);
  await page.locator('#admin-password').fill(pass);
  await page.locator('#admin-login-submit').click();

  await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 15_000 });
  await page.waitForSelector('.adm-sidebar', { timeout: 15_000 });
}

export async function logout(page: Page) {
  const logoutBtn = page.getByRole('button', { name: /logout/i });
  await logoutBtn.click();
  await expect(page).toHaveURL(/\/admin\/login/, { timeout: 10_000 });
}
