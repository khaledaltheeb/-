import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright-core';

const baseUrl = process.env.VISUAL_BASE_URL || 'http://127.0.0.1:3000';
const chromePath = process.env.VISUAL_CHROME_PATH;
const outputDir = process.env.VISUAL_OUTPUT_DIR || 'visual-artifacts';

if (!chromePath) throw new Error('VISUAL_CHROME_PATH is required.');

const routes = [
  { name: 'home', path: '/' },
  { name: 'sectors', path: '/sectors' },
  { name: 'article', path: '/content/autism' },
];

const viewports = [
  { name: 'desktop', width: 1440, height: 1000, footerColumns: 4, maxFooterHeight: 800 },
  { name: 'tablet', width: 1024, height: 900, footerColumns: 2, maxFooterHeight: 1050 },
  { name: 'mobile', width: 390, height: 844, footerColumns: 2, maxFooterHeight: 1250 },
];

const expectedTokens = {
  '--rf-brand': '#0b7f7c',
  '--rf-page': '#f7fbf9',
  '--rf-ink': '#12343b',
};

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

      const metrics = await page.evaluate((tokenNames) => {
        const box = (selector) => {
          const element = document.querySelector(selector);
          if (!element) return null;
          const rect = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          return {
            top: rect.top,
            right: rect.right,
            bottom: rect.bottom,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            display: style.display,
            paddingTop: parseFloat(style.paddingTop) || 0,
            paddingRight: parseFloat(style.paddingRight) || 0,
            paddingBottom: parseFloat(style.paddingBottom) || 0,
            paddingLeft: parseFloat(style.paddingLeft) || 0,
            backgroundImage: style.backgroundImage,
            overflowX: style.overflowX,
            overflowY: style.overflowY,
          };
        };
        const styleSnapshot = (selector) => {
          const element = document.querySelector(selector);
          if (!element) return null;
          const style = getComputedStyle(element);
          return {
            color: style.color,
            display: style.display,
            textDecorationLine: style.textDecorationLine,
            backgroundColor: style.backgroundColor,
          };
        };

        const groupSections = [...document.querySelectorAll('.footer-groups > section')];
        const sectionBoxes = groupSections.map((element) => {
          const rect = element.getBoundingClientRect();
          return { top: rect.top, left: rect.left, right: rect.right, width: rect.width, height: rect.height };
        });
        const firstTop = sectionBoxes[0]?.top ?? 0;
        const firstRowColumns = sectionBoxes.filter((rect) => Math.abs(rect.top - firstTop) <= 2).length;
        const rootStyle = getComputedStyle(document.documentElement);
        const tokens = Object.fromEntries(tokenNames.map((name) => [name, rootStyle.getPropertyValue(name).trim().toLowerCase()]));
        const heroTitle = document.querySelector('.rawafid-hero h1');
        const themeColor = document.querySelector('meta[name="theme-color"]')?.getAttribute('content')?.toLowerCase() || '';

        return {
          viewportWidth: innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
          scrollHeight: document.documentElement.scrollHeight,
          tokens,
          themeColor,
          header: box('.site-header'),
          headerInner: box('.site-header-inner'),
          footer: box('.site-footer'),
          footerInner: box('.site-footer-inner'),
          footerBrand: box('.footer-brand-block'),
          footerGroups: box('.footer-groups'),
          footerBottom: box('.footer-bottom'),
          firstRowColumns,
          heroFontSize: heroTitle ? parseFloat(getComputedStyle(heroTitle).fontSize) : null,
          homeSurface: {
            heroPathwayList: styleSnapshot('.hero-pathway-list'),
            heroPathwayLink: styleSnapshot('.hero-pathway-list > a'),
            heroPathwayStrong: styleSnapshot('.hero-pathway-list > a strong'),
            editorialGrid: styleSnapshot('.rawafid-editorial-grid'),
            editorialTitleLink: styleSnapshot('.rawafid-editorial-grid h3 a'),
          },
        };
      }, Object.keys(expectedTokens));

      reports.push({ viewport: viewport.name, route: route.path, metrics });

      for (const [token, expected] of Object.entries(expectedTokens)) {
        if (metrics.tokens[token] !== expected) fail(scope, `${token}=${metrics.tokens[token] || 'empty'}; expected ${expected}`);
      }

      if (metrics.themeColor !== '#075f61') fail(scope, `theme-color=${metrics.themeColor || 'missing'}; expected #075f61`);

      if (metrics.scrollWidth > viewport.width + 2) {
        fail(scope, `horizontal overflow ${metrics.scrollWidth}px > viewport ${viewport.width}px`);
      }

      if (!metrics.header || !metrics.headerInner) {
        fail(scope, 'site header structure is missing');
      } else {
        if (metrics.header.height < 60 || metrics.header.height > 100) fail(scope, `header height ${metrics.header.height}px is outside 60-100px`);
        if (metrics.headerInner.width > 1322) fail(scope, `header inner width ${metrics.headerInner.width}px exceeds the V5.1 container`);
      }

      if (!metrics.footer || !metrics.footerInner || !metrics.footerGroups || !metrics.footerBottom) {
        fail(scope, 'site footer structure is incomplete');
      } else {
        if (metrics.footer.display !== 'block') fail(scope, `footer root display is ${metrics.footer.display}; expected block`);
        if (!approx(metrics.footer.width, viewport.width, 2)) fail(scope, `footer width ${metrics.footer.width}px does not span viewport ${viewport.width}px`);
        if (metrics.footer.paddingTop > 1 || metrics.footer.paddingRight > 1 || metrics.footer.paddingBottom > 1 || metrics.footer.paddingLeft > 1) {
          fail(scope, `legacy footer padding leaked through: ${metrics.footer.paddingTop}/${metrics.footer.paddingRight}/${metrics.footer.paddingBottom}/${metrics.footer.paddingLeft}`);
        }
        if (metrics.footer.height > viewport.maxFooterHeight) fail(scope, `footer height ${metrics.footer.height}px exceeds ${viewport.maxFooterHeight}px responsive guard`);
        if (metrics.footerBottom.top + 2 < metrics.footerInner.bottom) fail(scope, 'footer bottom overlaps footer inner');
        if (metrics.footerInner.width > 1322) fail(scope, `footer inner width ${metrics.footerInner.width}px exceeds the V5.1 container`);
        if (metrics.firstRowColumns !== viewport.footerColumns) fail(scope, `footer grid has ${metrics.firstRowColumns} first-row columns; expected ${viewport.footerColumns}`);
        if (!metrics.footer.backgroundImage.includes('linear-gradient')) fail(scope, 'institutional footer gradient is missing');
      }

      if (metrics.footerBrand && metrics.footerGroups) {
        if (viewport.width <= 1000) {
          if (metrics.footerGroups.top + 2 < metrics.footerBrand.bottom) fail(scope, 'stacked footer groups overlap the brand block');
        } else {
          const overlapX = Math.max(0, Math.min(metrics.footerBrand.right, metrics.footerGroups.right) - Math.max(metrics.footerBrand.left, metrics.footerGroups.left));
          const overlapY = Math.max(0, Math.min(metrics.footerBrand.bottom, metrics.footerGroups.bottom) - Math.max(metrics.footerBrand.top, metrics.footerGroups.top));
          if (overlapX > 2 && overlapY > 2) fail(scope, `footer columns overlap by ${overlapX.toFixed(1)}x${overlapY.toFixed(1)}px`);
        }
      }

      if (route.name === 'home') {
        if (metrics.heroFontSize !== null) {
          const min = viewport.name === 'mobile' ? 34 : 42;
          const max = viewport.name === 'mobile' ? 60 : 90;
          if (metrics.heroFontSize < min || metrics.heroFontSize > max) fail(scope, `hero title font ${metrics.heroFontSize}px is outside ${min}-${max}px`);
        }

        const homeSurface = metrics.homeSurface;
        if (!homeSurface.heroPathwayList || homeSurface.heroPathwayList.display !== 'grid') fail(scope, 'hero pathway list is not rendered as the V5 grid surface');
        if (!homeSurface.heroPathwayLink) fail(scope, 'hero pathway link surface is missing');
        else {
          if (homeSurface.heroPathwayLink.color !== 'rgb(255, 255, 255)') fail(scope, `hero pathway link color ${homeSurface.heroPathwayLink.color} is not white`);
          if (homeSurface.heroPathwayLink.textDecorationLine !== 'none') fail(scope, `hero pathway link decoration leaked: ${homeSurface.heroPathwayLink.textDecorationLine}`);
        }
        if (!homeSurface.heroPathwayStrong || homeSurface.heroPathwayStrong.color !== 'rgb(255, 255, 255)') fail(scope, 'hero pathway title lost high-contrast white text');
        if (!homeSurface.editorialGrid || homeSurface.editorialGrid.display !== 'grid') fail(scope, 'homepage editorial content is not rendered as a card grid');
        if (!homeSurface.editorialTitleLink) fail(scope, 'homepage editorial title link is missing');
        else {
          if (homeSurface.editorialTitleLink.color !== 'rgb(18, 52, 59)') fail(scope, `editorial title color ${homeSurface.editorialTitleLink.color} does not match --rf-ink`);
          if (homeSurface.editorialTitleLink.textDecorationLine !== 'none') fail(scope, `editorial title decoration leaked: ${homeSurface.editorialTitleLink.textDecorationLine}`);
        }
      }

      await page.screenshot({
        path: path.join(outputDir, `${route.name}-${viewport.name}-full.png`),
        fullPage: true,
        animations: 'disabled',
      });

      await page.locator('.site-footer').screenshot({
        path: path.join(outputDir, `${route.name}-${viewport.name}-footer.png`),
        animations: 'disabled',
      });

      if (route.name === 'home' && viewport.width > 1000 && await page.locator('.mega-nav').count()) {
        await page.locator('.mega-nav').evaluate((element) => { element.open = true; });
        await page.waitForTimeout(100);
        const panel = await page.locator('.mega-nav-panel').evaluate((element) => {
          const rect = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          return {
            left: rect.left,
            right: rect.right,
            top: rect.top,
            width: rect.width,
            height: rect.height,
            overflowY: style.overflowY,
            position: style.position,
          };
        });
        const maxPanelHeight = Math.min(viewport.height * 0.76, 680) + 4;
        if (panel.position !== 'fixed') fail(scope, `mega menu position is ${panel.position}; expected fixed`);
        if (panel.height > maxPanelHeight) fail(scope, `mega menu height ${panel.height}px exceeds ${maxPanelHeight}px viewport guard`);
        if (panel.left < -2 || panel.right > viewport.width + 2) fail(scope, `mega menu escapes viewport: left=${panel.left}px right=${panel.right}px`);
        if (!['auto', 'scroll'].includes(panel.overflowY)) fail(scope, `mega menu overflow-y is ${panel.overflowY}; expected internal scrolling`);
        await page.locator('.mega-nav-panel').screenshot({
          path: path.join(outputDir, `home-${viewport.name}-mega-nav.png`),
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

await fs.writeFile(path.join(outputDir, 'layout-report.json'), JSON.stringify({ generatedAt: new Date().toISOString(), baseUrl, reports, failures }, null, 2), 'utf8');

if (failures.length) {
  console.error('Rawafid visual regression gate failed:');
  for (const item of failures) console.error(`- ${item}`);
  process.exit(1);
}

console.log(`Rawafid visual regression gate passed: ${reports.length} route/viewport combinations.`);
