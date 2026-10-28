import { test, expect, type Page } from '@playwright/test';
import { USERS, loginAs, logout } from './helpers';

test.describe.serial('Role: Staff (staff@darshana.com)', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await loginAs(page, USERS.staff.email, USERS.staff.password);
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('staff signs in successfully and sees profile and staff role', async () => {
    await expect(page).toHaveURL(/\/admin\/dashboard/);
    const userName = page.locator('.adm-sidebar-user-name');
    const userRole = page.locator('.adm-sidebar-user-role');

    await expect(userName).toContainText(USERS.staff.name);
    await expect(userRole).toContainText('staff');
  });

  test('staff sidebar contains daily sales and customer items, but NO management or admin links', async () => {
    const nav = page.locator('#admin-navigation');

    // Allowed links
    await expect(nav.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Express Sale' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Full Billing' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Bookings' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Customers' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Eye Tests' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Orders' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Payments' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Products' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Stock In / Out' })).toBeVisible();

    // Restricted links MUST NOT exist for staff
    await expect(nav.getByRole('link', { name: 'Purchases' })).toHaveCount(0);
    await expect(nav.getByRole('link', { name: 'Suppliers' })).toHaveCount(0);
    await expect(nav.getByRole('link', { name: 'Expenses' })).toHaveCount(0);
    await expect(nav.getByRole('link', { name: 'Reports' })).toHaveCount(0);
    await expect(nav.getByRole('link', { name: 'Staff' })).toHaveCount(0);
    await expect(nav.getByRole('link', { name: 'Audit Log' })).toHaveCount(0);
    await expect(nav.getByRole('link', { name: 'Settings' })).toHaveCount(0);
  });

  test('staff cannot access /admin/staff', async () => {
    await page.goto('/admin/staff');
    await expect(page.locator('body')).toContainText(/Admin access required to view staff/i);
  });

  test('staff cannot access /admin/settings', async () => {
    await page.goto('/admin/settings');
    await expect(page.locator('body')).toContainText(/Admin access required/i);
  });

  test('staff visiting /admin/counter redirects seamlessly to consolidated POS', async () => {
    await page.goto('/admin/counter');
    await expect(page).toHaveURL(/\/admin\/pos/);
    await expect(page.locator('.adm-topbar')).toContainText('POS');
  });

  test('staff can access Full Billing (POS)', async () => {
    await page.goto('/admin/pos');
    await expect(page).toHaveURL(/\/admin\/pos/);
    await expect(page.locator('.adm-topbar')).toContainText('POS');
  });

  test('staff can access Bookings management', async () => {
    await page.goto('/admin/bookings');
    await expect(page).toHaveURL(/\/admin\/bookings/);
    await expect(page.locator('.adm-topbar')).toBeVisible();
  });

  test('staff can access Customers list', async () => {
    await page.goto('/admin/customers');
    await expect(page).toHaveURL(/\/admin\/customers/);
    await expect(page.locator('.adm-topbar')).toContainText('Customers');
  });

  test('staff can access Products list', async () => {
    await page.goto('/admin/products');
    await expect(page).toHaveURL(/\/admin\/products/);
    await expect(page.locator('.adm-topbar')).toContainText('Products');
  });

  test('staff can successfully logout', async () => {
    await logout(page);
    await expect(page).toHaveURL(/\/admin\/login/);

    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});
