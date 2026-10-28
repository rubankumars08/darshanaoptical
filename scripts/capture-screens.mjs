import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { join } from 'path';

const outDir = join(process.cwd(), 'scratch', 'screenshots');
mkdirSync(outDir, { recursive: true });

async function scrollThroughSections(page) {
  const sectionIds = [
    '#categories',
    '#eye-testing',
    '#lenses',
    '#progressive',
    '#new-arrivals',
    '#offer-banner',
    '#testimonials',
    '#gallery',
    '#book',
  ];

  for (const id of sectionIds) {
    const loc = page.locator(id);
    if (await loc.count() > 0) {
      await loc.scrollIntoViewIfNeeded();
      await page.waitForTimeout(350);
    }
  }
}

async function run() {
  const browser = await chromium.launch();

  // Desktop Full
  console.log('Capturing Desktop full page...');
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await desktop.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await desktop.waitForTimeout(1000);
  await scrollThroughSections(desktop);
  await desktop.screenshot({ path: join(outDir, 'desktop-full.png'), fullPage: true });

  // Gallery Desktop
  const gallery = desktop.locator('#gallery');
  if (await gallery.count() > 0) {
    await gallery.scrollIntoViewIfNeeded();
    await desktop.waitForTimeout(300);
    await gallery.screenshot({ path: join(outDir, 'store-gallery-desktop.png') });
  }

  // Mobile Full
  console.log('Capturing Mobile full page...');
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
  await mobile.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await mobile.waitForTimeout(1000);
  await scrollThroughSections(mobile);
  await mobile.screenshot({ path: join(outDir, 'mobile-full.png'), fullPage: true });

  // Gallery Mobile
  const galleryMobile = mobile.locator('#gallery');
  if (await galleryMobile.count() > 0) {
    await galleryMobile.scrollIntoViewIfNeeded();
    await mobile.waitForTimeout(300);
    await galleryMobile.screenshot({ path: join(outDir, 'store-gallery-mobile.png') });
  }

  await browser.close();
  console.log('All screenshots captured successfully to', outDir);
}

run().catch(console.error);
