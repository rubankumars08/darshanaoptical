import { expect, test, type Page } from '@playwright/test';

type Role = 'admin' | 'manager' | 'staff';
const credentials: Record<Role, { email: string; password: string }> = {
  admin: { email: process.env.E2E_ADMIN_EMAIL || 'admin@darshana.com', password: process.env.E2E_ADMIN_PASSWORD || 'admin@2026' },
  manager: { email: process.env.E2E_MANAGER_EMAIL || 'manager@darshana.com', password: process.env.E2E_MANAGER_PASSWORD || 'manager@2026' },
  staff: { email: process.env.E2E_STAFF_EMAIL || 'staff@darshana.com', password: process.env.E2E_STAFF_PASSWORD || 'staff@2026' },
};

async function login(page: Page, role: Role) {
  const account = credentials[role];
  expect(account.email, `Set E2E_${role.toUpperCase()}_EMAIL`).not.toBe('');
  expect(account.password, `Set E2E_${role.toUpperCase()}_PASSWORD`).not.toBe('');
  await page.context().clearCookies();
  await page.goto('/admin/login');
  await page.locator('#admin-email').waitFor({ state: 'visible', timeout: 15_000 });
  await page.locator('#admin-email').fill(account.email);
  await page.locator('#admin-password').fill(account.password);
  await page.locator('#admin-login-submit').click();
  await expect(page).toHaveURL(/\/admin\/(dashboard|pos)/, { timeout: 25_000 });
}

test.describe('authentication and protected eye-test APIs', () => {
  test('anonymous requests redirect or return 401', async ({ page, request }) => {
    await page.goto('/admin/eye-tests');
    await expect(page).toHaveURL(/\/admin\/login/);
    expect((await request.get('/api/admin/eye-tests')).status()).toBe(401);
    expect((await request.get('/api/admin/eye-tests/not-signed-in')).status()).toBe(401);
  });

  for (const role of ['admin', 'manager', 'staff'] as const) {
    test(`${role} loads the list and prescription detail`, async ({ page }) => {
      await login(page, role);
      const listResponse = await page.request.get('/api/admin/eye-tests');
      expect(listResponse.status()).toBe(200);
      const { eyeTests } = await listResponse.json();
      expect(Array.isArray(eyeTests)).toBe(true);
      await page.goto('/admin/eye-tests');
      await expect(page.locator('.adm-page-title')).toHaveText('Eye Tests');

      if (eyeTests.length > 0) {
        const detailResponse = await page.request.get(`/api/admin/eye-tests/${eyeTests[0].id}`);
        expect(detailResponse.status()).toBe(200);
        expect((await detailResponse.json()).eyeTest.id).toBe(eyeTests[0].id);
        await page.goto(`/admin/prescriptions/${eyeTests[0].id}`);
        await expect(page.locator('.adm-page-title')).toHaveText('Prescription');
        await expect(page.getByRole('button', { name: 'Print' })).toBeVisible();
      }
    });
  }

  test('logout removes the session', async ({ page }) => {
    await login(page, 'admin');
    await page.getByRole('button', { name: 'Logout' }).click();
    await expect(page).toHaveURL(/\/admin\/login/, { timeout: 10_000 });
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});

test('admin loads every main operational screen without a server failure', async ({ page }) => {
  await login(page, 'admin');
  const serverFailures: string[] = [];
  page.on('response', (response) => {
    if (response.status() >= 500) serverFailures.push(`${response.status()} ${response.url()}`);
  });
  const paths = [
    '/admin/dashboard', '/admin/pos', '/admin/bookings',
    '/admin/customers', '/admin/eye-tests', '/admin/orders', '/admin/payments',
    '/admin/products', '/admin/inventory', '/admin/purchases', '/admin/suppliers',
    '/admin/expenses', '/admin/reports', '/admin/staff', '/admin/audit', '/admin/settings',
  ];
  for (const path of paths) {
    await page.goto(path);
    expect(new URL(page.url()).pathname).toBe(path);
    await expect(page.locator('.adm-topbar')).toBeVisible();
  }
  expect(serverFailures).toEqual([]);
});

for (const viewport of [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 820, height: 1180 },
]) {
  test(`${viewport.name} dashboard has no horizontal overflow and opens navigation`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await login(page, 'admin');
    await expect(page.locator('.adm-mobile-dock')).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    await page.getByRole('button', { name: 'Open all admin sections' }).click();
    await expect(page.locator('#admin-navigation')).toHaveClass(/is-open/);
    await expect(page.getByRole('link', { name: 'Eye Tests' })).toBeVisible();
  });
}

test('mobile prescription keeps every optical value column inside the card', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page, 'admin');
  const response = await page.request.get('/api/admin/eye-tests');
  const { eyeTests } = await response.json();
  test.skip(eyeTests.length === 0, 'No prescription record is available');

  await page.goto(`/admin/prescriptions/${eyeTests[0].id}`);
  await expect(page.locator('.adm-topbar-title')).toContainText('Prescription');
  await expect(page.locator('.adm-prescription-grid th').last()).toHaveText('PD');

  const layout = await page.locator('.adm-prescription-grid-wrap').evaluate((container) => {
    const table = container.querySelector('table')!;
    return {
      containerRight: container.getBoundingClientRect().right,
      tableRight: table.getBoundingClientRect().right,
      pageOverflow: document.documentElement.scrollWidth - window.innerWidth,
    };
  });
  expect(layout.tableRight).toBeLessThanOrEqual(layout.containerRight + 1);
  expect(layout.pageOverflow).toBeLessThanOrEqual(1);
});

test('admin tables paginate ten rows at a time', async ({ page }) => {
  await login(page, 'admin');
  const auditLoaded = page.waitForResponse((response) => response.url().includes('/api/admin/audit'));
  await page.goto('/admin/audit');
  await auditLoaded;
  const body = page.locator('.adm-table-wrap tbody').first();
  await expect(body.locator('tr').first()).toBeVisible();

  await body.evaluate((tbody) => {
    const first = tbody.querySelector('tr');
    if (!first) return;
    while (tbody.querySelectorAll('tr').length < 23) tbody.append(first.cloneNode(true));
  });
  const totalRows = await body.locator('tr').count();

  const pagination = page.locator('.adm-pagination').first();
  await expect(pagination).toContainText(`1–10 of ${totalRows}`);
  await expect(body.locator('tr:visible')).toHaveCount(10);
  await pagination.getByRole('button', { name: 'Next page' }).click();
  await expect(pagination).toContainText(`11–20 of ${totalRows}`);
  await expect(body.locator('tr:visible')).toHaveCount(10);
  await pagination.getByRole('button', { name: 'Next page' }).click();
  await expect(pagination).toContainText(`21–${Math.min(30, totalRows)} of ${totalRows}`);
  await expect(body.locator('tr:visible')).toHaveCount(Math.min(10, totalRows - 20));
});
