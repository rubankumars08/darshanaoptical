import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { join } from 'path';

const outDir = join(process.cwd(), 'scratch', 'screenshots', 'sections');
mkdirSync(outDir, { recursive: true });

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Scroll smoothly down the whole page so any whileInView triggers
  await page.evaluate(async () => {
    const distance = 400;
    const delay = 100;
    while (document.scrollingElement.scrollTop + window.innerHeight < document.scrollingElement.scrollHeight) {
      document.scrollingElement.scrollBy(0, distance);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
    // Scroll back to top
    document.scrollingElement.scrollTo(0, 0);
  });
  await page.waitForTimeout(1000);

  const sections = await page.$$('main > *');
  console.log(`Found ${sections.length} main sections`);

  for (let i = 0; i < sections.length; i++) {
    const sec = sections[i];
    await sec.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    const box = await sec.boundingBox();
    if (box && box.height > 20) {
      await sec.screenshot({ path: join(outDir, `section-${i}.png`) });
      console.log(`Captured section-${i}: height=${box.height}`);
    }
  }

  // Also capture store gallery specifically after scroll
  const gallery = page.locator('#gallery');
  if (await gallery.count() > 0) {
    await gallery.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await gallery.screenshot({ path: join(outDir, 'store-gallery-scrolled.png') });
  }

  await browser.close();
  console.log('All sections captured to', outDir);
}

run().catch(console.error);
