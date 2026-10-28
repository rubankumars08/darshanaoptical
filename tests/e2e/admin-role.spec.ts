import { test, expect, type Page } from '@playwright/test';
import { USERS, loginAs, logout } from './helpers';

test.describe.serial('Role: Admin (admin@darshana.com)', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await loginAs(page, USERS.admin.email, USERS.admin.password);
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('admin signs in successfully and sees profile and role badge', async () => {
    await expect(page).toHaveURL(/\/admin\/dashboard/);
    const userName = page.locator('.adm-sidebar-user-name');
    const userRole = page.locator('.adm-sidebar-user-role');

    await expect(userName).toContainText(USERS.admin.name);
    await expect(userRole).toContainText('admin');
  });

  test('admin sidebar contains all authorized navigation links including exclusive admin items', async () => {
    const nav = page.locator('#admin-navigation');
    
    // Core & Daily links
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

    // Management & Admin-only links
    await expect(nav.getByRole('link', { name: 'Purchases' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Suppliers' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Expenses' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Reports' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Staff' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Audit Log' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Settings' })).toBeVisible();
  });

  test('admin can access and view Staff management page', async () => {
    await page.goto('/admin/staff');
    await expect(page).toHaveURL(/\/admin\/staff/);
    await expect(page.locator('.adm-page-title')).toContainText('Staff Management');
    await expect(page.locator('body')).toContainText('Darshana Raj');
    await expect(page.locator('body')).toContainText('admin@darshana.com');
  });

  test('admin can access Shop Settings page', async () => {
    await page.goto('/admin/settings');
    await expect(page).toHaveURL(/\/admin\/settings/);
    await expect(page.locator('.adm-topbar')).toContainText('Settings');
  });

  test('admin can access Audit Log page', async () => {
    await page.goto('/admin/audit');
    await expect(page).toHaveURL(/\/admin\/audit/);
    await expect(page.locator('.adm-topbar')).toContainText('Audit Logs');
  });

  test('admin can access Reports page', async () => {
    await page.goto('/admin/reports');
    await expect(page).toHaveURL(/\/admin\/reports/);
    await expect(page.locator('.adm-topbar')).toContainText('Reports');
  });

  test('admin can access Products catalog', async () => {
    await page.goto('/admin/products');
    await expect(page).toHaveURL(/\/admin\/products/);
    await expect(page.locator('.adm-topbar')).toContainText('Products');
  });

  test('admin can successfully logout', async () => {
    await logout(page);
    await expect(page).toHaveURL(/\/admin\/login/);

    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});
