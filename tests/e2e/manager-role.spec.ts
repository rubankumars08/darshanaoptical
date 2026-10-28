import { test, expect, type Page } from '@playwright/test';
import { USERS, loginAs, logout } from './helpers';

test.describe.serial('Role: Manager (manager@darshana.com)', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await loginAs(page, USERS.manager.email, USERS.manager.password);
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('manager signs in successfully and sees profile and manager role', async () => {
    await expect(page).toHaveURL(/\/admin\/dashboard/);
    const userName = page.locator('.adm-sidebar-user-name');
    const userRole = page.locator('.adm-sidebar-user-role');

    await expect(userName).toContainText(USERS.manager.name);
    await expect(userRole).toContainText('manager');
  });

  test('manager sidebar has management tools but NOT Staff or Settings', async () => {
    const nav = page.locator('#admin-navigation');

    await expect(nav.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Express Sale' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Full Billing' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Customers' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Purchases' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Suppliers' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Expenses' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Reports' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Audit Log' })).toBeVisible();

    // Manager should NOT see Staff or Settings links in the sidebar:
    await expect(nav.getByRole('link', { name: 'Staff' })).toHaveCount(0);
    await expect(nav.getByRole('link', { name: 'Settings' })).toHaveCount(0);
  });

  test('direct navigation to /admin/staff is blocked by role guard', async () => {
    await page.goto('/admin/staff');
    await expect(page.locator('body')).toContainText(/Admin access required to view staff/i);
    await expect(page.getByRole('button', { name: /Add Staff/i })).toHaveCount(0);
  });

  test('direct navigation to /admin/settings is blocked by role guard', async () => {
    await page.goto('/admin/settings');
    await expect(page.locator('body')).toContainText(/Admin access required/i);
    await expect(page.getByRole('button', { name: /Save Settings/i })).toHaveCount(0);
  });

  test('manager can access Reports and view financial metrics', async () => {
    await page.goto('/admin/reports');
    await expect(page).toHaveURL(/\/admin\/reports/);
    await expect(page.locator('.adm-topbar')).toContainText('Reports');
  });

  test('manager can access Expenses', async () => {
    await page.goto('/admin/expenses');
    await expect(page).toHaveURL(/\/admin\/expenses/);
    await expect(page.locator('.adm-topbar')).toContainText('Expenses');
  });

  test('manager can access Suppliers', async () => {
    await page.goto('/admin/suppliers');
    await expect(page).toHaveURL(/\/admin\/suppliers/);
    await expect(page.locator('.adm-topbar')).toContainText('Suppliers');
  });

  test('manager can access Purchases', async () => {
    await page.goto('/admin/purchases');
    await expect(page).toHaveURL(/\/admin\/purchases/);
    await expect(page.locator('.adm-topbar')).toContainText('Purchases');
  });

  test('manager can successfully logout', async () => {
    await logout(page);
    await expect(page).toHaveURL(/\/admin\/login/);

    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});
