import { test, expect } from '@playwright/test';
import { USERS, loginAs, logout } from './helpers';

test.describe('End-to-End User Journeys & Public Experience', () => {
  test('public homepage renders branding, navigation, and key sections', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Darshana Optical/i);
    await expect(page.locator('header, nav').first()).toBeVisible();
    await expect(page.locator('body')).toContainText(/Darshana Optical/i);
  });

  test('public navigation works across main pages', async ({ page }) => {
    await page.goto('/frames');
    await expect(page).toHaveURL(/\/frames/);
    await expect(page.locator('body')).toBeVisible();

    await page.goto('/lenses');
    await expect(page).toHaveURL(/\/lenses/);
    await expect(page.locator('body')).toBeVisible();

    await page.goto('/contact');
    await expect(page).toHaveURL(/\/contact/);
    await expect(page.locator('body')).toBeVisible();

    await page.goto('/book-eye-test');
    await expect(page).toHaveURL(/\/book-eye-test/);
    await expect(page.locator('form')).toBeVisible();
  });

  test('role isolation: sequential logins maintain strict permissions per account', async ({ page }) => {
    // 1. Login as Staff
    await loginAs(page, USERS.staff.email, USERS.staff.password);
    const staffNav = page.locator('#admin-navigation');
    await expect(staffNav.getByRole('link', { name: 'Staff' })).toHaveCount(0);
    await expect(staffNav.getByRole('link', { name: 'Settings' })).toHaveCount(0);
    await logout(page);

    // 2. Login as Manager
    await loginAs(page, USERS.manager.email, USERS.manager.password);
    const managerNav = page.locator('#admin-navigation');
    await expect(managerNav.getByRole('link', { name: 'Reports' })).toBeVisible();
    await expect(managerNav.getByRole('link', { name: 'Staff' })).toHaveCount(0);
    await expect(managerNav.getByRole('link', { name: 'Settings' })).toHaveCount(0);
    await logout(page);

    // 3. Login as Admin
    await loginAs(page, USERS.admin.email, USERS.admin.password);
    const adminNav = page.locator('#admin-navigation');
    await expect(adminNav.getByRole('link', { name: 'Staff' })).toBeVisible();
    await expect(adminNav.getByRole('link', { name: 'Settings' })).toBeVisible();
    await logout(page);
  });
});
