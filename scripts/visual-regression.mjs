import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright-core';

const baseUrl = process.env.VISUAL_BASE_URL || 'http://127.0.0.1:3000';
const chromePath = process.env.VISUAL_CHROME_PATH;
const outputDir = process.env.VISUAL_OUTPUT_DIR || 'visual-artifacts';

if (!chromePath) {
  throw new Error('VISUAL_CHROME_PATH is required. Point it to google-chrome/chromium on the CI runner.');
}

const routes = [
  { name: 'home', path: '/' },
  { name: 'sectors', path: '/sectors' },
  { name: 'article', path: '/content/autism' },
];

const viewports = [
  { name: 'desktop', width: 1440, height: 1000, footerColumns: 4, maxFooterHeight: 620 },
  { name: 'tablet', width: 1024, height: 900, footerColumns: 4, maxFooterHeight: 800 },
  { name: 'mobile', width: 390, height: 844, footerColumns: 2, maxFooterHeight: 1120 },
];

const failures = [];
const reports = [];
const approx = (a, b, tolerance = 2) => Math.abs(a - b) <= tolerance;
const fail = (scope, message) => failures.push(`${scope}: ${message}`);

await fs.mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: chromePath,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      colorScheme: 'light',
      reducedMotion: 'reduce',
      locale: 'ar-JO',
    });

    for (const route of routes) {
      const page = await context.newPage();
      const scope = `${viewport.name} ${route.path}`;
      const response = await page.goto(`${baseUrl}${route.path}`, {
        waitUntil: 'domcontentloaded',
        timeout: 30_000,
      });

      if (!response || !response.ok()) {
        fail(scope, `navigation returned ${response?.status() ?? 'no response'}`);
        await page.close();
        continue;
      }

      await page.waitForLoadState('networkidle', { timeout: 5_000 }).catch(() => {});
      await page.addStyleTag({
        content: '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}',
      });

      const metrics = await page.evaluate(() => {
        const box = (selector) => {
          const element = document.querySelector(selector);
          if (!element) return null;
          const rect = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          return {
            x: rect.x,
            y: rect.y,
            top: rect.top,
            right: rect.right,
            bottom: rect.bottom,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            display: style.display,
            position: style.position,
            paddingTop: parseFloat(style.paddingTop) || 0,
            paddingBottom: parseFloat(style.paddingBottom) || 0,
            backgroundColor: style.backgroundColor,
            overflowX: style.overflowX,
            overflowY: style.overflowY,
          };
        };

        const groupSections = [...document.querySelectorAll('.footer-groups > section')];
        const sectionBoxes = groupSections.map((element) => {
          const rect = element.getBoundingClientRect();
          return { top: rect.top, left: rect.left, right: rect.right, width: rect.width, height: rect.height };
        });
        const firstTop = sectionBoxes[0]?.top ?? 0;
        const firstRowColumns = sectionBoxes.filter((rect) => Math.abs(rect.top - firstTop) <= 2).length;
        const heroTitle = document.querySelector('.rawafid-hero h1');
        const heroFontSize = heroTitle ? parseFloat(getComputedStyle(heroTitle).fontSize) : null;

        return {
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
          scrollWidth: document.documentElement.scrollWidth,
          scrollHeight: document.documentElement.scrollHeight,
          bodyBackground: getComputedStyle(document.body).backgroundColor,
          header: box('.site-header'),
          headerInner: box('.site-header-inner'),
          footer: box('.site-footer'),
          footerInner: box('.site-footer-inner'),
          footerBrand: box('.footer-brand-block'),
          footerGroups: box('.footer-groups'),
          footerBottom: box('.footer-bottom'),
          footerSearch: box('.footer-search'),
          mobileBottomNav: box('.mobile-bottom-nav'),
          firstRowColumns,
          heroFontSize,
        };
      });

      reports.push({ viewport: viewport.name, route: route.path, metrics });

      if (metrics.scrollWidth > viewport.width + 2) {
        fail(scope, `horizontal overflow ${metrics.scrollWidth}px > viewport ${viewport.width}px`);
      }

      if (!metrics.header || !metrics.headerInner) {
        fail(scope, 'site header or header inner is missing');
      } else {
        if (metrics.header.height < 54 || metrics.header.height > 96) {
          fail(scope, `header height ${metrics.header.height}px is outside 54-96px`);
        }
        if (metrics.headerInner.width > 1242) {
          fail(scope, `header inner width ${metrics.headerInner.width}px exceeds the 1240px design container`);
        }
      }

      if (!metrics.footer || !metrics.footerInner || !metrics.footerBottom || !metrics.footerGroups) {
        fail(scope, 'site footer structure is incomplete');
      } else {
        if (metrics.footer.display !== 'block') {
          fail(scope, `footer root display is ${metrics.footer.display}; expected block to preserve vertical flow`);
        }
        if (!approx(metrics.footer.width, viewport.width, 2)) {
          fail(scope, `footer width ${metrics.footer.width}px does not span viewport ${viewport.width}px`);
        }
        if (metrics.footer.height > viewport.maxFooterHeight) {
          fail(scope, `footer height ${metrics.footer.height}px exceeds ${viewport.maxFooterHeight}px responsive guard`);
        }
        if (metrics.footer.paddingTop > 1 || metrics.footer.paddingBottom > 1) {
          fail(scope, `legacy root footer padding leaked through (${metrics.footer.paddingTop}px/${metrics.footer.paddingBottom}px)`);
        }
        if (metrics.footerBottom.top + 2 < metrics.footerInner.bottom) {
          fail(scope, `footer bottom starts before footer inner ends (${metrics.footerBottom.top}px < ${metrics.footerInner.bottom}px)`);
        }
        if (metrics.footerInner.width > 1242) {
          fail(scope, `footer inner width ${metrics.footerInner.width}px exceeds the 1240px design container`);
        }
        if (metrics.firstRowColumns !== viewport.footerColumns) {
          fail(scope, `footer grid has ${metrics.firstRowColumns} columns on first row; expected ${viewport.footerColumns}`);
        }
        if (metrics.footer.backgroundColor !== 'rgb(6, 63, 73)') {
          fail(scope, `footer background is ${metrics.footer.backgroundColor}; expected rgb(6, 63, 73)`);
        }
      }

      if (metrics.footerBrand && metrics.footerGroups) {
        if (viewport.width <= 1100) {
          if (metrics.footerGroups.top + 2 < metrics.footerBrand.bottom) {
            fail(scope, 'stacked footer brand and groups overlap vertically');
          }
        } else {
          const overlapX = Math.max(0, Math.min(metrics.footerBrand.right, metrics.footerGroups.right) - Math.max(metrics.footerBrand.left, metrics.footerGroups.left));
          const overlapY = Math.max(0, Math.min(metrics.footerBrand.bottom, metrics.footerGroups.bottom) - Math.max(metrics.footerBrand.top, metrics.footerGroups.top));
          if (overlapX > 2 && overlapY > 2) {
            fail(scope, `desktop footer columns overlap by ${overlapX.toFixed(1)}x${overlapY.toFixed(1)}px`);
          }
        }
      }

      if (route.name === 'home' && metrics.heroFontSize !== null) {
        const min = viewport.name === 'mobile' ? 32 : 40;
        const max = viewport.name === 'mobile' ? 54 : 75;
        if (metrics.heroFontSize < min || metrics.heroFontSize > max) {
          fail(scope, `hero title font ${metrics.heroFontSize}px is outside ${min}-${max}px`);
        }
      }

      await page.screenshot({
        path: path.join(outputDir, `${route.name}-${viewport.name}-full.png`),
        fullPage: true,
        animations: 'disabled',
      });

      if (await page.locator('.site-footer').count()) {
        await page.locator('.site-footer').screenshot({
          path: path.join(outputDir, `${route.name}-${viewport.name}-footer.png`),
          animations: 'disabled',
        });
      }

      if (route.name === 'home' && viewport.name === 'desktop' && await page.locator('.mega-nav').count()) {
        await page.locator('.mega-nav').evaluate((element) => { element.open = true; });
        await page.waitForTimeout(100);
        const panel = await page.locator('.mega-nav-panel').evaluate((element) => {
          const rect = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          return {
            left: rect.left,
            right: rect.right,
            width: rect.width,
            height: rect.height,
            clientHeight: element.clientHeight,
            scrollHeight: element.scrollHeight,
            overflowY: style.overflowY,
          };
        });
        const maxPanelHeight = Math.min(viewport.height * 0.76, 680) + 4;
        if (panel.height > maxPanelHeight) {
          fail(scope, `mega menu height ${panel.height}px exceeds ${maxPanelHeight}px viewport guard`);
        }
        if (panel.left < -2 || panel.right > viewport.width + 2) {
          fail(scope, `mega menu escapes viewport: left=${panel.left}px right=${panel.right}px`);
        }
        if (!['auto', 'scroll'].includes(panel.overflowY)) {
          fail(scope, `mega menu overflow-y is ${panel.overflowY}; expected an internal scroll container`);
        }
        await page.locator('.mega-nav-panel').screenshot({
          path: path.join(outputDir, 'home-desktop-mega-nav.png'),
          animations: 'disabled',
        });
      }

      await page.close();
    }

    await context.close();
  }
} finally {
  await browser.close();
}

await fs.writeFile(
  path.join(outputDir, 'layout-report.json'),
  JSON.stringify({ generatedAt: new Date().toISOString(), baseUrl, reports, failures }, null, 2),
  'utf8',
);

if (failures.length) {
  console.error('Rawafid visual regression gate failed:');
  for (const item of failures) console.error(`- ${item}`);
  process.exit(1);
}

console.log(`Rawafid visual regression gate passed: ${reports.length} route/viewport combinations.`);
