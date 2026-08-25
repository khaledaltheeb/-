import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright-core';

const baseUrl = (process.env.VISUAL_BASE_URL || process.env.SMOKE_BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
const chromePath = process.env.VISUAL_CHROME_PATH;
const outputDir = process.env.VISUAL_OUTPUT_DIR || 'visual-artifacts';

if (!chromePath) throw new Error('VISUAL_CHROME_PATH is required.');

const failures = [];
const checks = [];
const fail = (scope, message) => failures.push(`${scope}: ${message}`);
const pass = (scope, message) => checks.push(`${scope}: ${message}`);

async function storageSnapshot(page) {
  return page.evaluate(() => ({
    local: Object.fromEntries(Object.keys(localStorage).sort().map((key) => [key, localStorage.getItem(key)])),
    session: Object.fromEntries(Object.keys(sessionStorage).sort().map((key) => [key, sessionStorage.getItem(key)])),
  }));
}

async function assertNoHorizontalOverflow(page, scope) {
  const metrics = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth }));
  if (metrics.scrollWidth > metrics.width + 2) fail(scope, `horizontal overflow ${metrics.scrollWidth}px > ${metrics.width}px`);
  else pass(scope, 'no horizontal overflow');
}

async function goto(page, route, scope) {
  const response = await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  if (!response?.ok()) {
    fail(scope, `navigation returned ${response?.status() ?? 'no response'}`);
    return false;
  }
  await page.waitForLoadState('networkidle', { timeout: 5_000 }).catch(() => {});
  return true;
}

await fs.mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: chromePath,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

try {
  const desktop = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    colorScheme: 'light',
    reducedMotion: 'reduce',
    locale: 'ar-JO',
  });

  const hub = await desktop.newPage();
  if (await goto(hub, '/assessment-lab', 'desktop hub')) {
    const h1Count = await hub.locator('h1').count();
    if (h1Count !== 1) fail('desktop hub', `expected exactly one H1, found ${h1Count}`);
    else pass('desktop hub', 'single H1');

    const search = hub.getByPlaceholder('مثال: النوم، الأسرة، الانتباه', { exact: true });
    if (await search.count() !== 1) fail('desktop hub', 'assessment directory search input missing or duplicated');
    else {
      await search.fill('النوم');
      const sleepLink = hub.locator('a[href="/assessment-lab/sleep-quality"]');
      if (!await sleepLink.isVisible()) fail('desktop hub', 'search did not surface sleep-quality tool');
      else pass('desktop hub', 'search filters the tool directory');
      await search.fill('');
    }

    const uniqueRoutes = await hub.locator('a[href^="/assessment-lab/"]').evaluateAll((anchors) => [...new Set(anchors.map((anchor) => anchor.getAttribute('href')).filter(Boolean))]);
    if (uniqueRoutes.length < 40) fail('desktop hub', `expected at least 40 discoverable assessment routes, found ${uniqueRoutes.length}`);
    else pass('desktop hub', `${uniqueRoutes.length} assessment routes discoverable`);

    await assertNoHorizontalOverflow(hub, 'desktop hub');
    await hub.screenshot({ path: path.join(outputDir, 'assessment-lab-hub-desktop.png'), fullPage: true, animations: 'disabled' });
  }
  await hub.close();

  const tool = await desktop.newPage();
  const mutatingRequests = [];
  if (await goto(tool, '/assessment-lab/mood-daily', 'desktop tool')) {
    tool.on('request', (request) => {
      if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method())) mutatingRequests.push(`${request.method()} ${request.url()}`);
    });

    const originalUrl = tool.url();
    const storageBefore = await storageSnapshot(tool);

    const startButton = tool.getByRole('button', { name: 'أفهم الحدود وأبدأ' });
    if (!await startButton.isVisible()) fail('desktop tool', 'start boundary button is missing');
    else {
      await startButton.click();
      for (let index = 0; index < 12; index += 1) {
        const radio = tool.locator('fieldset input[type="radio"]').first();
        if (!await radio.isVisible()) {
          fail('desktop tool', `question ${index + 1}: response options missing`);
          break;
        }
        await radio.check();
        const buttonName = index === 11 ? 'عرض ملخصي' : 'التالي';
        const next = tool.getByRole('button', { name: buttonName, exact: true });
        if (!await next.isEnabled()) {
          fail('desktop tool', `question ${index + 1}: ${buttonName} stayed disabled after answering`);
          break;
        }
        await next.click();
      }

      const resultHeading = tool.getByRole('heading', { name: 'ما الذي ظهر في إجاباتك؟' });
      if (!await resultHeading.isVisible()) fail('desktop tool', 'result view did not appear after 12 answers');
      else {
        pass('desktop tool', 'completed all 12 questions and reached result');
        const runner = tool.locator('section[aria-labelledby="assessment-runner-title"]');
        const resultCards = runner.locator('article');
        const cardCount = await resultCards.count();
        if (cardCount !== 4) fail('desktop tool', `expected four result domain cards, found ${cardCount}`);
        else pass('desktop tool', 'four result domain cards rendered');
        const resultCardText = (await resultCards.allInnerTexts()).join('\n');
        if (/\d+\s*%/.test(resultCardText)) fail('desktop tool', 'developmental result cards contain a percentage');
        else pass('desktop tool', 'result cards contain no percentage scoring');
        for (const forbidden of ['خفيف', 'متوسط', 'شديد', 'بارز', 'مرتفع']) {
          const labelPattern = new RegExp(`(^|[\\s:：،؛()])${forbidden}($|[\\s.،؛:：()])`, 'm');
          if (labelPattern.test(resultCardText)) fail('desktop tool', `developmental result cards contain unsupported severity label: ${forbidden}`);
        }
        const noteCount = await runner.locator('textarea').count();
        if (noteCount !== 4) fail('desktop tool', `expected four domain note fields, found ${noteCount}`);
        else pass('desktop tool', 'four domain result cards expose optional notes');
        await tool.screenshot({ path: path.join(outputDir, 'assessment-lab-result-desktop.png'), fullPage: true, animations: 'disabled' });
      }
    }

    const storageAfter = await storageSnapshot(tool);
    if (JSON.stringify(storageBefore) !== JSON.stringify(storageAfter)) fail('desktop tool', 'localStorage/sessionStorage changed during assessment interaction');
    else pass('desktop tool', 'no browser storage mutation during assessment');
    if (tool.url() !== originalUrl) fail('desktop tool', `assessment changed URL from ${originalUrl} to ${tool.url()}`);
    else pass('desktop tool', 'answers are not encoded in the URL');
    if (mutatingRequests.length) fail('desktop tool', `interaction emitted mutating network requests: ${mutatingRequests.join(', ')}`);
    else pass('desktop tool', 'no POST/PUT/PATCH/DELETE requests during interaction');
    await assertNoHorizontalOverflow(tool, 'desktop tool');
  }
  await tool.close();

  const sourceGuide = await desktop.newPage();
  if (await goto(sourceGuide, '/assessment-lab/phq-9-plus', 'source guide')) {
    if (await sourceGuide.locator('input[type="radio"]').count() !== 0) fail('source guide', 'external instrument guide unexpectedly exposes response items');
    else pass('source guide', 'no copied interactive items');
    const officialLink = sourceGuide.locator('a[href="https://www.nih.gov/node/19946"]');
    if (!await officialLink.isVisible()) fail('source guide', 'official NIH source link missing');
    else pass('source guide', 'official NIH source link visible');
    if (!await sourceGuide.getByText('النسخة العربية الرسمية موجودة', { exact: false }).first().isVisible()) fail('source guide', 'reviewed Arabic-source status is not visible');
    else pass('source guide', 'Arabic-source review status visible');
    await sourceGuide.screenshot({ path: path.join(outputDir, 'assessment-lab-phq9-guide-desktop.png'), fullPage: true, animations: 'disabled' });
  }
  await sourceGuide.close();
  await desktop.close();

  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    colorScheme: 'light',
    reducedMotion: 'reduce',
    locale: 'ar-JO',
  });
  for (const route of ['/assessment-lab', '/assessment-lab/mood-daily']) {
    const page = await mobile.newPage();
    const scope = `mobile ${route}`;
    if (await goto(page, route, scope)) {
      await assertNoHorizontalOverflow(page, scope);
      const targetCount = await page.locator('button, input, a').count();
      if (!targetCount) fail(scope, 'interactive/focusable targets missing');
      else pass(scope, `${targetCount} focusable/interactive targets rendered`);
      const name = route === '/assessment-lab' ? 'hub' : 'tool';
      await page.screenshot({ path: path.join(outputDir, `assessment-lab-${name}-mobile.png`), fullPage: true, animations: 'disabled' });
    }
    await page.close();
  }
  await mobile.close();
} finally {
  await browser.close();
}

await fs.writeFile(
  path.join(outputDir, 'assessment-lab-e2e-report.json'),
  JSON.stringify({ generatedAt: new Date().toISOString(), baseUrl, checks, failures }, null, 2),
  'utf8',
);

if (failures.length) {
  console.error('Assessment lab interactive regression failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Assessment lab interactive regression passed: ${checks.length} checks.`);
