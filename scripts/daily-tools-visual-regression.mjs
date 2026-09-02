import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright-core';

const baseUrl = process.env.VISUAL_BASE_URL || 'http://127.0.0.1:3000';
const chromePath = process.env.VISUAL_CHROME_PATH;
const outputDir = process.env.VISUAL_OUTPUT_DIR || 'visual-artifacts';

if (!chromePath) throw new Error('VISUAL_CHROME_PATH is required.');

const viewports = [
  { name: 'mobile', width: 390, height: 844, expectedHubColumns: 1, expectedFieldColumns: 1 },
  { name: 'compact-tablet', width: 768, height: 1024, expectedHubColumns: 2, expectedFieldColumns: 2 },
  { name: 'desktop', width: 1440, height: 1000, expectedHubColumns: 3, expectedFieldColumns: 2 },
];

const failures = [];
const reports = [];
const fail = (scope, message) => failures.push(`${scope}: ${message}`);
const disableMotion = async (page) => page.addStyleTag({
  content: '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}',
});
const waitStable = async (page) => {
  await page.waitForLoadState('networkidle', { timeout: 5_000 }).catch(() => {});
  await disableMotion(page);
};
const columnCount = (value) => value.split(/\s+/).filter(Boolean).length;

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

    const hub = await context.newPage();
    const hubScope = `${viewport.name} /daily-tools/`;
    const hubResponse = await hub.goto(`${baseUrl}/daily-tools/`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    if (!hubResponse || !hubResponse.ok()) {
      fail(hubScope, `navigation returned ${hubResponse?.status() ?? 'no response'}`);
      await hub.close();
      await context.close();
      continue;
    }
    await waitStable(hub);

    const hubMetrics = await hub.evaluate(() => {
      const rect = (selector) => {
        const element = document.querySelector(selector);
        if (!element) return null;
        const box = element.getBoundingClientRect();
        return { left: box.left, right: box.right, top: box.top, bottom: box.bottom, width: box.width, height: box.height };
      };
      const grid = document.querySelector('.daily-tools-grid');
      const cards = [...document.querySelectorAll('.daily-tool-card')];
      const actionHeights = [...document.querySelectorAll('.daily-tool-card-action')].map((element) => element.getBoundingClientRect().height);
      const categoryHeights = [...document.querySelectorAll('.daily-tools-category-list button')].map((element) => element.getBoundingClientRect().height);
      const cardBoxes = cards.map((element) => {
        const box = element.getBoundingClientRect();
        return { left: box.left, right: box.right, width: box.width };
      });
      const links = [...document.querySelectorAll('.daily-tool-card h3 a')].map((element) => element.getAttribute('href')).filter(Boolean);
      const firstStandardHref = links.find((href) => !href.includes('sleep-wind-down-plan')) || links[0] || '';
      const firstTitle = document.querySelector('.daily-tool-card h3')?.textContent?.trim() || '';
      const heroTitle = document.querySelector('.daily-tools-hero h1');
      return {
        scrollWidth: document.documentElement.scrollWidth,
        viewportWidth: innerWidth,
        hub: rect('.daily-tools-hub'),
        hero: rect('.daily-tools-hero'),
        searchPanel: rect('.daily-tools-search-panel'),
        searchInput: rect('#daily-tools-search'),
        categoryList: rect('.daily-tools-category-list'),
        grid: rect('.daily-tools-grid'),
        gridColumns: grid ? getComputedStyle(grid).gridTemplateColumns : '',
        cardCount: cards.length,
        cardBoxes,
        actionHeights,
        categoryHeights,
        firstStandardHref,
        firstTitle,
        heroTitle: heroTitle ? {
          clientWidth: heroTitle.clientWidth,
          scrollWidth: heroTitle.scrollWidth,
          height: heroTitle.getBoundingClientRect().height,
          lineHeight: getComputedStyle(heroTitle).lineHeight,
        } : null,
      };
    });

    reports.push({ viewport: viewport.name, surface: 'hub', metrics: hubMetrics });

    if (hubMetrics.scrollWidth > viewport.width + 2) fail(hubScope, `horizontal overflow ${hubMetrics.scrollWidth}px > ${viewport.width}px`);
    if (!hubMetrics.hub || !hubMetrics.hero || !hubMetrics.searchPanel || !hubMetrics.searchInput || !hubMetrics.grid) fail(hubScope, 'required Daily Tools hub surfaces are missing');
    if (hubMetrics.cardCount !== 12) fail(hubScope, `expected 12 progressively rendered cards, found ${hubMetrics.cardCount}`);
    if (columnCount(hubMetrics.gridColumns) !== viewport.expectedHubColumns) fail(hubScope, `grid has ${columnCount(hubMetrics.gridColumns)} columns; expected ${viewport.expectedHubColumns}`);
    if (hubMetrics.searchInput && hubMetrics.searchInput.height < (viewport.width <= 620 ? 48 : 44)) fail(hubScope, `search input height ${hubMetrics.searchInput.height}px is too small`);
    if (hubMetrics.heroTitle && hubMetrics.heroTitle.scrollWidth > hubMetrics.heroTitle.clientWidth + 2) fail(hubScope, `hero title overflows horizontally (${hubMetrics.heroTitle.scrollWidth}px > ${hubMetrics.heroTitle.clientWidth}px)`);
    if (hubMetrics.cardBoxes.some((box) => box.left < -2 || box.right > viewport.width + 2)) fail(hubScope, 'one or more Daily Tools cards escape the viewport');
    if (hubMetrics.actionHeights.some((height) => height < 44)) fail(hubScope, `card action touch target below 44px: ${Math.min(...hubMetrics.actionHeights)}px`);
    if (viewport.width <= 620 && hubMetrics.categoryHeights.some((height) => height < 40)) fail(hubScope, `category touch target below 40px: ${Math.min(...hubMetrics.categoryHeights)}px`);
    if (!hubMetrics.firstStandardHref) fail(hubScope, 'no visible Daily Tool detail route was discoverable');

    if (hubMetrics.firstTitle) {
      const search = hub.locator('#daily-tools-search');
      await search.fill(hubMetrics.firstTitle);
      await hub.waitForTimeout(100);
      const filteredCards = await hub.locator('.daily-tool-card').count();
      if (filteredCards < 1) fail(hubScope, 'client-side search hid the exact visible tool title');
      await search.fill('');
      await hub.waitForTimeout(100);
    }

    const categories = hub.locator('.daily-tools-category-list button');
    if (await categories.count() > 1) {
      await categories.nth(1).click();
      await hub.waitForTimeout(80);
      if (!(await categories.nth(1).evaluate((element) => element.classList.contains('is-active')))) fail(hubScope, 'category filter did not enter the active state');
      await categories.nth(0).click();
      await hub.waitForTimeout(80);
    }

    const moreButton = hub.locator('.daily-tools-more button');
    if (await moreButton.count()) {
      await moreButton.click();
      await hub.waitForTimeout(100);
      const expandedCards = await hub.locator('.daily-tool-card').count();
      if (expandedCards !== 24) fail(hubScope, `load-more should render 24 cards after one click, found ${expandedCards}`);
    } else {
      fail(hubScope, 'progressive load-more button is missing');
    }

    const postInteractionWidth = await hub.evaluate(() => document.documentElement.scrollWidth);
    if (postInteractionWidth > viewport.width + 2) fail(hubScope, `interactions introduced horizontal overflow ${postInteractionWidth}px > ${viewport.width}px`);

    await hub.screenshot({ path: path.join(outputDir, `daily-tools-hub-${viewport.name}-full.png`), fullPage: true, animations: 'disabled' });

    if (hubMetrics.firstStandardHref) {
      const detail = await context.newPage();
      const detailScope = `${viewport.name} ${hubMetrics.firstStandardHref}`;
      const detailResponse = await detail.goto(`${baseUrl}${hubMetrics.firstStandardHref}`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
      if (!detailResponse || !detailResponse.ok()) {
        fail(detailScope, `navigation returned ${detailResponse?.status() ?? 'no response'}`);
      } else {
        await waitStable(detail);
        const detailMetrics = await detail.evaluate(() => {
          const rect = (selector) => {
            const element = document.querySelector(selector);
            if (!element) return null;
            const box = element.getBoundingClientRect();
            return { left: box.left, right: box.right, top: box.top, bottom: box.bottom, width: box.width, height: box.height };
          };
          const fieldGrid = document.querySelector('.daily-tool-form-grid');
          const heroTitle = document.querySelector('.daily-tool-detail-hero h1');
          return {
            scrollWidth: document.documentElement.scrollWidth,
            workspace: rect('.daily-tool-workspace'),
            modeSwitch: rect('.daily-tool-mode-switch'),
            progress: rect('.daily-tool-progress-card'),
            fieldGrid: rect('.daily-tool-form-grid'),
            fieldColumns: fieldGrid ? getComputedStyle(fieldGrid).gridTemplateColumns : '',
            navButtonHeights: [...document.querySelectorAll('.daily-tool-step-nav button')].map((element) => element.getBoundingClientRect().height),
            actionButtonHeights: [...document.querySelectorAll('.daily-tool-actions button')].map((element) => element.getBoundingClientRect().height),
            fieldControlHeights: [...document.querySelectorAll('.daily-tool-field input:not([type="range"]),.daily-tool-field textarea')].map((element) => element.getBoundingClientRect().height),
            heroTitle: heroTitle ? { clientWidth: heroTitle.clientWidth, scrollWidth: heroTitle.scrollWidth } : null,
          };
        });
        reports.push({ viewport: viewport.name, surface: 'standard-tool', route: hubMetrics.firstStandardHref, metrics: detailMetrics });

        if (detailMetrics.scrollWidth > viewport.width + 2) fail(detailScope, `horizontal overflow ${detailMetrics.scrollWidth}px > ${viewport.width}px`);
        if (!detailMetrics.workspace || !detailMetrics.modeSwitch || !detailMetrics.progress || !detailMetrics.fieldGrid) fail(detailScope, 'standard Daily Tool workspace is incomplete');
        if (detailMetrics.workspace && (detailMetrics.workspace.left < -2 || detailMetrics.workspace.right > viewport.width + 2)) fail(detailScope, `workspace escapes viewport: left=${detailMetrics.workspace.left}px right=${detailMetrics.workspace.right}px`);
        if (columnCount(detailMetrics.fieldColumns) !== viewport.expectedFieldColumns) fail(detailScope, `field grid has ${columnCount(detailMetrics.fieldColumns)} columns; expected ${viewport.expectedFieldColumns}`);
        if (detailMetrics.heroTitle && detailMetrics.heroTitle.scrollWidth > detailMetrics.heroTitle.clientWidth + 2) fail(detailScope, 'detail hero title overflows horizontally');
        if (viewport.width <= 620) {
          if (detailMetrics.navButtonHeights.some((height) => height < 44)) fail(detailScope, `step navigation touch target below 44px: ${Math.min(...detailMetrics.navButtonHeights)}px`);
          if (detailMetrics.actionButtonHeights.some((height) => height < 44)) fail(detailScope, `tool action touch target below 44px: ${Math.min(...detailMetrics.actionButtonHeights)}px`);
          if (detailMetrics.fieldControlHeights.some((height) => height < 44)) fail(detailScope, `field control below 44px: ${Math.min(...detailMetrics.fieldControlHeights)}px`);
        }

        const progress = detail.locator('.daily-tool-progress-card progress');
        const before = Number(await progress.getAttribute('value') || 0);
        await detail.locator('.daily-tool-step-check input').check();
        await detail.waitForTimeout(80);
        const after = Number(await progress.getAttribute('value') || 0);
        if (!(after > before)) fail(detailScope, `checking a guided step did not increase progress (${before} -> ${after})`);

        await detail.getByRole('button', { name: 'كل الخطوات' }).click();
        await detail.waitForTimeout(80);
        const allSteps = await detail.locator('.daily-tool-step-list li').count();
        if (allSteps !== 4) fail(detailScope, `all-steps mode should expose 4 source-derived steps, found ${allSteps}`);

        const writable = detail.locator('.daily-tool-field textarea,.daily-tool-field input:not([type="range"])').first();
        if (await writable.count()) await writable.fill('اختبار محلي');
        await detail.locator('.daily-tool-primary-action').click();
        await detail.waitForTimeout(80);
        const savedStatus = (await detail.locator('.daily-tool-status').textContent()) || '';
        if (!savedStatus.includes('تم الحفظ')) fail(detailScope, `local save did not report success: ${savedStatus || 'empty status'}`);
        const savedKeys = await detail.evaluate(() => Object.keys(localStorage).filter((key) => key.startsWith('rawafid:daily-tool:')));
        if (!savedKeys.length) fail(detailScope, 'local save did not create the expected browser storage record');
        await detail.locator('.daily-tool-danger-action').click();
        await detail.waitForTimeout(80);
        const remainingKeys = await detail.evaluate(() => Object.keys(localStorage).filter((key) => key.startsWith('rawafid:daily-tool:')));
        if (remainingKeys.length) fail(detailScope, `local clear left ${remainingKeys.length} Daily Tool storage record(s)`);

        await detail.screenshot({ path: path.join(outputDir, `daily-tool-standard-${viewport.name}-full.png`), fullPage: true, animations: 'disabled' });
      }
      await detail.close();
    }

    if (viewport.name === 'mobile') {
      const sleep = await context.newPage();
      const sleepScope = 'mobile /daily-tools/sleep-wind-down-plan/';
      const sleepResponse = await sleep.goto(`${baseUrl}/daily-tools/sleep-wind-down-plan/`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
      if (!sleepResponse || !sleepResponse.ok()) {
        fail(sleepScope, `navigation returned ${sleepResponse?.status() ?? 'no response'}`);
      } else {
        await waitStable(sleep);
        const sleepMetrics = await sleep.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          hasTool: Boolean(document.querySelector('.sleep-log-tool')),
          formControls: document.querySelectorAll('.sleep-log-tool input,.sleep-log-tool textarea').length,
        }));
        reports.push({ viewport: viewport.name, surface: 'sleep-tool', metrics: sleepMetrics });
        if (sleepMetrics.scrollWidth > viewport.width + 2) fail(sleepScope, `horizontal overflow ${sleepMetrics.scrollWidth}px > ${viewport.width}px`);
        if (!sleepMetrics.hasTool || sleepMetrics.formControls < 6) fail(sleepScope, `specialized sleep tool is incomplete; controls=${sleepMetrics.formControls}`);

        await sleep.locator('input[name="date"]').fill('2026-08-30');
        await sleep.locator('input[name="bedtime"]').fill('22:00');
        await sleep.locator('input[name="wakeTime"]').fill('06:00');
        await sleep.locator('input[name="quality"]').fill('7');
        await sleep.locator('input[name="energy"]').fill('6');
        await sleep.locator('textarea[name="note"]').fill('اختبار محلي');
        await sleep.locator('input[name="localConsent"]').check();
        await sleep.getByRole('button', { name: 'احسب واعرض الخلاصة' }).click();
        await sleep.waitForTimeout(100);
        const summary = (await sleep.locator('[aria-live="polite"] strong').textContent()) || '';
        if (!summary.includes('ساعة')) fail(sleepScope, `sleep duration calculation did not produce a duration summary: ${summary || 'empty'}`);
        const sleepSaved = await sleep.evaluate(() => localStorage.getItem('rawafid:sleep-log:v2'));
        if (!sleepSaved || !sleepSaved.includes('2026-08-30')) fail(sleepScope, 'sleep entry was not saved locally after explicit consent');
        await sleep.getByRole('button', { name: 'حذف جميع البيانات المحلية' }).click();
        await sleep.waitForTimeout(80);
        const sleepRemaining = await sleep.evaluate(() => localStorage.getItem('rawafid:sleep-log:v2'));
        if (sleepRemaining !== null) fail(sleepScope, 'sleep local clear did not remove the browser storage record');
        await sleep.screenshot({ path: path.join(outputDir, 'daily-tool-sleep-mobile-full.png'), fullPage: true, animations: 'disabled' });
      }
      await sleep.close();
    }

    await hub.close();
    await context.close();
  }
} finally {
  await browser.close();
}

await fs.writeFile(path.join(outputDir, 'daily-tools-visual-report.json'), JSON.stringify({
  generatedAt: new Date().toISOString(),
  baseUrl,
  reports,
  failures,
}, null, 2), 'utf8');

if (failures.length) {
  console.error('Daily Tools visual and interaction regression failed:');
  for (const item of failures) console.error(`- ${item}`);
  process.exit(1);
}

console.log(`Daily Tools visual and interaction regression passed: ${reports.length} surfaces checked across ${viewports.length} responsive viewports.`);
